# Governed PR executor repair plan (2026-10-11)

Status: BROKEN lane, prepared repair, **not applied**. No Production migration is authorized. The executor stays fail-closed; no warn-and-continue.

## Finding
The executor calls RPCs that do not exist in Production. The six migrations that create them are in `main` but not in the Production ledger (newest ledger row: `20261010034753`). Production's own `dd_claim_autobuild_candidate` is an older definition.

| Order | Migration (repo) | Adds / replaces | Depends on |
|---|---|---|---|
| 1 | `20261010201500_autobuild_approved_manifest_recovery` | replaces `dd_claim_autobuild_candidate`; adds `dd_autobuild_structured_files_eligible(text)`, `dd_requeue_tech_autobuild_candidate` | candidate table |
| 2 | `20261010203000_autobuild_promotion_review_handoff` | `dd_register_autobuild_promotion_review` | candidates, `dd_promotion_candidates` |
| 3 | `20261010204500_preserve_autobuild_pr_evidence` | `dd_record_autobuild_pr_evidence` | candidates |
| 4 | `20261010210000_reconcile_autobuild_promotion_reviews` | `dd_reconcile_autobuild_promotion_reviews` | candidates, promotion |
| 5 | `20261010213000_hold_expired_autobuild_leases` | `dd_hold_expired_autobuild_leases` | candidates |
| 6 | `20261010214500_route_autobuild_briefs_to_existing_tech` | `dd_route_autobuild_briefs_to_tech` | **#1's `dd_autobuild_structured_files_eligible`**, active Tech policy `PLATFORM_SAFE_MANIFEST_V2`, `dd_code_repair_work_queue` |
| 7 | `20261010230000_fix_autobuild_brief_tech_routing_atomicity` (only on PR #637's branch, not in main) | atomicity fix to #6 | #6 |

All seven are `CREATE OR REPLACE FUNCTION` plus grants (service_role only). No table, column, or data change.

## Production preconditions verified read-only (2026-10-11)
- Tables and every referenced column exist in Production (`dd_autobuild_candidates`, `dd_promotion_candidates`, `dd_code_repair_policy`, `dd_code_repair_work_queue`).
- `dd_code_repair_policy` `PLATFORM_SAFE_MANIFEST_V2` is `ACTIVE`.
- `dd_code_repair_work_queue.work_key` and `dd_promotion_candidates.candidate_key` have unique constraints, so the migrations' `ON CONFLICT` clauses are valid.
- `dd_autobuild_structured_files_eligible` does **not** exist in Production, so #6 cannot work without #1. Migration 7 (230000) cannot work without #6.
- Production's current claim function has no service-role check and only accepts `PATCH_MANIFEST_V1` with no path validation. The repo's replacement is stricter (service role only; allows `PATCH_MANIFEST_V1` and `APPROVED_FILE_CHANGES_V1`; at most 20 files; rejects absolute paths, `..`, `.env`, `.github`).
- Candidate backlog: 40 BLOCKED/PENDING, 9 MANIFEST_READY/PENDING, 1 PR_OPENED/PENDING, 1 PR_OPENED/PR_OPENED. Durable; nothing lost while the lane is down.

## Disposable proof (this session, local PostgreSQL 16, not Tester, not Production)
`disposable_baseline_production_shape.sql` rebuilds the four tables from Production's catalog (columns, types, defaults, unique keys, ACTIVE policy row) plus Production's current claim definition. The seven migrations apply in order with no error. `disposable_smoke_test.sql` then shows: a BUILD_BRIEF candidate is routed once into the Tech queue (second call links 0, idempotent); the claim picks only the valid PATCH manifest and refuses a `../` path and a `.github/` path; an expired lease moves to `HELD_IMPLEMENTATION` with a blocker; the promotion-review RPC refuses an unbuilt candidate; none of the outputs grants approval, a PR, or production permission. `rollback.sql` restores Production's claim definition and drops the added functions; it ran cleanly in the same disposable database.
Limits: fixtures are fabricated, the local shim is not Supabase, and this is not a Tester or Production result.

## Governed path to apply (needs owner authorization; none given)
1. Owner approves applying migrations 1-6 (and 7 with #637) through the existing migration train, in the order above, as file-versioned migrations so the ledger records the repo versions.
2. Apply to Tester first; read back `to_regprocedure` for all functions and re-run the smoke test shape against Tester.
3. Production: read back the pre-state (claim definition hash), apply, read back functions, confirm the executor workflow's next scheduled run no longer reports missing RPCs and the 49 candidates keep their states.
4. Keep `rollback.sql` ready. The workflow stays fail-closed throughout.

Two things to decide before step 1: PR #591's ledger replay is still held, so a new migration set adds sources the replay must absorb; and #637 carries migration 7, so it should not merge before 1-6 are applied.

## Validation addendum (2026-10-11, after owner authorized non-Production validation)
**Tester (`okvepooyxurujcwgfoju`, PostgreSQL 17):** all seven migration bodies compile and create on PG17 inside a transaction that was deliberately aborted. Read back afterward: 0 persisted functions, 0 fixture rows, no policy row, ledger unchanged (newest `20261010163007`). **Behavioral proof is not possible on Tester**: its `dd_autobuild_candidates` is a different lineage (check constraints allow permission classes `AUTO_TESTER_BUILD`/`REVIEW_REQUIRED`/`PROHIBITED` and no `MANIFEST_READY`/`PR_OPENED` status; Production has no check constraints on that table and holds `CODE_BUILD`/`MANIFEST_READY` rows), it has no `PLATFORM_SAFE_MANIFEST_V2` policy, and its executor functions are different (`dd_claim_next_autobuild` etc.). A persistent Tester apply would add Production-lineage functions to a database whose data cannot exercise them, so none was done.

**New defect found while building fixtures (reproduced locally on PG16, exact function text):** `dd_route_autobuild_briefs_to_tech` (214500, and the 230000 replacement) casts `proposed_build::jsonb` without a guard. Production `proposed_build` is free text (one existing row, a PR_OPENED candidate, is not valid JSON). Any candidate that is `MANIFEST_READY`/`PENDING`/`LOW`/`CODE_BUILD` with non-JSON text makes the whole routing call fail with `invalid input syntax for type json`, so one bad row blocks the batch. Today's 9 eligible rows are valid JSON, and the invalid row is filtered out by status first, so it is latent rather than live, but it depends on planner qual ordering. Proposed fix (not applied; PG16+ `pg_input_is_valid`, Production and Tester are PG17): `docs/governance/executor-repair/proposed_route_briefs_json_safe.sql`; verified locally that a non-JSON eligible row is then ignored with no error. It should ship as a corrective migration after 230000, or be folded into 230000 by #637's author before that migration merges.

**Idempotency:** `dd_route_autobuild_briefs_to_tech` second call links 0 (verified); `dd_claim_autobuild_candidate` returns nothing once the only eligible row is leased (verified); `dd_hold_expired_autobuild_leases` only touches expired leases; `dd_register_autobuild_promotion_review` is `ON CONFLICT DO NOTHING` and refuses unbuilt candidates (verified).

**Rollback limits (must be stated before approval):** `rollback.sql` restores Production's old claim definition and drops the added functions (verified locally). It does **not** undo data the functions write once running: rows inserted into `dd_code_repair_work_queue`, `code_repair_work_id`/`proof` changes on candidates, `dd_promotion_candidates` review rows, and `HELD_IMPLEMENTATION` holds. Before any Production apply, snapshot the 51 `dd_autobuild_candidates` rows (the "49 durable candidates" are the 40 BLOCKED + 9 MANIFEST_READY, plus 2 PR_OPENED) and the work-queue/promotion row counts so a restore is possible; and apply the functions first without invoking the routing/hold RPCs.

**Exact set to present for approval:** 201500, 203000, 204500, 210000, 213000, 214500 (in `main`); 230000 (only on #637's branch); plus the proposed JSON-safe fix. Status: release candidate prepared, **not approved, not applied**. Remaining before presenting: Production prerequisite re-read at apply time (functions absent, policy ACTIVE, constraints), a decision on #637/230000 sequencing, and the snapshot above.

## Pre-apply fingerprint (read-only, Production, 2026-10-11 18:30 UTC)
Not a backup, only a way to detect change and to confirm the state before any apply: `dd_autobuild_candidates` 51 rows, set fingerprint `md5(string_agg(md5(row::text) order by candidate_key))` = `21106ee948418abc6148c14bacffb1a3`; `dd_code_repair_work_queue` 0 rows (0 `AUTOBUILD_SPEC:*`); `dd_promotion_candidates` 7 rows (0 `AUTOBUILD_REVIEW:*`); ledger newest `20261010034753`. If any of these differ at apply time, stop and re-plan. A full row snapshot (exported, not committed) must be taken immediately before the apply; the fingerprint only proves what it contained.

## Migration lineage to present (exact, in order)
`20261010201500` → `20261010203000` → `20261010204500` → `20261010210000` → `20261010213000` → `20261010214500` (all in `main`, applied as file-versioned migrations) → `20261010230000` (on #637's branch only) → corrective JSON-safe routing function (`proposed_route_briefs_json_safe.sql`, needs a version after 230000). The ledger would record these versions in that order; none is present today.
