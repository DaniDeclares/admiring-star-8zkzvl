-- Division 06 business formation, digital infrastructure, and technical-service
-- economics foundation. Build-phase only; no Stripe creation/activation.
-- Uses existing DANI master-service planning assumptions. Chris project-priced services
-- remain unresolved rather than being assigned an hourly rate.
with comp as (
 insert into public.dd_service_components
 (component_code,component_name,description,unit_type,cost_category,tax_classification,default_fulfillment_mode,is_active,metadata)
 values
 ('D06_STRATEGIC_ADMIN_LABOR_HOUR','D06 strategic/consulting labor — build phase',
  'Build-phase planning labor basis already present in DANI master-service economics.',
  'HOUR','LABOR','SERVICE','ADMINISTRATIVE',true,'{"source":"dd_master_service_universe","planning_rate":90,"not_actual_job_cost":true}'::jsonb),
 ('D06_HANDS_ON_TECH_LABOR_HOUR','D06 hands-on technical setup labor — build phase',
  'Build-phase planning labor basis for D06 configuration/setup services.',
  'HOUR','LABOR','SERVICE','ADMINISTRATIVE',true,'{"source":"dd_master_service_universe","planning_rate":60,"not_actual_job_cost":true}'::jsonb),
 ('D06_THIRD_PARTY_PASS_THROUGH','D06 third-party government/vendor pass-through',
  'Government filing fees, subscriptions, domain registrations, processor fees, and other third-party charges remain separate from DANI service revenue.',
  'ITEM','PASS_THROUGH','SERVICE','ADMINISTRATIVE',true,'{"requires_actual_vendor_charge":true}'::jsonb)
 on conflict (component_code) do update set
  description=excluded.description,metadata=excluded.metadata,is_active=true,updated_at=now()
 returning id,component_code
),
map as (
 insert into public.dd_service_package_components
 (service_id,component_id,component_role,included_quantity,is_required,is_optional,fulfillment_mode,sort_order,is_active,metadata)
 select s.id,c.id,'PRIMARY_LABOR',
  case when s.sku in ('DNI-06A-001','DNI-06A-002','DNI-06A-003','DNI-06A-004','DNI-06A-006','DNI-06A-007','DNI-06A-008','DNI-06A-010','DNI-06A-014','DNI-06A-015','DNI-06A-027','DNI-06A-028','DNI-06A-029') 
       then case when s.sku in ('DNI-06A-001') then 2.5 when s.sku='DNI-06A-002' then 3.5 when s.sku in ('DNI-06A-003','DNI-06A-004','DNI-06A-006') then 1.5 when s.sku in ('DNI-06A-007','DNI-06A-008','DNI-06A-010') then 2.0 when s.sku='DNI-06A-014' then 2.0 when s.sku='DNI-06A-015' then 12.0 when s.sku='DNI-06A-027' then 4.0 when s.sku in ('DNI-06A-028','DNI-06A-029') then 3.5 else 1.0 end
       else case when s.sku='DNI-06A-005' then 1.0 when s.sku='DNI-06A-009' then 1.0 when s.sku in ('DNI-06A-011','DNI-06A-012','DNI-06A-013') then case when s.sku='DNI-06A-011' then 2.0 when s.sku='DNI-06A-012' then 1.0 else 1.5 end when s.sku='DNI-06A-018' then 1.0 when s.sku='DNI-06A-019' then 1.0 when s.sku='DNI-06A-020' then 3.5 else null end end,
 true,false,'ADMINISTRATIVE',1,true,
 jsonb_build_object('evidence_status','OWNER_CONFIRMED','source','dd_master_service_universe','build_phase_only',true)
 from public.services s
 join comp c on c.component_code=case
   when s.sku in ('DNI-06A-001','DNI-06A-002','DNI-06A-003','DNI-06A-004','DNI-06A-005','DNI-06A-006','DNI-06A-007','DNI-06A-008','DNI-06A-009','DNI-06A-010','DNI-06A-014','DNI-06A-015','DNI-06A-027','DNI-06A-028','DNI-06A-029') then 'D06_STRATEGIC_ADMIN_LABOR_HOUR'
   when s.sku in ('DNI-06A-011','DNI-06A-012','DNI-06A-013','DNI-06A-018','DNI-06A-019','DNI-06A-020') then 'D06_HANDS_ON_TECH_LABOR_HOUR' end
 where s.sku like 'DNI-06A-%'
 and s.sku not in ('DNI-06A-016','DNI-06A-017','DNI-06A-021','DNI-06A-022','DNI-06A-023','DNI-06A-024','DNI-06A-025','DNI-06A-026')
 and not exists(select 1 from public.dd_service_package_components x where x.service_id=s.id and x.component_id=c.id and x.is_active)
 returning service_id
),
rules as (
 insert into public.dd_owner_compensation_rules
 (owner_user_id,service_id,component_id,compensation_type,rate_amount,currency,evidence_status,source_reference,status,effective_from,metadata)
 select 'f88a5b79-ac5a-4690-ac28-62312328cb73',s.id,c.id,'HOURLY',
  case when c.component_code='D06_HANDS_ON_TECH_LABOR_HOUR' then 60 else 90 end,
  'USD','OWNER_CONFIRMED','dd_master_service_universe','ACTIVE',now(),
  '{"not_actual_job_cost":true,"build_phase_only":true,"requires_live_calibration":true}'::jsonb
 from public.services s
 join public.dd_service_package_components pc on pc.service_id=s.id and pc.is_active
 join public.dd_service_components c on c.id=pc.component_id
 where s.sku like 'DNI-06A-%' and c.component_code in ('D06_STRATEGIC_ADMIN_LABOR_HOUR','D06_HANDS_ON_TECH_LABOR_HOUR')
 and not exists(select 1 from public.dd_owner_compensation_rules x where x.owner_user_id='f88a5b79-ac5a-4690-ac28-62312328cb73' and x.service_id=s.id and x.component_id=c.id and x.status='ACTIVE')
 returning service_id
),
pol as (
 insert into public.dd_economic_policies
 (policy_key,channel_code,service_id,minimum_margin_percent,overhead_recovery_percent,payment_processing_percent,working_capital_buffer_percent,evidence_status,status,effective_from,metadata)
 select 'D06_RESEARCH_UNDERWRITING_'||s.sku,'CH04',s.id,20,15,2.9,0,'RESEARCH_BENCHMARK','ACTIVE',now(),
 jsonb_build_object('build_phase_only',true,'not_actual_job_cost',true,'division','06')
 from public.services s
 join public.dd_launch_portfolio lp on lp.service_id=s.id and lp.capability_status='VERIFIED'
 where s.sku like 'DNI-06A-%'
 and s.sku not in ('DNI-06A-016','DNI-06A-017','DNI-06A-021','DNI-06A-022','DNI-06A-023','DNI-06A-024','DNI-06A-025','DNI-06A-026')
 and not exists(select 1 from public.dd_economic_policies x where x.service_id=s.id and x.status='ACTIVE' and x.policy_key like 'D06_RESEARCH_%')
 returning service_id
)
select (select count(*) from comp) components_present,(select count(*) from map) package_mappings_added,(select count(*) from rules) owner_rules_added,(select count(*) from pol) policies_added;