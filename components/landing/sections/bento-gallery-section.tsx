"use client";

import { useLayoutEffect, useRef } from "react";
import Image from "next/image";
import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";
import { SectionHeading } from "@/components/ui/section-heading";

gsap.registerPlugin(ScrollTrigger);

const galleryItems = [
  {
    src: "/gallery4.png",
    alt: "fique Fiber",
    title: "Fique Fiber",
    description: "When extracted, the fiber is washed and dried naturally.",
    className: "md:col-span-4 md:row-span-2 lg:col-span-6",
    sizes: "(max-width: 767px) 100vw, (max-width: 1279px) 66vw, 50vw",
    featured: true,
  },
  {
    src: "/gallery1.jpg",
    alt: "ambar bag model",
    title: "Ambar Handbag",
    className: "md:col-span-2 lg:col-span-3",
    sizes: "(max-width: 767px) 100vw, (max-width: 1279px) 34vw, 25vw",
  },
  {
    src: "/gallery2.jpg",
    alt: "Ambar bag detail",
    title: "Fit every style",
    className: "md:col-span-2 lg:col-span-3",
    sizes: "(max-width: 767px) 100vw, (max-width: 1279px) 34vw, 25vw",
  },
  {
    src: "/gallery3.jpg",
    alt: "Ambar bag detail",
    title: "Light and durable",
    className: "md:col-span-6 lg:col-span-12",
    sizes: "(max-width: 767px) 100vw, 100vw",
  },
  {
    src: "/gallery5.svg",
    alt: "Frida bag detail",
    title: "Outstanding colors",
    className: "hidden lg:block lg:col-span-6",
    sizes: "50vw",
  },
] as const;

export function BentoGallerySection() {
  const sectionRef = useRef<HTMLElement>(null);
  const featuredSrc = "/gallery4.png";

  useLayoutEffect(() => {
    if (!sectionRef.current) return;

    const ctx = gsap.context(() => {
      const cards = gsap.utils.toArray<HTMLElement>("[data-gallery-card]");

      gsap.fromTo(
        cards,
        { opacity: 0, y: 56, scale: 0.98 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          ease: "power3.out",
          stagger: 0.15,
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 72%",
            end: "bottom 30%",
            scrub: 1,
          },
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} id="gallery" className="space-y-10">
      <SectionHeading
        label="Gallery"
        title="A style that matches your inner vibe"
        description="Nativa products are the perfect fit for your lifestyle, whether you're heading to the office, exploring the city, or enjoying a weekend getaway. Our bags are designed to complement your unique style and keep up with your dynamic life."
      />

      <div className="grid auto-rows-[minmax(14rem,auto)] gap-4 md:grid-cols-6 md:auto-rows-[16rem] lg:grid-cols-12 lg:auto-rows-[18rem] lg:grid-flow-dense">
        {galleryItems.map((item) => (
          <article
            key={item.src}
            data-gallery-card
            className={`group relative min-h-[14rem] overflow-hidden rounded-[2rem] border border-white/10 bg-[rgba(18,24,14,0.8)] shadow-2xl shadow-black/40 md:min-h-[16rem] lg:min-h-[18rem] ${item.className}`}
          >
            <Image
              src={item.src}
              alt={item.alt}
              fill
              sizes={item.sizes}
              className="object-cover transition duration-700 group-hover:scale-105"
              onLoadingComplete={() => ScrollTrigger.refresh()}
            />

            <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />

            {item.src === featuredSrc ? (
              <div className="absolute inset-0 flex items-end p-6 md:p-8">
                <div className="max-w-sm space-y-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.4em] text-[var(--color-gold)]">
                    Featured
                  </p>
                  <h3 className="text-2xl font-semibold text-white md:text-3xl">
                    {item.title}
                  </h3>
                  <p className="text-sm leading-6 text-white/80 md:text-base">
                    {item.description}
                  </p>
                </div>
              </div>
            ) : (
              <div className="absolute inset-x-0 bottom-0 p-5">
                <p className="text-sm font-medium text-white">{item.title}</p>
              </div>
            )}
          </article>
        ))}
      </div>
    </section>
  );
}
