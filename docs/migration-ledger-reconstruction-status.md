# Migration ledger reconstruction — clean branch status

**Branch:** `codex/migration-ledger-reconstruction-from-main`  
**Base:** current `main` (`88a6a8c1`)  
**Historical green evidence:** PR #591 @ `84bdbb5` (run 38635766414) — preserved, not substituted

## Business capability protected

Reproducible Production schema reconstruction so quoting, payments, dispatch, provider permissions, and job completion cannot silently diverge from the live database.

## Transferred (exact Production / proven content)

### Scripts and tests
- `scripts/assemble_production_replay_workspace.py`
- `scripts/replay_shim_provider_guard_format.py`
- `scripts/replay_seed_services_prerequisite.py`
- `scripts/replay_skip_production_proofs.py`
- Matching unit tests for the three replay helpers

### Ledger support files
- `supabase/production-ledger/replay-prerequisites.txt`
- `supabase/production-ledger/excluded-source-files.txt`

### Archived SQL (exact text)
- Provider staging guard reconcile
- Provider applications grants
- Phase1 cohort uniqueness / Chris evidence
- Unprotected operational tables lock-down
- Division 10 vendor services
- DNI-01A-001 Stripe checkout verification
- Dani specials division 02 prices
- Security invoker views / function paths
- Business records + research leads tables
- D04 live Stripe catalog verification

## Still required before isolated replay

1. Full `manifest.json` (677 rows, hybrid cutoff `20260930140500`)
2. Remaining production-ledger archived SQL (~60+ files)
3. Complete `supabase-migration-replay.yml` adapted for this branch + `workflow_dispatch` (content prepared; not yet committed)
4. Forensic recovery migrations listed in `replay-prerequisites.txt`
5. Own green `supabase start` + `supabase db reset --no-seed` on this branch

## Rules

- No force-merge of PR #591
- No Production changes
- New branch must earn its own green replay before merge
- Historical green on `84bdbb5` is evidence for that commit only
