import { Button } from "@/components/ui/button";

const NAV_LINKS = [
  { label: "Gallery", href: "#gallery" },
  { label: "Products", href: "#products" },
  { label: "Benefits", href: "#benefits" },
  { label: "Testimonials", href: "#testimonials" },
  { label: "FAQ", href: "#faq" },
  { label: "Artisan", href: "#artisan" },
];

export function FooterSection() {
  return (
    <footer role="contentinfo" aria-label="Site footer" className="px-6 pb-6 lg:px-8">
      <div className="mx-auto flex max-w-7xl flex-col items-center gap-8 rounded-2xl border border-[rgba(189,188,178,0.25)] bg-[rgba(44,60,20,0.85)] p-8 shadow-2xl shadow-black/50 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-col items-center gap-2 lg:items-start">
          <img
            src="/logo.svg"
            alt="Nativa Handbags Logo"
            className="h-12 w-auto sm:h-14 transition-transform hover:scale-105"
          />
          <p className="text-xs text-[var(--text-muted)]">© 2025 NTV. All rights reserved.</p>
        </div>

        <nav aria-label="Footer navigation">
          <ul className="flex flex-wrap justify-center gap-6 text-sm text-[var(--text-muted)] lg:flex-nowrap">
            {NAV_LINKS.map((link, index) => (
              <>
                <li key={link.href}>
                  <a
                    href={link.href}
                    className="transition-colors duration-200 hover:text-[var(--text-primary)] focus-visible:text-[var(--text-primary)]"
                  >
                    {link.label}
                  </a>
                </li>
                {index < NAV_LINKS.length - 1 && (
                  <li key={`separator-${link.href}`} className="text-[rgba(189,188,178,0.4)]">|</li>
                )}
              </>
            ))}
          </ul>
        </nav>

        <div>
          <Button asChild variant="secondary">
            <a
              href="https://www.amazon.com/s?rh=n%3A7141123011%2Cp_4%3ANTV&ref=bl_sl_s_sh_web_7141123011"
              target="_blank"
              rel="noopener noreferrer"
            >
              Shop on Amazon
            </a>
          </Button>
        </div>
      </div>
    </footer>
  );
}