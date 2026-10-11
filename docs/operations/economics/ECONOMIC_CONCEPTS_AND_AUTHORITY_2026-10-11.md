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
