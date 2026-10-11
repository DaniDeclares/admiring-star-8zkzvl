
create table if not exists public.dd_skill_credential_candidates (
  credential_key text primary key,
  credential_name text not null,
  issuer_or_platform text,
  status text not null default 'RESEARCH_CANDIDATE',
  supports_divisions jsonb not null default '[]'::jsonb,
  owner_home_revenue_use text,
  evidence_note text,
  guardrails jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);
alter table public.dd_skill_credential_candidates enable row level security;

insert into public.dd_skill_credential_candidates(
  credential_key,credential_name,issuer_or_platform,status,supports_divisions,
  owner_home_revenue_use,evidence_note,guardrails
)
values
(
  'META_ADVERTISING_COURSE',
  'Advertising with Meta',
  'Meta / Coursera',
  'RESEARCH_CANDIDATE',
  jsonb_build_array('marketing-content-media-production','business-development-growth'),
  'Paid-social advertising, campaign setup, audit and optimization support from home.',
  'Photo shows an example course certificate. It is not evidence that the owner holds this credential.',
  jsonb_build_object('do_not_claim_until_completed',true,'verify_current_course_and_credential_before_enrollment',true)
),
(
  'GOOGLE_AGILE_PM',
  'Agile Project Management',
  'Google / Coursera',
  'RESEARCH_CANDIDATE',
  jsonb_build_array('administrative-business-operations','business-development-growth','business-formation-digital-infrastructure'),
  'Project coordination, SOP/process work, implementation management and client operations from home.',
  'Photo shows an example course certificate. It is not evidence that the owner holds this credential.',
  jsonb_build_object('do_not_claim_until_completed',true,'map_to_existing_google_pm_path',true)
),
(
  'DELOITTE_TECH_CONSULTING_VIRTUAL_EXPERIENCE',
  'Technology Consulting Virtual Experience',
  'Deloitte / virtual experience platform',
  'RESEARCH_CANDIDATE',
  jsonb_build_array('business-formation-digital-infrastructure','administrative-business-operations','business-development-growth'),
  'Client discovery, network/security assessment, cloud-readiness and consulting portfolio evidence.',
  'Photo shows an example completion certificate. Treat as a portfolio-learning candidate, not a professional credential.',
  jsonb_build_object('do_not_claim_employment_or_client_experience',true,'list_as_virtual_experience_only_if_completed',true)
),
(
  'IBM_DATA_ANALYSIS_PYTHON',
  'Data Analysis with Python',
  'IBM Skills Network',
  'RESEARCH_CANDIDATE',
  jsonb_build_array('administrative-business-operations','business-development-growth','business-formation-digital-infrastructure'),
  'Data cleanup, reporting, analysis, dashboards and operational insight services from home.',
  'Photo shows an example course certificate. It is not evidence that the owner holds this credential.',
  jsonb_build_object('do_not_claim_until_completed',true)
),
(
  'MICROSOFT_OFFICE_SPECIALIST_EXPERT',
  'Microsoft Office Specialist: Expert',
  'Microsoft',
  'RESEARCH_CANDIDATE',
  jsonb_build_array('administrative-business-operations','business-development-growth'),
  'High-value document, spreadsheet, presentation and office-operations support from home.',
  'Photo shows an example certification. It is not evidence that the owner holds this credential.',
  jsonb_build_object('do_not_claim_until_earned',true,'exam_based_certification',true)
),
(
  'PAYPAL_INSIDE_SALES_EXAMPLE',
  'Inside Sales training / program',
  'PayPal example shown',
  'REFERENCE_ONLY',
  jsonb_build_array('business-development-growth'),
  'Sales process, discovery, objection handling and inside-sales discipline.',
  'Photo shows an internal PayPal program example; do not assume public enrollment is available.',
  jsonb_build_object('do_not_claim_or_enroll_without_verified_public_path',true)
),
(
  'MICROSOFT_PYTHON_FOUNDATIONS',
  'Introduction to Python: Fundamentals',
  'Microsoft learning example',
  'RESEARCH_CANDIDATE',
  jsonb_build_array('business-formation-digital-infrastructure','administrative-business-operations'),
  'Automation, data handling and technical-service support from home.',
  'Photo shows an example certificate. It is not evidence that the owner holds this credential.',
  jsonb_build_object('do_not_claim_until_completed',true)
)
on conflict(credential_key) do update
set credential_name=excluded.credential_name,
    issuer_or_platform=excluded.issuer_or_platform,
    status=excluded.status,
    supports_divisions=excluded.supports_divisions,
    owner_home_revenue_use=excluded.owner_home_revenue_use,
    evidence_note=excluded.evidence_note,
    guardrails=excluded.guardrails,
    updated_at=now();

