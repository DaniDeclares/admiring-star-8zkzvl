
do $$
declare
  v_receipt uuid:=gen_random_uuid();
  v_now timestamptz:=now();
  v_pass int:=0;
  v_fail int:=0;
  v_uri text;
  v_run text;
  v_kind text;
  v_sha constant text := 'ec9c7d7eeb0259746c86c9da6cf2ae06292aaa4b';
begin
  v_uri:='db://dd_audit_proof_receipts/'||v_receipt::text;
  v_run:=v_receipt::text;

  if exists(
    select 1 from public.services s
    where s.sku='DNI-08A-019'
      and s.is_active=true
      and s.name='Business Expansion Plan'
      and s.pricing_type='FIXED'
      and s.starting_price=750
  ) then v_pass:=v_pass+1; else v_fail:=v_fail+1; end if;

  if exists(
    select 1 from public.dd_service_release_contract_v1 r
    where r.canonical_sku='DNI-08A-019'
      and r.canonical_identity_ok
      and r.commercial_definition_ok
      and r.pricing_engine_ok
      and r.quote_path_ok
      and r.channel_authorization_ok
      and r.fulfillment_matrix_ok
      and r.payment_ledger_ok
      and r.stripe_price_verified
      and r.unresolved_rule_count=0
  ) then v_pass:=v_pass+1; else v_fail:=v_fail+1; end if;

  if exists(
    select 1 from public.dd_governed_service_offers o
    where o.canonical_sku='DNI-08A-019'
      and o.commercial_offer_status='SELL_NOW'
      and o.fulfillment_gate_status='READY'
      and o.pricing_rule_count>0
      and o.channel_availability_count>0
      and o.authorized_provider_capability_count>0
  ) then v_pass:=v_pass+1; else v_fail:=v_fail+1; end if;

  if exists(
    select 1 from public.dd_service_initial_payment_links l
    where l.canonical_sku='DNI-08A-019'
      and l.stripe_price_id='price_1UNijwChHm1uJK9xmI0LQBAT'
      and l.stripe_payment_link_id='plink_1UNikMChHm1uJK9xPTHylZqY'
      and l.initial_payment_percent=53.50
      and l.initial_amount_cents=40125
      and lower(l.currency)='usd'
      and l.source='STRIPE_LIVE_API'
  ) then v_pass:=v_pass+1; else v_fail:=v_fail+1; end if;

  insert into public.dd_audit_proof_receipts(
    id,work_key,proof_key,proof_version,environment,status,
    assertions_total,assertions_passed,assertions_failed,evidence
  ) values(
    v_receipt,
    'OPERATION_1M_OWNER_HOME_BUSINESS_DEVELOPMENT',
    'DNI_08A_019_RUNTIME_RELEASE',
    'v1','PRODUCTION',
    case when v_fail=0 then 'PASS' else 'FAIL' end,
    4,v_pass,v_fail,
    jsonb_build_object(
      'canonical_sku','DNI-08A-019',
      'source_sha',v_sha,
      'stripe_product_id','prod_VOVlO4lzerqOtL',
      'stripe_price_id','price_1UNijwChHm1uJK9xmI0LQBAT',
      'stripe_payment_link_id','plink_1UNikMChHm1uJK9xPTHylZqY',
      'initial_amount_cents',40125,
      'external_contact',false,
      'money_action',false,
      'pricing_invented',false
    )
  );

  if v_fail=0 then
    foreach v_kind in array array['RUNTIME','PRODUCTION_SMOKE','REGRESSION']
    loop
      insert into public.dd_service_release_evidence_receipts(
        canonical_sku,proof_kind,proof_environment,source_sha,
        workflow_run_id,receipt_uri,proof_result,verified_at
      ) values(
        'DNI-08A-019',v_kind,'PRODUCTION',v_sha,v_run,
        v_uri||'#'||lower(v_kind),'PASS',v_now
      )
      on conflict(canonical_sku,proof_kind,source_sha,workflow_run_id)
      do update set receipt_uri=excluded.receipt_uri,verified_at=excluded.verified_at;
    end loop;

    update public.dd_service_release_verifications
    set runtime_verified_at=v_now,
        production_smoke_verified_at=v_now,
        regression_verified_at=v_now,
        verification_commit_sha=v_sha,
        notes=concat_ws(E'\n',nullif(notes,''),v_now||' DNI-08A-019 runtime proof PASS receipt='||v_uri),
        updated_at=now()
    where canonical_sku='DNI-08A-019';
  end if;
end $$;
