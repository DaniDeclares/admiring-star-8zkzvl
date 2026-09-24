
drop view public.dd_service_release_contract_v1;
create view public.dd_service_release_contract_v1 with(security_invoker=true) as
with offer_rollup as (
 select o.canonical_sku,max(o.service_name) filter(where o.commercial_offer_status='SELL_NOW') service_name,max(o.division) division,
 count(distinct o.runtime_service_id) filter(where o.runtime_service_id is not null) runtime_id_count,
 (array_agg(o.runtime_service_id) filter(where o.runtime_service_id is not null))[1] runtime_service_id,
 bool_or(o.commercial_offer_status='SELL_NOW') has_sell_now,bool_or(o.commercial_offer_status='DO_NOT_SELL') has_do_not_sell
 from public.dd_governed_service_offers o group by o.canonical_sku
),
channel_rollup as (
 select service_id,count(*) filter(where eligibility_status in('ACTIVE','ELIGIBLE','QUOTE_REQUIRED')) authorized_channel_count,
 count(*) filter(where eligibility_status in('ACTIVE','ELIGIBLE')) direct_channel_count
 from public.dd_service_channel_availability group by service_id
),
pricing_rollup as (
 select service_id,count(*) filter(where status='ACTIVE' and lock_status='LOCKED') locked_active_rule_count,
 count(*) filter(where status='PENDING_RECONCILIATION' or lock_status<>'LOCKED') unresolved_rule_count
 from public.dd_service_pricing_rules group by service_id
),
fulfillment_rollup as (
 select service_id,count(*) filter(where required=true) required_requirement_count from public.dd_service_requirements group by service_id
),
provider_rollup as (
 select service_id,count(*) provider_capability_count from public.dd_provider_capabilities group by service_id
),
routing_rollup as (select service_id,count(*) routing_count from private.dd_work_order_routing group by service_id),
task_rollup as (select service_id,count(*) active_task_template_count from public.dd_task_templates where is_active=true group by service_id),
stripe_rollup as (
 select r.canonical_sku,bool_or(r.stripe_payment_link_id is not null) has_payment_link,bool_or(r.stripe_price_id is not null) has_stripe_price,
 bool_or(r.activation_decision in('ACTIVATE','ACTIVE')) stripe_register_authorized
 from public.dd_stripe_launch_register r group by r.canonical_sku
),
sync_rollup as (select canonical_sku,bool_or(stripe_livemode=true and sync_status='SYNCED_ACTIVE') stripe_sync_active from public.dd_stripe_catalog_sync group by canonical_sku)
select
 o.canonical_sku,o.service_name,o.division,s.id runtime_service_id,s.service_family,s.name runtime_service_name,s.description,s.pricing_type,s.billing_cycle,s.resident_discount_eligible,s.pricing_engine_code,
 coalesce(p.locked_active_rule_count,0) locked_active_rule_count,coalesce(p.unresolved_rule_count,0) unresolved_rule_count,
 coalesce(c.authorized_channel_count,0) authorized_channel_count,coalesce(c.direct_channel_count,0) direct_channel_count,
 coalesce(f.required_requirement_count,0) required_requirement_count,coalesce(pr.provider_capability_count,0) provider_capability_count,
 coalesce(r.routing_count,0) routing_count,coalesce(t.active_task_template_count,0) active_task_template_count,
 coalesce(sr.has_payment_link,false) has_payment_link,coalesce(sr.has_stripe_price,false) has_stripe_price,coalesce(sr.stripe_register_authorized,false) stripe_register_authorized,coalesce(ss.stripe_sync_active,false) stripe_sync_active,
 coalesce(v.stripe_price_verified_at is not null,false) stripe_price_verified,coalesce(v.payment_path_verified_at is not null,false) payment_path_verified,coalesce(v.runtime_verified_at is not null,false) runtime_verified,coalesce(v.regression_verified_at is not null,false) regression_verified,coalesce(v.production_smoke_verified_at is not null,false) production_smoke_verified,
 coalesce(pp.initial_payment_percent,0) initial_payment_percent,
 (o.runtime_id_count=1 and o.runtime_service_id is not null and s.is_active and s.sku=o.canonical_sku) canonical_identity_ok,
 (nullif(trim(coalesce(o.service_name,'')),'') is not null and nullif(trim(coalesce(s.description,'')),'') is not null and nullif(trim(coalesce(s.pricing_type,'')),'') is not null and nullif(trim(coalesce(s.billing_cycle,'')),'') is not null and s.resident_discount_eligible is not null and o.has_sell_now) commercial_definition_ok,
 (s.pricing_engine_code is not null and exists(select 1 from public.dd_pricing_engines e where e.engine_code=s.pricing_engine_code and e.is_active) and coalesce(p.locked_active_rule_count,0)>0 and coalesce(p.unresolved_rule_count,0)=0) pricing_engine_ok,
 ((s.pricing_type='FIXED' and coalesce(p.locked_active_rule_count,0)>0) or (s.quote_input_schema is not null and jsonb_typeof(s.quote_input_schema)='object')) quote_path_ok,
 (coalesce(c.authorized_channel_count,0)>0 and coalesce(c.direct_channel_count,0)>0) channel_authorization_ok,
 (coalesce(f.required_requirement_count,0)>0 and coalesce(pr.provider_capability_count,0)>0) fulfillment_matrix_ok,
 (case when s.pricing_type in('BESPOKE_SOW','SOW','SOW_PROCUREMENT','QUOTE','STARTING_AT','CONFIGURED','VARIABLE_QUOTE') or s.starting_price is null
   then coalesce(v.payment_path_verified_at is not null,false) and coalesce(pp.initial_payment_percent,0)=53.50
   else coalesce(sr.has_payment_link,false) and coalesce(sr.has_stripe_price,false) and coalesce(sr.stripe_register_authorized,false) and coalesce(ss.stripe_sync_active,false) and coalesce(v.stripe_price_verified_at is not null,false) end) payment_ledger_ok,
 (coalesce(v.runtime_verified_at is not null,false) and coalesce(v.production_smoke_verified_at is not null,false)) runtime_accuracy_ok,
 case
  when o.has_do_not_sell and not o.has_sell_now then 'BLOCKED'
  when not(o.runtime_id_count=1 and o.runtime_service_id is not null and s.is_active and s.sku=o.canonical_sku) then 'CANONICAL_IDENTITY'
  when not(nullif(trim(coalesce(o.service_name,'')),'') is not null and nullif(trim(coalesce(s.description,'')),'') is not null and nullif(trim(coalesce(s.pricing_type,'')),'') is not null and nullif(trim(coalesce(s.billing_cycle,'')),'') is not null and s.resident_discount_eligible is not null and o.has_sell_now) then 'COMMERCIAL_DEFINITION'
  when not(s.pricing_engine_code is not null and exists(select 1 from public.dd_pricing_engines e where e.engine_code=s.pricing_engine_code and e.is_active) and coalesce(p.locked_active_rule_count,0)>0 and coalesce(p.unresolved_rule_count,0)=0) then 'PRICING_ENGINE'
  when not((s.pricing_type='FIXED' and coalesce(p.locked_active_rule_count,0)>0) or (s.quote_input_schema is not null and jsonb_typeof(s.quote_input_schema)='object')) then 'QUOTE_PATH'
  when not(coalesce(c.authorized_channel_count,0)>0 and coalesce(c.direct_channel_count,0)>0) then 'CHANNEL_AUTHORIZATION'
  when not(coalesce(f.required_requirement_count,0)>0 and coalesce(pr.provider_capability_count,0)>0) then 'FULFILLMENT_MATRIX'
  when not((case when s.pricing_type in('BESPOKE_SOW','SOW','SOW_PROCUREMENT','QUOTE','STARTING_AT','CONFIGURED','VARIABLE_QUOTE') or s.starting_price is null then coalesce(v.payment_path_verified_at is not null,false) and coalesce(pp.initial_payment_percent,0)=53.50 else coalesce(sr.has_payment_link,false) and coalesce(sr.has_stripe_price,false) and coalesce(sr.stripe_register_authorized,false) and coalesce(ss.stripe_sync_active,false) and coalesce(v.stripe_price_verified_at is not null,false) end)) then 'PAYMENT_LEDGER'
  when not(coalesce(v.runtime_verified_at is not null,false) and coalesce(v.production_smoke_verified_at is not null,false)) then 'RUNTIME_ACCURACY'
  when not coalesce(v.regression_verified_at is not null,false) then 'REGRESSION_VERIFIED'
  else 'NONE'
 end blocking_gate,
 case
  when o.has_do_not_sell and not o.has_sell_now then 'BLOCKED'
  when o.runtime_id_count=1 and o.runtime_service_id is not null and s.is_active and s.sku=o.canonical_sku
   and nullif(trim(coalesce(o.service_name,'')),'') is not null and nullif(trim(coalesce(s.description,'')),'') is not null
   and nullif(trim(coalesce(s.pricing_type,'')),'') is not null and nullif(trim(coalesce(s.billing_cycle,'')),'') is not null and s.resident_discount_eligible is not null and o.has_sell_now
   and s.pricing_engine_code is not null and exists(select 1 from public.dd_pricing_engines e where e.engine_code=s.pricing_engine_code and e.is_active)
   and coalesce(p.locked_active_rule_count,0)>0 and coalesce(p.unresolved_rule_count,0)=0
   and ((s.pricing_type='FIXED' and coalesce(p.locked_active_rule_count,0)>0) or (s.quote_input_schema is not null and jsonb_typeof(s.quote_input_schema)='object'))
   and coalesce(c.authorized_channel_count,0)>0 and coalesce(c.direct_channel_count,0)>0
   and coalesce(f.required_requirement_count,0)>0 and coalesce(pr.provider_capability_count,0)>0
   and (case when s.pricing_type in('BESPOKE_SOW','SOW','SOW_PROCUREMENT','QUOTE','STARTING_AT','CONFIGURED','VARIABLE_QUOTE') or s.starting_price is null then coalesce(v.payment_path_verified_at is not null,false) and coalesce(pp.initial_payment_percent,0)=53.50 else coalesce(sr.has_payment_link,false) and coalesce(sr.has_stripe_price,false) and coalesce(sr.stripe_register_authorized,false) and coalesce(ss.stripe_sync_active,false) and coalesce(v.stripe_price_verified_at is not null,false) end)
   and coalesce(v.runtime_verified_at is not null,false) and coalesce(v.production_smoke_verified_at is not null,false) and coalesce(v.regression_verified_at is not null,false)
   then 'LIVE_READY' else 'HOLD' end release_state
