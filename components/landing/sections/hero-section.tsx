import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { sectionVariant } from "@/components/landing/section-motion";
import { RollingText } from "@/components/landing/rolling-text";

export function HeroSection() {
  return (
    <motion.section
      id="hero"
      className="relative overflow-hidden rounded-[2.5rem] border border-white/20 bg-slate-950/80 bg-cover bg-center px-6 py-10 md:px-10 lg:px-12 lg:py-14"
      style={{ backgroundImage: "url('/hero.svg')" }}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      transition={{ duration: 0.8 }}
      variants={sectionVariant}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-slate-950/90 via-slate-950/70 to-slate-950/30" aria-hidden />
      <div className="relative z-10 mx-auto w-full max-w-[1100px] h-[400px]">
        <div className="absolute left-6 bottom-6 md:left-8 text-left">
          <RollingText text="NTV" />
        </div>

        <div className="absolute right-6 bottom-6 flex flex-wrap justify-end gap-4 md:right-8">
          <Button asChild variant="primary">
            <a href="#products">Explore the duo</a>
          </Button>
          <Button asChild variant="ghost">
            <a href="#artisan">Meet the artisan</a>
          </Button>
        </div>
      </div>
    </motion.section>
  );
}
