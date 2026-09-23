
-- Correct extraction BOM duplication: extraction services use extraction consumables, not generic cleaning consumables.
update public.dd_service_package_components pc
set is_active=false,effective_to=now(),updated_at=now()
from public.services s,public.dd_service_components c
where pc.service_id=s.id and pc.component_id=c.id and pc.is_active
  and s.sku in ('DNI-01A-036','DNI-01A-037','DNI-01A-038')
  and c.component_code='CLEANING_CONSUMABLES_JOB';

insert into public.dd_service_components(component_code,component_name,description,unit_type,cost_category,tax_classification,default_fulfillment_mode,is_active,metadata)
values
('DISPOSAL_VENDOR_QUOTE_DOLLAR','Verified disposal/hauling vendor cost','One dollar of verified disposal/hauling pass-through cost from an operator-entered vendor quote','USD','PROCUREMENT','PASS_THROUGH','PROCURED',true,'{"quantity_is_verified_vendor_quote_dollars":true}'),
('STORAGE_VENDOR_QUOTE_DOLLAR','Verified storage vendor cost','One dollar of verified off-site storage/pass-through cost','USD','PROCUREMENT','PASS_THROUGH','PROCURED',true,'{"quantity_is_verified_vendor_quote_dollars":true}')
on conflict(component_code) do update set is_active=true,metadata=excluded.metadata,updated_at=now();

-- Disposal support: DANI coordinates; external hauling/disposal quote is a pass-through procurement cost.
insert into public.dd_service_package_components(service_id,component_id,component_role,included_quantity,quantity_input_key,is_required,is_optional,fulfillment_mode,sort_order,effective_from,is_active,metadata)
select s.id,c.id,'PROCUREMENT',0,'disposal_quote',true,false,'PROCURED',20,'2026-09-22 00:00:00+00',true,'{"quote_must_be_verified":true}'::jsonb
from public.services s cross join public.dd_service_components c
where s.sku='DNI-01A-041' and c.component_code='DISPOSAL_VENDOR_QUOTE_DOLLAR'
on conflict do nothing;

insert into public.dd_component_cost_baselines(component_id,service_id,cost_type,unit_cost,unit_type,evidence_status,source_type,source_reference,effective_from,status,metadata)
select c.id,s.id,'PROCUREMENT',1,'USD','SYSTEM_VERIFIED','QUOTE_INPUT','OPERATOR_VERIFIED_VENDOR_QUOTE','2026-09-22 00:00:00+00','ACTIVE',
       '{"meaning":"multiply $1 by verified vendor quote dollar quantity; no markup embedded"}'::jsonb
from public.services s cross join public.dd_service_components c
where s.sku='DNI-01A-041' and c.component_code='DISPOSAL_VENDOR_QUOTE_DOLLAR';

-- Holiday lighting gets an operator-only labor estimate; unsafe/high-access scope remains provider-only.
update public.services
set quote_input_schema=jsonb_set(
  quote_input_schema,
  '{fields}',
  coalesce(quote_input_schema->'fields','[]'::jsonb) || '[{"key":"hours","type":"number","label":"Estimated installation/removal labor hours","required":true,"classification":"PRICING","operator_only":true}]'::jsonb
)
where sku='DNI-01F-002' and not (quote_input_schema->'fields' @> '[{"key":"hours"}]'::jsonb);

insert into public.dd_service_package_components(service_id,component_id,component_role,included_quantity,quantity_input_key,is_required,is_optional,fulfillment_mode,sort_order,effective_from,is_active,metadata)
select s.id,c.id,'LABOR',1,'hours',true,false,'PROVIDER',10,'2026-09-22 00:00:00+00',true,'{"owner_high_access_not_authorized":true}'::jsonb
from public.services s cross join public.dd_service_components c
where s.sku='DNI-01F-002' and c.component_code='HOLIDAY_DECOR_LABOR_HOUR'
on conflict do nothing;

-- Seasonal storage: handling labor plus verified third-party storage quote.
update public.services set quote_input_schema='{"version":"2026-09-22-seasonal-storage-v1","fields":[{"key":"container_count","type":"number","label":"Bins/containers","required":true,"classification":"SCOPE"},{"key":"storage_months","type":"number","label":"Storage months","required":true,"classification":"SCOPE"},{"key":"hours","type":"number","label":"Estimated handling/rotation hours","required":true,"classification":"PRICING","operator_only":true},{"key":"storage_vendor_quote","type":"number","label":"Verified storage vendor quote","required":true,"classification":"PRICING","operator_only":true}]}'::jsonb
where sku='DNI-01F-005' and quote_input_schema is null;

