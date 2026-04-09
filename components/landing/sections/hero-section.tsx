import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { heroStats } from "@/components/landing/landing-data";
import { sectionVariant } from "@/components/landing/section-motion";

export function HeroSection() {
  return (
    <motion.section
      id="hero"
      className="space-y-10"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      transition={{ duration: 0.8 }}
      variants={sectionVariant}
    >
      <div className="space-y-4">
        <p className="text-sm uppercase tracking-[0.3em] text-amber-300">Artisanal drop</p>
        <h1 className="text-4xl font-semibold leading-tight text-white md:text-5xl">
          Modern ambiance for the discerning collector.
        </h1>
        <p className="max-w-2xl text-lg text-slate-300">
          A high-converting ecommerce-style landing experience crafted with Next.js 15, Tailwind, Framer Motion,
          and shadcn/ui principles. Highlighting two signature pieces built to thrive on Amazon without a checkout.
        </p>
      </div>

      <div className="flex flex-wrap gap-4">
        <Button asChild variant="primary">
          <a href="#products">Explore the duo</a>
        </Button>
        <Button asChild variant="ghost">
          <a href="#artisan">Meet the artisan</a>
        </Button>
      </div>

      <div className="grid sm:grid-cols-3 gap-6 text-sm text-slate-300">
        {heroStats.map((stat) => (
          <div key={stat.label} className="space-y-1 rounded-3xl border border-white/10 bg-slate-900/50 p-4 text-center">
            <p className="text-2xl font-semibold text-white">{stat.value}</p>
            <p className="uppercase tracking-[0.3em] text-xs text-slate-400">{stat.label}</p>
          </div>
        ))}
      </div>
    </motion.section>
  );
}
