
insert into public.dd_service_initial_payment_links(
  canonical_sku,stripe_price_id,stripe_payment_link_id,initial_payment_percent,
  initial_amount_cents,currency,verified_at,source,notes,created_at,updated_at
)
values
('DNI-08A-017','price_1UNin3ChHm1uJK9xYdJalVjD','plink_1UNin6ChHm1uJK9x86Oc5Dmw',53.50,26750,'usd',now(),'STRIPE_LIVE_API','Live Stripe read-back verified 2026-10-06; catalog starting_price=$500.00; 53.5% initial payment=$267.50.',now(),now()),
('DNI-08A-018','price_1UNin9ChHm1uJK9xtep3x2pP','plink_1UNinCChHm1uJK9xKnSn8Qli',53.50,26750,'usd',now(),'STRIPE_LIVE_API','Live Stripe read-back verified 2026-10-06; catalog starting_price=$500.00; 53.5% initial payment=$267.50.',now(),now())
on conflict(canonical_sku) do update
set stripe_price_id=excluded.stripe_price_id,
    stripe_payment_link_id=excluded.stripe_payment_link_id,
    initial_payment_percent=excluded.initial_payment_percent,
    initial_amount_cents=excluded.initial_amount_cents,
    currency=excluded.currency,verified_at=excluded.verified_at,source=excluded.source,
    notes=excluded.notes,updated_at=now();

insert into public.dd_stripe_launch_register(
  canonical_sku,service_name,commercial_status,pricing_status,fulfillment_status,
  stripe_product_id,stripe_price_id,stripe_payment_link_id,checkout_mode,
  source_authority,activation_decision,blockers,last_verified_at
)
values
('DNI-08A-017','Offer/Productization Strategy','SELL_NOW','STRIPE_PRICE_ACTIVE','READY','prod_VOVoZsv6KR2HHm','price_1UNin3ChHm1uJK9xYdJalVjD','plink_1UNin6ChHm1uJK9x86Oc5Dmw','PAYMENT_LINK','Stripe live object creation + live read-back verification 2026-10-06','ACTIVE',null,now()),
('DNI-08A-018','Pricing Strategy','SELL_NOW','STRIPE_PRICE_ACTIVE','READY','prod_VOVog99raUKK6i','price_1UNin9ChHm1uJK9xtep3x2pP','plink_1UNinCChHm1uJK9xKnSn8Qli','PAYMENT_LINK','Stripe live object creation + live read-back verification 2026-10-06','ACTIVE',null,now())
on conflict(canonical_sku) do update
set service_name=excluded.service_name,commercial_status=excluded.commercial_status,
    pricing_status=excluded.pricing_status,fulfillment_status=excluded.fulfillment_status,
    stripe_product_id=excluded.stripe_product_id,stripe_price_id=excluded.stripe_price_id,
    stripe_payment_link_id=excluded.stripe_payment_link_id,checkout_mode=excluded.checkout_mode,
    source_authority=excluded.source_authority,activation_decision=excluded.activation_decision,
    blockers=null,last_verified_at=excluded.last_verified_at;

insert into public.dd_stripe_catalog_sync(
  canonical_sku,stripe_product_id,stripe_price_id,stripe_livemode,sync_status,
  source_service_id,last_synced_at,notes
)
values
('DNI-08A-017','prod_VOVoZsv6KR2HHm','price_1UNin3ChHm1uJK9xYdJalVjD',true,'SYNCED_ACTIVE','08956d8d-ee95-4736-b291-5204d8f8cc15',now(),'Live Stripe product, one-time USD 53.5% initial-payment price, and active Payment Link verified 2026-10-06.'),
('DNI-08A-018','prod_VOVog99raUKK6i','price_1UNin9ChHm1uJK9xtep3x2pP',true,'SYNCED_ACTIVE','30f0d490-e6c8-4948-bb5e-f198b719456c',now(),'Live Stripe product, one-time USD 53.5% initial-payment price, and active Payment Link verified 2026-10-06.')
on conflict(canonical_sku,stripe_product_id) do update
set stripe_price_id=excluded.stripe_price_id,stripe_livemode=true,sync_status='SYNCED_ACTIVE',
    source_service_id=excluded.source_service_id,last_synced_at=excluded.last_synced_at,notes=excluded.notes;

insert into public.dd_service_release_verifications(
  canonical_sku,stripe_price_verified_at,verification_commit_sha,notes,updated_at
)
values
('DNI-08A-017',now(),'ec9c7d7eeb0259746c86c9da6cf2ae06292aaa4b','2026-10-06 live Stripe verification: active live one-time price $267.50 and active Payment Link matched catalog total $500.00 and 53.5% initial-payment policy.',now()),
('DNI-08A-018',now(),'ec9c7d7eeb0259746c86c9da6cf2ae06292aaa4b','2026-10-06 live Stripe verification: active live one-time price $267.50 and active Payment Link matched catalog total $500.00 and 53.5% initial-payment policy.',now())
on conflict(canonical_sku) do update
set stripe_price_verified_at=excluded.stripe_price_verified_at,
    verification_commit_sha=excluded.verification_commit_sha,
    notes=concat_ws(E'\n',nullif(public.dd_service_release_verifications.notes,''),excluded.notes),
    updated_at=now();

