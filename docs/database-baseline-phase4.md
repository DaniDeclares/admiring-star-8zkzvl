# Dani Declares LLC — Phase 4 Database Baseline

## Verification status

**Repository baseline: audited. Live Supabase database: not yet queried.**

The connection details supplied for the live database contain a placeholder (`[YOUR-PASSWORD]`), not an actual password. Therefore no live database connection or production query has been attempted. This is intentional: the password should not be committed to GitHub, pasted into source files, or embedded in a migration.

The repository can establish the application-side baseline, but it cannot prove the current live catalog until a read-only database connection is available.

## Existing repository schema evidence

`prisma/schema.prisma` already models an established operational database. Confirmed model families include:

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
- `fieldops_packages` / related field-operations models where present in the Prisma schema

The exact live table set must still be verified with `pg_catalog` / `information_schema` before any destructive or structural migration.

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

## Live verification gate before execution

Before running Migration 1 against Supabase, execute read-only catalog checks equivalent to:

```sql
select table_schema, table_name
from information_schema.tables
where table_schema not in ('pg_catalog', 'information_schema')
order by table_schema, table_name;

select table_schema, table_name, column_name, data_type, is_nullable, column_default
from information_schema.columns
where table_schema not in ('pg_catalog', 'information_schema')
order by table_schema, table_name, ordinal_position;

select schemaname, tablename, policyname, roles, cmd
from pg_policies
where schemaname = 'public'
order by tablename, policyname;
```

Also inspect foreign keys and triggers before applying any migration that touches existing tables.

## Safety rule

Do not use the production `DATABASE_URL` in GitHub source, Prisma schema, React code, `.env` files committed to the repository, or migration files. Store credentials only in the local/CI secret store. A password containing special characters must be percent-encoded in a connection URL, but the raw password should never be placed in the repository.
