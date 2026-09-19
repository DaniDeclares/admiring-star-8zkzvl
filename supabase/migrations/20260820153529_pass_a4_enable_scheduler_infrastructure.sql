-- PASS A.4 infrastructure prerequisites.
-- Supabase-hosted Cron uses pg_cron + pg_net; Vault is used for scheduler secrets.
create extension if not exists pg_cron with schema pg_catalog;
create extension if not exists supabase_vault;
