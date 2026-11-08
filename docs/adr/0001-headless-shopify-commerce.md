# Headless Shopify as the commerce engine

NTV is migrating from a marketing-only landing page (purchases routed to amazon.com) to selling directly. We keep the custom Next.js storefront and use Shopify as the commerce engine: products, variants, prices, stock levels, and orders live in Shopify; the storefront reads them via the Storefront API and redirects to Shopify's hosted checkout. Store currency is CAD; primary market Canada; fulfillment ships from Canada.

## Considered Options

- **Shopify headless (chosen)** — the monthly cost buys a managed admin usable by a non-technical co-owner, native variant-level inventory with oversell prevention, and a hosted PCI checkout. The custom design investment survives.
- **Shopify theme** — same monthly cost, least code, but discards the existing custom site.
- **Medusa / self-hosted** — $0 software, but we become the hosting and admin-UI team; wrong trade for a 2–5 product catalog with a non-technical partner.
- **Snipcart / catalog-in-code** — product edits require a developer; fails the co-owner requirement.
- **Custom Next.js + Stripe only** — rebuilds inventory, oversell prevention, and order admin from scratch for no business gain.

## Consequences

- Product and inventory data must never be duplicated in code; `landing-data.ts` product entries migrate to Shopify, and the file keeps only marketing copy.
- The Amazon Channel (amazon.com, US) coexists during the Transition and is removed once Direct sales are stable. The "Amazon Prime ready 48-hour" hero stat is retired — it was Amazon's promise, not ours — replaced by ships-from-Canada messaging.
- Storefront API integration must be verified against current Shopify docs and this repo's Next.js 16 conventions before implementation.