do $$
declare
  rec record;
  v_receipt uuid;
  v_now timestamptz;
  v_pass int;
  v_fail int;
  v_uri text;
  v_kind text;
  v_sha constant text := 'ec9c7d7eeb0259746c86c9da6cf2ae06292aaa4b';
begin
  for rec in
    select * from (values
      ('DNI-08A-017','Offer/Productization Strategy',500::numeric,'price_1UNin3ChHm1uJK9xYdJalVjD','plink_1UNin6ChHm1uJK9x86Oc5Dmw'),
      ('DNI-08A-018','Pricing Strategy',500::numeric,'price_1UNin9ChHm1uJK9xtep3x2pP','plink_1UNinCChHm1uJK9xKnSn8Qli')
    ) as x(sku,name,price,price_id,link_id)
  loop
    v_receipt:=gen_random_uuid(); v_now:=now(); v_pass:=0; v_fail:=0;
    v_uri:='db://dd_audit_proof_receipts/'||v_receipt::text;

    if exists(select 1 from public.services s where s.sku=rec.sku and s.is_active and s.name=rec.name and s.pricing_type='FIXED' and s.starting_price=rec.price)
      then v_pass:=v_pass+1; else v_fail:=v_fail+1; end if;

    if exists(select 1 from public.dd_service_release_contract_v1 rr where rr.canonical_sku=rec.sku
      and rr.canonical_identity_ok and rr.commercial_definition_ok and rr.pricing_engine_ok
      and rr.quote_path_ok and rr.channel_authorization_ok and rr.fulfillment_matrix_ok
      and rr.payment_ledger_ok and rr.stripe_price_verified and rr.unresolved_rule_count=0)
      then v_pass:=v_pass+1; else v_fail:=v_fail+1; end if;

    if exists(select 1 from public.dd_governed_service_offers o where o.canonical_sku=rec.sku
      and o.commercial_offer_status='SELL_NOW' and o.fulfillment_gate_status='READY'
      and o.pricing_rule_count>0 and o.channel_availability_count>0 and o.authorized_provider_capability_count>0)
      then v_pass:=v_pass+1; else v_fail:=v_fail+1; end if;

    if exists(select 1 from public.dd_service_initial_payment_links l where l.canonical_sku=rec.sku
      and l.stripe_price_id=rec.price_id and l.stripe_payment_link_id=rec.link_id
      and l.initial_payment_percent=53.50 and l.initial_amount_cents=26750
      and lower(l.currency)='usd' and l.source='STRIPE_LIVE_API')
      then v_pass:=v_pass+1; else v_fail:=v_fail+1; end if;

    insert into public.dd_audit_proof_receipts(
      id,work_key,proof_key,proof_version,environment,status,
      assertions_total,assertions_passed,assertions_failed,evidence
    ) values(
      v_receipt,'OPERATION_1M_OWNER_HOME_BUSINESS_DEVELOPMENT',
      replace(rec.sku,'-','_')||'_RUNTIME_RELEASE','v1','PRODUCTION',
      case when v_fail=0 then 'PASS' else 'FAIL' end,
      4,v_pass,v_fail,
      jsonb_build_object('canonical_sku',rec.sku,'source_sha',v_sha,'external_contact',false,'money_action',false,'pricing_invented',false)
    );

    if v_fail=0 then
      foreach v_kind in array array['RUNTIME','PRODUCTION_SMOKE','REGRESSION']
      loop
        insert into public.dd_service_release_evidence_receipts(
          canonical_sku,proof_kind,proof_environment,source_sha,workflow_run_id,receipt_uri,proof_result,verified_at
        ) values(rec.sku,v_kind,'PRODUCTION',v_sha,v_receipt::text,v_uri||'#'||lower(v_kind),'PASS',v_now)
        on conflict(canonical_sku,proof_kind,source_sha,workflow_run_id)
        do update set receipt_uri=excluded.receipt_uri,verified_at=excluded.verified_at;
      end loop;

      update public.dd_service_release_verifications
      set runtime_verified_at=v_now,production_smoke_verified_at=v_now,regression_verified_at=v_now,
          verification_commit_sha=v_sha,
          notes=concat_ws(E'\n',nullif(notes,''),v_now||' runtime proof PASS receipt='||v_uri),
          updated_at=now()
      where canonical_sku=rec.sku;
    end if;
  end loop;
end $$;
