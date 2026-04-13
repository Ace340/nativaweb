"use client";

import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";

type RollingTextProps = {
  text: string;
};

export function RollingText({ text }: RollingTextProps) {
  const trackRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (!trackRef.current) return;

    const ctx = gsap.context(() => {
      gsap.to(trackRef.current, {
        yPercent: -50,
        duration: 3,
        ease: "none",
        repeat: -1,
      });
    }, trackRef);

    return () => ctx.revert();
  }, []);

  const copies = Array.from({ length: 2 });

  return (
    <div
      className="relative flex h-[5.5rem] items-center justify-center overflow-hidden md:h-[6.25rem]"
      aria-hidden="true"
      role="presentation"
    >
      <div ref={trackRef} className="flex flex-col items-center justify-center gap-4">
        {copies.map((_, index) => (
          <p
            key={index}
            className="text-5xl font-semibold tracking-[0.9em] text-white leading-none md:text-6xl lg:text-7xl xl:text-8xl"
          >
            {text}
          </p>
        ))}
      </div>
    </div>
  );
}
