begin;
alter table public.dd_provider_organizations
 add column if not exists primary_contact_name text,
 add column if not exists compliance_tier text not null default 'STANDARD',
 add column if not exists source_reference text;
commit;