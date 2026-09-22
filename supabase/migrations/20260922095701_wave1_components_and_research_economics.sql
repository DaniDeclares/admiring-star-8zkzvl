
-- Wave-1 reusable component authority.
insert into public.dd_service_components(component_code,component_name,description,unit_type,cost_category,tax_classification,default_fulfillment_mode,is_active,metadata)
values
('CLEANING_LABOR_HOUR','Cleaning fulfillment labor','Hands-on residential cleaning/detail labor','HOUR','LABOR','SERVICE','IN_HOUSE',true,'{"evidence_model":"research_then_actual"}'),
('CLEANING_CONSUMABLES_JOB','Cleaning consumables','Chemicals, cloth wear, liners and ordinary small consumables','JOB','MATERIAL','MATERIAL','PROCURED',true,'{"benchmark_basis":"percentage_of_service_price"}'),
('EXTRACTION_LABOR_HOUR','Extraction/soft-surface labor','Carpet, upholstery and mattress extraction/detail labor','HOUR','LABOR','SERVICE','IN_HOUSE',true,'{"evidence_model":"research_then_actual"}'),
('EXTRACTION_CONSUMABLES_JOB','Extraction consumables','Pretreatment, extraction solution and ordinary consumables','JOB','MATERIAL','MATERIAL','PROCURED',true,'{"benchmark_basis":"percentage_of_service_price"}'),
('HOLIDAY_DECOR_LABOR_HOUR','Holiday decorating labor','Interior seasonal decorating, setup and takedown labor','HOUR','LABOR','SERVICE','IN_HOUSE',true,'{"high_access_excluded":true}'),
('DTF_PRESS_LABOR_ITEM','DTF/heat-press production labor','Align, press, peel, quality check and finish one garment','ITEM','LABOR','SERVICE','IN_HOUSE',true,'{"dani_materials_default":true}'),
('DTF_BLANK_GARMENT','DTF blank garment','Basic blank garment cost benchmark before actual supplier invoice','ITEM','MATERIAL','MATERIAL','PROCURED',true,'{"replace_with_actual_supplier_cost":true}'),
('DTF_TRANSFER','DTF transfer','Outsourced ready-to-press transfer benchmark','ITEM','MATERIAL','MATERIAL','PROCURED',true,'{"replace_with_actual_transfer_cost":true}'),
('DTF_PACKAGING','DTF packaging','Bag/tissue/label ordinary packaging allowance','ITEM','MATERIAL','MATERIAL','PROCURED',true,'{"replace_with_actual_packaging_cost":true}')
on conflict(component_code) do update set
 component_name=excluded.component_name,description=excluded.description,unit_type=excluded.unit_type,cost_category=excluded.cost_category,
 tax_classification=excluded.tax_classification,default_fulfillment_mode=excluded.default_fulfillment_mode,is_active=true,metadata=excluded.metadata,updated_at=now();

-- Ensure null Wave-1 quote schemas collect the quantities economics needs.
update public.services set quote_input_schema='{"version":"2026-09-22-wave1-deep-clean-v1","ui_mode":"SPECIALIZED_CLEANING","fields":[{"key":"bedroom_count","type":"select","label":"Bedrooms","options":["1","2","3","4+"],"required":true,"classification":"SCOPE"},{"key":"bathroom_count","type":"select","label":"Bathrooms","options":["1","2","3","4+"],"required":true,"classification":"SCOPE"},{"key":"square_footage","type":"number","label":"Approximate square footage","required":true,"classification":"SCOPE"},{"key":"mess_degree","type":"select","label":"Degree of buildup","options":["moderate","heavy","severe"],"required":true,"classification":"UNDERWRITING"},{"key":"hours","type":"number","label":"Estimated fulfillment hours","required":true,"classification":"PRICING","operator_only":true},{"key":"miles_one_way","type":"number","label":"Miles one way","classification":"ROUTING"}]}'::jsonb
where sku='DNI-01A-002' and quote_input_schema is null;

