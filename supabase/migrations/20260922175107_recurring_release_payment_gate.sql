-- Recurring services use the governed paid-first subscription runtime, not static one-time Payment Links.
-- Preserve all existing release gates while making payment-path verification the recurring payment authority.
create or replace view public.dd_service_release_contract_v1
with (security_invoker=true) as
with base as (
 select l.*,
   case when l.pricing_type='RECURRING'
        then coalesce(l.payment_path_verified,false)
        else l.payment_ledger_ok
   end as effective_payment_ledger_ok
 from public.dd_service_release_contract_legacy_v1 l
)
select
  l.canonical_sku,l.service_name,l.division,l.runtime_service_id,l.service_family,l.runtime_service_name,l.description,
  l.pricing_type,l.billing_cycle,l.resident_discount_eligible,l.pricing_engine_code,l.locked_active_rule_count,l.unresolved_rule_count,
  l.authorized_channel_count,l.direct_channel_count,l.required_requirement_count,l.provider_capability_count,l.routing_count,
  l.active_task_template_count,l.has_payment_link,l.has_stripe_price,l.stripe_register_authorized,l.stripe_sync_active,
  l.stripe_price_verified,l.payment_path_verified,l.runtime_verified,l.regression_verified,l.production_smoke_verified,
  l.initial_payment_percent,l.canonical_identity_ok,l.commercial_definition_ok,l.pricing_engine_ok,l.quote_path_ok,
  l.channel_authorization_ok,l.fulfillment_matrix_ok,l.effective_payment_ledger_ok as payment_ledger_ok,l.runtime_accuracy_ok,
  case
    when l.release_state='BLOCKED' then 'BLOCKED'
    when not l.canonical_identity_ok then 'CANONICAL_IDENTITY'
    when not l.commercial_definition_ok then 'COMMERCIAL_DEFINITION'
    when not coalesce(e.economics_ready,false) then 'ECONOMICS'
    when not l.pricing_engine_ok then 'PRICING_ENGINE'
    when not l.quote_path_ok then 'QUOTE_PATH'
    when not l.channel_authorization_ok then 'CHANNEL_AUTHORIZATION'
    when not l.fulfillment_matrix_ok then 'FULFILLMENT_MATRIX'
    when not l.effective_payment_ledger_ok then 'PAYMENT_LEDGER'
    when not l.runtime_accuracy_ok then 'RUNTIME_ACCURACY'
    when not l.regression_verified then 'REGRESSION_VERIFIED'
    else 'NONE'
  end as blocking_gate,
  case
    when l.release_state='BLOCKED' then 'BLOCKED'
    when l.canonical_identity_ok and l.commercial_definition_ok and coalesce(e.economics_ready,false)
      and l.pricing_engine_ok and l.quote_path_ok and l.channel_authorization_ok and l.fulfillment_matrix_ok
      and l.effective_payment_ledger_ok and l.runtime_accuracy_ok and l.regression_verified
    then 'LIVE_READY' else 'HOLD'
  end as release_state
from base l left join public.dd_service_economics_authority_v1 e on e.canonical_sku=l.canonical_sku;

grant select on public.dd_service_release_contract_v1 to authenticated,service_role;
comment on view public.dd_service_release_contract_v1 is 'Production release authority. RECURRING services require verified paid-first subscription runtime rather than static one-time Stripe Payment Link artifacts.';
