-- Persistent source-watch layer for the governed research-to-green engine.
-- This layer performs deterministic fetch/change/signal checks only. It does not use an LLM
-- and it never changes a regulated offer to customer-facing GREEN by itself.

create table if not exists public.dd_research_sources (
  id uuid primary key default gen_random_uuid(),
  program_key text not null references public.dd_research_programs(program_key) on delete cascade,
  work_key text references public.dd_research_work_queue(work_key) on delete set null,
  source_key text not null unique,
  source_title text not null,
  source_url text not null,
  authority_level text not null check (authority_level in ('PRIMARY','REGULATOR','CONTRACT','VENDOR','SECONDARY','USER_SOURCE')),
  temporal_class text not null default 'CURRENT' check (temporal_class in ('CURRENT','HISTORICAL','WATCH_ONLY')),
  status text not null default 'ACTIVE' check (status in ('ACTIVE','PAUSED','RETIRED')),
  check_interval_minutes integer not null default 360 check (check_interval_minutes between 30 and 43200),
  expected_signals jsonb not null default '[]'::jsonb,
  next_check_at timestamptz not null default now(),
  last_checked_at timestamptz,
  last_http_status integer,
  last_content_hash text,
  last_changed_at timestamptz,
  consecutive_failures integer not null default 0,
  last_error text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.dd_research_source_snapshots (
  id uuid primary key default gen_random_uuid(),
  source_id uuid not null references public.dd_research_sources(id) on delete cascade,
  fetched_at timestamptz not null default now(),
  http_status integer,
  content_hash text,
  content_length integer,
  changed boolean not null default false,
  matched_signals jsonb not null default '[]'::jsonb,
  excerpt text,
  error text,
  metadata jsonb not null default '{}'::jsonb
);

create index if not exists dd_research_sources_due_idx
  on public.dd_research_sources(status,next_check_at);
create index if not exists dd_research_source_snapshots_source_idx
  on public.dd_research_source_snapshots(source_id,fetched_at desc);

alter table public.dd_research_sources enable row level security;
alter table public.dd_research_source_snapshots enable row level security;
grant select on public.dd_research_sources,public.dd_research_source_snapshots to authenticated;
grant all on public.dd_research_sources,public.dd_research_source_snapshots to service_role;

insert into public.dd_research_sources
(program_key,work_key,source_key,source_title,source_url,authority_level,temporal_class,check_interval_minutes,expected_signals,metadata)
values
('PROTECTION_BENEFITS','LS_2026_COMP','LS_LICENSED_AGENT_FAQ_2024','LegalShield Licensed Agent Program FAQ (2024)','https://legalshield.myvoffice.com/pdf/en/Licensed_Agent_Program_FAQ_s_2024.pdf','CONTRACT','HISTORICAL',1440,
 '[{"signal":"licensed_agent_channel","all":["Licensed Agent","insurance"]},{"signal":"no_associate_fee","all":["no","Associate fee"]}]'::jsonb,
 '{"partner":"LegalShield","purpose":"baseline_and_change_watch"}'::jsonb),
('PROTECTION_BENEFITS','LS_BOOK_RIGHTS','LS_SELLER_BUILDER_2024','LegalShield Licensed Agent Seller/Builder Agreement (2024)','https://legalshield.myvoffice.com/pdf/en/2024_-_LA_Seller_Builder_Agreement_-_9.11.2024__fillable.pdf','CONTRACT','HISTORICAL',1440,
 '[{"signal":"high_low","all":["High/Low","Advanced"]},{"signal":"as_earned","all":["As Earned"]},{"signal":"group_property","all":["Group accounts","property of LegalShield"]},{"signal":"termination_commissions","all":["no longer be entitled","commissions"]}]'::jsonb,
 '{"partner":"LegalShield","purpose":"historical_contract_watch"}'::jsonb),
('PROTECTION_BENEFITS','LS_RELATED_PARTY','LS_CONTACT','LegalShield Corporate Contact','https://www.legalshield.com/contact','PRIMARY','CURRENT',720,
 '[{"signal":"broker_support","all":["Broker","Insurance Agent"]}]'::jsonb,
 '{"partner":"LegalShield","purpose":"support_channel_watch"}'::jsonb),
('PROTECTION_BENEFITS','GA_LIFE_AH_COST','GA_OCI_RESIDENT_LICENSE','Georgia OCI Resident Insurance Agent License','https://oci.georgia.gov/get-resident-insurance-agent-license','REGULATOR','CURRENT',720,
 '[{"signal":"application_fee","all":["$120"]},{"signal":"fingerprints","all":["fingerprint"]},{"signal":"life_accident_sickness","all":["Life","Accident","Sickness"]}]'::jsonb,
 '{"jurisdiction":"GA","purpose":"credential_requirements"}'::jsonb),
('PROTECTION_BENEFITS','GA_AGENCY','GA_OCI_AGENCY_LICENSE','Georgia OCI Agency License','https://oci.georgia.gov/request-agency-license','REGULATOR','CURRENT',720,
 '[{"signal":"business_entity","all":["business entity"]},{"signal":"responsible_agent","all":["responsible","licensed agent"]}]'::jsonb,
 '{"jurisdiction":"GA","purpose":"agency_compliance"}'::jsonb),
('PROTECTION_BENEFITS','FC_AGREEMENT','FC_GET_STARTED','First Connect - What is First Connect?','https://info.firstconnectinsurance.com/getstarted/what-is-first-connect','VENDOR','CURRENT',720,
 '[{"signal":"independent_agents","all":["independent","agents"]}]'::jsonb,
 '{"partner":"First Connect","purpose":"distribution_role"}'::jsonb),
('PROTECTION_BENEFITS','EO_MARKET','FC_EO_REQUIREMENTS','First Connect E&O Requirements','https://info.firstconnectinsurance.com/help/what-are-first-connects-eo-requirements','VENDOR','CURRENT',720,
 '[{"signal":"eo_requirement","all":["E&O"]},{"signal":"one_million","any":["$1,000,000","1 million"]}]'::jsonb,
 '{"partner":"First Connect","purpose":"eo_requirement"}'::jsonb),
('PROTECTION_BENEFITS','FC_AGREEMENT','FC_COST','First Connect Cost','https://info.firstconnectinsurance.com/getstarted/how-much-does-first-connect-cost','VENDOR','CURRENT',720,
 '[{"signal":"platform_cost","any":["free","no cost","no fees"]}]'::jsonb,
 '{"partner":"First Connect","purpose":"platform_economics"}'::jsonb)
on conflict(source_key) do update set
 source_title=excluded.source_title,
 source_url=excluded.source_url,
 authority_level=excluded.authority_level,
 temporal_class=excluded.temporal_class,
 check_interval_minutes=excluded.check_interval_minutes,
 expected_signals=excluded.expected_signals,
 metadata=public.dd_research_sources.metadata || excluded.metadata,
 status='ACTIVE',
 updated_at=now();
