
insert into public.dd_division_operating_playbook(
  division_id,playbook_key,playbook_name,lifecycle_stage,required,specification,source_basis
)
select d.id,'CANVA_REVENUE_SKILL_ENGINE','Canva skill-to-revenue engine','ACTIVE',true,
  jsonb_build_object(
    'sequence',jsonb_build_array(
      'SELECT_VALIDATED_PROBLEM',
      'BUILD_1_REAL_ASSET',
      'USE_OR_TEST_ASSET',
      'PACKAGE_REUSABLE_TEMPLATE',
      'CREATE_LISTING',
      'CREATE_DISTRIBUTION_CONTENT',
      'MEASURE_RESPONSE',
      'ITERATE'
    ),
    'prompt_library',jsonb_build_array(
      jsonb_build_object('name','IDEA_EXPANSION','use_after','VALIDATED_AUDIENCE_PROBLEM','instruction','Generate beginner-friendly product possibilities tied to the selected problem; include audience and price hypotheses, clearly labeled as hypotheses.'),
      jsonb_build_object('name','TEMPLATE_BUNDLE','use_after','PRODUCT_TYPE_SELECTED','instruction','Design a 10-item bundle where every item maps to a concrete user task or pain point.'),
      jsonb_build_object('name','PINTEREST_DESCRIPTIONS','use_after','PRODUCT_EXISTS','instruction','Create keyword-aware Pinterest descriptions with hooks and calls to action grounded in the finished product.'),
      jsonb_build_object('name','PRODUCT_LISTING','use_after','PRODUCT_EXISTS','instruction','Create title, description, tags, bullets and FAQ without inventing outcomes, reviews or guarantees.'),
      jsonb_build_object('name','CONTENT_PLAN','use_after','PRODUCT_EXISTS','instruction','Create a 7-day promotion plan for the selected platform with post ideas, captions, engagement prompts and a measurable CTA.')
    ),
    'guardrails',jsonb_build_array(
      'NO_20_GENERIC_IDEAS_BEFORE_PROBLEM_VALIDATION',
      'NO_FAKE_TESTIMONIALS',
      'NO_UNVERIFIED_INCOME_CLAIMS',
      'NO_PRODUCT_BUILD_JUST_BECAUSE_CANVA_CAN_GENERATE_IT'
    ),
    'success_metric','PUBLISHED_OR_CLIENT_USED_ASSET_WITH_MEASURABLE_RESPONSE'
  ),
  'OWNER_SHARED_CANVA_PROMPTS_REFRAMED_AS_EXECUTION_ENGINE_2026-10-06'
from public.divisions d
where d.slug in ('creative-design-production','marketing-content-media-production','business-formation-digital-infrastructure')
on conflict(division_id,playbook_key) do update
set lifecycle_stage=excluded.lifecycle_stage,
    specification=excluded.specification,
    source_basis=excluded.source_basis,
    updated_at=now();

insert into public.dd_division_operating_playbook(
  division_id,playbook_key,playbook_name,lifecycle_stage,required,specification,source_basis
)
select d.id,'AFFORDABLE_HOUSING_CAPITAL_MAP','Affordable housing and land capital map','RESEARCH_ACTIVE',true,
  jsonb_build_object(
    'programs',jsonb_build_array(
      jsonb_build_object(
        'program','CDBG',
        'current_fact','HUD CDBG can support eligible real-property acquisition, rehabilitation, demolition/clearance, public facilities and certain economic-development activities.',
        'access_rule','HUD generally funds state/local grantees; DANI or a project entity would need to work through the administering jurisdiction or an eligible structured project.',
        'not_direct_individual_grant',true,
        'status','ACTIVE_PROGRAM'
      ),
      jsonb_build_object(
        'program','HOME',
        'current_fact','HOME formula funds flow to states/local participating jurisdictions and can support building, buying and rehabilitating affordable housing, often with nonprofit or development partners.',
        'access_rule','Treat as a structured affordable-housing development capital source, not direct homeowner grant money.',
        'not_direct_individual_grant',true,
        'status','ACTIVE_PROGRAM'
      ),
      jsonb_build_object(
        'program','USDA_RURAL_DEVELOPMENT',
        'current_fact','USDA has multiple rural housing and community-development programs; program, applicant type, area and funding window differ.',
        'access_rule','Match the exact USDA program to the project entity and use case; do not label USDA generally as a single investor grant.',
        'status','PROGRAM_FAMILY'
      ),
      jsonb_build_object(
        'program','GEORGIA_DCA_HOME_AND_AFFORDABLE_HOUSING',
        'current_fact','Georgia DCA administers HOME and housing-credit related development financing; eligible project structures and application rounds vary.',
        'access_rule','Monitor current DCA NOFAs/QAPs and structure project eligibility before underwriting a deal.',
        'status','MONITOR_CURRENT_ROUNDS'
      ),
      jsonb_build_object(
        'program','ARPA_SLFRF',
        'current_fact','Treasury required recipient obligations by 2024-12-31; previously obligated funds generally must be expended by 2026-12-31.',
        'access_rule','Do not treat ARPA as open new federal grant money in 2026. Only pursue local projects where a recipient already obligated funds and is procuring/contracting implementation.',
        'status','TAIL_END_IMPLEMENTATION_ONLY'
      )
    ),
    'deal_structure_rule','Capital sources attach to eligible projects, jurisdictions and entities. Validate ownership entity, affordability restrictions, match, procurement, environmental review, compliance period and eligible costs before treating a source as financeable.',
    'owner_home_rule','Do not mix the owner household USDA 502 Direct home-acquisition file with DANI or Shadow & Sol development projects.',
    'shadow_sol_rule','Potential nonprofit/community housing or rural-development opportunities must use lawful nonprofit purposes, board/governance controls and separate accounting; no commingling with DANI.',
    'next_research',jsonb_build_array('GEORGIA_CURRENT_DCA_NOFAS','LOCAL_CDBG_ACTION_PLANS','HOME_PARTICIPATING_JURISDICTIONS','USDA_PROGRAM_MATCH','OBLIGATED_ARPA_LOCAL_PROJECTS')
  ),
  'OFFICIAL_HUD_USDA_TREASURY_AND_GEORGIA_DCA_VERIFICATION_2026-10-06'
