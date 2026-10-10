
create or replace view public.dd_service_economics_authority_v1 as
with package as (
  select pc.service_id,
    count(*) filter(where pc.is_active) package_component_count,
    count(*) filter(where pc.is_active and c.cost_category='LABOR') labor_component_count,
    count(*) filter(where pc.is_active and c.cost_category in ('MATERIAL','PROCUREMENT','SUBCONTRACT','TRAVEL','OTHER')) cost_component_count
  from public.dd_service_package_components pc
  join public.dd_service_components c on c.id=pc.component_id
  group by pc.service_id
), cost_unresolved as (
  select pc.service_id,count(*) unresolved_cost_component_count
  from public.dd_service_package_components pc join public.dd_service_components c on c.id=pc.component_id
  where pc.is_active and c.cost_category in ('MATERIAL','PROCUREMENT','SUBCONTRACT','TRAVEL','OTHER')
    and not exists (
      select 1 from public.dd_component_cost_baselines cb
      where cb.component_id=pc.component_id and (cb.service_id is null or cb.service_id=pc.service_id)
        and cb.status='ACTIVE'
        and cb.evidence_status in ('RESEARCH_BENCHMARK','OWNER_CONFIRMED','DOCUMENT_EVIDENCE','SYSTEM_VERIFIED','EXTERNAL_VERIFIED')
        and cb.effective_from<=now() and (cb.effective_to is null or cb.effective_to>now())
    )
  group by pc.service_id
), policy as (
  select s.id service_id, exists(
    select 1 from public.dd_economic_policies ep
    where (ep.service_id=s.id or ep.service_id is null) and ep.status='ACTIVE'
      and ep.evidence_status in ('RESEARCH_BENCHMARK','OWNER_CONFIRMED','DOCUMENT_EVIDENCE','SYSTEM_VERIFIED','EXTERNAL_VERIFIED')
      and ep.effective_from<=now() and (ep.effective_to is null or ep.effective_to>now())
  ) policy_ready from public.services s
), routes as (
  select s.id service_id,
    exists(select 1 from public.dd_service_work_order_routing_templates rt where rt.service_id=s.id and rt.is_active and rt.capability_key='OWNER_DIRECT_FULFILLMENT') owner_route_active,
    exists(select 1 from public.dd_provider_capabilities pc where pc.service_id=s.id and pc.is_authorized=true) provider_route_active
  from public.services s
), owner_unresolved as (
  select pc.service_id,count(*) unresolved_owner_labor_count
  from public.dd_service_package_components pc join public.dd_service_components c on c.id=pc.component_id
  where pc.is_active and c.cost_category='LABOR'
    and not exists(
      select 1 from public.dd_owner_compensation_rules ocr
      join public.dd_portal_user_roles ur on ur.user_id=ocr.owner_user_id and ur.role='OWNER_OPERATOR'::public.dd_portal_role
      where ocr.component_id=pc.component_id and (ocr.service_id is null or ocr.service_id=pc.service_id)
        and ocr.status='ACTIVE'
        and ocr.evidence_status in ('RESEARCH_BENCHMARK','OWNER_CONFIRMED','DOCUMENT_EVIDENCE','SYSTEM_VERIFIED','EXTERNAL_VERIFIED')
        and ocr.effective_from<=now() and (ocr.effective_to is null or ocr.effective_to>now())
    )
  group by pc.service_id
), provider_unresolved as (
  select pc.service_id,count(*) unresolved_provider_labor_count
  from public.dd_service_package_components pc join public.dd_service_components c on c.id=pc.component_id
  where pc.is_active and c.cost_category='LABOR'
    and not exists(
      select 1 from public.dd_provider_payout_bands pb
      where pb.component_id=pc.component_id and pb.service_id=pc.service_id and pb.status='ACTIVE'
        and pb.evidence_status in ('RESEARCH_BENCHMARK','OWNER_CONFIRMED','DOCUMENT_EVIDENCE','SYSTEM_VERIFIED','EXTERNAL_VERIFIED')
        and pb.effective_from<=now() and (pb.effective_to is null or pb.effective_to>now())
    )
    and not exists(
      select 1 from public.dd_provider_compensation_rules pcr
      where pcr.component_id=pc.component_id and (pcr.service_id is null or pcr.service_id=pc.service_id)
        and pcr.status='ACTIVE'
        and pcr.evidence_status in ('RESEARCH_BENCHMARK','OWNER_CONFIRMED','DOCUMENT_EVIDENCE','SYSTEM_VERIFIED','EXTERNAL_VERIFIED')
        and pcr.effective_from<=now() and (pcr.effective_to is null or pcr.effective_to>now())
    )
  group by pc.service_id
), governed_offer as (
  select
    g.runtime_service_id service_id,
    g.canonical_sku,
    bool_or(
      g.commercial_offer_status='SELL_NOW'
      and g.fulfillment_gate_status='READY'
      and g.pricing_rule_count>0
      and g.authorized_provider_capability_count>0
      and g.source_authority is not null
    ) as governed_service_economics_ready
  from public.dd_governed_service_offers g
  where g.commercial_object_type='SERV'
  group by g.runtime_service_id,g.canonical_sku
)
select s.id service_id,s.sku canonical_sku,
 coalesce(p.package_component_count,0) package_component_count,
 coalesce(p.labor_component_count,0) labor_component_count,
 coalesce(p.cost_component_count,0) cost_component_count,
 coalesce(cu.unresolved_cost_component_count,0) unresolved_cost_component_count,
 coalesce(ou.unresolved_owner_labor_count,0) unresolved_owner_labor_count,
 coalesce(pu.unresolved_provider_labor_count,0) unresolved_provider_labor_count,
 pol.policy_ready,r.owner_route_active,r.provider_route_active,
 (
   (coalesce(p.package_component_count,0)>0 and pol.policy_ready and coalesce(cu.unresolved_cost_component_count,0)=0
     and ((r.owner_route_active and coalesce(ou.unresolved_owner_labor_count,0)=0)
       or (not r.owner_route_active and r.provider_route_active and coalesce(pu.unresolved_provider_labor_count,0)=0)
       or (not r.owner_route_active and not r.provider_route_active and coalesce(p.labor_component_count,0)=0)))
   or
   (coalesce(p.package_component_count,0)=0 and coalesce(go.governed_service_economics_ready,false))
 ) economics_ready,
 case
   when coalesce(p.package_component_count,0)=0 and coalesce(go.governed_service_economics_ready,false) then 'GOVERNED_SERVICE_OFFER_READY'
   when coalesce(p.package_component_count,0)=0 then 'PACKAGE_COMPONENTS_UNRESOLVED'
   when not pol.policy_ready then 'ECONOMIC_POLICY_UNRESOLVED'
   when coalesce(cu.unresolved_cost_component_count,0)>0 then 'DIRECT_COST_UNRESOLVED'
   when r.owner_route_active and coalesce(ou.unresolved_owner_labor_count,0)>0 then 'OWNER_COMPENSATION_UNRESOLVED'
   when not r.owner_route_active and r.provider_route_active and coalesce(pu.unresolved_provider_labor_count,0)>0 then 'PROVIDER_COMPENSATION_UNRESOLVED'
   when not r.owner_route_active and not r.provider_route_active and coalesce(p.labor_component_count,0)>0 then 'FULFILLMENT_ECONOMIC_ROUTE_UNRESOLVED'
   else 'READY'
 end economics_reason
