/**
 * Catalog reads over the Shopify Storefront API
 *
 * Server-side data access (RSC-safe): returns Shopify-free domain types from
 * types/catalog.ts via pure mapper functions. Requests are deduplicated per
 * render with React.cache, and catalog reads revalidate through the Next.js
 * data cache (list: 15 min, detail: 60 s — stock/price freshness matters).
 *
 * Unconfigured state (env vars missing) NEVER throws at import or render
 * time: the catalog is empty and detail lookups return null, so /shop can
 * render its "coming soon" state (ADR-0001 / catalog feature bundle).
 */

import { cache } from "react";
import { createLogger } from "@/lib/logger";
import type {
  CatalogImage,
  CatalogProduct,
  CatalogVariant,
  MoneyValue,
} from "@/types/catalog";
import { isShopifyConfigured, shopifyFetch } from "./client";
import { PRODUCTS_LIST_QUERY, PRODUCT_BY_HANDLE_QUERY } from "./queries";

const logger = createLogger("shopify-products");

const CATALOG_PAGE_SIZE = 50;
const CATALOG_REVALIDATE_SECONDS = 900;
const PRODUCT_REVALIDATE_SECONDS = 60;

// ── Shopify node shapes (exactly what our queries select) ──────────────────

export type ShopifyMoney = { amount: number; currencyCode: string };
/**
 * Shopify `Image` node shape (Storefront API 2026-10: alt text is
 * `altText` — introspected against the live schema 2026-11-07; the plain
 * `alt` field does not exist on the Image type).
 */
export type ShopifyImage = { url: string; altText?: string | null };
export type ShopifySelectedOption = { name: string; value: string };

export type ShopifyVariantNode = {
  id: string;
  title: string;
  availableForSale: boolean;
  quantityAvailable?: number | null;
  price?: ShopifyMoney | null;
  compareAtPrice?: ShopifyMoney | null;
  selectedOptions?: readonly ShopifySelectedOption[] | null;
  image?: ShopifyImage | null;
};

export type ShopifyProductNode = {
  id: string;
  title: string;
  handle: string;
  availableForSale: boolean;
  descriptionHtml?: string | null;
  media?: { edges?: ReadonlyArray<{ node?: { image?: ShopifyImage | null } | null } | null> } | null;
  variants?: { edges?: ReadonlyArray<{ node?: ShopifyVariantNode | null } | null> } | null;
};

type ProductsListData = {
  products?: { edges?: ReadonlyArray<{ node?: ShopifyProductNode | null } | null> } | null;
};

type ProductByHandleData = {
  product?: ShopifyProductNode | null;
};

// ── Pure mappers: GraphQL node → domain type ────────────────────────────────

export function mapMoneyValue(money: ShopifyMoney | null | undefined): MoneyValue | null {
  if (!money) {
    return null;
  }
  return { amount: money.amount, currencyCode: money.currencyCode };
}

export function mapCatalogImage(image: ShopifyImage | null | undefined): CatalogImage | null {
  if (!image?.url) {
    return null;
  }
  return { url: image.url, alt: image.altText ?? "" };
}

/**
 * A Variant without a price violates our domain (GLOSSARY: a Variant has its
 * own price), so a broken node maps to null and is skipped by the caller —
 * never a made-up price.
 */
export function mapCatalogVariant(node: ShopifyVariantNode): CatalogVariant | null {
  const price = mapMoneyValue(node.price);
  if (!price) {
    return null;
  }

  return {
    id: node.id,
    title: node.title,
    availableForSale: node.availableForSale,
    stockLevel: node.quantityAvailable ?? null,
    price,
    compareAtPrice: mapMoneyValue(node.compareAtPrice),
    selectedOptions: (node.selectedOptions ?? []).map((option) => ({
      name: option.name,
      value: option.value,
    })),
    image: mapCatalogImage(node.image),
  };
}

export function mapCatalogProduct(node: ShopifyProductNode): CatalogProduct {
  return {
    id: node.id,
    title: node.title,
    handle: node.handle,
    availableForSale: node.availableForSale,
    descriptionHtml: node.descriptionHtml ?? null,
    images: extractProductImages(node.media),
    variants: extractVariants(node.variants),
  };
}

// ── Extraction helpers (pure) ────────────────────────────────────────────────

/**
 * Flatten GraphQL connection edges into a plain node array. Shared by the
 * catalog and cart mappers — every Shopify list field arrives as edges.
 */
export function collectEdgeNodes<TNode>(
  edges: ReadonlyArray<{ node?: TNode | null } | null> | null | undefined,
): NonNullable<TNode>[] {
  return (edges ?? [])
    .flatMap((edge) => (edge?.node == null ? [] : [edge.node]));
}

/** Media edges whose node is not a MediaImage carry no image — they drop out. */
function extractProductImages(media: ShopifyProductNode["media"]): CatalogImage[] {
  return (media?.edges ?? [])
    .map((edge) => mapCatalogImage(edge?.node?.image))
    .filter((image): image is CatalogImage => image !== null);
}

function extractVariants(variants: ShopifyProductNode["variants"]): CatalogVariant[] {
  return collectEdgeNodes(variants?.edges)
    .map(mapCatalogVariant)
    .filter((variant): variant is CatalogVariant => variant !== null);
}

// ── Public catalog reads (React.cache-deduplicated per request) ─────────────

/**
 * The full Catalog for the Direct Channel. Empty while Shopify is
 * unconfigured; a failed fetch degrades to an empty catalog (logged).
 */
export const getCatalog = cache(async (): Promise<CatalogProduct[]> => {
  if (!isShopifyConfigured()) {
    return [];
  }

  const result = await shopifyFetch<ProductsListData>(PRODUCTS_LIST_QUERY, {
    variables: { first: CATALOG_PAGE_SIZE },
    revalidate: CATALOG_REVALIDATE_SECONDS,
  });

  if (!result.success) {
    logger.error("Failed to load catalog", result.error);
    return [];
  }

  return collectEdgeNodes(result.data.products?.edges).map(mapCatalogProduct);
});

/**
 * One Product by handle (URL slug). Null while Shopify is unconfigured, when
 * the handle matches nothing, or when the fetch fails (logged).
 */
export const getProductByHandle = cache(
  async (handle: string): Promise<CatalogProduct | null> => {
    if (!isShopifyConfigured()) {
      return null;
    }

    const result = await shopifyFetch<ProductByHandleData>(PRODUCT_BY_HANDLE_QUERY, {
      variables: { handle },
      revalidate: PRODUCT_REVALIDATE_SECONDS,
    });

    if (!result.success) {
      logger.error(`Failed to load product by handle "${handle}"`, result.error);
      return null;
    }

    const node = result.data.product;
    return node ? mapCatalogProduct(node) : null;
  },
);