update public.services set quote_input_schema='{"version":"2026-09-22-wave1-carpet-v1","fields":[{"key":"room_count","type":"number","label":"Rooms/areas","required":true,"classification":"PRICING"},{"key":"hours","type":"number","label":"Estimated extraction hours","required":true,"classification":"PRICING","operator_only":true},{"key":"soil_level","type":"select","label":"Soil level","options":["standard","heavy","pet"],"classification":"UNDERWRITING"},{"key":"miles_one_way","type":"number","label":"Miles one way","classification":"ROUTING"}]}'::jsonb
where sku='DNI-01A-036' and quote_input_schema is null;

update public.services set quote_input_schema='{"version":"2026-09-22-wave1-upholstery-v1","fields":[{"key":"piece_type","type":"select","label":"Furniture type","options":["chair","ottoman","loveseat","sofa","sectional","other"],"required":true,"classification":"PRICING"},{"key":"quantity","type":"number","label":"Pieces","required":true,"classification":"PRICING"},{"key":"hours","type":"number","label":"Estimated extraction hours","required":true,"classification":"PRICING","operator_only":true},{"key":"fabric_risk","type":"select","label":"Fabric risk","options":["standard","delicate","unknown"],"classification":"UNDERWRITING"}]}'::jsonb
where sku='DNI-01A-037' and quote_input_schema is null;

update public.services set quote_input_schema='{"version":"2026-09-22-wave1-mattress-v1","fields":[{"key":"mattress_size","type":"select","label":"Mattress size","options":["twin","full","queen","king"],"required":true,"classification":"PRICING"},{"key":"quantity","type":"number","label":"Mattresses","required":true,"classification":"PRICING"},{"key":"hours","type":"number","label":"Estimated extraction hours","required":true,"classification":"PRICING","operator_only":true},{"key":"condition","type":"select","label":"Condition","options":["standard","stained","odor"],"classification":"UNDERWRITING"}]}'::jsonb
where sku='DNI-01A-038' and quote_input_schema is null;

update public.services set quote_input_schema='{"version":"2026-09-22-wave1-disposal-v1","fields":[{"key":"load_size","type":"select","label":"Approximate load","options":["single_item","small","quarter_load","half_load","larger"],"required":true,"classification":"PRICING"},{"key":"stairs","type":"boolean","label":"Stairs/long carry","classification":"SCOPE"},{"key":"disposal_quote","type":"number","label":"Verified disposal/hauling quote","classification":"PRICING","operator_only":true},{"key":"miles_one_way","type":"number","label":"Miles one way","classification":"ROUTING"}],"underwriting":{"prohibited":["hazardous_materials","regulated_medical_waste"]}}'::jsonb
where sku='DNI-01A-041' and quote_input_schema is null;

update public.services set quote_input_schema='{"version":"2026-09-22-wave1-pet-mess-v1","ui_mode":"SPECIALIZED_CLEANING","fields":[{"key":"affected_areas","type":"number","label":"Affected rooms/areas","required":true,"classification":"PRICING"},{"key":"hours","type":"number","label":"Estimated fulfillment hours","required":true,"classification":"PRICING","operator_only":true},{"key":"odor_level","type":"select","label":"Odor level","options":["heavy","severe"],"required":true,"classification":"UNDERWRITING"},{"key":"biohazard_concern","type":"boolean","label":"Possible biohazard/unsafe contamination","classification":"UNDERWRITING"},{"key":"miles_one_way","type":"number","label":"Miles one way","classification":"ROUTING"}]}'::jsonb
where sku='DNI-01A-042' and quote_input_schema is null;

update public.services set quote_input_schema='{"version":"2026-09-22-dtf-v1","ui_mode":"APPAREL_PRODUCTION","fields":[{"key":"quantity","type":"number","label":"Garment quantity","min":1,"required":true,"classification":"PRICING"},{"key":"garment_source","type":"select","label":"Garments provided by","options":["dani","customer"],"required":true,"classification":"PRICING"},{"key":"transfer_size","type":"select","label":"Transfer size","options":["left_chest","standard_front","full_front","oversized"],"required":true,"classification":"PRICING"},{"key":"print_locations","type":"number","label":"Print locations per garment","min":1,"required":true,"classification":"PRICING"},{"key":"rush","type":"boolean","label":"Rush production","classification":"PRICING_MODIFIER"}]}'::jsonb
where sku in ('DNI-11A-017','DNI-11A-018') and quote_input_schema is null;

