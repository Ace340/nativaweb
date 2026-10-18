import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

type ShopHeaderProps = {
  /** Which page is rendering the header (drives aria-current + active styling). */
  active: "shop" | "cart";
};

/**
 * Shared header for Direct Channel pages (/shop, product detail, /cart).
 * One header, one place to add cross-links — shoppers can always reach
 * the Catalog and the Cart (GLOSSARY: Cart, Catalog, Direct Channel).
 */
export function ShopHeader({ active }: ShopHeaderProps) {
  const links = [
    { href: "/shop", label: "Shop", key: "shop" as const },
    { href: "/cart", label: "Cart", key: "cart" as const },
  ];

  return (
    <header className="relative z-10 mx-auto flex w-full max-w-6xl items-center justify-between px-6 pt-8 lg:px-8">
      <Link href="/" aria-label="Naitive Handcrafted — home" className="shrink-0">
        <Image
          src="/logo.svg"
          alt="Naitive Handbags logo"
          width={56}
          height={56}
          className="h-11 w-auto transition-transform hover:scale-105"
          priority
        />
      </Link>

      <nav
        aria-label="Shop"
        className="flex items-center gap-5 text-xs font-semibold uppercase tracking-[0.4em]"
      >
        {links.map(({ href, label, key }) => (
          <Link
            key={key}
            href={href}
            aria-current={active === key ? "page" : undefined}
            className={cn(
              "transition-colors hover:text-[var(--color-gold)]",
              active === key
                ? "text-[var(--color-gold)]"
                : "text-[var(--text-muted)]",
            )}
          >
            {label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
