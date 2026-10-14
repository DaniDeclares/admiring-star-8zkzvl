
create table if not exists public.dd_cash_management_rules (
  rule_key text primary key,
  rule_name text not null,
  scope text not null,
  priority integer not null,
  rule_spec jsonb not null,
  source_basis text,
  updated_at timestamptz not null default now()
);
alter table public.dd_cash_management_rules enable row level security;

insert into public.dd_cash_management_rules(rule_key,rule_name,scope,priority,rule_spec,source_basis)
values
(
  'DISCRETIONARY_PURCHASE_COOLING_OFF',
  '24-hour cooling-off for nonessential purchases',
  'OWNER_AND_BUSINESS_DISCRETIONARY_SPEND',
  10,
  jsonb_build_object(
    'rule','Nonessential online purchases wait at least 24 hours before payment.',
    'exceptions',jsonb_build_array('CLIENT_JOB_MATERIAL_REQUIRED_NOW','SAFETY','HOUSING_BASIC_NEEDS','P0_BUSINESS_CONTINUITY'),
    'goal','Reduce impulse leakage without delaying revenue-producing or essential spend.'
  ),
  'OWNER_SHARED_PAYCHECK_ROUTINE_2026-10-06'
),
(
  'CASH_WATERFALL',
  'Cash allocation waterfall',
  'BUSINESS_CASH',
  1,
  jsonb_build_object(
    'order',jsonb_build_array(
      'HOUSING_FOOD_CHILDREN_BASIC_NEEDS_IF_OWNER_DRAW_REQUIRED',
      'JOB_FULFILLMENT_AND_PROVIDER_PAY',
      'TAX_AND_REQUIRED_RESERVES',
      'P0_BUSINESS_CONTINUITY',
      'DEC18_HOUSING_RESERVE',
      'OPERATING_RESERVE',
      'GROWTH_SPEND',
      'DISCRETIONARY'
    ),
    'reserve_rule','Do not blindly force a fixed 10% savings rule when doing so would cause an essential obligation or housing deadline to fail. Use a configurable reserve target based on current cash and due dates.',
    'goal','Protect survival, fulfillment, compliance and runway before discretionary spending.'
  ),
  'OWNER_SHARED_PAYCHECK_ROUTINE_ADAPTED_TO_CURRENT_CONSTRAINTS_2026-10-06'
),
(
  'MONTHLY_SPEND_CAP',
  'Hard cap discretionary operating spend',
  'BUSINESS_CASH',
  20,
  jsonb_build_object(
    'rule','After required obligations and approved growth spend are reserved, cap discretionary spend to the remaining authorized amount.',
    'no_unbudgeted_subscription_rule',true,
    'no_new_tool_before_existing_tool_audit',true
  ),
  'OWNER_SHARED_PAYCHECK_ROUTINE_2026-10-06'
)
on conflict(rule_key) do update
set rule_name=excluded.rule_name,scope=excluded.scope,priority=excluded.priority,
    rule_spec=excluded.rule_spec,source_basis=excluded.source_basis,updated_at=now();

create table if not exists public.dd_online_income_model_triage (
  model_key text primary key,
  model_name text not null,
  status text not null,
  strategic_fit text not null,
  priority text not null,
  existing_assets jsonb not null default '[]'::jsonb,
  validation_plan jsonb not null default '[]'::jsonb,
  guardrails jsonb not null default '{}'::jsonb,
  source_basis text,
  updated_at timestamptz not null default now()
);
alter table public.dd_online_income_model_triage enable row level security;