insert into public.dd_property_acquisition_strategies(
  strategy_key,strategy_name,status,geography,strategy_type,workflow,
  legal_ethics_gates,underwriting_gates,prohibited_assumptions,source_basis
)
values(
  'FAMILY_LAND_NONNEGOTIABLE_SCREEN',
  'Family land non-negotiable screen',
  'ACTIVE_SCREEN',
  'GEORGIA_FIRST',
  'OWNER_OCCUPIED_LAND_OR_HOMESTEAD',
  jsonb_build_array(
    'VERIFY_LEGAL_ACCESS',
    'CHECK_HOA_AND_PRIVATE_COVENANTS',
    'CHECK_DEED_RESTRICTIONS',
    'CALCULATE_USABLE_ACREAGE',
    'VERIFY_BUILDABLE_GROUND',
    'VERIFY_SEPTIC_OR_PERC_POTENTIAL',
    'VERIFY_RELIABLE_WATER_SOURCE',
    'CHECK_FLOOD_RISK',
    'CHECK_DRAINAGE_AND_TOPOGRAPHY',
    'VERIFY_ANIMAL_OR_LIVESTOCK_RULES_IF_RELEVANT',
    'MODEL_PROPERTY_TAXES',
    'CHECK_EASEMENTS',
    'ASSESS_NEIGHBOR_AND_ADJACENT_LAND_USE_RISK',
    'CHECK_DISTANCE_TO_NECESSITIES',
    'VERIFY_SPACE_FOR_FAMILY_AND_FUTURE_USE'
  ),
  jsonb_build_array(
    'TITLE_AND_SURVEY',
    'ZONING_AND_COVENANTS',
    'ACCESS_EASEMENTS',
    'WELL_SEPTIC_AND_ENVIRONMENTAL',
    'OWNER_OCCUPANCY_FINANCING_RULES'
  ),
  jsonb_build_array(
    'LEGAL_ACCESS','USABLE_ACREAGE','BUILDABILITY','WATER','SEPTIC_PERC',
    'FLOOD','DRAINAGE','PROPERTY_TAXES','EASEMENTS','NECESSITY_ACCESS','FAMILY_CAPACITY'
  ),
  jsonb_build_array(
    'NO_HOA_IS_UNIVERSALLY_REQUIRED',
    'LIVESTOCK_IS_REQUIRED_FOR_EVERY_PROPERTY',
    'SOCIAL_MEDIA_CHECKLIST_REPLACES_SURVEY_TITLE_ZONING_OR_ENGINEERING'
  ),
  'OWNER_SHARED_PHOTO_15_LAND_BUYING_NON_NEGOTIABLES_2026-10-06'
)
on conflict(strategy_key) do update
set strategy_name=excluded.strategy_name,status=excluded.status,geography=excluded.geography,
    strategy_type=excluded.strategy_type,workflow=excluded.workflow,
    legal_ethics_gates=excluded.legal_ethics_gates,
    underwriting_gates=excluded.underwriting_gates,
    prohibited_assumptions=excluded.prohibited_assumptions,
    source_basis=excluded.source_basis,updated_at=now();