-- Package/BOM mappings.
insert into public.dd_service_package_components(service_id,component_id,component_role,included_quantity,quantity_input_key,is_required,is_optional,fulfillment_mode,sort_order,effective_from,is_active,metadata)
select s.id,c.id,'LABOR',
       case s.sku when 'DNI-01A-001' then 2.25 when 'DNI-01A-002' then 3 when 'DNI-01A-003' then 3.5 when 'DNI-01A-042' then 2 else 1 end,
       case when s.sku in ('DNI-01A-002','DNI-01A-009','DNI-01A-010','DNI-01A-020','DNI-01A-021','DNI-01A-022','DNI-01A-023','DNI-01A-024','DNI-01A-025','DNI-01A-027','DNI-01A-029','DNI-01A-033','DNI-01A-042') then 'hours' else null end,
       true,false,'IN_HOUSE',10,'2026-09-22 00:00:00+00',true,'{"evidence":"RESEARCH_BENCHMARK","wave":1}'::jsonb
from public.services s cross join public.dd_service_components c
where s.service_family='01A Home & Cleaning'
  and s.sku not in ('DNI-01A-036','DNI-01A-037','DNI-01A-038','DNI-01A-041')
  and c.component_code='CLEANING_LABOR_HOUR'
on conflict do nothing;

insert into public.dd_service_package_components(service_id,component_id,component_role,included_quantity,quantity_input_key,is_required,is_optional,fulfillment_mode,sort_order,effective_from,is_active,metadata)
select s.id,c.id,'MATERIAL',1,null,true,false,'PROCURED',20,'2026-09-22 00:00:00+00',true,'{"evidence":"RESEARCH_BENCHMARK","wave":1}'::jsonb
from public.services s cross join public.dd_service_components c
where s.service_family='01A Home & Cleaning' and s.sku<>'DNI-01A-041' and c.component_code='CLEANING_CONSUMABLES_JOB'
on conflict do nothing;

insert into public.dd_service_package_components(service_id,component_id,component_role,included_quantity,quantity_input_key,is_required,is_optional,fulfillment_mode,sort_order,effective_from,is_active,metadata)
select s.id,c.id,'LABOR',1,'hours',true,false,'IN_HOUSE',10,'2026-09-22 00:00:00+00',true,'{"evidence":"RESEARCH_BENCHMARK","wave":1}'::jsonb
from public.services s cross join public.dd_service_components c
where s.sku in ('DNI-01A-036','DNI-01A-037','DNI-01A-038') and c.component_code='EXTRACTION_LABOR_HOUR'
on conflict do nothing;

insert into public.dd_service_package_components(service_id,component_id,component_role,included_quantity,quantity_input_key,is_required,is_optional,fulfillment_mode,sort_order,effective_from,is_active,metadata)
select s.id,c.id,'MATERIAL',1,null,true,false,'PROCURED',20,'2026-09-22 00:00:00+00',true,'{"evidence":"RESEARCH_BENCHMARK","wave":1}'::jsonb
from public.services s cross join public.dd_service_components c
where s.sku in ('DNI-01A-036','DNI-01A-037','DNI-01A-038') and c.component_code='EXTRACTION_CONSUMABLES_JOB'
on conflict do nothing;

insert into public.dd_service_package_components(service_id,component_id,component_role,included_quantity,quantity_input_key,is_required,is_optional,fulfillment_mode,sort_order,effective_from,is_active,metadata)
select s.id,c.id,'LABOR',
       case when s.sku='DNI-01F-001' then 2 else 1 end,
       null,true,false,'IN_HOUSE',10,'2026-09-22 00:00:00+00',true,'{"evidence":"RESEARCH_BENCHMARK","high_access_excluded":true}'::jsonb
from public.services s cross join public.dd_service_components c
where s.sku in ('DNI-01F-001','DNI-01F-003','DNI-01F-004') and c.component_code='HOLIDAY_DECOR_LABOR_HOUR'
on conflict do nothing;

