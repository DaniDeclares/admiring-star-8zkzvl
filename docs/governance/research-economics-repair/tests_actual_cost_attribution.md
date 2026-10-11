# Actual-cost attribution tests (Tester, rolled-back fixtures, 2026-10-11)
View under test: `proposed_actual_cost_sku_attribution.sql` (not applied). Fixtures used two services (A, B), single- and two-SKU estimates, work orders and cost rows.
| Case | Result |
|---|---|
| Estimate with exactly one SKU, verified labor | ATTRIBUTED via ESTIMATE_SINGLE, eligible |
| Exact duplicate cost row (job, type, amount, reference, date) | second row duplicate_suspect, not eligible |
| VOID row plus corrected RECORDED row | only the corrected amount is eligible (18, not 20) |
| Customer-acquisition cost (OWNER_CONFIRMED) | class ACQUISITION, reported separately from fulfillment cost |
| Payment-processing fee (PAYPAL_VERIFIED) | class TRANSACTION, separate |
| Estimate with two SKUs and no stronger link | MIXED_SCOPE, ineligible |
| Work order service B | ATTRIBUTED via WORK_ORDER |
| Snapshot says A, work order says B | CONFLICT, ineligible |
| No estimate, work order or snapshot; title says "Bathroom + bedroom cleaning" | UNASSIGNED_NO_LINK (title never used) |
| Two live labor rows with different amounts, same job and link | conflicting_amounts, both ineligible |
| Unverified source type | evidence_grade UNVERIFIED, ineligible |
Roll-up (eligible rows only): A = fulfillment 78 (60 + 18), transaction 4.33, acquisition 42.40, SINGLE_JOB; B = fulfillment 75, SINGLE_JOB.
Production data check (read-only): the only job with cost rows (DD-KRYSTAL-20260924) has no estimate, no snapshot and a work order with no service or SKU, so all 3 recorded rows are UNASSIGNED_NO_LINK today. Its customer price is 160.00 while the PayPal gross is 110.00, a revenue discrepancy to reconcile before any use.
