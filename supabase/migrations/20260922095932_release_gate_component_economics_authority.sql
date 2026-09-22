
-- Preserve the former text-economics release view for auditability, then restore the canonical v1 name
-- with the component-economics gate. All other release gates remain unchanged.
alter view public.dd_service_release_contract_v1 rename to dd_service_release_contract_legacy_v1;

create view public.dd_service_release_contract_v1
with (security_invoker=true) as
select
  l.canonical_sku,l.service_name,l.division,l.runtime_service_id,l.service_family,l.runtime_service_name,l.description,
  l.pricing_type,l.billing_cycle,l.resident_discount_eligible,l.pricing_engine_code,l.locked_active_rule_count,l.unresolved_rule_count,
  l.authorized_channel_count,l.direct_channel_count,l.required_requirement_count,l.provider_capability_count,l.routing_count,
  l.active_task_template_count,l.has_payment_link,l.has_stripe_price,l.stripe_register_authorized,l.stripe_sync_active,
  l.stripe_price_verified,l.payment_path_verified,l.runtime_verified,l.regression_verified,l.production_smoke_verified,
  l.initial_payment_percent,l.canonical_identity_ok,l.commercial_definition_ok,l.pricing_engine_ok,l.quote_path_ok,
  l.channel_authorization_ok,l.fulfillment_matrix_ok,l.payment_ledger_ok,l.runtime_accuracy_ok,
  case
    when l.release_state='BLOCKED' then 'BLOCKED'
    when not l.canonical_identity_ok then 'CANONICAL_IDENTITY'
    when not l.commercial_definition_ok then 'COMMERCIAL_DEFINITION'
    when not coalesce(e.economics_ready,false) then 'ECONOMICS'
    when not l.pricing_engine_ok then 'PRICING_ENGINE'
    when not l.quote_path_ok then 'QUOTE_PATH'
    when not l.channel_authorization_ok then 'CHANNEL_AUTHORIZATION'
    when not l.fulfillment_matrix_ok then 'FULFILLMENT_MATRIX'
    when not l.payment_ledger_ok then 'PAYMENT_LEDGER'
    when not l.runtime_accuracy_ok then 'RUNTIME_ACCURACY'
    when not l.regression_verified then 'REGRESSION_VERIFIED'
    else 'NONE'
  end as blocking_gate,
  case
    when l.release_state='BLOCKED' then 'BLOCKED'
    when l.canonical_identity_ok
      and l.commercial_definition_ok
      and coalesce(e.economics_ready,false)
      and l.pricing_engine_ok
      and l.quote_path_ok
      and l.channel_authorization_ok
      and l.fulfillment_matrix_ok
      and l.payment_ledger_ok
      and l.runtime_accuracy_ok
      and l.regression_verified
    then 'LIVE_READY'
    else 'HOLD'
  end as release_state
from public.dd_service_release_contract_legacy_v1 l
left join public.dd_service_economics_authority_v1 e on e.canonical_sku=l.canonical_sku;

comment on view public.dd_service_release_contract_v1 is 'Production release authority. Preserves the canonical nine-gate contract while economics is governed by dd_service_economics_authority_v1 rather than legacy free-text internal_cost/margin_economics.';
comment on view public.dd_service_release_contract_legacy_v1 is 'Audit-only predecessor retained to trace the former free-text economics gate. Not production release authority.';

create or replace view public.dd_service_canonical_readiness_v1
with (security_invoker=true) as
with config as (
  select canonical_sku,count(*) as governed_offer_row_count,
    bool_or(commercial_offer_status='SELL_NOW') as has_sell_now_offer,
    bool_or(commercial_offer_status='DO_NOT_SELL') as has_do_not_sell_offer,
    bool_or(readiness_state='LIVE_CHECKOUT_READY') as has_checkout_config,
    bool_or(readiness_state='LIVE_MANUAL_INVOICE_ONLY') as has_manual_invoice_config,
    bool_or(readiness_state='LIVE_QUOTE_ONLY') as has_quote_config,
    bool_or(readiness_state='BLOCKED') as has_blocked_offer,
    array_agg(distinct readiness_state order by readiness_state) as configuration_states,
    array_agg(distinct commercial_offer_status order by commercial_offer_status) as commercial_offer_states
  from public.dd_service_readiness_v1 group by canonical_sku
)
select rc.canonical_sku,rc.service_name,rc.division,rc.runtime_service_id,rc.service_family,
  c.governed_offer_row_count,c.commercial_offer_states,c.configuration_states,c.has_sell_now_offer,c.has_do_not_sell_offer,
  c.has_sell_now_offer and c.has_do_not_sell_offer as conflicting_offer_governance,
  c.has_checkout_config,c.has_manual_invoice_config,c.has_quote_config,c.has_blocked_offer,
  rc.blocking_gate,rc.release_state,rc.release_state='LIVE_READY' as production_sellable
from public.dd_service_release_contract_v1 rc left join config c using(canonical_sku);

create or replace view public.dd_launch_portfolio_readiness_v1
with (security_invoker=true) as
select lp.*,s.name as service_name,s.service_family,s.pricing_type,s.base_price_cents,
  rc.release_state,rc.blocking_gate,rc.canonical_identity_ok,rc.commercial_definition_ok,
  rc.pricing_engine_ok,rc.quote_path_ok,rc.channel_authorization_ok,rc.fulfillment_matrix_ok,
  rc.payment_ledger_ok,rc.runtime_accuracy_ok,rc.production_smoke_verified,rc.regression_verified
from public.dd_launch_portfolio lp
join public.services s on s.id=lp.service_id
left join public.dd_service_release_contract_v1 rc on rc.canonical_sku=lp.canonical_sku;

alter view public.dd_service_release_contract_v1 set (security_invoker=true);
alter view public.dd_service_canonical_readiness_v1 set (security_invoker=true);
alter view public.dd_launch_portfolio_readiness_v1 set (security_invoker=true);