create table if not exists public.dd_owner_hq_design_requirements (
  requirement_key text primary key,
  requirement_name text not null,
  priority text not null,
  requirement_spec jsonb not null,
  source_basis text,
  updated_at timestamptz not null default now()
);
alter table public.dd_owner_hq_design_requirements enable row level security;

insert into public.dd_owner_hq_design_requirements(requirement_key,requirement_name,priority,requirement_spec,source_basis)
values
(
  'COMMAND_CENTER_SINGLE_SCREEN',
  'Owner command center single-screen operating view',
  'P0',
  jsonb_build_object(
    'visual_pattern','One primary mission column plus concise operational panels rather than many disconnected dashboards.',
    'core_panels',jsonb_build_array(
      'TODAYS_MISSION',
      'NEEDS_YOU',
      'NEXT_14_DAYS',
      'ROUTINES_AUTOMATIONS',
      'REVENUE_AND_RESULT_GRAPH',
      'ACTIVE_AGENTS_OR_WORKERS',
      'RECENT_ACTIVITY_TIMELINE'
    ),
    'owner_rule','Surface only the decisions and exceptions that truly need Dani; background automation should remain visible but not noisy.',
    'operation_1m_rule','Revenue, housing deadline, owner-home work and provider-field work must be visible together.'
  ),
  'OWNER_SHARED_AGENTIC_COMMAND_CENTER_PHOTO_2026-10-06'
),
(
  'OWNER_HOME_PROVIDER_PARALLEL',
  'Parallel owner-home and provider-field execution view',
  'P0',
  jsonb_build_object(
    'lanes',jsonb_build_array('OWNER_HOME_REVENUE','PROVIDER_FIELD_EXECUTION'),
    'display','Show active jobs, quote pipeline, next actions, provider assignments and owner-home deliverables separately but on the same command surface.'
  ),
  'OWNER_SHARED_COMMAND_CENTER_PHOTO_PLUS_OWNER_DIRECTIVE_2026-10-06'
)
on conflict(requirement_key) do update
set requirement_name=excluded.requirement_name,priority=excluded.priority,
    requirement_spec=excluded.requirement_spec,source_basis=excluded.source_basis,updated_at=now();

create table if not exists public.dd_wealth_strategy_claim_guard (
  claim_key text primary key,
  claim_seen text not null,
  treatment text not null,
  verified_principle text,
  prohibited_inference text,
  updated_at timestamptz not null default now()
);
alter table public.dd_wealth_strategy_claim_guard enable row level security;

insert into public.dd_wealth_strategy_claim_guard(claim_key,claim_seen,treatment,verified_principle,prohibited_inference)
values
(
  'NO_PG_50K_150K_BUSINESS_CREDIT',
  'Build business credit in year 2, then obtain $50K-$150K with no personal guarantee in year 3.',
  'REJECT_GUARANTEE',
  'Business credit and lender relationships can improve financing access over time, but limits, guarantees and underwriting vary by lender and borrower.',
  'Do not plan Operation $1M around guaranteed no-PG funding amounts or a fixed year-by-year timeline.'
),
(
  'TRUST_AUTOMATIC_ASSET_PROTECTION',
  'Move assets into a trust and wealth is protected from lawsuits, probate and taxes.',
  'REJECT_OVERSIMPLIFICATION',
  'Estate/trust structures can address ownership, succession and probate depending on the trust and jurisdiction.',
  'Do not claim a trust automatically shields assets from creditors/lawsuits or eliminates taxes.'
),
(
  'CASHFLOW_ASSET_AFTER_STABLE_BASE',
  'Acquire a cash-flowing asset after building the operating base.',
  'KEEP_AS_LONG_TERM_PRINCIPLE',
  'Profitable assets may diversify income after housing stability, business reserves and underwriting support the purchase.',
  'Do not accelerate vending, laundromat, rental or other asset purchases ahead of current housing and cash-flow constraints.'
)
on conflict(claim_key) do update
set claim_seen=excluded.claim_seen,treatment=excluded.treatment,
    verified_principle=excluded.verified_principle,prohibited_inference=excluded.prohibited_inference,
    updated_at=now();

