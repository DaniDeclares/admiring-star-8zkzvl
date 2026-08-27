# DANI DECLARES LLC — NATIONAL PRICING ARCHITECTURE

**Effective:** 2026-08-27  
**Status:** GOVERNING DESIGN / IMPLEMENTED IN CODE

## 1. Core rule

A SKU is universal. Geography is a pricing dimension. Customer/channel is a pricing dimension. Neither geography nor fulfillment capability creates a new official commercial channel.

**Resolution:** SKU → Channel → Market → Scope/Condition → Cost/Modifiers → Customer Price.

## 2. Canonical five channels

1. CH01 — Resident Concierge
2. CH02 — Property Management & Apartments
3. CH03 — Real Estate Offices & Brokerages
4. CH04 — Businesses
5. CH05 — Government & Institutional Procurement

B2C, B2B, B2B2C and B2G are commercial/economic models, not channels.

## 3. SKU architecture

Each active SKU must define service identity, division/family, pricing unit, base economics, channel eligibility, scope, fulfillment requirements, compliance status, provider-cost model, margin guard and pricing status.

Historical/legacy numeric prices are provenance only unless explicitly reconciled and approved.

## 4. Market architecture

The seven initial Georgia markets remain calibration anchors. The national engine is designed to accept any US ZIP/market profile.

A market profile contains ZIP, city, county, state, metro, market tier, labor factor, demand factor, competition factor, travel factor, parking/access factors, cost-of-living factor, provider-capacity factor, regulatory profile, effective date and research status.

## 5. Price components

- Base SKU economics
- Market adjustment
- Channel economics
- Scope/size/complexity
- Travel/dispatch
- Condition/severity
- Rush/emergency
- Materials/pass-throughs
- Access/parking/special equipment
- Channel-specific discount or contract rules
- Tax/government/statutory charges

Provider fulfillment cost remains separate from customer price.

## 6. Existing rules retained

- Georgia is the current commercial operating jurisdiction.
- First 15 miles are included from the applicable dispatch origin.
- Excess travel is $2.50 per one-way mile unless an approved service rule supersedes it.
- B2B physical-plant minimum dispatch is $85.
- Non-labor materials carry a 10% sourcing markup.
- 24-hour/emergency turnaround carries +25% where applicable.
- Resident Concierge discount is 15% only on qualifying services; exclusions remain governed by the SKU/commercial record.

## 7. Worker / capability network integration

Provider cost, availability, capacity, geography, credentials, insurance and authorized SKU capability are inputs to fulfillment economics and routing. A worker/provider does not receive guaranteed work merely by being verified or authorized.

## 8. Required production layers still to complete

1. Canonical SKU registry must be reconciled across every Division.
2. Every active SKU needs approved base economics and fulfillment-cost assumptions.
3. Build the national ZIP/market profile dataset and source/provenance fields.
4. Calibrate the seven existing Georgia anchor markets against current competitive evidence.
5. Create channel-specific price rules/overrides where needed.
6. Add tax/pass-through treatment by jurisdiction before non-Georgia commerce.
7. Connect the pricing resolver to customer quote/checkout paths.
8. Add provider payout/commission logic separately from customer price.
9. Add margin-floor validation and approval workflow.
10. Add audit history/effective dating so price changes are traceable.
11. Add automated tests for scope, travel, discounts, rush, minimums and market resolution.
12. Validate the complete customer → quote → payment → job → provider → completion → settlement lifecycle.

## 9. What is intentionally NOT done

No blanket national prices are being fabricated. No state/local regulated service is being activated without jurisdiction-specific compliance. No new official channels are created for geographic markets, workers, partners, event types, or service specialties.
