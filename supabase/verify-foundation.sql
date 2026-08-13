-- DANI DECLARES LLC
-- Phase 4 / Migration 1: Foundation preflight
--
-- READ-ONLY ONLY. Run this in the Supabase SQL Editor before applying
-- supabase/migrations/20260812_01_foundation.sql.
--
-- This script performs catalog reads only. It contains NO CREATE, ALTER,
-- DROP, INSERT, UPDATE, DELETE, TRUNCATE, or data-changing function calls.
--
-- Expected pre-Migration-1 state:
--   * auth.users exists
--   * dd_portal_profiles does not exist in public
--   * dd_user_roles does not exist in public
--   * dd_audit_logs does not exist in public
--   * public.set_updated_at() exists exactly once with zero arguments
--   * public.dd_prevent_audit_log_mutation() does not exist
--   * Migration 1 trigger/policy names do not already exist in public

-- ---------------------------------------------------------------------------
-- 1. Required Supabase auth dependency
-- ---------------------------------------------------------------------------
select
  case when exists (
    select 1
    from pg_class c
    join pg_namespace n on n.oid = c.relnamespace
    where n.nspname = 'auth'
      and c.relname = 'users'
      and c.relkind = 'r'
  ) then 'PASS' else 'FAIL' end as result,
  'auth.users exists' as check_name;

-- ---------------------------------------------------------------------------
-- 2. Migration 1 table collision check
-- ---------------------------------------------------------------------------
select
  expected.table_name,
  case when c.oid is null then 'PASS' else 'FAIL' end as result,
  case when c.oid is null then 'not found' else 'ALREADY EXISTS' end as observed
from (
  values
    ('dd_portal_profiles'),
    ('dd_user_roles'),
    ('dd_audit_logs')
) as expected(table_name)
left join pg_class c
  on c.relname = expected.table_name
left join pg_namespace n
  on n.oid = c.relnamespace
 and n.nspname = 'public'
 and c.relkind in ('r', 'p')
order by expected.table_name;

-- ---------------------------------------------------------------------------
-- 3. Existing public.set_updated_at() signature
-- ---------------------------------------------------------------------------
select
  case when count(*) = 1 then 'PASS' else 'FAIL' end as result,
  'public.set_updated_at() zero-argument signature' as check_name,
  count(*)::text as observed_count,
  coalesce(string_agg(pg_get_function_identity_arguments(p.oid), ', '), '(none)') as arguments
from pg_proc p
join pg_namespace n on n.oid = p.pronamespace
where n.nspname = 'public'
  and p.proname = 'set_updated_at'
  and pg_get_function_identity_arguments(p.oid) = '';

-- ---------------------------------------------------------------------------
-- 4. Audit mutation function collision
-- ---------------------------------------------------------------------------
select
  case when count(*) = 0 then 'PASS' else 'FAIL' end as result,
  'public.dd_prevent_audit_log_mutation() must be absent before migration' as check_name,
  count(*)::text as observed_count
from pg_proc p
join pg_namespace n on n.oid = p.pronamespace
where n.nspname = 'public'
  and p.proname = 'dd_prevent_audit_log_mutation'
  and pg_get_function_identity_arguments(p.oid) = '';

-- ---------------------------------------------------------------------------
-- 5. Trigger-name collision checks
-- ---------------------------------------------------------------------------
-- These names exactly match the triggers created by Migration 1.
select
  expected.trigger_name,
  case when t.oid is null then 'PASS' else 'FAIL' end as result,
  case when t.oid is null then 'not found' else 'ALREADY EXISTS' end as observed
from (
  values
    ('trg_dd_portal_profiles_updated_at'),
    ('trg_dd_user_roles_updated_at'),
    ('trg_dd_audit_logs_immutable')
) as expected(trigger_name)
left join pg_trigger t
  on t.tgname = expected.trigger_name
 and not t.tgisinternal
order by expected.trigger_name;

-- ---------------------------------------------------------------------------
-- 6. Policy-name collision checks
-- ---------------------------------------------------------------------------
-- These names exactly match the policies created by Migration 1.
select
  expected.policy_name,
  case when p.policyname is null then 'PASS' else 'FAIL' end as result,
  case when p.policyname is null then 'not found' else 'ALREADY EXISTS' end as observed
from (
  values
    ('dd_portal_profiles_select_own'),
    ('dd_portal_profiles_update_own'),
    ('dd_user_roles_select_own')
) as expected(policy_name)
left join pg_policies p
  on p.schemaname = 'public'
 and p.policyname = expected.policy_name
order by expected.policy_name;

-- ---------------------------------------------------------------------------
-- 7. Existing target objects, if any
-- ---------------------------------------------------------------------------
select
  n.nspname as schema_name,
  c.relname as object_name,
  case c.relkind
    when 'r' then 'table'
    when 'p' then 'partitioned table'
    when 'v' then 'view'
    when 'm' then 'materialized view'
    when 'S' then 'sequence'
    when 'f' then 'foreign table'
    else c.relkind::text
  end as object_type,
  'REVIEW' as result
