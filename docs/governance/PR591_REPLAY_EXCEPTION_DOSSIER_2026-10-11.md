# PR #591 replay exceptions: per-migration dossier (2026-10-11)

Status: none of these exceptions is approved or applied. The hybrid replay stays held at `20261003184925`. Hashes are md5 of SQL with comments, whitespace and semicolons removed (`sql_nws_md5` method used by `supabase/production-ledger/manifest.json`). The 28 drifted-migration comparisons and their provenance are untouched. Production was only read (catalog queries). No fixtures were created.

## E1. Provider-staging guard: ledger row `20261003184925` vs repo `20261003182500`
- Hashes: ledger `daa11ecc291d…` (archived `supabase/production-ledger/20261003184925_provider_staging_missing_payload_guard_reconciled.sql`); repo `20261003182500` `85c25b570d4a…` (different SQL).
- Purpose: add the missing-payload guard to the provider staging function. The ledger SQL rewrites the function body by exact text match and raises `EXPECTED_PROVIDER_STAGING_GUARD_NOT_FOUND` otherwise.
- Why clean replay fails: the ledger statement expects Production's minified function text; a clean build produces the canonical text.
- Classification: Production-only dependency (function text), not historical data.
- Safety guarantee to preserve: the guard exists and rejects missing payloads.
- **Equivalence evidence (done 2026-10-11, read-only against Production):** the repo's canonical path (source `20261003163000` full function definition, then repo `20261003182500`'s guard replacement, whose own fail-closed assertion is kept) produces a function whose `pg_get_functiondef`, with SQL comments and whitespace removed, has md5 `62cc2307cae02232628551ea8b14a3db` and length 7350. Production's current `private.dd_consume_provider_intake_staging_impl(uuid)` after the ledger row gives the identical md5 and length (the 115-character difference seen without comment stripping is SQL comments only). Reproduce with `tools/replay-local/e1_provider_guard_equivalence.py`. Limits: this compares function text including header attributes, not grants, the `COMMENT ON FUNCTION`, or runtime behaviour; the ledger row's own `COMMENT ON` statement is not part of the repo patch. The exception itself is still an owner decision and was not applied to the assembler.
- Narrower repair: none needed if the comparison matches; the ledger row stays archived and recorded as superseded-in-replay, not deleted.

## E2. Eight zero-DDL data migrations
| Version | Purpose (from file) | ledger md5 |
|---|---|---|
| 20261006233600 | reconcile verified Stripe marketing services 07A-001..010 into `dd_stripe_launch_register` | 4ec05ee95f0d |
| 20261007003150 | reconcile DNI-08A-019 Stripe initial payment link | 0a98c25274f4 |
| 20261007003355 | reconcile and prove DNI-08A-017/018 | dfc6ef477e3b |
| 20261007003635 | reconcile and prove DNI-08A-007/008 | 43e4925517a2 |
| 20261007004019 | reconcile remaining fixed-price services | 42b64c177a5b |
| 20261007014029 | CH01 holiday commercial release (governed) | b42d0a98c7c5 |
| 20261006235422 | activate cross-channel content engine | 0effa48a629e |
| 20261007014229 | CH01 holiday outcome routing | e41a1f2c58cb |
- Each contains 0 CREATE/ALTER/DROP statements (checked on the archived files).
- Why replay fails: they insert rows keyed to Production services/register rows that do not exist in a clean replay (FK/guard failures).
- Classification: historical Production data (not a source defect, not schema).
- Safety guarantee: schema is not affected by omitting them; the data they write is evidence of verified Stripe links and releases, which is Production data, not replay-created.
- Equivalent verification: replay each against disposable fixtures containing only the referenced SKU rows, proving the statements are valid against the real schema; fixtures must be derived from the SKUs named in each file and checked independently. Not done.
- Dependency map (static scan of the archived ledger SQL, 2026-10-11): `20261006235422` (content engine) and `20261007014229` (holiday outcome routing) depend on the E4 tables (`dd_content_draft_queue`, `dd_execution_package_routing`) and on `dd_governed_packages`/`dd_governed_package_components`; they are not independent exclusions and should replay once E4's creation DDL exists. The other six write Stripe launch-register, initial-payment-link and release-verification/evidence rows keyed to `services` rows and read `dd_service_release_contract_v1` (or `_legacy_v1`), `dd_governed_service_offers` and `dd_audit_proof_receipts`; their fixtures are therefore service rows for the SKUs they name (07A-001..010, 08A-007/008/017/018/019 and the fixed-price 08A set, 01F holiday SKUs), with the contract view derived from them. No fixture was built or verified in this session.
- Narrower repair than exclusion: seed minimal fixtures per file instead of dropping the migration from the replay. Preferred over exclusion; exclusion stays a fallback requiring owner decision.

## E3. Two proof migrations (identical SQL under different source versions)
- Ledger `20261007011038 prove_recurring_dynamic_payment_path` (md5 fd346886ffc5…), identical to source `20261007021000`; ledger `20261007011218 prove_recurring_runtime_and_regression` (3d295d6d6e6c…), identical to source `20261007022000`.
- Purpose: define `dd_prove_recurring_*` proof functions (DDL needed by later migrations) and a trailing `DO $$` that runs them against Production SKUs and raises `RECURRING_*_PROOF_FAILED` / `RECURRING_RELEASE_REGRESSION_DROPPED_EXISTING_LIVE_READY`.
- Why replay fails: the DO blocks assert Production pricing/Stripe rows.
- Classification: Production-only dependency in an assertion; the function definitions are real schema and must be kept.
- This is the exception the auto-mode classifier refused when I tried to strip the DO blocks. It remains refused here: stripping or skipping proof is a weakened assertion.
- Narrower repair: keep both files intact and satisfy the assertions with disposable fixtures (recurring SKUs with LOCKED/ACTIVE pricing rules and Stripe register rows), proven independently from the function bodies. If fixtures cannot be independently justified, the replay stays held.

## E4. Two off-ledger tables
- `dd_content_draft_queue` (16 columns) and `dd_execution_package_routing` (8 columns) exist in Production and are used by later migrations; no migration in ledger or source creates them.
- Classification: genuine source defect (missing creation history), not Production-only data.
- Read-only catalog facts (Production): `dd_execution_package_routing` PK `package_code`, FK `package_code` → `dd_governed_packages(package_code)` ON DELETE CASCADE, CHECK `channel_code` in CH01–CH05. `dd_content_draft_queue` shows no PK/FK/CHECK constraints in `pg_constraint` (id uuid default `gen_random_uuid()`, `status` default `'RESEARCH'`, `auto_publish_allowed` default false, `owner_review_required` default true).
- **Done 2026-10-11 (PR #591 branch, no exclusion, no assertion removed):** `supabase/migrations/20261006234500_forensic_recover_offledger_content_and_routing_tables.sql`, allowlisted in `replay-prerequisites.txt` like the existing `forensic_recover_*` files. Idempotent (`IF NOT EXISTS`), no data. Catalog facts also include RLS enabled with no policies and service_role-only grants. Verification: column signature md5 (name, type, nullability, default, order) equals Production for both tables (`fea73d15…`, `5d49af65…`); in the local replay the two consumers (`20261006235422`, `20261007014229`) fail with "relation does not exist" without it and no longer fail with it (135 to 133 local failures). The local replay is a preview with shim noise, not the gate; the CI replay is still held at E1. Not proven: PK/index parity for `dd_content_draft_queue` beyond the catalog (Production has none).

## Held gates
Approving any of E1–E4 is an owner/review decision. Until then PR #591's replay gate stays red by design and the PR must not merge.
