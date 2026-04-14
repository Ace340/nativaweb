"use client";

import { LandingNavbar } from "@/components/landing/navbar";
import { HeroSection } from "@/components/landing/sections/hero-section";
import { ProductsSection } from "@/components/landing/sections/products-section";
import { BentoGallerySection } from "@/components/landing/sections/bento-gallery-section";
import { BenefitsSection } from "@/components/landing/sections/benefits-section";
import { TestimonialsSection } from "@/components/landing/sections/testimonials-section";
import { FAQSection } from "@/components/landing/sections/faq-section";
import { ArtisanSection } from "@/components/landing/sections/artisan-section";
import { CTASection } from "@/components/landing/sections/cta-section";

export default function Home() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[var(--page-bg)] text-[var(--text-primary)]">
      <LandingNavbar />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(216,187,124,0.28),transparent_45%)]" />
      <main className="relative z-10 mx-auto flex w-full max-w-6xl flex-col gap-24 px-6 py-10 pb-40 lg:px-8">
        <HeroSection />
        <ProductsSection />
        <BentoGallerySection />
        <BenefitsSection />
        <TestimonialsSection />
        <FAQSection />
        <ArtisanSection />
      </main>

      <CTASection />
    </div>
  );
}
