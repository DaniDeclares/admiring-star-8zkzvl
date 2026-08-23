# DANI DECLARES LLC — FULL CATALOG AUDIT

**Date:** 2026-08-23
**Status:** CATALOG AUDIT COMPLETE — SKU RECONCILIATION BLOCKED UNTIL CATALOG AUTHORITY IS CLEAN
**Governing Authority:** Master Operating Architecture Authority v1.0

## Executive Finding

The repository does **not** currently contain one clean, authoritative service catalog. It contains multiple historical catalog generations, commercial registries, solution bundles, channel matrices, service data, and documentation that overlap or contradict the current 13-division / 6-channel / 7-market architecture.

The correct action is **not** to choose the newest catalog and continue to SKUs. The catalog universe must first be separated into:

1. governing architecture;
2. canonical capability universe;
3. reconciled commercial objects;
4. quarantined historical evidence; and
5. runtime presentation/checkout data that consumes only canonical records.

## Audit Scope

Audited repository artifacts include:

- `README.md`
- `docs/dani-declares-master-service-catalog.md`
- `docs/DANI_DECLARES_COMMERCIAL_MASTER_2026.md`
- `docs/channel-pricing-reconciliation-2026-08-21.md`
- `docs/master-commercial-activation.md`
- `docs/legacy-pricing-quarantine-2026-08-23.md`
- `src/data/masterCatalog2026.js`
- `src/data/services.js`
- `src/data/canonicalPricing2026.js`
- `src/data/channelPricingMatrix2026.js`
- `src/config/commercialRegistry.js`
- `src/data/solutionsData.js`
- related pricing, Stripe, proposal, travel, and Supabase seed references discovered through repository search.

## Major Findings

### 1. The old Master Service Catalog is structurally obsolete

`docs/dani-declares-master-service-catalog.md` uses an older 10-division model with prefixes such as `PO`, `AS`, `ND`, `EV`, `BP`, `BS`, `CS`, `LG`, `RS`, and `OC`.

This conflicts with the current 13-division architecture and must be treated as **historical evidence**, not master authority.

It also contains a very large task/service inventory. Those entries must not be converted directly into SKUs. They must first pass Capability → Service Family → Service → Task → Commercial Object reconciliation.

### 2. The old Commercial Master contains useful evidence but is not current catalog authority

`docs/DANI_DECLARES_COMMERCIAL_MASTER_2026.md` contains historical/current-generation pricing and channel structures, including B2C, B2B, B2B2C, and B2G models. It also explicitly contains conflicting generations and unresolved taxonomies.

Therefore it is a reconciliation source, not a final catalog.

### 3. Runtime pricing is correctly fail-closed, but the catalog itself is not rebuilt yet

`src/data/masterCatalog2026.js`, `src/config/commercialRegistry.js`, `src/data/canonicalPricing2026.js`, and `src/data/channelPricingMatrix2026.js` have been reduced to quarantine/gate behavior rather than executable numeric pricing. This is correct as a safety state, but it means there is intentionally no replacement canonical catalog yet.

### 4. `src/data/services.js` still contains a legacy presentation catalog

It contains notary, loan signing, apostille, officiant, courier/field support, facility visits, school/family documentation, I-9/admin support, and other public service records. It also contains a legacy `travelFeeDefaults` object.

Even though its pricing functions now fail closed, these service definitions can still act as an implicit catalog authority. They must eventually be replaced by records derived from the canonical catalog registry.

### 5. `src/data/solutionsData.js` contains legacy priced solution bundles

This is a significant catalog contamination point. It contains solution records with `basePrice` values and obsolete component IDs. These are package/solution objects that bypass the current reconciliation hierarchy.

They must remain quarantined and must not be used to reconstruct pricing or package eligibility.

### 6. Channel architecture is inconsistent across generations

The current architecture is:

- CH01 — Property Residents
- CH02 — Direct / Regular Residents
- CH03 — Property Management
- CH04 — Real Estate
- CH05 — Business / Commercial
- CH06 — Government / Institutional

Older runtime artifacts use B2C/B2B/B2B2C/B2G. Those are commercial model classifications, not substitutes for CH01–CH06.

The runtime must eventually represent both dimensions separately.

### 7. Market architecture must remain separate from travel pricing

The seven core markets are Jonesboro, Tucker, Stone Mountain, Chamblee, Brookhaven, Midtown, and Buckhead.

