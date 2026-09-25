-- Autonomous registered audit subproof runner.
-- Only executes allowlisted dd_prove_* zero-argument functions from dd_audit_subproof_requirements.

alter table public.dd_audit_subproof_requirements
 add column if not exists last_run_at timestamptz,
 add column if not exists last_receipt_id uuid,
 add column if not exists last_status text,
 add column if not exists run_count int not null default 0;

create or replace function public.dd_run_active_audit_subproofs(p_limit int default 3)
returns jsonb
language plpgsql
security definer
set search_path='public'
as $$
declare
  r record;
  rid uuid;
  executed int:=0;
  passed int:=0;
  failed int:=0;
  details jsonb:='[]'::jsonb;
  receipt_status text;
begin
  for r in
    select *
    from public.dd_audit_subproof_requirements
    where status='ACTIVE'
    order by coalesce(last_run_at,'epoch'::timestamptz),pass_number,proof_key
    limit greatest(1,least(coalesce(p_limit,3),10))
  loop
    if r.executor_function !~ '^dd_prove_[a-z0-9_]+$' then
      update public.dd_audit_subproof_requirements
         set last_run_at=now(),last_status='INVALID_EXECUTOR',run_count=run_count+1,updated_at=now()
       where proof_key=r.proof_key;
      failed:=failed+1;
      details:=details||jsonb_build_array(jsonb_build_object('proof_key',r.proof_key,'status','INVALID_EXECUTOR'));
      continue;
    end if;

    if to_regprocedure('public.'||r.executor_function||'()') is null then
      update public.dd_audit_subproof_requirements
         set last_run_at=now(),last_status='EXECUTOR_MISSING',run_count=run_count+1,updated_at=now()
       where proof_key=r.proof_key;
      failed:=failed+1;
      details:=details||jsonb_build_array(jsonb_build_object('proof_key',r.proof_key,'status','EXECUTOR_MISSING'));
      continue;
    end if;

    begin
      execute format('select public.%I()',r.executor_function) into rid;
      select status into receipt_status from public.dd_audit_proof_receipts where id=rid;

      update public.dd_audit_subproof_requirements
         set last_run_at=now(),
             last_receipt_id=rid,
             last_status=coalesce(receipt_status,'UNKNOWN'),
             run_count=run_count+1,
             updated_at=now()
       where proof_key=r.proof_key;

      executed:=executed+1;
      if receipt_status='PASS' then passed:=passed+1; else failed:=failed+1; end if;

      details:=details||jsonb_build_array(
        jsonb_build_object('proof_key',r.proof_key,'receipt_id',rid,'status',receipt_status)
      );
    exception when others then
      update public.dd_audit_subproof_requirements
         set last_run_at=now(),
             last_status='ERROR',
             run_count=run_count+1,
             metadata=metadata||jsonb_build_object('last_error',sqlerrm,'last_error_at',now()),
             updated_at=now()
       where proof_key=r.proof_key;

      failed:=failed+1;
      details:=details||jsonb_build_array(
        jsonb_build_object('proof_key',r.proof_key,'status','ERROR','error',sqlerrm)
      );
    end;
  end loop;

  return jsonb_build_object(
    'executed',executed,
    'passed',passed,
    'failed',failed,
    'details',details
  );
end $$;

revoke all on function public.dd_run_active_audit_subproofs(int) from public,anon,authenticated;
grant execute on function public.dd_run_active_audit_subproofs(int) to service_role;

create or replace function public.dd_run_audit_autopilot_supervisor()
returns uuid
language plpgsql
security definer
set search_path='public'
as $$
declare
  v_run uuid:=gen_random_uuid();
  v_work public.dd_software_build_work_queue%rowtype;
  v_proof uuid;
  v_subproofs jsonb;
  v_runnable int:=0;
  v_blocked int:=0;
  v_owner int:=0;
  v_action text:='NO_RUNNABLE_WORK';
  v_external_pending int:=0;
  v_executor_configured boolean:=false;
begin
  insert into public.dd_audit_autopilot_runs(id) values(v_run);

  perform public.dd_requeue_expired_external_action_leases();
  perform public.dd_run_unattended_green_controller();
  perform public.dd_run_software_build_controller();
  perform public.dd_run_company_controller();

  select exists(
    select 1
    from vault.decrypted_secrets
    where name in ('dd_external_action_worker_url','dd_external_action_worker_key')
  )
  into v_executor_configured;

  select count(*) into v_external_pending
  from public.dd_external_action_outbox
  where status='PENDING';

  if v_external_pending>0 and not v_executor_configured then
    insert into public.dd_owner_attention_queue(
      domain,source_table,source_record_id,reason,priority,recommended_action,metadata
    )
    values(
      'SOFTWARE_PLATFORM',
      'dd_external_action_outbox',
      'EXECUTOR_ENDPOINT',
      'External-action executor endpoint is not configured',
      'P1',
      'Configure the governed external-action worker endpoint/key so approved GitHub/Vercel outbox actions can execute.',
      jsonb_build_object('pending_actions',v_external_pending,'autopilot',true,'tester_only',true)
    )
    on conflict do nothing;
  end if;

  select public.dd_run_core_runtime_health_proof() into v_proof;
  select public.dd_run_active_audit_subproofs(3) into v_subproofs;
  v_action:='PROOFS_EXECUTED';

  select * into v_work
  from public.dd_software_build_work_queue
  where status='READY'
    and owner_decision_required=false
    and execution_mode='CODE_BUILD'
  order by case priority when 'P0' then 0 when 'P1' then 1 else 2 end,
           pass_number,updated_at,id
  limit 1
  for update skip locked;

  if found then
    update public.dd_software_build_work_queue
       set last_result=coalesce(last_result,'{}'::jsonb)||
         jsonb_build_object(
           'autopilot_run',v_run,
           'classification','AWAITING_EXECUTOR',
           'safe_to_auto_promote',false,
           'reason','Code build requires governed source-control executor + CI evidence; SQL supervisor will not author/merge code.'
         ),
           updated_at=now()
     where id=v_work.id;
  end if;

  select
    count(*) filter(where status='READY' and owner_decision_required=false),
    count(*) filter(where status='BLOCKED'),
    count(*) filter(where status='BLOCKED' and owner_decision_required=true)
  into v_runnable,v_blocked,v_owner
  from public.dd_software_build_work_queue;

  update public.dd_audit_autopilot_runs
     set completed_at=now(),
         status='COMPLETED',
         selected_work_id=v_work.id,
         selected_work_key=v_work.work_key,
         selected_execution_mode=v_work.execution_mode,
         action_taken=v_action,
         runnable_count=v_runnable,
         blocked_count=v_blocked,
         owner_blocked_count=v_owner,
         evidence=jsonb_build_object(
           'core_health_receipt',v_proof,
           'subproofs',v_subproofs,
           'external_pending',v_external_pending,
           'external_executor_configured',v_executor_configured,
           'test_first',true,
           'production_authority',false,
           'auto_merge',false,
           'auto_deploy',false,
           'customer_provider_side_effects',false,
           'prices_changed',false,
           'money_moved',false
         )
   where id=v_run;

  return v_run;
exception when others then
  update public.dd_audit_autopilot_runs
     set completed_at=now(),
         status='FAILED',
         evidence=jsonb_build_object('error',sqlerrm)
   where id=v_run;
  raise;
end $$;
