import { SectionHeading } from "@/components/ui/section-heading";
import { ProductCard } from "@/components/product-card";
import { products } from "@/components/landing/landing-data";

export function ProductsSection() {
  return (
    <section id="products" className="space-y-10">
      <SectionHeading
        label="Product Showcase"
        title="Two polished essentials, zero checkout headaches"
        description="Each card includes product imagery, thoughtful descriptions, key benefits, and a direct Buy on Amazon CTA built for conversions."
      />
      <div className="grid gap-8 md:grid-cols-2">
        {products.map((product, index) => (
          <ProductCard key={product.id} product={product} index={index} />
        ))}
      </div>
    </section>
  );
}