The old mileage/per-mile/travel-surcharge model is not authoritative. Market modifiers must be applied only through the current commercial architecture after service-level reconciliation.

### 8. Packages, memberships, retainers, events, products, digital goods, kits, and work orders are different commercial objects

The audit confirms that the repository historically mixed:

- services;
- tasks;
- packages;
- recurring plans;
- memberships;
- retainers;
- events;
- physical products;
- digital products;
- kits;
- work orders; and
- solution bundles.

These must not be flattened into one SKU list.

### 9. Provider identities are not catalog categories

Cayla, Chris, Cass, NAWFside, DANI, and external specialists are fulfillment resources. Their presence in historical catalog records does not establish service ownership or division ownership.

Provider routing must occur after commercial object reconciliation.

### 10. Historical numeric prices remain evidence only

The repository contains multiple generations of customer prices, starting prices, baseline rates, package values, travel charges, retainer values, provider economics, and obsolete placeholder amounts. The existing quarantine document correctly identifies these as historical evidence.

No historical numeric value may be reactivated simply because it appears in a catalog document.

## Catalog Objects That Must Be Reconciled Before SKU Work

The canonical catalog must be capable of representing at least:

- `SERV` — Service
- `PROD` — Physical Product
- `DIGITAL` — Digital Product/Service
- `KIT` — Kit / Bundle
- `RET` — Retainer
- `EVENT` — Event / Experience
- `WORK-ORDER` — Operational Work Order

And it must preserve the distinction between:

**Capability → Service Family → Service → Task → Commercial Object → SKU**

## Division Coverage Requirement

Before SKU creation resumes, the catalog universe must be swept across all 13 divisions:

1. Home, Pet, Plant & Household Support
2. Property, Facilities & Field Operations
3. Real Estate & Closing Support
4. Administrative & Business Operations
5. Notary & Document Services
6. Business Formation & Digital Infrastructure
7. Marketing, Content & Media Production
8. Business Development & Growth
9. Classes, Workshops & Training
10. Experiences & Resident Programming
11. Creative Design & Production
12. Logistics, Courier & Asset Sourcing
13. Government & Institutional Procurement

Division 13 is primarily a contracting/procurement wrapper and does not automatically duplicate every underlying Division 01–12 service.

## Cross-Division Catalog Rules

- Computer repair/support remains a technical capability even when Chris fulfills it.
- Event planning remains an event/experience capability even when DANI fulfills it.
- DTF/heat-press/custom apparel belongs in creative production.
- Property media/video belongs in marketing/media.
- Plant care remains a botanical capability even when Cayla fulfills it.
- Bookkeeping/financial administrative work belongs in the appropriate administrative/business capability only to the extent actually qualified and scoped.
- Notary services remain notary/document capabilities even when used in a real-estate transaction.
- Cleaning used inside a property turn is a dependency/application of the cleaning capability, not an excuse to create an uncontrolled duplicate SKU.
- Logistics may support another service without becoming the service itself.

## Catalog Gate Decision

**SKU creation is BLOCKED.**

The next phase is **Catalog Authority Reconciliation**, not SKU generation.

### Required sequence

1. Inventory every historical catalog/service/product/package/event/kit/retainer object.
2. Classify each object by commercial object type.
3. Map each object to the 13-division architecture.
4. Map Capability → Service Family → Service → Task.
5. Identify duplicates, absorbed families, and cross-division dependencies.
6. Preserve every legacy ID and source reference.
7. Assign lifecycle state: `CANONICAL_ACTIVE`, `ABSORBED_REDIRECTED`, `DEPRECATED_HISTORICAL`, or `PENDING_RECONCILIATION`.
8. Identify whether each object is commercially eligible, quote-only, contract-only, unavailable, or still pending.
9. Only after this is complete, begin the 47-point reconciliation at the service/SKU level.

## Non-Override Rules

No catalog document, old spreadsheet, website page, Stripe product, provider rate, package total, travel calculator, or AI-generated service list may override the Master Operating Architecture.

No provider can determine a division.

No channel can determine a delivery model.

No delivery model can determine a SKU.

No historical price can become current pricing without explicit reconciliation and promotion.

No SKU may be considered canonical merely because it has a price.

## Audit Conclusion

The company was right to stop before continuing SKU work.

The repository now has a safe **architecture and quarantine layer**, but it does not yet have the fully reconciled company-wide catalog required to serve as the source for the future SKU registry.

**Next authoritative task: complete the company-wide catalog reconciliation before returning to SKU construction.**
