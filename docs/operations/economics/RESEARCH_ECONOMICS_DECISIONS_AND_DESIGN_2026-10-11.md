# Research-to-economics: owner decisions applied and design (2026-10-11, after 018fb84)

Boundary: Tester-only work, no Production writes or migrations, no deployment, no price change, no paid model/API/scraper activation. Competitor prices say what the market may pay; verified job costs say what fulfillment costs; neither alone proves the 50% floor.

## 1. Labor model (decision: repair the model, not the evidence)
Authority (Production `dd_business_decision_register`, DEC-LABOR-001, APPROVED 2026-09-01): $60 / $75 / $100 per hour are internal direct-fulfillment labor cost rates for owner-operated work. They are economic metrics, not wages, retail prices or provider payout rates. So:
| Purpose | Correct source |
|---|---|
| Owner-delivered fulfillment | DEC-LABOR-001 tier rate (Tier 1 field $60, Tier 2 coordination $75, Tier 3 specialized $100) |
| Provider-led fulfillment | provider payout evidence (`dd_provider_payout_bands`, work-order payout), not the tier card |
| Legacy theoretical baseline | $30, `LEGACY_NARRATIVE_PARSED`; kept as history only |
| AUDITED baseline for DNI-01A-001 | $23.40, source `AUDITED_ECONOMIC_BASELINE`; kept as history |
`proposed_tier_aware_baseline_v2.sql` (not applied) adds `baseline_version`, `labor_basis`, `labor_tier`, `fulfillment_path`, `supersedes_baseline_id`, `payout_band_id`; keeps $30 enforced for legacy rows only; makes a v2 owner-tier row carry exactly the tier rate; makes provider-led rows point at payout evidence; and adds a "current baseline" view (highest version) for the two consumers. The constraint logic was verified on a temp table (tier at $30, tier 3 at $75, legacy at $45, tier labelled v1, provider without payout evidence and duplicate version were all rejected; v1 and v2 coexisted).
Sensitivity (labeled analysis, not a decision): DNI-01A-001's AUDITED 52.5% margin uses $23.40 labor. Re-costed at the $60 Tier 1 rate the same baseline costs $139.70 against an implied price of about $140, so the margin is roughly 0%. If that service is owner-delivered, the audited margin is not owner-labor-inclusive.

## 2 and 3. Actual job costs (decision: incorporate with strict provenance; build the read-only mapping)
Built and tested: `proposed_actual_cost_sku_attribution.sql` (two read-only views, not applied) and `tests_actual_cost_attribution.md` (attribution, duplicates, conflicting amounts, voided/corrected rows, mixed scope, conflicts, unverified sources). Links used: cost snapshot, work order service, single-SKU estimate; never titles or notes. Acquisition and transaction costs are reported apart from fulfillment-direct cost. The view sets no readiness and no price.
Finding: the three recorded Production rows all belong to one job with no estimate, no snapshot and a work order with no service or SKU. All three are UNASSIGNED_NO_LINK, so none of them is a service baseline. Prerequisite workflow fix: capture the canonical SKU (service_id) on the work order at dispatch. CORRECTION (owner, 2026-10-11): the Krystal job (DD-KRYSTAL-20260924) is customer-payment reconciled and closed, not an open revenue issue: $160.00 agreed = $50.00 Zelle deposit (2026-09-23) + $110.00 PayPal balance (2026-09-25, transaction 0D953425KG225914F); balance due $0.00; the lingering invoice status was an accounting sync issue and the PayPal invoice was confirmed canceled on 2026-10-09. Do not reopen, contact the customer, request payment or duplicate expenses. The only open item is the missing system link (no SKU on the work order). An approved $60 provider expense does not by itself prove a successful payout; payout verification belongs in the existing accounting evidence.

## 4. Automated competitor-price extraction (not authorized; audit and bounded design)
Audit (Tester): `research-engine-runner` is an HTTP source watcher (fetch, hash, substring signals, 6 sources per run, 12-15s timeouts, hourly +1h backoff on failure); it contains no extraction or model code. Vault holds only the research function URL and anon key; no model or search API key. `OPENAI_API` adapter is PLANNED. About 1,000 ACTIVE sources exist (964 under OPERATING_MODEL_INTELLIGENCE, about 20 failing); the pricing program has 4 regulator/secondary sources. Executor and the hourly job trigger the same watcher about 3,800 times a day, each run unrelated to the triggering item.
Bounded design (nothing activated):
- Phase 0, no spend: deterministic extraction inside the existing watcher run from already-fetched pages (JSON-LD offers, "from/starting at $X per unit" patterns), writing through the existing ingest contract as `UNVERIFIED` so nothing counts until a research session confirms with a correcting row.
- Phase 1, needs owner approval of model and budget: model-assisted extraction of the same excerpt. Expected usage per service is about 3 sources x (about 1.5k input + 0.3k output tokens) = about 5.5k tokens; 370 services is about 2M tokens one time; at most 24 sources an hour on the current cadence means roughly 8 services an hour, about two days for the backlog. Dollar cost needs the owner-chosen model price and is not estimated here.
- Source eligibility: first-party published local-competitor prices; cost-guide and lead-marketplace pages are context only; nothing behind a login; robots.txt respected; one request per domain per 10 seconds; no paid scraping service.
- Failure behavior: existing backoff, then release with SOURCE_UNAVAILABLE or NO_COMPARABLE_FOUND (24h cool-off, 3 attempts, then parked for human review).

