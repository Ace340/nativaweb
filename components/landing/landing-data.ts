import type { Product } from "@/components/product-card";

export const products: Product[] = [
  {
    id: "ambar-bag",
    name: "Ambar Handbag",
    description:
      "Crafted in Colombia with traditional techniques, this unique handbag features natural fique fiber and plant-based mustard dyes.",
    benefits: [
      "Handwoven by skilled artisans in Colombia.",
      "Sustainable materials and eco-friendly dyeing process.",
      "Unique pattern created through traditional weaving methods.",
    ],
    image:
      "/ambar-front.jpg",
    accent: "Golden style",
    amazonUrl: "https://www.amazon.com/dp/B08XJG8MQM",
  },
  {
    id: "frida-bag",
    name: "Frida Handbag",
    description:
      "Ceramic capsule with activated charcoal core, slow-release amber oil, and gentle glow ring keyed to Solis for layered ambiance.Features a stunning fuchsia pink color achieved through plant-based dyes, showcasing the distinctive woven texture and organic beauty of natural iraca palm material.",
    benefits: [
      "Soft cotton fabric interior lining for refined elegance.",
      "Spacious handbag with relaxed silhouette and lightweight construction.",
      "Stunning fuchsia pink color achieved through plant-based dyes, organic beauty of natural iraca palm material.",
    ],
    image:
      "/MainC.jpg",
    accent: "Pink passion",
    amazonUrl: "https://www.amazon.com/dp/B0897V9HS2",
  },
];

export const benefits = [
  {
    title: "Fique Fiber",
    description:
      "Natural plant fiber extracted from the leaves of the Furcraea plant, traditionally cultivated in Colombia and other Andean regions.",
  },
  {
    title: "Artisanal Craftmanship",
    description:
      "Fique production also has an important social and economic role, as tens of thousands of rural families depend on its cultivation and processing",
  },
  {
    title: "Tagua Nut",
    description:
      "Tagua is a hard, white, organic material that comes from the seeds of certain palm trees. It's valued for its durability, eco friendly, and natural beauty.",
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
    "/artisan.jpg",
};

export const heroStats = [
  { label: "Positive reviews", value: "4.9 / 5" },
  { label: "Amazon Prime ready", value: "48-hour" },
  { label: "Limited editions", value: "120 units" },
];
