# DANI DECLARES LLC — Master Brand Kit, v1.0
**Owner reference:** Home Command Center image, 2026-10-10. **Status:** Prepared brand standard / changes pending PR merge and release approval.

## Identity
- Legal name: **DANI DECLARES LLC**; public-facing brand: **DANI DECLARES**.
- Primary tagline: **WE HANDLE THE EXECUTION.**
- Existing secondary line: **CONSIDER IT HANDLED.**
- Position: Multi-service operations and execution company; do not reduce brand identity to residential cleaning.
- Personality: organized, resourceful, capable, practical, trustworthy, warm and confident.
- Short description: DANI DECLARES supports households, property teams, real estate professionals and businesses through coordinated services, administrative support and field execution.
- Messaging: Lead with the desired outcome and the next action; explain governed scope and coordination. Avoid inflated promises, unsupported credentials, false delivery availability, and laundry lists of unrelated services.

## Canonical color tokens — source: src/index.css
| Brand use | CSS variable | Hex |
|---|---|---|
| Burgundy, primary identity | --dd-burgundy | #800020 |
| Dark burgundy, hover | --dd-burgundy-deep | #69001A |
| Warm ivory, surfaces | --dd-ivory | #F7F1E6 |
| Paper white, cards | --dd-cream | #FFFDF6 |
| Antique gold, accent | --dd-gold | #B38A2D |
| Soft gold, borders | --dd-gold-soft | #E8D5B0 |

Use shared vars in new UI; `src/styles/tokens.css` and `src/data/brandKit.js` must mirror the values. PR #633 includes a build-time token check. Functional status colors remain semantic and accessible.

## Logo: existing asset, no invented replacement
- Current public Navbar/Footer source: `/logo-script.png`; preserve existing mark until originals and approved variants are audited.
- Needed approved variants: full, reverse, one-color, small-format only if verified. **Not yet validated as official distinct asset files**.
- Preserve aspect ratio, legibility, clear space and contrast. Do not redraw from typography examples.

## Type and layout
- Website display stack: Playfair Display / Cormorant Garamond / Georgia, serif.
- Website body stack: DM Sans / system sans.
- Maintain legible print and web body text, clear focus states, readable headings and two-family restraint.
- Reference style: rich burgundy, ivory/off-white paper, fine antique-gold rules, editorial spacing, deliberate hierarchy.

## Company structure and channel handling
- Master brand spans CH01 residents (property-activated/direct), CH03 property management, CH04 real estate, CH05 businesses; procurement readiness is separately governed, **not a new channel**.
- House Manager / Home Operations are product and service names under DANI, not separate corporations.
- Shadow & Sol is a separate entity and brand. No identity or financial commingling.

## Approved format specifications
1. **Social:** burgundy hero/hook, ivory structure, gold detail, short spaced paragraphs, single clear CTA. Preserve distinct Build With Dani, Let Dani Build You, 3-service/3-product offer, and Operation $1 Million Dollar Company series.
2. **Flyer:** audience problem, result, genuine company logo, scoped service, clear CTA; verify URL/QR and claims.
3. **Proposal/quote:** logo, buyer need, scope, exclusions, dates, approved rate and terms, next step; use governed commercial source.
4. **Provider:** branded and accessible onboarding, clear evidence and approval state; no implication application equals dispatch eligibility.
5. **Digital/print product:** burgundy cover option, ivory pages, fine gold rules, consistent titles and writing areas, brand footer/version. Sale requires catalog/economics approval and verified Shopify payment + protected delivery.
6. **Website/portal:** reuse CSS custom properties, central media manifest and visual bridge, mobile and keyboard test, protect private data and accessibility.
7. **Email/outreach:** same concise voice, verified claims, explicit opt-out/permission controls when applicable; do not auto-send without authorization.

## Photography and creative rules
Prefer authentic images of administrative operations, property, real estate, events, products, logistics and actual DANI work. No fake customer outcomes, misleading government affiliations, private addresses/records, staged fabricated endorsements or generic AI-generated clutter. Media comes through existing DANI registry; confirm rights to publish.

## Release and approval
- Owner Home Command Center reference is visual authority; this document and `docs/design/DANI_CANONICAL_BRAND_PALETTE.md` are implementation guidance.
- PR #633 establishes shared tokens/metadata/agent rule; PR #631 and #632 must consume those tokens, be visually verified and merged through ordinary gates.
- Do not assume legacy hard-coded colors or printed materials are already migrated.
- Pending: validate original logo/vector rights and variants; approve typography/licensing; review production templates, accessible contrast, all downstream layouts, print and media.
- Any brand change must update global CSS, metadata/legacy alias, automated check, both design documents and affected templates together.

**Portable deliverable:** User-facing 11-page PDF `DANI_DECLARES_Master_Brand_Kit_2026.pdf` and editable `DANI_DECLARES_Master_Brand_Kit_2026.md` have been generated in the conversation workspace. They are not automatically versioned inside this repository.
