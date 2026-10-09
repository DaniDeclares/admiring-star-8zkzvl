# OP1M revenue execution — production evidence checkpoint (2026-10-09)

## Authority and scope
Read-only Production queries (Supabase ajxezpczaemunlcmqlgl), not a claim of paid Stripe/Shopify reconciliation. Claude owns Shopify checkout and provider portal. CH05 research and qualification changes remain draft PR #608, Tester only. Do not deploy unproven bridge.

## Production observed
- dd_service_release_contract_v1: 108 LIVE_READY, 275 HOLD, 83 BLOCKED. This **supersedes** the earlier Tester-specific 1 LIVE_READY/459 HOLD/6 BLOCKED figures for describing Production. Verify SKU/channel and quote eligibility before claiming any individual offer can be sold.
- dd_demand_capture_staging: 2 rows; 0 BUYER_SIGNAL. Competitor intelligence is not verified buyer demand.
- dd_sales_queue: 129 rows, **not** 129 verified buyers. 2 marked do_not_contact. One row has amount_collected > 0, totaling $160 **as recorded in this table**; do not equate this with reconciled payment receipts or total company revenue.
- Existing OP1M recruitment draft: OP1M:FB:BUILD_WITH_ME:20261010, publish after separate 10 AM post, owner approval required, not auto-authorized.

## Next code work (history first)
1. Inspect existing source-evidence verification functions, source message IDs, consent gates, do-not-contact, contact pressure and owner approval. Reuse their authoritative receipts; never infer a buyer from a competitor post or metadata boolean.
2. Reconcile Tester applied migration versions 20261009144722/20261009144724 with GitHub migration filenames 20261009161500/20261009162000 before release. Check drift with existing migration reconciliation tooling; do not blindly replay.
3. Inspect 108 LIVE_READY Production offers for CH05 applicability, payment route, scope, fulfillment and quote guards. Diagnose HOLD/BLOCKED by cause rather than bulk-promoting.
4. Reuse existing sales queue and quote/payment/job/evidence/QA flows. Produce Tester proof for source -> qualified buyer -> eligible SKU -> governed draft -> owner approval, including negative tests for competitor-only, missing consent, no authority, not-LIVE_READY, do_not_contact and duplicate source.
5. Measure content -> consented interest -> verified buyer -> quote -> **reconciled collected payment**. Separately track provider interest -> applicant -> approved provider -> actual assignment. No fake leads, earnings claims, automatic outreach or unsupported launch claims.

## Stop conditions
Do not merge PR #608 or mutate Production sales queue based on untrusted metadata. Keep user-facing provider portal and Shopify in Claude's lane to prevent overlapping writes.
