-- DANI DECLARES: cleaning quote contracts for the package composer.
-- Input contracts only. Pricing remains governed by existing rules.
begin;

update public.services
set quote_input_schema=jsonb_build_object(
 'version','2026-09-20-cleaning-package-v1','ui_mode','SPECIALIZED_CLEANING','pricing_model','FIXED_SCOPE',
 'fields',jsonb_build_array(
  jsonb_build_object('key','bedroom_count','type','select','label','Bedrooms','options',jsonb_build_array('studio','1','2','3','4+'),'classification','SCOPE'),
  jsonb_build_object('key','bathroom_count','type','select','label','Bathrooms','options',jsonb_build_array('1','2','3','4+'),'classification','SCOPE'),
  jsonb_build_object('key','layout_type','type','select','label','Layout environment','options',jsonb_build_array('apartment','townhome','single_family_home','commercial_unit'),'classification','SCOPE'),
  jsonb_build_object('key','occupancy','type','select','label','Occupancy','options',jsonb_build_array('vacant','occupied'),'classification','SCOPE'),
  jsonb_build_object('key','mess_degree','type','select','label','Degree of mess','options',jsonb_build_array('standard','moderate','heavy','severe'),'classification','UNDERWRITING'),
  jsonb_build_object('key','odor_level','type','select','label','Odor level','options',jsonb_build_array('none','light','heavy','severe'),'classification','UNDERWRITING'),
  jsonb_build_object('key','pet_condition','type','select','label','Pet condition','options',jsonb_build_array('none','routine','heavy','severe'),'classification','SCOPE'),
  jsonb_build_object('key','severe_pet_mess','type','boolean','label','Severe pet mess / heavy soil','classification','PRICING_MODIFIER'),
  jsonb_build_object('key','severe_odor_smoke','type','boolean','label','Severe odor / smoke neutralization required','classification','UNDERWRITING'),
  jsonb_build_object('key','square_footage','type','number','label','Approximate square footage','classification','SCOPE'),
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
 ))
,quote_engine_version='2026-09-20-cleaning-package-v1'
where sku in ('DNI-01A-001','DNI-01A-002') and is_active=true;

update public.services set quote_input_schema=jsonb_build_object('version','2026-09-20-laundry-v1','ui_mode','SPECIALIZED_CLEANING','pricing_model','FIXED_SCOPE','fields',jsonb_build_array(
 jsonb_build_object('key','load_count','type','number','label','Estimated loads'),
 jsonb_build_object('key','bag_count','type','number','label','Bag / basket count'),
 jsonb_build_object('key','soil_level','type','select','label','Soil level','options',jsonb_build_array('standard','heavy','severe')),
 jsonb_build_object('key','special_fabrics','type','boolean','label','Special fabrics / care instructions'),
 jsonb_build_object('key','turnaround','type','select','label','Turnaround','options',jsonb_build_array('standard','rush')),
 jsonb_build_object('key','scope_summary','type','text','label','Scope summary')
)) where sku='DNI-01A-004' and is_active=true and quote_input_schema is null;

update public.services set quote_input_schema=jsonb_build_object('version','2026-09-20-linen-v1','ui_mode','SPECIALIZED_CLEANING','pricing_model','FIXED_SCOPE','fields',jsonb_build_array(
 jsonb_build_object('key','bedroom_count','type','number','label','Bedrooms'),
 jsonb_build_object('key','bed_count','type','number','label','Beds'),
 jsonb_build_object('key','linen_type','type','select','label','Linen type','options',jsonb_build_array('standard','premium','specialty')),
 jsonb_build_object('key','reset_level','type','select','label','Reset level','options',jsonb_build_array('standard','deep')),
 jsonb_build_object('key','scope_summary','type','text','label','Scope summary')
)) where sku='DNI-01A-005' and is_active=true and quote_input_schema is null;

update public.services set quote_input_schema=jsonb_build_object('version','2026-09-20-pantry-v1','ui_mode','SPECIALIZED_CLEANING','pricing_model','FIXED_SCOPE','fields',jsonb_build_array(
 jsonb_build_object('key','cabinet_count','type','number','label','Cabinet / pantry sections'),
 jsonb_build_object('key','condition','type','select','label','Condition','options',jsonb_build_array('light','moderate','heavy')),
 jsonb_build_object('key','organization_level','type','select','label','Organization level','options',jsonb_build_array('reset','organize','full_optimization')),
 jsonb_build_object('key','scope_summary','type','text','label','Scope summary')
)) where sku='DNI-01A-007' and is_active=true and quote_input_schema is null;