insert into public.dd_service_package_components(service_id,component_id,component_role,included_quantity,quantity_input_key,is_required,is_optional,fulfillment_mode,sort_order,effective_from,is_active,metadata)
select s.id,c.id,'LABOR',1,'quantity',true,false,'IN_HOUSE',10,'2026-09-22 00:00:00+00',true,'{"evidence":"RESEARCH_BENCHMARK","materials_owned_by":"DANI"}'::jsonb
from public.services s cross join public.dd_service_components c
where s.sku in ('DNI-11A-017','DNI-11A-018') and c.component_code='DTF_PRESS_LABOR_ITEM'
on conflict do nothing;

insert into public.dd_service_package_components(service_id,component_id,component_role,included_quantity,quantity_input_key,is_required,is_optional,fulfillment_mode,sort_order,effective_from,is_active,metadata)
select s.id,c.id,'MATERIAL',1,'quantity',true,false,'PROCURED',
       case c.component_code when 'DTF_BLANK_GARMENT' then 20 when 'DTF_TRANSFER' then 30 else 40 end,
       '2026-09-22 00:00:00+00',true,'{"evidence":"RESEARCH_BENCHMARK","materials_owned_by":"DANI"}'::jsonb
from public.services s cross join public.dd_service_components c
where s.sku in ('DNI-11A-017','DNI-11A-018') and c.component_code in ('DTF_BLANK_GARMENT','DTF_TRANSFER','DTF_PACKAGING')
on conflict do nothing;

-- Research-derived cost baselines. Cleaning consumables use the midpoint 3% of service price where a governed base exists.
insert into public.dd_component_cost_baselines(component_id,service_id,cost_type,unit_cost,unit_type,evidence_status,source_type,source_reference,effective_from,status,metadata)
select c.id,s.id,'MATERIAL',
       round(coalesce(s.base_price_cents/100.0,500.0)*0.03,2),'JOB','RESEARCH_BENCHMARK','WEB_RESEARCH',
       'https://debbiesardone.com/cleaning-business-profit-margins-financial-benchmarks/','2026-09-22 00:00:00+00','ACTIVE',
       '{"benchmark":"supplies/equipment 2-4% of revenue; provisional midpoint 3%; replace with DANI actuals"}'::jsonb
from public.services s cross join public.dd_service_components c
where s.service_family='01A Home & Cleaning' and s.sku<>'DNI-01A-041' and c.component_code in ('CLEANING_CONSUMABLES_JOB','EXTRACTION_CONSUMABLES_JOB')
  and ((s.sku in ('DNI-01A-036','DNI-01A-037','DNI-01A-038') and c.component_code='EXTRACTION_CONSUMABLES_JOB')
    or (s.sku not in ('DNI-01A-036','DNI-01A-037','DNI-01A-038') and c.component_code='CLEANING_CONSUMABLES_JOB'));

insert into public.dd_component_cost_baselines(component_id,service_id,cost_type,unit_cost,unit_type,evidence_status,source_type,source_reference,effective_from,status,metadata)
select c.id,s.id,'MATERIAL',
       case c.component_code when 'DTF_BLANK_GARMENT' then 4.00 when 'DTF_TRANSFER' then 2.50 else 0.50 end,
       'ITEM','RESEARCH_BENCHMARK','WEB_RESEARCH',
       case c.component_code when 'DTF_BLANK_GARMENT' then 'https://dtfdatabase.com/blog/dtf-transfer-cost-durability-business-economics-guide/'
            when 'DTF_TRANSFER' then 'https://dtfdatabase.com/blog/dtf-transfer-cost-durability-business-economics-guide/'
            else 'https://priceprofittools.com/tools/dtf-shirt-profit-calculator/' end,
       '2026-09-22 00:00:00+00','ACTIVE',
       '{"provisional":true,"replace_with_actual_supplier_invoice":true}'::jsonb
from public.services s cross join public.dd_service_components c
where s.sku in ('DNI-11A-017','DNI-11A-018') and c.component_code in ('DTF_BLANK_GARMENT','DTF_TRANSFER','DTF_PACKAGING');

