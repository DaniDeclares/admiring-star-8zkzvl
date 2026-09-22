-- CH05 credentialed/document service economics foundation
-- Additive only: preserves service descriptions/pricing and does not activate Stripe.
with comps as (
  insert into public.dd_service_components
    (component_code,component_name,description,unit_type,cost_category,tax_classification,default_fulfillment_mode,is_active,metadata)
  values
  ('NOTARY_OPERATIONS_LABOR_HOUR','Notary operations labor — build phase','Build-phase planning labor component for credentialed notarial/document services.','HOUR','LABOR','SERVICE','ADMINISTRATIVE',true,'{"evidence_status":"RESEARCH_BENCHMARK","build_phase_only":true,"authority_note":"Customer price is not the statutory notarial fee."}'::jsonb),
  ('LOAN_SIGNING_OPERATIONS_LABOR_HOUR','Loan signing operations labor — build phase','Build-phase planning labor component for signing-agent assignments; state/title/attorney restrictions are separate gates.','HOUR','LABOR','SERVICE','ADMINISTRATIVE',true,'{"evidence_status":"RESEARCH_BENCHMARK","build_phase_only":true,"authority_note":"No legal-document explanation or closing authority implied."}'::jsonb),
  ('NOTARY_FIELD_TRAVEL_MILE','Notary field travel mileage cost','Mileage cost component for mobile notary work; actual job mileage becomes future calibration source.','MILE','TRAVEL','SERVICE','LOGISTICS',true,'{"current_cost_basis":"IRS 2026 mileage benchmark 0.76 USD/mile effective Jul 1-Dec 31 2026","evidence_status":"EXTERNAL_AUTHORITY"}'::jsonb),
  ('DOCUMENT_RETURN_HANDLING','Document return / package handling','Administrative handling for scanback, packaging, routing and return coordination.','ITEM','DIRECT','SERVICE','ADMINISTRATIVE',true,'{"evidence_status":"RESEARCH_BENCHMARK","build_phase_only":true}'::jsonb),
  ('APOSTILLE_COORDINATION_ADMIN','Apostille/authentication coordination administration','Administrative coordination of state authentication/apostille submissions; government fees are pass-through/reference amounts.','ITEM','DIRECT','SERVICE','ADMINISTRATIVE',true,'{"evidence_status":"EXTERNAL_AUTHORITY","build_phase_only":true}'::jsonb)
  on conflict (component_code) do update set description=excluded.description,metadata=excluded.metadata,is_active=true,updated_at=now()
  returning id,component_code
),
svc as (
  select id,sku,
    case when sku in ('DNI-05A-008','DNI-05A-009','DNI-05A-021','DNI-05A-022','DNI-05A-023','DNI-05A-024') then 'LOAN_SIGNING_OPERATIONS_LABOR_HOUR'
         when sku='DNI-05A-025' then 'APOSTILLE_COORDINATION_ADMIN'
         when sku in ('DNI-05A-018','DNI-05A-019') then 'DOCUMENT_RETURN_HANDLING'
         else 'NOTARY_OPERATIONS_LABOR_HOUR' end component_code
  from public.services where sku like 'DNI-05A-%' and sku<>'DNI-05A-007'
),
map_primary as (
  insert into public.dd_service_package_components
  (service_id,component_id,component_role,included_quantity,is_required,is_optional,fulfillment_mode,sort_order,is_active,metadata)
  select s.id,c.id,'PRIMARY_OPERATION',1,true,false,'ADMINISTRATIVE',1,true,
    jsonb_build_object('evidence_status','RESEARCH_BENCHMARK','build_phase_only',true,'jurisdiction_gate','GA_OR_SC_COMMISSIONS')
  from svc s join comps c on c.component_code=s.component_code
  where not exists (select 1 from public.dd_service_package_components x where x.service_id=s.id and x.component_id=c.id and x.is_active)
  returning service_id
),
travel as (
  insert into public.dd_service_package_components
  (service_id,component_id,component_role,included_quantity,quantity_input_key,is_required,is_optional,fulfillment_mode,sort_order,is_active,metadata)
  select s.id,c.id,'TRAVEL',0,'miles',false,true,'LOGISTICS',2,true,jsonb_build_object('evidence_status','EXTERNAL_AUTHORITY','current_cost_benchmark_per_mile',0.76)
  from public.services s join comps c on c.component_code='NOTARY_FIELD_TRAVEL_MILE'
  where s.sku='DNI-05A-016'
    and not exists (select 1 from public.dd_service_package_components x where x.service_id=s.id and x.component_id=c.id and x.is_active)
  returning service_id
),
rules as (
  insert into public.dd_owner_compensation_rules
  (owner_user_id,service_id,component_id,compensation_type,rate_amount,currency,evidence_status,source_reference,status,effective_from,metadata)
  select 'f88a5b79-ac5a-4690-ac28-62312328cb73',s.id,c.id,'HOURLY',
    case when c.component_code='LOAN_SIGNING_OPERATIONS_LABOR_HOUR' then 90 else 75 end,
    'USD','RESEARCH_BENCHMARK','build_phase_service_economics_assumption','ACTIVE',now(),
    jsonb_build_object('not_actual_job_cost',true,'requires_live_calibration',true,'jurisdiction_gate','GA_OR_SC')
  from svc s join comps c on c.component_code=s.component_code
  where not exists (select 1 from public.dd_owner_compensation_rules x where x.owner_user_id='f88a5b79-ac5a-4690-ac28-62312328cb73' and x.service_id=s.id and x.component_id=c.id and x.status='ACTIVE')
  returning service_id
),
policies as (
  insert into public.dd_economic_policies
  (policy_key,channel_code,service_id,minimum_margin_percent,overhead_recovery_percent,payment_processing_percent,working_capital_buffer_percent,evidence_status,status,effective_from,metadata)
  select 'CH05_RESEARCH_UNDERWRITING_'||s.sku,'CH05',s.id,
    case when s.component_code='LOAN_SIGNING_OPERATIONS_LABOR_HOUR' then 25 else 20 end,
    15,2.9,0,'RESEARCH_BENCHMARK','ACTIVE',now(),
    jsonb_build_object('build_phase_only',true,'not_actual_job_cost',true,'statutory_fee_separate_from_service_price',true,'GA_SC_state_gate_required',true)
  from svc s
  where not exists (select 1 from public.dd_economic_policies x where x.service_id=s.id and x.status='ACTIVE' and x.evidence_status='RESEARCH_BENCHMARK')
  returning service_id
)
select (select count(*) from comps) components_present,(select count(*) from map_primary) primary_mappings_added,(select count(*) from travel) travel_mappings_added,(select count(*) from rules) owner_rules_added,(select count(*) from policies) policies_added;