
create table if not exists public.dd_division_growth_rules (
  division_id bigint not null references public.divisions(id) on delete cascade,
  rule_key text not null,
  rule_name text not null,
  rule_status text not null default 'ACTIVE',
  rule_spec jsonb not null,
  source_basis text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key(division_id,rule_key)
);
alter table public.dd_division_growth_rules enable row level security;

insert into public.dd_division_growth_rules(
  division_id,rule_key,rule_name,rule_spec,source_basis
)
select d.id,'BUYER_FIRST_MARKETING','Market to actual buyers, not peers',
  jsonb_build_object(
    'pattern',jsonb_build_array(
      'PICK_ONE_SERVICE_OR_FRONT_DOOR',
      'IDENTIFY_20_LOCAL_BUYERS_WHO_REGULARLY_NEED_IT',
      'STATE_ONE_CLEAR_PROBLEM_SOLVED',
      'INTRODUCE_WITH_BUYER_LANGUAGE',
      'FOLLOW_UP',
      'CONVERT_REPLY_TO_SCOPE_OR_QUOTE'
    ),
    'prohibited',jsonb_build_array(
      'GENERIC_KEEP_ME_IN_MIND_OUTREACH',
      'PEER_ONLY_MARKETING',
      'INVENTED_BUYER_INTENT',
      'MASS_OUTREACH_WITHOUT_ROUTE_OR_CONTEXT'
    ),
    'success_metric','BUYER_ADVANCES_TO_DISCOVERY_QUOTE_PAYMENT_OR_JOB'
  ),
  'OWNER_SHARED_GROWTH_PATTERN_2026-10-06'
from public.divisions d where d.is_active
on conflict(division_id,rule_key) do update
set rule_spec=excluded.rule_spec,source_basis=excluded.source_basis,updated_at=now();

insert into public.dd_division_growth_rules(
  division_id,rule_key,rule_name,rule_spec,source_basis
)
select d.id,'AVAILABILITY_AS_OFFER','Sell convenient availability',
  jsonb_build_object(
    'supported_positions',jsonb_build_array('EARLY_MORNING','EVENING','WEEKEND','SCHEDULED','RUSH_WHEN_OPERATIONALLY_AVAILABLE'),
    'rule','Only advertise windows that current owner/provider capacity can fulfill.',
    'goal','Turn convenience and responsiveness into a buyer-facing advantage.'
  ),
  'OWNER_SHARED_GROWTH_PATTERN_2026-10-06'
from public.divisions d where d.is_active
on conflict(division_id,rule_key) do update
set rule_spec=excluded.rule_spec,source_basis=excluded.source_basis,updated_at=now();

insert into public.dd_division_growth_rules(
  division_id,rule_key,rule_name,rule_spec,source_basis
)
select d.id,'CREDENTIAL_VISIBILITY','Show trust credentials where buyers decide',
  jsonb_build_object(
    'surfaces',jsonb_build_array('SERVICE_PAGE','QUOTE_OR_CONFIRMATION','GOOGLE_BUSINESS_PROFILE','SOCIAL_PROOF','PROVIDER_PROFILE_WHEN_RELEVANT'),
    'rule','Display only current, verified licenses, commissions, certifications, insurance or compliance evidence.',
    'goal','Reduce buyer uncertainty and increase conversion.'
  ),
  'OWNER_SHARED_GROWTH_PATTERN_2026-10-06'
from public.divisions d where d.is_active
on conflict(division_id,rule_key) do update
set rule_spec=excluded.rule_spec,source_basis=excluded.source_basis,updated_at=now();

insert into public.dd_division_growth_rules(
  division_id,rule_key,rule_name,rule_spec,source_basis
)
select d.id,'FAST_RESPONSE_AUTOMATION','Automate first response without inventing answers',
  jsonb_build_object(
    'automation',jsonb_build_array('ACKNOWLEDGE_INQUIRY','ASK_SCOPE_QUESTIONS','CONFIRM_RECEIPT','ROUTE_TO_CORRECT_DIVISION','SURFACE_BOOKING_OR_QUOTE_NEXT_STEP'),
    'guardrails',jsonb_build_array('NO_INVENTED_PRICE','NO_FALSE_AVAILABILITY','NO_LEGAL_ADVICE','NO_UNVERIFIED_CREDENTIALS'),
    'goal','Shorten inquiry-to-qualified-opportunity time.'
  ),
  'OWNER_SHARED_GROWTH_PATTERN_2026-10-06'
from public.divisions d where d.is_active
on conflict(division_id,rule_key) do update
set rule_spec=excluded.rule_spec,source_basis=excluded.source_basis,updated_at=now();

