begin;

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

insert into public.dd_business_records(record_type,record_name,issuer,effective_date,status,facts,source_document,source_note)
values
('ENTITY_FORMATION','DANI DECLARES LLC — Georgia Domestic LLC','Georgia Secretary of State','2025-04-14','ACTIVE','{"control_number":"25079444","entity_type":"Domestic Limited Liability Company","principal_office":"113 S. Perry Street, Suite 206 #12546, Lawrenceville, GA 30046","registered_agent":"Republic Registered Agent LLC","registered_agent_county":"Gwinnett"}','articles of org(1).pdf','Source document supplied 2026-09-21.'),
('OWNERSHIP_RECORD','DANI DECLARES LLC — Initial Member Record',null,'2025-04-23','ACTIVE','{"initial_member":"Dani Fong","member_address":"113 S. PERRY STREET, SUITE 206 #12546, LAWRENCEVILLE, GA 30046","organizer":"Lovette Dobson","organizer_resigned":true}','statment of the org(1).pdf','Statement and resignation of organizer.'),
('BUSINESS_MAIL','DANI DECLARES LLC — CMRA Business Mail',null,'2025-04-23','ACTIVE','{"business_mail_address":"113 S. Perry Street, Suite 206 #12546, Lawrenceville, GA 30046","service_type":"Business/Organization Use","place_of_registration":"Georgia"}','Application for Delivery of Mail Through Agent(1).pdf','Sensitive personal ID number and residential proof details intentionally excluded.'),
('PROCUREMENT_IDENTITY','DANI DECLARES LLC — Federal Procurement Identity',null,null,'ACTIVE','{"uei":"TD4TSG48LHN9","cage":"17VV2","georgia_control_number":"25079444","naics":["561720","561210","561110","561790"],"cgl_each_occurrence":"1000000","cgl_aggregate":"2000000"}','DANI_DECLARES_Universal_Corporate_Government_Capability_Statement_2026(2).docx','Capability-statement facts; insurance should remain subject to current COI verification.')
on conflict(record_type,record_name) do update set facts=excluded.facts,source_document=excluded.source_document,source_note=excluded.source_note,updated_at=now();

insert into public.dd_research_leads(channel_code,company_name,market,address,research_priority,research_profile,research_claims,verification_status,promotion_status,source_document)
values
('CH02','Concept 21 Memorial','Stone Mountain','5525 Memorial Dr, Stone Mountain, GA','TOP_PRIORITY','Regional multi-property cluster','{"claimed_vendor_route":"direct local approvals","claimed_fit":"turnover/field services"}','UNVERIFIED','RESEARCH_ONLY','Apartments(1).pdf'),
('CH02','Forest Lake Apartments','Stone Mountain','1200 S Hairston Rd, Stone Mountain, GA','TOP_PRIORITY','Local private holding network','{"claimed_vendor_route":"direct to invoice","claimed_fit":"turnover/field services"}','UNVERIFIED','RESEARCH_ONLY','Apartments(1).pdf'),
('CH02','Sundance Apartments','Stone Mountain','2310 Central Dr, Stone Mountain, GA','TOP_PRIORITY','Mid-tier regional portfolio','{"claimed_vendor_route":"standard W-9 / in-house file","claimed_fit":"turnover/field services"}','UNVERIFIED','RESEARCH_ONLY','Apartments(1).pdf'),
('CH02','Woodruff Park Apartments','Chamblee','3480 Chamblee Dunwoody Rd, Chamblee, GA','TOP_PRIORITY','Regional private partnership group','{"claimed_vendor_route":"direct to bookkeeper","claimed_fit":"turnover/field services"}','UNVERIFIED','RESEARCH_ONLY','Apartments(1).pdf'),
('CH02','Chamblee Court Apartments','Chamblee',null,'WARM','Local independent micro-cluster','{"claimed_vendor_route":"direct walk-in","claimed_fit":"turnover/field services"}','UNVERIFIED','RESEARCH_ONLY','Apartments(1).pdf'),
('CH02','Chamblee Dunwoody Courtyards','Chamblee','3100 Chamblee Dunwoody Rd, Chamblee, GA','WARM','Mid-market regional framework','{"claimed_vendor_route":"local operational control","claimed_fit":"turnover/field services"}','UNVERIFIED','RESEARCH_ONLY','Apartments(1).pdf'),
('CH02','Hairston Lake Village','Stone Mountain','1030 N Hairston Rd, Stone Mountain, GA','WARM','Regional southeastern investment portfolio','{"claimed_vendor_route":"in-house vendor folder","claimed_fit":"turnover/field services"}','UNVERIFIED','RESEARCH_ONLY','Apartments(1).pdf'),
('CH02','Marlowe Chamblee','Chamblee','4047 Parsons Dr, Chamblee, GA','WARM','Regional portfolio group','{"claimed_vendor_route":"structured in-house vendor file","claimed_fit":"turnover/field services"}','UNVERIFIED','RESEARCH_ONLY','Apartments(1).pdf'),
('CH02','Peachtree Ridge Apartments','Chamblee','3700 Shallowford Rd, Chamblee, GA','WARM','Regional value-add network','{"claimed_vendor_route":"local manager discretion","claimed_fit":"turnover/field services"}','UNVERIFIED','RESEARCH_ONLY','Apartments(1).pdf'),
('CH02','Stone Mill Apartments','Stone Mountain','1200 Stone Mill Way, Stone Mountain, GA','WARM','Multi-property Southeast syndicate','{"claimed_vendor_route":"in-house accounting","claimed_fit":"turnover/field services"}','UNVERIFIED','RESEARCH_ONLY','Apartments(1).pdf'),
('CH02','Willow Trail Apartments','Stone Mountain','843 N Hairston Rd, Stone Mountain, GA','WARM','Regional value-add joint venture','{"claimed_vendor_route":"local manager discretion","claimed_fit":"turnover/field services"}','UNVERIFIED','RESEARCH_ONLY','Apartments(1).pdf')
on conflict(channel_code,company_name) do update set market=excluded.market,address=excluded.address,research_priority=excluded.research_priority,research_profile=excluded.research_profile,research_claims=excluded.research_claims,source_document=excluded.source_document,updated_at=now();

commit;