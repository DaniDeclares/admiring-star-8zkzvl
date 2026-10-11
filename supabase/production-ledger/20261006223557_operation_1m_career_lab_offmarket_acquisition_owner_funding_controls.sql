
create table if not exists public.dd_owner_career_skill_labs (
  lab_key text primary key,
  lab_name text not null,
  career_target text not null,
  status text not null default 'BUILD',
  source_authority text,
  build_steps jsonb not null default '[]'::jsonb,
  resume_evidence_required jsonb not null default '[]'::jsonb,
  guardrails jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);
alter table public.dd_owner_career_skill_labs enable row level security;

insert into public.dd_owner_career_skill_labs(
  lab_key,lab_name,career_target,status,source_authority,build_steps,resume_evidence_required,guardrails
)
values
(
  'ACTIVE_DIRECTORY_HOME_LAB',
  'Active Directory Domain Services home lab',
  'CYBERSECURITY_AND_WINDOWS_ADMIN',
  'BUILD',
  'MICROSOFT_LEARN_AD_DS',
  jsonb_build_array(
    'INSTALL_WINDOWS_SERVER_IN_VM_OR_CLOUD_LAB',
    'INSTALL_AD_DS_ROLE',
    'CREATE_NEW_FOREST_AND_DOMAIN',
    'CREATE_OUS_USERS_GROUPS_AND_COMPUTERS',
    'JOIN_CLIENT_VM_TO_DOMAIN',
    'CREATE_AND_TEST_GROUP_POLICY',
    'CONFIGURE_PASSWORD_AND_ACCOUNT_POLICIES',
    'PRACTICE_DNS_AND_BASIC_DOMAIN_ADMINISTRATION',
    'DOCUMENT_TROUBLESHOOTING_AND_SECURITY_CONTROLS',
    'CAPTURE_SCREENSHOTS_AND_CHANGE_LOG'
  ),
  jsonb_build_array(
    'ARCHITECTURE_DIAGRAM',
    'LAB_OBJECTIVES',
    'TASKS_COMPLETED',
    'SECURITY_CONTROLS_CONFIGURED',
    'TROUBLESHOOTING_EXAMPLES',
    'SCREENSHOTS_OR_REPO_DOCS',
    'WHAT_WAS_LEARNED'
  ),
  jsonb_build_object(
    'resume_rule','List as a hands-on lab/project, not as paid production experience.',
    'claim_rule','Only claim tasks actually completed and documented.',
    'preferred_source','Microsoft Learn guided AD DS project and Windows Server AD DS documentation.'
  )
)
on conflict(lab_key) do update
set lab_name=excluded.lab_name,
    career_target=excluded.career_target,
    status=excluded.status,
    source_authority=excluded.source_authority,
    build_steps=excluded.build_steps,
    resume_evidence_required=excluded.resume_evidence_required,
    guardrails=excluded.guardrails,
    updated_at=now();

create table if not exists public.dd_property_acquisition_strategies (
  strategy_key text primary key,
  strategy_name text not null,
  status text not null,
  geography text,
  strategy_type text not null,
  workflow jsonb not null default '[]'::jsonb,
  legal_ethics_gates jsonb not null default '[]'::jsonb,
  underwriting_gates jsonb not null default '[]'::jsonb,
  prohibited_assumptions jsonb not null default '[]'::jsonb,
  source_basis text,
  updated_at timestamptz not null default now()
);
alter table public.dd_property_acquisition_strategies enable row level security;

