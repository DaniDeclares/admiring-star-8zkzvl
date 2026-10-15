
create table if not exists public.dd_social_business_idea_triage (
  idea_key text primary key,
  idea_name text not null,
  target_division_slug text,
  status text not null,
  strategic_fit text not null,
  capital_intensity text not null,
  claim_treatment text not null,
  next_action jsonb not null default '[]'::jsonb,
  guardrails jsonb not null default '{}'::jsonb,
  source_basis text,
  updated_at timestamptz not null default now()
);
alter table public.dd_social_business_idea_triage enable row level security;

insert into public.dd_social_business_idea_triage(
  idea_key,idea_name,target_division_slug,status,strategic_fit,capital_intensity,claim_treatment,next_action,guardrails,source_basis
)
values
('JUNK_REMOVAL','Junk removal','property-facilities-field-operations','BUILD_ADJACENT','HIGH','LOW_TO_MEDIUM','SOCIAL_EARNINGS_UNVERIFIED',
 jsonb_build_array('VERIFY_DISPOSAL_FEES','VEHICLE_AND_PROVIDER_CAPACITY','BUILD_SCOPE_AND_LOAD_PRICING','LANDFILL_AND_DUMP_RULES','PILOT_BUYER_LIST'),
 jsonb_build_object('no_income_claims',true,'disposal_compliance_required',true),
 'OWNER_SHARED_17_IDEAS_2026-10-06'),
('SEPTIC_CLEANING','Septic tank cleaning','property-facilities-field-operations','OUTSIDE_CURRENT_CAPABILITY','LOW','HIGH','SOCIAL_EARNINGS_UNVERIFIED',
 jsonb_build_array('HOLD_UNLESS_PARTNER_MODEL_VERIFIED'),
 jsonb_build_object('specialized_equipment_and_environmental_compliance',true),
 'OWNER_SHARED_17_IDEAS_2026-10-06'),
('SHORT_TERM_RENTAL_SUPPORT','Short-term rental property operations','property-facilities-field-operations','BUILD_ADJACENT','HIGH','LOW','SOCIAL_EARNINGS_UNVERIFIED',
 jsonb_build_array('DEFINE_NON_BROKER_PROPERTY_SUPPORT_SCOPE','TURNOVER','INSPECTIONS','SUPPLY_RESTOCK','GUEST_READY_EVIDENCE','OWNER_REPORTING'),
 jsonb_build_object('no_real_estate_brokerage_claims_without_authority',true),
 'OWNER_SHARED_17_IDEAS_2026-10-06'),
('PARTY_EQUIPMENT_RENTALS','Party equipment rentals','experiences-resident-programming','RESEARCH_ONLY','MEDIUM','MEDIUM_TO_HIGH','SOCIAL_EARNINGS_UNVERIFIED',
 jsonb_build_array('RENTAL_INVENTORY_MODEL','DAMAGE_DEPOSITS','DELIVERY_SETUP','INSURANCE','UTILIZATION_MODEL'),
 jsonb_build_object('no_inventory_purchase_before_demand_validation',true),
 'OWNER_SHARED_17_IDEAS_2026-10-06'),
('EVENT_SHUTTLE','Event shuttle service','logistics-courier-asset-sourcing','HOLD_REGULATED','MEDIUM','HIGH','SOCIAL_EARNINGS_UNVERIFIED',
 jsonb_build_array('VERIFY_COMMERCIAL_PASSENGER_AUTHORITY','INSURANCE','VEHICLE','DRIVER_REQUIREMENTS','PARTNER_MODEL'),
 jsonb_build_object('no_passenger_transport_until_licensed_and_insured',true),
 'OWNER_SHARED_17_IDEAS_2026-10-06'),
('WEDDING_COORDINATION','Wedding day coordination','experiences-resident-programming','BUILD_ADJACENT','HIGH','LOW','SOCIAL_EARNINGS_UNVERIFIED',
 jsonb_build_array('PACKAGE_DAY_OF_COORDINATION','VENDOR_TIMELINE','CEREMONY_COORDINATION','OFFICIANT_CROSS_SELL','BOOKING_WORKFLOW'),
 jsonb_build_object('verify_existing_service_catalog_alignment',true),
 'OWNER_SHARED_17_IDEAS_2026-10-06'),
