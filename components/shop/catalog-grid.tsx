/**
 * Responsive Catalog grid: 1 column on phones, 2 on tablets, 3 on desktop.
 * Server component; presentational only.
 */

import type { CatalogProduct } from "@/types/catalog";
import { ShopProductCard } from "./shop-product-card";

type CatalogGridProps = {
  products: readonly CatalogProduct[];
};

export function CatalogGrid({ products }: CatalogGridProps) {
  return (
    <ul className="grid list-none gap-8 sm:grid-cols-2 lg:grid-cols-3">
      {products.map((product, index) => (
        <li key={product.id} className="flex">
          <ShopProductCard product={product} index={index} />
        </li>
      ))}
    </ul>
  );
}
