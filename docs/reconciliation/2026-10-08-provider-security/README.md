# Repo reconciliation: provider security fix + Tester fixes
Prepared 2026-10-08 from live database records. Nothing is applied by this package, and nothing needs to be re-run.
Target repo: DaniDeclares/admiring-star-8zkzvl (`main`). Commit through the normal PR flow and record it on issue #549.

## 1. Production security fix → `supabase/migrations/` (commit as-is)
These two files are **byte-identical** to what Production recorded when they were applied. Each MD5 below matches `supabase_migrations.schema_migrations.statements` in Production `ajxezpczaemunlcmqlgl`.

| File (version = Production's recorded version) | MD5 | Bytes |
|---|---|---|
| `20261007153250_provider_application_authority_boundary.sql` | bc93c9f59a7f1b8378ee364326b43e7d | 6928 |
| `20261007153336_provider_application_authority_boundary_triggers.sql` | e1fa7ed5359d11322e024aa36c51f764 | 663 |

- **Use these version numbers exactly.** The earlier file `20261007180000_…` used a different version number. A tool that compares the repo's migrations with the database would see it as unapplied and try to run it again.
- **Production: no action.** Both versions are already recorded as applied there. `supabase migration list` should show them on both sides once committed.
- **Before merging:** search the repo for later migrations that redefine these functions. If one exists, the later one wins, so check that it still contains this protection:
  - `dd_request_is_provider_authority`
  - `dd_guard_provider_application_authority`
  - `dd_guard_provider_w9_authority`
  - `dd_sync_application_agreement_from_signature`
  - `dd_portal_identity_strip_self_assigned_scope`
  - `dd_approve_provider_application`
- **Re-run safety:** if the SQL runs again by accident, nothing changes. The functions and triggers are `create or replace`, and the approval-function repair skips itself when it is already applied.

## 2. Tester history alignment (metadata only; owner/engineer decision)
I checked the six function definitions in both databases by MD5, and they are **identical** in Tester and Production. Only the migration *history* differs: Tester recorded the same fix under different version numbers.

| Tester version | Name |
|---|---|
| 20261007145859 | provider_application_authority_boundary (earlier, shorter text) |
| 20261007153340 | provider_application_authority_boundary_triggers |

To align Tester's history with the repo, run this against **Tester only**. It changes the history table and does not execute SQL:
```
supabase migration repair --status applied 20261007153250 20261007153336
supabase migration repair --status reverted 20261007145859 20261007153340
```
I have not run this.

## 3. Tester-only files → **do not** put in shared `supabase/migrations/` yet
These change machinery that **does not exist in Production**: the automation health supervisor, the research executor, and readiness objects Tester was missing. Committed to the shared folder, they would fail or misapply on the next Production push.

| File | Tester record | Note |
|---|---|---|
| `20261007175900_tester_parity_provider_readiness_objects.sql` | 20261007145426 | Copies existing Production objects into Tester. Skip if the repo already defines these objects. |
| `20261008020000_automation_health_uses_research_operational_class.sql` | 20261008014320 | Health supervisor is Tester-only. |
| `20261008030000_route_internal_cross_project_research_to_evidence_path.sql` | **none**; applied via SQL in parts | Research executor is Tester-only. It has no history row, so record it in Tester's history if this file is committed. |

Find where the repo keeps Tester-only machinery and file these there under Tester's recorded versions. If the repo has no Tester-only location, decide on one first. Promote to Production only through the existing Tester → Production gates, and only if Production ever gets these systems.

## Status
- GitHub access from this session: **blocked** (token invalid). Someone with repo access must commit.
- Live databases: unchanged by this package.