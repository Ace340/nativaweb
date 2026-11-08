/**
 * Pure Stock Level derivations for the Direct Channel UI (GLOSSARY:
 * Stock Level = units on hand for a Variant; null when untracked).
 *
 * Single source of the "Only N left" hint, shared by the catalog card
 * and the variant picker — the stock counterpart of format-price.ts.
 */

/** At or below this Stock Level a Variant reads as running low. */
const LOW_STOCK_THRESHOLD = 5;

/**
 * The "Only N left" hint, or null when the Stock Level does not read as
 * low: null (untracked), 0 (sold out), and anything above the threshold
 * all return null — callers decide what to show instead.
 */
export function formatLowStockHint(stockLevel: number | null): string | null {
  if (stockLevel === null || stockLevel <= 0 || stockLevel > LOW_STOCK_THRESHOLD) {
    return null;
  }
  return `Only ${stockLevel} left`;
}
