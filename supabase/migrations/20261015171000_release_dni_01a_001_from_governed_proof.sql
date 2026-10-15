begin;

do $$
declare
  v_service_id uuid;
  v_offer_id uuid;
  v_offer_count integer;
  v_rule_count integer;
  v_bad_rule_count integer;
begin
  select id into strict v_service_id
  from public.services
  where sku = 'DNI-01A-001'
    and is_active = true
    and pricing_type = 'FIXED'
    and base_price_cents = 14000;

  select count(*), min(id)
    into v_offer_count, v_offer_id
  from public.dd_governed_service_offers
  where canonical_sku = 'DNI-01A-001'
    and runtime_service_id = v_service_id
    and commercial_object_type = 'SERV'
    and service_name = 'Resident Refresh — Standard Maintenance Clean';

  if v_offer_count <> 1 then
    raise exception 'DNI-01A-001 canonical offer cardinality drifted: %', v_offer_count;
  end if;

  if not exists (
    select 1
    from public.dd_service_economics_authority_v1
    where canonical_sku = 'DNI-01A-001'
      and economics_ready = true
      and economics_reason = 'READY'
  ) then
    raise exception 'DNI-01A-001 economics authority is not READY';
  end if;

  if not exists (
    select 1
    from public.dd_service_release_contract_v1
    where canonical_sku = 'DNI-01A-001'
      and canonical_identity_ok
      and pricing_engine_ok
      and quote_path_ok
      and channel_authorization_ok
      and fulfillment_matrix_ok
      and payment_ledger_ok
      and runtime_accuracy_ok
      and regression_verified
      and production_smoke_verified
  ) then
    raise exception 'DNI-01A-001 governed release prerequisites are not green';
  end if;

  select
    count(*) filter (where status = 'ACTIVE' and lock_status = 'LOCKED'),
    count(*) filter (
      where status = 'ACTIVE'
        and lock_status = 'LOCKED'
        and base_price_cents <> 14000
    )
  into v_rule_count, v_bad_rule_count
  from public.dd_service_pricing_rules
  where service_id = v_service_id;

  if v_rule_count < 1 or v_bad_rule_count <> 0 then
    raise exception 'DNI-01A-001 locked $140 pricing authority drifted: rules %, mismatches %',
      v_rule_count, v_bad_rule_count;
  end if;

  if (
    select count(distinct proof_kind)
    from public.dd_service_release_evidence_receipts
    where canonical_sku = 'DNI-01A-001'
      and source_sha = '2c92c6acb707ee6233a0bcac11ac45b25d4dc1cf'
      and workflow_run_id = '38754859880'
      and proof_result = 'PASS'
      and (
        (proof_kind in ('RUNTIME','REGRESSION') and proof_environment = 'TESTER')
        or (proof_kind = 'PRODUCTION_SMOKE' and proof_environment = 'PRODUCTION')
      )
  ) <> 3 then
    raise exception 'DNI-01A-001 exact-main governed proof receipt set is incomplete';
  end if;

  update public.dd_governed_service_offers
  set commercial_offer_status = 'SELL_NOW',
      fulfillment_gate_status = 'READY',
      offer_basis = concat_ws(
        ' | ',
        nullif(offer_basis, ''),
        '2026-10-15 GOVERNED RELEASE: prior 2026-10-05 fail-close prerequisites satisfied by economics authority READY and exact-main workflow 38754859880 at 2c92c6acb707ee6233a0bcac11ac45b25d4dc1cf (TESTER RUNTIME+REGRESSION, PRODUCTION_SMOKE). Price remains $140; absorbed historical duplicate remains DO_NOT_SELL.'
      ),
      updated_at = now()
  where id = v_offer_id
    and (
      commercial_offer_status,
      fulfillment_gate_status
    ) is distinct from ('SELL_NOW'::text, 'READY'::text);

  if not exists (
    select 1
    from public.dd_service_release_contract_v1
    where canonical_sku = 'DNI-01A-001'
      and release_state = 'LIVE_READY'
      and blocking_gate = 'NONE'
  ) then
    raise exception 'DNI-01A-001 did not converge to LIVE_READY after canonical offer activation';
  end if;
end
$$;

commit;