insert into public.dd_online_income_model_triage(
  model_key,model_name,status,strategic_fit,priority,existing_assets,validation_plan,guardrails,source_basis
)
values
(
  'PRINT_ON_DEMAND',
  'Print on demand',
  'ACTIVE_EXISTING_LANE',
  'HIGH',
  'P1',
  jsonb_build_array('SHOPIFY','PRINTIFY','DTF_CAPABILITY','BRANDED_PROVIDER_MERCH_PLAN','DIGITAL_DESIGN_CAPABILITY'),
  jsonb_build_array('AUDIT_EXISTING_PRODUCTS','PUBLISH_GAPS','TEST_BUYER_DEMAND','MEASURE_MARGIN_AND_CONVERSION','EXPAND_WINNERS'),
  jsonb_build_object('no_inventory_required',true,'protect_margin',true,'no_generic_design_spam',true),
  'OWNER_SHARED_ONLINE_INCOME_POST_2026-10-06'
),
(
  'AMAZON_KDP',
  'Amazon KDP print/digital publishing',
  'RESEARCH_TO_PILOT',
  'MEDIUM',
  'P3',
  jsonb_build_array('CANVA_SKILL_ENGINE','DIGITAL_PRODUCT_CANDIDATES'),
  jsonb_build_array('SELECT_ONE_VALIDATED_PROBLEM','CHECK_KDP_CONTENT_AND_METADATA_RULES','CREATE_ONE_HIGH_VALUE_WORKBOOK_OR_GUIDE','PUBLISH_PILOT','MEASURE_ORGANIC_AND_EXTERNAL_TRAFFIC'),
  jsonb_build_object('no_mass_low_content_spam',true,'no_copyright_or_trademark_infringement',true,'no_income_guarantees',true),
  'OWNER_SHARED_ONLINE_INCOME_POST_2026-10-06'
),
(
  'AFFILIATE_MARKETING',
  'Affiliate marketing',
  'RESEARCH_ONLY',
  'MEDIUM',
  'P3',
  jsonb_build_array('SOCIAL_CHANNELS','EMAIL','WEBSITE','CONTENT_ENGINE'),
  jsonb_build_array('CHOOSE_ONLY_PRODUCTS_DANI_ACTUALLY_USES_OR_CAN_EVALUATE','VERIFY_PROGRAM_TERMS','ADD_CLEAR_DISCLOSURES','TEST_ONE_AUDIENCE_OFFER','MEASURE_CLICKS_AND_SALES'),
  jsonb_build_object('no_high_ticket_hype',true,'no_fake_reviews',true,'affiliate_disclosure_required',true,'no_conflict_with_client_trust',true),
  'OWNER_SHARED_ONLINE_INCOME_POST_2026-10-06'
)
on conflict(model_key) do update
set model_name=excluded.model_name,status=excluded.status,strategic_fit=excluded.strategic_fit,
    priority=excluded.priority,existing_assets=excluded.existing_assets,validation_plan=excluded.validation_plan,
    guardrails=excluded.guardrails,source_basis=excluded.source_basis,updated_at=now();

insert into public.dd_property_acquisition_strategies(
  strategy_key,strategy_name,status,geography,strategy_type,workflow,legal_ethics_gates,underwriting_gates,prohibited_assumptions,source_basis
)
values
(
  'FHA_203K_PURCHASE_REHAB',
  'FHA 203(k) purchase and rehabilitation path',
  'RESEARCH_ACTIVE',
  'GEORGIA',
  'OWNER_OCCUPIED_PURCHASE_REHAB',
  jsonb_build_array(
    'VERIFY_FHA_BORROWER_ELIGIBILITY',
    'IDENTIFY_203K_ELIGIBLE_PROPERTY',
    'USE_FHA_APPROVED_LENDER',
    'DETERMINE_LIMITED_OR_STANDARD_203K',
    'BUILD_REHAB_SCOPE_AND_COST',
    'APPRAISAL_AS_COMPLETED',
    'UNDERWRITE_PURCHASE_PLUS_REHAB',
    'CLOSE',
    'COMPLETE_REHAB_THROUGH_APPROVED_PROCESS'
  ),
  jsonb_build_array(
    'OWNER_OCCUPANCY_AND_FHA_RULES',
    'HUD_MINIMUM_PROPERTY_AND_REHAB_RULES',
    'APPROVED_CONTRACTOR_AND_DRAW_REQUIREMENTS_AS_APPLICABLE',
    'NO_COMMINGLING_WITH_DANI_COMMERCIAL_PROPERTY'
  ),
  jsonb_build_array(
    'TOTAL_PAYMENT',
    'DOWN_PAYMENT_AND_CLOSING_COST',
    'REHAB_CONTINGENCY',
    'TAXES_AND_INSURANCE',
    'TEMPORARY_HOUSING_OR_MORTGAGE_RESERVE_WHEN_ALLOWED',
    'TIMELINE_TO_DEC18',
    'PROPERTY_LOCATION_AND_CONDITION'
  ),
  jsonb_build_array(
    'ALL_FIXER_UPPERS_QUALIFY',
    'REHAB_FUNDS_ARE_CASH_TO_BORROWER',
    '203K_GUARANTEES_DEC18_CLOSING',
    'FHA_203K_IS_BETTER_THAN_USDA_FOR_EVERY_PROPERTY'
  ),
  'HUD_FHA_203K_PRIMARY_SOURCE_VERIFICATION_2026-10-06'
)
on conflict(strategy_key) do update
set strategy_name=excluded.strategy_name,status=excluded.status,geography=excluded.geography,
    strategy_type=excluded.strategy_type,workflow=excluded.workflow,
    legal_ethics_gates=excluded.legal_ethics_gates,underwriting_gates=excluded.underwriting_gates,
    prohibited_assumptions=excluded.prohibited_assumptions,source_basis=excluded.source_basis,updated_at=now();

