begin;
alter table public.dd_providers
 add column if not exists provider_code text,
 add column if not exists contact_name text,
 add column if not exists role_title text;
commit;