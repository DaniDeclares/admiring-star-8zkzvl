create or replace view public.dd_sales_closeability_v1
with (security_invoker = true) as
select
  e.id as sales_queue_id,
  e.contact_name,
  e.company_name,
  e.priority_score,
  e.sales_stage,
  e.pain_point,
  e.impact_statement,
  e.solution_statement,
  e.deliverables,
  e.investment_position,
  e.next_step_commitment,
  e.suggested_sku,
  coalesce(cr.production_sellable, false) as sku_production_sellable,
  cr.release_state as sku_release_state,
  (p.canonical_sku is not null and p.verified_at is not null) as verified_initial_payment_contract,
  case
    when e.sales_stage in ('DO_NOT_CONTACT','RECOVERY_HOLD','FULFILLMENT','PARTNERSHIP') then false
    when e.pain_point is null or e.impact_statement is null then false
    when e.suggested_sku is null then false
    when coalesce(cr.production_sellable, false) = false or coalesce(cr.release_state, '') <> 'LIVE_READY' then false
    when p.canonical_sku is null or p.verified_at is null then false
    else true
  end as money_path_ready,
  case
    when e.sales_stage = 'DO_NOT_CONTACT' then 'NO_OUTREACH'
    when e.sales_stage = 'RECOVERY_HOLD' then 'RELATIONSHIP_RECOVERY'
    when e.sales_stage = 'FULFILLMENT' then 'FULFILLMENT'
    when e.sales_stage = 'PARTNERSHIP' then 'PARTNERSHIP_ROUTING'
    when e.pain_point is null then 'CAPTURE_PAIN'
    when e.impact_statement is null then 'CAPTURE_IMPACT'
    when e.suggested_sku is null then 'MATCH_CANONICAL_SERVICE'
    when coalesce(cr.production_sellable, false) = false or coalesce(cr.release_state, '') <> 'LIVE_READY' then 'SERVICE_NOT_RELEASED'
    when p.canonical_sku is null or p.verified_at is null then 'PAYMENT_CONTRACT_NOT_VERIFIED'
    when e.deliverables is null then 'CONFIRM_DELIVERABLES'
    when e.investment_position is null then 'PRESENT_GOVERNED_INVESTMENT'
    when e.next_step_commitment is null then 'SECURE_NEXT_STEP'
    else 'READY_FOR_GOVERNED_CLOSE'
  end as closeability_next_action,
  (p.initial_amount_cents / 100.0)::numeric(12,2) as verified_initial_amount,
  p.initial_payment_percent,
  p.currency,
  p.verified_at as payment_contract_verified_at
from public.dd_sales_engine_v1 e
left join public.dd_service_canonical_readiness_v1 cr on cr.canonical_sku = e.suggested_sku
left join public.dd_service_initial_payment_links p on p.canonical_sku = e.suggested_sku;

revoke all on public.dd_sales_closeability_v1 from public, anon;
grant select on public.dd_sales_closeability_v1 to authenticated, service_role;

comment on view public.dd_sales_closeability_v1 is
'Fail-closed discovery-to-money transition. A lead is money_path_ready only with captured need, an explicit canonical SKU, LIVE_READY Production sellability, and a verified initial-payment contract. Does not infer SKU, outreach authority, or pricing.';