create table if not exists public.dd_software_service_opportunities (
  opportunity_key text primary key,
  opportunity_name text not null,
  status text not null,
  target_division_slug text not null,
  platform text not null,
  service_model jsonb not null,
  buyer_problem text not null,
  build_before_sell jsonb not null default '[]'::jsonb,
  guardrails jsonb not null default '{}'::jsonb,
  source_basis text,
  updated_at timestamptz not null default now()
);
alter table public.dd_software_service_opportunities enable row level security;

insert into public.dd_software_service_opportunities(
  opportunity_key,opportunity_name,status,target_division_slug,platform,service_model,buyer_problem,build_before_sell,guardrails,source_basis
)
values
(
  'TWENTY_CRM_IMPLEMENTATION',
  'Open-source CRM setup and implementation service',
  'RESEARCH_TO_INTERNAL_PILOT',
  'business-formation-digital-infrastructure',
  'Twenty CRM',
  jsonb_build_object(
    'offer_components',jsonb_build_array(
      'DISCOVERY',
      'DEPLOYMENT',
      'DOMAIN_AND_SECURITY_SETUP',
      'DATA_MODEL_CUSTOMIZATION',
      'PIPELINE_CONFIGURATION',
      'WORKFLOW_SETUP',
      'EMAIL_OR_CALENDAR_INTEGRATION_WHERE_SUPPORTED',
      'DATA_IMPORT',
      'TRAINING',
      'MAINTENANCE_OPTION'
    ),
    'fulfillment_model','PROVIDER_LED_OR_TECH_PARTNER',
    'hosting_options',jsonb_build_array('TWENTY_CLOUD','SELF_HOSTED','RAILWAY_OR_OTHER_COMPATIBLE_HOST')
  ),
  'Small businesses may need a lower-license-cost customizable CRM but lack the technical capacity to deploy, secure, configure and migrate it.',
  jsonb_build_array(
    'DEPLOY_INTERNAL_SANDBOX',
    'VERIFY_AGPL_LICENSE_OBLIGATIONS',
    'DOCUMENT_SECURE_DEPLOYMENT',
    'BUILD_REPEATABLE_SETUP_CHECKLIST',
    'MEASURE_TRUE_HOSTING_COST',
    'CREATE_SAMPLE_WORKSPACE',
    'DEFINE_SUPPORT_BOUNDARIES',
    'ONLY_THEN_PRICE_CLIENT_OFFER'
  ),
  jsonb_build_object(
    'no_30_second_app_claim',true,
    'no_thousands_in_revenue_claim',true,
    'no_replace_salesforce_claim_without_fit_analysis',true,
    'security_hardening_required',true,
    'backup_and_data_ownership_plan_required',true,
    'owner_not_primary_tech_fulfiller',true
  ),
  'OWNER_SHARED_OPEN_SOURCE_CRM_POST_PLUS_TWENTY_RAILWAY_VERIFICATION_2026-10-06'
)
on conflict(opportunity_key) do update
set opportunity_name=excluded.opportunity_name,status=excluded.status,target_division_slug=excluded.target_division_slug,
    platform=excluded.platform,service_model=excluded.service_model,buyer_problem=excluded.buyer_problem,
    build_before_sell=excluded.build_before_sell,guardrails=excluded.guardrails,
    source_basis=excluded.source_basis,updated_at=now();

