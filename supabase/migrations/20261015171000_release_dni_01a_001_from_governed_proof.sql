begin;

-- Promote only the three exact attested receipts from the governed GitHub run.
-- The workflow writes them to Tester; this migration is the reviewed release-train
-- bridge that materializes the same immutable provenance in each downstream database.
insert into public.dd_service_release_evidence_receipts(
  canonical_sku,
  proof_kind,
  proof_environment,
  source_sha,
  workflow_run_id,
  receipt_uri,
  proof_result,
  verified_at
)
values
  (
    'DNI-01A-001',
    'RUNTIME',
    'TESTER',
    '2c92c6acb707ee6233a0bcac11ac45b25d4dc1cf',
    '38754859880',
    'github-run://38754859880/dni-01a-001-release-contract-proof#runtime',
    'PASS',
    '2026-10-15 14:50:59.785693+00'::timestamptz
  ),
  (
    'DNI-01A-001',
    'REGRESSION',
    'TESTER',
    '2c92c6acb707ee6233a0bcac11ac45b25d4dc1cf',
    '38754859880',
    'github-run://38754859880/dni-01a-001-release-contract-proof#regression',
    'PASS',
    '2026-10-15 14:51:00.061455+00'::timestamptz
  ),
  (
    'DNI-01A-001',
    'PRODUCTION_SMOKE',
    'PRODUCTION',
    '2c92c6acb707ee6233a0bcac11ac45b25d4dc1cf',
    '38754859880',
    'github-run://38754859880/critical-production-smoke/production-critical.spec.ts',
    'PASS',
    '2026-10-15 14:52:10.618887+00'::timestamptz
  )
on conflict (canonical_sku, proof_kind, source_sha, workflow_run_id)
do update
set proof_environment = excluded.proof_environment,
    receipt_uri = excluded.receipt_uri,
    proof_result = excluded.proof_result,
    verified_at = excluded.verified_at;

update public.dd_service_release_verifications
set runtime_verified_at = greatest(
      coalesce(runtime_verified_at, '-infinity'::timestamptz),
      '2026-10-15 14:50:59.785693+00'::timestamptz
    ),
    regression_verified_at = greatest(
      coalesce(regression_verified_at, '-infinity'::timestamptz),
      '2026-10-15 14:51:00.061455+00'::timestamptz
    ),
    production_smoke_verified_at = greatest(
      coalesce(production_smoke_verified_at, '-infinity'::timestamptz),
      '2026-10-15 14:52:10.618887+00'::timestamptz
    ),
    verification_commit_sha = '2c92c6acb707ee6233a0bcac11ac45b25d4dc1cf',
    notes = case
      when coalesce(notes,'') like '%workflow 38754859880 promoted downstream%'
        then notes
      else concat_ws(
        E'\n',
        nullif(notes,''),
        '2026-10-15 governed release receipt: workflow 38754859880 promoted downstream by reviewed migration; source 2c92c6acb707ee6233a0bcac11ac45b25d4dc1cf.'
      )
    end,
    updated_at = now()
where canonical_sku = 'DNI-01A-001';

do $$
declare
  v_service_id uuid;
  v_offer_id uuid;
  v_offer_count integer;
  v_ch01_rule_count integer;
  v_bad_ch01_rule_count integer;
  v_locked_rule_count integer;
  v_bad_locked_rule_count integer;
  v_receipt_count integer;
begin
  select count(distinct proof_kind)
    into v_receipt_count
  from public.dd_service_release_evidence_receipts
  where canonical_sku = 'DNI-01A-001'
    and source_sha = '2c92c6acb707ee6233a0bcac11ac45b25d4dc1cf'
    and workflow_run_id = '38754859880'
    and proof_result = 'PASS'
    and (
      (proof_kind in ('RUNTIME','REGRESSION') and proof_environment = 'TESTER')
      or (proof_kind = 'PRODUCTION_SMOKE' and proof_environment = 'PRODUCTION')
    );

  if v_receipt_count <> 3 then
    raise exception 'DNI-01A-001 exact-main governed proof receipt set is incomplete: % of 3',
      v_receipt_count;
  end if;

  select id into strict v_service_id
  from public.services
  where sku = 'DNI-01A-001'
    and is_active = true
    and pricing_type = 'FIXED'
    and billing_cycle = 'ONETIME'
    and base_price_cents = 14000
    and starting_price = 140;

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
    count(*) filter (
      where channel_code = 'CH01'
        and status = 'ACTIVE'
        and lock_status = 'LOCKED'
    ),
    count(*) filter (
      where channel_code = 'CH01'
        and status = 'ACTIVE'
        and lock_status = 'LOCKED'
        and (
          base_price_cents is distinct from 14000
          or upper(coalesce(pricing_type,'')) <> 'FIXED'
          or upper(coalesce(billing_cycle,'')) <> 'ONETIME'
        )
    ),
    count(*) filter (where status = 'ACTIVE' and lock_status = 'LOCKED'),
    count(*) filter (
      where status = 'ACTIVE'
        and lock_status = 'LOCKED'
        and base_price_cents is distinct from 14000
    )
  into
    v_ch01_rule_count,
    v_bad_ch01_rule_count,
    v_locked_rule_count,
    v_bad_locked_rule_count
  from public.dd_service_pricing_rules
  where service_id = v_service_id;

  if v_ch01_rule_count <> 1 or v_bad_ch01_rule_count <> 0 then
    raise exception 'DNI-01A-001 CH01 locked pricing authority drifted: rules %, mismatches %',
      v_ch01_rule_count, v_bad_ch01_rule_count;
  end if;

  if v_locked_rule_count < 1 or v_bad_locked_rule_count <> 0 then
    raise exception 'DNI-01A-001 locked $140 pricing authority drifted: rules %, mismatches %',
      v_locked_rule_count, v_bad_locked_rule_count;
  end if;

  update public.dd_governed_service_offers
  set commercial_offer_status = 'SELL_NOW',
      fulfillment_gate_status = 'READY',
      offer_basis = case
        when coalesce(offer_basis,'') like '%workflow 38754859880%'
          then offer_basis
        else concat_ws(
          ' | ',
          nullif(offer_basis, ''),
          '2026-10-15 GOVERNED RELEASE: prior 2026-10-05 fail-close prerequisites satisfied by economics authority READY and exact-main workflow 38754859880 at 2c92c6acb707ee6233a0bcac11ac45b25d4dc1cf (TESTER RUNTIME+REGRESSION, PRODUCTION_SMOKE). Price remains $140; absorbed historical duplicate remains DO_NOT_SELL.'
        )
      end,
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
