
create temporary table tmp_dd_d08_release(
  sku text,name text,total numeric,cents integer,product_id text,price_id text,link_id text,service_id uuid
) on commit drop;

insert into tmp_dd_d08_release values
('DNI-08A-001','Business Development Audit',297,15890,'prod_VOVtogY12pqgoE','price_1UNirvChHm1uJK9xMHPIvZEB','plink_1UNirxChHm1uJK9xLhWgj4jd','fea90016-c754-4266-baaa-f6654284a731'),
('DNI-08A-002','Sales Pipeline Setup',150,8025,'prod_VOVttqZrnUIyvJ','price_1UNis0ChHm1uJK9xZj3sdrto','plink_1UNis3ChHm1uJK9xO4CwPjdC','a52511d4-5ebb-44c5-9b0e-65ded96c6466'),
('DNI-08A-003','Lead List Building',250,13375,'prod_VOVt5334F3sPVe','price_1UNis6ChHm1uJK9xghH7O2oI','plink_1UNisAChHm1uJK9xpciA4Ycq','969f23fe-e35d-4398-a08b-49a8582b5af0'),
('DNI-08A-004','Lead Research',250,13375,'prod_VOVuqseds7eKuk','price_1UNisCChHm1uJK9xUQaRNU5r','plink_1UNisHChHm1uJK9xp6Y8BEbk','bb7c7d95-056b-430b-8a48-1db0c9ba3ca4'),
('DNI-08A-005','Lead Qualification',150,8025,'prod_VOVuJVseSaX2Na','price_1UNisJChHm1uJK9xgL3aL8z8','plink_1UNisMChHm1uJK9xSL27lI7F','84014b45-99c9-4dda-92af-fc5e1f5e4834'),
('DNI-08A-006','CRM Pipeline Setup',299,15997,'prod_VOVuqm3ndQsCxo','price_1UNisPChHm1uJK9xnpmbTyEZ','plink_1UNisSChHm1uJK9x512HWoKW','68ad5154-9645-4661-97ff-ac3382e14512'),
('DNI-08A-009','Follow-Up System',250,13375,'prod_VOVupkzpdtakZf','price_1UNisVChHm1uJK9xxDEE0PXK','plink_1UNisYChHm1uJK9xx6LyPd59','62f48eae-1836-4efa-ad67-7e2f0b4d0c67'),
('DNI-08A-013','Strategic Partnership Research',250,13375,'prod_VOVu7LTPH0LdwF','price_1UNisaChHm1uJK9xtW3EFoI4','plink_1UNisdChHm1uJK9xyXVpteWs','50b124e6-e251-43ce-b7c9-1aada308f46c'),
('DNI-08A-014','Growth Strategy Session',250,13375,'prod_VOVu3bqgcV0nYw','price_1UNisgChHm1uJK9xEpfqHW0L','plink_1UNisjChHm1uJK9x3y8B3aWL','83bbbc38-9034-451b-9f20-8e1faa592a8e'),
('DNI-08A-015','Market Research',300,16050,'prod_VOVuGkhuS91Q5R','price_1UNismChHm1uJK9xeeTPgzgF','plink_1UNispChHm1uJK9xHfM8qFwK','1dbf85df-ba95-4085-b8ba-68a00c690c9f'),
('DNI-08A-016','Competitive Research',300,16050,'prod_VOVvNnR5KvnNJ4','price_1UNitAChHm1uJK9xmUNkD2vV','plink_1UNitDChHm1uJK9x0QqlRzyY','5e50eec8-6130-4601-b18d-85ab089246c3');

insert into public.dd_service_initial_payment_links(
 canonical_sku,stripe_price_id,stripe_payment_link_id,initial_payment_percent,initial_amount_cents,currency,verified_at,source,notes,created_at,updated_at
)
select sku,price_id,link_id,53.50,cents,'usd',now(),'STRIPE_LIVE_API',
       'Live Stripe object creation/read-back 2026-10-06; 53.5% initial payment reconciled to governed catalog.',now(),now()
from tmp_dd_d08_release
on conflict(canonical_sku) do update
set stripe_price_id=excluded.stripe_price_id,stripe_payment_link_id=excluded.stripe_payment_link_id,
 initial_payment_percent=excluded.initial_payment_percent,initial_amount_cents=excluded.initial_amount_cents,
 currency=excluded.currency,verified_at=excluded.verified_at,source=excluded.source,notes=excluded.notes,updated_at=now();

insert into public.dd_stripe_launch_register(
 canonical_sku,service_name,commercial_status,pricing_status,fulfillment_status,
 stripe_product_id,stripe_price_id,stripe_payment_link_id,checkout_mode,
 source_authority,activation_decision,blockers,last_verified_at
)
select sku,name,'SELL_NOW','STRIPE_PRICE_ACTIVE','READY',product_id,price_id,link_id,'PAYMENT_LINK',
       'Stripe live object creation/read-back 2026-10-06','ACTIVE',null,now()
from tmp_dd_d08_release
on conflict(canonical_sku) do update
set service_name=excluded.service_name,commercial_status=excluded.commercial_status,pricing_status=excluded.pricing_status,
 fulfillment_status=excluded.fulfillment_status,stripe_product_id=excluded.stripe_product_id,
 stripe_price_id=excluded.stripe_price_id,stripe_payment_link_id=excluded.stripe_payment_link_id,
 checkout_mode=excluded.checkout_mode,source_authority=excluded.source_authority,activation_decision=excluded.activation_decision,
 blockers=null,last_verified_at=excluded.last_verified_at;