insert into public.dd_property_acquisition_strategies(
  strategy_key,strategy_name,status,geography,strategy_type,workflow,legal_ethics_gates,underwriting_gates,prohibited_assumptions,source_basis
)
values
(
  'GA_OFF_MARKET_TAX_DELINQUENT',
  'Georgia off-market tax-delinquent property acquisition research',
  'RESEARCH_ACTIVE',
  'GEORGIA',
  'OFF_MARKET_OWNER_DIRECT',
  jsonb_build_array(
    'SELECT_TARGET_COUNTY',
    'USE_OFFICIAL_COUNTY_TAX_COMMISSIONER_OR_PROPERTY_RECORD_SOURCE',
    'IDENTIFY_PROPERTIES_WITH_DELINQUENT_TAX_STATUS_WHERE_LAWFULLY_AVAILABLE',
    'VERIFY_CURRENT_OWNER_AND_MAILING_ADDRESS_FROM_OFFICIAL_RECORDS',
    'SCREEN_TITLE_LIENS_TAX_SALE_STATUS_OCCUPANCY_ZONING_AND_CONDITION',
    'ESTIMATE_REPAIR_AND_CARRYING_COSTS',
    'CONTACT_OWNER_LAWFULLY_AND_RESPECT_OPT_OUTS',
    'NEGOTIATE_FROM_INDEPENDENT_VALUE_AND_TOTAL_PROJECT_COST',
    'USE_ATTORNEY_TITLE_CLOSING_AND_WRITTEN_PURCHASE_CONTRACT'
  ),
  jsonb_build_array(
    'NO_HARASSMENT_OR_REPEATED_CONTACT_AFTER_OPT_OUT',
    'NO_DECEPTIVE_IDENTITY_OR_PRESSURE_TACTICS',
    'NO_PRIVATE_DATA_SCRAPING_AS_PRIMARY_AUTHORITY',
    'FOLLOW_TELEMARKETING_AND_CONTACT_RULES',
    'USE_PUBLIC_RECORDS_LAWFULLY',
    'VERIFY_OCCUPANCY_AND_TENANT_RIGHTS'
  ),
  jsonb_build_array(
    'TITLE_AND_LIENS',
    'BACK_TAXES_AND_REDEMPTION_RIGHTS',
    'TAX_SALE_STATUS',
    'MARKET_VALUE',
    'REPAIR_COST',
    'UTILITIES',
    'INSURANCE',
    'ZONING_AND_LAND_USE',
    'FLOOD_AND_ENVIRONMENTAL',
    'FINANCING_OR_CASH_SOURCE',
    'EXIT_OR_OWNER_OCCUPANCY_PLAN'
  ),
  jsonb_build_array(
    'TWO_TO_FOUR_YEARS_DELINQUENT_IS_ALWAYS_SWEET_SPOT',
    'HALF_OF_TAX_VALUE_IS_ALWAYS_FAIR',
    'COUNTY_MUST_EMAIL_A_READY_MADE_DELINQUENT_ROLL',
    'SKIP_TRACE_DATA_IS_ALWAYS_CURRENT',
    'OFF_MARKET_MEANS_CLEAR_TITLE',
    'REALTOR_ALWAYS_MEANS_OVERPAYING'
  ),
  'OWNER_SHARED_OFF_MARKET_POST_PLUS_GEORGIA_OFFICIAL_PROPERTY_RECORDS_2026-10-06'
)
on conflict(strategy_key) do update
set strategy_name=excluded.strategy_name,status=excluded.status,geography=excluded.geography,
    strategy_type=excluded.strategy_type,workflow=excluded.workflow,
    legal_ethics_gates=excluded.legal_ethics_gates,underwriting_gates=excluded.underwriting_gates,
    prohibited_assumptions=excluded.prohibited_assumptions,source_basis=excluded.source_basis,updated_at=now();

create table if not exists public.dd_owner_funding_transaction_controls (
  control_key text primary key,
  control_name text not null,
  status text not null default 'ACTIVE',
  accounting_rule text not null,
  required_evidence jsonb not null default '[]'::jsonb,
  prohibited_treatment jsonb not null default '[]'::jsonb,
  source_authority text,
  updated_at timestamptz not null default now()
);
alter table public.dd_owner_funding_transaction_controls enable row level security;

