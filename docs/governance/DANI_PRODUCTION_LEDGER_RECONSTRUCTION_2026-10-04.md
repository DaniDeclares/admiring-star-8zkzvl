# Production migration ledger reconstruction — 2026-10-04

Status: history-first recovery checkpoint for stale PR #520. No Production mutation is authorized by this document.

## Current authority checked

- Canonical source baseline inspected: `main` at `33ddab6824e3c24613dfad347510d4a31c8ec9f5`.
- Production Supabase migration ledger currently contains **578** applied versions; latest observed version is `20261003205721` (`add_referral_link_identity_layer`).
- Stale PR #520 was created from an older base, is 158 commits ahead / 5 commits behind current main, and includes removals/renames that would overwrite newer canonical source if force-merged.

## Demonstrated current source gap

Current main does not contain at least these Production-applied migration files checked directly by exact path:
- `20261003173603_research_executor_convergence_guard.sql`
- `20261003184925_provider_staging_missing_payload_guard_reconciled.sql`
- `20261003205721_add_referral_link_identity_layer.sql`

The stale #520 branch also does not contain those three later Production versions, so rebasing/merging #520 cannot by itself restore current ledger parity.

## Recovery rule

1. Preserve every migration already present on current main; do not delete newer canonical migrations to mimic #520.
2. Treat Production `supabase_migrations.schema_migrations` as evidence of applied version/name/statements, not permission to re-run those statements against Production.
3. Recover only Production-applied versions absent from current canonical source, using the exact Production ledger version/name/statements.
4. Detect timestamp/name collisions before writing files. A same-version conflict must be reconciled explicitly, never silently overwritten.
5. Re-run complete isolated migration replay from a fresh database before the replacement PR can merge.
6. No Production `db push`, reset, ledger edit, or replay is authorized as part of source recovery.
7. Exact-head CI/runtime verification remains required after replay.

## Disposition of #520

`SUPERSEDED / RECONSTRUCTION REQUIRED`.

Do not force-merge or mechanically rebase #520. Its recovered historical source is useful evidence, but the replacement must be generated against current main and the current 578-version Production ledger.

## Refreshed checkpoint — 2026-10-05 (read-only)

The section above is the owner's 2026-10-04 checkpoint from closed-unmerged #563, preserved verbatim. This refresh was measured read-only against Production `supabase_migrations.schema_migrations` and current `main` `943e9b532e4226ff7ca2650152577edd99e8aa5c`. Nothing was written to Production.

- Production ledger: **587** applied versions; latest `20261005143129` (`governed_service_release_evidence_writer`).
- `main`: 595 migration files, 592 distinct version keys.
  - Duplicate version keys on `main` (would fail #520's migration-version hygiene validator): `20260930122500` (×2), `20260930124500` (×2), `20261001150000` (×2).
  - Short/malformed keys on `main`: `20260820_` (Production-owned, allowlisted by #520), `20260823_`, `20260918_`.
- Production versions with no exact version match on `main`: **146**. Of those, 36 have a `main` file with the identical migration name under a different (source-authored) timestamp. **110** have neither an exact version nor an exact name match; some may exist under a renamed file and must be classified individually, not assumed missing.
- Production versions absent from the #520 head (`30d743b7`): **21**, i.e. every version from `20261002211638` through `20261005143129`. #520 is also 46 commits behind `main`.
- Production-only versions applied after #520's base that still have no exact-name source file include `20261003184925` `provider_staging_missing_payload_guard_reconciled`, `20261004175800` `owner_personal_candidate_lane_v1` and `20261004212046` `repair_research_shadow_policy_drift`; direct-applied Production drift is still accruing.

Disposition unchanged: `SUPERSEDED / RECONSTRUCTION REQUIRED`. The isolated-replay data blocker recorded on #520 (null `service_id` at `20260917001856`, service rows existing outside ledgered migrations) is independent of this source-parity count and must be resolved by separating schema recovery from data recovery before any replacement PR can pass replay.
