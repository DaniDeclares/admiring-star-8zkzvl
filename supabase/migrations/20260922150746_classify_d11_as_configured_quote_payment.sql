-- D11 DTF/heat-press checkout classification repair.
-- Only updates and asserts against historically present service rows.
-- Missing services on clean replay are a data-boundary condition, not permission to invent them.

update public.services
set pricing_type = 'VARIABLE_QUOTE', updated_at = now()
where sku in ('DNI-11A-017', 'DNI-11A-018')
  and pricing_type is distinct from 'VARIABLE_QUOTE';

update public.dd_service_pricing_rules r
set pricing_type = 'VARIABLE_QUOTE', updated_at = now()
from public.services s
where r.service_id = s.id
  and s.sku in ('DNI-11A-017', 'DNI-11A-018')
  and r.status = 'ACTIVE'
  and r.pricing_type is distinct from 'VARIABLE_QUOTE';

update public.dd_governed_commercial_offers
set pricing_model = 'VARIABLE_QUOTE', updated_at = now()
where canonical_sku in ('DNI-11A-017', 'DNI-11A-018')
  and pricing_model is distinct from 'VARIABLE_QUOTE';

update public.dd_stripe_launch_register
set pricing_status = 'CONFIGURED_CHECKOUT_REQUIRED',
    checkout_mode = 'FROZEN_ESTIMATE_CHECKOUT',
    activation_decision = 'HOLD',
    blockers = 'PAYMENT_PATH_VERIFICATION_REQUIRED',
    source_authority = 'dd_service_release_contract_v1 + approved frozen estimate',
    last_verified_at = now()
where canonical_sku in ('DNI-11A-017', 'DNI-11A-018');

do $$
declare
  v_present_count integer;
  v_service_count integer;
  v_quote_schema_count integer;
  v_active_link_count integer;
begin
  select count(*) into v_present_count from public.services
  where sku in ('DNI-11A-017', 'DNI-11A-018');

  select count(*) into v_service_count from public.services
  where sku in ('DNI-11A-017', 'DNI-11A-018') and pricing_type = 'VARIABLE_QUOTE';

  select count(*) into v_quote_schema_count from public.services
  where sku in ('DNI-11A-017', 'DNI-11A-018')
    and quote_input_schema is not null
    and jsonb_typeof(quote_input_schema) = 'object';

  select count(*) into v_active_link_count from public.dd_stripe_launch_register
  where canonical_sku in ('DNI-11A-017', 'DNI-11A-018')
    and activation_decision in ('ACTIVATE', 'ACTIVE');

  -- Services may be absent on clean ledger reconstruction. Do not invent them.
  if v_present_count = 0 then
    if v_active_link_count <> 0 then
      raise exception 'D11_ACTIVE_PAYMENT_LINK_FORBIDDEN: no services present but % active launch-register rows found', v_active_link_count;
    end if;
    raise notice 'D11 configured-payment classification skipped: DNI-11A-017/018 services absent on clean replay (present=0).';
    return;
  end if;

  if v_service_count <> v_present_count then
    raise exception 'D11_CONFIGURED_PAYMENT_MISMATCH: expected % VARIABLE_QUOTE services among present D11 rows, found % (present=%)', v_present_count, v_service_count, v_present_count;
  end if;

  if v_quote_schema_count <> v_present_count then
    raise exception 'D11_QUOTE_SCHEMA_MISSING: expected % governed quote schemas among present D11 rows, found %', v_present_count, v_quote_schema_count;
  end if;

  if v_active_link_count <> 0 then
    raise exception 'D11 fixed Payment Links must remain inactive until the configured quote path is replaced';
  end if;
end
$$;
