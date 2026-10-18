"use server";

/**
 * Cart Server Actions
 *
 * The ONLY layer allowed to write or delete the cart cookie (Next 16:
 * cookies are writable solely in Server Actions / Route Handlers). All
 * cart mutations run here — the client never calls Shopify directly, and
 * the secret-bearing Cart ID never reaches client JS.
 *
 * Contract: every action returns Promise<void> and NEVER throws — a thrown
 * error kills the submitting form silently. Failures are logged and the
 * action simply returns; revalidatePath + the automatic post-action render
 * keep the UI truthful.
 *
 * Stale-cart recovery: a mutation can fail because the cookie points at a
 * cart Shopify no longer has (expired/purged) or because the request
 * failed. We only take recovery steps once a fresh getCart() confirms the
 * cart is REALLY gone, so a transient failure never destroys a live cart:
 * - addToCartAction: recreate the cart with the incoming line and
 *   overwrite the cookie (the add is never silently lost);
 * - update/remove: delete the cookie so /cart falls back to the empty
 *   state instead of looping on an unusable cart ID.
 */

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { createLogger } from "@/lib/logger";
import {
  CART_COOKIE_NAME,
  addLine,
  createCartWithLine,
  getCart,
  readCartId,
  removeLine,
  updateLineQuantity,
} from "@/lib/shopify/cart";
import { MAX_LINE_QUANTITY } from "@/types/cart";

const logger = createLogger("cart-actions");

/** 30 days — matches the task's cookie lifetime choice. */
const CART_COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 30;

// ── Payload parsing (boundary validation) ────────────────────────────────────

/** Non-empty string field, or null. FormData values may be File — guard with typeof. */
function readStringField(formData: FormData, field: string): string | null {
  const value = formData.get(field);
  return typeof value === "string" && value.length > 0 ? value : null;
}

function parseQuantityField(formData: FormData): number | null {
  const value = formData.get("quantity");
  if (typeof value !== "string") {
    return null;
  }
  const parsed = Number.parseInt(value, 10);
  return Number.isNaN(parsed) ? null : parsed;
}

// ── Cookie helpers (action-only writes) ──────────────────────────────────────

async function persistCartId(cartId: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(CART_COOKIE_NAME, cartId, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: CART_COOKIE_MAX_AGE_SECONDS,
  });
}

async function clearCartId(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(CART_COOKIE_NAME);
}

/** True when Shopify still knows the cookie's cart. False for stale/unconfigured. */
async function isCartReachable(): Promise<boolean> {
  return (await getCart()) !== null;
}

/**
 * Shared recovery for update/remove failures: clear the cookie ONLY once a
 * fresh read confirms the cart is gone (see file header).
 */
async function recoverFromUnreachableCart(actionName: string): Promise<void> {
  if (await isCartReachable()) {
    logger.error(`${actionName}: mutation failed on a live cart — leaving cookie untouched`);
    return;
  }
  logger.warn(`${actionName}: cart no longer exists — clearing stale cart cookie`);
  await clearCartId();
}

// ── Revalidation ─────────────────────────────────────────────────────────────

function revalidateAfterCartChange(): void {
  revalidatePath("/cart");
  // Judgment call: adding to a Cart does not decrement Stock Level, but the
  // moment of purchase intent is a cheap, opportune time to refresh the
  // detail page's cached product data (60 s window) so "Only X left" hints
  // stay honest. Type param is required for dynamic-segment patterns.
  revalidatePath("/shop/[handle]", "page");
}

// ── Actions ──────────────────────────────────────────────────────────────────

/**
 * Add a Variant to the visitor's Cart. Creates the Cart (and sets the
 * httpOnly cookie) when none exists; recreates it when the cookie is stale.
 * Signature matches AddToCartAction in components/shop/add-to-cart-form.tsx.
 */
export async function addToCartAction(formData: FormData): Promise<void> {
  try {
    const variantId = readStringField(formData, "variantId");
    if (!variantId) {
      logger.warn("addToCartAction called without a variantId — ignoring");
      return;
    }
    // The detail-page form sends no quantity field; one is the sensible unit.
    const quantity = Math.min(Math.max(parseQuantityField(formData) ?? 1, 1), MAX_LINE_QUANTITY);

    const existingCartId = await readCartId();

    if (existingCartId) {
      const updatedCart = await addLine(existingCartId, variantId, quantity);
      if (updatedCart) {
        revalidateAfterCartChange();
        return;
      }
      if (await isCartReachable()) {
        // Transient failure on a live cart (already logged in lib) — keep the cart.
        logger.warn("addToCartAction: addLine failed on a live cart");
        revalidateAfterCartChange();
        return;
      }
      logger.warn("addToCartAction: stale cart ID — recreating cart with the new line");
    }

    const newCart = await createCartWithLine(variantId, quantity);
    if (!newCart) {
      logger.error("addToCartAction: could not create a cart", { variantId });
      revalidateAfterCartChange();
      return;
    }
    await persistCartId(newCart.id);
    revalidateAfterCartChange();
  } catch (error) {
    logger.error("addToCartAction failed unexpectedly", error);
  }
}

/** Set a Cart Line's quantity (formData: lineId, quantity). */
export async function updateLineAction(formData: FormData): Promise<void> {
  try {
    const lineId = readStringField(formData, "lineId");
    const quantity = parseQuantityField(formData);
    if (!lineId || quantity === null || quantity < 1 || quantity > MAX_LINE_QUANTITY) {
      logger.warn("updateLineAction called with an invalid payload", {
        hasLineId: lineId !== null,
        quantity,
      });
      return;
    }

    const cartId = await readCartId();
    if (!cartId) {
      logger.warn("updateLineAction called without a cart cookie — nothing to update");
      revalidatePath("/cart");
      return;
    }

    const updatedCart = await updateLineQuantity(cartId, lineId, quantity);
    if (!updatedCart) {
      await recoverFromUnreachableCart("updateLineAction");
    }
    revalidatePath("/cart");
  } catch (error) {
    logger.error("updateLineAction failed unexpectedly", error);
  }
}

/** Remove a Cart Line (formData: lineId). */
export async function removeLineAction(formData: FormData): Promise<void> {
  try {
    const lineId = readStringField(formData, "lineId");
    if (!lineId) {
      logger.warn("removeLineAction called without a lineId — ignoring");
      return;
    }

    const cartId = await readCartId();
    if (!cartId) {
      logger.warn("removeLineAction called without a cart cookie — nothing to remove");
      revalidatePath("/cart");
      return;
    }

    const updatedCart = await removeLine(cartId, lineId);
    if (!updatedCart) {
      await recoverFromUnreachableCart("removeLineAction");
    }
    revalidatePath("/cart");
  } catch (error) {
    logger.error("removeLineAction failed unexpectedly", error);
  }
}
