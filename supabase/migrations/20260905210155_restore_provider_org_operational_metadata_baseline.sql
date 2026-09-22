begin;
alter table public.dd_provider_organizations
 add column if not exists website text,
 add column if not exists capability_summary text,
 add column if not exists services_evidence text,
 add column if not exists operating_rule text;
commit;