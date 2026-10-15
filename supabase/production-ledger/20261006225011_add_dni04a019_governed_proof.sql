
create or replace function public.dd_prove_dni04a019(p_source_sha text)
returns uuid
language plpgsql
security definer
set search_path to 'public','pg_catalog'
as $$
declare
  v_id uuid:=gen_random_uuid();
  v_pass int:=0;
  v_fail int:=0;
  r record;
begin
  if current_user not in ('service_role','postgres') then raise exception 'SERVICE_ROLE_REQUIRED'; end if;
  if length(trim(coalesce(p_source_sha,'')))<7 then raise exception 'SOURCE_SHA_REQUIRED'; end if;

  select * into r from public.dd_service_release_contract_v1 where canonical_sku='DNI-04A-019';

  if r.canonical_identity_ok then v_pass:=v_pass+1; else v_fail:=v_fail+1; end if;
  if r.pricing_engine_ok then v_pass:=v_pass+1; else v_fail:=v_fail+1; end if;
  if r.quote_path_ok then v_pass:=v_pass+1; else v_fail:=v_fail+1; end if;
  if r.channel_authorization_ok then v_pass:=v_pass+1; else v_fail:=v_fail+1; end if;
  if r.fulfillment_matrix_ok then v_pass:=v_pass+1; else v_fail:=v_fail+1; end if;
  if r.payment_ledger_ok and r.has_payment_link and r.has_stripe_price and r.stripe_register_authorized and r.stripe_sync_active and r.stripe_price_verified then v_pass:=v_pass+1; else v_fail:=v_fail+1; end if;
  if r.runtime_accuracy_ok then v_pass:=v_pass+1; else v_fail:=v_fail+1; end if;
  if exists(select 1 from public.services s where s.sku='DNI-04A-019' and s.is_active and s.name='Executive Assistant Support' and s.pricing_type='FIXED' and s.billing_cycle='ONETIME' and s.starting_price=325 and s.resident_discount_eligible=false) then v_pass:=v_pass+1; else v_fail:=v_fail+1; end if;

  insert into public.dd_audit_proof_receipts(
    id,work_key,proof_key,proof_version,environment,status,
    assertions_total,assertions_passed,assertions_failed,evidence
  )
  values(
    v_id,'OPERATION_1M_D04_SELLABILITY','DNI_04A_019_FIXED_RELEASE','v1','PRODUCTION',
    case when v_fail=0 then 'PASS' else 'FAIL' end,
    8,v_pass,v_fail,
    jsonb_build_object(
      'canonical_sku','DNI-04A-019',
      'source_sha',trim(p_source_sha),
      'external_contact',false,
      'money_action',false,
      'pricing_invented',false
    )
  );

  return v_id;
end
$$;

revoke execute on function public.dd_prove_dni04a019(text) from public,anon,authenticated;
grant execute on function public.dd_prove_dni04a019(text) to service_role;
