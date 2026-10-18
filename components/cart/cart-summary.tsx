/**
 * Cart footer: subtotal, item count, and the Checkout anchor.
 *
 * Server component. Props are deliberately narrow — subtotal, count, and
 * the PUBLIC checkoutUrl — so the secret-bearing Cart ID is structurally
 * unable to leak into the client seam. Checkout is Shopify-hosted
 * (GLOSSARY: Checkout is where a Cart becomes an Order), hence the
 * external anchor with rel="noopener noreferrer" instead of a Next link.
 */

import { Button } from "@/components/ui/button";
import { formatPrice } from "@/components/shop/format-price";
import type { MoneyValue } from "@/types/catalog";

type CartSummaryProps = {
  totalAmount: MoneyValue | null;
  totalQuantity: number;
  checkoutUrl: string;
};

export function CartSummary({ totalAmount, totalQuantity, checkoutUrl }: CartSummaryProps) {
  return (
    <div className="space-y-5 rounded-3xl border border-[var(--card-border)] bg-[var(--card-bg-light)] p-6 shadow-2xl shadow-black/40">
      <div className="space-y-2">
        <div className="flex items-baseline justify-between gap-4">
          <span className="text-sm font-semibold uppercase tracking-[0.3em] text-[var(--text-muted)]">
            Subtotal
          </span>
          <span className="text-2xl font-semibold text-[var(--color-gold)]">
            {totalAmount ? formatPrice(totalAmount) : "—"}
          </span>
        </div>
        <p className="text-sm text-[var(--text-muted)]">
          {totalQuantity} {totalQuantity === 1 ? "item" : "items"} · taxes and shipping
          calculated at Checkout
        </p>
      </div>

      <Button asChild size="lg" className="w-full">
        <a href={checkoutUrl} rel="noopener noreferrer">
          Proceed to Checkout
        </a>
      </Button>

      <p className="text-center text-xs text-[var(--text-muted)]">
        Secure Checkout hosted by Shopify
      </p>
    </div>
  );
}
