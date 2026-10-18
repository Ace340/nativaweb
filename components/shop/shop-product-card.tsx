/**
 * Catalog card (Direct Channel): links a Product to its detail page.
 * Server component; renders only Shopify-derived data (ADR-0001).
 */

import Image from "next/image";
import Link from "next/link";
import type { CatalogProduct } from "@/types/catalog";
import { formatPriceRange } from "./format-price";

/** At or below this Stock Level a Product gets its "Only N left" hint. */
const LOW_STOCK_THRESHOLD = 5;

type ShopProductCardProps = {
  product: CatalogProduct;
  /** Grid position; the first card's image is preloaded. */
  index: number;
};

/**
 * Lowest Stock Level among Variants still for sale; null when no available
 * Variant tracks inventory. Pure derivation from the Variants array.
 */
function findLowStockLevel(product: CatalogProduct): number | null {
  const levels = product.variants
    .filter((variant) => variant.availableForSale)
    .map((variant) => variant.stockLevel)
    .filter((level): level is number => level !== null);

  return levels.length > 0 ? Math.min(...levels) : null;
}

export function ShopProductCard({ product, index }: ShopProductCardProps) {
  const [coverImage] = product.images;
  const priceRange = formatPriceRange(product.variants);
  const lowStockLevel = findLowStockLevel(product);
  const isLowStock =
    lowStockLevel !== null && lowStockLevel > 0 && lowStockLevel <= LOW_STOCK_THRESHOLD;

  return (
    <Link
      href={`/shop/${product.handle}`}
      className="group flex w-full flex-col gap-5 rounded-3xl border border-[var(--card-border)] bg-[var(--card-bg-light)] p-5 shadow-2xl shadow-black/40 transition hover:border-[var(--color-gold)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-300"
    >
      <div className="relative aspect-[4/5] w-full overflow-hidden rounded-2xl border border-[rgba(189,188,178,0.12)]">
        {coverImage ? (
          <Image
            src={coverImage.url}
            alt={coverImage.alt || product.title}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover transition duration-500 group-hover:scale-105"
            priority={index === 0}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-[rgba(44,60,20,0.6)] text-sm text-[var(--text-muted)]">
            Photo coming soon
          </div>
        )}
        {!product.availableForSale ? (
          <span className="absolute left-4 top-4 rounded-full border border-[rgba(189,188,178,0.35)] bg-[rgba(44,60,20,0.9)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--text-primary)]">
            Sold out
          </span>
        ) : null}
      </div>

      <div className="flex flex-1 flex-col gap-2">
        <h3 className="text-lg font-semibold text-[var(--text-primary)]">{product.title}</h3>
        <div className="mt-auto flex items-baseline justify-between gap-3">
          {priceRange ? (
            <span className="text-base font-medium text-[var(--color-gold)]">{priceRange}</span>
          ) : null}
          {isLowStock ? (
            <span className="text-xs uppercase tracking-[0.15em] text-[var(--text-muted)]">
              Only {lowStockLevel} left
            </span>
          ) : null}
        </div>
      </div>
    </Link>
  );
}
