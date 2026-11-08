import type { Metadata } from "next";
import Link from "next/link";
import { getCatalog } from "@/lib/shopify/products";
import { CatalogGrid } from "@/components/shop/catalog-grid";
import { ShopHeader } from "@/components/shop/shop-header";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Shop — Naitive Handcrafted",
  description:
    "Handwoven Colombian bags crafted from natural fique fiber — browse the Naitive catalog.",
};

/**
 * Coming-soon state for an empty Catalog (Shopify unconfigured or fetch
 * failed). Deliberately never an error and never a blank page — the
 * Direct Channel simply is not open yet (ADR-0001 graceful degradation).
 */
function ShopComingSoon() {
  return (
    <div className="mx-auto max-w-xl rounded-3xl border border-[var(--card-border)] bg-[var(--card-bg-light)] p-10 text-center shadow-2xl shadow-black/40">
      <p className="text-xs font-semibold uppercase tracking-[0.4em] text-[var(--color-gold)]">
        Coming soon
      </p>
      <h2 className="mt-3 text-2xl font-semibold text-[var(--text-primary)]">
        The catalog is almost ready
      </h2>
      <p className="mt-4 text-base leading-relaxed text-[var(--text-muted)]">
        We are preparing the Naitive shop. Meanwhile, get to know the handwoven
        collection and the artisans behind it on our landing page.
      </p>
      <div className="mt-8">
        <Button asChild variant="secondary">
          <Link href="/">Explore the landing page</Link>
        </Button>
      </div>
    </div>
  );
}

export default async function ShopPage() {
  const products = await getCatalog();

  return (
    <div className="relative min-h-screen overflow-hidden bg-[var(--page-bg)] text-[var(--text-primary)]">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(216,187,124,0.28),transparent_45%)]" />

      <ShopHeader active="shop" />

      <main className="relative z-10 mx-auto w-full max-w-6xl px-6 py-16 pb-24 lg:px-8">
        {/* SectionHeading-style typography, with an h1 for the route */}
        <div className="mx-auto w-full max-w-5xl space-y-2 text-center lg:text-left">
          <p className="text-xs font-semibold uppercase tracking-[0.4em] text-[var(--color-gold)]">
            The catalog
          </p>
          <h1 className="text-3xl font-semibold leading-tight text-[var(--text-primary)] md:text-4xl">
            Handwoven bags, crafted by Colombian artisans
          </h1>
          <p className="text-base text-[var(--text-muted)] md:text-lg">
            Every piece is handwoven from natural fique fiber with plant-based
            dyes — each pattern one of a kind, shipped from Canada.
          </p>
        </div>

        <div className="mt-12">
          {products.length > 0 ? (
            <CatalogGrid products={products} />
          ) : (
            <ShopComingSoon />
          )}
        </div>
      </main>
    </div>
  );
}
