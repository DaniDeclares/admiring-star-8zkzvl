# DANI DECLARES LLC — Website Visual System 2026

## Purpose

This document is the visual source-of-truth for the public website. It separates brand presentation from internal provider, finance, and operating information.

## Canonical brand direction

- Deep Burgundy: `#6B1F2B`
- Deep Burgundy: `#45141D`
- Metallic Gold: `#C9A45C`
- Soft Gold: `#E5D2A5`
- Warm Ivory: `#F6F0E4`
- Cream: `#FBF8F1`
- Ink: `#24151A`
- Serif display: Playfair Display / Cormorant Garamond / Georgia
- Sans UI: DM Sans / system sans

The global CSS tokens live in `src/index.css`. Components should consume those tokens instead of defining competing palettes.

## Photography rules

### Public imagery may show

- polished residential/property environments
- professional business/document environments
- event production and hospitality
- premium print/merchandise
- concierge/logistics scenes
- government/institutional environments where the image does not imply an endorsement or contract
- DANI DECLARES-owned work and equipment when available

### Public imagery must not reveal

- provider payout economics
- internal job boards
- private client/property information
- internal dashboards or portal records
- bank/financial documents
- private provider agreements
- confidential partner information

## Current image registry

The application already has a centralized `IMAGE_ASSETS_2026` registry and a `serviceVisuals2026.js` presentation bridge. Continue using those rather than adding ad-hoc image URLs to page components.

Current categories include:

- `public`
- `weddings`
- `stock`
- `products`

The existing registry includes operational stock imagery for notary, government paperwork, offices, courts, hospitals and similar contexts, plus a large wedding/event library and product photography.

## Division image mapping

| Public division | Current image source | Direction |
|---|---|---|
| Business Solutions | stock | Keep professional/documentary; replace generic stock with owned work when available |
| Print & Merch Studio | products | Prioritize actual DANI DECLARES products |
| Property Operations | stock/products | Needs dedicated property/turnover photography |
| Festivals & Large Events | weddings/event imagery | Needs broader event-production imagery beyond weddings |
| Concierge & Courier | stock | Needs real logistics/concierge imagery |
| Express & Marketplace | products | Prioritize clean product photography |
| Weddings | weddings | Keep as a dedicated editorial visual system |
| Government | institutional stock | Avoid imagery implying government endorsement |

## Homepage treatment

The homepage now has a dedicated `.dd-homepage` scope so the existing Tailwind page structure can inherit the canonical burgundy/gold/ivory brand system without changing the functional component architecture.

The service cards already consume the centralized visual bridge through `getPrimaryServiceImage()`.

## Image replacement queue

1. Replace generic property stock with DANI DECLARES property-reset/turnover photography.
2. Add real event-production imagery: load-in, vendor coordination, signage, staging, check-in and closeout.
3. Add authentic concierge/logistics imagery: document handoff, key logistics, executive support and field documentation.
4. Add real print/merch product photography.
5. Add a small set of owner-approved founder/company images if desired.
6. Compress and resize production images for their actual display dimensions; do not ship multi-megabyte originals when a smaller derivative will do.
7. Preserve meaningful `alt` text and avoid decorative-image descriptions that imply services not actually offered.

## Acceptance standard

A page is visually complete when:

- it uses the canonical palette/tokens;
- typography is consistent with the brand system;
- mobile layout has no horizontal overflow;
- buttons/forms have visible focus states;
- hero/card imagery has deliberate aspect ratios and crops;
- no internal provider/finance information appears;
- images support the page's actual service rather than generic filler;
- no image is used to imply a government contract, client relationship, certification or past performance that DANI DECLARES cannot substantiate.
