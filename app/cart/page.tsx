import type { Metadata } from "next";
import Link from "next/link";
import { CartLineRow } from "@/components/cart/cart-line-row";
import { CartSummary } from "@/components/cart/cart-summary";
import { ShopHeader } from "@/components/shop/shop-header";
import { Button } from "@/components/ui/button";
import { getCart } from "@/lib/shopify/cart";

export const metadata: Metadata = {
  title: "Cart — Naitive Handcrafted",
  description: "Your in-progress selection of handwoven Naitive bags.",
  // A per-customer page has no search value.
  robots: { index: false },
};

/**
 * Empty state for a missing/empty Cart — also what renders while Shopify is
 * unconfigured (getCart returns null) and after a stale cookie has been
 * cleared. Never an error, never a blank page (ADR-0001 graceful degradation).
 */
function EmptyCart() {
  return (
    <div className="mx-auto max-w-xl rounded-3xl border border-[var(--card-border)] bg-[var(--card-bg-light)] p-10 text-center shadow-2xl shadow-black/40">
      <p className="text-xs font-semibold uppercase tracking-[0.4em] text-[var(--color-gold)]">
        Your cart
      </p>
      <h2 className="mt-3 text-2xl font-semibold text-[var(--text-primary)]">
        Nothing here yet
      </h2>
      <p className="mt-4 text-base leading-relaxed text-[var(--text-muted)]">
        Every bag is handwoven from natural fique fiber by Colombian artisans.
        Find the one that is yours.
      </p>
      <div className="mt-8">
        <Button asChild variant="secondary">
          <Link href="/shop">Browse the catalog</Link>
        </Button>
      </div>
    </div>
  );
}

/**
 * Cart page (RSC). getCart() reads the cart cookie, so cookies() makes
 * this route dynamic — correct for per-customer state. All money display
 * goes through the format-price helpers.
 */
export default async function CartPage() {
  const cart = await getCart();
  const hasLines = cart !== null && cart.lines.length > 0;

  return (
    <div className="relative min-h-screen overflow-hidden bg-[var(--page-bg)] text-[var(--text-primary)]">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(216,187,124,0.28),transparent_45%)]" />

      <ShopHeader active="cart" />

      <main className="relative z-10 mx-auto w-full max-w-6xl px-6 py-12 pb-24 lg:px-8">
        <Link
          href="/shop"
          className="text-sm text-[var(--text-muted)] transition-colors hover:text-[var(--color-gold)]"
        >
          ← Continue shopping
        </Link>

        <div className="mt-8 space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.4em] text-[var(--color-gold)]">
            Your selection
          </p>
          <h1 className="text-3xl font-semibold leading-tight text-[var(--text-primary)] md:text-4xl">
            Cart
          </h1>
        </div>

        <div className="mt-10">
          {hasLines && cart ? (
            <div className="grid gap-10 lg:grid-cols-[1fr_360px] lg:items-start">
              <ul className="space-y-4">
                {cart.lines.map((line) => (
                  <CartLineRow key={line.id} line={line} />
                ))}
              </ul>
              <CartSummary
                totalAmount={cart.totalAmount}
                totalQuantity={cart.totalQuantity}
                checkoutUrl={cart.checkoutUrl}
              />
            </div>
          ) : (
            <EmptyCart />
          )}
        </div>
      </main>
    </div>
  );
}