-- Owner labor allocation is not owner profit/distribution; it is fair-market fulfillment labor.
insert into public.dd_owner_compensation_rules(owner_user_id,service_id,component_id,compensation_type,rate_amount,currency,evidence_status,source_reference,status,effective_from,metadata)
select ur.user_id,s.id,c.id,'HOURLY',30,'USD','RESEARCH_BENCHMARK',
       'https://www.indeed.com/q-Cleaning-Subcontractor-l-Atlanta%2C-GA-jobs.html','ACTIVE','2026-09-22 00:00:00+00',
       '{"purpose":"owner labor allocation only; separate from DANI retained contribution","benchmark":"Atlanta independent cleaning contractor market"}'::jsonb
from public.dd_portal_user_roles ur cross join public.services s cross join public.dd_service_components c
where ur.role::text='OWNER_OPERATOR' and s.service_family='01A Home & Cleaning'
  and c.component_code in ('CLEANING_LABOR_HOUR','EXTRACTION_LABOR_HOUR')
  and ((s.sku in ('DNI-01A-036','DNI-01A-037','DNI-01A-038') and c.component_code='EXTRACTION_LABOR_HOUR')
    or (s.sku not in ('DNI-01A-036','DNI-01A-037','DNI-01A-038','DNI-01A-041') and c.component_code='CLEANING_LABOR_HOUR'));

insert into public.dd_owner_compensation_rules(owner_user_id,service_id,component_id,compensation_type,rate_amount,currency,evidence_status,source_reference,status,effective_from,metadata)
select ur.user_id,s.id,c.id,'HOURLY',25,'USD','RESEARCH_BENCHMARK',
       'https://www.career.com/job/two-daughters-design-company/floral-designer/j202609082152509692615','ACTIVE','2026-09-22 00:00:00+00',
       '{"purpose":"owner labor allocation only","benchmark":"Metro Atlanta seasonal holiday decorator $20-$25/hr"}'::jsonb
from public.dd_portal_user_roles ur cross join public.services s cross join public.dd_service_components c
where ur.role::text='OWNER_OPERATOR' and s.sku in ('DNI-01F-001','DNI-01F-003','DNI-01F-004') and c.component_code='HOLIDAY_DECOR_LABOR_HOUR';

insert into public.dd_owner_compensation_rules(owner_user_id,service_id,component_id,compensation_type,rate_amount,currency,evidence_status,source_reference,status,effective_from,metadata)
select ur.user_id,s.id,c.id,'PER_GARMENT',2,'USD','RESEARCH_BENCHMARK',
       'https://dtfdatabase.com/blog/dtf-transfer-cost-durability-business-economics-guide/','ACTIVE','2026-09-22 00:00:00+00',
       '{"purpose":"owner labor allocation only","benchmark":"DTF labor $1-$3 per shirt"}'::jsonb
from public.dd_portal_user_roles ur cross join public.services s cross join public.dd_service_components c
where ur.role::text='OWNER_OPERATOR' and s.sku in ('DNI-11A-017','DNI-11A-018') and c.component_code='DTF_PRESS_LABOR_ITEM';

-- Standard provider payout bands: fair researched floor with DANI customer acquisition and materials handled by DANI.
insert into public.dd_provider_payout_bands(provider_id,service_id,component_id,compensation_type,initial_offer_amount,target_payout_amount,maximum_payout_amount,equipment_basis,material_basis,evidence_status,source_type,source_reference,escalation_policy,status,effective_from,metadata)
select null,s.id,c.id,'HOURLY',22,25,30,'DANI_SUPPLIED','DANI_SUPPLIED','RESEARCH_BENCHMARK','WEB_RESEARCH',
       'https://www.cleaningdayco.com/careers','{"mode":"MANUAL","auto_step_up":false}'::jsonb,'ACTIVE','2026-09-22 00:00:00+00',
       '{"benchmark_note":"DANI-supplied cleaning resources; compared with Atlanta $22/hr supplied-resource employee and ~$30/hr independent contractor benchmarks","not_a_guarantee":true}'::jsonb
from public.services s cross join public.dd_service_components c
where s.service_family='01A Home & Cleaning' and s.sku<>'DNI-01A-041'
and ((s.sku in ('DNI-01A-036','DNI-01A-037','DNI-01A-038') and c.component_code='EXTRACTION_LABOR_HOUR')
  or (s.sku not in ('DNI-01A-036','DNI-01A-037','DNI-01A-038') and c.component_code='CLEANING_LABOR_HOUR'));

