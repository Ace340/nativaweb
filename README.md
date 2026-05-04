# Nativaweb

> Modern landing page for a premium artisan brand, featuring a bento gallery, testimonials, and smooth scroll animations.

![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=next.js) ![React](https://img.shields.io/badge/React-19-61DAFB?logo=react) ![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript) ![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?logo=tailwindcss)

## Overview

A high-end landing page built for a premium artisan product brand. Features a modular section-based architecture with a bento-style gallery, product showcase, testimonials, FAQ, and CTA — all tied together with GSAP and Framer Motion animations.

## Tech Stack

- **Framework:** Next.js 15 (App Router)
- **UI:** React 19, Tailwind CSS 4, Radix UI
- **Animations:** Framer Motion, GSAP
- **Icons:** Lucide React
- **Language:** TypeScript

## Features

- 🎨 **Premium Landing Page** — Modular section-based layout with elegant design
- 🖼️ **Bento Gallery** — Modern bento-grid image showcase
- ⭐ **Testimonials & FAQ** — Interactive sections with smooth animations
- 📱 **Fully Responsive** — Optimized for all screen sizes
- ⚡ **Performance First** — Next.js 15 with optimized loading and rendering
- 🎯 **CTA Section** — Conversion-optimized call-to-action

## Getting Started

```bash
git clone https://github.com/Ace340/nativaweb.git
cd nativaweb
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
nativaweb/
├── app/
│   └── page.tsx                    # Main page composing all sections
├── components/landing/
│   ├── navbar.tsx                  # Navigation
│   └── sections/
│       ├── hero-section.tsx        # Hero banner
│       ├── products-section.tsx    # Product showcase
│       ├── bento-gallery-section.tsx # Bento grid gallery
│       ├── benefits-section.tsx    # Benefits/features
│       ├── testimonials-section.tsx # Social proof
│       ├── social-media-section.tsx # Social links
│       ├── faq-section.tsx         # FAQ accordion
│       ├── artisan-section.tsx     # Artisan story
│       └── cta-section.tsx         # Call to action
└── package.json
```

## License

MIT
