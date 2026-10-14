
create table if not exists public.dd_business_records (
  id uuid primary key default gen_random_uuid(),
  record_type text not null,
  record_name text not null,
  issuer text,
  effective_date date,
  expiration_date date,
  status text not null default 'ACTIVE',
  facts jsonb not null default '{}'::jsonb,
  source_document text,
  source_note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(record_type, record_name)
);
alter table public.dd_business_records enable row level security;
drop policy if exists dd_business_records_staff_select on public.dd_business_records;
create policy dd_business_records_staff_select on public.dd_business_records for select to authenticated using (private.dd_is_staff_admin());
revoke all on public.dd_business_records from anon;
grant select,insert,update,delete on public.dd_business_records to authenticated;

create table if not exists public.dd_research_leads (
  id uuid primary key default gen_random_uuid(),
  channel_code text not null,
  company_name text not null,
  market text,
  address text,
  research_priority text,
  research_profile text,
  research_claims jsonb not null default '{}'::jsonb,
  verification_status text not null default 'UNVERIFIED',
  promotion_status text not null default 'RESEARCH_ONLY',
  source_document text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(channel_code, company_name)
);
alter table public.dd_research_leads enable row level security;
drop policy if exists dd_research_leads_staff_select on public.dd_research_leads;
create policy dd_research_leads_staff_select on public.dd_research_leads for select to authenticated using (private.dd_is_staff_admin());
revoke all on public.dd_research_leads from anon;
grant select,insert,update,delete on public.dd_research_leads to authenticated;

comment on table public.dd_business_records is 'Canonical internal registry for DANI DECLARES entity, registration, address, procurement, insurance, and other business-record facts. Sensitive identity-document numbers must not be stored here.';
comment on table public.dd_research_leads is 'Research-only prospect staging. Claims from research documents are not treated as verified CRM facts and must be independently verified before promotion to dd_sales_queue.';
