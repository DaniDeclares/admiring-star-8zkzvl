create or replace view public.dd_service_canonical_readiness_v1 as
with config as (
  select
    r.canonical_sku,
    count(*) as governed_offer_row_count,
    bool_or(r.commercial_offer_status='SELL_NOW') as has_sell_now_offer,
    bool_or(
      r.commercial_offer_status='DO_NOT_SELL'
      and not exists (
        select 1
        from public.dd_ch01_service_adjudication a
        where a.sku=r.canonical_sku
          and a.status='LOCKED'
          and a.customer_visible_candidate=true
          and a.disposition in ('FRONT_DOOR','CONTROLLED_QUOTE')
      )
    ) as has_do_not_sell_offer,
    bool_or(r.readiness_state='LIVE_CHECKOUT_READY') as has_checkout_config,
    bool_or(r.readiness_state='LIVE_MANUAL_INVOICE_ONLY') as has_manual_invoice_config,
    bool_or(r.readiness_state='LIVE_QUOTE_ONLY') as has_quote_config,
    bool_or(r.readiness_state='BLOCKED') as has_blocked_offer,
    array_agg(distinct r.readiness_state order by r.readiness_state) as configuration_states,
    array_agg(distinct r.commercial_offer_status order by r.commercial_offer_status) as commercial_offer_states
  from public.dd_service_readiness_v1 r
  group by r.canonical_sku
)
select
  rc.canonical_sku,
  rc.service_name,
  rc.division,
  rc.runtime_service_id,
  rc.service_family,
  c.governed_offer_row_count,
  c.commercial_offer_states,
  c.configuration_states,
  c.has_sell_now_offer,
  c.has_do_not_sell_offer,
  c.has_sell_now_offer and c.has_do_not_sell_offer as conflicting_offer_governance,
  c.has_checkout_config,
  c.has_manual_invoice_config,
  c.has_quote_config,
  c.has_blocked_offer,
  rc.blocking_gate,
  rc.release_state,
  rc.release_state='LIVE_READY' as production_sellable
from public.dd_service_release_contract_v1 rc
left join config c using(canonical_sku);
