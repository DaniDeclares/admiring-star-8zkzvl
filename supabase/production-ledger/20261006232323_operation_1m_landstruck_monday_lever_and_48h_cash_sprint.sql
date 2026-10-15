
insert into public.dd_property_research_sources(
  source_key,source_name,source_type,status,intended_use,authority_level,verification_rule,due_diligence_required,notes
)
values
(
  'LANDSTRUCK',
  'LandStruck',
  'OWNER_FINANCED_LAND_MARKETPLACE',
  'RESEARCH_SOURCE',
  'Evaluate owner-financed rural land as a future acquisition option when geography and total economics fit.',
  'SELLER_MARKETPLACE',
  'Verify parcel ownership, contract seller, deed/contract structure, total financed price, APR, down payment, document/closing fees, taxes, access, zoning, utilities, septic/well feasibility, buildability, title, and exit rights before commitment.',
  jsonb_build_array(
    'PARCEL_AND_SELLER_IDENTITY',
    'CONTRACT_FOR_DEED_OR_LAND_CONTRACT_TERMS',
    'WHEN_DEED_TRANSFERS',
    'APR_AND_TOTAL_FINANCED_COST',
    'DOWN_PAYMENT_AND_FEES',
    'PREPAYMENT_TERMS',
    'TAXES_AND_ASSOCIATION_FEES',
    'LEGAL_ACCESS_AND_ROAD_MAINTENANCE',
    'ZONING_AND_MINIMUM_DWELLING_RULES',
    'FLOOD_AND_TOPOGRAPHY',
    'WATER_SEPTIC_POWER_INTERNET',
    'SURVEY_AND_BOUNDARIES',
    'BUILDABILITY_AND_PERMITTING',
    'TITLE_AND_LIENS'
  ),
  'Current seller FAQ states no credit check, background check required, seller/owner financing only on property they own or control, and most current inventory is Tennessee. Treat all property-specific terms as listing-specific.'
)
on conflict(source_key) do update
set source_name=excluded.source_name,
    source_type=excluded.source_type,
    status=excluded.status,
    intended_use=excluded.intended_use,
    authority_level=excluded.authority_level,
    verification_rule=excluded.verification_rule,
    due_diligence_required=excluded.due_diligence_required,
    notes=excluded.notes,
    updated_at=now();

insert into public.dd_learning_accelerator_framework(
  method_key,method_name,use_when,prompt_pattern,completion_artifact,guardrail,active
)
values
(
  'MONDAY_REVENUE_REVIEW',
  'Monday review -> one lever -> schedule',
  'Weekly Operation $1M planning',
  'Review last week and identify what moved money or trust, select one highest-leverage action for the week, then sequence Monday-Friday work and explicitly list what is being deferred.',
  'ONE_WEEK_LEVER_PLAN_WITH_NO_LIST',
  'Do not let planning replace execution. The lever must connect to revenue, delivery, trust, housing stability, or a real bottleneck.',
  true
)
on conflict(method_key) do update
set method_name=excluded.method_name,
    use_when=excluded.use_when,
    prompt_pattern=excluded.prompt_pattern,
    completion_artifact=excluded.completion_artifact,
    guardrail=excluded.guardrail,
    active=true,
    updated_at=now();

insert into public.dd_division_growth_rules(
  division_id,rule_key,rule_name,rule_spec,source_basis
)
select d.id,
  'ONE_WEEK_ONE_LEVER',
  'One primary weekly growth lever',
  jsonb_build_object(
    'review_questions',jsonb_build_array(
      'WHAT_MOVED_MONEY',
      'WHAT_MOVED_TRUST',
      'WHAT_WAS_BUSYWORK',
      'WHAT_IS_THE_SINGLE_HIGHEST_LEVER_THIS_WEEK'
    ),
    'weekly_rule','Choose one primary growth lever plus maintenance work. Do not run multiple unrelated growth experiments in the same week.',
    'schedule_rule','Sequence the lever Monday-Friday and maintain an explicit NO/DEFER list.',
    'success_metric','MEASURABLE_MOVEMENT_IN_REVENUE_TRUST_OR_BOTTLENECK_REMOVAL'
  ),
  'OWNER_SHARED_MONDAY_REVIEW_PATTERN_2026-10-06'
from public.divisions d
where d.is_active
on conflict(division_id,rule_key) do update
set rule_spec=excluded.rule_spec,
    source_basis=excluded.source_basis,
    updated_at=now();

insert into public.dd_division_growth_rules(
  division_id,rule_key,rule_name,rule_spec,source_basis
)
select d.id,
  'FORTY_EIGHT_HOUR_CASH_SPRINT',
  '48-hour cash sprint using existing capability',
  jsonb_build_object(
    'trigger','Use only when immediate cash generation is needed and existing pipeline cannot fill the gap fast enough.',
    'sequence',jsonb_build_array(
      'SELECT_EXISTING_LOW_STARTUP_SERVICE',
      'SET_REALISTIC_48H_CASH_TARGET',
      'DEFINE_SCOPE_AND_PRICE_FROM_EXISTING_AUTHORITY',
      'IDENTIFY_LOCAL_BUYERS_OR_NEIGHBORHOODS',
      'USE_ZERO_OR_LOW_COST_OUTREACH',
      'BOOK_AND_COLLECT_PAYMENT',
      'FULFILL_AND_CAPTURE_EVIDENCE',
      'ASK_FOR_REFERRAL_OR_REPEAT'
    ),
    'preferred_existing_services',jsonb_build_array(
      'CLEANING_AND_RESETS',
      'MOBILE_NOTARY_WHEN_COMMISSION_ACTIVE',
      'LAUNDRY_PICKUP_DELIVERY',
      'FURNITURE_ASSEMBLY',
      'PET_WASTE_REMOVAL',
      'FIELD_SUPPORT',
      'DTF_OR_SIMPLE_MERCH_ORDERS'
    ),
    'do_not_do',jsonb_build_array(
      'FORM_NEW_ENTITY',
      'BUY_LOGO_OR_BUSINESS_CARDS',
      'BUILD_NEW_WEBSITE',
      'BUY_INVENTORY_WITHOUT_ORDER',
      'START_NEW_REGULATED_SERVICE',
      'USE_UNVERIFIED_PRICE'
    ),
    'close_rule','After first paid job, capture proof, ask for referral, and decide whether the service belongs in the recurring catalog.'
  ),
  'OWNER_SHARED_48_HOUR_CASH_SPRINT_PATTERN_2026-10-06'
from public.divisions d
where d.slug in (
  'property-facilities-field-operations',
  'home-pet-plant-household-support',
  'notary-document-services',
  'creative-design-production',
  'logistics-courier-asset-sourcing'
)
on conflict(division_id,rule_key) do update
set rule_spec=excluded.rule_spec,
    source_basis=excluded.source_basis,
    updated_at=now();

select
  (select count(*) from public.dd_property_research_sources where source_key='LANDSTRUCK') as landstruck_rows,
  (select count(*) from public.dd_division_growth_rules where rule_key='ONE_WEEK_ONE_LEVER') as one_lever_rows,
  (select count(*) from public.dd_division_growth_rules where rule_key='FORTY_EIGHT_HOUR_CASH_SPRINT') as cash_sprint_rows;
