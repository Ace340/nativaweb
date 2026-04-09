import { motion } from "framer-motion";
import { SectionHeading } from "@/components/ui/section-heading";
import { faqs } from "@/components/landing/landing-data";
import { sectionVariant } from "@/components/landing/section-motion";

export function FAQSection() {
  return (
    <motion.section
      id="faq"
      className="space-y-10"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      transition={{ duration: 0.8 }}
      variants={sectionVariant}
    >
      <SectionHeading
        label="FAQ"
        title="Common questions answered"
        description="No checkout system, just clean navigation to Amazon with all the reassurances built-in."
      />
      <div className="space-y-4">
        {faqs.map((faq) => (
          <motion.div
            key={faq.question}
            className="rounded-3xl border border-white/10 bg-slate-900/50 p-6"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <details className="space-y-2">
              <summary className="cursor-pointer text-base font-semibold text-white">
                {faq.question}
              </summary>
              <p className="text-sm text-slate-300">{faq.answer}</p>
            </details>
          </motion.div>
        ))}
      </div>
    </motion.section>
  );
}
