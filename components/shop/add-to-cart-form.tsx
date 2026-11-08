"use client";

/**
 * Add-to-cart form (GLOSSARY: a Cart holds selected Variants).
 *
 * The cart mutation is a Server Action injected via the `action` prop —
 * the real addToCartAction from app/actions/cart.ts (cookie handling and
 * cartCreate/cartLinesAdd live server-side; the Cart ID never crosses
 * into client code). Pending state comes from React 19's useFormStatus,
 * which only sees status from inside the <form> — hence the extracted
 * submit button.
 */

import { useFormStatus } from "react-dom";
import { Button } from "@/components/ui/button";
import type { CatalogVariant } from "@/types/catalog";

export type AddToCartAction = (formData: FormData) => Promise<void>;

type AddToCartFormProps = {
  /** Server Action invoked with the FormData (carries variantId). */
  action: AddToCartAction;
  /** The selected Variant; null while no valid combination is chosen. */
  variant: CatalogVariant | null;
};

function AddToCartSubmitButton({ disabled, label }: { disabled: boolean; label: string }) {
  const { pending } = useFormStatus();

  return (
    <Button
      type="submit"
      disabled={disabled || pending}
      aria-busy={pending}
      size="lg"
      className="w-full disabled:cursor-not-allowed disabled:opacity-50"
    >
      {pending ? "Adding…" : label}
    </Button>
  );
}

export function AddToCartForm({ action, variant }: AddToCartFormProps) {
  const isSoldOut = variant === null || !variant.availableForSale;

  return (
    <form action={action} className="w-full">
      <input type="hidden" name="variantId" value={variant?.id ?? ""} />
      <AddToCartSubmitButton
        disabled={isSoldOut}
        label={isSoldOut ? "Sold out" : "Add to cart"}
      />
    </form>
  );
}
