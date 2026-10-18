import { describe, expect, it } from "vitest";
import type { CatalogVariant } from "@/types/catalog";
import { formatPrice, formatPriceRange, getPriceBounds } from "./format-price";

function makeVariant(amount: number, currencyCode = "CAD"): CatalogVariant {
  return {
    id: `variant-${amount}-${currencyCode}`,
    title: "Test Variant",
    availableForSale: true,
    stockLevel: 10,
    price: { amount, currencyCode },
    compareAtPrice: null,
    selectedOptions: [],
    image: null,
  };
}

describe("formatPrice", () => {
  it("formats a CAD MoneyValue as an en-CA currency string", () => {
    expect(formatPrice({ amount: 120, currencyCode: "CAD" })).toBe("$120.00");
  });

  it("keeps cents", () => {
    expect(formatPrice({ amount: 120.5, currencyCode: "CAD" })).toBe("$120.50");
  });

  it("falls back to CAD when the currency code is malformed", () => {
    expect(formatPrice({ amount: 10, currencyCode: "not-a-code" })).toBe("$10.00");
  });

  it("accepts a lowercase three-letter code instead of throwing in Intl", () => {
    // Exact symbol prefix varies by ICU; the amount must still format.
    expect(formatPrice({ amount: 10, currencyCode: "usd" })).toMatch(/10\.00/);
  });
});

describe("getPriceBounds", () => {
  it("returns null when there is nothing to price", () => {
    expect(getPriceBounds([])).toBeNull();
  });

  it("returns min and max across Variants, each keeping its own MoneyValue", () => {
    const bounds = getPriceBounds([makeVariant(140), makeVariant(120), makeVariant(130)]);

    expect(bounds?.min.amount).toBe(120);
    expect(bounds?.max.amount).toBe(140);
    expect(bounds?.min.currencyCode).toBe("CAD");
  });

  it("reports a single Variant as both min and max", () => {
    const bounds = getPriceBounds([makeVariant(99)]);

    expect(bounds?.min.amount).toBe(99);
    expect(bounds?.max.amount).toBe(99);
  });
});

describe("formatPriceRange", () => {
  it("renders a uniform price as a single amount", () => {
    expect(formatPriceRange([makeVariant(120), makeVariant(120)])).toBe("$120.00");
  });

  it("renders differing prices as an en-dash range", () => {
    expect(formatPriceRange([makeVariant(140), makeVariant(120)])).toBe("$120.00 – $140.00");
  });

  it("returns null when nothing is priced", () => {
    expect(formatPriceRange([])).toBeNull();
  });
});
