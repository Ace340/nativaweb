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
      "Features a stunning fuchsia pink color achieved through plant-based dyes, showcasing the distinctive woven texture and organic beauty of natural iraca palm material.",
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
      "Great handbag, spacious, stylish and well-made. It fits all my personal belongs and it's easy to carry. I will definetely recommend it.",
    name: "Silvia D.",
    role: "Creative Director, Atelier Mereo",
    rating: "4.9 / 5",
  },
  {
    quote:
      "I've been looking for a handbag like this for years. The quality is exceptional and the design is unique.",
    name: "Veronica R.",
    role: "Founder, Lumen+Co",
    rating: "4.8 / 5",
  },
  {
    quote:
      "The details are impeccable. It's clear that a lot of thought and care went into the design.",
    name: "Jenny A.",
    role: "Lead Industrial Designer",
    rating: "5.0 / 5",
  },
];

export const faqs = [
  {
    question: "Is this handbag really handmade?",
    answer:
      "Yes. the bags are handwoven by artisans using traditional techniques, which means each piece is unique and may have slight variations in pattern or texture.",
  },
  {
    question: "Is this bag durable enough for everyday use?",
    answer:
      "Yes, these bags are designed to be both functional and long-lasting, but they’re best suited for light to moderate daily use (like casual outings, beach trips, or summer wear) rather than heavy loads.",
  },
  {
    question: "How do I clean and care for the bag?",
    answer:
      "It’s recommended to spot clean with a soft cloth and avoid soaking it in water or exposing it to harsh chemicals or prolonged sunlight to preserve the natural fibers.",
  },
];

export const artisan = {
  title: "Hand-finished modernity",
  description:
    "Fique production also has an important social and economic role, as tens of thousands of rural families depend on its cultivation and processing. From extracting the fiber to spinning, dyeing, and weaving, every step is done by hand. There are no machines to speed up or standardize the process. This slow, intentional rhythm creates pieces with character, marked by subtle variations that are the artisan’s signature.",
  details: [
    "Fique is a naturally strong leaf fiber, making handbags highly resistant to wear, tension, and everyday use.",
    "Fique offers an eco-conscious alternative to synthetic fabrics with a much lower environmental impact.",
    "Its rich organic texture gives each handbag a handcrafted, premium look that highlights heritage and authenticity.",
  ],
  image:
    "/artisan.jpg",
};

export const heroStats = [
  { label: "Positive reviews", value: "4.9 / 5" },
  { label: "Amazon Prime ready", value: "48-hour" },
  { label: "Limited editions", value: "120 units" },
];