from offer_rollup o
left join public.services s on s.id=o.runtime_service_id
left join pricing_rollup p on p.service_id=s.id
left join channel_rollup c on c.service_id=s.id
left join fulfillment_rollup f on f.service_id=s.id
left join provider_rollup pr on pr.service_id=s.id
left join routing_rollup r on r.service_id=s.id
left join task_rollup t on t.service_id=s.id
left join stripe_rollup sr on sr.canonical_sku=o.canonical_sku
left join sync_rollup ss on ss.canonical_sku=o.canonical_sku
left join public.dd_service_release_verifications v on v.canonical_sku=o.canonical_sku
left join public.dd_service_payment_policy pp on pp.policy_key='DEFAULT' and pp.is_active;
grant select on public.dd_service_release_contract_v1 to authenticated, service_role;

insert into public.dd_service_release_verifications(canonical_sku,stripe_price_verified_at,verification_commit_sha,notes)
values('DNI-01A-001',now(),'stripe-live-2026-09-20','Verified live Stripe product, active $140.00 USD price, and active payment link against DANI SKU DNI-01A-001; runtime/regression gates remain open.')
on conflict(canonical_sku) do update set stripe_price_verified_at=excluded.stripe_price_verified_at,verification_commit_sha=excluded.verification_commit_sha,notes=excluded.notes,updated_at=now();
