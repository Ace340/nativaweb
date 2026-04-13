"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

export type Product = {
  id: string;
  name: string;
  description: string;
  benefits: string[];
  image: string;
  accent: string;
  amazonUrl: string;
};

const cardVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0 },
};

type ProductCardProps = {
  product: Product;
  index: number;
};

export function ProductCard({ product, index }: ProductCardProps) {
  return (
    <motion.article
      className="flex flex-col gap-6 rounded-3xl border border-[rgba(189,188,178,0.2)] bg-[rgba(44,60,20,0.55)] p-6 shadow-2xl shadow-black/40"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      variants={cardVariants}
    >
      <div className="relative h-64 w-full overflow-hidden rounded-2xl border border-white/10">
        <Image
          src={product.image}
          alt={product.name}
          fill
          sizes="(max-width: 768px) 100vw, 50vw"
          className="object-cover"
          priority={index === 0}
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[rgba(44,60,20,0.95)] via-[rgba(44,60,20,0.65)]" />
      </div>

      <div className="space-y-4">
        <p className="text-xs font-semibold uppercase tracking-[0.4em] text-amber-300">
          {product.accent}
        </p>
        <h3 className="text-2xl font-semibold text-[var(--text-primary)]">{product.name}</h3>
        <p className="text-base leading-relaxed text-[var(--text-muted)]">
          {product.description}
        </p>

        <ul className="space-y-3 text-sm text-[var(--text-primary)]">
          {product.benefits.map((benefit) => (
            <li key={benefit} className="flex items-start gap-2">
              <span className="mt-1 h-2 w-2 rounded-full bg-[var(--color-gold)]" />
              <span>{benefit}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-auto">
        <Button asChild variant="secondary" className="w-full">
          <a
            href={product.amazonUrl}
            target="_blank"
            rel="noreferrer"
            className="w-full text-center"
          >
            Buy on Amazon
          </a>
        </Button>
      </div>
    </motion.article>
  );
}
