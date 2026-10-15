
insert into public.dd_division_growth_rules(
  division_id,rule_key,rule_name,rule_spec,source_basis
)
select d.id,'LEARNING_TO_ARTIFACT','Turn learning into business output',
  jsonb_build_object(
    'rule','Saved tutorials, inspiration and training are not completion. Every learning input must produce a usable business artifact, tested workflow, or verified operating improvement.',
    'minimum_output',jsonb_build_array('ONE_BUSINESS_ARTIFACT_OR_WORKFLOW','ONE_TEST_OR_REAL_USE','ONE_REUSABLE_TEMPLATE_OR_SYSTEM_UPDATE'),
    'examples',jsonb_build_array('SERVICE_GRAPHIC','QUOTE_TEMPLATE','LANDING_PAGE','BOOKING_FLOW','CLIENT_HANDOUT','SOCIAL_ASSET','TRAINING_ASSET','AUTOMATION'),
    'anti_pattern','ENDLESS_RESEARCH_WITHOUT_OUTPUT'
  ),
  'OWNER_SHARED_CANVA_SKILL_BUILD_PATTERN_2026-10-06'
from public.divisions d
where d.is_active
on conflict(division_id,rule_key) do update
set rule_spec=excluded.rule_spec,source_basis=excluded.source_basis,updated_at=now();

insert into public.dd_division_growth_rules(
  division_id,rule_key,rule_name,rule_spec,source_basis
)
select d.id,'PROBLEM_FIRST_PRODUCT_VALIDATION','Validate paid problem before building product',
  jsonb_build_object(
    'inputs',jsonb_build_array('AUDIENCE','KNOWN_FOR','FAQS','RECURRING_PROBLEMS','BEST_PERFORMING_CONTENT','SALES_AND_SUPPORT_SIGNALS'),
    'analysis',jsonb_build_array('IDENTIFY_5_SPECIFIC_PAID_PROBLEMS','STATE_DESIRED_RESULT','PROPOSE_SIMPLE_PRODUCT','EXPLAIN_WHY_NON_GENERIC','RANK_BY_URGENCY_SPECIFICITY_CLARITY'),
    'gate','DO_NOT_BUILD_PRODUCT_UNTIL_PROBLEM_IS_SELECTED_AND_EVIDENCE_SUPPORTED',
    'applies_to',jsonb_build_array('DIGITAL_PRODUCTS','WORKSHOPS','TEMPLATES','GUIDES','INTERACTIVE_TOOLS','SERVICE_PRODUCTIZATION')
  ),
  'OWNER_SHARED_DEMAND_FIRST_DIGITAL_PRODUCT_PATTERN_2026-10-06'
from public.divisions d
where d.is_active
on conflict(division_id,rule_key) do update
set rule_spec=excluded.rule_spec,source_basis=excluded.source_basis,updated_at=now();

insert into public.dd_division_operating_playbook(
  division_id,playbook_key,playbook_name,lifecycle_stage,required,specification,source_basis
)
select d.id,'GOVCON_FOUNDATION_AND_PURSUIT','Government contracting foundation and pursuit','ACTIVE',true,
  jsonb_build_object(
    'federal_registration_rule','Maintain active SAM.gov registration for prime federal awards; registration is free and must be renewed every 365 days.',
    'opportunity_sources',jsonb_build_array('SAM_GOV_CONTRACT_OPPORTUNITIES','AGENCY_FORECASTS','APEX_ACCELERATORS','STATE_AND_LOCAL_PORTALS'),
    'pursuit_loop',jsonb_build_array('VERIFY_BUYER_AND_SCOPE','CONFIRM_NAICS_PSC_AND_ELIGIBILITY','CHECK_REGISTRATION_AND_CERTIFICATION','PRICE_FROM_REAL_COSTS','BUILD_COMPLIANT_RESPONSE','SUBMIT','TRACK','PERFORM','EVIDENCE','RECOMPETE'),
    'service_examples',jsonb_build_array('JANITORIAL','FACILITIES_SUPPORT','ADMIN_SUPPORT','COURIER','FIELD_OPERATIONS','TRAINING'),
    'guardrails',jsonb_build_array(
      'NO_ASSUMPTION_AGENCY_MUST_BUY_FROM_DANI',
      'NO_BID_WITHOUT_CAPABILITY_AND_CAPACITY',
      'NO_INVENTED_CERTIFICATION',
      'NO_SOCIAL_MEDIA_ONLY_OPPORTUNITY_AUTHORITY'
    ),
    'assistance','Use APEX Accelerators as an official free government-contracting assistance resource.'
  ),
  'OFFICIAL_SAM_AND_SBA_VERIFIED_2026-10-06'
from public.divisions d
where d.slug='government-institutional-procurement'
on conflict(division_id,playbook_key) do update
set lifecycle_stage=excluded.lifecycle_stage,specification=excluded.specification,source_basis=excluded.source_basis,updated_at=now();