('MOBILE_PET_GROOMING','Mobile pet grooming','home-pet-plant-household-support','HOLD_SKILL_CAPITAL','LOW_TO_MEDIUM','HIGH','SOCIAL_EARNINGS_UNVERIFIED',
 jsonb_build_array('PARTNER_MODEL_ONLY_UNLESS_TRAINED_EQUIPPED'),
 jsonb_build_object('animal_safety_and_specialized_equipment',true),
 'OWNER_SHARED_17_IDEAS_2026-10-06'),
('BACKYARD_GLAMPING','Backyard glamping setup','experiences-resident-programming','RESEARCH_ONLY','MEDIUM','MEDIUM','SOCIAL_EARNINGS_UNVERIFIED',
 jsonb_build_array('LOCAL_EVENT_DEMAND','INVENTORY_RENT_VS_OWN','WEATHER_PLAN','SETUP_TAKEDOWN','INSURANCE'),
 jsonb_build_object('no_inventory_purchase_before_paid_demand',true),
 'OWNER_SHARED_17_IDEAS_2026-10-06'),
('RETURN_PALLET_FLIPPING','Return pallet flipping','logistics-courier-asset-sourcing','HOLD_DISTRACTION','LOW','MEDIUM','SOCIAL_EARNINGS_UNVERIFIED',
 jsonb_build_array('NO_ACTION_UNLESS_EXISTING_REVENUE_LANES_STABLE'),
 jsonb_build_object('inventory_risk',true,'cash_tied_up',true),
 'OWNER_SHARED_17_IDEAS_2026-10-06'),
('MOBILE_LAUNDRY','Mobile laundry pickup and delivery','home-pet-plant-household-support','BUILD_ADJACENT','HIGH','LOW_TO_MEDIUM','SOCIAL_EARNINGS_UNVERIFIED',
 jsonb_build_array('USE_EXISTING_WASH_DRY_FOLD_OFFER','PICKUP_DELIVERY_ROUTE','BAG_TAGGING','TURNAROUND_SLA','RECURRING_ACCOUNTS'),
 jsonb_build_object('separate_laundromat_cost_and_delivery_margin',true),
 'OWNER_SHARED_17_IDEAS_2026-10-06'),
('PHOTO_BOOTH','Photo booth rental','experiences-resident-programming','RESEARCH_ONLY','MEDIUM','MEDIUM','SOCIAL_EARNINGS_UNVERIFIED',
 jsonb_build_array('RENT_BEFORE_BUY','EVENT_BUYER_TEST','PACKAGE_WITH_EVENT_SERVICES'),
 jsonb_build_object('no_equipment_purchase_before_bookings',true),
 'OWNER_SHARED_17_IDEAS_2026-10-06'),
('STORAGE_CLEANOUTS','Storage unit cleanouts','property-facilities-field-operations','BUILD_ADJACENT','HIGH','LOW_TO_MEDIUM','SOCIAL_EARNINGS_UNVERIFIED',
 jsonb_build_array('BUILD_CLEANOUT_SCOPE','DISPOSAL_RULES','PHOTO_EVIDENCE','FACILITY_MANAGER_TARGETS'),
 jsonb_build_object('verify_disposal_and_abandoned_property_authority',true),
 'OWNER_SHARED_17_IDEAS_2026-10-06'),
('PET_BOARDING_HOME','Pet boarding at home','home-pet-plant-household-support','HOLD_HOUSING_AND_ZONING','LOW','MEDIUM','SOCIAL_EARNINGS_UNVERIFIED',
 jsonb_build_array('NO_ACTION_BEFORE_STABLE_HOUSING','VERIFY_ZONING_LANDLORD_INSURANCE'),
 jsonb_build_object('dec18_housing_priority',true),
 'OWNER_SHARED_17_IDEAS_2026-10-06'),
