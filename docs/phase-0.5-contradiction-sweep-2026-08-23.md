# DANI DECLARES LLC — Phase 0.5 Repository-Wide Contradiction Sweep

**Date:** August 23, 2026  
**Authority:** Master Operating Architecture Authority v1.0  
**Status:** ACTIVE CLEANOUT

## Purpose

This audit verifies that the Company-Wide Catalog Master is the only active commercial/catalog authority while historical generations remain preserved as evidence.

## Canonical rules enforced

- 13 organizational divisions.
- CH01–CH06 customer channels.
- Seven core markets.
- Capability → Service Family → Capability → Service → Task → Commercial Object → SKU.
- Customer pricing is independent from fulfillment/provider economics.
- Commercial ownership is independent from fulfillment ownership.
- Historical prices are evidence only.
- Unresolved records are `PENDING_RECONCILIATION`.
- Legacy mileage/per-mile pricing is disabled.
- No new SKU creation occurs before reconciliation.

## Repository actions completed

1. Legacy runtime service/catalog layers were gated behind the Phase 0 catalog.
2. Resident Concierge public runtime uses the safe catalog presentation rather than the legacy numeric catalog.
3. Events page no longer publishes legacy officiant/event prices and routes event planning through governed intake.
4. Membership/retainer page no longer publishes legacy B2B retainer numbers.
5. Legacy retainer data is now an empty runtime gate.
6. Legacy recurring subscription checkout now fails closed with `CATALOG_RECONCILIATION_REQUIRED`.
7. Legacy travel quote/API presentation was previously disabled and routed to governed service-area/intake treatment.
8. Supabase seed logic was previously changed to avoid importing legacy solution bundles/prices.

## Supabase findings

The live Supabase project still contains historical commercial records in operational tables. These are now quarantined at the data layer:

- `public.services`: 17 historical service rows; 10 contained numeric starting prices before quarantine.
- `public.dd_service_packages`: 40 rows; all contained numeric package pricing before quarantine.
- `public.dd_service_addons`: 28 rows; 26 contained numeric pricing before quarantine.
- `public.fieldops_packages`: 7 rows; all contained numeric pricing before quarantine.
- `public.fieldops_addons`: 23 rows; all contained numeric pricing before quarantine.

The Phase 0.5 migration cleared those legacy customer-price fields, marked legacy commercial records inactive/non-public, and added the catalog-governance record.

Legacy travel calculation tables remain as historical/operational evidence, but new inserts/updates are blocked by a database trigger. Existing estimate/invoice records are preserved as transaction history.

## Stripe findings

Stripe is an execution system, not commercial authority. Live mode contains active products/payment links including current event and customer-specific transaction artifacts. These must **not** be treated as catalog truth.

Observed active products include customer-specific wedding balances/retainers, event deposits/packages, property-reset deposits, courier support, administrative support, and compliance-file setup. Because some are legitimate transaction artifacts, they were not blindly deleted or deactivated.

Required Stripe rule:

> A Stripe product, price, payment link, invoice, or historical amount is not a canonical commercial object unless explicitly reconciled and promoted into the DANI DECLARES catalog.

Any legacy public payment link discovered without an approved current catalog mapping must be deactivated during the Stripe reconciliation phase rather than reused.

## Vercel findings

The connected Vercel project is `admiring-star-8zkzvl-dhnz` and is linked to the GitHub repository `DaniDeclares/admiring-star-8zkzvl`. The current production build completed successfully after the cleanout commits. Build logs reported only the existing ESM-to-CommonJS warning and a successful build completion.

## Remaining audit targets

- Complete repository code search for any remaining public hardcoded prices.
- Reconcile all Stripe products, prices, payment links and subscription artifacts against the catalog.
- Audit all Supabase Edge Functions and private functions for catalog/pricing reads.
- Audit intake validation for CH01–CH06 and Division 01–13 identity.
- Audit every route/page that can initiate checkout or create a work order.
- Build the Conflict Register and legacy-ID crosswalk before SKU creation.

## Gate

**SKU CREATION REMAINS BLOCKED.**

The next authoritative step is the full service-level reconciliation against the 47-point vector, followed by commercialization, pricing, fulfillment routing, and operationalization.
