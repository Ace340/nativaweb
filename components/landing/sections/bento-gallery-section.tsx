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
    alt: "Featured gallery artwork",
    title: "Open with gallery four",
    description: "The featured frame introduces the collection with a calm, text-led reveal.",
    className: "md:col-span-2 md:row-span-2",
    featured: true,
  },
  {
    src: "/gallery1.jpg",
    alt: "Gallery one detail",
    title: "Texture study",
    className: "md:row-span-1",
  },
  {
    src: "/gallery2.jpg",
    alt: "Gallery two detail",
    title: "Warm composition",
    className: "md:row-span-1",
  },
  {
    src: "/gallery3.jpg",
    alt: "Gallery three detail",
    title: "Layered depth",
    className: "md:col-span-2",
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
        title="A scrubbed bento gallery that opens with gallery four"
        description="Scroll through a cinematic mosaic where the featured tile introduces the story first, then the rest of the collection follows with a soft GSAP reveal."
      />

      <div className="grid auto-rows-[minmax(180px,1fr)] gap-4 md:grid-cols-4 md:grid-rows-3">
        {galleryItems.map((item) => (
          <article
            key={item.src}
            data-gallery-card
            className={`group relative overflow-hidden rounded-[2rem] border border-white/10 bg-[rgba(18,24,14,0.8)] shadow-2xl shadow-black/40 ${item.className}`}
          >
            <Image
              src={item.src}
              alt={item.alt}
              fill
              sizes="(max-width: 768px) 100vw, 25vw"
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
