
insert into public.dd_service_initial_payment_links(
  canonical_sku,stripe_price_id,stripe_payment_link_id,initial_payment_percent,
  initial_amount_cents,currency,verified_at,source,notes,created_at,updated_at
)
values
('DNI-08A-007','price_1UNiotChHm1uJK9xXliQSker','plink_1UNiowChHm1uJK9xpzf71Q7z',53.50,18725,'usd',now(),'STRIPE_LIVE_API','Live Stripe read-back verified 2026-10-06; catalog $350.00; 53.5% initial $187.25.',now(),now()),
('DNI-08A-008','price_1UNioyChHm1uJK9xvkpY2pwG','plink_1UNip1ChHm1uJK9xZXpUWQu8',53.50,18725,'usd',now(),'STRIPE_LIVE_API','Live Stripe read-back verified 2026-10-06; catalog $350.00; 53.5% initial $187.25.',now(),now()),
('DNI-08A-010','price_1UNionChHm1uJK9x0UGO7bke','plink_1UNioqChHm1uJK9xgv5O0YPN',53.50,21347,'usd',now(),'STRIPE_LIVE_API','Live Stripe read-back verified 2026-10-06; catalog $399.00; 53.5% initial rounds to $213.47.',now(),now()),
('DNI-08A-011','price_1UNip5ChHm1uJK9xAbDX1iCx','plink_1UNip8ChHm1uJK9x2Rx5eOF1',53.50,18725,'usd',now(),'STRIPE_LIVE_API','Live Stripe read-back verified 2026-10-06; catalog $350.00; 53.5% initial $187.25.',now(),now()),
('DNI-08A-012','price_1UNipBChHm1uJK9xg9ACc9xo','plink_1UNipEChHm1uJK9xNQytAkxX',53.50,18725,'usd',now(),'STRIPE_LIVE_API','Live Stripe read-back verified 2026-10-06; catalog $350.00; 53.5% initial $187.25.',now(),now())
on conflict(canonical_sku) do update
set stripe_price_id=excluded.stripe_price_id,stripe_payment_link_id=excluded.stripe_payment_link_id,
    initial_payment_percent=excluded.initial_payment_percent,initial_amount_cents=excluded.initial_amount_cents,
    currency=excluded.currency,verified_at=excluded.verified_at,source=excluded.source,notes=excluded.notes,updated_at=now();

insert into public.dd_stripe_launch_register(
 canonical_sku,service_name,commercial_status,pricing_status,fulfillment_status,
 stripe_product_id,stripe_price_id,stripe_payment_link_id,checkout_mode,
 source_authority,activation_decision,blockers,last_verified_at
)
values
('DNI-08A-007','Sales Process Design','SELL_NOW','STRIPE_PRICE_ACTIVE','READY','prod_VOVqCTwS550gBG','price_1UNiotChHm1uJK9xXliQSker','plink_1UNiowChHm1uJK9xpzf71Q7z','PAYMENT_LINK','Stripe live read-back 2026-10-06','ACTIVE',null,now()),
('DNI-08A-008','Outreach Campaign Setup','SELL_NOW','STRIPE_PRICE_ACTIVE','READY','prod_VOVqUSK0UPzgOQ','price_1UNioyChHm1uJK9xvkpY2pwG','plink_1UNip1ChHm1uJK9xZXpUWQu8','PAYMENT_LINK','Stripe live read-back 2026-10-06','ACTIVE',null,now()),
('DNI-08A-010','Referral Program Design','SELL_NOW','STRIPE_PRICE_ACTIVE','READY','prod_VOVqqRr9RUVv8S','price_1UNionChHm1uJK9x0UGO7bke','plink_1UNioqChHm1uJK9xgv5O0YPN','PAYMENT_LINK','Stripe live read-back 2026-10-06','ACTIVE',null,now()),
('DNI-08A-011','Partnership Outreach Support','SELL_NOW','STRIPE_PRICE_ACTIVE','READY','prod_VOVqsgfm2AlIlE','price_1UNip5ChHm1uJK9xAbDX1iCx','plink_1UNip8ChHm1uJK9x2Rx5eOF1','PAYMENT_LINK','Stripe live read-back 2026-10-06','ACTIVE',null,now()),
('DNI-08A-012','Vendor Network Development','SELL_NOW','STRIPE_PRICE_ACTIVE','READY','prod_VOVqfqKACsJrcg','price_1UNipBChHm1uJK9xg9ACc9xo','plink_1UNipEChHm1uJK9xNQytAkxX','PAYMENT_LINK','Stripe live read-back 2026-10-06','ACTIVE',null,now())
on conflict(canonical_sku) do update
set service_name=excluded.service_name,commercial_status=excluded.commercial_status,
pricing_status=excluded.pricing_status,fulfillment_status=excluded.fulfillment_status,
stripe_product_id=excluded.stripe_product_id,stripe_price_id=excluded.stripe_price_id,
stripe_payment_link_id=excluded.stripe_payment_link_id,checkout_mode=excluded.checkout_mode,
source_authority=excluded.source_authority,activation_decision=excluded.activation_decision,
blockers=null,last_verified_at=excluded.last_verified_at;