('PET_WASTE_REMOVAL','Pet waste removal','home-pet-plant-household-support','BUILD_ADJACENT','HIGH','LOW','SOCIAL_EARNINGS_UNVERIFIED',
 jsonb_build_array('CREATE_RECURRING_ROUTE_OFFER','APARTMENT_DOG_PARK_BUYERS','RESIDENTIAL_SUBSCRIPTIONS','PPE_AND_DISPOSAL'),
 jsonb_build_object('recurring_route_economics',true),
 'OWNER_SHARED_17_IDEAS_2026-10-06'),
('REMOTE_TECH_SETUP','Remote tech setup services','business-formation-digital-infrastructure','BUILD_PROVIDER_LED','HIGH','LOW','SOCIAL_EARNINGS_UNVERIFIED',
 jsonb_build_array('ROUTE_TO_AUTHORIZED_TECH_PROVIDER','DEFINE_REMOTE_SETUP_SCOPE','DEVICE_ACCESS_SECURITY','FIXED_OR_HOURLY_PRICING'),
 jsonb_build_object('owner_not_primary_tech_fulfiller',true),
 'OWNER_SHARED_17_IDEAS_2026-10-06'),
('FURNITURE_ASSEMBLY','Furniture assembly','property-facilities-field-operations','BUILD_ADJACENT','HIGH','LOW','SOCIAL_EARNINGS_UNVERIFIED',
 jsonb_build_array('ADD_AS_FIELD_SUPPORT_OFFER','ASSEMBLY_SCOPE','WALL_ANCHOR_EXCLUSIONS','PROVIDER_RATE','EVIDENCE_QA'),
 jsonb_build_object('manufacturer_instructions_required',true),
 'OWNER_SHARED_17_IDEAS_2026-10-06')
on conflict(idea_key) do update
set idea_name=excluded.idea_name,target_division_slug=excluded.target_division_slug,status=excluded.status,
    strategic_fit=excluded.strategic_fit,capital_intensity=excluded.capital_intensity,
    claim_treatment=excluded.claim_treatment,next_action=excluded.next_action,
    guardrails=excluded.guardrails,source_basis=excluded.source_basis,updated_at=now();

create table if not exists public.dd_funding_program_watch (
  program_key text primary key,
  program_name text not null,
  current_status text not null,
  likely_applicant text,
  dani_fit text,
  shadow_sol_fit text,
  current_facts jsonb not null default '{}'::jsonb,
  next_action text,
  source_authority text,
  checked_at timestamptz not null default now()
);
alter table public.dd_funding_program_watch enable row level security;

insert into public.dd_funding_program_watch(
  program_key,program_name,current_status,likely_applicant,dani_fit,shadow_sol_fit,current_facts,next_action,source_authority
)
values
('USDA_RBDG','USDA Rural Business Development Grants','CLOSED_2026','Public bodies, tribes, nonprofits serving rural areas','NO_DIRECT_FOR_PROFIT_ELIGIBILITY','POTENTIAL_FUTURE',
 jsonb_build_object('2026_deadline_general','2026-06-30','for_profit_ineligible',true),
 'Monitor next cycle for a qualifying Shadow & Sol or public/nonprofit partnership; do not prepare DANI as direct applicant.',
 'USDA_RD'),
('USDA_COMMUNITY_FACILITIES','USDA Community Facilities Direct Loan & Grant','OPEN','Public bodies, community-based nonprofits, federally recognized tribes','NO_DIRECT_COMMERCIAL_USE','POTENTIAL_HIGH_FUTURE',
 jsonb_build_object('application_period','OCT_1_TO_SEP_30_ONGOING','essential_community_facility_only',true),
 'Map Shadow & Sol facility concept against rural eligibility, essential-community-facility definition, governance and financial feasibility.',
 'USDA_RD'),
('USDA_HOUSING_PRESERVATION','USDA Housing Preservation Grants','CLOSED_OR_CYCLE_DEPENDENT','Eligible sponsoring organizations','NO_DIRECT_INDIVIDUAL_GRANT','POTENTIAL_FUTURE',
 jsonb_build_object('individual_homeowners_directly_eligible',false),
 'Monitor next published cycle; do not use as owner household funding assumption.',
 'USDA_RD'),
