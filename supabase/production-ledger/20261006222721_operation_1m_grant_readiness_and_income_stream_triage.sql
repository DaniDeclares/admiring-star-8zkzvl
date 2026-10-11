
create table if not exists public.dd_grant_readiness_document_register (
  document_key text primary key,
  document_name text not null,
  readiness_status text not null default 'NEEDS_VERIFICATION',
  authority text,
  evidence_location text,
  required_for_all_grants boolean not null default false,
  notes text,
  metadata jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);
alter table public.dd_grant_readiness_document_register enable row level security;

insert into public.dd_grant_readiness_document_register(
  document_key,document_name,readiness_status,authority,evidence_location,required_for_all_grants,notes,metadata
)
values
('BUSINESS_PLAN','Current business plan / one-page summary','NEEDS_REFRESH','DANI_INTERNAL',null,false,
 'Useful for many grant applications but not universally required; tailor to the actual funding opportunity.',
 jsonb_build_object('operation','OPERATION_1M','target_output','ONE_PAGE_EXECUTIVE_SUMMARY_PLUS_FULL_PLAN')),
('EIN','IRS EIN confirmation','KNOWN_EXISTS','IRS',null,false,
 'DANI has an EIN/entity identity, but grant-specific upload requirements vary.',
 jsonb_build_object('operation','OPERATION_1M','do_not_publish_sensitive_identifier',true)),
('BUSINESS_BANK_STATEMENTS','Recent business bank statements','AVAILABLE_FROM_CONNECTED_FINANCES','FINANCES_CONNECTOR',null,false,
 'Use only the statement period required by the specific application; do not assume every grant requires bank statements.',
 jsonb_build_object('operation','OPERATION_1M','sensitive_document',true)),
('ENTITY_REGISTRATION','Georgia LLC registration / good standing evidence','NEEDS_CURRENT_COPY','GEORGIA_SECRETARY_OF_STATE',null,false,
 'Verify current good-standing/status evidence when the opportunity requires it.',
 jsonb_build_object('operation','OPERATION_1M')),
('USE_OF_FUNDS','Opportunity-specific use-of-funds statement','BUILD_PER_OPPORTUNITY','DANI_INTERNAL',null,false,
 'Do not use a generic paragraph for every application. Tie amount, purchases, outcomes and timing to the specific opportunity.',
 jsonb_build_object('operation','OPERATION_1M','template_required',true))
on conflict(document_key) do update
set document_name=excluded.document_name,
    readiness_status=excluded.readiness_status,
    authority=excluded.authority,
    required_for_all_grants=excluded.required_for_all_grants,
    notes=excluded.notes,
    metadata=public.dd_grant_readiness_document_register.metadata||excluded.metadata,
    updated_at=now();

insert into public.dd_division_operating_playbook(
  division_id,playbook_key,playbook_name,lifecycle_stage,required,specification,source_basis
)
select d.id,'GRANT_APPLICATION_READINESS','Grant application readiness','ACTIVE',true,
  jsonb_build_object(
    'core_packet',jsonb_build_array('BUSINESS_PLAN','EIN','BUSINESS_BANK_STATEMENTS','ENTITY_REGISTRATION','USE_OF_FUNDS'),
    'rule','Treat this five-document list as a readiness baseline, not a universal grant checklist.',
    'opportunity_specific_additions',jsonb_build_array(
      'ELIGIBILITY_CERTIFICATIONS',
      'BUDGET_AND_MATCH',
      'PROJECT_TIMELINE',
      'TAX_RETURNS_OR_FINANCIALS',
      'SAM_OR_VENDOR_REGISTRATION',
      'LETTERS_OF_SUPPORT',
      'INSURANCE',
      'RESUMES_OR_CAPABILITY_STATEMENT',
      'SITE_CONTROL_OR_PROPERTY_DOCUMENTS',
      'NONPROFIT_DETERMINATION_IF_APPLICABLE'
    ),
    'quality_gate','Read the actual NOFO/NOFA/solicitation and build the submission checklist from source authority before applying.',
    'sensitive_data_rule','Do not expose EIN, bank statements, tax data or identity documents in public-facing materials.'
  ),
  'OWNER_SHARED_GRANT_CHECKLIST_REFRAMED_AS_BASELINE_2026-10-06'