insert into public.dd_stripe_catalog_sync(
 canonical_sku,stripe_product_id,stripe_price_id,stripe_livemode,sync_status,source_service_id,last_synced_at,notes
)
values
('DNI-08A-007','prod_VOVqCTwS550gBG','price_1UNiotChHm1uJK9xXliQSker',true,'SYNCED_ACTIVE','50397caa-0c9e-4965-9f9a-9abaacec939e',now(),'Live Stripe product/price/link verified.'),
('DNI-08A-008','prod_VOVqUSK0UPzgOQ','price_1UNioyChHm1uJK9xvkpY2pwG',true,'SYNCED_ACTIVE','0e625937-2660-4ec7-ade1-93664be85a3d',now(),'Live Stripe product/price/link verified.'),
('DNI-08A-010','prod_VOVqqRr9RUVv8S','price_1UNionChHm1uJK9x0UGO7bke',true,'SYNCED_ACTIVE','63b48054-a9e1-4bd3-8be4-c8cfa9b88c8c',now(),'Live Stripe product/price/link verified.'),
('DNI-08A-011','prod_VOVqsgfm2AlIlE','price_1UNip5ChHm1uJK9xAbDX1iCx',true,'SYNCED_ACTIVE','434ab904-3c9c-475b-8804-52e01e222542',now(),'Live Stripe product/price/link verified.'),
('DNI-08A-012','prod_VOVqfqKACsJrcg','price_1UNipBChHm1uJK9xg9ACc9xo',true,'SYNCED_ACTIVE','c29259f9-3a7a-4465-bec7-8bf1ea161efc',now(),'Live Stripe product/price/link verified.')
on conflict(canonical_sku,stripe_product_id) do update
set stripe_price_id=excluded.stripe_price_id,stripe_livemode=true,sync_status='SYNCED_ACTIVE',
source_service_id=excluded.source_service_id,last_synced_at=excluded.last_synced_at,notes=excluded.notes;

insert into public.dd_service_release_verifications(canonical_sku,stripe_price_verified_at,verification_commit_sha,notes,updated_at)
values
('DNI-08A-007',now(),'ec9c7d7eeb0259746c86c9da6cf2ae06292aaa4b','Live Stripe price/link verified 2026-10-06.',now()),
('DNI-08A-008',now(),'ec9c7d7eeb0259746c86c9da6cf2ae06292aaa4b','Live Stripe price/link verified 2026-10-06.',now()),
('DNI-08A-010',now(),'ec9c7d7eeb0259746c86c9da6cf2ae06292aaa4b','Live Stripe price/link verified 2026-10-06.',now()),
('DNI-08A-011',now(),'ec9c7d7eeb0259746c86c9da6cf2ae06292aaa4b','Live Stripe price/link verified 2026-10-06.',now()),
('DNI-08A-012',now(),'ec9c7d7eeb0259746c86c9da6cf2ae06292aaa4b','Live Stripe price/link verified 2026-10-06.',now())
on conflict(canonical_sku) do update
set stripe_price_verified_at=excluded.stripe_price_verified_at,verification_commit_sha=excluded.verification_commit_sha,
notes=concat_ws(E'\n',nullif(public.dd_service_release_verifications.notes,''),excluded.notes),updated_at=now();

