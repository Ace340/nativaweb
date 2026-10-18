# Handoff: Catalog Feature (branch `catalog-feature`)

State as of 2026-10-18. Read this first when resuming; it is the single source
of truth for where the Direct Channel build stands and what comes next.

## Where we are

The headless Shopify build (ADR-0001) is **code-complete and reviewed**:
- Phases 1–4 done: foundation (client/queries/types/mappers), /shop catalog,
  product detail, cart with cookie-persisted server-side cart + checkout
  redirect, landing integration (Shop nav/CTA links, hero-stat swap).
- Review verdict: **Approve**, 0 critical, 3 warnings, polish list (below).
- Commit state: feature committed (`edd5754`), checklist + handoff (`01dd1c5`),
  review polish (quick wins) committed after. Verification re-run after polish:
  `npx tsc --noEmit` ✅ · `npm run lint` ✅ · `npm run build` ✅ (with NO
  Shopify env vars — graceful degradation holds).

## Architecture map (all new unless noted)

| Layer | Files |
|---|---|
| Domain types | `types/catalog.ts`, `types/cart.ts` (Shopify-free, GLOSSARY naming; `quantityAvailable`→`stockLevel`) |
| Shopify boundary | `lib/shopify/client.ts` (result objects, 2026-10 API, env-graceful), `lib/shopify/queries.ts` |
| Reads | `lib/shopify/products.ts` (React.cache, revalidate 900s list / 60s detail) |
| Cart core | `lib/shopify/cart.ts` (server-only; cart ID secret never leaves server) |
| Actions | `app/actions/cart.ts` ("use server", FormData-validated, quantity clamps 1–99) |
| Shop UI | `app/shop/page.tsx`, `app/shop/[handle]/page.tsx`, `app/cart/page.tsx`, `components/shop/*`, `components/cart/*` |
| Landing (modified) | `landing-data.ts`, `navbar.tsx`, `products-section.tsx`, `product-card.tsx`, `next.config.ts` (Shopify CDN images) |

Env contract: `SHOPIFY_STORE_DOMAIN` + `SHOPIFY_STOREFRONT_ACCESS_TOKEN`
(see `.env.example`). Setup steps: `docs/shopify-setup-checklist.md`.

## Pending work (priority order)

### 1. Quick wins (review items) — ✅ DONE (follow-up session)
- [x] `<a href="/shop">` → `next/link` `<Link>` in 3 places:
      `components/landing/navbar.tsx:71`, `components/landing/sections/products-section.tsx`,
      `components/product-card.tsx` (the "buy direct" link)
- [x] Dedupe `LOW_STOCK_THRESHOLD` + "Only N left" formatting — extracted to
      `components/shop/stock-level.ts` (`formatLowStockHint(stockLevel)`), used
      by `shop-product-card.tsx` and `variant-picker.tsx`
- [x] Cart stepper: capped at `Math.min(stockLevel ?? MAX, 99)` in
      `components/cart/cart-line-row.tsx` — `MAX_LINE_QUANTITY` now lives in
      `types/cart.ts` so both the Server Action and the client row share it
      (`"use server"` files can't export constants to clients)
- [x] `app/actions/cart.ts` — logger.error two-arg form (dropped the
      explicit `undefined`)

### 2. Stale-cart discrimination (review warning #2)
`getCart()` returns null for both "purged cart" and "network error", so recovery
can clear a live cart after transient failures. Refactor to a discriminated
status (`no-cookie | not-found | found | error`); recover only on `not-found`.
Pairs naturally with #3.

### 3. Test infra + pure-core tests (review warning #3)
No test framework in repo. Suggested: vitest. Target the exported pure
functions first (no mocks needed): `findVariantByOptions`, `selectOptionValue`,
`deriveOptionGroups` (variant-picker.tsx), `getPriceBounds`/`formatPrice`
(format-price.ts), `mapCatalogVariant`/`mapCart` mappers, `collectEdgeNodes`.

### 4. Shopify connection (business task)
Work `docs/shopify-setup-checklist.md` (partner account → dev store → CAD →
shipping profile → products/variants/stock → custom-app token → `.env.local`).
Then manually verify: catalog renders, add-to-cart → /cart → test checkout,
and the stale-cart path (set `ntv_cart` cookie to a bogus gid, add to cart,
confirm recreation).

### 5. Transition cleanup (do NOT forget — tracked from ADR-0001)
While Direct sales stabilize, Amazon CTAs coexist (`product-card.tsx` — the
commented Transition block). Once stable: remove Amazon buttons + footer
External Actions + `amazonUrl` from `landing-data.ts` products.

## Rulings made (don't re-litigate)

- **heroStats "Limited editions: 120 units" = marketing copy about edition
  size, NOT a stock figure.** Keep. (Review flagged it as borderline vs
  ADR-0001; user ruled it stays.)
- Shopify headless + Basic plan at launch; CAD/Canada market; ships from Canada.
- Landing page stays as homepage previewing the Catalog (GLOSSARY: Landing Page).

## Key context files

- `GLOSSARY.md` — domain language (Product/Variant/Stock Level/Cart/channels)
- `docs/adr/0001-headless-shopify-commerce.md` — the engine decision + consequences
- `docs/shopify-setup-checklist.md` — deferred business setup
- `.tmp/context/catalog-feature/bundle.md` — the build brief (standards,
  verified Shopify 2026-10 API facts, Next 16 gotchas) — still valid
- Shopify docs research may exist under `.tmp/external-context/shopify-storefront-api/`
  (existence unconfirmed; the bundle restates the essentials)
