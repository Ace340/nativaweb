import { describe, expect, it } from "vitest";
import {
  collectEdgeNodes,
  mapCatalogImage,
  mapCatalogVariant,
  mapMoneyValue,
} from "./products";

describe("mapMoneyValue", () => {
  it("passes amount and currencyCode through", () => {
    expect(mapMoneyValue({ amount: 120.5, currencyCode: "CAD" })).toEqual({
      amount: 120.5,
      currencyCode: "CAD",
    });
  });

  it("returns null for null and undefined", () => {
    expect(mapMoneyValue(null)).toBeNull();
    expect(mapMoneyValue(undefined)).toBeNull();
  });
});

describe("mapCatalogImage", () => {
  it("keeps the url and a provided alt", () => {
    expect(mapCatalogImage({ url: "https://cdn.example/x.jpg", alt: "A bag" })).toEqual({
      url: "https://cdn.example/x.jpg",
      alt: "A bag",
    });
  });

  it("defaults missing alt to an empty string (domain requires alt)", () => {
    expect(mapCatalogImage({ url: "https://cdn.example/x.jpg" })).toEqual({
      url: "https://cdn.example/x.jpg",
      alt: "",
    });
  });

  it("returns null without a url, and for null/undefined", () => {
    expect(mapCatalogImage({ url: "" })).toBeNull();
    expect(mapCatalogImage(null)).toBeNull();
  });
});

describe("mapCatalogVariant", () => {
  it("maps a full node, renaming quantityAvailable to stockLevel", () => {
    const variant = mapCatalogVariant({
      id: "gid://variant/1",
      title: "Olive / Large",
      availableForSale: true,
      quantityAvailable: 3,
      price: { amount: 120, currencyCode: "CAD" },
      compareAtPrice: { amount: 140, currencyCode: "CAD" },
      selectedOptions: [{ name: "Color", value: "Olive" }],
      image: { url: "https://cdn.example/x.jpg", alt: "Olive" },
    });

    expect(variant).toEqual({
      id: "gid://variant/1",
      title: "Olive / Large",
      availableForSale: true,
      stockLevel: 3,
      price: { amount: 120, currencyCode: "CAD" },
      compareAtPrice: { amount: 140, currencyCode: "CAD" },
      selectedOptions: [{ name: "Color", value: "Olive" }],
      image: { url: "https://cdn.example/x.jpg", alt: "Olive" },
    });
  });

  it("returns null for a Variant without a price — never a made-up price", () => {
    const variant = mapCatalogVariant({
      id: "gid://variant/2",
      title: "Broken",
      availableForSale: true,
      price: null,
    });

    expect(variant).toBeNull();
  });

  it("maps untracked inventory (missing quantityAvailable) to a null stockLevel", () => {
    const variant = mapCatalogVariant({
      id: "gid://variant/3",
      title: "Untracked",
      availableForSale: true,
      price: { amount: 120, currencyCode: "CAD" },
    });

    expect(variant?.stockLevel).toBeNull();
    expect(variant?.compareAtPrice).toBeNull();
    expect(variant?.selectedOptions).toEqual([]);
  });
});

describe("collectEdgeNodes", () => {
  it("flattens connection edges into a plain node array", () => {
    const edges = [{ node: 1 }, { node: 2 }];

    expect(collectEdgeNodes(edges)).toEqual([1, 2]);
  });

  it("drops null edges and null nodes", () => {
    const edges = [null, { node: null }, { node: 1 }];

    expect(collectEdgeNodes(edges)).toEqual([1]);
  });

  it("returns an empty array for null and undefined edges", () => {
    expect(collectEdgeNodes(null)).toEqual([]);
    expect(collectEdgeNodes(undefined)).toEqual([]);
  });
});
