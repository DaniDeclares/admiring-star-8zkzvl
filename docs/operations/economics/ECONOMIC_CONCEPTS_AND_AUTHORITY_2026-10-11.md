# Economic concepts and their authority (traced from Production and git, 2026-10-11)

Purpose: stop one number ($30, $60, $75, $90, $100, 20%, 50%) from standing in for four different ideas. Read-only evidence; no policy overwritten, no price changed.

## What each figure actually is
| Figure | What it represents | Authority and date | Status |
|---|---|---|---|
| $60 / $75 / **$100** per hour (Tier 1 / 2 / 3) | **Standardized internal direct-fulfillment labor cost** for margin analysis, including owner-delivered work. "Not W-2 wages, customer retail prices, or provider payout rates." Executive draw stays separate. | `dd_business_decision_register` **DEC-LABOR-001**, APPROVED and IMPLEMENTED, Danielle Fong, 2026-09-01 | **Approved authority** |
| $90 per hour (stored as "Tier 3") | A draft consulting rate set by an agent on 2026-09-18 from web market research ($75-150/hr independent consultants) after the owner asked for a recommendation. Not a rate-card row; stored only in cost text. | `docs/UPLOADED_MATERIALS_DISPOSITION_REGISTRY_2026-09-18.md`; migration `20260918111013_division_08_draft_cost_model_tier3_consulting_rate` | **Conflicts with DEC-LABOR-001's $100**. The approved figure governs |
| $30 per hour | A **market wage benchmark** for Atlanta cleaning subcontractors (Indeed). Same idea as provider payout, not owner labor cost. Sits in `dd_owner_compensation_rules` rows labelled "owner labor allocation only; separate from DANI retained contribution". | Row `evidence_status = RESEARCH_BENCHMARK`, 2026-09-22 | Benchmark, not a decision |
| 20-25% (also 40, 5) `minimum_margin_percent` | A **provisional planning floor for retained contribution** in the pricing/estimate engine, applied with 15% overhead recovery and 2.9% processing. Metadata: "15% overhead + 20% contribution/net planning floor; provisional". | `dd_economic_policies`, created 2026-09-22 (commit 9f6d384), RESEARCH_BENCHMARK, build-phase | Provisional policy |
| **50%** | The **checkout-eligibility margin floor**, applied to an offer's `margin_economics` text. Added as a fail-closed code gate. No matching row in `dd_business_decision_register` was found. | Commit 8163061, DaniDeclares, 2026-09-19 (`governedCommercialGate2026`) | **Code authority only**; preserved by the owner on 2026-10-11 |
| Owner compensation / distribution | What the owner is **paid out of profit**. Comes after direct fulfillment, provider compensation, fees, overhead and reserves. | `DD-2026-BUDGET-GOV-002`, APPROVED 2026-09-22 | Separate from service cost |
| Actual cash paid to the owner | A cash fact from the books, not a pricing input | Accounting | Not modelled here |

## The four concepts, kept apart
1. **Actual job labor**: real hours on a real job, from time and cost records (`dd_job_cost_actuals`).
2. **Standardized replacement labor**: DEC-LABOR-001 tier rates times estimated or actual hours. This is what the 50% test should use for owner-delivered work.
3. **Owner compensation**: paid from profit under DD-2026-BUDGET-GOV-002; not a service cost.
4. **Target profit**: the margin floor. 50% (checkout gate) versus 20-25% provisional (pricing engine) are **different measures at different scopes**: the policy floor is described as a net contribution after 15% overhead recovery; the gate reads the offer's gross margin after direct cost. I found no record that reconciles them. Neither was changed. **Owner decision (bounded):** record a decision that states what the 50% measures and which gate it governs.

## Effect of using the approved rate
The earlier analysis used the stored $90 for Tier 3. Re-running with DEC-LABOR-001's $100 (the 62 Tier 3 services): 101 modelled services, 1 indicatively at or above 50%, 14 at 35-49%, 86 below 35% (not 81), and 50 below cost (not 23). The correction makes the picture worse, not better. The $90 result is kept as a sensitivity column.

