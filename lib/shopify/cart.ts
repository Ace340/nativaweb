/**
 * Cart reads and mutations over the Shopify Storefront API
 *
 * Server-side data access for the Cart (RSC-safe, no "use server"): the
 * /cart page reads via getCart(); Server Actions (app/actions/cart.ts)
 * perform every mutation. All requests are UNCACHED — Cart state must be
 * fresh on every read, unlike catalog reads (see products.ts).
 *
 * SECURITY: the Shopify Cart ID embeds a secret. It is stored whole in the
 * httpOnly `ntv_cart` cookie and never leaves the server. This module
 * never writes cookies — cookies may only be written in Server Actions /
 * Route Handlers, so cookie set/delete is exclusively the action layer's
 * job (getCart cannot recover from a stale cookie itself; it returns null
 * and lets the actions recover).
 *
 * Unconfigured state (env vars missing) is valid: every function degrades
 * to a null Cart, mirroring products.ts.
 */

import { cookies } from "next/headers";
import { createLogger } from "@/lib/logger";
import type { Cart, CartLine, CartLineVariant } from "@/types/cart";
import { isShopifyConfigured, shopifyFetch } from "./client";
import {
  collectEdgeNodes,
  mapCatalogImage,
  mapMoneyValue,
  type ShopifyImage,
  type ShopifyMoney,
  type ShopifySelectedOption,
} from "./products";
import {
  CART_CREATE_MUTATION,
  CART_GET_QUERY,
  CART_LINES_ADD_MUTATION,
  CART_LINES_REMOVE_MUTATION,
  CART_LINES_UPDATE_MUTATION,
} from "./queries";

const logger = createLogger("shopify-cart");

/**
 * httpOnly cookie holding the FULL opaque Cart ID (secret included).
 * Never read from client JS — httpOnly guarantees that.
 */
export const CART_COOKIE_NAME = "ntv_cart";

// ── Shopify node shapes (exactly what our queries select) ──────────────────

export type ShopifyCartMerchandiseNode = {
  id: string;
  title: string;
  price?: ShopifyMoney | null;
  quantityAvailable?: number | null;
  selectedOptions?: readonly ShopifySelectedOption[] | null;
  image?: ShopifyImage | null;
  product: { title: string; handle: string };
};

export type ShopifyCartLineNode = {
  id: string;
  quantity: number;
  cost?: {
    totalAmount?: ShopifyMoney | null;
    amountPerQuantity?: ShopifyMoney | null;
  } | null;
  /**
   * Null when the merchandise is not a plain ProductVariant (e.g. a
   * componentizable bundle) — such lines cannot be rendered as a Variant.
   */
  merchandise?: ShopifyCartMerchandiseNode | null;
};

export type ShopifyCartNode = {
  id: string;
  checkoutUrl: string;
  totalQuantity: number;
  cost?: { totalAmount?: ShopifyMoney | null } | null;
  lines?: { edges?: ReadonlyArray<{ node?: ShopifyCartLineNode | null } | null> } | null;
};

export type ShopifyCartUserError = {
  field?: readonly string[] | null;
  message: string;
};

type CartMutationPayload = {
  cart?: ShopifyCartNode | null;
  userErrors?: readonly ShopifyCartUserError[] | null;
};

type CartGetData = { cart?: ShopifyCartNode | null };

// ── Pure mappers: GraphQL node → domain type (same style as products.ts) ────

/**
 * A line whose merchandise is not a ProductVariant (or lacks a product)
 * maps to null and is dropped by mapCart — cart.totalAmount/totalQuantity
 * still come from Shopify, so the summary never lies about dropped lines.
 */
export function mapCartLine(node: ShopifyCartLineNode): CartLine | null {
  const merchandise = node.merchandise;
  if (!merchandise) {
    return null;
  }

  const variant: CartLineVariant = {
    variantId: merchandise.id,
    variantTitle: merchandise.title,
    productTitle: merchandise.product?.title ?? merchandise.title,
    productHandle: merchandise.product?.handle ?? "",
    image: mapCatalogImage(merchandise.image),
    selectedOptions: (merchandise.selectedOptions ?? []).map((option) => ({
      name: option.name,
      value: option.value,
    })),
    stockLevel: merchandise.quantityAvailable ?? null,
  };

  return {
    id: node.id,
    quantity: node.quantity,
    variant,
    // Effective per-unit cost first (reflects discounts), list price as fallback.
    unitPrice: mapMoneyValue(node.cost?.amountPerQuantity) ?? mapMoneyValue(merchandise.price),
    lineTotal: mapMoneyValue(node.cost?.totalAmount),
  };
}