('SBIR_STTR','SBIR/STTR Americas Seed Fund','OPEN_TOPIC_DEPENDENT','Eligible U.S. R&D small businesses; STTR includes research institution partnership','LOW_UNLESS_TECH_RND_PROJECT','LOW',
 jsonb_build_object('phase1_typical_range','50000-275000','phase2_typical_range','400000-1800000','current_2026_topics_exist',true),
 'Only pursue if DANI develops a true R&D/technology innovation fitting an active agency topic.',
 'SBIR_SBA'),
('NEA_GAP','NEA Grants for Arts Projects','2026_DEADLINES_PASSED','Eligible arts organizations','LOW','POTENTIAL_FUTURE',
 jsonb_build_object('request_range_general','10000-100000','match','1_TO_1','new_guidelines_expected','LATE_DECEMBER_2026'),
 'For Shadow & Sol arts/culture programming, prepare for next guideline release rather than treating as open now.',
 'NEA'),
('AMBER_GRANT','WomensNet Amber Grant','OPEN_RECURRING','Women-owned businesses in U.S./Canada','HIGH','POSSIBLE',
 jsonb_build_object('monthly_award',10000,'year_end_award',50000,'private_grant',true),
 'Evaluate one strong DANI application after current business plan/use-of-funds packet is refreshed; verify application fee/current terms before submission.',
 'WOMENSNET'),
('PELL_GRANT','Federal Pell Grant','EDUCATION_AID_NOT_BUSINESS_GRANT','Eligible undergraduate students','PERSONAL_EDUCATION_ONLY','NO',
 jsonb_build_object('business_use',false),
 'Keep separate from Operation $1M business funding; use only for eligible education costs.',
 'FEDERAL_STUDENT_AID'),
('EPA_EJ','EPA Environmental Justice funding','OPPORTUNITY_DEPENDENT','Eligibility varies by specific notice','LOW_DIRECT','POTENTIAL_SHADOW_SOL',
 jsonb_build_object('blanket_100k_claim_rejected',true),
 'Monitor specific current EPA notices and eligibility; do not use generic social-media award caps.',
 'EPA'),
('WAP','Weatherization Assistance Program','HOUSEHOLD_PROGRAM_VIA_LOCAL_AGENCIES','Income-qualified households through state/local network','NO_BUSINESS_GRANT','NO',
 jsonb_build_object('not_general_10000_cash_grant',true),
 'Keep in household assistance research only if eligible; not an Operation $1M capital source.',
 'DOE')
on conflict(program_key) do update
set program_name=excluded.program_name,current_status=excluded.current_status,likely_applicant=excluded.likely_applicant,
    dani_fit=excluded.dani_fit,shadow_sol_fit=excluded.shadow_sol_fit,current_facts=excluded.current_facts,
    next_action=excluded.next_action,source_authority=excluded.source_authority,checked_at=now();

insert into public.dd_division_operating_playbook(
  division_id,playbook_key,playbook_name,lifecycle_stage,required,specification,source_basis
)
select d.id,'LAND_BANK_ACQUISITION_SCREEN','Georgia land-bank acquisition screen','RESEARCH_ACTIVE',true,
  jsonb_build_object(
    'fact','Georgia land banks can acquire, hold, manage and dispose of vacant, tax-delinquent, abandoned or blighted real estate under their governing rules.',
    'metro_atlanta_fact','Metro Atlanta Land Bank has application processes and affordability/development programs; properties are not universally sold to any new LLC for $1,000.',
    'screen',jsonb_build_array('PROPERTY_AVAILABILITY','ELIGIBLE_APPLICANT','PRICE_AND_DISPOSITION_TERMS','AFFORDABILITY_RESTRICTIONS','DEVELOPMENT_TIMELINE','SITE_CONDITION','TITLE','ZONING','FINANCING'),
    'financing_rule','An LLC and EIN do not create an automatic right to a construction loan; financing remains subject to underwriting and lender documentation.',
    'owner_home_rule','Do not assume land-bank commercial/development acquisition can substitute for the owner household USDA 502 Direct path.',
    'next_action','Monitor Georgia land-bank inventories only where project fit is real; compare to USDA home/land path and Shadow & Sol long-term development goals.'
  ),
  'OFFICIAL_GEORGIA_LAND_BANK_AND_METRO_ATLANTA_LAND_BANK_VERIFIED_2026-10-06'
