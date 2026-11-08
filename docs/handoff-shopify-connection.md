# Handoff: Shopify Connection & Store Verification

State as of 2026-11-07. Continues `docs/handoff-catalog-feature.md` (read that
first for the build architecture and review rulings). This doc covers the
business-side Shopify connection — checklist Phase 1 — and what remains
between here and launch.

## Where we are

The dev store is **connected and verified live**:

- Store: `naitive.myshopify.com` (development store under the Partner account).
- App: legacy custom app **"Storefront"** with a Storefront API access token.
  Scopes granted: `unauthenticated_read_product_listings`,
  `unauthenticated_read_product_inventory`, `unauthenticated_write_checkouts`.
  Admin API scopes deliberately NOT granted (storefront needs no admin data).
- Credentials live in `.env.local` (gitignored): `SHOPIFY_STORE_DOMAIN` +
  `SHOPIFY_STOREFRONT_ACCESS_TOKEN`. Any `npm run dev` picks them up.
- Verified live on 2026-11-07: `/shop` renders the catalog, product detail
  renders, `cartCreate` mutation succeeds (checkout scope proven), checkout
  redirect reaches Shopify's checkout after disabling store password
  protection (Online Store → Preferences).
- Catalog: one product live — **Ambar Handbag** (handle `ambar-handbag`),
  single "Default Title" variant, stock 6, price 86.00 **CAD** (currency was
  created as USD and fixed to CAD on 2026-11-07 via Settings → General).
- Test infra green: 47/47 Vitest tests.

## ⚠️ Shopify policy change hit during setup (documented for the next person)

As of **Jan 1, 2026**, merchants can no longer create legacy custom apps; the
admin pushes the new **Dev Dashboard** flow. Two consequences:

1. The setup checklist's "Develop apps" walkthrough still works ONLY because
   the store is Partner-owned and un-transferred — partners can still create
   legacy custom apps **until the store is transferred to a merchant**.
   → **Create/keep the custom app BEFORE any store transfer.** Existing apps
   and their tokens survive transfer ("this won't impact existing apps").
2. We deliberately stayed on the legacy custom app instead of Dev Dashboard:
   Dev Dashboard apps don't hand out a static token — they use the
   client-credentials grant with tokens that **expire every 24h**, which
   would force a token-refresh layer into `lib/shopify/client.ts` for no
   real gain on a single-storefront site. Don't re-litigate without cause.

## Bug fixed this session (2026-11-07): `Image.alt` → `Image.altText`

First real-data connection surfaced a schema mismatch: every catalog fetch
GraphQL-errored (`Field 'alt' doesn't exist on type 'Image'`), so /shop
degraded to its coming-soon state — exactly the graceful-degradation path
working as designed, which masked the failure until checked via logs.

- Live-schema introspection (2026-10 API): Image fields are
  `altText height id thumbhash url width`. There is no `alt`.
- Fixed: `lib/shopify/queries.ts` (3 selections), `lib/shopify/products.ts`
  (`ShopifyImage` type + `mapCatalogImage`; domain type `CatalogImage`
  unchanged — UI untouched), test fixtures in `products.test.ts`/`cart.test.ts`.
- Lesson (recorded as a correction in `.tmp/context/catalog-feature/bundle.md`):
  **introspect the live store schema before trusting any field claim**, even
  "verified" ones from fetched docs. The client can log the GraphQL error body —
  read the dev-server output first when a page renders its fallback state.

## Pending work (priority order)

1. **Test order end-to-end** — checkout with Shopify Payments test mode /
   Bogus Gateway (`4242 4242 4242 4242` or card `1`), confirm the order
   appears in admin and inventory decrements 6 → 5. In flight as of this doc.
2. **Stale-cart path** — set the `ntv_cart` cookie to a bogus gid, add to
   cart, confirm cart recreation (from old handoff §4, still unverified).
3. **Real catalog entry** — co-owner enters remaining products in Shopify
   admin: variants (color/size) with per-variant CAD prices, tracked stock,
   oversell prevention (checklist Phase 1). Storefront needs no code changes.
4. **Token hygiene before launch** — the token was pasted into a chat session
   on 2026-11-07. Rotate it before launch: uninstall/reinstall the app
   reveals a fresh token (reveal-once), then update `.env.local`.
5. **Launch day** — checklist Phase 2: verify test orders, upgrade to Basic
   plan (~US$29–39/mo), switch Shopify Payments live. Everything built in
   Phase 1 carries over unchanged.
6. **Transition cleanup** (ADR-0001) — remove Amazon CTAs + footer External
   Actions + `amazonUrl` from `landing-data.ts` once Direct sales stabilize.
7. **Doc hygiene (low)** — `README.md`/`CONTEXT.md` still describe the
   pre-commerce landing page; `.opencode/context/project-intelligence/*`
   templates were never filled. `.tmp/` context bundles are local-only.

## Rulings made (don't re-litigate)

- Store password protection is OFF (needed for checkout verification); it
  must also be OFF at launch — the real storefront is the Next.js app.
- Currency is CAD (fixed 2026-11-07); Direct Channel = Canada, ships from
  Canada (GLOSSARY / ADR-0001).
- Legacy custom app retained over Dev Dashboard (see policy section above).
- Single "Default Title" variant is acceptable per-product until the
  co-owner adds real variants — no code dependency on variant structure.

## Key context files

- `docs/handoff-catalog-feature.md` — build state, architecture map, review rulings
- `docs/shopify-setup-checklist.md` — Phase 1/2 plan (⚠️ its custom-app section
  predates the Jan-2026 policy change; see above before following it)
- `GLOSSARY.md`, `docs/adr/0001-headless-shopify-commerce.md`
- `.tmp/context/catalog-feature/bundle.md` — build brief, now carrying the
  `altText` correction note (local-only file, not in git)
