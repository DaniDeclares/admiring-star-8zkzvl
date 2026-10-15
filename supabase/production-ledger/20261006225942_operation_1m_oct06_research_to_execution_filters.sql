
create table if not exists public.dd_research_to_execution_filters (
  item_key text primary key,
  item_name text not null,
  lane text not null,
  status text not null,
  verified_fact text,
  revenue_or_goal_link text,
  next_action jsonb not null default '[]'::jsonb,
  guardrails jsonb not null default '{}'::jsonb,
  source_basis text,
  updated_at timestamptz not null default now()
);
alter table public.dd_research_to_execution_filters enable row level security;

insert into public.dd_research_to_execution_filters(
  item_key,item_name,lane,status,verified_fact,revenue_or_goal_link,next_action,guardrails,source_basis
)
values
(
  'DOD_CYBER_TRAINING_JUL17',
  'Social post: free U.S. DoD cybersecurity training, July 17 deadline',
  'OWNER_CAREER',
  'ARCHIVE_STALE_UNVERIFIED',
  'The image provides no program name or year and the stated July 17 deadline is already past as of Oct. 6, 2026.',
  'None until a current official DoD program is identified.',
  jsonb_build_array('NO_ACTION','SEARCH_ONLY_IF_CURRENT_OFFICIAL_PROGRAM_SURFACES'),
  jsonb_build_object('do_not_click_social_deadline_claim',true,'do_not_treat_as_current',true),
  'OWNER_SHARED_IMAGE_2026-10-06'
),
(
  'GA_SOBER_LIVING_MODEL',
  'Georgia sober-living / recovery residence operating model',
  'SHADOW_SOL_OR_FUTURE_SEPARATE_PROGRAM',
  'HOLD_REGULATORY_AND_MODEL_VALIDATION',
  'Georgia DBHDD oversees several behavioral-health residential facility license types; a generic sober-living post is not enough to establish the applicable license, zoning, referral, payer or lease structure.',
  'Potential future community-housing partnership or separate compliant operation; not an immediate DANI revenue lane.',
  jsonb_build_array(
    'DEFINE_RESIDENT_POPULATION_AND_SERVICES',
    'IDENTIFY_APPLICABLE_GA_LICENSE_OR_CERTIFICATION',
    'VERIFY_LOCAL_ZONING_AND_OCCUPANCY',
    'VERIFY_LEASE_AND_INSURANCE_ALLOWANCE',
    'MAP_CONTINUUM_OF_CARE_AND_PROVIDER_REFERRAL_DEMAND',
    'VERIFY_PAYER_OR_CONTRACT_RATE_SOURCE',
    'BUILD_RESIDENT_RIGHTS_AND_PRIVACY_CONTROLS',
    'MODEL_UNIT_ECONOMICS_BEFORE_PROPERTY_COMMITMENT'
  ),
  jsonb_build_object(
    'do_not_assume_600_1200_per_bed',true,
    'do_not_sign_2_3_year_lease_before_regulatory_clearance',true,
    'do_not_market_clinical_treatment_without_authority',true,
    'separate_nonprofit_and_for_profit_funds',true
  ),
  'DBHDD_OFFICIAL_LICENSURE_PLUS_OWNER_SHARED_MODEL_2026-10-06'
),
(
  'APOSTILLE_ROLE_SEPARATION',
  'Apostille courier / facilitator / issuer role separation',
  'DANI_NOTARY_ADMIN',
  'BUILD',
  'DANI may build lawful courier and facilitation workflows, but the apostille itself is issued by the competent government authority; DANI must not present itself as the issuer.',
  'Supports a higher-value notary/admin offer and courier cross-sell without misrepresenting government authority.',
  jsonb_build_array(
    'BUILD_DOCUMENT_INTAKE',
    'CHECK_DESTINATION_COUNTRY_AND_DOCUMENT_TYPE',
    'DETERMINE_WHETHER_NOTARIZATION_OR_CERTIFICATION_IS_REQUIRED',
    'SEPARATE_NOTARY_FEE_FROM_FACILITATION_COURIER_AND_GOVERNMENT_FEES',
    'TRACK_CHAIN_OF_CUSTODY',
    'PROVIDE_STATUS_UPDATES',
    'RETURN_DOCUMENTS_WITH_RECEIPTS'
  ),
  jsonb_build_object(
    'no_legal_advice',true,
    'no_claim_to_issue_apostille',true,
    'government_fees_not_discountable',true
  ),
  'OWNER_SHARED_APOSTILLE_ROLE_GRAPHIC_2026-10-06'
),
(
  'CYBER_FOUNDATIONS_TO_PORTFOLIO',
  'Cybersecurity foundations to evidence portfolio',
  'OWNER_CAREER',
  'BUILD',
  'Hands-on fundamentals and documented labs should precede expensive advanced AI-security certifications.',
  'Builds employability evidence for security roles without confusing certificates with experience.',
  jsonb_build_array(
    'COMPUTER_FUNDAMENTALS',
    'NETWORKING',
    'WINDOWS_AND_LINUX',
    'SECURITY_FUNDAMENTALS',
    'CRYPTO_BASICS',
    'WEB_SECURITY',
    'THREAT_ANALYSIS_AND_MONITORING',
    'ACTIVE_DIRECTORY_LAB',
    'DFIR_CASE_LABS',
    'PUBLISH_SANITIZED_PORTFOLIO_WRITEUPS'
  ),
  jsonb_build_object(
    'lab_work_listed_as_project_not_employment',true,
    'no_expensive_cert_before_skills_gap_check',true
  ),
  'OWNER_SHARED_CYBER_CONCEPTS_2026-10-06'
),
(
  'AI_SECURITY_CERTS_2026',
  '2026 AI-security certification shortlist',
  'OWNER_CAREER',
  'VERIFY_THEN_SEQUENCE',
  'Official sources confirm Microsoft SC-500, OffSec OSAI+, GIAC GAIPS, ISACA AAISM and EC-Council COASP exist in 2026. These target different experience levels and are not interchangeable.',
  'Longer-term specialization after core cyber portfolio; not a near-term Operation $1M cash priority.',
  jsonb_build_array(
    'PRIORITIZE_FREE_OR_FUNDED_TRAINING',
    'COMPLETE_CORE_LABS',
    'VERIFY_JOB_POSTINGS_BEFORE_CERT_PURCHASE',
    'SC500_ONLY_AFTER_AZURE_HYBRID_ADMIN_FOUNDATION',
    'OSAI_ONLY_AFTER_SOLID_SECURITY_AND_AI_FOUNDATION',
    'GAIPS_OR_COASP_ONLY_IF_TARGET_ROLES_JUSTIFY_COST',
    'AAISM_ONLY_IF_PREREQUISITES_AND_SECURITY_LEADERSHIP_PATH_FIT'
  ),
  jsonb_build_object('no_cert_collecting',true,'wioa_or_workforce_pell_first_where_eligible',true),
  'MICROSOFT_OFFSEC_GIAC_ISACA_EC_COUNCIL_OFFICIAL_2026-10-06'
),
(
  'EQIP_SHADOW_SOL',
  'USDA NRCS EQIP readiness for future land-based operation',
  'SHADOW_SOL_AGRICULTURE',
  'FUTURE_AFTER_LAND_CONTROL',
  'EQIP is for eligible agricultural land and conservation practices; applicants need control or ownership of eligible land and an NRCS plan addressing resource concerns. The $450,000 figure is a contract/payment-limit context, not a guaranteed grant award.',
  'Potential conservation cost-share after Shadow & Sol has a real eligible land-based operation; not a current housing acquisition fund.',
  jsonb_build_array(
    'SECURE_OR_CONTROL_ELIGIBLE_LAND',
    'ESTABLISH_REAL_AGRICULTURAL_OPERATION',
    'CREATE_FARM_RECORDS',
    'CONTACT_NRCS_SERVICE_CENTER',
    'DEVELOP_CONSERVATION_PLAN',
    'IDENTIFY_RESOURCE_CONCERNS',
    'CHECK_HISTORICALLY_UNDERSERVED_ADVANCE_PAYMENT_ELIGIBILITY',
    'APPLY_IN_CURRENT_RANKING_WINDOW'
  ),
  jsonb_build_object(
    'not_land_purchase_money',true,
    'not_guaranteed_450k',true,
    'do_not_build_application_before_land_and_operation_exist',true
  ),
  'NRCS_OFFICIAL_EQIP_2026-10-06'
),
(
  'FACELESS_CONTENT_ENGINE',
  'Faceless content / winner-autopsy framework',
  'DANI_MARKETING',
  'SECONDARY_EXECUTION_SYSTEM',
  'The useful element is not a new niche account; it is a repeatable content analysis loop: study winning structure, transfer the mechanism without copying wording, publish, measure, improve.',
  'Can lower content-production cost for existing DANI offers after direct-sales work is handled.',
  jsonb_build_array(
    'USE_EXISTING_DANI_NICHES_ONLY',
    'COLLECT_5_HIGH_PERFORMING_POSTS',
    'EXTRACT_HOOK_STRUCTURE_EMOTION_CTA',
    'CREATE_ORIGINAL_VARIANTS',
    'PUBLISH_TO_EXISTING_CHANNELS',
    'TRACK_LEADS_AND_BOOKINGS_NOT_VANITY_METRICS'
  ),
  jsonb_build_object(
    'no_new_faceless_brand_before_core_revenue',true,
    'no_copying_creator_wording',true,
    'revenue_metric_required',true
  ),
  'OWNER_SHARED_CONTENT_PROMPTS_2026-10-06'
)
on conflict(item_key) do update
set item_name=excluded.item_name,
    lane=excluded.lane,
    status=excluded.status,
    verified_fact=excluded.verified_fact,
    revenue_or_goal_link=excluded.revenue_or_goal_link,
    next_action=excluded.next_action,
    guardrails=excluded.guardrails,
    source_basis=excluded.source_basis,
    updated_at=now();

select item_key,status,lane from public.dd_research_to_execution_filters
where item_key in (
'DOD_CYBER_TRAINING_JUL17',
'GA_SOBER_LIVING_MODEL',
'APOSTILLE_ROLE_SEPARATION',
'CYBER_FOUNDATIONS_TO_PORTFOLIO',
'AI_SECURITY_CERTS_2026',
'EQIP_SHADOW_SOL',
'FACELESS_CONTENT_ENGINE'
)
order by item_key;
