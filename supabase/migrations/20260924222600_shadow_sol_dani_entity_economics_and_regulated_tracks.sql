-- Tester-validated entity/economics architecture for prospective Shadow & Sol nonprofit + DANI DECLARES LLC.
-- This migration models scenarios and governance only. It does not confer tax exemption, transfer assets, or activate regulated sales.

create table if not exists public.dd_entity_architecture_scenarios (
  scenario_code text primary key,
  scenario_name text not null,
  status text not null default 'MODELING',
  total_acres numeric(8,2),
  nonprofit_acres numeric(8,2),
  commercial_acres numeric(8,2),
  private_acres numeric(8,2),
  shared_acres numeric(8,2),
  assumed_land_cost_per_acre numeric(12,2),
  assumed_land_acquisition_cost numeric(14,2) generated always as (total_acres * assumed_land_cost_per_acre) stored,
  nonprofit_allocated_land_basis numeric(14,2) generated always as (nonprofit_acres * assumed_land_cost_per_acre) stored,
  commercial_allocated_land_basis numeric(14,2) generated always as (commercial_acres * assumed_land_cost_per_acre) stored,
  private_allocated_land_basis numeric(14,2) generated always as (private_acres * assumed_land_cost_per_acre) stored,
  shared_allocated_land_basis numeric(14,2) generated always as (shared_acres * assumed_land_cost_per_acre) stored,
  assumption_note text not null,
  production_authorized boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (coalesce(nonprofit_acres,0)+coalesce(commercial_acres,0)+coalesce(private_acres,0)+coalesce(shared_acres,0)=total_acres)
);

