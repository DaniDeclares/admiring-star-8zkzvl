begin;

update public.services
set
  base_price_cents = 14000,
  starting_price = 140.00,
  price_note = 'DNI-01A-001 is a fixed-price Resident Refresh for properties up to 1 bedroom, 1 bathroom, and 1,000 sq. ft. Larger homes require a different service or quote.',
  description = 'Standard maintenance clean for an accessible, ordinarily maintained residential property up to 1 bedroom, 1 bathroom, and 1,000 sq. ft.; includes surface dusting, floor vacuuming, kitchen hard-floor mopping, appliance exterior polishing and doorstep trash staging.',
  quote_input_schema = jsonb_build_object(
    'version','2026-09-21-resident-refresh-bounded-v1',
    'ui_mode','SPECIALIZED_CLEANING',
    'pricing_model','FIXED_SCOPE',
    'scope_boundary',jsonb_build_object(
      'bedroom_count',jsonb_build_object('max',1),
      'bathroom_count',jsonb_build_object('max',1),
      'square_footage',jsonb_build_object('max',1000,'unit','sq_ft'),
      'out_of_scope_action','REQUIRE_DIFFERENT_SERVICE_OR_QUOTE'
    ),
    'fields',jsonb_build_array(
      jsonb_build_object('key','bedroom_count','type','select','label','Bedrooms','options',jsonb_build_array('1'),'classification','SCOPE','required',true),
      jsonb_build_object('key','bathroom_count','type','select','label','Bathrooms','options',jsonb_build_array('1'),'classification','SCOPE','required',true),
      jsonb_build_object('key','layout_type','type','select','label','Layout environment','options',jsonb_build_array('apartment','townhome','single_family_home'),'classification','SCOPE','required',true),
      jsonb_build_object('key','occupancy','type','select','label','Occupancy','options',jsonb_build_array('vacant','occupied'),'classification','SCOPE','required',true),
      jsonb_build_object('key','mess_degree','type','select','label','Degree of mess','options',jsonb_build_array('standard','moderate','heavy','severe'),'classification','UNDERWRITING','required',true),
      jsonb_build_object('key','odor_level','type','select','label','Odor level','options',jsonb_build_array('none','light','heavy','severe'),'classification','UNDERWRITING','required',true),
      jsonb_build_object('key','pet_condition','type','select','label','Pet condition','options',jsonb_build_array('none','routine','heavy','severe'),'classification','SCOPE','required',true),
      jsonb_build_object('key','severe_pet_mess','type','boolean','label','Severe pet mess / heavy soil','classification','PRICING_MODIFIER'),
      jsonb_build_object('key','severe_odor_smoke','type','boolean','label','Severe odor / smoke neutralization required','classification','UNDERWRITING'),
      jsonb_build_object('key','square_footage','type','number','label','Approximate square footage','classification','SCOPE','required',true,'min',0,'max',1000),
      jsonb_build_object('key','scope_summary','type','text','label','Scope summary','classification','SCOPE')
    ),
    'commercial_inputs',jsonb_build_array(
      jsonb_build_object('key','miles_one_way','type','number','label','Miles one way','classification','COMMERCIAL'),
      jsonb_build_object('key','apply_standard_travel','type','boolean','label','Standard travel rule','classification','COMMERCIAL'),
      jsonb_build_object('key','rush','type','boolean','label','24-hour / rush (+25%)','classification','COMMERCIAL'),
      jsonb_build_object('key','materials_cost','type','number','label','Materials cost','classification','COMMERCIAL'),
      jsonb_build_object('key','pass_through_cost','type','number','label','Pass-through cost','classification','COMMERCIAL'),
      jsonb_build_object('key','tax_rate_percent','type','number','label','Tax rate %','classification','COMMERCIAL'),
      jsonb_build_object('key','deposit_percent','type','number','label','Deposit %','classification','COMMERCIAL')
    ),
    'companion_lines',jsonb_build_array(
      jsonb_build_object('sku','DNI-01A-036','label','Specialized Carpet Fiber Extraction Add-on','component_role','COMPANION'),
      jsonb_build_object('sku','DNI-01A-041','label','Abandoned Property & Furniture / Debris Support','component_role','COMPANION'),
      jsonb_build_object('sku','DNI-01A-020','label','Interior Appliance Deep-Detail Add-on','component_role','COMPANION'),
      jsonb_build_object('sku','DNI-01A-025','label','High-Reach Dust & Cobweb Detail Add-on','component_role','COMPANION')
    )
  ),
  quote_engine_version = '2026-09-21-resident-refresh-bounded-v1',
  updated_at = now()
where sku='DNI-01A-001' and is_active=true;

update public.dd_master_service_universe
set
  scope = 'Routine residential maintenance cleaning of accessible, ordinary household surfaces and rooms within a maximum capacity of 1 bedroom, 1 bathroom, and 1,000 sq. ft.; condition and access are confirmed before dispatch. Larger properties require a different service or quote.',
  customer_price = '$140.00 fixed price within defined capacity',
  internal_cost = '$66.50 AUDITED BASELINE MODEL: 2.0 labor hours × $23.40 burdened labor rate + $15.20 travel + $4.50 materials.',
  margin_economics = '52.50% AUDITED BASELINE MODEL at $140.00 customer price and $66.50 modeled direct fulfillment cost; exceeds 50% release threshold by 2.50 percentage points.',
  conflict_register = concat(coalesce(conflict_register,''), E'\n2026-09-21 scope/economics lock: DNI-01A-001 bounded to 1BR/1BA/1,000 sq. ft.; larger properties require a different service or quote. $66.50 is an audited operating model based on benchmark assumptions and is not yet payroll/timecard-verified actual cost.')
where canonical_sku='DNI-01A-001' and lifecycle_status='CANONICAL_ACTIVE';

insert into public.dd_service_economic_baselines
(master_service_id,runtime_service_id,evidence_status,estimated_duration_hours,labor_rate,materials_cost,travel_cost,other_direct_cost,travel_status,source_type,source_reference,source_date,notes)
select
  m.id,s.id,'AUDITED',2.0,23.40,4.50,15.20,0.00,'AUDITED',
  'AUDITED_ECONOMIC_BASELINE',
  'Owner-approved DNI-01A-001 bounded economic baseline; IRS 2026 H2 mileage rate; benchmark labor/material assumptions supplied for reconciliation.',
  date '2026-09-21',
  'Capacity: max 1 bedroom, 1 bathroom, 1,000 sq. ft. Direct cost = 46.80 labor + 15.20 travel + 4.50 materials = 66.50. Customer price = 140.00. Modeled contribution margin = 73.50 / 140.00 = 52.50%. This is an audited mathematical operating model; labor, duration, travel distance and materials remain benchmark assumptions pending real-world payroll/timecard validation. It is not a provider rate commitment.'
from public.dd_master_service_universe m
join public.services s on s.sku=m.canonical_sku
where m.canonical_sku='DNI-01A-001' and m.lifecycle_status='CANONICAL_ACTIVE'
  and not exists (
    select 1 from public.dd_service_economic_baselines e
    where e.master_service_id=m.id
      and e.runtime_service_id=s.id
      and e.evidence_status='AUDITED'
      and e.source_date=date '2026-09-21'
  );

update public.dd_service_release_verifications
set
  notes = concat(coalesce(notes,''), E'\n2026-09-21 economics reconciliation: bounded service 1BR/1BA/1,000 sq. ft.; audited model $66.50 direct cost vs $140.00 price; modeled margin 52.50%. Actual payroll/timecard verification remains a future validation item.')
where canonical_sku='DNI-01A-001';

commit;