from public.divisions d
where d.slug in ('real-estate-closing-support','business-development-growth','government-institutional-procurement')
on conflict(division_id,playbook_key) do update
set lifecycle_stage=excluded.lifecycle_stage,specification=excluded.specification,source_basis=excluded.source_basis,updated_at=now();

insert into public.dd_division_operating_playbook(
  division_id,playbook_key,playbook_name,lifecycle_stage,required,specification,source_basis
)
select d.id,'BUSINESS_CREDIT_CLAIM_GUARD','Business credit and lending claim guard','ACTIVE',true,
  jsonb_build_object(
    'rejected_claim','Banks are required by law to provide a new LLC $50K-$250K without documentation.',
    'verified_rule','No such blanket requirement exists. Banks use underwriting, repayment capacity, credit information and lender-specific documentation; SBA lending also requires eligibility and lender underwriting.',
    'application_rule','Never form a new LLC solely to chase no-doc funding claims.',
    'funding_sequence',jsonb_build_array('CLEAN_BOOKS','REAL_REVENUE','BUSINESS_BANKING','CREDIT_PROFILE','USE_OF_FUNDS','DEBT_SERVICE_TEST','COMPARE_CURRENT_PRODUCTS','OWNER_APPROVAL')
  ),
  'FDIC_AND_SBA_VERIFIED_2026-10-06'
from public.divisions d
where d.slug in ('administrative-business-operations','business-development-growth')
on conflict(division_id,playbook_key) do update
set lifecycle_stage=excluded.lifecycle_stage,specification=excluded.specification,source_basis=excluded.source_basis,updated_at=now();

create table if not exists public.dd_referral_ecosystem_sources (
  source_key text primary key,
  source_name text not null,
  population_focus text,
  use_case text not null,
  status text not null default 'RESEARCH',
  outreach_model text,
  guardrails jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);
alter table public.dd_referral_ecosystem_sources enable row level security;

insert into public.dd_referral_ecosystem_sources(source_key,source_name,population_focus,use_case,status,outreach_model,guardrails)
values
('SHELTERLISTINGS','ShelterListings.org','Shelter/housing assistance ecosystem','Find organizations already serving people with housing instability for lawful referral/partner mapping.','RESEARCH','VERIFY_ORGANIZATION_THEN_PARTNER_OUTREACH',jsonb_build_object('do_not_scrape_private_client_data',true)),
('NRD','National Resource Directory','Military/veteran and family resources','Potential referral ecosystem where veteran/family services intersect with housing and support.','RESEARCH','VERIFY_PROGRAM_FIT',jsonb_build_object('population_specific',true)),
('DOMESTICSHELTERS','DomesticShelters.org','Domestic violence survivors','Potential provider/referral ecosystem only with trauma-informed, non-exploitative outreach.','RESEARCH','ORGANIZATION_LEVEL_ONLY',jsonb_build_object('no_direct_marketing_to_survivors',true,'privacy_sensitive',true)),
('RECOVERY','Recovery.org','Substance-use recovery resources','Potential organization mapping for housing/support partnerships; verify each program independently.','RESEARCH','ORGANIZATION_LEVEL_ONLY',jsonb_build_object('no_health_claims',true)),
('FINDTREATMENT','FindTreatment.gov','Behavioral health treatment locator','Government locator for treatment providers; useful only for organization-level ecosystem mapping, not lead harvesting.','RESEARCH','ORGANIZATION_LEVEL_ONLY',jsonb_build_object('no_patient_targeting',true,'health_privacy',true))
on conflict(source_key) do update
set source_name=excluded.source_name,population_focus=excluded.population_focus,use_case=excluded.use_case,
    status=excluded.status,outreach_model=excluded.outreach_model,guardrails=excluded.guardrails,updated_at=now();

select
  (select count(*) from public.dd_social_business_idea_triage) as idea_rows,
  (select count(*) from public.dd_funding_program_watch) as funding_rows,
  (select count(*) from public.dd_referral_ecosystem_sources) as referral_sources;
