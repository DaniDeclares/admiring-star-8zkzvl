-- DANI DECLARES LLC
-- Phase 4 / Migration 1 preflight verification
-- READ-ONLY: this script must not modify the database.
-- Run in Supabase SQL Editor against the target database BEFORE migration execution.

-- 1. Expected new tables must not already exist.
SELECT
  table_name,
  CASE
    WHEN table_name IS NULL THEN 'PASS'
    ELSE 'COLLISION'
  END AS status
FROM (VALUES
  ('dd_portal_profiles'),
  ('dd_user_roles'),
  ('dd_audit_logs')
) AS expected(table_name)
LEFT JOIN information_schema.tables t
  ON t.table_schema = 'public'
 AND t.table_name = expected.table_name
ORDER BY table_name;

-- 2. Existing shared timestamp function must exist with zero arguments.
SELECT
  n.nspname AS schema_name,
  p.proname AS function_name,
  pg_get_function_identity_arguments(p.oid) AS arguments,
  CASE
    WHEN n.nspname = 'public'
     AND p.proname = 'set_updated_at'
     AND pg_get_function_identity_arguments(p.oid) = ''
    THEN 'PASS'
    ELSE 'CHECK'
  END AS status
FROM pg_proc p
JOIN pg_namespace n ON n.oid = p.pronamespace
WHERE n.nspname = 'public'
  AND p.proname = 'set_updated_at';

-- 3. Audit mutation function must not already exist in public.
SELECT
  COUNT(*) AS existing_dd_prevent_audit_log_mutation_signatures,
  CASE WHEN COUNT(*) = 0 THEN 'PASS' ELSE 'COLLISION' END AS status
FROM pg_proc p
JOIN pg_namespace n ON n.oid = p.pronamespace
WHERE n.nspname = 'public'
  AND p.proname = 'dd_prevent_audit_log_mutation';

-- 4. Existing production tables referenced by the migration must remain present.
SELECT
  table_name,
  CASE WHEN EXISTS (
    SELECT 1
    FROM information_schema.tables t
    WHERE t.table_schema = 'public'
      AND t.table_name = expected.table_name
  ) THEN 'PASS' ELSE 'MISSING' END AS status
FROM (VALUES
  ('services'),
  ('divisions'),
  ('dd_estimates'),
  ('fieldops_estimates'),
  ('leads'),
  ('service_requests')
) AS expected(table_name)
ORDER BY table_name;

-- 5. No pre-existing migration-1 tables should have policies before execution.
SELECT
  schemaname,
  tablename,
  policyname,
  'UNEXPECTED PRE-EXISTING POLICY' AS status
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN ('dd_portal_profiles', 'dd_user_roles', 'dd_audit_logs')
ORDER BY tablename, policyname;

-- 6. No pre-existing migration-1 trigger should exist before execution.
SELECT
  n.nspname AS schema_name,
  c.relname AS table_name,
  tg.tgname AS trigger_name,
  'UNEXPECTED PRE-EXISTING TRIGGER' AS status
FROM pg_trigger tg
JOIN pg_class c ON c.oid = tg.tgrelid
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE n.nspname = 'public'
  AND NOT tg.tgisinternal
  AND (
    c.relname IN ('dd_portal_profiles', 'dd_user_roles', 'dd_audit_logs')
    OR tg.tgname IN (
      'trg_dd_portal_profiles_updated_at',
      'trg_dd_user_roles_updated_at',
      'trg_dd_audit_logs_immutable'
    )
  )
ORDER BY c.relname, tg.tgname;

-- 7. Confirm the existing public.set_updated_at() definition is the expected
-- timestamp helper. This is informational/read-only; do not replace it here.
SELECT pg_get_functiondef(p.oid) AS set_updated_at_definition
FROM pg_proc p
JOIN pg_namespace n ON n.oid = p.pronamespace
WHERE n.nspname = 'public'
  AND p.proname = 'set_updated_at'
  AND pg_get_function_identity_arguments(p.oid) = '';

-- 8. Static safety reminder: this verification script intentionally contains
-- SELECT statements only. It does not CREATE, ALTER, DROP, INSERT, UPDATE,
-- DELETE, GRANT, REVOKE, or execute migration SQL.
