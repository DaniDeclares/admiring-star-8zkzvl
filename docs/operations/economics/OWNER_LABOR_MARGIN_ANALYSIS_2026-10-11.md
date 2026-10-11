# Owner-labor-inclusive margin analysis, 108 LIVE_READY services (2026-10-11)

Decision applied (from owner direction): owner-delivered labor is an economic cost, not free labor. Three things are kept apart:
1. **Actual cash paid to the owner** — a distribution/payroll fact. Not modelled here; no source gives it.
2. **Standardized owner labor cost** — a pricing/margin input (hours x rate).
3. **Owner profit after service costs** — what is left after (2). This is what the 50% floor protects.

Preserved: the 50% margin floor (`ECONOMIC_MARGIN_FLOOR_PERCENT = 50`, `src/lib/operations/governedCommercialGate2026.mjs:3`), the draft-cost rule, public prices, and every checkout gate. No Production row, price, or release state was changed. The model is analysis only.

Inputs and honesty limits:
- Prices: locked `services.starting_price` / owner price lists (unchanged).
- Hours and tier rates ($60 Tier 1, $75 Tier 2, $90 Tier 3): from `dd_master_service_universe.internal_cost` and the 2026-10-09 snapshot. Every hour estimate is DRAFT or build-phase; even rows marked OWNER_CONFIRMED carry `build_phase_only` / `not_actual_job_cost` / `requires_live_calibration` in `dd_owner_compensation_rules.metadata`. I did not substitute the $30 benchmark; it appears only as a labelled sensitivity.
- Payment processing 2.9% (the rate in `dd_economic_policies`). Fixed per-transaction fees and overhead recovery (15% in those policies) are NOT included, so results are, if anything, optimistic.
- Production policy table sets `minimum_margin_percent` at 20-25 for these services (RESEARCH_BENCHMARK, build-phase), while the app gate uses 50. Both exist; the owner has directed the 50% floor stays. The mismatch is recorded, not resolved.

Method: margin = (price − hours x rate − other direct cost − 2.9% x price) / price. `hours_cap_at_current_price` is the most hours the current price can carry and still clear 50%. `price_that_would_clear_floor_at_these_hours` is shown for planning only; it is not a proposed price.

## Result
No service is economically VERIFIED, so none is margin-approved. All 108 are classified ECONOMICALLY_UNVERIFIED; the indicative result sorts them by what is needed next.

| Group | Count | Indicative margin | What is needed |
|---|---|---|---|
| Indicative pass | 1 (DNI-03A-020, 54.2%) | >= 50% | Verify hours; still unverified |
| Needs cost evidence (close to floor) | 19 | 35-49% | Real hours. Includes 04A-001, 003, 004, 005, 007, 008, 009, 010, 014-019 and 06A-005/007/009, 03A-002/019 |
| Needs pricing or scope revision | 26 | 10-34% | Owner decision on price/scope; hours evidence alone unlikely to reach 50% |
| Needs pricing or scope revision (severe) | 32 | 0-9% | Same; priced at roughly cost |
| Below cost | 23 | negative | Same; includes most 08A items (hours x $90 exceeds price) and 03A-011/013, 01D-009/011, 01F-003 |
| No cost basis | 5 | n/a | 01D-005, 01F-001, 01G-001 (PENDING_RECONCILIATION), 06A-016, 06A-017 (no cost row) |
| Not modelled per item | 2 | n/a | 11A-017/018 (DTF/heat press: setup fee only; per-item pricing separate) |

Median price multiple needed to clear 50% at the draft hours: 1.9x. Sensitivity: at the $30/hr benchmark 94 of 101 modelled services would clear 50%; at the tier rates only 1 does. The result is driven almost entirely by which labor rate is treated as the owner's standardized cost, which is the open evidence question (verified rate authority does not yet exist).

The three live remote services under this model: Virtual Assistant (04A-001, $149, 1 hr) 46.8%, Document Formatting (04A-007, $139) 43.1%, Research Assistant (04A-009, $225, 1.5 hr at $90) 37.1%. They sell by quote then invoice today; the 50% floor only governs online checkout. At the current prices their hours caps are 0.94, 0.87 and 1.18 hours, so actual time logged per job decides whether they clear.

## What this implies (no action taken)
- Do not mark more offers LIVE_READY without a way to deliver them profitably. LIVE_READY is a release state; margin is a separate gate and stays closed.
- Next evidence to collect: actual hours and the owner's standardized rate from the first fulfilled jobs (feeds `dd_job_economics_feedback`, the existing calibration path). The existing `job margin review` evaluator (#630) already treats unmeasured margins as unverified.
- Owner decisions that cannot be settled from existing authority: (a) which standardized owner rate applies per tier ($30 benchmark vs $60/$75/$90 build-phase), (b) whether any of the 80 services at or below ~35% (81 of 101 modelled) should be repriced or rescoped.

Files: `live_ready_margin_model_2026-10-11.{csv,json}` (per-SKU), generator `tools/economics/live_ready_margin_model.py`.
