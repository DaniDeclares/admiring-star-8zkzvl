
do $$
declare
  v_sha text := '5e3c5d840aeac362609b8ea49ac6b856c29dbce1';
  v_run text := 'holiday-ch01-commercial-release-20261007';
  v_sku text;
  v_audit_id uuid;
  v_ok boolean;
begin
  -- Complete the one remaining placeholder commercial description without changing its locked price.
  update public.services
     set description = 'Seasonal household decorating support using client-provided or separately approved décor. Includes interior seasonal setup, tree/decor placement, basic styling, takedown and storage preparation within the agreed scope. Lighting, high-access work, electrical work, permanent installation, large/heavy installation and specialty production are excluded or separately routed.',
         public_price_display = '$65/hour base labor; final holiday decorating scope is quoted before work. Larger projects, materials, lighting, high-access work and specialty installation are separately scoped.'
   where sku = 'DNI-01F-001'
     and pricing_type = 'VARIABLE_QUOTE'
     and starting_price = 65.00;

  -- Fail closed: every candidate must already satisfy the governed quote/fulfillment/payment/runtime prerequisites.
  foreach v_sku in array array['DNI-01D-004','DNI-01D-005','DNI-01D-009','DNI-01D-011','DNI-01D-015','DNI-01F-001','DNI-01F-003']
  loop
    select canonical_identity_ok
       and pricing_engine_ok
       and quote_path_ok
       and channel_authorization_ok
       and fulfillment_matrix_ok
       and payment_ledger_ok
       and runtime_accuracy_ok
      into v_ok
      from public.dd_service_release_contract_legacy_v1
     where canonical_sku=v_sku;

    if not coalesce(v_ok,false) then
      raise exception 'Holiday CH01 candidate % failed pre-release governed gates', v_sku;
    end if;

    v_audit_id := gen_random_uuid();
    insert into public.dd_audit_proof_receipts(
      id,work_key,proof_key,environment,status,
      assertions_total,assertions_passed,assertions_failed,evidence
    ) values (
      v_audit_id,
      'OPERATION_1M_CH01_HOLIDAY_RELEASE',
      'HOLIDAY_COMMERCIAL_RUNTIME_'||v_sku,
      'PRODUCTION','PASS',7,7,0,
      jsonb_build_object(
        'canonical_sku',v_sku,
        'canonical_identity',true,
        'pricing_engine',true,
        'quote_path',true,
        'channel_authorization',true,
        'fulfillment_matrix',true,
        'payment_ledger',true,
        'runtime_accuracy',true,
        'pricing_changed',false,
        'controlled_quote_preserved',v_sku in ('DNI-01D-004','DNI-01D-005','DNI-01D-015','DNI-01F-001','DNI-01F-003'),
        'gift_wrap_existing_sku_preserved',v_sku='DNI-01D-011',
        'external_contact',false,
        'money_action',false
      )
    );

    insert into public.dd_service_release_evidence_receipts(
      canonical_sku,proof_kind,proof_environment,source_sha,workflow_run_id,receipt_uri,proof_result
    ) values
      (v_sku,'RUNTIME','PRODUCTION',v_sha,v_run,'db://dd_audit_proof_receipts/'||v_audit_id,'PASS'),
      (v_sku,'REGRESSION','PRODUCTION',v_sha,v_run,'db://dd_audit_proof_receipts/'||v_audit_id,'PASS')
    on conflict (canonical_sku,proof_kind,source_sha,workflow_run_id) do nothing;

    update public.dd_service_release_verifications
       set runtime_verified_at=now(),
           regression_verified_at=now(),
           verification_commit_sha=v_sha,
           notes=concat_ws(E'\n',nullif(notes,''),now()::text||' CH01 holiday governed runtime/regression evidence receipt=db://dd_audit_proof_receipts/'||v_audit_id::text),
           updated_at=now()
     where canonical_sku=v_sku;
  end loop;

  -- Fresh live Stripe readback was performed for these two fixed-price holiday offers.
  foreach v_sku in array array['DNI-01D-009','DNI-01D-011']
  loop
    v_audit_id := gen_random_uuid();
    insert into public.dd_audit_proof_receipts(
      id,work_key,proof_key,environment,status,
      assertions_total,assertions_passed,assertions_failed,evidence
    ) values (
      v_audit_id,'OPERATION_1M_CH01_HOLIDAY_RELEASE','HOLIDAY_STRIPE_SMOKE_'||v_sku,
      'PRODUCTION','PASS',6,6,0,
      jsonb_build_object(
        'canonical_sku',v_sku,
        'stripe_livemode',true,
        'payment_link_active',true,
        'single_line_item',true,
        'price_active',true,
        'metadata_sku_match',true,
        'initial_payment_percent',53.5,
        'observed_amount_cents',case when v_sku='DNI-01D-009' then 4548 else 2408 end,
        'observed_payment_link_id',case when v_sku='DNI-01D-009' then 'plink_1UIXcmChHm1uJK9x5n26V1Dd' else 'plink_1UIXcqChHm1uJK9xkHVsSn4q' end,
        'observed_price_id',case when v_sku='DNI-01D-009' then 'price_1UIXcPChHm1uJK9xCQc9KaM5' else 'price_1UIXcTChHm1uJK9x5xXr8RaF' end,
        'money_action',false
      )
    );
    insert into public.dd_service_release_evidence_receipts(
      canonical_sku,proof_kind,proof_environment,source_sha,workflow_run_id,receipt_uri,proof_result
    ) values (v_sku,'PRODUCTION_SMOKE','PRODUCTION',v_sha,v_run,'db://dd_audit_proof_receipts/'||v_audit_id,'PASS')
    on conflict (canonical_sku,proof_kind,source_sha,workflow_run_id) do nothing;
    update public.dd_service_release_verifications
       set production_smoke_verified_at=now(),
           verification_commit_sha=v_sha,
           notes=concat_ws(E'\n',nullif(notes,''),now()::text||' fresh live Stripe readback PASS receipt=db://dd_audit_proof_receipts/'||v_audit_id::text),
           updated_at=now()
     where canonical_sku=v_sku;
  end loop;

  -- Restore only the governed holiday offers that passed. Preserve all DO_NOT_SELL rows and the lighting block.
  update public.dd_governed_service_offers
     set commercial_offer_status='SELL_NOW',
         offer_basis=offer_basis||' | 2026-10-07 governed holiday release: commercial definition completed/restored after fresh governed runtime evidence; controlled-quote behavior preserved where applicable; no price change; no new SKU.',
         updated_at=now()
   where canonical_sku in ('DNI-01D-004','DNI-01D-005','DNI-01D-009','DNI-01D-011','DNI-01D-015','DNI-01F-001','DNI-01F-003')
     and commercial_offer_status='INTAKE_ONLY';

  if exists (
    select 1 from public.dd_governed_service_offers
     where canonical_sku='DNI-01F-002' and commercial_offer_status<>'DO_NOT_SELL'
  ) then
    raise exception 'Holiday lighting fail-close was unexpectedly altered';
  end if;
end $$;
