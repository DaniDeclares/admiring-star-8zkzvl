-- Governed research-to-green control layer for regulated Protection & Benefits opportunities.
-- Customer-facing release remains blocked until credential/compliance/economics/distribution/ownership/fulfillment evidence clears.
create table if not exists public.dd_research_programs (
  program_key text primary key, program_name text not null, domain text not null, objective text not null,
  status text not null check (status in ('RESEARCHING','EVIDENCE_READY','REVIEW_READY','GREEN','BLOCKED','PAUSED')),
  release_blocked boolean not null default true, green_rule text not null, metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists public.dd_research_evidence (
  id uuid primary key default gen_random_uuid(), program_key text not null references public.dd_research_programs(program_key) on delete cascade,
  claim_key text not null, claim_text text not null,
  evidence_status text not null check (evidence_status in ('CONFIRMED','HISTORICAL','PARTIAL','UNRESOLVED','CONFLICTED')),
  source_title text not null, source_url text, source_date date,
  authority_level text not null check (authority_level in ('PRIMARY','REGULATOR','CONTRACT','VENDOR','SECONDARY','USER_SOURCE')),
  effective_as_of date, notes text, metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
  unique(program_key,claim_key,source_title)
);
create table if not exists public.dd_research_work_queue (
  id uuid primary key default gen_random_uuid(), program_key text not null references public.dd_research_programs(program_key) on delete cascade,
  work_key text not null unique, question text not null, required_evidence text not null,
  priority text not null check (priority in ('P0','P1','P2','P3')),
  status text not null check (status in ('QUEUED','RESEARCHING','EVIDENCE_READY','REVIEW_READY','GREEN','BLOCKED')),
  blocker text, next_action text, owner_decision_required boolean not null default false, attempts integer not null default 0,
  last_researched_at timestamptz, metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create index if not exists dd_research_work_queue_status_idx on public.dd_research_work_queue(status,priority);
create index if not exists dd_research_evidence_program_idx on public.dd_research_evidence(program_key,evidence_status);
alter table public.dd_research_programs enable row level security;
alter table public.dd_research_evidence enable row level security;
alter table public.dd_research_work_queue enable row level security;
grant select on public.dd_research_programs,public.dd_research_evidence,public.dd_research_work_queue to authenticated;
grant all on public.dd_research_programs,public.dd_research_evidence,public.dd_research_work_queue to service_role;

insert into public.dd_research_programs(program_key,program_name,domain,objective,status,release_blocked,green_rule,metadata)
values ('PROTECTION_BENEFITS','Protection & Benefits','INSURANCE_LEGAL_BENEFITS','Build a governed DANI insurance, legal-plan and employee-benefits distribution capability without exposing customers to unlicensed or unverified sales.','RESEARCHING',true,'Credential + compliance + economics + distribution + ownership/renewal + fulfillment evidence must all be GREEN before customer-facing release.','{"channels":["CH01","CH02","CH03","CH04","CH05"],"customer_release":"BLOCKED","research_mode":"continuous"}')
on conflict(program_key) do update set objective=excluded.objective,status='RESEARCHING',release_blocked=true,green_rule=excluded.green_rule,metadata=public.dd_research_programs.metadata||excluded.metadata,updated_at=now();

insert into public.dd_research_work_queue(program_key,work_key,question,required_evidence,priority,status,next_action,metadata) values
('PROTECTION_BENEFITS','LS_2026_COMP','What is the current 2026 LegalShield Licensed Agent compensation schedule?','Current LegalShield corporate agreement/schedule confirming Level, High/Low advanced, High/Low as-earned, rates, retention and debit terms.','P0','RESEARCHING','Obtain current corporate schedule; do not promote historical percentages.','{"partner":"LegalShield","gate":"ECONOMICS"}'),
('PROTECTION_BENEFITS','LS_RELATED_PARTY','Are Danielle personal, family, and DANI-owned memberships commissionable and production-credit eligible?','Written LegalShield corporate rule for self, household/family and agent-owned business purchases.','P0','RESEARCHING','Verify with Broker & Insurance Agent Support/corporate documentation.','{"partner":"LegalShield","gate":"COMPLIANCE"}'),
('PROTECTION_BENEFITS','LS_BOOK_RIGHTS','What survives termination and who owns/reassigns group accounts?','Current Licensed Agent agreement covering termination, earned/unpaid commissions, renewals, group ownership and reassignment.','P0','RESEARCHING','Verify whether 2024 clauses remain current in 2026.','{"partner":"LegalShield","gate":"OWNERSHIP"}'),
('PROTECTION_BENEFITS','FC_AGREEMENT','What are First Connect book ownership, renewal vesting, exit and carrier-release rights?','Current producer/agency agreement and carrier-specific exceptions.','P0','RESEARCHING','Obtain contract terms rather than relying on marketing language.','{"partner":"First Connect","gate":"OWNERSHIP"}'),
('PROTECTION_BENEFITS','FC_COMPETITORS','Which independent aggregator/network is best suited to DANI constraints?','Current comparison of fees, E&O, carrier breadth in Georgia, life/health/P&C access, commissions, renewals, book ownership and exit rights.','P1','QUEUED','Research First Connect peers without assuming First Connect is selected.','{"gate":"DISTRIBUTION"}'),
('PROTECTION_BENEFITS','GA_LIFE_AH_COST','What is the exact all-in Georgia Life + Accident & Sickness startup cost and sequence?','Current Georgia OCI plus exam vendor/fingerprint/provider fees and approved education evidence.','P0','RESEARCHING','Pin exact cash requirement and processing sequence.','{"jurisdiction":"GA","gate":"CREDENTIAL"}'),
('PROTECTION_BENEFITS','GA_PC_COST','What is the exact all-in Georgia P&C startup cost and sequence?','Current Georgia OCI plus exam vendor/fingerprint/provider fees and approved education evidence.','P1','QUEUED','Pin exact cash requirement and processing sequence.','{"jurisdiction":"GA","gate":"CREDENTIAL"}'),
('PROTECTION_BENEFITS','GA_AGENCY','When must DANI DECLARES LLC hold a Georgia agency license and what does it cost?','Current Georgia OCI business-entity licensing requirements, responsible-agent rule and fees.','P0','RESEARCHING','Verify before any LLC-branded insurance solicitation.','{"jurisdiction":"GA","gate":"COMPLIANCE"}'),
('PROTECTION_BENEFITS','EO_MARKET','What does compliant $1M+ insurance-agent E&O cost DANI?','Current quotes or published pricing satisfying distributor/carrier requirements.','P1','QUEUED','Research no-purchase pricing; owner approval required before binding.','{"gate":"ECONOMICS","purchase_authorized":false}')
on conflict(work_key) do update set question=excluded.question,required_evidence=excluded.required_evidence,priority=excluded.priority,next_action=excluded.next_action,metadata=public.dd_research_work_queue.metadata||excluded.metadata,updated_at=now();

insert into public.dd_research_evidence(program_key,claim_key,claim_text,evidence_status,source_title,source_url,source_date,authority_level,effective_as_of,notes) values
('PROTECTION_BENEFITS','LS_LA_CHANNEL','LegalShield maintains a Licensed Agent program for appropriately licensed insurance agents/agencies.','CONFIRMED','LegalShield Licensed Agent Program FAQ','https://legalshield.myvoffice.com/pdf/en/Licensed_Agent_Program_FAQ_s_2024.pdf','2024-09-01','CONTRACT','2024-09-01','Historical/currentness must be reconfirmed for 2026 contracting.'),
('PROTECTION_BENEFITS','LS_COMP_OPTIONS_2024','2024 Licensed Agent materials describe High/Low advanced, High/Low as-earned, and Level as-earned compensation options.','HISTORICAL','LegalShield Licensed Agent Seller/Builder Agreement','https://legalshield.myvoffice.com/pdf/en/2024_-_LA_Seller_Builder_Agreement_-_9.11.2024__fillable.pdf','2024-09-11','CONTRACT','2024-09-11','Do not use 2024 percentages as current 2026 economics without reconfirmation.'),
('PROTECTION_BENEFITS','LS_GROUP_OWNERSHIP_2024','2024 agreement states group accounts are LegalShield property and may be reassigned under stated conditions.','HISTORICAL','LegalShield Licensed Agent Seller/Builder Agreement','https://legalshield.myvoffice.com/pdf/en/2024_-_LA_Seller_Builder_Agreement_-_9.11.2024__fillable.pdf','2024-09-11','CONTRACT','2024-09-11','Material ownership risk; current 2026 clause must be verified.'),
('PROTECTION_BENEFITS','FC_ROLE','First Connect is distribution infrastructure/aggregator for independent insurance agents, not a LegalShield-like single product family.','CONFIRMED','First Connect Help Center - What is First Connect?','https://info.firstconnectinsurance.com/getstarted/what-is-first-connect',null,'VENDOR','2026-09-24','Treat carrier/product availability as state/carrier-specific.'),
('PROTECTION_BENEFITS','FC_FEES','First Connect publicly states no membership/platform fee.','CONFIRMED','First Connect Help Center - How much does First Connect cost?','https://info.firstconnectinsurance.com/getstarted/how-much-does-first-connect-cost',null,'VENDOR','2026-09-24','Carrier/product transaction costs may still exist.'),
('PROTECTION_BENEFITS','FC_EO','First Connect requires qualifying E&O coverage; DANI general liability is not treated as agent professional E&O.','CONFIRMED','First Connect Help Center - E&O requirements','https://info.firstconnectinsurance.com/help/what-are-first-connects-eo-requirements',null,'VENDOR','2026-09-24','Exact policy cost remains unresolved.'),
('PROTECTION_BENEFITS','GA_AGENCY_REQUIRED','Georgia requires a business entity selling, soliciting or negotiating insurance to be appropriately licensed as an agency.','CONFIRMED','Georgia OCI - Request an Agency License','https://oci.georgia.gov/request-agency-license',null,'REGULATOR','2026-09-24','Confirm exact fee and responsible-agent setup before activation.')
on conflict(program_key,claim_key,source_title) do update set claim_text=excluded.claim_text,evidence_status=excluded.evidence_status,source_url=excluded.source_url,effective_as_of=excluded.effective_as_of,notes=excluded.notes,updated_at=now();
