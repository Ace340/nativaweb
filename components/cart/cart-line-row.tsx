"use client";

/**
 * One Cart Line row: Variant image, product link, selected-options
 * summary, unit price, quantity stepper, remove button, line total.
 *
 * Client component because the pending states come from useFormStatus,
 * which only works inside the submitting <form>. The forms use Server
 * Actions imported from app/actions/cart.ts — no client-side cart logic,
 * and the props carry ONLY line data (line IDs are safe; the secret-bearing
 * Cart ID never crosses this seam).
 *
 * Progressive enhancement: plain <form> + submit buttons, so quantity
 * changes and removals work before JS hydrates.
 */

import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { useFormStatus } from "react-dom";
import { removeLineAction, updateLineAction } from "@/app/actions/cart";
import { formatPrice } from "@/components/shop/format-price";
import type { SelectedOption } from "@/types/catalog";
import { MAX_LINE_QUANTITY, type CartLine } from "@/types/cart";

/** Shopify's placeholder option on single-variant Products ("Title" / "Default Title"). */
const DEFAULT_OPTION_VALUE = "Default Title";

/**
 * Pure: summarize a Variant's selected options as "Olive · Large".
 * Shopify's Default Title sentinel is hidden — a single-variant Product
 * has no meaningful options to summarize. Null when nothing to show.
 */
export function formatOptionSummary(options: readonly SelectedOption[]): string | null {
  const values = options
    .filter((option) => !(option.name === "Title" && option.value === DEFAULT_OPTION_VALUE))
    .map((option) => option.value);
  return values.length > 0 ? values.join(" · ") : null;
}

/** Money through format-price or an em dash when Shopify omitted cost data. */
function formatMoneyOrDash(amount: CartLine["lineTotal"]): string {
  return amount ? formatPrice(amount) : "—";
}

/**
 * Submit button that disables itself while ITS form is pending
 * (useFormStatus child pattern — status is only visible inside the form).
 * All visual classes come from the caller: cn() does NOT merge Tailwind
 * classes, so a base style + overrides would conflict unpredictably.
 */
function LineSubmitButton({
  name,
  value,
  disabled = false,
  ariaLabel,
  className,
  children,
}: {
  name?: string;
  value?: string;
  disabled?: boolean;
  ariaLabel: string;
  className: string;
  children: ReactNode;
}) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      name={name}
      value={value}
      aria-label={ariaLabel}
      aria-disabled={pending || disabled}
      disabled={pending || disabled}
      className={className}
    >
      {children}
    </button>
  );
}

const STEPPER_BUTTON_CLASSES =
  "flex h-8 w-8 items-center justify-center rounded-full border border-[rgba(189,188,178,0.35)] text-lg font-medium leading-none text-[var(--text-primary)] transition hover:border-[var(--color-gold)] hover:text-[var(--color-gold)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-300 disabled:cursor-not-allowed disabled:opacity-50";

const REMOVE_BUTTON_CLASSES =
  "rounded-full border border-transparent px-2 py-1 text-xs font-medium uppercase tracking-[0.2em] text-[var(--text-muted)] transition hover:border-transparent hover:text-[var(--color-gold)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-300 disabled:cursor-not-allowed disabled:opacity-50";

export function CartLineRow({ line }: { line: CartLine }) {
  const { variant } = line;
  const optionSummary = formatOptionSummary(variant.selectedOptions);
  /** Stepper ceiling: Stock Level when tracked, never above the sanity cap. */
  const maxQuantity = Math.min(variant.stockLevel ?? MAX_LINE_QUANTITY, MAX_LINE_QUANTITY);
  const isAtMaxQuantity = line.quantity >= maxQuantity;
  const imageAlt = variant.image?.alt || variant.productTitle;

  return (
    <li className="flex gap-5 rounded-3xl border border-[var(--card-border)] bg-[var(--card-bg-light)] p-5 shadow-xl shadow-black/20">
      {variant.image ? (
        <Image
          src={variant.image.url}
          alt={imageAlt}
          width={96}
          height={96}
          className="h-24 w-24 shrink-0 rounded-2xl border border-[var(--card-border)] object-cover"
        />
      ) : (
        <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-2xl border border-[var(--card-border)] text-[10px] uppercase tracking-[0.2em] text-[var(--text-muted)]">
          No photo
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col gap-3">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 space-y-1">
            <Link
              href={`/shop/${variant.productHandle}`}
              className="block truncate text-base font-semibold text-[var(--text-primary)] transition-colors hover:text-[var(--color-gold)]"
            >
              {variant.productTitle}
            </Link>
            {optionSummary ? (
              <p className="text-sm text-[var(--text-muted)]">{optionSummary}</p>
            ) : null}
            <p className="text-sm text-[var(--text-muted)]">
              {formatMoneyOrDash(line.unitPrice)} each
            </p>
          </div>
          <p className="whitespace-nowrap text-base font-semibold text-[var(--color-gold)]">
            {formatMoneyOrDash(line.lineTotal)}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Stepper: each button submits the target quantity (min 1; removal is the Remove button). */}
          <form action={updateLineAction} className="flex items-center gap-2">
            <input type="hidden" name="lineId" value={line.id} />
            <LineSubmitButton
              name="quantity"
              value={String(line.quantity - 1)}
              disabled={line.quantity <= 1}
              ariaLabel={`Decrease quantity of ${variant.productTitle}`}
              className={STEPPER_BUTTON_CLASSES}
            >
              −
            </LineSubmitButton>
            <span
              aria-label={`Quantity: ${line.quantity}`}
              className="inline-flex h-8 min-w-8 items-center justify-center px-1 text-sm font-semibold text-[var(--text-primary)]"
            >
              {line.quantity}
            </span>
            <LineSubmitButton
              name="quantity"
              value={String(line.quantity + 1)}
              disabled={isAtMaxQuantity}
              ariaLabel={`Increase quantity of ${variant.productTitle}`}
              className={STEPPER_BUTTON_CLASSES}
            >
              +
            </LineSubmitButton>
          </form>

          <form action={removeLineAction}>
            <input type="hidden" name="lineId" value={line.id} />
            <LineSubmitButton
              ariaLabel={`Remove ${variant.productTitle} from cart`}
              className={REMOVE_BUTTON_CLASSES}
            >
              Remove
            </LineSubmitButton>
          </form>
        </div>
      </div>
    </li>
  );
}
