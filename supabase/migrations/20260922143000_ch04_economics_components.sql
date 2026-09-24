-- CH04 component economics foundation.
-- Purpose: make existing CH04 administrative service economics machine-readable
-- without changing customer-facing descriptions, existing add-ons, or live Stripe state.
-- Evidence basis: existing DANI master-service labor assumptions from dd_master_service_universe.
-- This migration is additive/idempotent and intentionally leaves provider compensation
-- unresolved for services that currently have an authorized provider route.

with src as (
  select *
  from (values
    ('DNI-04A-001',1.0,75.0),('DNI-04A-002',2.0,75.0),('DNI-04A-003',1.0,75.0),
    ('DNI-04A-004',1.0,75.0),('DNI-04A-005',1.0,75.0),('DNI-04A-006',1.5,75.0),
    ('DNI-04A-007',1.0,75.0),('DNI-04A-008',1.5,75.0),('DNI-04A-009',1.5,90.0),
    ('DNI-04A-010',1.5,90.0),('DNI-04A-011',3.0,90.0),('DNI-04A-012',4.0,90.0),
    ('DNI-04A-013',3.0,90.0),('DNI-04A-014',3.0,90.0),('DNI-04A-015',2.0,75.0),
    ('DNI-04A-016',1.0,75.0),('DNI-04A-017',2.0,75.0),('DNI-04A-018',2.0,75.0),
    ('DNI-04A-019',2.0,90.0),('DNI-04A-020',8.0,90.0)
  ) v(sku,hours,rate)
),
components as (
  insert into public.dd_service_components
  (component_code,component_name,description,unit_type,cost_category,tax_classification,default_fulfillment_mode,is_active,metadata)
  values
  ('ADMIN_OPERATIONS_LABOR_T2_HOUR','Administrative operations labor — Tier 2',
   'Build-phase internal DANI planning labor basis for defined administrative service blocks.',
   'HOUR','LABOR','SERVICE','IN_HOUSE',true,
   '{"evidence_status":"OWNER_CONFIRMED","source":"dd_master_service_universe","build_phase_only":true}'::jsonb),
  ('ADMIN_OPERATIONS_LABOR_T3_HOUR','Administrative operations labor — Tier 3',
   'Build-phase internal DANI planning labor basis for higher-touch administrative/operations service blocks.',
   'HOUR','LABOR','SERVICE','IN_HOUSE',true,
   '{"evidence_status":"OWNER_CONFIRMED","source":"dd_master_service_universe","build_phase_only":true}'::jsonb)
  on conflict (component_code) do update set
    description=excluded.description,metadata=excluded.metadata,is_active=true,updated_at=now()
  returning id,component_code
),
mapped as (
  select s.id,src.sku,src.hours,src.rate,
         case when src.rate=75 then 'ADMIN_OPERATIONS_LABOR_T2_HOUR'
              else 'ADMIN_OPERATIONS_LABOR_T3_HOUR' end component_code
  from public.services s join src on src.sku=s.sku
),
package_rows as (
  insert into public.dd_service_package_components
  (service_id,component_id,component_role,included_quantity,is_required,is_optional,fulfillment_mode,sort_order,is_active,metadata)
  select m.id,c.id,'PRIMARY_LABOR',m.hours,true,false,'IN_HOUSE',1,true,
         jsonb_build_object('evidence_status','OWNER_CONFIRMED','source','dd_master_service_universe','planning_rate',m.rate,'build_phase_only',true)
  from mapped m join components c on c.component_code=m.component_code
  where not exists (
    select 1 from public.dd_service_package_components x
    where x.service_id=m.id and x.component_id=c.id and x.is_active
  )
  returning service_id
),
owner_rows as (
  insert into public.dd_owner_compensation_rules
  (owner_user_id,service_id,component_id,compensation_type,rate_amount,currency,evidence_status,source_reference,status,effective_from,metadata)
  select 'f88a5b79-ac5a-4690-ac28-62312328cb73',m.id,c.id,'HOURLY',m.rate,'USD',
         'OWNER_CONFIRMED','dd_master_service_universe','ACTIVE',now(),
         jsonb_build_object('source_note','Existing DANI master-service labor assumption; build/practice underwriting basis only.')
  from mapped m join components c on c.component_code=m.component_code
  where not exists (
    select 1 from public.dd_owner_compensation_rules x
    where x.owner_user_id='f88a5b79-ac5a-4690-ac28-62312328cb73'
      and x.service_id=m.id and x.component_id=c.id and x.status='ACTIVE'
  )
  returning service_id
),
policy_rows as (
  insert into public.dd_economic_policies
  (policy_key,channel_code,service_id,minimum_margin_percent,overhead_recovery_percent,payment_processing_percent,working_capital_buffer_percent,evidence_status,status,effective_from,metadata)
  select 'CH04_RESEARCH_UNDERWRITING_'||m.sku,'CH04',m.id,20,15,2.9,0,
         'RESEARCH_BENCHMARK','ACTIVE',now(),
         jsonb_build_object('basis','DANI master service labor assumption + current market research','not_actual_job_cost',true,'build_phase_only',true)
  from mapped m
  where not exists (
    select 1 from public.dd_economic_policies x
    where x.service_id=m.id and x.status='ACTIVE'
      and x.evidence_status in ('RESEARCH_BENCHMARK','OWNER_CONFIRMED','DOCUMENT_EVIDENCE','SYSTEM_VERIFIED','EXTERNAL_VERIFIED')
  )
  returning service_id
),
route_rows as (
  insert into public.dd_service_work_order_routing_templates
  (service_id,channel_code,capability_key,selection_policy,routing_instructions,is_active)
  select m.id,'CH04','OWNER_DIRECT_FULFILLMENT','OWNER_FIRST',
         'Route to DANI owner/operator capability for CH04 administrative work when owner fulfillment is authorized; otherwise use governed provider availability and compensation gates.',true
  from mapped m
  where not exists (
    select 1 from public.dd_service_work_order_routing_templates x
    where x.service_id=m.id and x.channel_code='CH04'
      and x.capability_key='OWNER_DIRECT_FULFILLMENT' and x.is_active
  )
  returning service_id
)
select
 (select count(*) from components) components_present,
 (select count(*) from package_rows) package_rows_added,
 (select count(*) from owner_rows) owner_compensation_rows_added,
 (select count(*) from policy_rows) policies_added,
 (select count(*) from route_rows) owner_routes_added;
