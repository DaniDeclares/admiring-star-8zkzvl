# Production migration ledger reconciliation — 2026-10-09

Read-only evidence from the Production Supabase project `ajxezpczaemunlcmqlgl`. Supabase MCP apply_migration generated versions different from the repository SQL filenames. **Do not replay the migrations or rewrite Supabase migration history blindly.**

| Repository migration version | Name | Production recorded version |
| --- | --- | --- |
| 20261007223000 | guard_sales_touch_evidence | 20261009003359 |
| 20261008180000 | extend_buyer_evidence_exact_inbound_source | 20261009003404 |
| 20261008194500 | tighten_buyer_stated_attribution | 20261009003407 |
| 20261008200500 | require_verified_source_for_stated | 20261009003410 |
| 20261008193000 | commercial_readiness_diagnostic_v1 | 20261009003550 |

Provider-security migration versions `20261007153250` and `20261007153336` were already applied to Production; preserve these records and do not replay.

## Safe automation
Run `node scripts/checkProductionMigrationLedger.mjs production-migration-ledger.json` before any migration rollout, using a freshly exported read-only migration list. Nonzero exit means stop and reconcile manually; it **never** applies migrations, alters history, contacts customers, or grants database access.

This is a preflight guard, not an automatic migration executor. Existing deploy and database authorities remain unchanged. A future CI integration must obtain the current ledger securely, avoid exposing credentials, compare migration SQL fingerprints (not just names), and fail closed on mismatches before enabling automatic rollout.
