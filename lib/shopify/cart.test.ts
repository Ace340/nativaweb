import { describe, expect, it, vi } from "vitest";
import {
  mapCart,
  mapCartLine,
  type ShopifyCartLineNode,
  type ShopifyCartMerchandiseNode,
} from "./cart";

// The mappers under test are pure, but their module imports next/headers
// (cookie access for the non-pure read path). Stubbing keeps this file
// hermetic — no Next.js runtime needed.
vi.mock("next/headers", () => ({ cookies: vi.fn() }));

function makeMerchandise(
  overrides: Partial<ShopifyCartMerchandiseNode> = {},
): ShopifyCartMerchandiseNode {
  return {
    id: "gid://variant/1",
    title: "Olive / Large",
    price: { amount: 120, currencyCode: "CAD" },
    quantityAvailable: 4,
    selectedOptions: [{ name: "Color", value: "Olive" }],
    image: { url: "https://cdn.example/x.jpg", altText: "Olive" },
    product: { title: "Ambar", handle: "ambar" },
    ...overrides,
  };
}

function makeLineNode(overrides: Partial<ShopifyCartLineNode> = {}): ShopifyCartLineNode {
  return {
    id: "gid://cartline/1",
    quantity: 2,
    cost: {
      totalAmount: { amount: 240, currencyCode: "CAD" },
      amountPerQuantity: { amount: 120, currencyCode: "CAD" },
    },
    merchandise: makeMerchandise(),
    ...overrides,
  };
}

describe("mapCartLine", () => {
  it("returns null when the merchandise is not a plain ProductVariant", () => {
    expect(mapCartLine(makeLineNode({ merchandise: null }))).toBeNull();
  });

  it("maps the Variant with product context for /shop links", () => {
    const line = mapCartLine(makeLineNode());

    expect(line?.variant).toEqual({
      variantId: "gid://variant/1",
      variantTitle: "Olive / Large",
      productTitle: "Ambar",
      productHandle: "ambar",
      image: { url: "https://cdn.example/x.jpg", alt: "Olive" },
      selectedOptions: [{ name: "Color", value: "Olive" }],
      stockLevel: 4,
    });
  });

  it("falls back to the Variant title when product context is missing", () => {
    // Shopify can omit `product` at runtime even though the node type
    // declares it — the mapper defends, so the fixture mirrors runtime.
    const raw = {
      ...makeLineNode(),
      merchandise: { ...makeMerchandise(), product: undefined },
    } as unknown as ShopifyCartLineNode;

    const line = mapCartLine(raw);

    expect(line?.variant.productTitle).toBe("Olive / Large");
    expect(line?.variant.productHandle).toBe("");
  });

  it("prefers the effective per-unit cost over the Variant list price", () => {
    const line = mapCartLine(
      makeLineNode({
        merchandise: makeMerchandise({ price: { amount: 140, currencyCode: "CAD" } }),
        cost: {
          amountPerQuantity: { amount: 99, currencyCode: "CAD" },
          totalAmount: { amount: 198, currencyCode: "CAD" },
        },
      }),
    );

    expect(line?.unitPrice).toEqual({ amount: 99, currencyCode: "CAD" });
  });

  it("falls back to the Variant list price when per-unit cost is missing", () => {
    const line = mapCartLine(
      makeLineNode({
        merchandise: makeMerchandise({ price: { amount: 140, currencyCode: "CAD" } }),
        cost: null,
      }),
    );

    expect(line?.unitPrice).toEqual({ amount: 140, currencyCode: "CAD" });
    expect(line?.lineTotal).toBeNull();
  });

  it("maps untracked inventory to a null stockLevel", () => {
    const line = mapCartLine(
      makeLineNode({ merchandise: makeMerchandise({ quantityAvailable: undefined }) }),
    );

    expect(line?.variant.stockLevel).toBeNull();
  });
});

describe("mapCart", () => {
  it("drops non-Variant lines while keeping Shopify's own totals honest", () => {
    const cart = mapCart({
      id: "gid://cart/1",
      checkoutUrl: "https://checkout.example/1",
      totalQuantity: 5,
      cost: { totalAmount: { amount: 360, currencyCode: "CAD" } },
      lines: {
        edges: [
          { node: makeLineNode() },
          { node: makeLineNode({ id: "gid://cartline/2", merchandise: null }) },
        ],
      },
    });

    expect(cart.lines).toHaveLength(1);
    expect(cart.lines[0]?.id).toBe("gid://cartline/1");
    expect(cart.totalQuantity).toBe(5);
    expect(cart.totalAmount).toEqual({ amount: 360, currencyCode: "CAD" });
  });

  it("maps the cart ID and checkout URL untouched", () => {
    const cart = mapCart({
      id: "gid://cart/1",
      checkoutUrl: "https://checkout.example/1",
      totalQuantity: 0,
      cost: null,
      lines: null,
    });

    expect(cart.id).toBe("gid://cart/1");
    expect(cart.checkoutUrl).toBe("https://checkout.example/1");
    expect(cart.lines).toEqual([]);
    expect(cart.totalAmount).toBeNull();
  });
});
