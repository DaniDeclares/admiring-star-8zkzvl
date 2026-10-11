# Production-lineage migration replay (PR #591, Option 1)

Status: REPAIR IN PROGRESS. Evidence and a deterministic assembler are ready; the replay has not yet been run on the assembled set (no Docker locally; CI only). Nothing here changes Production or any migration already applied.

## Why
PR #591's replay replays every file in `supabase/migrations`, which mixes Production-applied migrations with Tester-only ones. The failing file `20260930140500_owner_dani_three_horizon_planning.sql` is Tester-only: Production never applied it, and its prerequisite table `dd_brain_objectives` is created only by Tester migration `20260926180512`, which is in no source branch. A replay that includes Tester-only files cannot verify the Production release scope.

## Evidence: Production ledger (677 rows) vs PR #591 source (750 files)
Hash method: md5 of the SQL with comments, whitespace and semicolons removed (comparison only). Production side computed server-side from `supabase_migrations.schema_migrations.statements`.

| Class | Rows | Meaning | Action in this change |
|---|---|---|---|
| IDENTICAL_SAME_VERSION | 549 | Source file matches the ledger exactly | use source |
| IDENTICAL_DIFFERENT_VERSION | 20 | Same SQL, source filename version differs from the ledger version | use source, renamed to the ledger version in the replay workspace only |
| MISSING_IN_SOURCE | 78 | Applied in Production, no source anywhere on #591 | exact ledger SQL archived |
| SAME_VERSION_CONTENT_DIFFERS | 23 | Source at that version differs from what Production ran | exact ledger SQL archived; repo source left untouched for owner review |
| NAME_MATCH_CONTENT_DIFFERS | 5 | A source with the same name exists but differs | exact ledger SQL archived |
| LEDGER_ROW_WITHOUT_STATEMENTS | 2 | Ledger stores no SQL (`20261006010000`, `20261006230000`) | repo source used, **unverifiable** |

Source-only (not in the ledger by version or SQL): 129 files plus 22 files superseded by archived ledger SQL (149 excluded in total; list in `supabase/production-ledger/excluded-source-files.txt`). They include Tester-only work such as `20260930140500`.

## What was added (additive; no existing migration edited)
- `supabase/production-ledger/<version>_<name>.sql`: 106 files of exact Production-applied SQL, each verified against the server-side hash. Located outside `supabase/migrations`, so `supabase db push` and the duplicate-version check are unaffected.
- `supabase/production-ledger/manifest.json`: classification, hash and source mapping for all 677 rows.
- `supabase/production-ledger/replay-prerequisites.txt`: explicit allowlist of the nine forensic reconstruction files #591 already carries. Not silently extended.
- `scripts/assemble_production_replay_workspace.py`: builds the replay set. For each ledger row it picks hash-matching SQL (archive, else source, renamed if needed); any row without verified SQL is an error. Tested against #591's head: 677 ledger rows give 686 files (106 archived, 549 same-version source, 20 renamed source, 2 unverified, 9 prerequisites), zero errors.

## Integrating into #591 (not done: that branch belongs to another agent)
Add before the existing re-keying and patch steps in `supabase-migration-replay.yml`:
```yaml
- name: Assemble Production-lineage migrations
  run: |
    python3 scripts/assemble_production_replay_workspace.py . /tmp/prod-migrations --report assembly-report.json
    rm -f supabase/migrations/*.sql && cp /tmp/prod-migrations/*.sql supabase/migrations/
```
The existing disposable-copy shims should be re-evaluated: some patch files that are now replaced by exact ledger SQL.

## Not claimed
- The replay has not passed. Excluding Tester-only files may expose further hidden prerequisites; each must be added to the allowlist with evidence, not shimmed away.
- The 23 + 5 drifted source files need an owner decision: keep the repo version (and accept that source differs from what Production ran) or align source to the ledger.
- Tester-only migrations (including `20260926180512` and `20260930140500`) need their own promotion preflight; they must not be promoted merely to satisfy a replay dependency.
