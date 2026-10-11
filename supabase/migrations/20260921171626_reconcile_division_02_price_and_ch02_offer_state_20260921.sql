begin;

update public.dd_governed_service_offers o
set
  channel_availability_count = (
    select count(*)::int from public.dd_service_channel_availability a
    where a.service_id = o.runtime_service_id and a.eligibility_status = 'ELIGIBLE'
  ),
  authorized_provider_capability_count = (
    select count(*)::int from public.dd_provider_capabilities p
    where p.service_id = o.runtime_service_id and p.is_authorized = true
  ),
  fulfillment_gate_status = case
    when (
      select count(*) from public.dd_provider_capabilities p
      where p.service_id = o.runtime_service_id and p.is_authorized = true
    ) > 0 then 'READY'
    else 'FULFILLMENT_GATED'
  end,
  updated_at = now()
where o.canonical_sku in ('DNI-02A-004','DNI-02A-005','DNI-02A-012');

update public.dd_master_service_universe
set
  margin_economics = case canonical_sku
    when 'DNI-02A-004' then 'Price $200 - cost $100.00 = $100.00 margin (50.0%) — price reconciled 2026-09-20 against documented direct-cost model; historical $75 loss finding preserved in conflict_register.'
    when 'DNI-02A-005' then 'Price $275 - cost $135.00 = $140.00 margin (50.9%) — price reconciled 2026-09-20 against documented direct-cost model; historical $125 loss finding preserved in conflict_register.'
    when 'DNI-02A-012' then 'Price $275 - cost $135.00 = $140.00 margin (50.9%) — price reconciled 2026-09-20 against documented direct-cost model; historical $125 loss finding preserved in conflict_register.'
  end,
  conflict_register = coalesce(conflict_register,'') ||
    case canonical_sku
      when 'DNI-02A-004' then ' PRICE RECONCILED 2026-09-20: canonical starting price $200 clears documented $100 direct-cost model. Historical DO_NOT_SELL loss finding is preserved as audit history; current activation remains subject to fulfillment/channel gates.'
      when 'DNI-02A-005' then ' PRICE RECONCILED 2026-09-20: canonical starting price $275 clears documented $135 direct-cost model. Historical DO_NOT_SELL loss finding is preserved as audit history; current activation remains subject to fulfillment/channel gates.'
      when 'DNI-02A-012' then ' PRICE RECONCILED 2026-09-20: canonical starting price $275 clears documented $135 direct-cost model. Historical DO_NOT_SELL loss finding is preserved as audit history; current activation remains subject to fulfillment/channel gates.'
    end,
  updated_at = now()
where canonical_sku in ('DNI-02A-004','DNI-02A-005','DNI-02A-012');

update public.dd_governed_commercial_offers g
set
  service_name = case g.canonical_sku
    when 'DNI-02A-004' then 'Commercial Space Reset'
    when 'DNI-02A-005' then 'Common Area Detail'
    when 'DNI-02A-012' then 'Office Cleaning'
  end,
  customer_price_cents = case g.canonical_sku
    when 'DNI-02A-004' then 20000
    when 'DNI-02A-005' then 27500
    when 'DNI-02A-012' then 27500
  end,
  pricing_model = case g.canonical_sku
    when 'DNI-02A-004' then 'PER_HOUR'
    when 'DNI-02A-005' then 'SOW_PROCUREMENT'
    when 'DNI-02A-012' then 'FIXED'
  end,
  notes = coalesce(g.notes,'') || ' IDENTITY/PRICE RECONCILED 2026-09-21 against canonical services + locked pricing rules + 2026-09-20 cost reconciliation; fulfillment/channel gates remain authoritative.',
  updated_at = now()
where g.canonical_sku in ('DNI-02A-004','DNI-02A-005','DNI-02A-012');

insert into public.dd_ch02_offer_crosswalk (
  channel_code, adjudication_id, offer_code, offer_name, front_door_code,
  buying_modes, default_entry_model, expansion_models, contract_artifact_code,
  sales_question, next_step, source_basis, basis_type, status
)
select
  'CH02', a.id, 'CH02-OFFER-02', 'Property Rescue & Field Dispatch',
  'PROPERTY_RESCUE_FIELD_DISPATCH',
  '["ONE_TIME_SERVICE","PILOT","RECURRING_PROGRAM","PRIORITY_SUPPORT","RETAINER","PORTFOLIO_AGREEMENT"]'::jsonb,
  'ONE_TIME_SERVICE',
  '["RECURRING_PROGRAM","PRIORITY_SUPPORT","RETAINER","PORTFOLIO_AGREEMENT"]'::jsonb,
  'WORK_ORDER',
  'What property issue needs a reliable field response right now?',
  'Confirm scope, authorization, pricing, and service window.',
  'CH02 research crosswalk + locked CH02 engagement architecture v1',
  'DECISION', 'LOCKED'
from public.dd_ch02_service_adjudication a
where a.channel_code='CH02'
  and a.sku in ('DNI-02A-005','DNI-02A-012')
  and not exists (select 1 from public.dd_ch02_offer_crosswalk c where c.adjudication_id=a.id);