insert into public.dd_division_growth_rules(
  division_id,rule_key,rule_name,rule_spec,source_basis
)
select d.id,'START_SMALL_PROVE_EXPAND','Use small jobs to earn proof and repeat work',
  jsonb_build_object(
    'loop',jsonb_build_array('SMALL_INITIAL_JOB','CAPTURE_EVIDENCE','QA','REVIEW_OR_REFERRAL','REPEAT_OR_CROSS_SELL','PARTNER_EXPANSION'),
    'rule','Friends/family/local-business work may seed proof only when real, properly priced, and documented; never manufacture testimonials.',
    'goal','Turn small legitimate work into reusable market proof.'
  ),
  'OWNER_SHARED_GROWTH_PATTERN_2026-10-06'
from public.divisions d where d.is_active
on conflict(division_id,rule_key) do update
set rule_spec=excluded.rule_spec,source_basis=excluded.source_basis,updated_at=now();

insert into public.dd_division_operating_playbook(
  division_id,playbook_key,playbook_name,lifecycle_stage,required,specification,source_basis
)
select d.id,'GA_NOTARY_COMPLIANCE','Georgia notary compliance authority','ACTIVE',true,
  jsonb_build_object(
    'commission_term_years',4,
    'commission_fee_range',jsonb_build_array(40,55),
    'commission_fee_note','Exact appointment/reappointment fee is county-specific.',
    'training_requirement','Mandatory notary education applies to initial appointment and within 30 days prior to renewal.',
    'authorized_notarial_act_fee',2.00,
    'additional_clerk_certificate_fee_if_requested',2.00,
    'fee_disclosure_rule','Tell requester before the act if a notarial fee will be charged and the permitted amount.',
    'apostille_state_fee_per_document',3.00,
    'apostille_rule','Treat facilitation/service fees separately from state apostille and notarial-act fees; disclose them clearly.',
    'online_notary_rule','Do not advertise Georgia RON as an owner capability unless current Georgia law and the specific transaction permit it and DANI has verified authority/process.',
    'source_authority',jsonb_build_array('GSCCCA_NOTARY_LAW','GSCCCA_NOTARY_APPLICATION','GSCCCA_APOSTILLE_INFORMATION')
  ),
  'OFFICIAL_GEORGIA_AUTHORITY_VERIFIED_2026-10-06'
from public.divisions d where d.slug='notary-document-services'
on conflict(division_id,playbook_key) do update
set lifecycle_stage=excluded.lifecycle_stage,
    specification=excluded.specification,
    source_basis=excluded.source_basis,
    updated_at=now();

update public.dd_company_priority_obligations
set amount_due=case when obligation_key='GA_NOTARY_COMMISSION' then null else amount_due end,
    notes=case
      when obligation_key='GA_NOTARY_COMMISSION'
        then 'Official GSCCCA current range is $40-$55 for appointment/reappointment; exact county-specific amount still must be verified before payment.'
      else notes
    end,
    metadata=case
      when obligation_key='GA_NOTARY_COMMISSION'
        then metadata || jsonb_build_object(
          'verified_fee_range',jsonb_build_array(40,55),
          'verified_training_requirement',true,
          'official_source','GSCCCA',
          'verified_on','2026-10-06'
        )
      else metadata
    end,
    updated_at=now()
where obligation_key='GA_NOTARY_COMMISSION';

insert into public.dd_owner_attention_queue(
  domain,source_table,source_record_id,reason,priority,status,recommended_action,metadata
)
select
  'HOUSING_STABILITY',
  'USDA_502_DIRECT',
  'USDA502_GA_NEW_CONSTRUCTION_PATH_20261006',
  'Georgia Section 502 Direct permits eligible borrowers to build a new home and to purchase/prepare a site. Keep a new-construction path available alongside existing-home search.',
  'P1','OPEN',
  'After repayment amount is known, compare existing-home candidates against buildable-site plus USDA-compliant new-construction scenarios. Do not let construction complexity displace the Dec. 18 fallback housing path.',
  jsonb_build_object(
    'state_priority','GEORGIA_FIRST',
    'program','SECTION_502_DIRECT',
    'uses',jsonb_build_array('BUILD_HOME','PURCHASE_AND_PREPARE_SITE','WATER_AND_SEWAGE'),
    'gates',jsonb_build_array('INCOME_ELIGIBILITY','AREA_ELIGIBILITY','MAX_LOAN_AMOUNT','CONSTRUCTION_STANDARDS','BUILDER_REQUIREMENTS','APPRAISAL','TIMELINE'),
    'hard_deadline','2026-12-18',
    'owner_needed_now',false
  )
where not exists(
  select 1 from public.dd_owner_attention_queue
  where source_record_id='USDA502_GA_NEW_CONSTRUCTION_PATH_20261006'
    and status='OPEN'
);

select
  (select count(*) from public.dd_division_growth_rules where rule_status='ACTIVE') as active_growth_rules,
  (select count(*) from public.dd_division_operating_playbook where playbook_key='GA_NOTARY_COMPLIANCE') as notary_compliance_rows,
  (select count(*) from public.dd_owner_attention_queue where source_record_id='USDA502_GA_NEW_CONSTRUCTION_PATH_20261006' and status='OPEN') as usda_build_path_rows;
