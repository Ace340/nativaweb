"use client";

/**
 * Variant selection for a Product detail page (GLOSSARY: customers buy a
 * Variant, never a Product).
 *
 * Pure derivation, no mutation: only the per-axis UI state (option name →
 * chosen value) is stored; the selected Variant is always re-derived from
 * the Variants array by matching EVERY SelectedOption (see
 * findVariantByOptions — the pure core of this component).
 *
 * The selection is exposed to the parent two ways, whichever suits:
 * - `children` render-prop, for composition inside the client boundary;
 * - `action` forwarding, which renders the built-in AddToCartForm below
 *   the selectors. A Server Component page cannot pass render functions
 *   across the RSC/client seam, so this is the seam the detail page uses
 *   (server actions DO cross it — the real addToCartAction from
 *   app/actions/cart.ts since Phase 3).
 */

import { useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import type { CatalogVariant, SelectedOption } from "@/types/catalog";
import { AddToCartForm, type AddToCartAction } from "./add-to-cart-form";
import { formatPrice } from "./format-price";

/** At or below this Stock Level the selected Variant gets a low-stock hint. */
const LOW_STOCK_THRESHOLD = 5;

/** Chosen value per option axis, e.g. { Color: "Olive", Size: "Large" }. */
export type OptionSelection = Readonly<Record<string, string>>;

/** What the render-prop receives: the derived Variant (or null). */
export type VariantSelection = {
  readonly variant: CatalogVariant | null;
};

/** One option axis (e.g. "Color") with its distinct values in first-seen order. */
export type OptionGroup = {
  readonly name: string;
  readonly values: readonly string[];
};

type VariantPickerProps = {
  variants: readonly CatalogVariant[];
  /** Server Action forwarded to the built-in AddToCartForm. */
  action?: AddToCartAction;
  /** Render-prop alternative to `action`: receive the derived selection. */
  children?: (selection: VariantSelection) => ReactNode;
};

// ── Pure derivation helpers (no mutation; new values only) ──────────────────

function toSelection(selectedOptions: readonly SelectedOption[]): OptionSelection {
  return Object.fromEntries(selectedOptions.map((option) => [option.name, option.value]));
}

function hasOptionValue(variant: CatalogVariant, name: string, value: string): boolean {
  return variant.selectedOptions.some((option) => option.name === name && option.value === value);
}

/**
 * THE pure core: a Variant is selected when ALL of its selectedOptions
 * match the current selection. First match wins — Shopify guarantees
 * unique combinations per Product.
 */
export function findVariantByOptions(
  variants: readonly CatalogVariant[],
  selection: OptionSelection,
): CatalogVariant | null {
  return (
    variants.find((variant) =>
      variant.selectedOptions.every((option) => selection[option.name] === option.value),
    ) ?? null
  );
}

/** Default to the first Variant still for sale, so the page opens buyable. */
export function deriveInitialSelection(variants: readonly CatalogVariant[]): OptionSelection {
  const firstAvailable = variants.find((variant) => variant.availableForSale);
  return toSelection((firstAvailable ?? variants[0])?.selectedOptions ?? []);
}

/**
 * Choosing a value on one axis keeps the other axes; if that exact
 * combination does not exist, snap to the first Variant (preferring one
 * still for sale) that carries the chosen value. Always returns a NEW
 * selection — the input is never mutated.
 */
export function selectOptionValue(
  variants: readonly CatalogVariant[],
  selection: OptionSelection,
  name: string,
  value: string,
): OptionSelection {
  const nextSelection = { ...selection, [name]: value };
  if (findVariantByOptions(variants, nextSelection)) {
    return nextSelection;
  }

  const snapped =
    variants.find((variant) => variant.availableForSale && hasOptionValue(variant, name, value)) ??
    variants.find((variant) => hasOptionValue(variant, name, value));
  return snapped ? toSelection(snapped.selectedOptions) : nextSelection;
}

export function deriveOptionGroups(variants: readonly CatalogVariant[]): OptionGroup[] {
  const groups = new Map<string, string[]>();
  for (const variant of variants) {
    for (const option of variant.selectedOptions) {
      const values = groups.get(option.name) ?? [];
      if (!values.includes(option.value)) {
        values.push(option.value);
      }
      groups.set(option.name, values);
    }
  }
  return [...groups.entries()].map(([name, values]) => ({ name, values }));
}

/** A value reads as sold out when NO Variant carrying it is available for sale. */
function hasAvailableVariantWithValue(
  variants: readonly CatalogVariant[],
  name: string,
  value: string,
): boolean {
  return variants.some(
    (variant) => variant.availableForSale && hasOptionValue(variant, name, value),
  );
}

// ── Presentational pieces ────────────────────────────────────────────────────

type OptionGroupButtonsProps = {
  group: OptionGroup;
  variants: readonly CatalogVariant[];
  selection: OptionSelection;
  onSelect: (name: string, value: string) => void;
};

function OptionGroupButtons({ group, variants, selection, onSelect }: OptionGroupButtonsProps) {
  return (
    <fieldset className="space-y-3">
      <legend className="text-xs font-semibold uppercase tracking-[0.4em] text-[var(--text-muted)]">
        {group.name}
      </legend>
      <div className="flex flex-wrap gap-3">
        {group.values.map((value) => {
          const isSelected = selection[group.name] === value;
          const isSoldOut = !hasAvailableVariantWithValue(variants, group.name, value);

          return (
            <button
              key={value}
              type="button"
              aria-pressed={isSelected}
              aria-disabled={isSoldOut}
              onClick={() => onSelect(group.name, value)}
              className={cn(
                "rounded-full border px-5 py-2.5 text-sm font-medium transition",
                "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-300",
                isSelected
                  ? "border-[var(--color-gold)] bg-[var(--color-gold)] text-[var(--color-forest)]"
                  : "border-[rgba(189,188,178,0.35)] text-[var(--text-primary)] hover:border-[var(--color-gold)] hover:text-[var(--color-gold)]",
                isSoldOut && "cursor-not-allowed opacity-45 line-through",
              )}
            >
              {value}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}

function VariantSummary({ variant }: { variant: CatalogVariant | null }) {
  if (!variant) {
    return (
      <p className="text-sm text-[var(--text-muted)]">
        This combination is not available. Try another option.
      </p>
    );
  }

  const compareAt = variant.compareAtPrice;
  const hasCompareAt = compareAt !== null && compareAt.amount > variant.price.amount;
  const isLowStock =
    variant.availableForSale &&
    variant.stockLevel !== null &&
    variant.stockLevel > 0 &&
    variant.stockLevel <= LOW_STOCK_THRESHOLD;

  return (
    <div className="space-y-1">
      <p className="flex flex-wrap items-baseline gap-3">
        <span className="text-2xl font-semibold text-[var(--color-gold)]">
          {formatPrice(variant.price)}
        </span>
        {hasCompareAt && compareAt ? (
          <span className="text-base text-[var(--text-muted)] line-through">
            {formatPrice(compareAt)}
          </span>
        ) : null}
      </p>
      <p className="text-sm text-[var(--text-muted)]">
        {variant.availableForSale
          ? isLowStock && variant.stockLevel !== null
            ? `Only ${variant.stockLevel} left`
            : "In stock"
          : "Sold out"}
      </p>
    </div>
  );
}

// ── Component ────────────────────────────────────────────────────────────────

export function VariantPicker({ variants, action, children }: VariantPickerProps) {
  const [selection, setSelection] = useState<OptionSelection>(() =>
    deriveInitialSelection(variants),
  );

  const selectedVariant = findVariantByOptions(variants, selection);
  const optionGroups = deriveOptionGroups(variants);

  function handleSelect(name: string, value: string) {
    setSelection((current) => selectOptionValue(variants, current, name, value));
  }

  return (
    <div className="space-y-8">
      {optionGroups.map((group) => (
        <OptionGroupButtons
          key={group.name}
          group={group}
          variants={variants}
          selection={selection}
          onSelect={handleSelect}
        />
      ))}

      <VariantSummary variant={selectedVariant} />

      {children
        ? children({ variant: selectedVariant })
        : action
          ? <AddToCartForm action={action} variant={selectedVariant} />
          : null}
    </div>
  );
}
