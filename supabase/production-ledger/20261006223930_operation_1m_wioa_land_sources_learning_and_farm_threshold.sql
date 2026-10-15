
create table if not exists public.dd_training_funding_paths (
  path_key text primary key,
  path_name text not null,
  status text not null,
  applicant_scope text,
  verified_facts jsonb not null default '{}'::jsonb,
  application_path jsonb not null default '[]'::jsonb,
  fit_notes text,
  source_authority text,
  checked_at timestamptz not null default now()
);
alter table public.dd_training_funding_paths enable row level security;

insert into public.dd_training_funding_paths(
  path_key,path_name,status,applicant_scope,verified_facts,application_path,fit_notes,source_authority
)
values
(
  'WIOA_GEORGIA',
  'Georgia WIOA occupational training assistance',
  'ACTIVE_ELIGIBILITY_BASED',
  'Eligible adults, dislocated workers and other eligible participants through local workforce areas',
  jsonb_build_object(
    'program','Workforce Innovation and Opportunity Act',
    'funding_type','Training assistance / Individual Training Account or other approved training service; not a universal cash voucher',
    'provider_rule','Training generally must be through an eligible training provider/program and tied to workforce goals.',
    'funding_availability','Subject to individual eligibility, local workforce-area policy and available funds.',
    'supportive_services_possible',true,
    'georgia_system','WorkSource Georgia'
  ),
  jsonb_build_array(
    'IDENTIFY_CORRECT_LOCAL_WORKFORCE_AREA',
    'COMPLETE_ELIGIBILITY_AND_CAREER_ASSESSMENT',
    'SELECT_IN_DEMAND_OCCUPATION',
    'VERIFY_PROGRAM_ON_ELIGIBLE_TRAINING_PROVIDER_LIST',
    'BUILD_INDIVIDUAL_EMPLOYMENT_PLAN',
    'REQUEST_TRAINING_AND_SUPPORTIVE_SERVICES'
  ),
  'Potential personal career-funding lane for cyber/IT, healthcare, CDL or other approved in-demand training; do not assume any specific course is funded until local approval.',
  'GEORGIA_DOL_WORKSOURCE'
),
(
  'WORKFORCE_PELL_2026',
  'Workforce Pell Grant',
  'ACTIVE_FROM_2026_07_01_FOR_ELIGIBLE_PROGRAMS',
  'Pell-eligible students enrolled in approved short-term workforce programs',
  jsonb_build_object(
    'effective_date','2026-07-01',
    'program_type','Federal Pell Grant for eligible high-quality short-term workforce programs',
    'short_program_possible',true,
    'not_automatic_for_all_short_courses',true,
    'may_stack_with_other_aid_subject_to_rules',true
  ),
  jsonb_build_array(
    'IDENTIFY_ELIGIBLE_SHORT_TERM_PROGRAM',
    'VERIFY_INSTITUTION_AND_PROGRAM_ELIGIBILITY',
    'COMPLETE_FAFSA',
    'COMPARE_WITH_WIOA_AND_OTHER_AID',
    'CHOOSE_LOWEST_OUT_OF_POCKET_PATH'
  ),
  'Useful as a second career-training funding lane; verify the exact program before enrolling.',
  'US_DEPARTMENT_OF_EDUCATION'
)
on conflict(path_key) do update
set path_name=excluded.path_name,status=excluded.status,applicant_scope=excluded.applicant_scope,
    verified_facts=excluded.verified_facts,application_path=excluded.application_path,
    fit_notes=excluded.fit_notes,source_authority=excluded.source_authority,checked_at=now();

create table if not exists public.dd_property_research_sources (
  source_key text primary key,
  source_name text not null,
  source_type text not null,
  status text not null default 'RESEARCH_SOURCE',
  intended_use text not null,
  authority_level text not null,
  verification_rule text not null,
  due_diligence_required jsonb not null default '[]'::jsonb,
  notes text,
  updated_at timestamptz not null default now()
);
alter table public.dd_property_research_sources enable row level security;