insert into public.dd_division_growth_rules(
  division_id,rule_key,rule_name,rule_spec,source_basis
)
select d.id,
  'LEAN_FIRST_SALE',
  'Lean first-sale rule',
  jsonb_build_object(
    'rule','Use existing DANI brand, site/social surface and payment capability to validate an offer before buying new launch software or creating a separate brand.',
    'minimum_launch',jsonb_build_array('ONE_USEFUL_OFFER','ONE_CLEAR_BUYER','ONE_SALES_PAGE_OR_PRODUCT_DOC','ONE_PAYMENT_PATH','ONE_DISTRIBUTION_CHANNEL'),
    'buy_after_revenue',jsonb_build_array('NEW_FUNNEL_SOFTWARE','COURSE_PLATFORM','EXTRA_DOMAIN','EXTRA_BRAND_ASSETS','PAID_AUTOMATION'),
    'exception','Infrastructure required for compliance, delivery, accessibility or secure payment may be funded before revenue when genuinely necessary.'
  ),
  'OWNER_SHARED_LEAN_DIGITAL_LAUNCH_POST_2026-10-06'
from public.divisions d
where d.slug in ('creative-design-production','marketing-content-media-production','business-formation-digital-infrastructure','business-development-growth')
on conflict(division_id,rule_key) do update
set rule_spec=excluded.rule_spec,source_basis=excluded.source_basis,updated_at=now();

create table if not exists public.dd_ai_decision_quality_rules (
  rule_key text primary key,
  rule_name text not null,
  rule_spec jsonb not null,
  applies_to text not null default 'DANI_AGENTS_AND_ANALYSIS',
  updated_at timestamptz not null default now()
);
alter table public.dd_ai_decision_quality_rules enable row level security;

insert into public.dd_ai_decision_quality_rules(rule_key,rule_name,rule_spec)
values
('CORRECTION_FIRST','Correct bad assumptions before building on them',jsonb_build_object('rule','If a premise conflicts with verified evidence, state and correct the premise before proceeding.')),
('UNCERTAINTY_DISCLOSURE','Expose material uncertainty',jsonb_build_object('rule','Distinguish verified fact, estimate, inference and unknown. Do not invent precision or unsupported confidence percentages.')),
('EVIDENCE_OVER_PRESSURE','Do not cave to pressure without new evidence',jsonb_build_object('rule','Change a conclusion only when evidence, assumptions or objectives materially change.')),
('NEXT_BETTER_QUESTION','Surface the next decision-driving question',jsonb_build_object('rule','For material decisions, identify the next unresolved question that would most improve the decision or execution path.')),
('NO_VALIDATION_FLUFF','Prefer decision-relevant content',jsonb_build_object('rule','Do not spend output budget on empty praise or agreement; move directly to evidence, action, correction or decision support.'))
on conflict(rule_key) do update
set rule_name=excluded.rule_name,rule_spec=excluded.rule_spec,updated_at=now();

select
  (select count(*) from public.dd_cash_management_rules) as cash_rules,
  (select count(*) from public.dd_online_income_model_triage) as online_income_models,
  (select count(*) from public.dd_property_acquisition_strategies where strategy_key='FHA_203K_PURCHASE_REHAB') as fha203k_rows,
  (select count(*) from public.dd_software_service_opportunities where opportunity_key='TWENTY_CRM_IMPLEMENTATION') as crm_service_rows,
  (select count(*) from public.dd_ai_decision_quality_rules) as ai_quality_rules;