create table if not exists public.dd_related_party_arrangement_models (
  arrangement_code text primary key,
  nonprofit_entity text not null default 'SHADOW_AND_SOL_PROSPECTIVE_501C3',
  counterparty_entity text not null,
  arrangement_type text not null,
  permitted_purpose text not null,
  pricing_basis text not null,
  conflict_review_required boolean not null default true,
  independent_approval_required boolean not null default true,
  comparability_evidence_required boolean not null default true,
  written_agreement_required boolean not null default true,
  fm_value_required boolean not null default true,
  status text not null default 'MODEL_ONLY',
  activation_gate text not null,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.dd_regulated_revenue_tracks (
  track_code text primary key,
  organization_scope text not null,
  track_name text not null,
  revenue_type text not null,
  current_state text not null,
  individual_license_required boolean not null default false,
  entity_license_required boolean not null default false,
  appointment_or_contract_required boolean not null default false,
  verified_authority boolean not null default false,
  sellable boolean generated always as (verified_authority and current_state='ACTIVE') stored,
  known_setup_cost_floor numeric(12,2) not null default 0,
  recurring_cost_assumption numeric(12,2),
  revenue_assumption_monthly numeric(12,2),
  source_authority text,
  activation_gate text not null,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.dd_entity_startup_cost_models (
  cost_code text primary key,
  organization_scope text not null,
  cost_name text not null,
  amount_low numeric(12,2) not null,
  amount_high numeric(12,2) not null,
  frequency text not null,
  evidence_status text not null,
  source_authority text,
  notes text,
  created_at timestamptz not null default now()
);

alter table public.dd_entity_architecture_scenarios enable row level security;
alter table public.dd_related_party_arrangement_models enable row level security;
alter table public.dd_regulated_revenue_tracks enable row level security;
alter table public.dd_entity_startup_cost_models enable row level security;
revoke all on public.dd_entity_architecture_scenarios from anon, authenticated;
revoke all on public.dd_related_party_arrangement_models from anon, authenticated;
revoke all on public.dd_regulated_revenue_tracks from anon, authenticated;
revoke all on public.dd_entity_startup_cost_models from anon, authenticated;

insert into public.dd_entity_architecture_scenarios
(scenario_code,scenario_name,total_acres,nonprofit_acres,commercial_acres,private_acres,shared_acres,assumed_land_cost_per_acre,assumption_note)
values
('LAND40_LOW','40-acre architecture / low acquisition assumption',40,18,7,10,5,10000,'Planning assumption only; not market evidence.'),
('LAND40_BASE','40-acre architecture / base acquisition assumption',40,18,7,10,5,20000,'Planning assumption only; not market evidence.'),
('LAND40_HIGH','40-acre architecture / high acquisition assumption',40,18,7,10,5,30000,'Planning assumption only; not market evidence.')
on conflict (scenario_code) do update set
 total_acres=excluded.total_acres, nonprofit_acres=excluded.nonprofit_acres, commercial_acres=excluded.commercial_acres,
 private_acres=excluded.private_acres, shared_acres=excluded.shared_acres, assumed_land_cost_per_acre=excluded.assumed_land_cost_per_acre,
 assumption_note=excluded.assumption_note, updated_at=now();

insert into public.dd_related_party_arrangement_models
(arrangement_code,counterparty_entity,arrangement_type,permitted_purpose,pricing_basis,activation_gate,notes)
values
('SAS_DANI_SERVICES','DANI DECLARES LLC','SERVICE_CONTRACT','Bona fide services used for Shadow & Sol charitable operations.','Fair-market-value / documented comparables','Independent nonprofit approval + written scope + comparability evidence + no excess benefit','Model only; does not authorize a contract.'),
('SAS_DANI_LEASE','DANI DECLARES LLC','LEASE_OR_LICENSE','Commercial use of nonprofit-controlled property.','Fair-market rent/use value','Independent nonprofit approval + appraisal/comparables + written lease + shared-cost allocation','No free/subsidized commercial use of charitable property.'),
('SAS_PRIVATE_USE','FOUNDER_OR_FAMILY','PRIVATE_USE','Private/family use, if legally permissible.','Fair-market-value / documented comparables','Independent nonprofit approval + legal review + written agreement; otherwise prohibited','Family residences remain outside nonprofit assets in the current architecture.')
on conflict (arrangement_code) do nothing;

insert into public.dd_regulated_revenue_tracks
(track_code,organization_scope,track_name,revenue_type,current_state,individual_license_required,entity_license_required,appointment_or_contract_required,verified_authority,known_setup_cost_floor,source_authority,activation_gate,notes)
values
('DANI_INS_LIFE_AS','DANI DECLARES LLC','Georgia Life + Accident & Sickness insurance','INSURANCE_COMMISSION','RESEARCH',true,true,true,false,120,'Georgia OCI / Sircon','Verify individual producer authority, DANI agency authority, and carrier appointment/contract before solicitation or sale.','$120 is the published individual application-fee floor only.'),
('DANI_LEGALSHIELD_ASSOCIATE','DANI DECLARES LLC','LegalShield independent associate/referral track','MEMBERSHIP_COMMISSION','RESEARCH',false,false,true,false,0,'LegalShield official materials','Verify current U.S. associate agreement, Georgia eligibility, current fees/commission schedule, tax treatment and payee structure.','No forecast commission until current agreement is verified.'),
('DANI_LEGALSHIELD_BUSINESS','DANI DECLARES LLC','LegalShield small-business legal coverage','OPERATING_EXPENSE','EVALUATE',false,false,true,false,0,'LegalShield official small-business plans','Owner approval and affordability check before purchase.','Risk-management expense; not revenue.'),
('DANI_LEGALSHIELD_BENEFIT','DANI DECLARES LLC','LegalShield voluntary workforce benefit','WORKFORCE_BENEFIT','FUTURE',false,false,true,false,0,'LegalShield official employer benefits','Worker classification + eligibility + employer agreement.','Keep contractor and employee treatment distinct.'),
('SAS_LEGALSHIELD_ORG','SHADOW & SOL prospective nonprofit','LegalShield organizational legal coverage','OPERATING_EXPENSE','FUTURE',false,false,true,false,0,'LegalShield official materials','Entity formed + board approval + plan eligibility + charitable-purpose review.','No charitable funds for DANI/private legal matters.'),
('SAS_LEGALSHIELD_PROGRAM','SHADOW & SOL prospective nonprofit','Legal access as charitable program component','PROGRAM_EXPENSE','RESEARCH',false,false,true,false,0,'Research required','Board-approved charitable class + program design + provider agreement + legal/tax review.','No founder/private-company preference.')
on conflict (track_code) do update set current_state=excluded.current_state,activation_gate=excluded.activation_gate,notes=excluded.notes,source_authority=excluded.source_authority;

insert into public.dd_entity_startup_cost_models
(cost_code,organization_scope,cost_name,amount_low,amount_high,frequency,evidence_status,source_authority,notes)
values
('SAS_GA_FORM','SHADOW & SOL prospective nonprofit','Georgia nonprofit corporation formation',110,110,'ONE_TIME','VERIFIED_2026','Georgia Secretary of State','Current online filing total.'),
('SAS_GA_AR','SHADOW & SOL prospective nonprofit','Georgia nonprofit annual registration',40,40,'ANNUAL','VERIFIED_2026','Georgia Secretary of State','Current SOS online total.'),
('SAS_GA_CHARITY','SHADOW & SOL prospective nonprofit','Georgia charitable organization registration',35,35,'REGISTRATION','VERIFIED_2026','Georgia Secretary of State','When registration is required; exemptions must be evaluated.'),
('SAS_IRS_EXEMPT','SHADOW & SOL prospective nonprofit','IRS 501(c)(3) recognition application user fee',275,600,'ONE_TIME','VERIFIED_2026','IRS','1023-EZ if eligible; otherwise Form 1023.'),
('DANI_GA_INS_INDIVIDUAL','DANI DECLARES LLC','Georgia individual producer application fee floor',120,120,'APPLICATION','VERIFIED_2026','Georgia OCI','Excludes education, exam, fingerprints, agency and carrier costs.')
on conflict (cost_code) do update set amount_low=excluded.amount_low,amount_high=excluded.amount_high,evidence_status=excluded.evidence_status,source_authority=excluded.source_authority,notes=excluded.notes;

create or replace view public.dd_entity_architecture_economics_v1 with (security_invoker=true) as
select s.*,
 round((nonprofit_acres/nullif(total_acres,0))*100,2) nonprofit_pct,
 round((commercial_acres/nullif(total_acres,0))*100,2) commercial_pct,
 round((private_acres/nullif(total_acres,0))*100,2) private_pct,
 round((shared_acres/nullif(total_acres,0))*100,2) shared_pct
from public.dd_entity_architecture_scenarios s;

comment on table public.dd_entity_architecture_scenarios is 'Planning model only; no ownership, valuation, FMV, financing, or tax treatment is established.';
comment on table public.dd_related_party_arrangement_models is 'Governance gates only; no row authorizes a transaction.';
comment on table public.dd_regulated_revenue_tracks is 'Regulated/protection tracks; sellable remains false until verified authority and ACTIVE state.';


-- Register the owner-approved architecture and extend the existing research engine.
insert into public.dd_business_decision_register
(decision_code,decision_name,category,decision_status,decided_by,decided_at,implementation_status,implementation_evidence,description,source_reference)
values
('ENTITY_ARCH_SAS_DANI_001','Shadow & Sol charitable / DANI for-profit architecture','ENTITY_ARCHITECTURE','APPROVED','Danielle',now(),'IMPLEMENTED','Entity/economics governance migration applied; production activation remains separate.','Shadow & Sol is modeled as a prospective charitable/nonprofit organization; DANI DECLARES LLC remains separate for-profit. Charitable, commercial, private/family, and shared land uses remain separately allocated. No tax-exempt status or asset transfer is represented as complete.','Owner decision 2026-09-24')
on conflict (decision_code) do update set decision_status=excluded.decision_status,implementation_status=excluded.implementation_status,implementation_evidence=excluded.implementation_evidence,description=excluded.description,updated_at=now();

insert into public.dd_research_programs(program_key,program_name,domain,objective,status,release_blocked,green_rule,metadata)
values ('ENTITY_ARCHITECTURE','Shadow & Sol / DANI Entity Architecture','NONPROFIT_FORPROFIT_LAND','Model lawful separation, related-party governance, land allocation, startup economics, and activation gates without treating prospective tax status as granted.','RESEARCHING',true,'Entity formation + tax status + independent governance + FMV/comparability + asset allocation + legal/tax review must be GREEN before asset transfer or related-party production activation.','{"tester_only":true,"production_authorized":false}'::jsonb)
on conflict (program_key) do update set objective=excluded.objective,status=excluded.status,release_blocked=excluded.release_blocked,green_rule=excluded.green_rule,metadata=excluded.metadata,updated_at=now();

insert into public.dd_research_evidence
(program_key,claim_key,claim_text,evidence_status,source_title,source_url,authority_level,effective_as_of,notes,metadata)
values
('PROTECTION_BENEFITS','GA_INS_AGENT_LICENSE','Georgia requires insurance agents to be licensed; resident applications use Sircon and Life / Accident & Sickness are available lines.','CONFIRMED','Georgia OCI - Get a Resident Insurance Agent License','https://oci.georgia.gov/get-resident-insurance-agent-license','REGULATOR',current_date,'Current individual application fee shown by OCI is $120; additional education, exam and fingerprint requirements apply.','{"tester_use":"activation_gate"}'::jsonb),
('PROTECTION_BENEFITS','GA_INS_AGENCY_LICENSE','A Georgia business entity engaged in selling, soliciting, or negotiating insurance must be licensed as an insurance agency.','CONFIRMED','Georgia OCI - Request an Agency License','https://oci.georgia.gov/request-agency-license','REGULATOR',current_date,'DANI insurance sales remain release-blocked pending verified individual/entity authority and any required appointment.','{"tester_use":"activation_gate"}'::jsonb),
('ENTITY_ARCHITECTURE','IRS_EXCESS_BENEFIT_FMV','For excess-benefit analysis, property and the right to use property are valued at fair market value.','CONFIRMED','IRS - Intermediate sanctions / excess benefit transactions','https://www.irs.gov/charities-non-profits/charitable-organizations/intermediate-sanctions-excess-benefit-transactions','REGULATOR',current_date,'Used to gate Shadow & Sol related-party services, leases, and private use.','{"tester_use":"related_party_gate"}'::jsonb),
('ENTITY_ARCHITECTURE','GA_CHARITY_SEQUENCE','Georgia charity guidance requires organization/formation, federal tax-status determination, and charitable registration when solicitation registration applies.','CONFIRMED','Georgia Secretary of State - How-To Guide Charities','https://sos.ga.gov/how-to-guide/how-guide-charities','REGULATOR',current_date,'Shadow & Sol remains prospective; no exemption is represented as granted.','{"tester_use":"formation_gate"}'::jsonb),
('PROTECTION_BENEFITS','LEGALSHIELD_EMPLOYER','LegalShield markets legal and identity-theft protection as employee benefit solutions.','CONFIRMED','LegalShield - Employee Benefit Solutions','https://www.legalshield.com/employers','VENDOR',current_date,'Vendor evidence supports product-fit research only, not tax/legal authority.','{"tester_use":"benefit_model"}'::jsonb),
('PROTECTION_BENEFITS','LEGALSHIELD_SMALL_BUSINESS','LegalShield markets paid small-business legal plans.','CONFIRMED','LegalShield - Small Business Legal Services & Plans','https://www.legalshield.com/business','VENDOR',current_date,'Vendor pricing/features can change; recheck before purchase.','{"tester_use":"operating_expense_model"}'::jsonb)
on conflict (program_key,claim_key,source_title) do update set claim_text=excluded.claim_text,evidence_status=excluded.evidence_status,source_url=excluded.source_url,authority_level=excluded.authority_level,effective_as_of=excluded.effective_as_of,notes=excluded.notes,metadata=excluded.metadata,updated_at=now();
