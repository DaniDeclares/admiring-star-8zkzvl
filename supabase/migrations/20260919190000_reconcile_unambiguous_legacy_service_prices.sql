-- Reconcile the legacy services.starting_price projection only when the
-- authoritative active pricing rules contain exactly one distinct price.
-- Multi-channel, missing-rule, and missing-price cases are intentionally preserved.
--
-- The live database was reconciled under the same fail-closed rule before this
-- source migration was recorded in GitHub.

create or replace view public.vw_legacy_price_reconciliation as
with active_rules as (
  select
    r.service_id,
    count(*) as active_rule_count,
    count(distinct r.base_price_cents) as distinct_active_price_count,
    min(r.base_price_cents) as min_active_price_cents,
    max(r.base_price_cents) as max_active_price_cents,
    string_agg(
      r.channel_code || '=' || to_char(r.base_price_cents / 100.0, 'FM999999990.00'),
      ', ' order by r.channel_code
    ) as channel_prices
  from public.dd_service_pricing_rules r
  where r.status = 'ACTIVE'
    and r.base_price_cents is not null
  group by r.service_id
)
select
  s.id as service_id,
  s.sku,
  s.name as service_name,
  s.is_active,
  s.starting_price,
  coalesce(ar.active_rule_count,0) as active_rule_count,
  coalesce(ar.distinct_active_price_count,0) as distinct_active_price_count,
  ar.min_active_price_cents,
  ar.max_active_price_cents,
  ar.channel_prices,
  case
    when ar.service_id is null then 'NO_ACTIVE_RULE'
    when ar.distinct_active_price_count > 1 then 'MULTI_CHANNEL_PRICE'
    when ar.distinct_active_price_count = 1
         and s.starting_price is distinct from ar.min_active_price_cents / 100.0
      then 'UNAMBIGUOUS_STALE'
    when ar.distinct_active_price_count = 1
      then 'UNAMBIGUOUS_MATCH'
    else 'MISSING_PRICE'
  end as reconciliation_status,
  case
    when ar.distinct_active_price_count = 1
      then ar.min_active_price_cents / 100.0
    else null
  end as proposed_starting_price
from public.services s
left join active_rules ar on ar.service_id=s.id;

update public.services s
set starting_price = r.proposed_starting_price,
    updated_at = now()
from public.vw_legacy_price_reconciliation r
where r.service_id = s.id
  and s.is_active = true
  and r.reconciliation_status = 'UNAMBIGUOUS_STALE'
  and s.starting_price is distinct from r.proposed_starting_price;