## One real job exists
`dd_job_economics_feedback` has one row: $160 collected; provider labor $60 flat (bank verified); $42.40 Thumbtack acquisition cost (owner-confirmed); $4.33 PayPal fee; contribution $53.27; **33.29% margin** (PARTIAL_ACTUALS). Two lessons: acquisition cost is a real cost the 108-service model omits (about 26% of that job's revenue), and the only measured margin so far is far below 50%.

## What this does not decide
The rate applying to each service (which tier the work really is) and whether a given service should be repriced, rescoped or delivered differently remain owner decisions. See `alternatives_by_sku_2026-10-11.csv` for per-SKU levers; nothing there is a proposed price.

## Alternatives for services below the floor (evidence status, nothing repriced)
`alternatives_by_sku_2026-10-11.csv` gives, per SKU, the three levers the evidence supports:
- **Scope lever:** the most hours the current price can carry at the approved rate (`max_hours_at_price`) and the percentage of the draft hours that would have to go (`hours_cut_needed_pct`).
- **Price lever:** the price that would clear 50% at the draft hours (`price_to_clear_floor`) and the increase that implies (`price_increase_needed_pct`). It is arithmetic, not a recommended price; market fit and the owner's price locks are not considered.
- **Fulfillment lever:** the evidence is thin. Production has **zero** rows in `dd_provider_rate_cards` with a service SKU, so no negotiated or contracted provider rate exists for any of these services. Provider-wage benchmarks exist only as research rows for cleaning (about $30), movers (about $21), errands (about $21) and pet care ($15.50-$16.40), none for admin, formation, marketing or business-development work. Outsourcing those services therefore cannot be quantified from existing records; that is an evidence gap, not a recommendation to outsource.

Path labels in the CSV: `VALIDATE_REAL_TIME_FIRST` (8 services within 15% of the floor by hours or price: DNI-04A-001, 04A-007, 04A-008, 04A-010, 04A-015, 04A-017, 04A-018, 03A-019), `SCOPE_OR_PRICE_ADJUSTMENT_CANDIDATE` (17), `REVISE_SCOPE_PRICE_AND_FULFILLMENT_MODEL` (75), `NEEDS_COST_EVIDENCE` (5), `NOT_MODELED_PER_ITEM` (2), `VERIFY_HOURS_ONLY` (1). Research Assistant (DNI-04A-009) is live and sells by quote today but sits at 30% at the approved $100 Tier 3 rate, so it needs price, scope or fulfillment review, not just time validation.

## Where to start for revenue (recommendation, not an action)
Run the time-and-cost validation (`time_and_cost_validation_workbook.xlsx`) on the services that are both close to the floor and already sell: Virtual Assistant (04A-001, 46.8%), Document Formatting (04A-007, 43.1%) and Project Coordination / Meeting Support (04A-010 at 42.6%, 04A-008 at 47.1%), keeping Research Assistant (04A-009) under price and scope review. Acquisition cost is logged per job because it is a real cost the model omits.

## What the 50% checkout gate measures (read from `economicGateFromOffer`, commit 8163061)
- **Input:** the offer register's `internalCost` and `marginEconomics` text for the service (from `dd_master_service_universe`).
- **Step 1, evidence test:** if either text matches `PENDING_RECONCILIATION | DRAFT | NOT AN AUDITED | NEEDS DANIELLE | PRICE MISMATCH | FLAGGED, NOT RESOLVED | PROVISIONAL | PLANNING ASSUMPTION`, the gate returns `ECONOMICS_NOT_RECONCILED`. So **any service whose cost is still labelled draft cannot clear the gate at any margin.** That is why all 88 remote services fail it today.
- **Step 2, margin test:** it takes the last percentage written in `marginEconomics` (pattern: after "(", "=" or "margin") and requires at least 50. The authored percentage is (price minus draft direct cost) divided by price, where direct cost is hours times the tier rate plus materials. Payment processing, overhead recovery and acquisition cost are **not** in that figure.
- **Relation to the 20-25% policies:** those are described as net planning floors after 15% overhead recovery and 2.9% processing for the pricing/estimate engine. The 50% test is a gross margin on direct cost for checkout eligibility. They answer different questions, so neither replaces the other. No decision-register entry states the 50% rule; recording one is the owner's call.

## Tier assignment: how much does it matter? (sensitivity, no tier changed)
Current assignment is `tier_as_stored` in the per-SKU CSV (11 services at $60, 28 at $75, 62 at $100), taken from the draft cost text. It is **unverified** against DEC-LABOR-001's definitions (Tier 1 field/routine, Tier 2 coordination/PM/dispatch/QA, Tier 3 specialized technical/creative/professional); where the source gives no tier the CSV says UNKNOWN. Sensitivity: with every service at the approved schedule exactly as stored, 1 of 101 clears 50%; if all were re-tiered to $75, 3 would; to $60, 25. Even with generous re-tiering, most services stay below the floor, so the binding problem is hours and price, not tier labels. `margin_pct_if_tier2_rate` is in the CSV for planning only.