create table if not exists public.dd_prompt_shortcut_patterns (
  shortcut_key text primary key,
  intended_action text not null,
  status text not null,
  implementation_note text not null,
  updated_at timestamptz not null default now()
);
alter table public.dd_prompt_shortcut_patterns enable row level security;

insert into public.dd_prompt_shortcut_patterns(shortcut_key,intended_action,status,implementation_note)
values
('/rewrite','Rewrite provided content','INTERNAL_PATTERN','Not a hidden ChatGPT command; may be used as a user-facing shorthand in DANI workflows.'),
('/proofread','Proofread provided content','INTERNAL_PATTERN','Not a hidden ChatGPT command.'),
('/shorten','Shorten provided content','INTERNAL_PATTERN','Not a hidden ChatGPT command.'),
('/hook','Generate hooks','INTERNAL_PATTERN','Not a hidden ChatGPT command.'),
('/caption','Create social captions','INTERNAL_PATTERN','Not a hidden ChatGPT command.'),
('/offer','Draft an offer','INTERNAL_PATTERN','Not a hidden ChatGPT command.'),
('/sales','Draft a sales pitch','INTERNAL_PATTERN','Not a hidden ChatGPT command.'),
('/swot','Create SWOT analysis','INTERNAL_PATTERN','Not a hidden ChatGPT command.'),
('/roadmap','Create staged roadmap','INTERNAL_PATTERN','Not a hidden ChatGPT command.'),
('/checklist','Create checklist','INTERNAL_PATTERN','Not a hidden ChatGPT command.')
on conflict(shortcut_key) do update
set intended_action=excluded.intended_action,status=excluded.status,
    implementation_note=excluded.implementation_note,updated_at=now();

insert into public.dd_division_growth_rules(
  division_id,rule_key,rule_name,rule_spec,source_basis
)
select d.id,
  'THREE_LAYER_REVENUE_SYSTEM',
  'Content -> capture -> monetization system',
  jsonb_build_object(
    'layer_1',jsonb_build_object(
      'name','CONTENT_ENGINE',
      'goal','Create useful original content at a sustainable cadence from verified buyer problems and real operating knowledge.'
    ),
    'layer_2',jsonb_build_object(
      'name','CAPTURE_AND_FOLLOWUP',
      'goal','Turn attention into a permission-based email/list/DM lead or direct service inquiry with a clear next step.'
    ),
    'layer_3',jsonb_build_object(
      'name','MONETIZATION',
      'goal','Route the buyer to a digital product, productized service, recurring service, affiliate offer where appropriate, or higher-value DANI execution service.'
    ),
    'cross_channel_rule','Apply this mechanism wherever appropriate across CH01-CH05 and all 13 divisions; do not create isolated faceless brands by default.',
    'metrics',jsonb_build_array('QUALIFIED_LEADS','BOOKINGS','PRODUCT_SALES','RECURRING_REVENUE','CROSS_SELLS'),
    'anti_hype',jsonb_build_array('AUTOPILOT_MONEY','GUARANTEED_50K_MONTH','VIEWS_EQUAL_REVENUE')
  ),
  'OWNER_SHARED_INVISIBLE_REVENUE_SYSTEM_PHOTO_2026-10-06'
from public.divisions d
where d.is_active
on conflict(division_id,rule_key) do update
set rule_spec=excluded.rule_spec,source_basis=excluded.source_basis,updated_at=now();

select
  (select count(*) from public.dd_skill_credential_candidates) as credential_candidates,
  (select count(*) from public.dd_owner_hq_design_requirements) as hq_requirements,
  (select count(*) from public.dd_wealth_strategy_claim_guard) as wealth_claim_guards,
  (select count(*) from public.dd_division_growth_rules where rule_key='THREE_LAYER_REVENUE_SYSTEM') as revenue_system_divisions;
