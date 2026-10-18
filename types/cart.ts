/**
 * Cart domain types (Direct Channel)
 *
 * A Cart is a customer's in-progress selection of Variants awaiting payment
 * (GLOSSARY: Cart). Checkout — where a Cart becomes an Order — is hosted by
 * Shopify and reached via `checkoutUrl`; an Order is post-Checkout and is
 * deliberately NOT modeled here.
 *
 * Security invariant: `Cart.id` is the full opaque Shopify Cart ID, which
 * embeds a secret. It lives only in the httpOnly cart cookie and in
 * server-side code (lib/shopify/cart.ts + Server Actions). It must NEVER be
 * serialized into client-component props. `CartLine.id` (the line ID) is
 * safe to cross: it is useless for mutations without the secret-bearing
 * Cart ID. `checkoutUrl` is public by design.
 *
 * Mapping from Shopify GraphQL nodes happens in lib/shopify/cart.ts.
 */

import type { CatalogImage, MoneyValue, SelectedOption } from "./catalog";

/**
 * The Variant a Cart Line holds, with just enough product context to
 * render and link back to the detail page (GLOSSARY: customers buy a
 * Variant, never a Product).
 */
export interface CartLineVariant {
  readonly variantId: string;
  readonly variantTitle: string;
  readonly productTitle: string;
  /** URL slug of the Product for /shop/[handle] links. */
  readonly productHandle: string;
  readonly image: CatalogImage | null;
  readonly selectedOptions: readonly SelectedOption[];
  /**
   * Stock Level of the Variant (GLOSSARY: Stock Level). Null when the
   * Variant's inventory is not tracked.
   */
  readonly stockLevel: number | null;
}

/**
 * One selected Variant with its quantity in the Cart.
 */
export interface CartLine {
  /** Shopify Cart Line ID — safe for forms/props (see file header). */
  readonly id: string;
  readonly quantity: number;
  readonly variant: CartLineVariant;
  /** Effective price per unit; null only if Shopify omitted all cost data. */
  readonly unitPrice: MoneyValue | null;
  readonly lineTotal: MoneyValue | null;
}

/**
 * A customer's in-progress selection of Variants awaiting payment.
 */
export interface Cart {
  /**
   * Full opaque Shopify Cart ID — CONTAINS A SECRET. Server-side only;
   * never serialize into client props (see file header).
   */
  readonly id: string;
  /** Public URL of the Shopify-hosted Checkout for this Cart. */
  readonly checkoutUrl: string;
  readonly totalQuantity: number;
  /** Cart subtotal across all lines (cost.totalAmount in Shopify terms). */
  readonly totalAmount: MoneyValue | null;
  readonly lines: readonly CartLine[];
}