update public.services set quote_input_schema=jsonb_build_object('version','2026-09-20-carpet-v1','ui_mode','SPECIALIZED_CLEANING','pricing_model','FIXED_SCOPE','fields',jsonb_build_array(
 jsonb_build_object('key','rooms','type','number','label','Rooms / areas'),
 jsonb_build_object('key','square_footage','type','number','label','Approximate carpet square footage'),
 jsonb_build_object('key','carpet_condition','type','select','label','Carpet condition','options',jsonb_build_array('standard','heavy','severe')),
 jsonb_build_object('key','extraction_required','type','boolean','label','Specialized fiber extraction required'),
 jsonb_build_object('key','furniture_moving','type','boolean','label','Furniture moving required'),
 jsonb_build_object('key','scope_summary','type','text','label','Scope summary')
)) where sku='DNI-01A-036' and is_active=true and quote_input_schema is null;

update public.services set quote_input_schema=jsonb_build_object('version','2026-09-20-upholstery-v1','ui_mode','SPECIALIZED_CLEANING','pricing_model','FIXED_SCOPE','fields',jsonb_build_array(
 jsonb_build_object('key','item_count','type','number','label','Item count'),
 jsonb_build_object('key','furniture_type','type','select','label','Furniture type','options',jsonb_build_array('sofa','chair','sectional','mattress','other')),
 jsonb_build_object('key','condition','type','select','label','Condition','options',jsonb_build_array('standard','heavy','severe')),
 jsonb_build_object('key','fabric','type','select','label','Fabric / care','options',jsonb_build_array('standard','delicate','specialty')),
 jsonb_build_object('key','stain_level','type','select','label','Stain level','options',jsonb_build_array('none','light','heavy','severe')),
 jsonb_build_object('key','scope_summary','type','text','label','Scope summary')
)) where sku='DNI-01A-037' and is_active=true and quote_input_schema is null;

update public.services set quote_input_schema=jsonb_build_object('version','2026-09-20-mattress-v1','ui_mode','SPECIALIZED_CLEANING','pricing_model','FIXED_SCOPE','fields',jsonb_build_array(
 jsonb_build_object('key','item_count','type','number','label','Mattress count'),
 jsonb_build_object('key','mattress_size','type','select','label','Mattress size','options',jsonb_build_array('twin','full','queen','king','other')),
 jsonb_build_object('key','condition','type','select','label','Condition','options',jsonb_build_array('standard','heavy','severe')),
 jsonb_build_object('key','odor_level','type','select','label','Odor level','options',jsonb_build_array('none','light','heavy','severe')),
 jsonb_build_object('key','scope_summary','type','text','label','Scope summary')
)) where sku='DNI-01A-038' and is_active=true and quote_input_schema is null;

update public.services set quote_input_schema=jsonb_build_object('version','2026-09-20-disposal-v1','ui_mode','SPECIALIZED_CLEANING','pricing_model','FIXED_SCOPE','fields',jsonb_build_array(
 jsonb_build_object('key','debris_level','type','select','label','Debris volume','options',jsonb_build_array('none','light','substantial')),
 jsonb_build_object('key','furniture_count','type','number','label','Furniture / large-item count'),
 jsonb_build_object('key','disposal_required','type','boolean','label','Off-site disposal required'),
 jsonb_build_object('key','access','type','select','label','Access','options',jsonb_build_array('easy','stairs','long_carry','restricted')),
 jsonb_build_object('key','scope_summary','type','text','label','Scope summary')
)) where sku='DNI-01A-041' and is_active=true and quote_input_schema is null;

update public.services set quote_input_schema=jsonb_build_object('version','2026-09-20-severe-pet-v1','ui_mode','SPECIALIZED_CLEANING','pricing_model','FIXED_SCOPE','fields',jsonb_build_array(
 jsonb_build_object('key','bedroom_count','type','select','label','Bedrooms','options',jsonb_build_array('studio','1','2','3','4+')),
 jsonb_build_object('key','bathroom_count','type','select','label','Bathrooms','options',jsonb_build_array('1','2','3','4+')),
 jsonb_build_object('key','pet_mess_level','type','select','label','Pet mess level','options',jsonb_build_array('heavy','severe')),
 jsonb_build_object('key','odor_level','type','select','label','Odor level','options',jsonb_build_array('none','light','heavy','severe')),
 jsonb_build_object('key','biohazard_concern','type','boolean','label','Potential biohazard / specialty remediation concern'),
 jsonb_build_object('key','square_footage','type','number','label','Approximate square footage'),
 jsonb_build_object('key','scope_summary','type','text','label','Scope summary')
)) where sku='DNI-01A-042' and is_active=true and quote_input_schema is null;

commit;
