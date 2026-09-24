-- Harden CH02 sellable catalog identity resolution.
-- A canonical SKU may have more than one governed-offer row; prefer SELL_NOW + READY deterministically.

create or replace view public.dd_ch02_sellable_catalog
with (security_invoker = true)
as
select
  a.id as adjudication_id,
  a.channel_code,
  a.sku,
  a.service_name,
  a.source_service_family,
  a.proposed_front_door as front_door_code,
  case a.proposed_front_door
    when 'TURNOVER_MAKE_READY' then 'Turnover & Make-Ready'
    when 'PROPERTY_RESCUE_FIELD_DISPATCH' then 'Property Rescue & Field Dispatch'
    when 'PROPERTY_CONDITION_DOCUMENTATION' then 'Property Condition & Documentation'
    when 'OFFICE_OPERATIONS_RESCUE' then 'Office & Operations Rescue'
    else 'Cross-Channel Review'
  end as front_door_name,
  a.customer_facing_role,
  a.backend_component,
  a.cross_channel_review,
  a.compliance_review_required,
  a.pricing_adjudication_required,
  a.provider_capacity_review_required,
  a.rationale,
  a.source_basis,
  a.priority,
  o.runtime_service_id,
  o.commercial_object_type,
  o.commercial_offer_status,
  o.fulfillment_gate_status,
  o.offer_basis,
  ca.eligibility_status as channel_availability_status,
  pr.pricing_type,
  pr.base_price_cents,
  pr.currency,
  pr.billing_cycle,
  pr.lock_status as pricing_lock_status,
  pr.status as pricing_status,
  case
    when a.disposition <> 'FRONT_DOOR_CANDIDATE' then 'NOT_APPROVED'
    when a.cross_channel_review then 'CROSS_CHANNEL_REVIEW'
    when upper(coalesce(ca.eligibility_status,'')) not in ('ACTIVE','ELIGIBLE') then 'APPROVED_NOT_ACTIVE'
    when pr.id is null then 'PRICING_NOT_LOCKED'
    when o.commercial_offer_status <> 'SELL_NOW' then 'COMMERCIAL_NOT_SELL_NOW'
    when o.fulfillment_gate_status <> 'READY' then 'FULFILLMENT_NOT_READY'
    when upper(coalesce(pr.pricing_type,'')) in ('SOW','SOW_PROCUREMENT','STARTING_AT','VARIABLE_QUOTE','PROJECT','PER_HOUR') then 'REQUEST_SCOPE'
    else 'SELL_NOW'
  end as sellability_state,
  case
    when a.disposition <> 'FRONT_DOOR_CANDIDATE' then false
    when a.cross_channel_review then false
    when upper(coalesce(ca.eligibility_status,'')) not in ('ACTIVE','ELIGIBLE') then false
    when pr.id is null then false
    when o.commercial_offer_status <> 'SELL_NOW' then false
    when o.fulfillment_gate_status <> 'READY' then false
    else true
  end as public_intake_eligible,
  case
    when a.disposition <> 'FRONT_DOOR_CANDIDATE' or a.cross_channel_review then 'NOT_PUBLIC'
    when upper(coalesce(ca.eligibility_status,'')) not in ('ACTIVE','ELIGIBLE') then 'NOT_PUBLIC'
    when pr.id is null then 'NOT_PUBLIC'
    when o.commercial_offer_status <> 'SELL_NOW' then 'NOT_PUBLIC'
    when o.fulfillment_gate_status <> 'READY' then 'NOT_PUBLIC'
    when upper(coalesce(pr.pricing_type,'')) in ('SOW','SOW_PROCUREMENT','STARTING_AT','VARIABLE_QUOTE','PROJECT','PER_HOUR') then 'REQUEST_SCOPE'
    else 'REQUEST_SERVICE'
  end as public_action,
  case
    when upper(coalesce(pr.pricing_type,'')) in ('SOW','SOW_PROCUREMENT','STARTING_AT','VARIABLE_QUOTE','PROJECT','PER_HOUR') then true
    else false
  end as quote_or_scope_required,
  a.source_master_record_id,
  coalesce(
    (select c.engagement_architecture->>'version'
       from public.dd_channel_strategy_contracts c
      where c.channel_code='CH02'
        and c.contract_version='2026-09-20.v1'
      limit 1),
    '2026-09-20.v1'
  ) as engagement_architecture_version
from public.dd_ch02_service_adjudication a
join lateral (
  select go.*
  from public.dd_governed_service_offers go
  where go.canonical_sku = a.sku
  order by
    case when go.commercial_offer_status='SELL_NOW' then 0 else 1 end,
    case when go.fulfillment_gate_status='READY' then 0 else 1 end,
    go.updated_at desc,
    go.id desc
  limit 1
) o on true
left join public.dd_service_channel_availability ca
  on ca.service_id = o.runtime_service_id
 and ca.channel_code = 'CH02'
left join lateral (
  select
    p.id,
    p.pricing_type,
    p.base_price_cents,
    p.currency,
    p.billing_cycle,
    p.lock_status,
    p.status
  from public.dd_service_pricing_rules p
  where p.service_id = o.runtime_service_id
    and p.channel_code = 'CH02'
    and p.status = 'ACTIVE'
    and p.lock_status = 'LOCKED'
  order by p.effective_date desc nulls last, p.updated_at desc
  limit 1
) pr on true
where a.channel_code='CH02'
  and a.disposition='FRONT_DOOR_CANDIDATE';

revoke all on public.dd_ch02_sellable_catalog from anon, authenticated;
grant select on public.dd_ch02_sellable_catalog to service_role;
