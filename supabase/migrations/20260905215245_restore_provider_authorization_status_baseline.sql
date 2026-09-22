begin;
alter table public.dd_provider_organizations
  add column if not exists permission_status text not null default 'PENDING',
  add column if not exists qualification_status text not null default 'PENDING';
commit;