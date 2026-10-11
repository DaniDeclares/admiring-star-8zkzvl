# Research-to-economics pipeline diagnosis (2026-10-11)

Scope: read-only inspection of the Tester project (`okvepooyxurujcwgfoju`). No database writes, no Tester data copied to Production, no price changes. Corrects the earlier "draft hours / no job history" framing: DANI already has a market-intelligence system; the gap is in the connections between its parts.

## Three evidence classes (kept separate)

| Class | Meaning | Where it lives | Current state |
|---|---|---|---|
| Researched estimate | Competitor/market price observations | `dd_service_market_evidence` (append-only) | 40 rows, 15 SKUs, all observed 2026-09-24 |
| Validated quote | Vendor/provider quote for DANI's own scope | not found as a populated source | none seen in this inspection |
| Actual job cost | Cost recorded from completed jobs | `dd_jobs` / payout records (Production) | not used by this pipeline |

A researched competitor price is a ceiling/benchmark for price, not a cost. Only the other two classes can support a cost basis, and the pipeline currently treats none of them as cost input at scale.

## Findings

1. **Collection runs are healthy; the "no complete state" is vocabulary.** All 9 `dd_intelligence_collection_runs` are `SUCCEEDED` (economic-market-discovery 3, procurement 2, Gmail/Drive fixture proofs 4). No failed or stuck runs. None of these runs is a per-service pricing collection.
2. **The 385-row queue is not being worked.** 368 `QUEUED` plus 1 `QUEUED/SCOPED` have never been researched (`last_researched_at` null). Only 15 rows carry a research timestamp, all 2026-09-24 (5 RESEARCHING, 9 EVIDENCE_READY, 1 REVIEW_READY); 1 row is economics-ready.
3. **Coverage status is wrong for 384/385 rows.** `coverage_status = MISSING_CHANNEL_SCOPE` is derived from `dd_master_service_universe.chNN_rule` columns, which are empty for 501 of 502 rows. This is a derivation problem, not missing evidence, and it blocks scope-based prioritisation.
4. **No scheduled producer of per-service evidence.** The hourly controller refreshes a constant 25 baselines; the Node library `pricingResearch2026.js` (which writes evidence_count/economics_ready) has no caller; the only research batch was 2026-09-24. The SERVICE_PRICING_ECONOMICS program has 5 program-level items (looping, hundreds of attempts) instead of per-service work items.
5. **The 40 observations are usable but thin.** All COMPETITOR, VERIFIED, with URLs, Atlanta-area, one date (17 days old; stale for fast-moving categories). Comparability: 27 DIRECT, 11 PARTIAL, 2 CONTEXT_ONLY. 2 rows lack a high price (one CONTEXT_ONLY). Units are mixed (JOB, VISIT, LABOR_HOUR, BAG, PLANT, MONTH, SEASON, INCH, POUND, LOAD, 30_MIN) and must be normalised per SKU before any median is computed; PARTIAL and CONTEXT_ONLY rows should not feed a price proposal. Sources per SKU are mostly 1-2, below a sensible evidence target.
6. **Handoff to Production is narrow by design.** 10 evidence packets staged 2026-09-29 (9 EVIDENCE_READY, 1 AUDITED at 52.5% expected margin) versus 1 intake row in Production. Packets are the only sanctioned path; nothing bulk-copies queue rows.

## Can the evidence feed existing economics?

Yes for the 15 SKUs with DIRECT observations, as a price benchmark: `summarizeMarketEvidence`/`buildPricingProposal` consume exactly these fields. It does not supply cost; margin still needs the labor-inclusive cost model (DEC-LABOR-001 rates) plus a quote or job-cost basis. No per-SKU proposal was computed here because 11 PARTIAL/CONTEXT rows and mixed units need per-SKU judgement.

## Smallest broken connections (proposal, not applied)

1. **Coverage derivation**: stop deriving `coverage_status` from empty `chNN_rule` columns (fall back to the service's own channel flags, or mark UNKNOWN rather than MISSING). Unblocks prioritisation without new research.
2. **Queue pump**: give the existing controller one step that selects the next N `QUEUED` rows by priority and creates per-service work items for the existing research worker, instead of the five program-level items. Reuses the queue, worker and `dd_service_market_evidence`; no new engine.
3. **Freshness rule**: add an age cutoff when counting evidence toward `evidence_count`/`economics_ready`.
4. **Cost side**: a separate, explicit input for validated quotes and actual job costs, so researched price is never read as cost.

All four need owner authorisation and Tester validation before any Production migration. Items 1-2 are the first candidates.

## Not verified here

Worker internals of the research controller beyond observed run history, and the Production intake function's acceptance rules, were not re-read in this pass.
