-- Operation $1M Lane B: governed runtime + regression proof for FIXED SKUs whose live Stripe objects were registered 2026-10-06.
-- Runtime accuracy = every price surface a buyer or the quote path can see agrees with the LOCKED ACTIVE pricing rule,
-- the 53.5% initial payment link equals round(locked * 0.535), and register/sync/link IDs agree.
-- Regression = after stamping, no previously LIVE_READY SKU dropped and the SKU has no other failing gate.
-- No pricing is changed. No Stripe object is created. No external contact. Stamps only on PASS.
CREATE OR REPLACE FUNCTION public.dd_run_release_runtime_price_proof(p_sku text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'pg_catalog'
AS $fn$
declare
 c record; s record; lk bigint; unres bigint; mx bigint; l record; rg record; sy record;
 a jsonb:='[]'::jsonb; total int:=0; failed int:=0; rid uuid:=gen_random_uuid(); ok boolean;
begin
 select * into c from dd_service_release_contract_v1 where canonical_sku=p_sku;
 select * into s from services where id=c.runtime_service_id;
 select max(base_price_cents) filter (where status='ACTIVE' and lock_status='LOCKED'), count(distinct base_price_cents) filter (where status='ACTIVE' and lock_status='LOCKED') into lk, unres from dd_service_pricing_rules where service_id=c.runtime_service_id;
 select max(base_price_cents) into mx from dd_master_service_capability_channel_matrix where sku=p_sku;
 select * into l from dd_service_initial_payment_links where canonical_sku=p_sku limit 1;
 select * into rg from dd_stripe_launch_register where canonical_sku=p_sku and activation_decision='ACTIVE' order by last_verified_at desc limit 1;
 select * into sy from dd_stripe_catalog_sync where canonical_sku=p_sku and sync_status='SYNCED_ACTIVE' and stripe_livemode order by last_synced_at desc limit 1;
 ok:= c.canonical_sku is not null and c.canonical_identity_ok; ok:=coalesce(ok,false); total:=total+1; if not ok then failed:=failed+1; end if; a:=a||jsonb_build_object('identity',ok);
 ok:= lk is not null and unres=1 and c.unresolved_rule_count=0; ok:=coalesce(ok,false); total:=total+1; if not ok then failed:=failed+1; end if; a:=a||jsonb_build_object('single_locked_price_across_channels',ok,'locked_cents',lk);
 ok:= c.pricing_type='FIXED'; ok:=coalesce(ok,false); total:=total+1; if not ok then failed:=failed+1; end if; a:=a||jsonb_build_object('fixed_pricing',ok);
 ok:= s.starting_price is not null and round(s.starting_price*100)=lk; ok:=coalesce(ok,false); total:=total+1; if not ok then failed:=failed+1; end if; a:=a||jsonb_build_object('starting_price_matches_locked',ok,'starting_price',s.starting_price);
 ok:= (s.base_price_cents is null or s.base_price_cents=lk) and (s.public_price_low is null or round(s.public_price_low*100)=lk); ok:=coalesce(ok,false); total:=total+1; if not ok then failed:=failed+1; end if; a:=a||jsonb_build_object('public_price_matches_locked',ok,'svc_base_cents',s.base_price_cents,'public_price_low',s.public_price_low,'public_price_display',s.public_price_display);
 ok:= coalesce(s.public_price_display,'') !~* '(month|/mo|monthly)'; ok:=coalesce(ok,false); total:=total+1; if not ok then failed:=failed+1; end if; a:=a||jsonb_build_object('no_recurring_label_on_fixed',ok);
 ok:= mx is null or mx=lk; ok:=coalesce(ok,false); total:=total+1; if not ok then failed:=failed+1; end if; a:=a||jsonb_build_object('matrix_matches_locked',ok,'matrix_cents',mx);
 ok:= l.canonical_sku is not null and l.initial_payment_percent=53.5 and l.initial_amount_cents=round(lk*0.535); ok:=coalesce(ok,false); total:=total+1; if not ok then failed:=failed+1; end if; a:=a||jsonb_build_object('initial_amount_is_53_5_pct',ok,'initial_cents',l.initial_amount_cents);
 ok:= rg.canonical_sku is not null and rg.stripe_price_id=l.stripe_price_id and rg.stripe_payment_link_id=l.stripe_payment_link_id; ok:=coalesce(ok,false); total:=total+1; if not ok then failed:=failed+1; end if; a:=a||jsonb_build_object('register_matches_link',ok);
 ok:= sy.canonical_sku is not null and sy.stripe_price_id=rg.stripe_price_id and sy.stripe_product_id=rg.stripe_product_id and sy.source_service_id=c.runtime_service_id; ok:=coalesce(ok,false); total:=total+1; if not ok then failed:=failed+1; end if; a:=a||jsonb_build_object('sync_matches_register',ok);
 ok:= c.channel_authorization_ok and c.fulfillment_matrix_ok and c.active_task_template_count>0; ok:=coalesce(ok,false); total:=total+1; if not ok then failed:=failed+1; end if; a:=a||jsonb_build_object('channel_and_fulfillment',ok);
 ok:= c.payment_ledger_ok; ok:=coalesce(ok,false); total:=total+1; if not ok then failed:=failed+1; end if; a:=a||jsonb_build_object('payment_ledger',ok);
 insert into dd_audit_proof_receipts(id,work_key,proof_key,environment,status,assertions_total,assertions_passed,assertions_failed,evidence)
 values(rid,'OPERATION_1M_LANE_B_RELEASE_TRAIN','RUNTIME_PRICE_ACCURACY_'||p_sku,'PRODUCTION',case when failed=0 then 'PASS' else 'FAIL' end,total,total-failed,failed,
  jsonb_build_object('canonical_sku',p_sku,'assertions',a,'pricing_changed',false,'stripe_objects_created',false,'external_contact',false,'money_action',false));
 if failed=0 then
  insert into dd_service_release_verifications(canonical_sku,runtime_verified_at,notes,updated_at) values(p_sku,now(),now()::text||' runtime price-accuracy proof PASS receipt=db://dd_audit_proof_receipts/'||rid::text,now())
  on conflict (canonical_sku) do update set runtime_verified_at=now(), notes=coalesce(dd_service_release_verifications.notes||chr(10),'')||excluded.notes, updated_at=now();
 end if;
 return jsonb_build_object('sku',p_sku,'status',case when failed=0 then 'PASS' else 'FAIL' end,'failed',failed,'receipt',rid,'assertions',a);
end $fn$;

CREATE OR REPLACE FUNCTION public.dd_run_release_train_batch(p_skus text[])
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'pg_catalog'
AS $fn$
declare before_live text[]; r jsonb; results jsonb:='[]'::jsonb; sku text; dropped text[]; rid uuid:=gen_random_uuid(); promoted text[];
begin
 select array_agg(canonical_sku) into before_live from dd_service_release_contract_v1 where release_state='LIVE_READY';
 foreach sku in array p_skus loop r:=dd_run_release_runtime_price_proof(sku); results:=results||r; end loop;
 select array_agg(x) into dropped from unnest(before_live) x where not exists (select 1 from dd_service_release_contract_v1 v where v.canonical_sku=x and v.release_state='LIVE_READY');
 if coalesce(array_length(dropped,1),0)=0 then
  update dd_service_release_verifications v set regression_verified_at=now(), notes=coalesce(v.notes||chr(10),'')||now()::text||' release-train regression PASS (no LIVE_READY SKU dropped, all non-regression gates pass) receipt=db://dd_audit_proof_receipts/'||rid::text, updated_at=now()
  from dd_service_release_contract_v1 c
  where c.canonical_sku=v.canonical_sku and v.canonical_sku=any(p_skus) and v.runtime_verified_at is not null
   and c.blocking_gate='REGRESSION_VERIFIED';
 end if;
 select array_agg(canonical_sku) into promoted from dd_service_release_contract_v1 where canonical_sku=any(p_skus) and release_state='LIVE_READY';
 insert into dd_audit_proof_receipts(id,work_key,proof_key,environment,status,assertions_total,assertions_passed,assertions_failed,evidence)
 values(rid,'OPERATION_1M_LANE_B_RELEASE_TRAIN','RELEASE_TRAIN_REGRESSION_'||to_char(now(),'YYYYMMDDHH24MI'),'PRODUCTION',case when coalesce(array_length(dropped,1),0)=0 then 'PASS' else 'FAIL' end,1,case when coalesce(array_length(dropped,1),0)=0 then 1 else 0 end,case when coalesce(array_length(dropped,1),0)=0 then 0 else 1 end,
  jsonb_build_object('live_ready_before',coalesce(array_length(before_live,1),0),'dropped',dropped,'promoted',promoted,'skus',p_skus));
 return jsonb_build_object('dropped',dropped,'promoted',promoted,'promoted_count',coalesce(array_length(promoted,1),0),'regression_receipt',rid,'results',results);
end $fn$;
