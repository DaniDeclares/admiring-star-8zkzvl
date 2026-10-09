begin;

create table if not exists public.dd_capital_funding_opportunities_v1 (
  opportunity_key text primary key,
  program_family text not null,
  program_name text not null,
  agency text not null,
  intended_entity text not null,
  use_class text not null,
  state text not null default 'RESEARCH',
  deadline date,
  continuous_intake boolean not null default false,
  land_control_required boolean,
  farm_number_required boolean,
  match_required boolean,
  owner_submission_required boolean not null default true,
  accounting_ready boolean not null default false,
  eligibility_verified boolean not null default false,
  official_source text,
  evidence jsonb not null default '{}'::jsonb,
  blockers jsonb not null default '[]'::jsonb,
  next_action text,
  observed_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.dd_capital_funding_opportunities_v1 enable row level security;
revoke all on public.dd_capital_funding_opportunities_v1 from public, anon, authenticated;
grant select, insert, update, delete on public.dd_capital_funding_opportunities_v1 to service_role;

insert into public.dd_capital_funding_opportunities_v1
(opportunity_key,program_family,program_name,agency,intended_entity,use_class,state,deadline,continuous_intake,land_control_required,farm_number_required,match_required,official_source,evidence,blockers,next_action)
values
('USDA:FSA:FARM_OWNERSHIP','FSA_FARM_LOANS','Farm Ownership Loans','USDA FSA','AGRICULTURAL_PRODUCER_TBD','LAND','UNDERWRITING',null,true,null,null,false,'https://www.fsa.usda.gov/resources/loans/farm-ownership-loans',jsonb_build_object('source_verified_on','2026-10-04','no_eligibility_inference',true),jsonb_build_array('producer entity not finalized','property not selected','repayment model not completed'),'Build evidence-backed farm business plan and FSA financial schedules; do not borrow or apply without owner approval.'),
('USDA:FSA:OPERATING','FSA_FARM_LOANS','Farm Operating Loans','USDA FSA','AGRICULTURAL_PRODUCER_TBD','OPERATIONS','UNDERWRITING',null,true,null,null,false,'https://www.fsa.usda.gov/resources/loans/farm-operating-loans',jsonb_build_object('source_verified_on','2026-10-04','no_eligibility_inference',true),jsonb_build_array('producer entity not finalized','production budget not completed'),'Build production/equipment budget and repayment analysis from verified inputs.'),
('USDA:NRCS:GA:EQIP:FY2027:R1','NRCS_CONSERVATION','Environmental Quality Incentives Program — Georgia FY2027 first batching','USDA NRCS','AGRICULTURAL_PRODUCER_TBD','CONSERVATION','PRE_ELIGIBILITY','2026-10-09',true,true,true,false,'https://www.nrcs.usda.gov/state-offices/georgia/news/usda-announces-october-9-batching-deadline-for-major-nrcs-conservation',jsonb_build_object('source_verified_on','2026-10-04','deadline_kind','batching/ranking','applications_continuous',true,'no_eligibility_inference',true),jsonb_build_array('qualifying land control not evidenced','farm number not evidenced','producer eligibility not verified'),'Prepare NRCS/FSA onboarding evidence; do not fabricate prerequisites to meet the ranking date.'),
('USDA:NIFA:CFP:NEXT','NIFA_GRANT','Community Food Projects','USDA NIFA','SHADOW_AND_SOL','COMMUNITY_AGRICULTURE','NEXT_CYCLE',null,false,false,false,true,'https://www.nifa.usda.gov/grants/funding-opportunities/community-food-projects-competitive-grants-program',jsonb_build_object('no_current_open_cycle_claim',true,'no_eligibility_inference',true),jsonb_build_array('next NOFO/deadline must be verified','nonprofit eligibility/status evidence required','match must be evidenced'),'Build reusable Shadow & Sol community agriculture narrative, outcomes, budget and match evidence.'),
('USDA:NIFA:BFRDP:NEXT','NIFA_GRANT','Beginning Farmer and Rancher Development Program','USDA NIFA','SHADOW_AND_SOL_PLUS_PARTNERS','FARMER_EDUCATION','PARTNERSHIP_BUILD',null,false,false,false,true,'https://www.nifa.usda.gov/grants/programs/beginning-farmer-rancher-development-program-bfrdp/eligibility',jsonb_build_object('partnership_required',true,'no_current_open_cycle_claim',true),jsonb_build_array('qualifying network/partnership not yet evidenced','next NOFO must be verified'),'Develop partner map and education capability evidence; no standalone eligibility claim.'),
('USDA:AMS:FMPP:NEXT','AMS_LOCAL_FOOD','Farmers Market Promotion Program','USDA AMS','ELIGIBLE_ENTITY_TBD','DIRECT_MARKET','FUTURE',null,false,false,false,true,'https://www.ams.usda.gov/services/grants/fmpp',jsonb_build_object('no_current_open_cycle_claim',true),jsonb_build_array('future market model not operating','next NOFO must be verified'),'Retain as future direct-market expansion lane.'),
('USDA:AMS:LFPP:NEXT','AMS_LOCAL_FOOD','Local Food Promotion Program','USDA AMS','ELIGIBLE_ENTITY_TBD','LOCAL_FOOD_INFRASTRUCTURE','FUTURE',null,false,false,false,true,'https://www.ams.usda.gov/services/grants/lfpp',jsonb_build_object('no_current_open_cycle_claim',true),jsonb_build_array('aggregation/distribution operation not established','next NOFO must be verified'),'Retain for later aggregation/storage/distribution phase.'),
('USDA:RD:VAPG:NEXT','RURAL_DEVELOPMENT','Value-Added Producer Grant','USDA Rural Development','QUALIFYING_PRODUCER_TBD','VALUE_ADDED','FUTURE',null,false,null,null,true,'https://www.rd.usda.gov/programs-services/business-programs/value-added-producer-grants-28',jsonb_build_object('no_current_open_cycle_claim',true),jsonb_build_array('qualifying producer not established','value-added product not selected','next NOFO must be verified'),'Evaluate only after real agricultural production and unit economics exist.')
on conflict (opportunity_key) do update set
  program_family=excluded.program_family, program_name=excluded.program_name, agency=excluded.agency,
  intended_entity=excluded.intended_entity, use_class=excluded.use_class, state=excluded.state,
  deadline=excluded.deadline, continuous_intake=excluded.continuous_intake,
  land_control_required=excluded.land_control_required, farm_number_required=excluded.farm_number_required,
  match_required=excluded.match_required, official_source=excluded.official_source,
  evidence=excluded.evidence, blockers=excluded.blockers, next_action=excluded.next_action,
  observed_at=now(), updated_at=now();

create or replace view public.dd_capital_funding_readiness_v1
with (security_invoker=true) as
select opportunity_key, program_family, program_name, agency, intended_entity, use_class, state, deadline,
       accounting_ready, eligibility_verified, owner_submission_required,
       case when eligibility_verified and accounting_ready and jsonb_array_length(blockers)=0 then 'READY_FOR_OWNER_REVIEW'
            when deadline is not null and deadline <= current_date + 14 then 'TIME_SENSITIVE_NOT_READY'
            else 'BUILDING' end as readiness,
       blockers, next_action, official_source, observed_at
from public.dd_capital_funding_opportunities_v1
order by deadline nulls last, program_name;

revoke all on public.dd_capital_funding_readiness_v1 from public, anon, authenticated;
grant select on public.dd_capital_funding_readiness_v1 to service_role;

-- Surface verified planning state through the existing company controller domain.
update public.dd_company_domain_state
set status='YELLOW',
    summary='USDA/agriculture capital stack is active but evidence-gated; no award, eligibility or submission is implied.',
    metrics=jsonb_build_object(
      'tracked_opportunities',(select count(*) from public.dd_capital_funding_opportunities_v1),
      'eligibility_verified',(select count(*) from public.dd_capital_funding_opportunities_v1 where eligibility_verified),
      'accounting_ready',(select count(*) from public.dd_capital_funding_opportunities_v1 where accounting_ready),
      'time_sensitive_not_ready',(select count(*) from public.dd_capital_funding_readiness_v1 where readiness='TIME_SENSITIVE_NOT_READY')
    ),
    blockers=(select coalesce(jsonb_agg(jsonb_build_object('opportunity_key',opportunity_key,'blockers',blockers)),'[]'::jsonb)
              from public.dd_capital_funding_opportunities_v1 where jsonb_array_length(blockers)>0),
    next_autonomous_action='Build FSA/NRCS/Shadow & Sol application evidence from canonical accounting and verified entity/property records; keep submissions and debt owner-gated.',
    owner_decision_required=false,
    evidence=jsonb_build_object('derived_by','20261004234500_usda_capital_stack_planning_v1','no_green_inference',true,'no_external_submission',true,'no_debt_commitment',true,'no_award_claim',true),
    observed_at=now(), updated_at=now()
where domain='CAPITAL_FUNDING';

commit;
