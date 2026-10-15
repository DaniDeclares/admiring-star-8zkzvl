
create or replace function public.dd_run_active_audit_subproofs(p_limit integer default 3) returns jsonb language plpgsql security definer set search_path='public' as $$
declare r record;rid uuid;executed int:=0;passed int:=0;failed int:=0;details jsonb:='[]'::jsonb;receipt_status text;
begin
 for r in select * from public.dd_audit_subproof_requirements where status='ACTIVE' order by coalesce(last_run_at,'epoch'::timestamptz),pass_number,proof_key limit greatest(1,least(coalesce(p_limit,3),10))
 loop
  if r.executor_function !~ '^dd_prove_[a-z0-9_]+$' then update public.dd_audit_subproof_requirements set last_run_at=now(),last_status='INVALID_EXECUTOR',run_count=run_count+1,updated_at=now() where proof_key=r.proof_key;failed:=failed+1;details:=details||jsonb_build_array(jsonb_build_object('proof_key',r.proof_key,'status','INVALID_EXECUTOR'));continue;end if;
  if to_regprocedure('public.'||r.executor_function||'()') is null then update public.dd_audit_subproof_requirements set last_run_at=now(),last_status='EXECUTOR_MISSING',run_count=run_count+1,updated_at=now() where proof_key=r.proof_key;failed:=failed+1;details:=details||jsonb_build_array(jsonb_build_object('proof_key',r.proof_key,'status','EXECUTOR_MISSING'));continue;end if;
  begin execute format('select public.%I()',r.executor_function) into rid;select status into receipt_status from public.dd_audit_proof_receipts where id=rid;
   update public.dd_audit_subproof_requirements set last_run_at=now(),last_receipt_id=rid,last_status=coalesce(receipt_status,'UNKNOWN'),run_count=run_count+1,updated_at=now() where proof_key=r.proof_key;
   executed:=executed+1;if receipt_status='PASS' then passed:=passed+1;else failed:=failed+1;end if;details:=details||jsonb_build_array(jsonb_build_object('proof_key',r.proof_key,'receipt_id',rid,'status',receipt_status));
  exception when others then update public.dd_audit_subproof_requirements set last_run_at=now(),last_status='ERROR',run_count=run_count+1,metadata=metadata||jsonb_build_object('last_error',sqlerrm,'last_error_at',now()),updated_at=now() where proof_key=r.proof_key;failed:=failed+1;details:=details||jsonb_build_array(jsonb_build_object('proof_key',r.proof_key,'status','ERROR','error',sqlerrm));end;
 end loop;
 return jsonb_build_object('executed',executed,'passed',passed,'failed',failed,'details',details);
end $$;
revoke all on function public.dd_run_active_audit_subproofs(integer) from public,anon,authenticated;grant execute on function public.dd_run_active_audit_subproofs(integer) to service_role;
