# Dani Declares LLC — Phase 4 Database Baseline

## Verification status

**Repository baseline: audited. Live Supabase public-table catalog: verified read-only on 2026-08-12.**

The live catalog was supplied from the Supabase SQL Editor using a read-only `information_schema.tables` query. No production data was modified and no migration was executed.

## Live `public` table inventory

The verified base tables currently present in `public` are:

- `dd_estimate_addons`
- `dd_estimate_media`
- `dd_estimate_packages`
- `dd_estimates`
- `dd_estimator_settings`
- `dd_followup_tasks`
- `dd_invoices`
- `dd_job_tasks`
- `dd_jobs`
- `dd_service_addons`
- `dd_service_packages`
- `dd_travel_calculations`
- `divisions`
- `fieldops_addons`
- `fieldops_estimate_addons`
- `fieldops_estimate_media`
- `fieldops_estimate_packages`
- `fieldops_estimate_tasks`
- `fieldops_estimates`
- `fieldops_estimator_settings`
- `fieldops_packages`
- `fieldops_travel_calculations`
- `followups`
- `leads`
- `marketing_sources`
- `service_requests`
- `services`

### Baseline conclusion

The live catalog confirms that the core operational schema already exists. In particular, `services`, `divisions`, estimates, jobs, invoices, field-operations tables, leads, followups, and service requests are already present.

Migration 1 therefore **must not create replacement versions** of those tables. Future catalog work should extend or reference these canonical tables rather than introduce parallel `services`, `properties`, `work_orders`, or payment tables without first reconciling the existing schema.

The three Migration 1 application tables — `dd_portal_profiles`, `dd_user_roles`, and `dd_audit_logs` — do **not** appear in the supplied live table inventory, so there is no table-name collision with the proposed foundation layer.

## Existing repository schema evidence

`prisma/schema.prisma` models the same established operational families confirmed in the live inventory, including:

- `leads`
- `service_requests`
- `divisions`
- `services`
- `dd_estimates`
- `dd_estimate_addons`
- `dd_estimate_media`
- `dd_estimate_packages`
- `dd_estimator_settings`
- `dd_followup_tasks`
- `dd_invoices`
- `dd_job_tasks`
- `dd_jobs`
- `dd_service_addons`
- `dd_service_packages`
- `dd_travel_calculations`
- `fieldops_addons`
- `fieldops_estimates`
- `fieldops_estimate_addons`
- `fieldops_estimate_media`
- `fieldops_estimate_packages`
- `fieldops_estimate_tasks`
- `fieldops_estimator_settings`
- `fieldops_packages`
- `fieldops_travel_calculations`

This alignment is strong evidence that the existing Prisma schema and deployed database were built from substantially the same operational model.

## Existing database/RLS artifacts in the repository

There are two copies of the same RLS SQL artifact:

- `supabase_rls.sql`
- `prisma/migrations/supabase_rls.sql`

Both currently contain RLS for `leads`, `service_requests`, and `job_photos`. The repository copy of the tracking RPC is malformed (`AS 476 ... 476;`) and must **not** be executed as-is. This is a repository hygiene issue and is separate from Migration 1.

The existing RLS policy design also grants public anonymous insert access to leads/service requests and public select access to job photos. Those policies must be reviewed against the live database before the Operations Command Center is exposed.

## Existing planned portal schema

`DATABASE_CHANGE_LOG.md` contains a documentation-only proposal for `dd_portal_profiles`, including:

- `user_id` linked to `auth.users`
- role
- contact/company fields
- active flag
- referral lineage
- metadata
- timestamps
- planned indexes and RLS

That documentation explicitly says the schema was **not executed**. Migration 1 therefore uses the same table name but deliberately removes `role` from the profile table and establishes `dd_user_roles` as the sole application authorization source of truth.

## Migration 1 scope

`supabase/migrations/20260812_01_foundation.sql` is a **draft** and is intentionally additive:

1. `dd_portal_profiles`
2. `dd_user_roles`
3. `dd_audit_logs`
4. reuse of the existing `public.set_updated_at()` trigger function
5. database-level append-only protection for `dd_audit_logs`
6. RLS on the three new tables

It does **not** alter, rename, drop, migrate, or backfill any existing business table.

## Static safety review status

The draft migration was reviewed line-by-line against the verified baseline.

### Safe characteristics confirmed

- Wrapped in an explicit transaction (`begin` / `commit`), so a migration error should roll back the migration's DDL as a unit.
- No `ALTER`, `DROP`, `RENAME`, `UPDATE`, `DELETE`, or `INSERT` operations target existing business tables.
- The only trigger drops are guarded `drop trigger if exists` statements on the three new tables.
- `dd_portal_profiles` contains no authorization `role` column.
- `dd_user_roles` is the sole role store introduced by Migration 1.
- `dd_audit_logs` has no client-facing INSERT/UPDATE/DELETE policies.
- `dd_audit_logs` has a database trigger that rejects UPDATE and DELETE, including attempts made by roles that bypass RLS.
- The migration reuses the already-verified `public.set_updated_at()` function instead of creating a duplicate timestamp helper.
- No production credentials are present in the migration.

### Remaining pre-production checks

The static review cannot prove the current live state of function names that are not represented in the table inventory. Before execution, run a read-only function collision check for `public.dd_prevent_audit_log_mutation()` and confirm that `public.set_updated_at()` still has the expected trigger signature/definition.

Also confirm the final live columns, RLS policies, constraints, and triggers immediately before execution if any production changes have occurred since the 2026-08-12 baseline capture.

Suggested function check:

```sql
select
  n.nspname as schema_name,
  p.proname as function_name,
  pg_get_function_identity_arguments(p.oid) as identity_arguments,
  pg_get_functiondef(p.oid) as definition
from pg_proc p
join pg_namespace n on n.oid = p.pronamespace
where n.nspname = 'public'
  and p.proname in ('set_updated_at', 'dd_prevent_audit_log_mutation')
order by p.proname;
```

## Safety rule

Do not use the production `DATABASE_URL` in GitHub source, Prisma schema, React code, `.env` files committed to the repository, or migration files. Store credentials only in the local/CI secret store. A password containing special characters must be percent-encoded in a connection URL, but the raw password should never be placed in the repository.
