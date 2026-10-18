import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { VariantPicker } from "@/components/shop/variant-picker";
import { ShopHeader } from "@/components/shop/shop-header";
import { formatPriceRange } from "@/components/shop/format-price";
import { getProductByHandle } from "@/lib/shopify/products";
import { addToCartAction } from "@/app/actions/cart";
import type { CatalogProduct } from "@/types/catalog";

const META_DESCRIPTION_MAX_CHARS = 160;
const FALLBACK_META_DESCRIPTION =
  "A handwoven Colombian bag crafted from natural fique fiber by Naitive artisans.";

/** Shopify-sanitized descriptionHtml → plain text for meta description. */
function toPlainText(html: string): string {
  return html
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/\s+/g, " ")
    .trim();
}

function deriveMetaDescription(product: CatalogProduct): string {
  const text = toPlainText(product.descriptionHtml ?? "");
  if (text.length === 0) {
    return FALLBACK_META_DESCRIPTION;
  }
  return text.length <= META_DESCRIPTION_MAX_CHARS
    ? text
    : `${text.slice(0, META_DESCRIPTION_MAX_CHARS - 1).trimEnd()}…`;
}

type ProductDetailPageProps = {
  params: Promise<{ handle: string }>;
};

export async function generateMetadata({
  params,
}: ProductDetailPageProps): Promise<Metadata> {
  const { handle } = await params;
  const product = await getProductByHandle(handle);

  if (!product) {
    return { title: "Product not found — Naitive Handcrafted" };
  }

  return {
    title: `${product.title} — Naitive Handcrafted`,
    description: deriveMetaDescription(product),
  };
}

function ProductGallery({ product }: { product: CatalogProduct }) {
  const [primary, ...rest] = product.images;

  if (!primary) {
    return (
      <div className="flex aspect-[4/5] items-center justify-center rounded-3xl border border-[var(--card-border)] bg-[var(--card-bg-light)] text-sm text-[var(--text-muted)]">
        Photo coming soon
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="relative aspect-[4/5] overflow-hidden rounded-3xl border border-[var(--card-border)] shadow-2xl shadow-black/40">
        <Image
          src={primary.url}
          alt={primary.alt || product.title}
          fill
          priority
          sizes="(max-width: 1024px) 100vw, 50vw"
          className="object-cover"
        />
      </div>
      {rest.length > 0 ? (
        <ul className="grid grid-cols-4 gap-3">
          {rest.map((image) => (
            <li
              key={image.url}
              className="relative aspect-square overflow-hidden rounded-2xl border border-[var(--card-border)]"
            >
              <Image
                src={image.url}
                alt={image.alt || product.title}
                fill
                sizes="(max-width: 1024px) 25vw, 12vw"
                className="object-cover"
              />
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

export default async function ProductDetailPage({ params }: ProductDetailPageProps) {
  const { handle } = await params;
  const product = await getProductByHandle(handle);

  if (!product) {
    notFound();
  }

  const priceRange = formatPriceRange(product.variants);

  return (
    <div className="relative min-h-screen overflow-hidden bg-[var(--page-bg)] text-[var(--text-primary)]">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(216,187,124,0.28),transparent_45%)]" />

      <ShopHeader active="shop" />

      <main className="relative z-10 mx-auto w-full max-w-6xl px-6 py-12 pb-24 lg:px-8">
        <Link
          href="/shop"
          className="text-sm text-[var(--text-muted)] transition-colors hover:text-[var(--color-gold)]"
        >
          ← All products
        </Link>

        <div className="mt-8 grid gap-12 lg:grid-cols-2 lg:gap-16">
          <ProductGallery product={product} />

          <div className="space-y-8">
            <div className="space-y-3">
              <p className="text-xs font-semibold uppercase tracking-[0.4em] text-[var(--color-gold)]">
                Handcrafted in Colombia
              </p>
              <h1 className="text-3xl font-semibold leading-tight text-[var(--text-primary)] md:text-4xl">
                {product.title}
              </h1>
              {priceRange ? (
                <p className="text-xl font-medium text-[var(--color-gold)]">{priceRange}</p>
              ) : null}
              {!product.availableForSale ? (
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--text-muted)]">
                  Sold out
                </p>
              ) : null}
            </div>

            <VariantPicker variants={product.variants} action={addToCartAction} />

            {/* Shopify-sanitized merchant content (ADR-0001: Shopify is the source) */}
            {product.descriptionHtml ? (
              <div
                className="text-base leading-relaxed text-[var(--text-muted)] [&_a]:text-[var(--color-gold)] [&_a]:underline [&_h2]:mb-3 [&_h2]:text-lg [&_h2]:font-semibold [&_h2]:text-[var(--text-primary)] [&_h3]:mb-3 [&_h3]:text-lg [&_h3]:font-semibold [&_h3]:text-[var(--text-primary)] [&_li]:mb-2 [&_ol]:list-decimal [&_ol]:pl-6 [&_p]:mb-4 [&_strong]:text-[var(--text-primary)] [&_ul]:list-disc [&_ul]:pl-6"
                dangerouslySetInnerHTML={{ __html: product.descriptionHtml }}
              />
            ) : null}
          </div>
        </div>
      </main>
    </div>
  );
}