insert into public.dd_service_package_components(service_id,component_id,component_role,included_quantity,quantity_input_key,is_required,is_optional,fulfillment_mode,sort_order,effective_from,is_active,metadata)
select s.id,c.id,'LABOR',1,'hours',true,false,'PROVIDER',10,'2026-09-22 00:00:00+00',true,'{}'::jsonb
from public.services s cross join public.dd_service_components c
where s.sku='DNI-01F-005' and c.component_code='HOLIDAY_DECOR_LABOR_HOUR'
on conflict do nothing;

insert into public.dd_service_package_components(service_id,component_id,component_role,included_quantity,quantity_input_key,is_required,is_optional,fulfillment_mode,sort_order,effective_from,is_active,metadata)
select s.id,c.id,'PROCUREMENT',0,'storage_vendor_quote',true,false,'PROCURED',20,'2026-09-22 00:00:00+00',true,'{"quote_must_be_verified":true}'::jsonb
from public.services s cross join public.dd_service_components c
where s.sku='DNI-01F-005' and c.component_code='STORAGE_VENDOR_QUOTE_DOLLAR'
on conflict do nothing;

insert into public.dd_component_cost_baselines(component_id,service_id,cost_type,unit_cost,unit_type,evidence_status,source_type,source_reference,effective_from,status,metadata)
select c.id,s.id,'PROCUREMENT',1,'USD','SYSTEM_VERIFIED','QUOTE_INPUT','OPERATOR_VERIFIED_VENDOR_QUOTE','2026-09-22 00:00:00+00','ACTIVE',
       '{"meaning":"multiply $1 by verified vendor quote dollar quantity; no markup embedded"}'::jsonb
from public.services s cross join public.dd_service_components c
where s.sku='DNI-01F-005' and c.component_code='STORAGE_VENDOR_QUOTE_DOLLAR';

-- Holiday provider payout band for setup/takedown/lighting/handling. DANI materials are separate.
insert into public.dd_provider_payout_bands(provider_id,service_id,component_id,compensation_type,initial_offer_amount,target_payout_amount,maximum_payout_amount,equipment_basis,material_basis,evidence_status,source_type,source_reference,escalation_policy,status,effective_from,metadata)
select null,s.id,c.id,'HOURLY',20,25,30,
       case when s.sku='DNI-01F-002' then 'PROVIDER_SUPPLIED' else 'DANI_SUPPLIED' end,
       'DANI_SUPPLIED','RESEARCH_BENCHMARK','WEB_RESEARCH',
       'https://www.career.com/job/two-daughters-design-company/floral-designer/j202609082152509692615',
       '{"mode":"MANUAL","auto_step_up":false}'::jsonb,'ACTIVE','2026-09-22 00:00:00+00',
       '{"benchmarks":"Metro Atlanta seasonal decorator $20-$25/hr; lighting installer market extends higher for height/access","not_a_guarantee":true}'::jsonb
from public.services s cross join public.dd_service_components c
where s.sku in ('DNI-01F-001','DNI-01F-002','DNI-01F-003','DNI-01F-004','DNI-01F-005') and c.component_code='HOLIDAY_DECOR_LABOR_HOUR';

-- Complete provisional policies for lighting/storage that remain quote-driven.
insert into public.dd_economic_policies(policy_key,service_id,minimum_margin_percent,overhead_recovery_percent,payment_processing_percent,evidence_status,status,effective_from,metadata)
select 'WAVE1_HOLIDAY_'||s.sku,s.id,20,15,2.9,'RESEARCH_BENCHMARK','ACTIVE','2026-09-22 00:00:00+00',
       '{"sources":["https://www.angi.com/articles/christmas-decorating-service-cost.htm","https://stripe.com/pricing"],"note":"quote-driven provisional economics"}'::jsonb
from public.services s where s.sku in ('DNI-01F-002','DNI-01F-005')
on conflict(policy_key) do update set minimum_margin_percent=excluded.minimum_margin_percent,overhead_recovery_percent=excluded.overhead_recovery_percent,payment_processing_percent=excluded.payment_processing_percent,evidence_status=excluded.evidence_status,status='ACTIVE',metadata=excluded.metadata,updated_at=now();