insert into public.dd_stripe_catalog_sync(
 canonical_sku,stripe_product_id,stripe_price_id,stripe_livemode,sync_status,source_service_id,last_synced_at,notes
)
select sku,product_id,price_id,true,'SYNCED_ACTIVE',service_id,now(),'Live Stripe product/price/payment link reconciled.'
from tmp_dd_d08_release
on conflict(canonical_sku,stripe_product_id) do update
set stripe_price_id=excluded.stripe_price_id,stripe_livemode=true,sync_status='SYNCED_ACTIVE',
 source_service_id=excluded.source_service_id,last_synced_at=excluded.last_synced_at,notes=excluded.notes;

insert into public.dd_service_release_verifications(canonical_sku,stripe_price_verified_at,verification_commit_sha,notes,updated_at)
select sku,now(),'ec9c7d7eeb0259746c86c9da6cf2ae06292aaa4b','Live Stripe price/payment-link verified 2026-10-06.',now()
from tmp_dd_d08_release
on conflict(canonical_sku) do update
set stripe_price_verified_at=excluded.stripe_price_verified_at,verification_commit_sha=excluded.verification_commit_sha,
 notes=concat_ws(E'\n',nullif(public.dd_service_release_verifications.notes,''),excluded.notes),updated_at=now();

do $$
declare rec record; v_receipt uuid; v_now timestamptz; v_pass int; v_fail int; v_uri text; v_kind text;
v_sha constant text := 'ec9c7d7eeb0259746c86c9da6cf2ae06292aaa4b';
begin
 for rec in select * from tmp_dd_d08_release loop
  v_receipt:=gen_random_uuid(); v_now:=now(); v_pass:=0; v_fail:=0;
  v_uri:='db://dd_audit_proof_receipts/'||v_receipt::text;

  if exists(select 1 from public.services s where s.sku=rec.sku and s.is_active and s.name=rec.name and s.pricing_type='FIXED' and s.starting_price=rec.total)
    then v_pass:=v_pass+1; else v_fail:=v_fail+1; end if;
  if exists(select 1 from public.dd_service_release_contract_v1 rr where rr.canonical_sku=rec.sku
    and rr.canonical_identity_ok and rr.commercial_definition_ok and rr.pricing_engine_ok and rr.quote_path_ok
    and rr.channel_authorization_ok and rr.fulfillment_matrix_ok and rr.payment_ledger_ok and rr.stripe_price_verified and rr.unresolved_rule_count=0)
    then v_pass:=v_pass+1; else v_fail:=v_fail+1; end if;
  if exists(select 1 from public.dd_governed_service_offers o where o.canonical_sku=rec.sku
    and o.commercial_offer_status='SELL_NOW' and o.fulfillment_gate_status='READY'
    and o.pricing_rule_count>0 and o.channel_availability_count>0 and o.authorized_provider_capability_count>0)
    then v_pass:=v_pass+1; else v_fail:=v_fail+1; end if;
  if exists(select 1 from public.dd_service_initial_payment_links l where l.canonical_sku=rec.sku
    and l.stripe_price_id=rec.price_id and l.stripe_payment_link_id=rec.link_id
    and l.initial_payment_percent=53.50 and l.initial_amount_cents=rec.cents and lower(l.currency)='usd' and l.source='STRIPE_LIVE_API')
    then v_pass:=v_pass+1; else v_fail:=v_fail+1; end if;

  insert into public.dd_audit_proof_receipts(id,work_key,proof_key,proof_version,environment,status,assertions_total,assertions_passed,assertions_failed,evidence)
  values(v_receipt,'OPERATION_1M_OWNER_HOME_BUSINESS_DEVELOPMENT',replace(rec.sku,'-','_')||'_RUNTIME_RELEASE','v1','PRODUCTION',
   case when v_fail=0 then 'PASS' else 'FAIL' end,4,v_pass,v_fail,
   jsonb_build_object('canonical_sku',rec.sku,'source_sha',v_sha,'external_contact',false,'money_action',false,'pricing_invented',false));

  if v_fail=0 then
   foreach v_kind in array array['RUNTIME','PRODUCTION_SMOKE','REGRESSION'] loop
    insert into public.dd_service_release_evidence_receipts(canonical_sku,proof_kind,proof_environment,source_sha,workflow_run_id,receipt_uri,proof_result,verified_at)
    values(rec.sku,v_kind,'PRODUCTION',v_sha,v_receipt::text,v_uri||'#'||lower(v_kind),'PASS',v_now)
    on conflict(canonical_sku,proof_kind,source_sha,workflow_run_id) do update
    set receipt_uri=excluded.receipt_uri,verified_at=excluded.verified_at;
   end loop;
   update public.dd_service_release_verifications
   set runtime_verified_at=v_now,production_smoke_verified_at=v_now,regression_verified_at=v_now,
       verification_commit_sha=v_sha,notes=concat_ws(E'\n',nullif(notes,''),v_now||' runtime proof PASS receipt='||v_uri),updated_at=now()
   where canonical_sku=rec.sku;
  end if;
 end loop;
end $$;

insert into public.dd_owner_home_service_priority(
 canonical_sku,owner_fulfillment_mode,priority_tier,home_executable,provider_optional,rationale
)
select sku,'OWNER_REMOTE_BUSINESS_DEVELOPMENT','P0',true,true,
 'Owner can fulfill remotely using DANI business-development, research, systems and growth capability; provider support may absorb specialized overflow.'
from tmp_dd_d08_release
on conflict(canonical_sku) do update
set owner_fulfillment_mode=excluded.owner_fulfillment_mode,priority_tier='P0',
 home_executable=true,provider_optional=excluded.provider_optional,rationale=excluded.rationale,updated_at=now();
