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
- `fieldops_travel_calculations`
- `fieldops_packages`

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

That documentation explicitly says the schema was **not executed**. Migration 1 therefore uses the same table name and extends the plan with the minimum security foundation required for the authenticated operations layer.

## Migration 1 scope

`supabase/migrations/20260812_01_foundation.sql` is a **draft** and is intentionally additive:

1. `dd_portal_profiles`
2. `dd_user_roles`
3. `dd_audit_logs`
4. shared `dd_set_updated_at()` trigger function
5. RLS on the three new tables

It does **not** alter, rename, drop, migrate, or backfill any existing business table.

## Remaining live verification gate before execution

The table-name inventory is now verified, but **Migration 1 should still not be executed yet**. Before execution, run read-only checks for:

```sql
select table_schema, table_name, column_name, data_type, is_nullable, column_default
from information_schema.columns
where table_schema = 'public'
order by table_schema, table_name, ordinal_position;

select schemaname, tablename, policyname, roles, cmd
from pg_policies
where schemaname = 'public'
order by tablename, policyname;

select n.nspname as schema_name,
       c.relname as table_name,
       con.conname as constraint_name,
       pg_get_constraintdef(con.oid) as definition
from pg_constraint con
join pg_class c on c.oid = con.conrelid
join pg_namespace n on n.oid = c.relnamespace
where n.nspname = 'public'
order by c.relname, con.conname;

select event_object_schema, event_object_table, trigger_name, action_timing, event_manipulation
from information_schema.triggers
where event_object_schema = 'public'
order by event_object_table, trigger_name;
```

These checks verify column-level compatibility, existing RLS policies, foreign-key/constraint conflicts, and trigger/function collisions before the new tables are applied.

## Safety rule

Do not use the production `DATABASE_URL` in GitHub source, Prisma schema, React code, `.env` files committed to the repository, or migration files. Store credentials only in the local/CI secret store. A password containing special characters must be percent-encoded in a connection URL, but the raw password should never be placed in the repository.