insert into public.dd_provider_payout_bands(provider_id,service_id,component_id,compensation_type,initial_offer_amount,target_payout_amount,maximum_payout_amount,equipment_basis,material_basis,evidence_status,source_type,source_reference,escalation_policy,status,effective_from,metadata)
select null,s.id,c.id,'PER_GARMENT',1.50,2.00,3.00,'PROVIDER_SUPPLIED','DANI_SUPPLIED','RESEARCH_BENCHMARK','WEB_RESEARCH',
       'https://dtfdatabase.com/blog/dtf-transfer-cost-durability-business-economics-guide/','{"mode":"MANUAL","auto_step_up":false}'::jsonb,'ACTIVE','2026-09-22 00:00:00+00',
       '{"benchmark_note":"DANI owns/provides blanks and transfers; band compensates press/QC labor and provider heat-press use","not_a_guarantee":true}'::jsonb
from public.services s cross join public.dd_service_components c
where s.sku in ('DNI-11A-017','DNI-11A-018') and c.component_code='DTF_PRESS_LABOR_ITEM';

-- Provisional service economics policies; replace with DANI actual P&L as soon as available.
insert into public.dd_economic_policies(policy_key,service_id,minimum_margin_percent,overhead_recovery_percent,payment_processing_percent,evidence_status,status,effective_from,metadata)
select 'WAVE1_CLEANING_'||s.sku,s.id,20,15,2.9,'RESEARCH_BENCHMARK','ACTIVE','2026-09-22 00:00:00+00',
       '{"sources":["https://www.getbidclean.com/blog/how-to-calculate-cleaning-business-overhead-profit-margin-2026-guide","https://stripe.com/pricing"],"note":"15% overhead + 20% contribution/net planning floor; provisional"}'::jsonb
from public.services s where s.service_family='01A Home & Cleaning'
on conflict(policy_key) do update set minimum_margin_percent=excluded.minimum_margin_percent,overhead_recovery_percent=excluded.overhead_recovery_percent,payment_processing_percent=excluded.payment_processing_percent,evidence_status=excluded.evidence_status,status='ACTIVE',metadata=excluded.metadata,updated_at=now();

insert into public.dd_economic_policies(policy_key,service_id,minimum_margin_percent,overhead_recovery_percent,payment_processing_percent,evidence_status,status,effective_from,metadata)
select 'WAVE1_HOLIDAY_'||s.sku,s.id,20,15,2.9,'RESEARCH_BENCHMARK','ACTIVE','2026-09-22 00:00:00+00',
       '{"sources":["https://www.angi.com/articles/christmas-decorating-service-cost.htm","https://stripe.com/pricing"],"note":"provisional until DANI actual holiday job data exists"}'::jsonb
from public.services s where s.sku in ('DNI-01F-001','DNI-01F-003','DNI-01F-004')
on conflict(policy_key) do update set minimum_margin_percent=excluded.minimum_margin_percent,overhead_recovery_percent=excluded.overhead_recovery_percent,payment_processing_percent=excluded.payment_processing_percent,evidence_status=excluded.evidence_status,status='ACTIVE',metadata=excluded.metadata,updated_at=now();

insert into public.dd_economic_policies(policy_key,service_id,minimum_margin_percent,overhead_recovery_percent,payment_processing_percent,evidence_status,status,effective_from,metadata)
select 'WAVE1_DTF_'||s.sku,s.id,40,10,2.9,'RESEARCH_BENCHMARK','ACTIVE','2026-09-22 00:00:00+00',
       '{"sources":["https://dtfdatabase.com/blog/dtf-transfer-cost-durability-business-economics-guide/","https://stripe.com/pricing"],"note":"DTF research shows 50-75% gross margin; DANI provisional retained contribution floor set lower at 40% pending actuals"}'::jsonb
from public.services s where s.sku in ('DNI-11A-017','DNI-11A-018')
on conflict(policy_key) do update set minimum_margin_percent=excluded.minimum_margin_percent,overhead_recovery_percent=excluded.overhead_recovery_percent,payment_processing_percent=excluded.payment_processing_percent,evidence_status=excluded.evidence_status,status='ACTIVE',metadata=excluded.metadata,updated_at=now();
