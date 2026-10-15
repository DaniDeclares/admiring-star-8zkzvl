
create table if not exists public.dd_adjacent_service_feasibility (
  service_key text primary key,
  service_name text not null,
  target_division_slug text not null,
  status text not null default 'RESEARCH_ONLY',
  buyer_examples jsonb not null default '[]'::jsonb,
  revenue_claims jsonb not null default '{}'::jsonb,
  verified_requirements jsonb not null default '{}'::jsonb,
  build_sequence jsonb not null default '[]'::jsonb,
  legal_quality_gates jsonb not null default '[]'::jsonb,
  prohibited_claims jsonb not null default '[]'::jsonb,
  source_basis text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.dd_adjacent_service_feasibility enable row level security;

insert into public.dd_adjacent_service_feasibility(
  service_key,service_name,target_division_slug,status,buyer_examples,revenue_claims,
  verified_requirements,build_sequence,legal_quality_gates,prohibited_claims,source_basis
)
values
(
  'FINGERPRINT_CARD_COLLECTION',
  'Fingerprint card collection / capture support',
  'notary-document-services',
  'RESEARCH_ONLY',
  jsonb_build_array('NURSING_SCHOOLS','HEALTHCARE_PROGRAMS','EMPLOYERS','LICENSING_APPLICANTS'),
  jsonb_build_object(
    'social_example','30 cards for nursing students shown as $1,650',
    'treatment','UNVERIFIED_MARKETING_EXAMPLE_NOT_PRODUCTION_PRICING'
  ),
  jsonb_build_object(
    'georgia_gaps','Georgia uses GAPS/IdentoGO for many employment and licensing fingerprint-based background checks.',
    'state_vendor','IDEMIA is Georgia contracted GAPS fingerprint vendor.',
    'hard_card_note','Some authorized processes may accept mailed ink fingerprint cards, but the receiving agency/process controls whether hard cards are acceptable.'
  ),
  jsonb_build_array(
    'IDENTIFY_SPECIFIC_BUYER_USE_CASE',
    'VERIFY_WHETHER_HARD_CARDS_OR_GAPS_REQUIRED',
    'VERIFY_EQUIPMENT_AND_TRAINING',
    'BUILD_IDENTITY_AND_CHAIN_OF_CUSTODY_WORKFLOW',
    'BUILD_PRICING_FROM_ACTUAL_SUPPLIES_TRAVEL_AND_PARTNER_FEES',
    'PILOT_WITH_AUTHORIZED_BUYER'
  ),
  jsonb_build_array(
    'DO_NOT_REPRESENT_DANI_AS_GAPS_OR_IDENTOGO_SITE_WITHOUT_CONTRACT',
    'VERIFY_EACH_AGENCY_FINGERPRINT_PROCESS',
    'SECURE_PII_HANDLING',
    'QUALITY_CONTROL_FOR_REJECTED_PRINTS'
  ),
  jsonb_build_array(
    'NO_CERTIFICATION_REQUIRED',
    'ALL_FINGERPRINT_CARDS_ACCEPTED',
    'GUARANTEED_BACKGROUND_CHECK_RESULT'
  ),
  'OWNER_SHARED_LAB_SERVICE_POST_PLUS_GBI_VERIFICATION_2026-10-06'
),
(
  'BACKGROUND_CHECK_COORDINATION',
  'Background check coordination for employers',
  'administrative-business-operations',
  'RESEARCH_ONLY',
  jsonb_build_array('DAYCARE_OPERATORS','HOME_CARE_AGENCIES','SMALL_EMPLOYERS','CONTRACTORS'),
  jsonb_build_object(
    'social_example','$79 background check offer',
    'treatment','UNVERIFIED_PRICE_CLAIM'
  ),
  jsonb_build_object(
    'georgia_rule','Georgia employment/licensing background-check businesses/agencies generally use GAPS and must obtain appropriate GAPS agency access for authorized checks.',
    'result_access','Authorized requesting agency retrieves results; DANI should not assume unrestricted access to criminal-history records.'
  ),
  jsonb_build_array(
    'DEFINE_AUTHORIZED_ROLE',
    'VERIFY_GAPS_AGENCY_REQUIREMENTS',
    'VERIFY_FCRA_AND_STATE_CONSUMER_REPORTING_OBLIGATIONS_IF_APPLICABLE',
    'PARTNER_WITH_COMPLIANT_PROVIDER_IF_DANI_IS_NOT_REPORTING_AGENCY',
    'BUILD_CONSENT_AND_DISPUTE_HANDLING',
    'PRICE_ONLY_AFTER_PROVIDER_AND_COMPLIANCE_COSTS'
  ),
  jsonb_build_array(
    'FCRA_REVIEW',
    'GEORGIA_GAPS_AUTHORIZATION',
    'PRIVACY_AND_DATA_RETENTION',
    'INSURANCE'
  ),
  jsonb_build_array(
    'NO_OFFICE_EXPERIENCE_OR_CERTIFICATION_REQUIRED',
    'DANI_CAN_PULL_ANYONE_CRIMINAL_HISTORY',
    'BACKGROUND_CHECK_EQUALS_FINGERPRINTING'
  ),
  'OWNER_SHARED_LAB_SERVICE_POST_PLUS_GBI_VERIFICATION_2026-10-06'
),
(
  'DOT_DRUG_TEST_COLLECTION',
  'DOT-regulated drug testing specimen collection',
  'notary-document-services',
  'RESEARCH_ONLY',
  jsonb_build_array('TRUCKING_COMPANIES','AVIATION_EMPLOYERS','TRANSIT_CONTRACTORS','SAFETY_SENSITIVE_EMPLOYERS'),
  jsonb_build_object(
    'social_example','Aviation and transportation compliance demand',
    'treatment','DEMAND_SIGNAL_ONLY_NOT_REVENUE_GUARANTEE'
  ),
  jsonb_build_object(
    'urine_collector_training','DOT urine collectors must complete Part 40 qualification training and monitored proficiency demonstrations before collecting.',
    'oral_fluid_training','DOT oral-fluid collectors require qualification training and five consecutive error-free mock collections for each device.',
    'refresher','DOT collector refresher training is required at least every five years, with error-correction training after certain collection errors.',
    'records','Collectors must retain documentation proving current qualification.'
  ),
  jsonb_build_array(
    'CHOOSE_DOT_COLLECTION_TYPE',
    'COMPLETE_DOT_QUALIFICATION_TRAINING',
    'COMPLETE_PROFICIENCY_DEMONSTRATION',
    'BUILD_SECURE_COLLECTION_SITE_OR_MOBILE_SITE_PROTOCOL',
    'PARTNER_WITH_HHS_CERTIFIED_LAB_AND_MRO_OR_CTPA',
    'BUILD_CHAIN_OF_CUSTODY_AND_CCF_WORKFLOW',
    'TARGET_VERIFIED_TRANSPORTATION_BUYERS'
  ),
  jsonb_build_array(
    '49_CFR_PART_40',
    'COLLECTION_SITE_SECURITY_AND_PRIVACY',
    'SPECIMEN_CHAIN_OF_CUSTODY',
    'QUALIFIED_LAB_MRO_CTPA_RELATIONSHIPS',
    'ERROR_CORRECTION_AND_TRAINING_RECORDS'
  ),
  jsonb_build_array(
    'NO_CERTIFICATION_REQUIRED',
    'CAN_START_COLLECTING_IMMEDIATELY',
    'AIRLINE_VENDOR_REGISTRATION_EQUALS_CONTRACT',
    'DANI_PERFORMS_LAB_ANALYSIS'
  ),
  'OWNER_SHARED_DOT_POST_PLUS_USDOT_PART40_VERIFICATION_2026-10-06'
),
(
  'I9_VERIFICATION_REMOTE_EMPLOYER',
  'Employer-authorized Form I-9 representative service',
  'notary-document-services',
  'BUILD',
  jsonb_build_array('REMOTE_EMPLOYERS','STAFFING_FIRMS','DISTRIBUTED_TEAMS'),
  jsonb_build_object(
    'social_example','Remote companies as buyer segment',
    'treatment','BUYER_TARGET_SIGNAL_ONLY'
  ),
  jsonb_build_object(
    'authority','Employer may designate an authorized representative; task is not a notarization.',
    'seal','No notary seal required simply because representative is a notary.'
  ),
  jsonb_build_array(
    'EMPLOYER_AUTHORIZATION',
    'STANDARD_INTAKE',
    'APPOINTMENT_AND_DOCUMENT_EXAMINATION',
    'COMPLETE_EMPLOYER_SECTION_AS_REPRESENTATIVE',
    'RETURN_COMPLETED_EVIDENCE',
    'FOLLOW_UP_FOR_REPEAT_HIRING'
  ),
  jsonb_build_array('NO_IMMIGRATION_LEGAL_ADVICE','EMPLOYER_PROCESS_CONTROLS','IDENTITY_DOCUMENT_HANDLING'),
  jsonb_build_array('I9_IS_A_NOTARIZATION','NOTARY_COMMISSION_REQUIRED_FOR_I9'),
  'OWNER_SHARED_LAB_SERVICE_POST_PLUS_EXISTING_USCIS_VERIFIED_PLAYBOOK_2026-10-06'
),
(
  'APOSTILLE_REMOTE_EMPLOYER_SUPPORT',
  'Apostille facilitation for distributed companies',
  'notary-document-services',
  'BUILD',
  jsonb_build_array('REMOTE_COMPANIES','HR_TEAMS','LEGAL_OPERATIONS','INTERNATIONAL_HIRING_TEAMS'),
  jsonb_build_object(
    'social_example','Remote companies as apostille buyer target',
    'treatment','BUYER_TARGET_SIGNAL_ONLY'
  ),
  jsonb_build_object(
    'rule','DANI may facilitate document authentication/apostille logistics while keeping notarial and government fees separately disclosed and avoiding legal advice.'
  ),
  jsonb_build_array(
    'DOCUMENT_COUNTRY_AND_ISSUER_INTAKE',
    'VERIFY_AUTHENTICATION_PATH',
    'QUOTE_GOVERNMENT_COURIER_AND_SERVICE_FEES_SEPARATELY',
    'CHAIN_OF_CUSTODY',
    'SUBMIT_OR_COURIER',
    'TRACK',
    'RETURN_WITH_EVIDENCE'
  ),
  jsonb_build_array('DOCUMENT_TYPE_AUTHORITY','DESTINATION_COUNTRY','STATE_OR_FEDERAL_PATH','CHAIN_OF_CUSTODY'),
  jsonb_build_array('GUARANTEED_FOREIGN_ACCEPTANCE','LEGAL_ADVICE','HIDDEN_GOVERNMENT_FEES'),
  'OWNER_SHARED_LAB_SERVICE_POST_PLUS_EXISTING_APOSTILLE_PLAYBOOK_2026-10-06'
)
on conflict(service_key) do update
set service_name=excluded.service_name,
    target_division_slug=excluded.target_division_slug,
    status=excluded.status,
    buyer_examples=excluded.buyer_examples,
    revenue_claims=excluded.revenue_claims,
    verified_requirements=excluded.verified_requirements,
    build_sequence=excluded.build_sequence,
    legal_quality_gates=excluded.legal_quality_gates,
    prohibited_claims=excluded.prohibited_claims,
    source_basis=excluded.source_basis,
    updated_at=now();

insert into public.dd_division_growth_rules(
  division_id,rule_key,rule_name,rule_spec,source_basis
)
select d.id,'LAB_SERVICE_BUYER_FIRST_MODEL','Lab/compliance service buyer-first model',
  jsonb_build_object(
    'rule','Do not open a generic lab-service menu and wait for customers. Build one compliant service around one buyer class, then target organizations already generating that recurring need.',
    'target_examples',jsonb_build_array(
      'NURSING_AND_HEALTHCARE_SCHOOLS',
      'DAYCARE_AND_HOME_CARE_EMPLOYERS',
      'TRUCKING_AND_TRANSPORTATION_EMPLOYERS',
      'REMOTE_EMPLOYERS',
      'NONPROFITS_SERVING_FAMILIES'
    ),
    'sequence',jsonb_build_array(
      'VERIFY_SERVICE_AUTHORITY',
      'BUILD_PARTNER_AND_COMPLIANCE_STACK',
      'DEFINE_ONE_BUYER_AND_ONE_USE_CASE',
      'CREATE_CLEAR_OFFER',
      'BUILD_20_ACCOUNT_TARGET_LIST',
      'DIRECT_OUTREACH',
      'PILOT',
      'EVIDENCE_QA',
      'REPEAT_OR_EXPAND'
    ),
    'pricing_rule','Use social-media prices only as research signals; production pricing must come from verified costs, legal fee rules, margin targets and buyer scope.'
  ),
  'OWNER_SHARED_LAB_SERVICE_MARKETING_PATTERN_2026-10-06'
from public.divisions d
where d.slug in ('notary-document-services','administrative-business-operations','business-development-growth')
on conflict(division_id,rule_key) do update
set rule_spec=excluded.rule_spec,source_basis=excluded.source_basis,updated_at=now();

create table if not exists public.dd_owner_income_fallback_options (
  option_key text primary key,
  option_name text not null,
  status text not null default 'RESEARCH_ONLY',
  platform_examples jsonb not null default '[]'::jsonb,
  fit_notes text,
  priority text not null default 'LOW',
  guardrails jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.dd_owner_income_fallback_options enable row level security;

insert into public.dd_owner_income_fallback_options(option_key,option_name,status,platform_examples,fit_notes,priority,guardrails)
values
('TRANSCRIPTION','Transcription gigs','RESEARCH_ONLY',jsonb_build_array('TranscribeMe','GoTranscript'),'Supplemental personal-income fallback only; not core Operation $1M business line.','LOW',jsonb_build_object('verify_current_pay_and_acceptance_terms',true)),
('WEBSITE_TESTING','Website usability testing','RESEARCH_ONLY',jsonb_build_array('UserTesting','Userlytics'),'Supplemental personal-income fallback only.','LOW',jsonb_build_object('verify_current_availability_and_pay',true)),
('FREELANCE_WRITING','Freelance writing','RESEARCH_ONLY',jsonb_build_array('ProBlogger','Listverse'),'Potentially overlaps DANI content capability, but treat marketplace work separately from client services.','LOW',jsonb_build_object('no_unverified_income_claims',true)),
('MYSTERY_SHOPPING','Mystery shopping','RESEARCH_ONLY',jsonb_build_array('BestMark','Field Agent'),'Supplemental income fallback; verify legitimacy and reimbursement terms before accepting.','LOW',jsonb_build_object('never_pay_to_access_job',true)),
('FOCUS_GROUPS','Research studies and focus groups','RESEARCH_ONLY',jsonb_build_array('Respondent','UserInterviews'),'Supplemental personal-income fallback only.','LOW',jsonb_build_object('verify_privacy_and_compensation',true))
on conflict(option_key) do update
set option_name=excluded.option_name,status=excluded.status,platform_examples=excluded.platform_examples,
    fit_notes=excluded.fit_notes,priority=excluded.priority,guardrails=excluded.guardrails,updated_at=now();

select
  (select count(*) from public.dd_adjacent_service_feasibility) as adjacent_service_rows,
  (select count(*) from public.dd_owner_income_fallback_options) as personal_fallback_rows,
  (select count(*) from public.dd_division_growth_rules where rule_key='LAB_SERVICE_BUYER_FIRST_MODEL') as buyer_first_lab_rules;
