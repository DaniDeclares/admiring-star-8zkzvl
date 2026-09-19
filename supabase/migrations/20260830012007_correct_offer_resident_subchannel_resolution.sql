update public.dd_governed_service_offers o
set
  ch01_a_priced = exists (
    select 1
    from public.dd_market_service_commercial_rules mpr
    where mpr.service_id=o.runtime_service_id
      and mpr.channel_code='CH01'
      and mpr.subchannel_code='CH01-A'
      and mpr.status in ('ACTIVE','PRICED')
      and mpr.customer_price_cents is not null
  ),
  ch01_b_priced = exists (
    select 1
    from public.dd_market_service_commercial_rules mpr
    where mpr.service_id=o.runtime_service_id
      and mpr.channel_code='CH01'
      and mpr.subchannel_code='CH01-B'
      and mpr.status in ('ACTIVE','PRICED')
      and mpr.customer_price_cents is not null
  ),
  updated_at=now();