from pg_class c
join pg_namespace n on n.oid = c.relnamespace
where n.nspname = 'public'
  and c.relname in ('dd_portal_profiles', 'dd_user_roles', 'dd_audit_logs')
order by c.relname;

-- ---------------------------------------------------------------------------
-- 8. Existing columns on target objects, if any
-- ---------------------------------------------------------------------------
select
  table_name,
  column_name,
  data_type,
  udt_name,
  is_nullable,
  column_default
from information_schema.columns
where table_schema = 'public'
  and table_name in ('dd_portal_profiles', 'dd_user_roles', 'dd_audit_logs')
order by table_name, ordinal_position;

-- ---------------------------------------------------------------------------
-- 9. Existing triggers on target objects, if any
-- ---------------------------------------------------------------------------
select
  n.nspname as schema_name,
  c.relname as table_name,
  t.tgname as trigger_name,
  pg_get_triggerdef(t.oid, true) as trigger_definition
from pg_trigger t
join pg_class c on c.oid = t.tgrelid
join pg_namespace n on n.oid = c.relnamespace
where n.nspname = 'public'
  and c.relname in ('dd_portal_profiles', 'dd_user_roles', 'dd_audit_logs')
  and not t.tgisinternal
order by c.relname, t.tgname;

-- ---------------------------------------------------------------------------
-- 10. Existing policies on target objects, if any
-- ---------------------------------------------------------------------------
select
  schemaname,
  tablename,
  policyname,
  roles,
  cmd,
  qual,
  with_check
from pg_policies
where schemaname = 'public'
  and tablename in ('dd_portal_profiles', 'dd_user_roles', 'dd_audit_logs')
order by tablename, policyname;

-- ---------------------------------------------------------------------------
-- 11. RLS state on target objects, if any
-- ---------------------------------------------------------------------------
select
  n.nspname as schema_name,
  c.relname as table_name,
  c.relrowsecurity as rls_enabled,
  c.relforcerowsecurity as rls_forced
from pg_class c
join pg_namespace n on n.oid = c.relnamespace
where n.nspname = 'public'
  and c.relname in ('dd_portal_profiles', 'dd_user_roles', 'dd_audit_logs')
order by c.relname;

-- ---------------------------------------------------------------------------
-- 12. Foreign keys involving target objects, if any
-- ---------------------------------------------------------------------------
select
  tc.table_name,
  tc.constraint_name,
  kcu.column_name,
  ccu.table_schema as referenced_schema,
  ccu.table_name as referenced_table,
  ccu.column_name as referenced_column
from information_schema.table_constraints tc
join information_schema.key_column_usage kcu
  on tc.constraint_name = kcu.constraint_name
 and tc.table_schema = kcu.table_schema
join information_schema.constraint_column_usage ccu
  on ccu.constraint_name = tc.constraint_name
 and ccu.table_schema = tc.table_schema
where tc.constraint_type = 'FOREIGN KEY'
  and tc.table_schema = 'public'
  and (
    tc.table_name in ('dd_portal_profiles', 'dd_user_roles', 'dd_audit_logs')
    or ccu.table_name in ('dd_portal_profiles', 'dd_user_roles', 'dd_audit_logs')
  )
order by tc.table_name, tc.constraint_name, kcu.ordinal_position;

-- ---------------------------------------------------------------------------
-- 13. Compact final safety summary
-- ---------------------------------------------------------------------------
select
  (select count(*)
   from pg_class c
   join pg_namespace n on n.oid = c.relnamespace
   where n.nspname = 'public'
     and c.relname in ('dd_portal_profiles', 'dd_user_roles', 'dd_audit_logs')
     and c.relkind in ('r', 'p')) as existing_foundation_tables,
  (select count(*)
   from pg_proc p
   join pg_namespace n on n.oid = p.pronamespace
   where n.nspname = 'public'
     and p.proname = 'dd_prevent_audit_log_mutation'
     and pg_get_function_identity_arguments(p.oid) = '') as existing_audit_mutation_functions,
  (select count(*)
   from pg_proc p
   join pg_namespace n on n.oid = p.pronamespace
   where n.nspname = 'public'
     and p.proname = 'set_updated_at'
     and pg_get_function_identity_arguments(p.oid) = '') as existing_set_updated_at_functions,
  'Expected: 0, 0, 1' as expected_counts;

-- ---------------------------------------------------------------------------
-- 14. Production baseline inventory (read-only)
-- ---------------------------------------------------------------------------
select
  table_name,
  table_type
from information_schema.tables
where table_schema = 'public'
order by table_name;

-- ---------------------------------------------------------------------------
-- IMPORTANT
-- ---------------------------------------------------------------------------
-- This file is a verification artifact only. It does not execute Migration 1.
-- Do not treat a PASS result as authorization to apply the migration until the
-- returned results have been reviewed against the branch SQL and live baseline.
