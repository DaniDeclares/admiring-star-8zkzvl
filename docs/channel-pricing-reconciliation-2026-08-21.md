# DANI DECLARES 2026 Channel Pricing Reconciliation Audit

Date: 2026-08-21

## Decision
`src/config/commercialRegistry.js` is the customer-facing commercial authority. `src/data/masterCatalog2026.js` is legacy catalog data and must not be treated as the active pricing authority. `src/data/canonicalPricing2026.js` explicitly describes the master catalog as legacy during reconciliation.

## Locked channel rules
- B2C: public retail price; resident discount only when the canonical record explicitly allows it.
- B2B: commercial/volume/scope pricing; never inherit B2C pricing or resident discounts.
- B2B2C: property/community contract economics are separate from resident-facing perks. Never use the resident retail price as the property contract price.
- B2G: solicitation/SOW/contract pricing; no numeric public retail pricing on government pages.

## Canonical B2C records currently locked in the commercial registry
| Service | Price | Status |
|---|---:|---|
| Resident Refresh 1BR/1BA | $100 | LOCKED |
| Resident Refresh 2BR/2BA | $150 | LOCKED |
| Resident Refresh 3BR/2BA | $250 | LOCKED |
| Resident Refresh 4BR/3BA | $375 | LOCKED |
| Deep Structural Reset 1BR/1BA | $275 | LOCKED |
| Deep Structural Reset 2BR/2BA | $325 | LOCKED |
| Deep Structural Reset 3BR/2BA | $425 | LOCKED |
| Deep Structural Reset 4BR/3BA | $550 | LOCKED |
| Deposit Security Move-Out Turn 1BR/1BA | $330 | LOCKED |
| Deposit Security Move-Out Turn 2BR/2BA | $380 | LOCKED |
| Deposit Security Move-Out Turn 3BR/2BA | $480 | LOCKED |
| Deposit Security Move-Out Turn 4BR/3BA | $605 | LOCKED |
| Wash/Dry/Fold | $45 | LOCKED |
| Linen & Bedding Reset | $35 | LOCKED |
| Closet Optimization — 3 Hour Minimum | $135 | LOCKED |
| Pantry / Kitchen Cabinet Organization Base | $150 | LOCKED |
| Estate Liquidation Baseline | $65 | LOCKED; manual invoice |
| Mobile Loan Signing | $150 | LOCKED |
| Apostille Processing | $175 | LOCKED |
| POA / Healthcare Proxy Witness Base | $35 | LOCKED |
| Emergency Notarization Priority | $95 | LOCKED |
| Family Law / Custody Document Witnessing | $75 | LOCKED |
| Vehicle Title Signing | $50 | LOCKED |
| Safety-Deposit Vault Verification | $125 | LOCKED |
| School / Residency Financial Affidavit | $45 | LOCKED |
| Independent Witness Deployment Service | $50 | LOCKED |
| Executive Home Care Membership 1BR | $280/mo | LOCKED |
| Ultimate Turnkey Household Care 1BR | $520/mo | LOCKED |
| Pampered Pet Household Track 1BR | $245/mo | LOCKED |
| Digital Nomad Account Plan 1BR | $180/mo | LOCKED |
| Business Startup Launch Kit Starter | $79 | LOCKED; no resident discount |
| SmartTap NFC Functional Card | $49 | LOCKED |
| Full Event Planning Coordination | $650 baseline | LOCKED as bespoke/manual invoice; not automatic checkout |
| Exterior Patio / Balcony Holiday Lighting | $450 baseline | LOCKED |

All of the above B2C records are marked resident-discount eligible except the Startup Launch Kit; the discount is 15% when the canonical record permits it.

## Legacy master-catalog records that are WRONG and must not be public price authority
These values are visibly inconsistent with their own `workingBaselineRate` or with the canonical registry:

- `01-ADM` Administrative Execution Support: `startingPrice` says $5/hr while baseline is $45/hr and transaction type is CUSTOM_QUOTE. **WRONG; quote only.**
- `01-DOC` Non-Attorney Doc Prep: `startingPrice` says $5/pkg while baseline is $75/pkg. **WRONG; requires channel-specific reconciliation.**
- `01-NOT` Mobile Notary Public Visit: `startingPrice` says $0 for 3 signatures/20 miles while baseline is $50. **WRONG; replace with canonical notary records.**
- `01-LON` Loan Signing Package: `startingPrice` says $50 while baseline is $150. **WRONG; canonical B2C Mobile Loan Signing is $150.**
- `01-I9V` Remote I-9 Verification: `startingPrice` says $0/visit while baseline is $50. **WRONG; B2B/B2G quote treatment.**
- `01-APO` Expedited Apostille: `startingPrice` says $75 while baseline is $175. **WRONG; canonical B2C Apostille Processing is $175.**
- `02-TO1`: `startingPrice` says $50 while its own legacy pricing block says $250 minimum / $275 base / $375 premium. **WRONG/DEPRECATED; current canonical B2B turn pricing is a separate B2B SKU family.**
- `02-TO2`: `startingPrice` says $50 while baseline is $350. **WRONG/DEPRECATED.**
- `02-TO3`: `startingPrice` says $50 while baseline is $450. **WRONG/DEPRECATED.**
- `02-STR`: `startingPrice` says $25/turn while baseline is $125. **WRONG/DEPRECATED.**
- `02-RES`: `startingPrice` says $0/home while baseline is $200. **WRONG/DEPRECATED; replace with canonical Resident Refresh / Deep Reset / Move-Out records.**
- `02-ELO`: `startingPrice` says $9 local / $50 travel while baseline is $99. **WRONG.**
- `02-WED`: `startingPrice` says $99 while baseline is $199. **WRONG.**
- `04-TAG`: `startingPrice` says $5/5-pack while baseline is $75. **WRONG/needs product pricing reconciliation.**
- `05-STU`: legacy $99 starting price is not the canonical B2C launch-kit price; canonical registry is $79. **WRONG.**

