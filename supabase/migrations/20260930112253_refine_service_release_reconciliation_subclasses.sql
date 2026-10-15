
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
  r.canonical_sku,r.service_name,r.service_family,r.release_state,r.blocking_gate,
  r.provider_capability_count,r.routing_count,r.active_task_template_count,
  r.payment_path_verified,r.payment_ledger_ok,r.runtime_accuracy_ok,r.regression_verified,r.production_smoke_verified,
  e.economics_ready,e.economics_reason,
  case when g.any_sell_now then 'SELL_NOW' else null end commercial_offer_status,
  case when g.any_fulfillment_ready then 'READY' else null end governed_fulfillment_status,
  g.pricing_rule_count governed_pricing_rule_count,
  g.authorized_provider_capability_count governed_provider_capability_count,
  g.source_authority governed_source_authority,
  case
    when r.release_state='LIVE_READY' then 'READY'
    when r.release_state='BLOCKED' or r.blocking_gate='BLOCKED' then 'BLOCKED_AUTHORITY'
    when r.blocking_gate='COMMERCIAL_DEFINITION' then 'COMMERCIAL_DEFINITION_REQUIRED'
    when r.blocking_gate='ECONOMICS'
      and e.economics_reason='PACKAGE_COMPONENTS_UNRESOLVED'
      and coalesce(g.any_sell_now,false)
      and coalesce(g.any_fulfillment_ready,false)
      and coalesce(g.authorized_provider_capability_count,0)=0
      then 'FULFILLMENT_CAPACITY_REQUIRED'
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
  end reconciliation_class,
  case
    when r.release_state='LIVE_READY' then 'NONE'
    when r.release_state='BLOCKED' or r.blocking_gate='BLOCKED' then 'PRESERVE_BLOCK_AND_RESEARCH_AUTHORITY'
    when r.blocking_gate='COMMERCIAL_DEFINITION' then 'RECONCILE_SCOPE_OFFER_AND_CHANNEL_AUTHORITY'
    when r.blocking_gate='ECONOMICS'
      and e.economics_reason='PACKAGE_COMPONENTS_UNRESOLVED'
      and coalesce(g.any_sell_now,false)
      and coalesce(g.any_fulfillment_ready,false)
      and coalesce(g.authorized_provider_capability_count,0)=0
      then 'AUTHORIZE_OR_RECRUIT_FULFILLMENT_CAPACITY_BEFORE_ECONOMICS_FALLBACK'
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
  end next_repair_action
from public.dd_service_release_contract_v1 r
left join public.dd_service_economics_authority_v1 e using(canonical_sku)
left join governed g using(canonical_sku);
