import { Button } from "@/components/ui/button";

export function CTASection() {
  return (
    <section id="cta" aria-label="Sticky call to action" className="z-20 px-6 pb-6 lg:px-8">
      <div className="sticky bottom-4 mx-auto flex max-w-6xl flex-col rounded-3xl border border-[rgba(189,188,178,0.25)] bg-gradient-to-r from-[rgba(44,60,20,0.95)] via-[rgba(44,60,20,0.25)] to-[rgba(216,187,124,0.35)] p-6 shadow-2xl shadow-black/60 backdrop-blur-xl lg:flex-row lg:items-center lg:justify-between">
        <div className="space-y-2">
          <p className="text-lg font-semibold text-[var(--text-primary)]">Ready to gift or display?</p>
          <p className="text-sm text-[var(--text-muted)]">
            Tap through to Amazon for each product. Fast fulfillment plus the momentum of a high-converting landing page.
          </p>
        </div>
        <div className="mt-4 flex flex-wrap gap-3 lg:mt-0">
          <Button asChild variant="primary" className="w-full lg:w-auto">
            <a href="https://www.amazon.com" target="_blank" rel="noreferrer">
              Shop both on Amazon
            </a>
          </Button>
          <Button asChild variant="ghost" className="w-full lg:w-auto">
            <a href="#faq">Revisit FAQ</a>
          </Button>
        </div>
      </div>
    </section>
  );
}
