# NTV Landing Page

A Next.js 15 landing page for NTV (Nativa Handbags) - a Colombian company crafting handmade bags, showcasing products, benefits, testimonials, and the artisan story.

## Language

**NTV**:
The brand name for Nativa Handbags, a Colombian company specializing in handmade bags.
_Avoid_: The company, the brand, our business

**Navigation Links**:
Shortcuts to page sections that mirror the main navbar: Gallery, Products, Benefits, Testimonials, FAQ, Artisan.
_Avoid_: Quick links, footer menu

**External Actions**:
Links that take users off-site for purchasing or social engagement, such as the Amazon store.
_Avoid_: External links, off-site actions

**Copyright Notice**:
The legal statement "© {year} {entity}. All rights reserved." displayed in the footer.
_Avoid_: Copyright text, legal footer text

**Footer Logo**:
The NTV logo (same as navbar) displayed alongside the copyright notice to reinforce brand identity.
_Avoid_: Brand logo, company logo

**Footer Categories**:
The three content types that comprise the footer: Legal & Copyright, Navigation Links, and External Actions.

**Footer Positioning**:
Placed after the CTA section (outside the main content container) to provide final page closure.
_Avoid_: Footer placement, footer location

**Footer Styling**:
Darker, opaque background (rgba(44,60,20,0.85)) with subtle border and strong shadow to ground the page visually. Uses max-w-7xl for wider presentation.
_Avoid_: Footer appearance, footer design

**Smooth Scrolling**:
Anchor link behavior that animates scroll position to the target section over time, matching navbar interaction.
_Avoid_: Animated scroll, scroll animation

**Link Separators**:
Vertical pipe characters (|) displayed in muted color (rgba(189,188,178,0.4)) between inline navigation links for visual distinction.
_Avoid_: Dividers, separators, visual breaks

**Mobile Footer Behavior**:
Vertical stacking of footer elements with centered alignment on screens smaller than 640px (sm breakpoint).
_Avoid_: Mobile layout, mobile footer

**Footer Button Variant**:
The secondary button style (muted background with border) used for External Actions to maintain visual consistency with the navbar.
_Avoid_: CTA button style, action button

**Footer Text Hierarchy**:
Text sizing and color variables: logo (natural, h-12 sm:h-14), copyright (text-xs text-[var(--text-muted)]), navigation (text-sm text-[var(--text-muted)] with hover), button (standard secondary).
_Avoid_: Footer typography, footer text sizing

**Footer Internal Spacing**:
Gap-8 (32px) between main groups on desktop, space-y-6 (24px) between stacked elements on mobile.
_Avoid_: Footer gaps, footer spacing

**Footer Accessibility**:
ARIA attributes: `role="contentinfo"` landmark with `aria-label="Site footer"` and proper external link security attributes (`rel="noopener noreferrer"`).
_Avoid_: ARIA attributes, accessibility markup

**Copyright Year**:
The hardcoded year displayed in the copyright notice (2025), updated manually when needed.
_Avoid_: Dynamic year, year display

**Footer Empty State Handling**:
All three groups always render in the layout; empty groups display no visible content but maintain structural positioning.
_Avoid_: Empty footer behavior, missing content handling

**Footer Component**:
A single component file (footer-section.tsx) in components/landing/sections/ containing all footer logic, following the established sections pattern.
_Avoid_: Footer file, footer module