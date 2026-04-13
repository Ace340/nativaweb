import { motion } from "framer-motion";
import { SectionHeading } from "@/components/ui/section-heading";
import { benefits } from "@/components/landing/landing-data";
import { sectionVariant } from "@/components/landing/section-motion";

export function BenefitsSection() {
  return (
    <motion.section
      id="benefits"
      className="space-y-10"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      transition={{ duration: 0.8 }}
      variants={sectionVariant}
    >
      <SectionHeading
        label="Benefits"
        title="Why this landing page converts"
        description="Clear hierarchy, trust signals, and tactile storytelling keep visitors engaged and drive Amazon clicks."
      />
      <div className="grid gap-6 md:grid-cols-3">
        {benefits.map((benefit) => (
          <div
            key={benefit.title}
            className="space-y-3 rounded-3xl border border-[rgba(189,188,178,0.2)] bg-[rgba(216,187,124,0.08)] p-6 shadow-lg shadow-black/40"
          >
            <p className="text-sm uppercase tracking-[0.4em] text-[var(--color-gold)]">{benefit.title}</p>
            <p className="text-base text-[var(--text-muted)]">{benefit.description}</p>
          </div>
        ))}
      </div>
    </motion.section>
  );
}