insert into public.dd_division_operating_playbook(
  division_id,playbook_key,playbook_name,lifecycle_stage,required,specification,source_basis
)
select d.id,'BUSINESS_FUNDING_READINESS','Business funding readiness','ACTIVE',true,
  jsonb_build_object(
    'foundation',jsonb_build_array('ENTITY_GOOD_STANDING','EIN','BUSINESS_BANKING','CLEAN_BOOKKEEPING','REVENUE_EVIDENCE','CREDIT_PROFILE_WHERE_RELEVANT','CURRENT_DEBT_AND_CASHFLOW','USE_OF_FUNDS'),
    'decision_rule','Evaluate funding products from current verified terms, underwriting fit, total cost, collateral/personal-guarantee requirements, and repayment capacity.',
    'prohibited',jsonb_build_array('APPLY_BASED_ONLY_ON_SOCIAL_POST','ASSUME_NEW_LLC_EQUALS_APPROVAL','STACK_EXPENSIVE_DEBT_WITHOUT_CASHFLOW_TEST'),
    'bank_relationship_rule','Bank relationships may support future financing, but no institution is treated as a guaranteed lender.'
  ),
  'OWNER_SHARED_FUNDING_CONTENT_WITH_VERIFICATION_GUARD_2026-10-06'
from public.divisions d
where d.slug in ('administrative-business-operations','business-development-growth')
on conflict(division_id,playbook_key) do update
set lifecycle_stage=excluded.lifecycle_stage,specification=excluded.specification,source_basis=excluded.source_basis,updated_at=now();

insert into public.dd_division_operating_playbook(
  division_id,playbook_key,playbook_name,lifecycle_stage,required,specification,source_basis
)
select d.id,'TAX_STRUCTURE_GUARD','Tax structure change guard','ACTIVE',true,
  jsonb_build_object(
    'rule','Do not elect S corporation status, create holding-company money flows, or change owner compensation based on social-media tax claims.',
    's_corp_fact','If an S corporation shareholder-employee performs services, reasonable compensation must generally be paid as wages before non-wage distributions.',
    'required_review',jsonb_build_array('ACCOUNTANT_OR_TAX_PROFESSIONAL_ANALYSIS','ENTITY_STRUCTURE','PAYROLL_COST','REASONABLE_COMPENSATION','STATE_AND_FEDERAL_TAX_EFFECT','ADMIN_COST','NET_SAVINGS'),
    'decision_gate','OWNER_APPROVAL_AFTER_ACCOUNTING_ANALYSIS'
  ),
  'IRS_REASONABLE_COMPENSATION_VERIFIED_2026-10-06'
from public.divisions d
where d.slug='administrative-business-operations'
on conflict(division_id,playbook_key) do update
set lifecycle_stage=excluded.lifecycle_stage,specification=excluded.specification,source_basis=excluded.source_basis,updated_at=now();

insert into public.dd_division_operating_playbook(
  division_id,playbook_key,playbook_name,lifecycle_stage,required,specification,source_basis
)
select d.id,'I9_AUTHORIZED_REPRESENTATIVE','Form I-9 authorized representative service boundary','BUILD',true,
  jsonb_build_object(
    'role','Employer-authorized representative, not a notarial act.',
    'notary_seal_required',false,
    'notarization_required',false,
    'employer_remains_responsible',true,
    'workflow',jsonb_build_array('EMPLOYER_AUTHORIZATION','APPOINTMENT','PHYSICAL_DOCUMENT_EXAMINATION_WHEN_REQUIRED_BY_EMPLOYER_PROCESS','COMPLETE_EMPLOYER_SECTION_AS_AUTHORIZED_REPRESENTATIVE','RETURN_EVIDENCE'),
    'marketing_rule','Do not market I-9 work as notarization or imply the notary commission is the legal authority for the I-9 task.'
  ),
  'USCIS_AUTHORIZED_REPRESENTATIVE_GUIDANCE_VERIFIED_2026-10-06'
from public.divisions d
where d.slug='notary-document-services'
on conflict(division_id,playbook_key) do update
set lifecycle_stage=excluded.lifecycle_stage,specification=excluded.specification,source_basis=excluded.source_basis,updated_at=now();

update public.dd_division_operating_playbook
set specification = specification || jsonb_build_object(
  'georgia_journal_rule','As of 2025, Georgia requires a written or electronic journal entry for each notarial act performed at the request of a self-filer.',
  'identity_rule','Confirm signer identity by personal knowledge or satisfactory evidence.',
  'upl_guard','Do not choose legal documents, interpret legal effect, or imply powers a Georgia notary does not possess.'
),
updated_at=now()
where playbook_key='GA_NOTARY_COMPLIANCE'
  and division_id=(select id from public.divisions where slug='notary-document-services');

select
  (select count(*) from public.dd_division_growth_rules where rule_key='LEARNING_TO_ARTIFACT') as learning_rules,
  (select count(*) from public.dd_division_growth_rules where rule_key='PROBLEM_FIRST_PRODUCT_VALIDATION') as product_validation_rules,
  (select count(*) from public.dd_division_operating_playbook where playbook_key='GOVCON_FOUNDATION_AND_PURSUIT') as govcon_rules,
  (select count(*) from public.dd_division_operating_playbook where playbook_key='I9_AUTHORIZED_REPRESENTATIVE') as i9_rules;
