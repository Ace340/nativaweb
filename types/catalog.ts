/**
 * Catalog domain types (Direct Channel)
 *
 * These types speak OUR domain language (see GLOSSARY.md): Product, Variant,
 * Stock Level. They are Shopify-free by design — no gids, no Storefront API
 * field names. The one deliberate rename: Shopify's `quantityAvailable`
 * maps to `stockLevel` (GLOSSARY: Stock Level).
 *
 * Mapping from Shopify GraphQL nodes happens in lib/shopify/products.ts.
 */

/**
 * A monetary amount with its currency (Direct Channel launches in CAD).
 */
export interface MoneyValue {
  readonly amount: number;
  readonly currencyCode: string;
}

/**
 * A product photograph. `alt` is required in our domain — mappers default
 * missing Shopify alt text to "".
 */
export interface CatalogImage {
  readonly url: string;
  readonly alt: string;
}

/**
 * One axis of a Variant's identity, e.g. Color=Olive or Size=Large.
 */
export interface SelectedOption {
  readonly name: string;
  readonly value: string;
}

/**
 * The buyable form of a Product: a specific color/size combination with its
 * own price and Stock Level. Customers never buy a Product directly; they
 * buy one of its Variants. (GLOSSARY: Variant)
 */
export interface CatalogVariant {
  readonly id: string;
  readonly title: string;
  readonly availableForSale: boolean;
  /**
   * Stock Level: tracked quantity remaining for sale. Null when the variant's
   * inventory is not tracked (GLOSSARY: Stock Level).
   */
  readonly stockLevel: number | null;
  readonly price: MoneyValue;
  readonly compareAtPrice: MoneyValue | null;
  readonly selectedOptions: readonly SelectedOption[];
  readonly image: CatalogImage | null;
}

/**
 * A sellable handbag design in the Catalog, e.g. "Ambar". (GLOSSARY: Product)
 * `descriptionHtml` is only fetched for detail views — null in list results.
 */
export interface CatalogProduct {
  readonly id: string;
  readonly title: string;
  readonly handle: string;
  readonly descriptionHtml: string | null;
  readonly availableForSale: boolean;
  readonly images: readonly CatalogImage[];
  readonly variants: readonly CatalogVariant[];
}