from public.divisions d
where d.slug in ('business-development-growth','government-institutional-procurement','administrative-business-operations')
on conflict(division_id,playbook_key) do update
set lifecycle_stage=excluded.lifecycle_stage,specification=excluded.specification,source_basis=excluded.source_basis,updated_at=now();

create table if not exists public.dd_income_stream_triage (
  stream_key text primary key,
  stream_name text not null,
  owner_or_company text not null,
  status text not null,
  capital_intensity text not null,
  strategic_fit text not null,
  execution_priority text not null,
  rationale text,
  validation_steps jsonb not null default '[]'::jsonb,
  guardrails jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);
alter table public.dd_income_stream_triage enable row level security;

insert into public.dd_income_stream_triage(
  stream_key,stream_name,owner_or_company,status,capital_intensity,strategic_fit,execution_priority,rationale,validation_steps,guardrails
)
values
('PRINT_ON_DEMAND','Print-on-demand','DANI_DECLARES','ACTIVE_EXISTING_LANE','LOW_TO_MEDIUM','HIGH','P1',
 'Already aligned with DANI creative/merch capabilities and existing Shopify/Printify work; stronger fit than starting a brand-new side hustle.',
 jsonb_build_array('AUDIT_EXISTING_PRODUCTS','VALIDATE_BUYER_PROBLEM_OR_AUDIENCE','CREATE_MISSING_PRODUCTS','PUBLISH','DISTRIBUTE','MEASURE'),
 jsonb_build_object('no_generic_product_spam',true,'protect_margin',true)),
('FACELESS_YOUTUBE','Faceless YouTube content','DANI_OR_SHADOW_SOL','RESEARCH_ONLY','LOW','MEDIUM','P3',
 'Potential media/distribution asset, but slow monetization and content-production load make it secondary to immediate revenue lanes.',
 jsonb_build_array('SELECT_CHANNEL_PURPOSE','VERIFY_PLATFORM_MONETIZATION_TERMS','BUILD_10_VIDEO_PILOT','MEASURE_RETENTION_AND_TRAFFIC'),
 jsonb_build_object('no_income_guarantees',true,'copyright_safe_assets_only',true)),
('VENDING_ATM_ROUTES','Vending machine / ATM routes','OWNER_OR_FUTURE_ENTITY','HOLD_CAPITAL','MEDIUM_TO_HIGH','LOW_TO_MEDIUM','P4',
 'Requires acquisition capital, route economics, servicing logistics, cash handling and site agreements; not appropriate ahead of Dec. 18 housing stability and business-critical obligations.',
 jsonb_build_array('CASHFLOW_MODEL','ROUTE_DUE_DILIGENCE','SITE_AGREEMENTS','INSURANCE','SERVICE_LOGISTICS','CAPITAL_SOURCE'),
 jsonb_build_object('no_purchase_before_housing_stability',true,'no_debt_without_cashflow_test',true))
on conflict(stream_key) do update
set stream_name=excluded.stream_name,
    owner_or_company=excluded.owner_or_company,
    status=excluded.status,
    capital_intensity=excluded.capital_intensity,
    strategic_fit=excluded.strategic_fit,
    execution_priority=excluded.execution_priority,
    rationale=excluded.rationale,
    validation_steps=excluded.validation_steps,
    guardrails=excluded.guardrails,
    updated_at=now();

select
  (select count(*) from public.dd_grant_readiness_document_register) as grant_docs,
  (select count(*) from public.dd_income_stream_triage) as income_streams,
  (select count(*) from public.dd_division_operating_playbook where playbook_key='GRANT_APPLICATION_READINESS') as grant_playbooks;
