import { motion } from "framer-motion";
import { SectionHeading } from "@/components/ui/section-heading";
import { testimonials } from "@/components/landing/landing-data";
import { sectionVariant } from "@/components/landing/section-motion";

export function TestimonialsSection() {
  return (
    <motion.section
      id="testimonials"
      className="space-y-10"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      transition={{ duration: 0.8 }}
      variants={sectionVariant}
    >
      <SectionHeading
        label="Testimonials"
        title="Reviews that reinforce trust"
        description="Authentic anecdotes from creatives who bought the duo on Amazon and elevated their spaces."
      />
      <div className="grid gap-6 md:grid-cols-3">
        {testimonials.map((testimonial) => (
          <div
            key={testimonial.name}
            className="flex h-full flex-col justify-between gap-6 rounded-3xl border border-[rgba(189,188,178,0.2)] bg-[rgba(44,60,20,0.7)] p-6"
          >
            <p className="text-base leading-relaxed text-[var(--text-muted)]">“{testimonial.quote}”</p>
            <div className="flex items-center justify-between text-sm text-[rgba(189,188,178,0.65)]">
              <div>
                <p className="text-sm font-semibold text-[var(--text-primary)]">{testimonial.name}</p>
                <p>{testimonial.role}</p>
              </div>
              <div className="text-[var(--color-gold)]">{testimonial.rating}</div>
            </div>
          </div>
        ))}
      </div>
    </motion.section>
  );
}
