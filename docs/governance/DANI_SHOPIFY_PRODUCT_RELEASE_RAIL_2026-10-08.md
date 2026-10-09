# DANI Shopify product release rail (v1)

Owner decision 2026-10-08: product media for existing Shopify products is released through a reusable,
server-side rail instead of manual uploads.

## Authority
- DANI owns product identity, approved pricing, deliverables and release authorization.
- Shopify owns storefront catalog state, checkout and order capture.
- Connection: Shopify Dev Dashboard app **DANI Product Release** (org "My Store 2"), scopes `write_products`, `write_files` only.
  No order, customer, payment or publication scopes. Every media-release run first re-checks the granted scopes and the shop
  (`ensureShopifyConnection` in `api-handlers/_shopifyAdmin.js`) and fails closed (409) on any extra scope or a different shop.
- Credentials: Vercel Production env `SHOPIFY_CLIENT_ID`, `SHOPIFY_CLIENT_SECRET` (Sensitive). Optional `SHOPIFY_SHOP` (default `v0dqbe-j1`).
  Client-credentials tokens (24h) are requested per run and never stored. If the store is not eligible for client credentials,
  the authorization-code fallback stores the token encrypted in `dd_integration_connections` (requires `INTEGRATION_TOKEN_ENCRYPTION_KEY`).
- Registry: adapter `SHOPIFY` in `dd_integration_adapters`; connection row in `dd_integration_connections`; every attach/retire is
  evidence in `dd_integration_event_log`. No parallel registry, queue or planner.

## How a release works
1. Put the images and a `manifest.json` in the private bucket `dd-product-release-assets/<release_key>/`.
2. The manifest maps each EXISTING Shopify product (id + expected title) to its images, in order (position 1 = main image),
   with alt text and SHA-256. Validation: `src/lib/shopifyMediaRelease.js`.
3. Run `plan` (read-only) from Owner HQ / API, then `attach`. The daily cron (13:30 UTC) runs `sync` for releases with
   `"status": "READY"`: it attaches missing images and puts them first.
4. Old images are detached (not deleted; the file stays in Shopify Files) only when every release image on that product is
   `READY`, and only with `confirm: true` or a manifest that sets `"retire_replaced_media": true`.

## Relationship to other Shopify work on main
- #599 `shopify-release-auth`: credential smoke (reused, not duplicated).
- #602 recovery scripts / revenue-readiness watch: read-only catalog reconciliation and draft-eligibility gates for
  recovered products. This rail only handles media on products that already exist; it does not create drafts.

## What the rail never does
Create products, publish, change price/SKU/inventory/fulfillment/sales channels, or touch digital-download attachments.
A product whose live title differs from `expected_title` is blocked, not guessed.

## API
- `GET /api/integrations/shopify-release-auth` (owner, merged in #599) — read-only credential smoke. Use it first after
  credentials are added; this rail does not duplicate it.
- `POST /api/integrations/shopify/media-release` (staff) — body `{ "release_key": "...", "mode": "plan|attach|retire", "product_id": "optional", "confirm": false }`.
- `GET /api/integrations/shopify/media-release` (Vercel cron, `CRON_SECRET`) — `sync` over READY releases.
