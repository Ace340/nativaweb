import { SectionHeading } from "@/components/ui/section-heading";
import { ProductCard } from "@/components/product-card";
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
    </section>
  );
}
