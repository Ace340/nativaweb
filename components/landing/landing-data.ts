import type { Product } from "@/components/product-card";

export const products: Product[] = [
  {
    id: "solis-lamp",
    name: "Solis Horizon Lamp",
    description:
      "Studio-grade borosilicate dome diffuses a warm amber glow while a solid brass pivot locks in your perfect light angle.",
    benefits: [
      "Precision-etched lens for even, glare-free illumination.",
      "Magnetic diffuser and USB-C charging for daily polishing rituals.",
      "Amazon Prime ready packaging for 48-hour delivery.",
    ],
    image:
      "https://images.unsplash.com/photo-1470229538611-16ba8c7ffbd7?auto=format&fit=crop&w=1200&q=80",
    accent: "Signature light",
    amazonUrl: "https://www.amazon.com/dp/B08XJG8MQM",
  },
  {
    id: "ember-diffuser",
    name: "Ember Ritual Diffuser",
    description:
      "Ceramic capsule with activated charcoal core, slow-release amber oil, and gentle glow ring keyed to Solis for layered ambiance.",
    benefits: [
      "Charcoal lattice removes impurities while scent blooms.",
      "Syncing glow ring mirrors the lamp’s warmth for cohesive styling.",
      "Refill-ready cartridges ship via Amazon Subscribe & Save.",
    ],
    image:
      "https://images.unsplash.com/photo-1505751172876-fa1923c5c528?auto=format&fit=crop&w=1200&q=80",
    accent: "Scent ritual",
    amazonUrl: "https://www.amazon.com/dp/B0897V9HS2",
  },
];

export const benefits = [
  {
    title: "Narrative-first storytelling",
    description:
      "Hero copy, sectional pacing, and product highlights were calibrated for a single goal: convert curious visitors into Amazon traffic.",
  },
  {
    title: "Performance–ready visuals",
    description:
      "Framer Motion micro-interactions and clean Tailwind layouts keep the experience smooth on both desktop and mobile viewports.",
  },
  {
    title: "Artisan authenticity",
    description:
      "Hand-polished finishes, sustainable brass, and curated fragrances give this ecommerce landing page depth without a checkout system.",
  },
];

export const testimonials = [
  {
    quote:
      "The Solis Horizon Lamp is now the centerpiece of my studio. The glow is pure without any harsh edges and shipping from Amazon felt effortless.",
    name: "Marina L.",
    role: "Creative Director, Atelier Mereo",
    rating: "4.9 / 5",
  },
  {
    quote:
      "Pairing the lamp with Ember Diffuser made our showrooms feel curated. Clients appreciate the linked Amazon links—no extra checkout fuss.",
    name: "Ibrahim A.",
    role: "Founder, Lumen+Co",
    rating: "4.8 / 5",
  },
  {
    quote:
      "As a product designer, I admire how the page highlights just two pieces. It feels intentional and the CTA nudges to Amazon without clutter.",
    name: "Cory V.",
    role: "Lead Industrial Designer",
    rating: "5.0 / 5",
  },
];

export const faqs = [
  {
    question: "Is a checkout system included?",
    answer:
      "No. Every product card redirects visitors straight to Amazon. That keeps the experience simple and leverages Amazon’s fulfillment.",
  },
  {
    question: "Do you ship internationally?",
    answer:
      "Amazon handles all shipping logistics, so regional availability depends on each listing. Most buyers see Prime and two-day options.",
  },
  {
    question: "How do I keep the ritual fresh?",
    answer:
      "Refill packs for the Ember Diffuser are listed alongside the main listing, and we highlight them in the Amazon store for easy reorders.",
  },
];

export const artisan = {
  title: "Hand-finished modernity",
  description:
    "Every component is cut, polished, and assembled in our Brooklyn atelier. The process blends CNC precision with hand-brushed warmth so it looks cinematic in any home.",
  details: [
    "Laser-etched brass pivots for fluid motion control.",
    "Charcoal cores sourced from reclaimed wood matter a deeper scent profile.",
    "Finish is sealed with plant-based oils and packaged with recyclable linen sleeve.",
  ],
  image:
    "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80",
};

export const heroStats = [
  { label: "Positive reviews", value: "4.9 / 5" },
  { label: "Amazon Prime ready", value: "48-hour" },
  { label: "Limited editions", value: "120 units" },
];
