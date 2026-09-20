-- DANI DECLARES: cleaning quote contracts for the package composer.
-- This migration defines the INPUT CONTRACT only. It does not invent
-- condition-based pricing. Existing governed pricing remains authoritative.
-- DNI-01A-003's bedroom-tier pricing is already staged separately.
begin;

update public.services
set
  quote_input_schema = jsonb_build_object(
    'pricing_model','FIXED_SCOPE',
    'fields', jsonb_build_array(
      jsonb_build_object('key','bedroom_count','type','select','label','Bedrooms','options',jsonb_build_array('studio','1','2','3','4+')),
      jsonb_build_object('key','bathroom_count','type','select','label','Bathrooms','options',jsonb_build_array('1','2','3','4+')),
      jsonb_build_object('key','mess_degree','type','select','label','Degree of mess','options',jsonb_build_array('standard','moderate','heavy','severe')),
      jsonb_build_object('key','odor_level','type','select','label','Odor level','options',jsonb_build_array('none','light','heavy','severe')),
      jsonb_build_object('key','pet_condition','type','select','label','Pet condition','options',jsonb_build_array('none','routine','heavy','severe')),
      jsonb_build_object('key','occupancy','type','select','label','Occupancy','options',jsonb_build_array('vacant','occupied')),
      jsonb_build_object('key','square_footage','type','number','label','Approximate square footage'),
      jsonb_build_object('key','scope_summary','type','text','label','Scope summary')
    )
  ),
  quote_engine_version='2026-09-20-cleaning-package-v1'
where sku='DNI-01A-001' and is_active=true;

update public.services
set
  quote_input_schema = jsonb_build_object(
    'pricing_model','FIXED_SCOPE',
    'fields', jsonb_build_array(
      jsonb_build_object('key','bedroom_count','type','select','label','Bedrooms','options',jsonb_build_array('studio','1','2','3','4+')),
      jsonb_build_object('key','bathroom_count','type','select','label','Bathrooms','options',jsonb_build_array('1','2','3','4+')),
      jsonb_build_object('key','mess_degree','type','select','label','Degree of mess','options',jsonb_build_array('standard','moderate','heavy','severe')),
      jsonb_build_object('key','odor_level','type','select','label','Odor level','options',jsonb_build_array('none','light','heavy','severe')),
      jsonb_build_object('key','pet_condition','type','select','label','Pet condition','options',jsonb_build_array('none','routine','heavy','severe')),
      jsonb_build_object('key','occupancy','type','select','label','Occupancy','options',jsonb_build_array('vacant','occupied')),
      jsonb_build_object('key','square_footage','type','number','label','Approximate square footage'),
      jsonb_build_object('key','scope_summary','type','text','label','Scope summary')
    )
  ),
  quote_engine_version='2026-09-20-cleaning-package-v1'
where sku='DNI-01A-002' and is_active=true;

commit;