The same issue exists in `src/data/solutionsData.js`: solution bundle comments and base prices are derived from malformed legacy values such as $50 turnover, $5 admin hour, $99 officiant, $0 cleaning and $0 notary. **Those bundle totals must be removed from checkout/pricing authority and recalculated only from canonical service records.**

## B2B: what is locked vs unresolved
The previously established DANI DECLARES B2B commercial sheet remains the intended public commercial structure:
- Standard 1–2BR Unit Turn: $350/unit
- Deep Move-In / Reset: $450/unit
- Minimum Maintenance Dispatch: $85
- Commercial Handyman: $55/hr
- Materials sourcing: cost + 10%
- Property Support Retainer: $1,500/month
- Resident Experience Program: $3,250/month
- Operations Partner: $4,500/month
- Real Estate Listing / Physical Support: $55/hr
- Open-House Setup & Takedown: $300/event
- Listing & Transaction Support: $1,200/month
- Office Operations: $2,500/month

These are **commercial channel rates**, not B2C retail prices and not resident discounts.

The newer registry's B2B turn records (`B2B-TURN-ROUGH` $450, `B2B-TURN-FINAL` $650, `B2B-TURN-DETAIL` $1,200) are **NOT to be treated as locked replacements** for the established B2B sheet until the service definitions are explicitly mapped. They currently represent a different three-tier turn taxonomy and therefore require reconciliation rather than silent substitution.

B2B enterprise package ranges are also explicitly PROPOSED/CUSTOM and must not become automatic checkout prices: Portfolio Operations $5,000–$10,000/month; Real Estate Executive $5,000/month; Volume Deep Turn $4,000–$8,500+ custom; Facility Support $3,500–$7,500/month + materials.

## B2B2C / Community
No single B2C retail price may be copied into the property/community contract.

The correct model is:
1. property/community agreement has its own B2B2C contract economics;
2. resident perks are a separate benefit layer;
3. eligible resident-facing services can use canonical B2C prices/discounts only when explicitly configured.

Therefore any matrix code that sets a B2B2C `amount` directly from the master catalog's `workingBaselineRate` is **WRONG** and must be replaced with a resident-perk reference plus separate contract pricing.

## B2G / Government
Government public pages must not show retail numeric prices. Government records should use:
- Contract / Solicitation Pricing
- SOW / Task Order
- RFQ / RFP response
- Negotiated contract line-item pricing where the solicitation establishes it

The current B2G classifications are `561720/S201` custodial/janitorial and `561210` facilities support. The government channel is procurement-only and has no consumer Stripe checkout price.

## REMOVE / DEPRECATE from customer-facing pricing authority
- Numeric `startingPrice` fields from legacy `masterCatalog2026.js` when they conflict with canonical records.
- Legacy solution bundle totals derived from malformed legacy prices.
- Legacy generic IDs (`01-NOT`, `01-LON`, `01-APO`, etc.) from direct checkout when a canonical registry SKU exists; they may remain as aliases only if the resolver maps them to the canonical SKU.
- Any B2B2C price derived from a B2C `workingBaselineRate` without an explicit resident-perk record.
- Any numeric government pricing from public pages.

## MISSING / NEEDS LOCK
- Canonical B2B mappings for every legacy property/real-estate service ID.
- Explicit B2B2C contract-price records separate from resident perks.
- Canonical pricing for remaining administrative/document/I-9 services where the current registry has no active B2C record.
- Exact modifiers for B2B additional bedrooms/bathrooms, excess debris, special handling, heavy soil and pet mess; these are currently undefined except the locked $85 second-trip and $85 access-wait rules.
- Canonical government CLIN/Schedule pricing, which should remain solicitation-specific.

## Implementation gate
No public price should be rendered from `masterCatalog2026.js` unless a canonical commercial-registry record authorizes it. The registry is the source of truth for customer-facing price, channel, discount eligibility, Stripe mode and provider isolation.
