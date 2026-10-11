-- Minimal Supabase surface for fast local DDL-dependency replay on plain PostgreSQL. NOT a substitute for the
-- isolated Supabase replay in CI; it only finds missing-object/ordering failures quickly.
do $$ begin
  perform 1;
  create role anon nologin; create role authenticated nologin; create role service_role nologin bypassrls;
  create role authenticator noinherit login; create role supabase_admin superuser login; create role supabase_auth_admin nologin;
  create role dashboard_user nologin; create role supabase_storage_admin nologin; create role supabase_functions_admin nologin;
exception when duplicate_object then null; end $$;
create schema if not exists extensions; create schema if not exists auth; create schema if not exists storage;
create schema if not exists graphql; create schema if not exists graphql_public; create schema if not exists vault;
create schema if not exists realtime; create schema if not exists cron; create schema if not exists net; create schema if not exists supabase_functions;
create extension if not exists pgcrypto with schema extensions; create extension if not exists "uuid-ossp" with schema extensions;
create extension if not exists pg_trgm with schema extensions; create extension if not exists btree_gist with schema extensions;
create extension if not exists citext with schema extensions; create extension if not exists unaccent with schema extensions;
grant usage on schema public, extensions to anon, authenticated, service_role;
alter database replay set search_path = "$user", public, extensions;
create table if not exists auth.users (id uuid primary key default gen_random_uuid(), email text, phone text, raw_user_meta_data jsonb default '{}', raw_app_meta_data jsonb default '{}', created_at timestamptz default now(), updated_at timestamptz default now(), email_confirmed_at timestamptz, last_sign_in_at timestamptz, role text, aud text, encrypted_password text, confirmed_at timestamptz, is_anonymous boolean default false);
create table if not exists auth.identities (id uuid primary key default gen_random_uuid(), user_id uuid, provider text);
create or replace function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claim.sub', true),'')::uuid $$;
create or replace function auth.role() returns text language sql stable as $$ select coalesce(nullif(current_setting('request.jwt.claim.role', true),''),'anon') $$;
create or replace function auth.jwt() returns jsonb language sql stable as $$ select coalesce(nullif(current_setting('request.jwt.claims', true),''),'{}')::jsonb $$;
create or replace function auth.email() returns text language sql stable as $$ select nullif(current_setting('request.jwt.claim.email', true),'') $$;
create table if not exists storage.buckets (id text primary key, name text unique not null, owner uuid, public boolean default false, file_size_limit bigint, allowed_mime_types text[], created_at timestamptz default now(), updated_at timestamptz default now());
create table if not exists storage.objects (id uuid primary key default gen_random_uuid(), bucket_id text references storage.buckets(id), name text, owner uuid, metadata jsonb, path_tokens text[], created_at timestamptz default now(), updated_at timestamptz default now(), last_accessed_at timestamptz, version text, user_metadata jsonb);
alter table storage.objects enable row level security; alter table storage.buckets enable row level security;
create or replace function storage.foldername(name text) returns text[] language sql as $$ select string_to_array(name,'/') $$;
create or replace function storage.filename(name text) returns text language sql as $$ select (string_to_array(name,'/'))[array_length(string_to_array(name,'/'),1)] $$;
create or replace function storage.extension(name text) returns text language sql as $$ select split_part(name,'.',2) $$;
create table if not exists cron.job (jobid bigserial primary key, schedule text, command text, nodename text default 'localhost', nodeport int default 5432, database text default 'replay', username text default 'postgres', active boolean default true, jobname text);
create or replace function cron.schedule(job_name text, schedule text, command text) returns bigint language sql as $$ select 1::bigint $$;
create or replace function cron.schedule(schedule text, command text) returns bigint language sql as $$ select 1::bigint $$;
create or replace function cron.unschedule(job_name text) returns boolean language sql as $$ select true $$;
create or replace function cron.unschedule(job_id bigint) returns boolean language sql as $$ select true $$;
create or replace function net.http_post(url text, body jsonb default '{}', params jsonb default '{}', headers jsonb default '{}', timeout_milliseconds int default 1000) returns bigint language sql as $$ select 1::bigint $$;
create or replace function net.http_get(url text, params jsonb default '{}', headers jsonb default '{}', timeout_milliseconds int default 1000) returns bigint language sql as $$ select 1::bigint $$;
create table if not exists vault.secrets (id uuid primary key default gen_random_uuid(), name text unique, description text, secret text, key_id uuid, created_at timestamptz default now(), updated_at timestamptz default now());
create or replace view vault.decrypted_secrets as select id, name, description, secret, secret as decrypted_secret, created_at, updated_at from vault.secrets;
create or replace function vault.create_secret(new_secret text, new_name text default null, new_description text default '') returns uuid language sql as $$ insert into vault.secrets(secret,name,description) values (new_secret,new_name,new_description) returning id $$;
grant usage on schema auth, storage to anon, authenticated, service_role;
