
create table if not exists public.dd_digital_product_candidates (
  product_key text primary key,
  product_name text not null,
  target_audience text not null,
  problem_statement text not null,
  desired_result text not null,
  format text not null,
  price_hypothesis numeric,
  validation_score numeric,
  status text not null default 'VALIDATE',
  evidence jsonb not null default '{}'::jsonb,
  build_plan jsonb not null default '[]'::jsonb,
  distribution_plan jsonb not null default '[]'::jsonb,
  monetization_plan jsonb not null default '{}'::jsonb,
  guardrails jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.dd_digital_product_candidates enable row level security;

insert into public.dd_digital_product_candidates(
  product_key,product_name,target_audience,problem_statement,desired_result,format,
  price_hypothesis,validation_score,status,evidence,build_plan,distribution_plan,monetization_plan,guardrails
)
values
(
  'PM_TURNOVER_EVIDENCE_TOOLKIT',
  'Property Manager Turnover Evidence Toolkit',
  'Small and midsize property managers, independent landlords, field vendors and turnover coordinators',
  'Property teams lose time and visibility when unit turns are handed back without consistent arrival notes, photo indexing, exception logging and QA evidence.',
  'A repeatable evidence packet that makes one-property turn documentation easy to collect, review and hand off.',
  'Editable Canva/Google Docs template bundle plus checklist and photo-index workflow',
  27,
  95,
  'BUILD_NEXT',
  jsonb_build_object(
    'existing_asset','Turnover_Evidence_Photo_Index_Free_One_Property.pdf',
    'existing_buyer_signal','Matched CH02 buyers and live Make-Ready/Asset Verification services',
    'existing_service_skus',jsonb_build_array('DNI-02A-009','DNI-02A-003'),
    'why_now','Directly connected to current buyer conversations and can serve as lead magnet -> paid toolkit -> service upsell'
  ),
  jsonb_build_array(
    'AUDIT_FREE_SAMPLE',
    'EXPAND_TO_EDITABLE_MASTER_CHECKLIST',
    'BUILD_PHOTO_INDEX_TEMPLATE',
    'BUILD_EXCEPTION_LOG',
    'BUILD_QA_SIGNOFF',
    'BUILD_CLIENT_HANDOFF_COVER_SHEET',
    'BUILD_VENDOR_INSTRUCTIONS',
    'CREATE_README_AND_EXAMPLE',
    'OWNER_REVIEW',
    'PUBLISH_ONLY_AFTER_LICENSE_AND_ASSET_QA'
  ),
  jsonb_build_array(
    'FREE_ONE_PROPERTY_SAMPLE_TO_INTERESTED_BUYERS',
    'PAID_TOOLKIT_ON_DANI_SITE_OR_SHOPIFY',
    'FACILESS_SHORT_FORM_CONTENT_SHOWING_DOCUMENTATION_PROBLEMS',
    'PINTEREST_SEARCH_CONTENT',
    'EMAIL_FOLLOWUP_TO_PM_BUYERS',
    'CROSS_SELL_DANI_MANAGED_TURN_SERVICE'
  ),
  jsonb_build_object(
    'lead_magnet','FREE_ONE_PROPERTY_SAMPLE',
    'low_ticket_paid_product',27,
    'service_upsell','MAKE_READY_AND_ASSET_VERIFICATION',
    'pricing_status','HYPOTHESIS_NOT_PUBLISHED'
  ),
  jsonb_build_object(
    'no_fake_results',true,
    'no_claim_that_template_replaces_legal_or_property_management_policy',true,
    'no_publish_until_asset_rights_verified',true,
    'price_is_hypothesis_until_owner_approval',true
  )
),
(
  'NOTARY_APPOINTMENT_WORKFLOW_KIT',
  'Mobile Notary Appointment Workflow Kit',
  'New mobile notaries building a repeatable client process',
  'New notaries often know how to perform a notarial act but do not have a consistent inquiry, confirmation, payment, evidence and follow-up workflow.',
  'A clear repeatable operating workflow from inquiry to completion and review request.',
  'Editable checklist, inquiry script, confirmation template, completion checklist and follow-up templates',
  27,
  78,
  'VALIDATE',
  jsonb_build_object(
    'existing_capability','DANI notary/document workflow research and operating playbooks',
    'market_signal','Repeated social content around inquiry, booking and follow-up systems',
    'compliance_dependency','Georgia-specific legal review required before publishing'
  ),
  jsonb_build_array(
    'VERIFY_GEORGIA_NOTARY_BOUNDARIES',
    'BUILD_GENERIC_BUSINESS_WORKFLOW',
    'SEPARATE_NOTARIAL_FEE_FROM_MOBILE_SERVICE_FEE',
    'BUILD_NO_LEGAL_ADVICE_GUARDRAILS',
    'OWNER_REVIEW'
  ),
  jsonb_build_array(
    'DANI_SITE',
    'SOCIAL_CONTENT',
    'PINTEREST',
    'NOTARY_NETWORK_REFERRALS'
  ),
  jsonb_build_object('low_ticket_paid_product',27,'pricing_status','HYPOTHESIS_NOT_PUBLISHED'),
  jsonb_build_object('no_legal_advice',true,'state_specific_disclaimer_required',true,'no_income_claims',true)
),
(
  'SMALL_SERVICE_BUSINESS_FOLLOWUP_KIT',
  'Small Service Business Follow-Up & Booking Kit',
  'Solo and small local service businesses',
  'Many local service providers lose leads because inquiry response, confirmation and follow-up are inconsistent.',
  'A simple set of ready-to-customize messages and workflow steps that reduce response friction.',
  'Template bundle and mini playbook',
  19,
  72,
  'VALIDATE',
  jsonb_build_object(
    'existing_capability','DANI company-wide inquiry/booking/follow-up playbooks',
    'internal_use_first',true
  ),
  jsonb_build_array(
    'USE_IN_DANI_FIRST',
    'MEASURE_REPLY_AND_BOOKING_RESULTS',
    'REMOVE_DANI_SPECIFIC_DATA',
    'PACKAGE_REUSABLE_VERSION',
    'OWNER_REVIEW'
  ),
  jsonb_build_array('DANI_SITE','SOCIAL_CONTENT','PINTEREST','SERVICE_BUSINESS_COMMUNITIES'),
  jsonb_build_object('low_ticket_paid_product',19,'pricing_status','HYPOTHESIS_NOT_PUBLISHED'),
  jsonb_build_object('no_guaranteed_conversion_claims',true,'no_fake_testimonials',true)
)
on conflict(product_key) do update
set product_name=excluded.product_name,
    target_audience=excluded.target_audience,
    problem_statement=excluded.problem_statement,
    desired_result=excluded.desired_result,
    format=excluded.format,
    price_hypothesis=excluded.price_hypothesis,
    validation_score=excluded.validation_score,
    status=excluded.status,
    evidence=excluded.evidence,
    build_plan=excluded.build_plan,
    distribution_plan=excluded.distribution_plan,
    monetization_plan=excluded.monetization_plan,
    guardrails=excluded.guardrails,
    updated_at=now();

create or replace view public.dd_digital_product_build_queue_v1
with (security_invoker=true)
as
select *
from public.dd_digital_product_candidates
where status in ('BUILD_NEXT','VALIDATE')
order by
  case status when 'BUILD_NEXT' then 0 else 1 end,
  validation_score desc,
  updated_at desc;

create table if not exists public.dd_faceless_content_engine (
  engine_key text primary key,
  product_key text not null references public.dd_digital_product_candidates(product_key) on delete cascade,
  niche text not null,
  audience text not null,
  account_strategy text not null,
  content_pillars jsonb not null,
  launch_sequence jsonb not null,
  measurement jsonb not null,
  status text not null default 'DRAFT',
  guardrails jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);
alter table public.dd_faceless_content_engine enable row level security;

insert into public.dd_faceless_content_engine(
  engine_key,product_key,niche,audience,account_strategy,content_pillars,launch_sequence,measurement,status,guardrails
)
values(
  'PM_TURNOVER_EVIDENCE_FACELESS',
  'PM_TURNOVER_EVIDENCE_TOOLKIT',
  'property turnover documentation and make-ready operations',
  'property managers, landlords and field vendors',
  'Do not create a random faceless account. Build content under a DANI-owned branded or clearly related property-operations surface so traffic can convert to the toolkit and DANI services.',
  jsonb_build_array(
    'TURNOVER_DOCUMENTATION_MISTAKES',
    'BEFORE_AFTER_EVIDENCE_SYSTEMS',
    'QA_AND_EXCEPTION_LOGS',
    'MAKE_READY_WORKFLOW',
    'VENDOR_HANDOFF_AND_ACCOUNTABILITY'
  ),
  jsonb_build_array(
    'CREATE_10_CONTENT_ANGLES_FROM_REAL_BUYER_PROBLEMS',
    'BUILD_5_SHORT_REELS_AND_3_CAROUSELS',
    'OFFER_FREE_ONE_PROPERTY_SAMPLE',
    'TRACK_DMS_DOWNLOADS_AND_SERVICE_INQUIRIES',
    'PUBLISH_PAID_TOOLKIT_AFTER_VALIDATION',
    'RINSE_AND_REPEAT_WINNING_MECHANISMS_WITH_ORIGINAL_CONTENT'
  ),
  jsonb_build_object(
    'primary','QUALIFIED_LEADS_AND_SAMPLE_REQUESTS',
    'secondary',jsonb_build_array('TOOLKIT_SALES','SERVICE_INQUIRIES','SAVES','PROFILE_VISITS'),
    'do_not_optimize_for','VIEWS_WITHOUT_BUYER_ACTION'
  ),
  'BUILD',
  jsonb_build_object(
    'no_fake_viral_claims',true,
    'no_contact_sync_tricks_required',true,
    'no_copying_competitor_wording',true,
    'study_mechanisms_not_content',true,
    'no_separate_brand_unless_conversion_case_is_proven',true
  )
)
on conflict(engine_key) do update
set product_key=excluded.product_key,niche=excluded.niche,audience=excluded.audience,
    account_strategy=excluded.account_strategy,content_pillars=excluded.content_pillars,
    launch_sequence=excluded.launch_sequence,measurement=excluded.measurement,
    status=excluded.status,guardrails=excluded.guardrails,updated_at=now();

select
  (select count(*) from public.dd_digital_product_candidates) as product_candidates,
  (select product_key from public.dd_digital_product_build_queue_v1 limit 1) as next_product,
  (select status from public.dd_faceless_content_engine where engine_key='PM_TURNOVER_EVIDENCE_FACELESS') as content_engine_status;