export function mapCart(node: ShopifyCartNode): Cart {
  return {
    id: node.id,
    checkoutUrl: node.checkoutUrl,
    totalQuantity: node.totalQuantity,
    totalAmount: mapMoneyValue(node.cost?.totalAmount),
    lines: collectEdgeNodes(node.lines?.edges)
      .map(mapCartLine)
      .filter((line): line is CartLine => line !== null),
  };
}

// ── Internal helpers ─────────────────────────────────────────────────────────

function logUserErrors(mutation: string, userErrors: readonly ShopifyCartUserError[] | null | undefined): void {
  if (userErrors && userErrors.length > 0) {
    logger.warn(`${mutation} reported userErrors`, { userErrors: [...userErrors] });
  }
}

/**
 * Shared mutation pipeline: run the document, log userErrors (verified
 * fact: userErrors must be checked on every cart mutation), map the
 * refreshed Cart. Returns null on any failure — callers degrade, never throw.
 */
async function runCartMutation(
  mutation: string,
  query: string,
  variables: Record<string, unknown>,
): Promise<Cart | null> {
  if (!isShopifyConfigured()) {
    return null;
  }

  const result = await shopifyFetch<Record<string, CartMutationPayload | undefined>>(query, {
    variables,
  });

  if (!result.success) {
    logger.error(`Failed to ${mutation}`, result.error);
    return null;
  }

  const payload = result.data[mutation];
  if (!payload) {
    logger.error(`${mutation} returned no payload`);
    return null;
  }

  logUserErrors(mutation, payload.userErrors);
  return payload.cart ? mapCart(payload.cart) : null;
}

// ── Cookie read (write is action-layer only — see file header) ───────────────

/**
 * Read the full opaque Cart ID from the httpOnly cookie, or null when the
 * visitor has no Cart yet.
 */
export async function readCartId(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get(CART_COOKIE_NAME)?.value ?? null;
}

// ── Public Cart reads (always uncached) ──────────────────────────────────────

/**
 * The visitor's Cart, or null when: no cart cookie, Shopify unconfigured,
 * the fetch fails, or the cookie points at a cart Shopify no longer has
 * (stale). A stale cookie CANNOT be cleared here (RSC may not write
 * cookies) — the action layer recovers on the next mutation.
 */
export async function getCart(): Promise<Cart | null> {
  const cartId = await readCartId();
  if (!cartId || !isShopifyConfigured()) {
    return null;
  }

  const result = await shopifyFetch<CartGetData>(CART_GET_QUERY, {
    variables: { id: cartId },
  });

  if (!result.success) {
    logger.error("Failed to fetch cart (possibly a stale cart ID)", result.error);
    return null;
  }

  return result.data.cart ? mapCart(result.data.cart) : null;
}

// ── Public Cart mutations ────────────────────────────────────────────────────

/**
 * Create a fresh Cart holding one line. The CALLER (action layer) persists
 * the returned Cart's id in the httpOnly cookie.
 */
export async function createCartWithLine(variantId: string, quantity: number): Promise<Cart | null> {
  return runCartMutation("cartCreate", CART_CREATE_MUTATION, {
    lines: [{ merchandiseId: variantId, quantity }],
  });
}

/** Add a Variant to an existing Cart; returns the refreshed Cart. */
export async function addLine(cartId: string, variantId: string, quantity: number): Promise<Cart | null> {
  return runCartMutation("cartLinesAdd", CART_LINES_ADD_MUTATION, {
    cartId,
    lines: [{ merchandiseId: variantId, quantity }],
  });
}

/** Set a line's quantity (min 1 — removal goes through removeLine). */
export async function updateLineQuantity(
  cartId: string,
  lineId: string,
  quantity: number,
): Promise<Cart | null> {
  return runCartMutation("cartLinesUpdate", CART_LINES_UPDATE_MUTATION, {
    cartId,
    lines: [{ id: lineId, quantity }],
  });
}

/** Remove a line from the Cart; returns the refreshed Cart. */
export async function removeLine(cartId: string, lineId: string): Promise<Cart | null> {
  return runCartMutation("cartLinesRemove", CART_LINES_REMOVE_MUTATION, {
    cartId,
    lineIds: [lineId],
  });
}