from public.services s
left join package p on p.service_id=s.id
left join cost_unresolved cu on cu.service_id=s.id
left join policy pol on pol.service_id=s.id
left join routes r on r.service_id=s.id
left join owner_unresolved ou on ou.service_id=s.id
left join provider_unresolved pu on pu.service_id=s.id
left join governed_offer go on go.service_id=s.id and go.canonical_sku=s.sku;

create or replace view public.dd_service_release_reconciliation_queue_v1
with (security_invoker=true) as
with governed as (
  select
    canonical_sku,
    bool_or(commercial_offer_status='SELL_NOW') as any_sell_now,
    bool_or(fulfillment_gate_status='READY') as any_fulfillment_ready,
    max(pricing_rule_count) as pricing_rule_count,
    max(authorized_provider_capability_count) as authorized_provider_capability_count,
    max(source_authority) filter(where source_authority is not null) as source_authority
  from public.dd_governed_service_offers
  group by canonical_sku
)
select
  r.canonical_sku,
  r.service_name,
  r.service_family,
  r.release_state,
  r.blocking_gate,
  r.provider_capability_count,
  r.routing_count,
  r.active_task_template_count,
  r.payment_path_verified,
  r.payment_ledger_ok,
  r.runtime_accuracy_ok,
  r.regression_verified,
  r.production_smoke_verified,
  e.economics_ready,
  e.economics_reason,
  case when g.any_sell_now then 'SELL_NOW' else null end as commercial_offer_status,
  case when g.any_fulfillment_ready then 'READY' else null end as governed_fulfillment_status,
  g.pricing_rule_count as governed_pricing_rule_count,
  g.authorized_provider_capability_count as governed_provider_capability_count,
  g.source_authority as governed_source_authority,
  case
    when r.release_state='LIVE_READY' then 'READY'
    when r.release_state='BLOCKED' or r.blocking_gate='BLOCKED' then 'BLOCKED_AUTHORITY'
    when r.blocking_gate='COMMERCIAL_DEFINITION' then 'COMMERCIAL_DEFINITION_REQUIRED'
    when r.blocking_gate='ECONOMICS' then 'ECONOMICS_REQUIRED'
    when r.blocking_gate='FULFILLMENT_MATRIX' then 'FULFILLMENT_REQUIRED'
    when r.blocking_gate='PAYMENT_LEDGER' then 'PAYMENT_REQUIRED'
    when r.blocking_gate='RUNTIME_ACCURACY' then 'RUNTIME_REQUIRED'
    when r.blocking_gate='REGRESSION_VERIFIED' then 'REGRESSION_REQUIRED'
    when r.blocking_gate='CANONICAL_IDENTITY' then 'IDENTITY_REQUIRED'
    when r.blocking_gate='PRICING_ENGINE' then 'PRICING_REQUIRED'
    when r.blocking_gate='QUOTE_PATH' then 'QUOTE_PATH_REQUIRED'
    when r.blocking_gate='CHANNEL_AUTHORIZATION' then 'CHANNEL_AUTHORITY_REQUIRED'
    else 'OTHER_REQUIRED'
  end as reconciliation_class,
  case
    when r.release_state='LIVE_READY' then 'NONE'
    when r.release_state='BLOCKED' or r.blocking_gate='BLOCKED' then 'PRESERVE_BLOCK_AND_RESEARCH_AUTHORITY'
    when r.blocking_gate='COMMERCIAL_DEFINITION' then 'RECONCILE_SCOPE_OFFER_AND_CHANNEL_AUTHORITY'
    when r.blocking_gate='ECONOMICS' then 'RECONCILE_COST_COMPENSATION_OR_GOVERNED_OFFER_AUTHORITY'
    when r.blocking_gate='FULFILLMENT_MATRIX' then 'RECONCILE_ROUTING_CAPABILITY_AND_TASK_TEMPLATE'
    when r.blocking_gate='PAYMENT_LEDGER' then 'RECONCILE_INITIAL_PAYMENT_AND_LEDGER_PATH'
    when r.blocking_gate='RUNTIME_ACCURACY' then 'RUN_RUNTIME_PROOF'
    when r.blocking_gate='REGRESSION_VERIFIED' then 'RUN_REGRESSION_PROOF'
    when r.blocking_gate='CANONICAL_IDENTITY' then 'RECONCILE_CANONICAL_IDENTITY'
    when r.blocking_gate='PRICING_ENGINE' then 'RECONCILE_LOCKED_PRICING_RULES'
    when r.blocking_gate='QUOTE_PATH' then 'RECONCILE_QUOTE_INPUT_SCHEMA'
    when r.blocking_gate='CHANNEL_AUTHORIZATION' then 'RECONCILE_CHANNEL_AVAILABILITY'
    else 'INSPECT_EXISTING_AUTHORITY'
  end as next_repair_action
from public.dd_service_release_contract_v1 r
left join public.dd_service_economics_authority_v1 e using(canonical_sku)
left join governed g using(canonical_sku);