insert into public.dd_owner_funding_transaction_controls(
  control_key,control_name,status,accounting_rule,required_evidence,prohibited_treatment,source_authority
)
values
(
  'OWNER_TO_LLC_CAPITAL',
  'Owner capital contribution documentation',
  'ACTIVE',
  'Classify owner-funded business cash according to the LLC federal tax classification and accountant-approved books; do not automatically record owner funding as business revenue.',
  jsonb_build_array('TRANSFER_DATE','AMOUNT','SOURCE_ACCOUNT','DESTINATION_ACCOUNT','PURPOSE','BOOKKEEPING_CLASSIFICATION','OWNER_EQUITY_LEDGER'),
  jsonb_build_array('RECORD_AS_CUSTOMER_REVENUE','ASSUME_GENERIC_CONTRACT_REQUIRED_FOR_TAX_RESULT'),
  'IRS_LLC_CLASSIFICATION_AND_ACCOUNTING_AUTHORITY'
),
(
  'OWNER_TO_LLC_LOAN',
  'Owner loan to business documentation',
  'ACTIVE',
  'Use an owner-loan treatment only when there is a genuine debt arrangement supported by accountant-approved terms and records; distinguish debt from equity based on facts and tax classification.',
  jsonb_build_array('PRINCIPAL','DATE','BUSINESS_PURPOSE','REPAYMENT_TERMS','INTEREST_TREATMENT_IF_APPLICABLE','BOOKKEEPING_CLASSIFICATION','PAYMENTS'),
  jsonb_build_array('LABEL_EVERY_POST_FORMATION_TRANSFER_A_LOAN','CREATE_SHAM_DEBT_TO_CHANGE_TAX_RESULT'),
  'IRS_LLC_CLASSIFICATION_AND_ACCOUNTING_AUTHORITY'
)
on conflict(control_key) do update
set control_name=excluded.control_name,status=excluded.status,accounting_rule=excluded.accounting_rule,
    required_evidence=excluded.required_evidence,prohibited_treatment=excluded.prohibited_treatment,
    source_authority=excluded.source_authority,updated_at=now();

create table if not exists public.dd_owner_career_path_triage (
  path_key text primary key,
  path_name text not null,
  domain text not null,
  status text not null,
  estimated_training_band text,
  entry_barrier text,
  strategic_fit text,
  priority text not null,
  validation_steps jsonb not null default '[]'::jsonb,
  notes text,
  updated_at timestamptz not null default now()
);
alter table public.dd_owner_career_path_triage enable row level security;

insert into public.dd_owner_career_path_triage(
  path_key,path_name,domain,status,estimated_training_band,entry_barrier,strategic_fit,priority,validation_steps,notes
)
values
('MEDICAL_CODING','Medical coder','HEALTHCARE_ADMIN','RESEARCH_ONLY','MONTHS','CERTIFICATION_AND_DOMAIN_KNOWLEDGE','MEDIUM','P3',jsonb_build_array('VERIFY_CURRENT_CERT_REQUIREMENTS','VERIFY_REAL_REMOTE_OPENINGS','COMPARE_TRAINING_COST_TIME_PAY'),'Could be a personal income path, not a DANI service line.'),
('MEDICAL_BILLING','Medical billing','HEALTHCARE_ADMIN','RESEARCH_ONLY','MONTHS','TRAINING_AND_REVENUE_CYCLE_KNOWLEDGE','MEDIUM','P3',jsonb_build_array('VERIFY_EMPLOYER_REQUIREMENTS','VERIFY_REMOTE_OPENINGS','COMPARE_PAY_AND_TRAINING'),'Personal employment fallback.'),
('INSURANCE_VERIFICATION','Insurance verification specialist','HEALTHCARE_ADMIN','RESEARCH_ONLY','WEEKS_TO_MONTHS','HEALTHCARE_WORKFLOW_KNOWLEDGE','MEDIUM','P3',jsonb_build_array('VERIFY_REAL_JOB_POSTINGS','SKILLS_GAP','TRAINING_COST'),'Personal employment fallback.'),
('PRIOR_AUTH','Prior authorization specialist','HEALTHCARE_ADMIN','RESEARCH_ONLY','MONTHS','PAYER_WORKFLOW_KNOWLEDGE','MEDIUM','P3',jsonb_build_array('VERIFY_REAL_JOB_POSTINGS','SKILLS_GAP','TRAINING_COST'),'Personal employment fallback.'),
('MEDICAL_SCHEDULER','Medical scheduler','HEALTHCARE_ADMIN','RESEARCH_ONLY','WEEKS_TO_MONTHS','CUSTOMER_SERVICE_AND_HEALTHCARE_WORKFLOW','MEDIUM','P3',jsonb_build_array('VERIFY_REMOTE_OR_LOCAL_OPENINGS','COMPARE_SCHEDULE_AND_PAY'),'Potentially faster-entry personal employment fallback.'),
('PATIENT_COORDINATOR','Patient care coordinator','HEALTHCARE_ADMIN','RESEARCH_ONLY','MONTHS','EMPLOYER_SPECIFIC','MEDIUM','P3',jsonb_build_array('VERIFY_OPENINGS','COMPARE_REQUIRED_EXPERIENCE'),'Personal employment fallback.'),
('HEALTHCARE_DATA_ANALYST','Healthcare data analyst','DATA_AND_HEALTHCARE','LONGER_BUILD','MONTHS_TO_YEAR','DATA_SKILLS_AND_DOMAIN_KNOWLEDGE','MEDIUM_TO_HIGH','P4',jsonb_build_array('BUILD_SQL_EXCEL_BI_PORTFOLIO','VERIFY_OPENINGS','COMPARE_WITH_CURRENT_PM_AND_TECH_SKILLS'),'Longer-term path; do not distract from immediate housing/revenue needs.')
on conflict(path_key) do update
set path_name=excluded.path_name,domain=excluded.domain,status=excluded.status,
    estimated_training_band=excluded.estimated_training_band,entry_barrier=excluded.entry_barrier,
    strategic_fit=excluded.strategic_fit,priority=excluded.priority,
    validation_steps=excluded.validation_steps,notes=excluded.notes,updated_at=now();

