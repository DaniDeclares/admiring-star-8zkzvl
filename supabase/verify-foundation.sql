-- DANI DECLARES LLC
-- Phase 4 / Migration 1: Foundation preflight
-- READ-ONLY: This script performs catalog inspection only.
-- It does NOT CREATE, ALTER, DROP, INSERT, UPDATE, DELETE, or execute functions.
-- Run in Supabase SQL Editor before applying 20260812_01_foundation.sql.

-- 1. Existing object collisions for Migration 1.
select
  n.nspname as schema_name,
  c.relname as object_name,
  case c.relkind
    when 'r' then 'table'
    when 'p' then 'partitioned table'
    when 'v' then 'view'
    when 'm' then 'materialized view'
    when 'f' then 'foreign table'
    else c.relkind::text
  end as object_type
from pg_class c
join pg_namespace n on n.oid = c.relnamespace
where n.nspname = 'public'
  and c.relname in ('dd_portal_profiles', 'dd_user_roles', 'dd_audit_logs')
order by c.relname;

-- 2. Existing function signatures relevant to Migration 1.
select
  n.nspname as schema_name,
  p.proname as function_name,
  pg_get_function_identity_arguments(p.oid) as arguments,
  pg_get_function_result(p.oid) as return_type
from pg_proc p
join pg_namespace n on n.oid = p.pronamespace
where n.nspname = 'public'
  and p.proname in ('set_updated_at', 'dd_prevent_audit_log_mutation')
order by p.proname, arguments;

-- 3. Existing triggers on the three target tables.
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

-- 4. Existing policies on the three target tables.
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

-- 5. RLS state on the three target tables, if they already exist.
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

-- 6. Columns on any existing target tables. Useful for detecting drift before
-- an IF NOT EXISTS migration is ever considered safe to re-run.
select
  c.table_name,
  c.column_name,
  c.data_type,
  c.udt_name,
  c.is_nullable,
  c.column_default
from information_schema.columns c
where c.table_schema = 'public'
  and c.table_name in ('dd_portal_profiles', 'dd_user_roles', 'dd_audit_logs')
order by c.table_name, c.ordinal_position;

-- 7. Foreign keys involving the three target tables.
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

-- 8. Compact pass/fail summary. These are catalog reads only.
select
  'target_table_collision' as check_name,
  case when count(*) = 0 then 'PASS' else 'REVIEW' end as result,
  count(*)::text as observed_count
from pg_class c
join pg_namespace n on n.oid = c.relnamespace
where n.nspname = 'public'
  and c.relname in ('dd_portal_profiles', 'dd_user_roles', 'dd_audit_logs')
  and c.relkind in ('r', 'p');

select
  'set_updated_at_zero_arg_signature' as check_name,
  case when count(*) = 1 then 'PASS' else 'REVIEW' end as result,
  count(*)::text as observed_count
from pg_proc p
join pg_namespace n on n.oid = p.pronamespace
where n.nspname = 'public'
  and p.proname = 'set_updated_at'
  and pg_get_function_identity_arguments(p.oid) = '';

select
  'audit_mutation_function_collision' as check_name,
  case when count(*) = 0 then 'PASS' else 'REVIEW' end as result,
  count(*)::text as observed_count
from pg_proc p
join pg_namespace n on n.oid = p.pronamespace
where n.nspname = 'public'
  and p.proname = 'dd_prevent_audit_log_mutation';
