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
      className="flex flex-col gap-6 rounded-3xl border border-white/10 bg-slate-900/40 p-6 shadow-2xl shadow-black/40"
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
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/40" />
      </div>

      <div className="space-y-4">
        <p className="text-xs font-semibold uppercase tracking-[0.4em] text-amber-300">
          {product.accent}
        </p>
        <h3 className="text-2xl font-semibold text-white">{product.name}</h3>
        <p className="text-base leading-relaxed text-slate-300">
          {product.description}
        </p>

        <ul className="space-y-3 text-sm text-slate-200">
          {product.benefits.map((benefit) => (
            <li key={benefit} className="flex items-start gap-2">
              <span className="mt-1 h-2 w-2 rounded-full bg-amber-400" />
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
