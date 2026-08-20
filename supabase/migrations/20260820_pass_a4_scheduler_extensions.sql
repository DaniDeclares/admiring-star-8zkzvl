-- PASS A.4 — Enable Supabase scheduler infrastructure used by the guarded outbox cron.
CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA pg_catalog;
CREATE EXTENSION IF NOT EXISTS supabase_vault;