insert into public.dd_property_research_sources(
  source_key,source_name,source_type,status,intended_use,authority_level,verification_rule,due_diligence_required,notes
)
values
('GOVEASE','GovEase','TAX_AUCTION_PLATFORM','RESEARCH_SOURCE','Discover county tax-sale/tax-deed auction inventory where participating jurisdictions use the platform.','SECONDARY_PLATFORM','Verify every auction, parcel, sale type, redemption rule and county authority at the official jurisdiction before bidding.',jsonb_build_array('TITLE','LIENS','REDEMPTION','ACCESS','ZONING','FLOOD','UTILITIES','EASEMENTS','BUILDABILITY','TAXES'),'Starting bid does not equal acquisition cost or marketable title.'),
('BID4ASSETS','Bid4Assets','TAX_AUCTION_PLATFORM','RESEARCH_SOURCE','Discover public real-estate auctions that may include tax-defaulted property.','SECONDARY_PLATFORM','Confirm the government seller, deed type, terms and parcel records independently before bidding.',jsonb_build_array('TITLE','LIENS','REDEMPTION','ACCESS','ZONING','FLOOD','UTILITIES','EASEMENTS','BUILDABILITY','AUCTION_FEES'),'Very low opening bids can rise materially and do not guarantee usable land.'),
('LANDWATCH','LandWatch','LAND_MARKETPLACE','RESEARCH_SOURCE','Search rural and undeveloped land listings.','MARKETPLACE','Treat listing claims as seller/agent representations until independently verified.',jsonb_build_array('TITLE','ACCESS','ZONING','FLOOD','UTILITIES','EASEMENTS','BUILDABILITY','SURVEY','SOILS'),'Useful for inventory discovery, not legal/buildability authority.'),
('LANDMODO','LandModo','LAND_MARKETPLACE','RESEARCH_SOURCE','Search lower-cost land and owner-finance listings.','MARKETPLACE','Verify seller ownership, contract terms, title, parcel characteristics and financing economics independently.',jsonb_build_array('TITLE','ACCESS','ZONING','FLOOD','UTILITIES','EASEMENTS','BUILDABILITY','OWNER_FINANCE_TERMS'),'Owner financing can still carry high effective price/fees.'),
('CHEAPLANDS','CheapLands','LAND_MARKETPLACE','RESEARCH_SOURCE','Search low-cost rural parcels.','MARKETPLACE','Do not treat advertised cheap price as evidence of legal access, utilities or buildability.',jsonb_build_array('TITLE','ACCESS','ZONING','FLOOD','UTILITIES','EASEMENTS','BUILDABILITY','SURVEY'),'Discovery source only.')
on conflict(source_key) do update
set source_name=excluded.source_name,source_type=excluded.source_type,status=excluded.status,
    intended_use=excluded.intended_use,authority_level=excluded.authority_level,
    verification_rule=excluded.verification_rule,due_diligence_required=excluded.due_diligence_required,
    notes=excluded.notes,updated_at=now();

create table if not exists public.dd_research_source_hierarchy (
  source_key text primary key,
  source_name text not null,
  source_class text not null,
  priority_rank integer not null,
  use_case text not null,
  rule text not null,
  updated_at timestamptz not null default now()
);
alter table public.dd_research_source_hierarchy enable row level security;

insert into public.dd_research_source_hierarchy(source_key,source_name,source_class,priority_rank,use_case,rule)
values
('GRANTS_GOV','Grants.gov','FEDERAL_PRIMARY',1,'Federal organizational grant discovery','Use as primary source for federal grant notices; verify eligibility and notice terms.'),
('USDA_RD','USDA Rural Development','FEDERAL_PRIMARY',1,'Rural business, housing, community and infrastructure programs','Match exact program and applicant type; do not generalize one USDA program to another.'),
('GEORGIA_STATE_AGENCIES','Georgia state agencies','STATE_PRIMARY',1,'State grants, workforce, agriculture, housing and economic development','Use official agency notices and current application windows.'),
('COUNTY_CONSERVATION_DISTRICT','County conservation district','LOCAL_PRIMARY',1,'Conservation, soil, water and local agriculture funding/program referrals','Contact the actual district serving the project geography; verify current programs.'),
('UGA_EXTENSION','UGA Cooperative Extension','LOCAL_TECHNICAL',2,'Agriculture, horticulture, farm business and local program navigation','Use as technical/referral resource; do not assume Extension itself is the grantor.'),
('GRANT_AGGREGATORS','Paid/free grant aggregators','SECONDARY',4,'Lead discovery only','Never pay solely for publicly available notice text until primary-source search has been exhausted; verify every lead at the grantor.')
on conflict(source_key) do update
set source_name=excluded.source_name,source_class=excluded.source_class,priority_rank=excluded.priority_rank,
    use_case=excluded.use_case,rule=excluded.rule,updated_at=now();

create table if not exists public.dd_learning_accelerator_framework (
  method_key text primary key,
  method_name text not null,
  use_when text not null,
  prompt_pattern text not null,
  completion_artifact text not null,
  guardrail text not null,
  active boolean not null default true,
  updated_at timestamptz not null default now()
);
alter table public.dd_learning_accelerator_framework enable row level security;

