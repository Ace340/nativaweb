/**
 * Pure money formatting for the Direct Channel (GLOSSARY: launches in CAD).
 *
 * ALL price rendering in the shop UI goes through these helpers — never a
 * raw number glued to a "$", so currency handling lives in one place
 * (ADR-0001: prices come from Shopify, formatting stays ours).
 */

import type { CatalogVariant, MoneyValue } from "@/types/catalog";

/** Direct Channel launch currency, used when a MoneyValue lacks a usable code. */
const DEFAULT_CURRENCY_CODE = "CAD";

/** ISO 4217 style: exactly three letters. Anything else would throw in Intl. */
const CURRENCY_CODE_PATTERN = /^[A-Za-z]{3}$/;

function resolveCurrencyCode(currencyCode: string | undefined): string {
  return typeof currencyCode === "string" && CURRENCY_CODE_PATTERN.test(currencyCode)
    ? currencyCode.toUpperCase()
    : DEFAULT_CURRENCY_CODE;
}

/**
 * Format a single MoneyValue, e.g. { amount: 120, currencyCode: "CAD" }
 * → "$120.00". Invalid/missing currency codes fall back to CAD rather
 * than throwing (Intl.NumberFormat rejects bad codes with a RangeError).
 */
export function formatPrice(money: MoneyValue): string {
  return new Intl.NumberFormat("en-CA", {
    style: "currency",
    currency: resolveCurrencyCode(money.currencyCode),
  }).format(money.amount);
}

/**
 * Min and max prices across a Product's Variants. Null when there is
 * nothing to price. Bounds keep their own MoneyValue (amount + currency).
 */
export function getPriceBounds(
  variants: readonly CatalogVariant[],
): { readonly min: MoneyValue; readonly max: MoneyValue } | null {
  if (variants.length === 0) {
    return null;
  }

  return variants.reduce<{ min: MoneyValue; max: MoneyValue }>(
    (bounds, variant) => ({
      min: variant.price.amount < bounds.min.amount ? variant.price : bounds.min,
      max: variant.price.amount > bounds.max.amount ? variant.price : bounds.max,
    }),
    { min: variants[0].price, max: variants[0].price },
  );
}

/**
 * Human price range across Variants: "$120.00" when uniform,
 * "$120.00 – $140.00" when they differ, null when nothing is priced.
 * Each bound is formatted with its own currency so a hypothetical mixed-
 * currency product never displays a wrong code.
 */
export function formatPriceRange(variants: readonly CatalogVariant[]): string | null {
  const bounds = getPriceBounds(variants);
  if (!bounds) {
    return null;
  }

  const low = formatPrice(bounds.min);
  const high = formatPrice(bounds.max);
  return low === high ? low : `${low} – ${high}`;
}