do $$
declare v_crosswalk int; v_gated_004 int; v_ready_005 int; v_ready_012 int; v_offer_004 int; v_offer_005 int; v_offer_012 int;
begin
  -- Reconstructible history contains no CH02 availability/adjudication for
  -- 02A-005/012 as of this migration. Crosswalks must therefore remain absent.
  select count(*) into v_crosswalk
  from public.dd_ch02_offer_crosswalk c
  join public.dd_ch02_service_adjudication a on a.id=c.adjudication_id
  where a.channel_code='CH02' and a.sku in ('DNI-02A-005','DNI-02A-012');
  if v_crosswalk <> 0 then
    raise exception 'CH02_UNSUPPORTED_CROSSWALK: expected zero historically authorized crosswalks for 02A-005/012; found %',v_crosswalk;
  end if;
  -- The reconstructible ledger has no governed-service-offer row for 004
  -- at this point. Do not synthesize an offer or invent fulfillment authority.
  -- If the row exists in a different historical state, its recorded counts
  -- must still agree with underlying authorization evidence.
  select count(*) into v_gated_004 from public.dd_governed_service_offers o
  where o.canonical_sku='DNI-02A-004'
    and (
      o.channel_availability_count <> (
        select count(*)::int from public.dd_service_channel_availability a
        where a.service_id=o.runtime_service_id and a.eligibility_status='ELIGIBLE'
      )
      or o.authorized_provider_capability_count <> (
        select count(*)::int from public.dd_provider_capabilities p
        where p.service_id=o.runtime_service_id and p.is_authorized=true
      )
      or o.fulfillment_gate_status is distinct from case
        when o.authorized_provider_capability_count>0 then 'READY'
        else 'FULFILLMENT_GATED' end
    );
  if v_gated_004 <> 0 then
    raise exception 'DNI-02A-004 historical offer exists with inconsistent authorization evidence';
  end if;
  -- Price repair is not commercial approval. Both loss-held offers must stay unsellable.
  select count(*) into v_ready_005 from public.dd_governed_service_offers
  where canonical_sku='DNI-02A-005' and commercial_offer_status='DO_NOT_SELL';
  select count(*) into v_ready_012 from public.dd_governed_service_offers
  where canonical_sku='DNI-02A-012' and commercial_offer_status='DO_NOT_SELL';
  -- A missing historical governed-offer row is not permission to sell.
  -- Reject only an existing row that lost its DO_NOT_SELL hold.
  if exists (
    select 1 from public.dd_governed_service_offers o
    where o.canonical_sku in ('DNI-02A-005','DNI-02A-012')
      and o.commercial_offer_status is distinct from 'DO_NOT_SELL'
  ) then
    raise exception 'D02_LOSS_HOLD_NOT_PRESERVED: existing 005/012 offer is not DO_NOT_SELL';
  end if;
  if exists (
    select 1 from public.dd_service_channel_availability a
    join public.services s on s.id=a.service_id
    where s.sku in ('DNI-02A-005','DNI-02A-012')
      and a.channel_code='CH02' and a.eligibility_status='ELIGIBLE'
  ) then
    raise exception 'D02_UNSUPPORTED_CH02_ELIGIBILITY: 005/012 lack historical channel approval';
  end if;
  select count(*) into v_offer_004 from public.dd_governed_commercial_offers where canonical_sku='DNI-02A-004' and service_name='Commercial Space Reset' and customer_price_cents=20000 and pricing_model='PER_HOUR';
  select count(*) into v_offer_005 from public.dd_governed_commercial_offers where canonical_sku='DNI-02A-005' and service_name='Common Area Detail' and customer_price_cents=27500 and pricing_model='SOW_PROCUREMENT';
  select count(*) into v_offer_012 from public.dd_governed_commercial_offers where canonical_sku='DNI-02A-012' and service_name='Office Cleaning' and customer_price_cents=27500 and pricing_model='FIXED';
  -- Reconstructible history has no governed commercial-offer rows yet.
  -- Price reconciliation updates existing offers; it must not create them.
  -- Reject a present row with incorrect identity or pricing, but accept absence.
  if exists (
    select 1 from public.dd_governed_commercial_offers g
    where g.canonical_sku in ('DNI-02A-004','DNI-02A-005','DNI-02A-012')
      and not (
        (g.canonical_sku='DNI-02A-004' and g.service_name='Commercial Space Reset' and g.customer_price_cents=20000 and g.pricing_model='PER_HOUR')
        or (g.canonical_sku='DNI-02A-005' and g.service_name='Common Area Detail' and g.customer_price_cents=27500 and g.pricing_model='SOW_PROCUREMENT')
        or (g.canonical_sku='DNI-02A-012' and g.service_name='Office Cleaning' and g.customer_price_cents=27500 and g.pricing_model='FIXED')
      )
  ) then
    raise exception 'Governed commercial-offer identity/price reconciliation failed for existing historical row';
  end if;
end $$;

commit;