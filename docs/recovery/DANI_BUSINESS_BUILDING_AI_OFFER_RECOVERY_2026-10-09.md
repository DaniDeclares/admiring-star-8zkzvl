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

## Live Production read-back (2026-10-09, read-only)

Supabase project `ajxezpczaemunlcmqlgl` was queried directly. Current release contract and locked prices:

| SKU | Offer | Locked price (each CH01–CH05) | Release | Blocking gate | Payment-link / Stripe price / verification |
|---|---|---:|---|---|---|
| DNI-09A-003 | Startup Systems Workshop | $199 | HOLD | PAYMENT_LEDGER | false / false / false |
| DNI-09A-009 | AI for Business Workshop | $149 | HOLD | PAYMENT_LEDGER | false / false / false |
| DNI-09A-011 | Pricing Fundamentals Workshop | $149 | HOLD | PAYMENT_LEDGER | false / false / false |
| DNI-09A-019 | Digital Products Workshop | $149 | HOLD | PAYMENT_LEDGER | false / false / false |

For all four: `quote_path_ok=true`, `fulfillment_matrix_ok=true`, `payment_ledger_ok=false`, `runtime_accuracy_ok=false`, `production_smoke_verified=false`. `provider_capability_count=1` is **not** dispatch eligibility. Do not expose checkout or sell a dated seat before instructor/format/seat inventory and delivery evidence are verified.

Production digital product candidates and build queue already contain seven same-key concepts: `TURN_DAY_GAME_V1` (free browser game), `JOB_PROFIT_CALCULATOR_V1` ($9 hypothesis), `TURN_ESTIMATOR_V1` ($19 hypothesis), `FIELD_PHOTO_LOG_KIT_V1` ($7 hypothesis), `NOTARY_APPOINTMENT_WORKFLOW_KIT` ($27 hypothesis), `SMALL_SERVICE_BUSINESS_FOLLOWUP_KIT` ($19 hypothesis), `PM_TURNOVER_EVIDENCE_TOOLKIT` ($27 hypothesis). Six are `VALIDATE`; Property Manager Turnover Evidence Toolkit is `BUILD_NEXT`. **Hypotheses are not approved retail prices or active Shopify products.** `dd_software_service_opportunities` contains `TWENTY_CRM_IMPLEMENTATION` in `RESEARCH_TO_INTERNAL_PILOT`, not released SaaS.

Production table counts: `leads=14`, `service_requests=15`, `dd_payment_events=2`, `dd_customer_success_followups=1`. These are independent counts, **not** proof of a connected conversion funnel or sales. Next step is a privacy-preserving join/evidence audit with test records excluded and no invented lifecycle pass.

### Prioritized controlled completion

1. Confirm historical workshop scope, duration, instructor, delivery format, booking/seat logic and refund/cancellation terms. If absent, keep HOLD; use existing governance to record gaps.
2. Reconcile candidate digital assets against files and existing Shopify products; verify file delivery for the three ACTIVE Shopify kits before new releases.
3. Test B2B customer path using TEST-tagged evidence, excluding test records from performance. Confirm actual production customer conversion separately.
4. Use existing Stripe/payment release train for each approved SKU only after commercial and fulfillment checks. No price modifications or direct Production SQL updates without owner authorization.
5. Run CI and preview against PR #615, review diff against current main, then merge if approved.