from public.divisions d
where d.slug in ('government-institutional-procurement','real-estate-closing-support','business-development-growth')
on conflict(division_id,playbook_key) do update
set lifecycle_stage=excluded.lifecycle_stage,
    specification=excluded.specification,
    source_basis=excluded.source_basis,
    updated_at=now();

insert into public.dd_division_operating_playbook(
  division_id,playbook_key,playbook_name,lifecycle_stage,required,specification,source_basis
)
select d.id,'DNA_COLLECTION_AGENCY_FEASIBILITY','DNA collection agency feasibility lane','RESEARCH_ONLY',true,
  jsonb_build_object(
    'candidate_model','COLLECTION_AND_COORDINATION_PARTNER_FOR_ACCREDITED_LABS',
    'not_active_service',true,
    'why_candidate','Potential low-capital adjacent field service if DANI partners with qualified relationship-testing laboratories rather than representing itself as a testing laboratory.',
    'operating_model',jsonb_build_array(
      'PARTNER_WITH_QUALIFIED_LAB',
      'SCHEDULE_CLIENT',
      'VERIFY_IDENTITY_AND_CONSENT',
      'COLLECT_SAMPLE_UNDER_LAB_PROTOCOL',
      'MAINTAIN_CHAIN_OF_CUSTODY',
      'SECURE_TRANSPORT',
      'LAB_PERFORMS_TESTING',
      'RESULTS_RELEASED_BY_AUTHORIZED_LAB'
    ),
    'legal_and_quality_gates',jsonb_build_array(
      'VERIFY_GEORGIA_BUSINESS_AND_SPECIMEN_COLLECTION_REQUIREMENTS',
      'VERIFY_PRIVACY_AND_HEALTH_INFORMATION_HANDLING',
      'VERIFY_LAB_CONTRACT_AND_INSURANCE',
      'VERIFY_CHAIN_OF_CUSTODY_PROTOCOL',
      'VERIFY_MARKETING_CLAIMS',
      'NO_IMMIGRATION_OR_COURT_CASE_INITIATION_UNLESS_AABB_REQUIREMENTS_ARE_MET'
    ),
    'aabb_fact','AABB accredits relationship-testing facilities, including collection and verification/reporting-only sites. Immigration DNA cases must be initiated and reported through AABB-accredited facilities.',
    'collector_path','AABB currently offers relationship-testing collection training and a qualified collector roster.',
    'prohibited',jsonb_build_array(
      'CALL_DANI_A_DNA_LAB_WITHOUT_LAB_AUTHORITY',
      'ISSUE_TEST_RESULTS',
      'PROMISE_COURT_OR_IMMIGRATION_ACCEPTANCE_WITHOUT_ACCREDITED_PATH',
      'HANDLE_SAMPLES_WITHOUT_WRITTEN_CHAIN_OF_CUSTODY'
    ),
    'decision_gate','OWNER_APPROVAL_AFTER_FEASIBILITY_COST_AND_PARTNER_ANALYSIS'
  ),
  'AABB_RELATIONSHIP_TESTING_REQUIREMENTS_VERIFIED_2026-10-06'
from public.divisions d
where d.slug in ('logistics-courier-asset-sourcing','business-development-growth')
on conflict(division_id,playbook_key) do update
set lifecycle_stage=excluded.lifecycle_stage,
    specification=excluded.specification,
    source_basis=excluded.source_basis,
    updated_at=now();

select
  (select count(*) from public.dd_division_operating_playbook where playbook_key='CANVA_REVENUE_SKILL_ENGINE') as canva_engine_rows,
  (select count(*) from public.dd_division_operating_playbook where playbook_key='AFFORDABLE_HOUSING_CAPITAL_MAP') as housing_capital_rows,
  (select count(*) from public.dd_division_operating_playbook where playbook_key='DNA_COLLECTION_AGENCY_FEASIBILITY') as dna_feasibility_rows;
