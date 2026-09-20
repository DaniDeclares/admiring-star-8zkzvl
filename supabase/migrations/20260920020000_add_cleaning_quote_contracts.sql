-- DANI DECLARES: cleaning quote contracts for the package composer.
-- Input contracts only. Pricing remains governed by existing rules; no
-- condition-based price is invented by this migration.
begin;

update public.services
set quote_input_schema = jsonb_build_object(
    'version','2026-09-20-cleaning-package-v1',
    'ui_mode','SPECIALIZED_CLEANING',
    'pricing_model','FIXED_SCOPE',
    'fields', jsonb_build_array(
      jsonb_build_object('key','bedroom_count','type','select','label','Bedrooms','options',jsonb_build_array('studio','1','2','3','4+')),
      jsonb_build_object('key','bathroom_count','type','select','label','Bathrooms','options',jsonb_build_array('1','2','3','4+')),
      jsonb_build_object('key','layout_type','type','select','label','Layout environment','options',jsonb_build_array('apartment','townhome','single_family_home','commercial_unit')),
      jsonb_build_object('key','occupancy','type','select','label','Occupancy','options',jsonb_build_array('vacant','occupied')),
      jsonb_build_object('key','mess_degree','type','select','label','Degree of mess','options',jsonb_build_array('standard','moderate','heavy','severe')),
      jsonb_build_object('key','odor_level','type','select','label','Odor level','options',jsonb_build_array('none','light','heavy','severe')),
      jsonb_build_object('key','pet_condition','type','select','label','Pet condition','options',jsonb_build_array('none','routine','heavy','severe')),
      jsonb_build_object('key','severe_pet_mess','type','boolean','label','Severe pet mess / heavy soil'),
      jsonb_build_object('key','severe_odor_smoke','type','boolean','label','Severe odor / smoke neutralization required'),
      jsonb_build_object('key','square_footage','type','number','label','Approximate square footage'),
      jsonb_build_object('key','scope_summary','type','text','label','Scope summary')
    ),
    'companion_lines', jsonb_build_array(
      jsonb_build_object('sku','DNI-01A-036','label','Specialized Carpet Fiber Extraction Add-on','component_role','COMPANION'),
      jsonb_build_object('sku','DNI-01A-041','label','Abandoned Property & Furniture / Debris Support','component_role','COMPANION'),
      jsonb_build_object('sku','DNI-01A-020','label','Interior Appliance Deep-Detail Add-on','component_role','COMPANION'),
      jsonb_build_object('sku','DNI-01A-025','label','High-Reach Dust & Cobweb Detail Add-on','component_role','COMPANION')
    )
  ),
    quote_engine_version='2026-09-20-cleaning-package-v1'
where sku in ('DNI-01A-001','DNI-01A-002') and is_active=true;

update public.services
set quote_input_schema = jsonb_build_object(
    'version','2026-09-20-cleaning-package-v1',
    'ui_mode','SPECIALIZED_CLEANING',
    'pricing_model','FIXED_SCOPE',
    'fields', jsonb_build_array(
      jsonb_build_object('key','bedroom_count','type','select','label','Bedrooms','options',jsonb_build_array('studio','1','2','3','4+')),
      jsonb_build_object('key','bathroom_count','type','select','label','Bathrooms','options',jsonb_build_array('1','2','3','4+')),
      jsonb_build_object('key','layout_type','type','select','label','Layout environment','options',jsonb_build_array('apartment','townhome','single_family_home','commercial_unit')),
      jsonb_build_object('key','occupancy','type','select','label','Occupancy','options',jsonb_build_array('vacant','occupied')),
      jsonb_build_object('key','mess_degree','type','select','label','Degree of mess','options',jsonb_build_array('standard','moderate','heavy','severe')),
      jsonb_build_object('key','odor_level','type','select','label','Odor level','options',jsonb_build_array('none','light','heavy','severe')),
      jsonb_build_object('key','pet_condition','type','select','label','Pet condition','options',jsonb_build_array('none','routine','heavy','severe')),
      jsonb_build_object('key','severe_pet_mess','type','boolean','label','Severe pet mess / heavy soil'),
      jsonb_build_object('key','severe_odor_smoke','type','boolean','label','Severe odor / smoke neutralization required'),
      jsonb_build_object('key','square_footage','type','number','label','Approximate square footage'),
      jsonb_build_object('key','scope_summary','type','text','label','Scope summary')
    ),
    'companion_lines', jsonb_build_array(
      jsonb_build_object('sku','DNI-01A-036','label','Specialized Carpet Fiber Extraction Add-on','component_role','COMPANION'),
      jsonb_build_object('sku','DNI-01A-041','label','Abandoned Property & Furniture / Debris Support','component_role','COMPANION'),
      jsonb_build_object('sku','DNI-01A-020','label','Interior Appliance Deep-Detail Add-on','component_role','COMPANION'),
      jsonb_build_object('sku','DNI-01A-025','label','High-Reach Dust & Cobweb Detail Add-on','component_role','COMPANION')
    )
  ),
    quote_engine_version='2026-09-20-cleaning-package-v1'
where sku in ('DNI-01A-004','DNI-01A-005','DNI-01A-007','DNI-01A-009','DNI-01A-010','DNI-01A-020','DNI-01A-021','DNI-01A-022','DNI-01A-023','DNI-01A-024','DNI-01A-025','DNI-01A-029','DNI-01A-033','DNI-01A-036','DNI-01A-037','DNI-01A-038','DNI-01A-041','DNI-01A-042')
  and is_active=true
  and quote_input_schema is null;

commit;
