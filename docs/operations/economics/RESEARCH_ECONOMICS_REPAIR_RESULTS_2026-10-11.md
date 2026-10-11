# Research-to-economics repair: Tester results (2026-10-11)

Authority: owner direction to implement bounded repairs 1 and 2 with tests and Tester-only validation, approve the freshness design, and trace existing sources for quotes and actual costs. No Production writes, no migrations, no price changes, nothing published. Artifacts: `docs/governance/research-economics-repair/` (`proposed_research_economics_repair.sql`, `pre_repair_definitions.sql`, `rollback.sql`, `tester_proof.sql`).

## What was applied to Tester (okvepooyxurujcwgfoju)
| Change | Kind |
|---|---|
| `dd_refresh_pricing_coverage()` derives scope from `dd_service_channel_availability` (ACTIVE only; PENDING and none are never reported as scoped) | replaced function |
| `dd_market_evidence_fresh_days()` (180) and view `dd_service_market_evidence_assessment_v1` (per service and unit; DIRECT, verified, fresh, priced rows only; PARTIAL and CONTEXT_ONLY counted separately; stale rows flagged, never deleted) | new |
| `dd_refresh_service_evidence_counts()` writes `evidence_count`, `confidence`, `last_researched_at`, status; never a price | new |
| `dd_record_service_market_observation()` is the validated ingest contract (https URL, normalized unit, provenance, comparability, dedupe); service_role only | new |
| `dd_dispatch_pricing_research_batch()` queues bounded, deduplicated `PRICING:<sku>` items under new program row `SERVICE_PRICE_OBSERVATION`; at most 10 per run and 25 open; blocked items re-queue after 24h up to 3 attempts, then park for human review | new |
| `dd_pricing_research_pre_step()` plus an anchor-checked text patch of the existing controller (one call, one summary key) | extension |
| `private.dd_stage_tester_economics_evidence()` adds `market_ranges` per unit and `cost_basis_class` to packets | replaced function |

Why the patch approach: replacing the controller by pasting its full body repeatedly timed out at the tool layer (not in Postgres). The patch is idempotent and reversible (`rollback.sql`).

## Queue before and after (live Tester)
| | Before (18:40Z) | After first live controller run (18:53Z) |
|---|---|---|
| Coverage | MISSING_CHANNEL_SCOPE 384, SCOPED 1 | SCOPED 155, NO_CHANNEL_AUTHORITY 230 |
| Evidence-count source | no DB writer | computed from observations (15 rows refreshed) |
| Rows meeting evidence target (3 distinct fresh DIRECT sources) | not computable | 5 (2 SCOPED, 3 NO_CHANNEL_AUTHORITY) |
| Per-service work items | 0 | 10 queued (all SCOPED), no duplicates |
| Prices (`proposed`/`current`) | unchanged | unchanged (hash-compared in proof) |

155 equals the number of services with an ACTIVE row in both `dd_service_channel_availability` and `dd_master_service_capability_channel_matrix`. 230 queue services have no channel authority; they are no longer mislabeled as "missing scope" and are dispatched last.

Side effect to review: `DNI-01A-001` moved REVIEW_READY to ECONOMICS_READY. Its recorded evidence count could not be reproduced from observations (2 distinct fresh DIRECT sources versus a target of 3). Its AUDITED economics baseline and the packet already in Production intake are untouched.

## Proof (rolled-back transaction, `tester_proof.sql`)
- Controller on real data: COMPLETED; summary contains `pricing_pre_step` with dispatch, counts and coverage; 20 open after a second pass (cap 25), 0 duplicate work keys.
- Existing executor, unmodified: processed 24 items from other lanes; the new items stayed QUEUED. The executor cannot extract prices and the backlog is about 30,000 items, so these items are worked through the ingest contract by a research session, as `DIV01_BATCH_001-004` were done by hand.
- Ingest on a never-researched SKU (fixture, not market data): 5 recorded; 1 duplicate ignored; unit FURLONG, http URL and unknown SKU rejected. Work item moved to EVIDENCE_READY at 3 sources.
- Assessment kept units separate: JOB range $90-$150 from 3 sources (median midpoint $120); the 400-day-old row counted as stale and excluded; the PARTIAL hourly row stayed in its own unit and range-free.
- Economics candidate for the fixture: modeled direct cost $75 (2h at the constrained $30, $10 materials, $5 travel), `economics_ready` false (THEORETICAL), minimum viable price $125 at the 60% cost ratio, `proposed_price` still null. The same job at the DEC-LABOR-001 $60 rate would cost $135, above the $120 market midpoint.
- Real packets (rolled back): 6 enriched packets carried per-unit ranges; services without a baseline were labeled `cost_basis_class: NONE`.
- Append-only guard on `dd_service_market_evidence` held.

## Evidence classes (kept separate)
1. Researched estimate: `dd_service_market_evidence` (competitor published prices) is a benchmark and is never copied into cost.
2. Validated quote: `dd_provider_payout_bands` (Production 26 rows, all RESEARCH_BENCHMARK from WEB_RESEARCH) and `dd_component_cost_baselines` (evidence_status ladder RESEARCH_BENCHMARK, DOCUMENT_EVIDENCE, EXTERNAL_VERIFIED, SYSTEM_VERIFIED). Only 2 rows are SYSTEM_VERIFIED quote inputs.
3. Actual job cost: `dd_job_cost_actuals` has 3 RECORDED rows in Production (owner-confirmed job record, PayPal-verified, bank-verified). This corrects the earlier statement that no job history exists.

## Remaining gaps (decisions or follow-up, nothing applied)
1. `dd_service_economic_baselines_theoretical_policy_chk` forces THEORETICAL labor to $30.00, which conflicts with DEC-LABOR-001 ($60/$75/$100). Modeled costs are therefore understated until an owner-approved path exists (policy change, not made).
2. `OBSERVED_JOB` baselines are not counted as economics-ready by `dd_refresh_pricing_research_economics`, so actual-job evidence cannot yet outrank an assumption.
3. `dd_job_cost_actuals` joins to services only through job and service request; a mapping view is needed to attach actuals to a canonical SKU.
4. No automated price extractor exists. Fetching and reading competitor pages is still done by a research session through the ingest contract; an extractor edge function would need owner approval for model and API use.
5. Observations are one 2026-09-24 batch, so a refresh pass is needed before the 180-day window matters.

## Production promotion requirements
- Owner decision on gaps 1 and 2.
- Production does not hold the queue, evidence, work-queue or controller objects; promotion means a reviewed migration through the Production lineage (replay CI, exact-head tests, Vercel check) and is not authorized here.
- Intake packets stay `TESTER_RESEARCH`; only `PRODUCTION_ACTUAL` rows can overrule modeled cost.