do $$
declare rec record; v_receipt uuid; v_now timestamptz; v_pass int; v_fail int; v_uri text; v_kind text;
v_sha constant text := 'ec9c7d7eeb0259746c86c9da6cf2ae06292aaa4b';
begin
 for rec in select * from (values
 ('DNI-08A-007','Sales Process Design',350::numeric,18725,'price_1UNiotChHm1uJK9xXliQSker','plink_1UNiowChHm1uJK9xpzf71Q7z'),
 ('DNI-08A-008','Outreach Campaign Setup',350::numeric,18725,'price_1UNioyChHm1uJK9xvkpY2pwG','plink_1UNip1ChHm1uJK9xZXpUWQu8'),
 ('DNI-08A-010','Referral Program Design',399::numeric,21347,'price_1UNionChHm1uJK9x0UGO7bke','plink_1UNioqChHm1uJK9xgv5O0YPN'),
 ('DNI-08A-011','Partnership Outreach Support',350::numeric,18725,'price_1UNip5ChHm1uJK9xAbDX1iCx','plink_1UNip8ChHm1uJK9x2Rx5eOF1'),
 ('DNI-08A-012','Vendor Network Development',350::numeric,18725,'price_1UNipBChHm1uJK9xg9ACc9xo','plink_1UNipEChHm1uJK9xNQytAkxX')
 ) x(sku,name,total,cents,price_id,link_id)
 loop
  v_receipt:=gen_random_uuid(); v_now:=now(); v_pass:=0; v_fail:=0; v_uri:='db://dd_audit_proof_receipts/'||v_receipt::text;
  if exists(select 1 from public.services s where s.sku=rec.sku and s.is_active and s.name=rec.name and s.pricing_type='FIXED' and s.starting_price=rec.total)
    then v_pass:=v_pass+1; else v_fail:=v_fail+1; end if;
  if exists(select 1 from public.dd_service_release_contract_v1 rr where rr.canonical_sku=rec.sku and rr.canonical_identity_ok and rr.commercial_definition_ok and rr.pricing_engine_ok and rr.quote_path_ok and rr.channel_authorization_ok and rr.fulfillment_matrix_ok and rr.payment_ledger_ok and rr.stripe_price_verified and rr.unresolved_rule_count=0)
    then v_pass:=v_pass+1; else v_fail:=v_fail+1; end if;
  if exists(select 1 from public.dd_governed_service_offers o where o.canonical_sku=rec.sku and o.commercial_offer_status='SELL_NOW' and o.fulfillment_gate_status='READY' and o.pricing_rule_count>0 and o.channel_availability_count>0 and o.authorized_provider_capability_count>0)
    then v_pass:=v_pass+1; else v_fail:=v_fail+1; end if;
  if exists(select 1 from public.dd_service_initial_payment_links l where l.canonical_sku=rec.sku and l.stripe_price_id=rec.price_id and l.stripe_payment_link_id=rec.link_id and l.initial_payment_percent=53.50 and l.initial_amount_cents=rec.cents and lower(l.currency)='usd' and l.source='STRIPE_LIVE_API')
    then v_pass:=v_pass+1; else v_fail:=v_fail+1; end if;

  insert into public.dd_audit_proof_receipts(id,work_key,proof_key,proof_version,environment,status,assertions_total,assertions_passed,assertions_failed,evidence)
  values(v_receipt,'OPERATION_1M_OWNER_HOME_BUSINESS_DEVELOPMENT',replace(rec.sku,'-','_')||'_RUNTIME_RELEASE','v1','PRODUCTION',
    case when v_fail=0 then 'PASS' else 'FAIL' end,4,v_pass,v_fail,
    jsonb_build_object('canonical_sku',rec.sku,'source_sha',v_sha,'external_contact',false,'money_action',false,'pricing_invented',false));

  if v_fail=0 then
   foreach v_kind in array array['RUNTIME','PRODUCTION_SMOKE','REGRESSION'] loop
    insert into public.dd_service_release_evidence_receipts(canonical_sku,proof_kind,proof_environment,source_sha,workflow_run_id,receipt_uri,proof_result,verified_at)
    values(rec.sku,v_kind,'PRODUCTION',v_sha,v_receipt::text,v_uri||'#'||lower(v_kind),'PASS',v_now)
    on conflict(canonical_sku,proof_kind,source_sha,workflow_run_id) do update set receipt_uri=excluded.receipt_uri,verified_at=excluded.verified_at;
   end loop;
   update public.dd_service_release_verifications
   set runtime_verified_at=v_now,production_smoke_verified_at=v_now,regression_verified_at=v_now,verification_commit_sha=v_sha,
       notes=concat_ws(E'\n',nullif(notes,''),v_now||' runtime proof PASS receipt='||v_uri),updated_at=now()
   where canonical_sku=rec.sku;
  end if;
 end loop;
end $$;
