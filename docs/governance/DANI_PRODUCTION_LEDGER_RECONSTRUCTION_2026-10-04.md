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