## 5. Research backlog (investigated; no new worker)
Open items by executability (Tester):
| Class | Count | Executor-eligible |
|---|---|---|
| BLOCKED (ENTITY_ARCHITECTURE about 15,500; CRAFT_PROJECT_CORPUS about 9,900; WORKFORCE_ECONOMICS about 1,370; others about 2,000) | about 29,000 | no (executor selects only QUEUED/RESEARCHING) |
| RESEARCHING, mostly SERVICE_DISCOVERY P2 (960, attempts 10-11) and CRAFT P1 (215) | about 1,200 | yes, about 860 past the 2-hour cooldown |
| Owner-decision items (WORKFORCE_ECONOMICS P0/P1) | about 240 | no |
| SERVICE_PRICE_OBSERVATION | 20 | yes |
So the real pool is about 1,200, not 30,000. The executor spends its capacity re-triggering the same watcher (CRAFT 2,588 and SERVICE_DISCOVERY 1,229 triggers in 24h). Per-service pricing items rank below P1 work and gain nothing from an engine trigger, so ranking changes would only add noise. Decision: leave executor ranking and leases untouched; route consumption through `dd_claim_pricing_research_items` / `dd_release_pricing_research_item` (applied to Tester, proof in `research-economics-repair/tester_proof_consumer_routing.md`), which honour the executor's existing 2-hour lease and use SKIP LOCKED.
Separate finding for the owner: about 29,000 BLOCKED items (most never attempted) are inert, so ENTITY_ARCHITECTURE and CRAFT backlog counts overstate live work; triage is a separate task.

## 6. DNI-01A-001 evidence-count discrepancy
The 2026-09-29 packet recorded evidence 3/3 and REVIEW_READY. The observations are three rows: two DIRECT VERIFIED (Clean House of Atlanta $200; ATL Clean $120-$250) and one CONTEXT_ONLY (ATL Clean $150, no high price). The old count included the context-only row. Under the DIRECT-only rule it is 2 of 3, so the status is ECONOMICS_READY, not REVIEW_READY. Resolution: packet and evidence trail preserved; status is not treated as verified; one more DIRECT source is needed, and the cost basis must be re-examined (see section 1 sensitivity).

## 7. End-to-end route (evidence-qualified)
Canonical SKU, channel authority (155 scoped), dispatch, session claim, validated observation, per-unit range (DIRECT, fresh), cost evidence (tier-aware model, then payout/quote, then attributable actual cost), 50% floor check in the existing governed gate, governed review, quote. Today: 5 services have the market-evidence target; 0 have attributable actual cost; modeled costs are legacy $30 or audited $23.40, so none is checkout-ready on evidence.

## Holiday merchandise (context received 2026-10-11, no action taken)
Recorded as a dependency, not executed: Printify catalog "from" prices are vendor-published production costs excluding shipping, tax and fees, so they enter the cost-evidence ladder as vendor catalog evidence only; each product still needs per-configuration shipping and a delivered-margin check against the 50% floor before it is offered. Delivery promises for October 31 require a verified shipping estimate per configuration; Printify Premium, equipment purchases (xTool) and publication are not authorized by this material. ChatGPT remains the creative owner; Shopify and Canva identity coordination continues from the existing maps.

## Housekeeping disclosure
A diagnostic probe I ran on Tester added one column, `baseline_version` (integer, default 1), to `dd_service_economic_baselines`. It is additive and unused. My attempt to drop it did not complete (the statement stalled at the tool layer), so it is still there; it is compatible with `proposed_tier_aware_baseline_v2.sql`, which would add it anyway.

## Update: owner decisions of 2026-10-11 (after 4b50921)
- Approved: tier-aware baseline v2 for continued Tester validation; canonical SKU on work orders with a governed exception for legitimate custom jobs (must not block valid paid work); no-spend deterministic extractor in Tester (unverified candidates only). Held: #591 E1/E2 until exact dependencies, corrections and Production consequences are documented; no silent exclusion of required migrations.
- v2 consumer validation (Tester, rolled back): the `dd_service_economic_baseline_current_v1` view (highest version wins) plus a one-line source change in `dd_refresh_pricing_research_economics` and `dd_stage_tester_economics_evidence` made the refresh use a higher-version AUDITED baseline at $60 (modeled cost 3,500 to 6,500 cents, economics_ready false to true) while the v1 row stayed untouched and only one row was added. Rows are never overwritten.
- The two read-only attribution views are now applied to Tester. Schema drift found: Tester `dd_work_orders` has no `canonical_sku` column but Production does, so the Production variant of the work-order path in `proposed_actual_cost_sku_attribution.sql` also resolves `canonical_sku`; the Tester variant omits it. Work-order cases tested in Tester: service-only and valid offer_sku attribute; disagreeing service and offer_sku is CONFLICT; an offer_sku that is not a real SKU is unassigned.