insert into public.dd_learning_accelerator_framework(method_key,method_name,use_when,prompt_pattern,completion_artifact,guardrail)
values
('MIND_MAP','Mind mapping','Starting a new domain or organizing complexity','Map key concepts, subtopics, dependencies and connections for the selected topic.','ONE_PAGE_CONCEPT_MAP_OR_SYSTEM_DIAGRAM','A map is not mastery; pair with execution.'),
('FEYNMAN','Feynman explanation','Testing basic understanding','Explain the topic in plain language and expose where the explanation becomes vague.','PLAIN_LANGUAGE_EXPLANATION_PLUS_GAPS','Do not oversimplify away legal/technical distinctions.'),
('REVERSE_ENGINEER','Reverse engineering','Understanding a workflow/system from outputs backward','Break the system into components, inputs, outputs, dependencies and failure modes.','DEPENDENCY_MAP_OR_PROCESS_FLOW','Use real system evidence when applied to production.'),
('EXPERT_LENS','Expert lens','Raising review standard','Evaluate the work using the standards an experienced practitioner would apply.','QUALITY_CHECKLIST','Do not invent credentials or pretend the AI has personal professional experience.'),
('GAP_DETECTOR','Knowledge gap detector','After user explains or attempts a task','Identify misconceptions, missing concepts and exercises that would close the gap.','GAP_LIST_PLUS_EXERCISES','Ground corrections in authoritative sources when high stakes.'),
('SPACED_RECALL','Spaced recall','Retaining material','Create recall questions, spaced review intervals and practical retrieval exercises.','REVIEW_SCHEDULE_PLUS_QUIZ','Prefer active recall over passive rereading.'),
('CONTEXT_FIRST','Context-first clarification','Task is materially ambiguous','Gather only the missing facts required to complete the task accurately.','RESOLVED_REQUIREMENTS','Do not ask unnecessary questions when current context is already sufficient.'),
('NEW_PERSPECTIVE','Alternative framing','User is stuck on one approach','Reframe the problem using another model, constraint set or stakeholder view.','ALTERNATIVE_PLAN_OR_DECISION_FRAME','Alternative must still respect real constraints.')
on conflict(method_key) do update
set method_name=excluded.method_name,use_when=excluded.use_when,prompt_pattern=excluded.prompt_pattern,
    completion_artifact=excluded.completion_artifact,guardrail=excluded.guardrail,active=true,updated_at=now();

create table if not exists public.dd_shadow_sol_agriculture_readiness (
  readiness_key text primary key,
  topic text not null,
  status text not null,
  verified_fact text not null,
  implication text not null,
  prohibited_inference text not null,
  next_step jsonb not null default '[]'::jsonb,
  updated_at timestamptz not null default now()
);
alter table public.dd_shadow_sol_agriculture_readiness enable row level security;

insert into public.dd_shadow_sol_agriculture_readiness(
  readiness_key,topic,status,verified_fact,implication,prohibited_inference,next_step
)
values
(
  'USDA_CENSUS_FARM_THRESHOLD',
  'USDA Census farm definition',
  'VERIFIED',
  'For USDA/NASS Census of Agriculture purposes, a farm is generally a place from which $1,000 or more of agricultural products were produced and sold, or normally would have been sold, during the year.',
  'A small herbs, plants, eggs, honey, flowers, produce or similar operation can meet the statistical farm definition without hundreds of acres.',
  'Meeting the $1,000 Census definition does not automatically qualify an operation for every USDA loan, grant, tax treatment, zoning status, insurance classification or farm program.',
  jsonb_build_array(
    'SELECT_LAWFUL_SHADOW_SOL_AGRICULTURE_MODEL',
    'TRACK_REAL_PRODUCTION_AND_SALES',
    'KEEP_SEPARATE_NONPROFIT_AND_FOR_PROFIT_ACCOUNTING',
    'VERIFY_EACH_USDA_PROGRAM_INDEPENDENTLY',
    'BUILD_FROM_FIRST_REAL_SALE_TO_REPEATABLE_OPERATION'
  )
)
on conflict(readiness_key) do update
set topic=excluded.topic,status=excluded.status,verified_fact=excluded.verified_fact,
    implication=excluded.implication,prohibited_inference=excluded.prohibited_inference,
    next_step=excluded.next_step,updated_at=now();

select
  (select count(*) from public.dd_training_funding_paths) as training_paths,
  (select count(*) from public.dd_property_research_sources) as property_sources,
  (select count(*) from public.dd_research_source_hierarchy) as research_sources,
  (select count(*) from public.dd_learning_accelerator_framework where active) as learning_methods,
  (select count(*) from public.dd_shadow_sol_agriculture_readiness) as ag_readiness_rows;
