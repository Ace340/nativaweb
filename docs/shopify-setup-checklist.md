# Shopify Setup Checklist (deferred)

Setup was deliberately deferred so the storefront code can be built first against
environment variables. Work through this when ready to connect real data.
The subscription is a launch-day switch, not a prerequisite — see ADR-0001.

## 1. Free build phase (no subscription)

- [ ] Create a free Shopify **Partner account** at partners.shopify.com
- [ ] Create a **development store** (free) under the Partner account
- [ ] Set store currency to **CAD**, primary market **Canada**
- [ ] Configure the **shipping profile**: ships from Canada, Canadian domestic rates
      (replace the retired "Amazon Prime 48-hour" messaging with ships-from-Canada copy)
- [ ] Enter real products: each Product with its Variants (color/size),
      price per Variant, and tracked Stock Level (quantity, oversell prevention)
      — co-owner can do this in Shopify admin, no developer needed
- [ ] Create a **custom app** on the dev store and generate a
      **Storefront API access token** (Storefront API scope)
- [ ] Put credentials in `.env.local` (names documented in the repo's env example):
      store domain + storefront access token
- [ ] Run the storefront against the dev store; place **test orders**
      (Shopify Payments test mode) end-to-end: catalog → cart → checkout

## 2. Launch phase (this is when we pay)

- [ ] Verify test orders, inventory decrement, and order admin flow
- [ ] Upgrade the store to the **Basic plan** (~US$29–39/mo) — everything
      built in phase 1 carries over unchanged
- [ ] Switch Shopify Payments from test to live
- [ ] Amazon Channel coexists during the Transition; remove Amazon links
      once Direct sales are stable (per ADR-0001)

## Notes

- Development stores cannot process real money or serve public live traffic
  until upgraded — fine for building, wrong for selling.
- Terms follow GLOSSARY.md: Product, Variant, Stock Level, Direct Channel,
  Amazon Channel, Transition.