insert into public.dd_division_operating_playbook(
  division_id,playbook_key,playbook_name,lifecycle_stage,required,specification,source_basis
)
select d.id,'FUNDING_MARKETING_CLAIM_GUARD','Funding and grant marketing claim guard','ACTIVE',true,
  jsonb_build_object(
    'verified_facts',jsonb_build_array(
      'SBA_DOES_NOT_PROVIDE_GENERAL_GRANTS_TO_START_OR_EXPAND_A_BUSINESS',
      'SBA_HAS_LIMITED_GRANT_PROGRAMS_FOR_SPECIFIC_PURPOSES_SUCH_AS_RND_EXPORT_AND_PARTNER_PROGRAMS',
      'PRIVATE_AND_LOCAL_GRANTS_EXIST_BUT_REQUIRE_OPPORTUNITY_SPECIFIC_ELIGIBILITY'
    ),
    'rules',jsonb_build_array(
      'VERIFY_GRANT_AT_PRIMARY_SOURCE',
      'VERIFY_APPLICATION_FEE_OR_VENDOR_CLAIMS',
      'DO_NOT_PAY_FOR_PROMISED_SBA_GRANT_ACCESS',
      'DO_NOT_TREAT_COACH_REVENUE_CLAIMS_AS_ELIGIBILITY_EVIDENCE',
      'BUILD_APPLICATION_FROM_OFFICIAL_NOTICE'
    ),
    'scam_signals',jsonb_build_array(
      'GUARANTEED_FREE_MONEY',
      'SBA_GRANT_FOR_GENERAL_STARTUP_WITH_QUICK_APPROVAL',
      'UPFRONT_PAYMENT_TO_UNLOCK_GOVERNMENT_GRANT',
      'NO_DOCUMENTATION_REQUIRED'
    )
  ),
  'SBA_OFFICIAL_GRANT_GUIDANCE_VERIFIED_2026-10-06'
from public.divisions d
where d.slug in ('business-development-growth','administrative-business-operations','government-institutional-procurement')
on conflict(division_id,playbook_key) do update
set lifecycle_stage=excluded.lifecycle_stage,specification=excluded.specification,source_basis=excluded.source_basis,updated_at=now();

select
  (select count(*) from public.dd_owner_career_skill_labs) as career_labs,
  (select count(*) from public.dd_property_acquisition_strategies) as acquisition_strategies,
  (select count(*) from public.dd_owner_funding_transaction_controls) as owner_funding_controls,
  (select count(*) from public.dd_owner_career_path_triage) as career_paths;
