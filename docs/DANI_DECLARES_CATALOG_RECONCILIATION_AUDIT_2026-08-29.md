# DANI DECLARES — CATALOG RECONCILIATION AUDIT
**Date:** 2026-08-29  
**Authority:** Danielle Fong, Owner/Managing Director  
**Audit type:** Live Supabase + repository reconciliation  
**Status:** Open; no legacy commercial values promoted

## Purpose

Reconcile the current database catalog against the locked five-channel commercial architecture and prevent database rows, historical pricing, or channel records from becoming sellable merely because they exist.

## Verified live findings

- `public.divisions`: 13 divisions.
- `public.services`: 284 service rows.
- All 284 `public.services` rows currently report `commercial_status = CANONICAL_ACTIVE`. This is a data-governance finding, **not evidence that all 284 are sellable**.
- `public.dd_master_service_universe`: 300 records. All 300 currently report `lifecycle_status = CANONICAL_ACTIVE`. This is a reconciliation finding requiring horizontal review against the 47-point schema.
- `public.dd_service_channel_availability`: 220 rows across CH01–CH05, with a mixture of `ACTIVE`, `ELIGIBLE`, `PENDING`, `QUOTE_REQUIRED`, and `INACTIVE` states.
- `public.dd_service_pricing_rules`: 1,233 pricing-rule rows.
- `public.dd_service_market_pricing_rules`: 8,575 market/channel pricing rows.
- `public.dd_market_service_commercial_rules`: 1,848 market commercial-rule rows; 189 currently report `availability_status = AVAILABLE`.
- `public.dd_geographic_service_compliance`: 273 geographic/service compliance rows.
- `public.dd_provider_organizations`: 46 provider organizations.
- Current provider capability/qualification data does not establish broad fully-qualified provider coverage. Provider-routed work must remain fail-closed until documentary, permission, qualification, territory, insurance, agreement, capability, and rate gates are actually verified.

## Authority interpretation

The database contains a much larger **capability/service universe** than the five immediately sellable D01 launch offers. The existence of a row, a price, a channel-availability row, or a legacy SKU does not independently activate an offer.

The public application currently uses the repository commercial registry as its immediate checkout authority. That registry intentionally exposes only the five owner-approved D01 launch offers for direct online payment:

- `DNI-01A-009` — Bin Sanitation — starting at $59
- `DNI-01A-010` — Odor Neutralization — starting at $99
- `DNI-01C-001` — Indoor Plant Care — starting at $149/month
- `DNI-01D-002` — Home Watch / Household Absence Check — starting at $65/visit; basic recurring offer $149/month
- `DNI-01D-004` — Event / Party Home Preparation & Reset — starting at $175

## Required reconciliation

The following must be completed before broad publication:

1. Reconcile all 284 service rows to the 47-point commercial/operational vector.
2. Reconcile all 300 master-universe records to canonical service identity, lifecycle, source authority, and conflict state.
3. Separate `CANONICAL_ACTIVE` database identity from **commercial activation**. A service may remain canonical in the master universe while being `INTAKE / QUOTE`, `FULFILLMENT_GATED`, or `DO_NOT_SELL` commercially.
4. Reconcile every service against CH01-A, CH01-B, CH02, CH03, CH04, and CH05 independently.
5. Reconcile market rules to actual authorized state/market scope; no future state becomes active by data presence.
6. Market-benchmark existing services and commercial variants, recording source/date, scope, benchmark range, DANI price, confidence, and economics evidence.
7. Map services to actual fulfillment capacity. Cass, Cayla, Chris, Renee, NAWFside, and external specialists remain fulfillment resources; their public retail prices are never treated as provider payout authority.
8. Complete service-specific compliance and qualification review where required.
9. Only then promote commercial variants/SKUs to public checkout.

## Immediate safety conclusion

Do not bulk-publish the 284 or 300 records. The current public checkout should remain limited to explicitly activated offers until horizontal reconciliation is complete.

The correct expansion model remains:

**Capability × Channel × Buyer × Use Case × Variant × Package × Add-On × Recurring × Fulfillment**

The goal is a larger commercial offer universe without duplicating the underlying canonical service identity or bypassing fulfillment/compliance gates.

## Related controls

- `README.md` — current master operating authority
- `docs/DANI_DECLARES_CURRENT_CONTROL_POINT_2026-08-29.md` — current company-wide control point
- `src/config/commercialRegistry.js` — application checkout authority

## Audit result

**Commercial runtime:** protected / fail-closed.  
**Catalog identity:** large and populated.  
**Commercial reconciliation:** incomplete.  
**Provider coverage:** incomplete for broad automated routing.  
**Next work:** horizontal service × buyer × channel × location × pricing × fulfillment reconciliation, followed by controlled publication.
