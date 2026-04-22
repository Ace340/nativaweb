"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";

const NAV_LINKS = [
  { label: "Gallery", href: "#gallery" },
  { label: "Products", href: "#products" },
  { label: "Benefits", href: "#benefits" },
  { label: "Testimonials", href: "#testimonials" },
  { label: "FAQ", href: "#faq" },
  { label: "Artisan", href: "#artisan" },
];

function useHideOnScroll(threshold = 48) {
  const [hidden, setHidden] = useState(false);
  const lastScrollY = useRef(0);

  useEffect(() => {
    function handleScroll() {
      const current = window.scrollY;
      const isScrollingDown = current > lastScrollY.current && current > threshold;
      setHidden((prev) => {
        if (isScrollingDown && !prev) return true;
        if (!isScrollingDown && prev) return false;
        return prev;
      });
      lastScrollY.current = current;
    }

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [threshold]);

  return hidden;
}

export function LandingNavbar() {
  const isHidden = useHideOnScroll();

  return (
    <nav aria-label="Primary" className="pointer-events-none">
      <div
        className={`sticky top-0 z-30 mx-auto flex w-full max-w-6xl items-center justify-between gap-6 rounded-full border border-[rgba(189,188,178,0.35)] bg-[rgba(44,60,20,0.9)] px-6 py-3 text-sm backdrop-blur-2xl transition-transform duration-300 ${
          isHidden ? "-translate-y-full" : "translate-y-0"
        } pointer-events-auto shadow-2xl shadow-black/40`}
      >
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="shrink-0 cursor-pointer"
          aria-label="Scroll to top"
        >
          <img
            src="/logo.svg"
            alt="Nativa Handbags Logo"
            className="h-12 w-auto sm:h-14 transition-transform hover:scale-105"
          />
        </button>

        <ul className="hidden flex-1 items-center justify-center gap-6 text-[var(--text-muted)] sm:flex">
          {NAV_LINKS.map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                className="transition-colors duration-200 hover:text-[var(--text-primary)] focus-visible:text-[var(--text-primary)]"
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>

        <div className="flex shrink-0 items-center gap-3">
          <Button asChild variant="secondary" className="shrink-0 text-xs">
            <a href="#cta">Shop Amazon</a>
          </Button>
        </div>
      </div>
    </nav>
  );
}
