import { describe, expect, it } from "vitest";
import type { CatalogVariant } from "@/types/catalog";
import {
  deriveInitialSelection,
  deriveOptionGroups,
  findVariantByOptions,
  selectOptionValue,
} from "./variant-picker";

function makeVariant(
  id: string,
  options: Record<string, string>,
  overrides: Partial<CatalogVariant> = {},
): CatalogVariant {
  return {
    id,
    title: id,
    availableForSale: true,
    stockLevel: 5,
    price: { amount: 120, currencyCode: "CAD" },
    compareAtPrice: null,
    selectedOptions: Object.entries(options).map(([name, value]) => ({ name, value })),
    image: null,
    ...overrides,
  };
}

// A two-axis matrix: Color × Size, with one cell sold out.
const oliveLarge = makeVariant("olive-large", { Color: "Olive", Size: "Large" });
const tanSmall = makeVariant("tan-small", { Color: "Tan", Size: "Small" });
const oliveSmall = makeVariant("olive-small", { Color: "Olive", Size: "Small" });
const matrix = [oliveLarge, tanSmall, oliveSmall];

describe("findVariantByOptions", () => {
  it("matches a Variant only when EVERY SelectedOption matches", () => {
    const found = findVariantByOptions(matrix, { Color: "Olive", Size: "Small" });

    expect(found?.id).toBe("olive-small");
  });

  it("returns null on a partial match", () => {
    expect(findVariantByOptions(matrix, { Color: "Olive" })).toBeNull();
  });

  it("returns null when no Variant matches", () => {
    expect(findVariantByOptions(matrix, { Color: "Crimson", Size: "Large" })).toBeNull();
  });
});

describe("deriveOptionGroups", () => {
  it("derives one group per axis with distinct values in first-seen order", () => {
    const groups = deriveOptionGroups(matrix);

    expect(groups).toEqual([
      { name: "Color", values: ["Olive", "Tan"] },
      { name: "Size", values: ["Large", "Small"] },
    ]);
  });

  it("returns no groups when there are no Variants", () => {
    expect(deriveOptionGroups([])).toEqual([]);
  });
});

describe("deriveInitialSelection", () => {
  it("defaults to the first Variant still for sale", () => {
    const soldOutFirst = [
      makeVariant("a", { Color: "Olive" }, { availableForSale: false }),
      makeVariant("b", { Color: "Tan" }),
    ];

    expect(deriveInitialSelection(soldOutFirst)).toEqual({ Color: "Tan" });
  });

  it("falls back to the first Variant when all are sold out", () => {
    const allSoldOut = [
      makeVariant("a", { Color: "Olive" }, { availableForSale: false }),
      makeVariant("b", { Color: "Tan" }, { availableForSale: false }),
    ];

    expect(deriveInitialSelection(allSoldOut)).toEqual({ Color: "Olive" });
  });

  it("returns an empty selection when there are no Variants", () => {
    expect(deriveInitialSelection([])).toEqual({});
  });
});

describe("selectOptionValue", () => {
  it("keeps the other axes when the exact combination exists", () => {
    const next = selectOptionValue(matrix, { Color: "Olive", Size: "Large" }, "Size", "Small");

    expect(next).toEqual({ Color: "Olive", Size: "Small" });
  });

  it("snaps to a full Variant carrying the value when the combination does not exist", () => {
    // Olive/Large → Tan: no Tan/Large exists, so it snaps to Tan/Small.
    const next = selectOptionValue(matrix, { Color: "Olive", Size: "Large" }, "Color", "Tan");

    expect(next).toEqual({ Color: "Tan", Size: "Small" });
  });

  it("prefers an available Variant when snapping past a sold-out one", () => {
    const soldOutFirst = [
      makeVariant("tan-small", { Color: "Tan", Size: "Small" }, { availableForSale: false }),
      makeVariant("tan-large", { Color: "Tan", Size: "Large" }),
      makeVariant("olive-large", { Color: "Olive", Size: "Large" }),
    ];

    const next = selectOptionValue(soldOutFirst, { Color: "Olive", Size: "Large" }, "Color", "Tan");

    expect(next).toEqual({ Color: "Tan", Size: "Large" });
  });

  it("returns the raw selection when no Variant carries the value", () => {
    const next = selectOptionValue(matrix, { Color: "Olive", Size: "Large" }, "Color", "Crimson");

    expect(next).toEqual({ Color: "Crimson", Size: "Large" });
  });
});
