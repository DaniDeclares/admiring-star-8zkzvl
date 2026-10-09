# DANI business-building / AI-offer recovery — 2026-10-09

Status: **history-first audit, not release authorization**. Production read-only. Do not introduce a new Build Lab product, database, queue, agent or course platform without evidence that the existing capabilities cannot be extended.

## Recovered code authority

| Existing asset | Source | Recovered behavior / disposition |
|---|---|---|
| Build With Me participation | `src/pages/PartnerNetwork.jsx`, `src/lib/buildWithMeInterest.js`, `api-handlers/partner-inquiry.js` | Recruits prospective providers, makers, partners, community contributors and skill builders. It is **not** customer enrollment or an offer to teach. Keep eligibility gates. |
| Hire DANI paid-business path | `hireDaniLink()` in `src/lib/buildWithMeInterest.js` | Existing B2B `/request-service` link with `CH04-F02`, `audience=hire-dani`, campaign attribution. PR #615 adds clearer customer routing without creating another intake. |
| Business setup and digital | `src/data/serviceCatalogFamilies.js` | Existing business setup/growth/digital category; reconcile SKU authority before exposing specific offers. |
| Classes & Training | `src/data/serviceCatalogFamilies.js`, `docs/company-wide-catalog-master-2026-08-23.md` | Existing Division 09, not an unbuilt concept. Catalog audit reports no current LIVE_READY class offers. |
| AI for Business Workshop | `supabase/migrations/20260917172920_reconcile_division_09_remaining_candidates.sql` | `DNI-09A-009` already absorbs duplicate Small Business AI Implementation Workshop. Do not create another competing workshop SKU. |
| Pricing & service productization | same migration | Existing `DNI-09A-011` Pricing Fundamentals Workshop absorbs duplicate Pricing & Service Productization Workshop. |
| Startup Systems Workshop | same migration | Historical advanced-workshop pricing anchor; not evidence of current release status. |
| Digital product experiment | `products/turn-day/ITCH_RELEASE.md` | Existing digital product lab experiment; do not infer commercial rights or live checkout from a README. |
| Operation $1M | `docs/operation-1m-ai-operating-doctrine.md` | Existing campaign and revenue governance; preserve owner approval, truthful performance reporting, and established CRM/attribution. |

## Recovered commercial path and observed defect

Two distinct audiences share the public Build With Me page:

1. **Build DANI with us:** provider/partner/creator participation -> existing interest submission -> review -> provider application if applicable.
2. **Have DANI build with you:** customer with business/digital/AI-tool idea -> existing Hire DANI B2B request -> scope/quote -> governed payment -> fulfillment/QA.

Before PR #615, audience (2) had a Hire DANI card but no explicit AI/digital-idea explanation. The patch makes the distinction explicit and routes the customer through `hireDaniLink()`. It does **not** promise software development, an event, enrollment or outcomes.

## Completion gates (do not claim PASS without evidence)

- [ ] Confirm current Production statuses and governed prices for `DNI-09A-009`, `DNI-09A-011`, Startup Systems Workshop and relevant Division 06/08 services. Historical `live` text in a migration is not current sellability.
- [ ] Recover digital products and app prototypes, including actual delivery assets, rights, support burden and current product/payment mapping. Do not duplicate six previously existing ideas.
- [ ] Verify the Build With Me customer CTA in preview routes to B2B intake with attribution, does not invoke provider application, and is usable on mobile.
- [ ] Trace real B2B inquiry -> qualified offer -> governed quote -> invoice/payment -> delivery/evidence/QA -> follow-up. Separate observed runtime evidence from code-only tests.
- [ ] Confirm any paid workshop has actual scope, teacher/fulfillment authority, approved pricing, scheduling and cancellation terms, and receipt/delivery before marking LIVE_READY.
- [ ] Keep free challenge/pitch competition as **unapproved concepts** until demand, budget, prize rules and delivery capacity are established.
- [ ] Merge only after PR checks and preview proof. Never bulk-promote Division 09 or alter locked prices without owner approval.

## Owner-facing commercial priority

Prioritize one **already eligible** owner-deliverable business-building service and one existing downloadable kit, validate paid conversion and delivery, then decide whether an AI workshop or app product deserves launch. Measure actual buyer and cash outcomes, not signups or draft hourly margins.
