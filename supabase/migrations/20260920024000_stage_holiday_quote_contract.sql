-- DANI DECLARES: stage the holiday quote-input contract.
-- This collects underwriting inputs; it does not invent a high-access or
-- procurement surcharge until a governed pricing rule exists.
begin;

update public.services
set quote_input_schema=jsonb_build_object(
 'version','2026-09-20-holiday-design-v1',
 'ui_mode','SPECIALIZED_HOLIDAY',
 'pricing_model','QUOTE_UNDERWRITTEN',
 'fields',jsonb_build_array(
  jsonb_build_object('key','project_type','type','select','label','Project environment','options',jsonb_build_array(
   'residential_interior','residential_exterior','commercial_storefront','corporate_lobby')),
  jsonb_build_object('key','property_type_scale','type','select','label','Property type scale','options',jsonb_build_array(
   'residential','commercial','corporate')),
  jsonb_build_object('key','tree_count','type','number','label','Number of trees'),
  jsonb_build_object('key','tree_height','type','select','label','Tree height','options',jsonb_build_array(
   'under_6ft','6_to_10ft','11_to_15ft','16_to_20ft','over_20ft')),
  jsonb_build_object('key','mantel_count','type','number','label','Mantels / focal areas'),
  jsonb_build_object('key','lighting_scope','type','select','label','Lighting scope','options',jsonb_build_array(
   'none','interior','exterior','both')),
  jsonb_build_object('key','high_access','type','boolean','label','High-access work required'),
  jsonb_build_object('key','power_access','type','select','label','Power source access','options',jsonb_build_array(
   'readily_available','extension_required','specialty_power_review')),
  jsonb_build_object('key','decor_sourcing','type','select','label','Decor sourcing model','options',jsonb_build_array(
   'client_owned_assets_only','dani_full_sourcing_procurement','hybrid_integration')),
  jsonb_build_object('key','installation_required','type','boolean','label','Installation required'),
  jsonb_build_object('key','takedown_required','type','boolean','label','Takedown required'),
  jsonb_build_object('key','storage_required','type','boolean','label','Storage / return handling required'),
  jsonb_build_object('key','materials_cost','type','number','label','Known materials / procurement cost'),
  jsonb_build_object('key','scope_summary','type','text','label','Design / scope summary')
 ),
 'review_flags',jsonb_build_array(
  jsonb_build_object('key','high_access','resolution','SCOPE_REVIEW'),
  jsonb_build_object('key','dani_full_sourcing_procurement','resolution','MATERIALS_CONFIRMATION'),
  jsonb_build_object('key','specialty_power_review','resolution','SCOPE_REVIEW')
 )
),
quote_engine_version='2026-09-20-holiday-design-v1'
where sku='DNI-01F-001' and is_active=true;

commit;
