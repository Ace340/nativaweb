import { SectionHeading } from "@/components/ui/section-heading";
import { ProductCard } from "@/components/product-card";
import { Button } from "@/components/ui/button";
import { products } from "@/components/landing/landing-data";

export function ProductsSection() {
  return (
    <section id="products" className="space-y-10">
      <SectionHeading
        label="Meet our products"
        title="Handcrafted by colombian artisans with a passion for quality and sustainability"
        description="Each bag is meticulously handwoven in Colombia using traditional techniques, creating a unique pattern with natural fique fiber and plant-based mustard dyes."
      />
      <div className="grid gap-8 md:grid-cols-2">
        {products.map((product, index) => (
          <ProductCard key={product.id} product={product} index={index} />
        ))}
      </div>
      {/* Direct Channel CTA — the Catalog lives at /shop (GLOSSARY: Landing Page
          previews the Catalog and links to it). */}
      <div className="flex justify-center pt-4">
        <Button asChild variant="primary">
          <a href="/shop">Shop the full collection</a>
        </Button>
      </div>
    </section>
  );
}
