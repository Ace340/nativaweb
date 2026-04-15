import Image from "next/image";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { SectionHeading } from "@/components/ui/section-heading";
import { artisan } from "@/components/landing/landing-data";
import { sectionVariant } from "@/components/landing/section-motion";

export function ArtisanSection() {
  return (
    <motion.section
      id="artisan"
      className="space-y-10"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      transition={{ duration: 0.8 }}
      variants={sectionVariant}
    >
      <SectionHeading
        label="Artisans"
        title="A colombian tradition of hand-finished quality"
        description="We pair CNC precision with hand-polished warmth so these pieces look exceptional without compromising performance."
      />
        <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-6 rounded-3xl border border-[rgba(189,188,178,0.2)] bg-[rgba(44,60,20,0.7)] p-8">
            <p className="text-base text-[var(--text-muted)]">{artisan.description}</p>
            <ul className="space-y-3 text-sm text-[var(--text-primary)]">
            {artisan.details.map((detail) => (
              <li key={detail} className="flex items-start gap-3">
                <span className="mt-1 h-2 w-2 rounded-full bg-[var(--color-gold)]" />
                <span>{detail}</span>
              </li>
            ))}
          </ul>
          <Button asChild variant="secondary">
            <a href="#products">View the pieces again</a>
          </Button>
        </div>
        <div className="relative overflow-hidden rounded-3xl border border-white/10">
          <Image
            src={artisan.image}
            alt="Artisan workspace"
            width={1200}
            height={1000}
            className="h-full w-full object-cover"
            sizes="(max-width: 1024px) 100vw, 50vw"
          />
        </div>
      </div>
    </motion.section>
  );
}
