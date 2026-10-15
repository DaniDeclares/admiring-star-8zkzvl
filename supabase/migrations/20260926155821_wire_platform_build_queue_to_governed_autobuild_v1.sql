
create or replace function public.dd_materialize_platform_autobuild_candidates()
returns jsonb
language plpgsql
security definer
set search_path='public','private'
as $$
declare v_inserted int:=0; v_blocked int:=0;
begin
  insert into public.dd_autobuild_candidates(
    candidate_key,source_type,source_record_id,domain,title,proposed_build,evidence,
    acceptance_criteria,risk_tier,permission_class,status,blocker,executor_state
  )
  select
    'PLATFORM_BUILD:'||q.work_key,
    'SOFTWARE_BUILD_WORK_QUEUE',
    q.id::text,
    case
      when q.work_type='PORTAL_AND_WORKFLOW' then 'SOFTWARE_UX'
      when q.work_type='GOVERNANCE_AND_CODE' then 'SOFTWARE_GOVERNANCE'
      when q.work_type='COMMERCIAL_RUNTIME' then 'SOFTWARE_COMMERCIAL'
      when q.work_type='FULFILLMENT_RUNTIME' then 'SOFTWARE_FULFILLMENT'
      else 'SOFTWARE_PLATFORM'
    end,
    q.work_key||' — '||q.pass_name,
    jsonb_build_object(
      'kind','BUILD_BRIEF_V1',
      'work_key',q.work_key,
      'channel_code',q.channel_code,
      'pass_number',q.pass_number,
      'pass_name',q.pass_name,
      'lifecycle_stage',q.lifecycle_stage,
      'work_type',q.work_type,
      'execution_mode',q.execution_mode,
      'required_build',q.required_build,
      'blocking_gap',q.blocking_gap,
      'repository',q.repository,
      'target_environment',q.target_environment,
      'instruction','Compile this approved outcome into a bounded PATCH_MANIFEST_V1 on an isolated branch. Reuse the shared DANI operating kernel. Do not weaken permissions, pricing authority, money controls, provider eligibility, security, or release governance.'
    )::text,
    jsonb_build_object(
      'audit_id',q.audit_id,
      'source_status',q.source_status,
      'priority',q.priority,
      'authoritative_queue','dd_software_build_work_queue',
      'requires_rendered_or_runtime_proof',true,
      'no_manual_database_completion',true
    ),
    q.acceptance_criteria,
    case
      when q.execution_mode='RUNTIME_PROOF'
        or q.work_type in('COMMERCIAL_RUNTIME','FULFILLMENT_RUNTIME','E2E_RELEASE_PROOF')
        or upper(coalesce(q.lifecycle_stage,'')) in('COMMERCIAL','CHECKOUT','PAYMENT')
      then 'HIGH' else 'LOW' end,
    case
      when q.execution_mode='RUNTIME_PROOF'
        or q.work_type in('COMMERCIAL_RUNTIME','FULFILLMENT_RUNTIME','E2E_RELEASE_PROOF')
        or upper(coalesce(q.lifecycle_stage,'')) in('COMMERCIAL','CHECKOUT','PAYMENT')
      then 'REVIEW_REQUIRED' else 'CODE_BUILD' end,
    case
      when q.execution_mode='RUNTIME_PROOF'
        or q.work_type in('COMMERCIAL_RUNTIME','FULFILLMENT_RUNTIME','E2E_RELEASE_PROOF')
        or upper(coalesce(q.lifecycle_stage,'')) in('COMMERCIAL','CHECKOUT','PAYMENT')
      then 'BLOCKED' else 'NEEDS_MANIFEST' end,
    case
      when q.execution_mode='RUNTIME_PROOF'
        or q.work_type in('COMMERCIAL_RUNTIME','FULFILLMENT_RUNTIME','E2E_RELEASE_PROOF')
        or upper(coalesce(q.lifecycle_stage,'')) in('COMMERCIAL','CHECKOUT','PAYMENT')
      then 'PROTECTED_RUNTIME_OR_COMMERCIAL_GATE'
      else 'AWAITING_GOVERNED_MANIFEST_COMPILER'
    end,
    'PENDING'
  from public.dd_software_build_work_queue q
  where q.status in('READY','VERIFYING')
    and not q.owner_decision_required
  on conflict(candidate_key) do update set
    source_record_id=excluded.source_record_id,
    domain=excluded.domain,
    title=excluded.title,
    proposed_build=excluded.proposed_build,
    evidence=public.dd_autobuild_candidates.evidence || excluded.evidence,
    acceptance_criteria=excluded.acceptance_criteria,
    risk_tier=excluded.risk_tier,
    permission_class=excluded.permission_class,
    status=case
      when public.dd_autobuild_candidates.status in('PR_OPENED','BUILT','PROVEN','PASSED') then public.dd_autobuild_candidates.status
      else excluded.status
    end,
    blocker=case
      when public.dd_autobuild_candidates.status in('PR_OPENED','BUILT','PROVEN','PASSED') then public.dd_autobuild_candidates.blocker
      else excluded.blocker
    end,
    updated_at=now();
  get diagnostics v_inserted=row_count;

  select count(*) into v_blocked
  from public.dd_autobuild_candidates
  where candidate_key like 'PLATFORM_BUILD:%'
    and status='BLOCKED';

  return jsonb_build_object(
    'status','COMPLETED',
    'materialized_or_refreshed',v_inserted,
    'protected_blocked',v_blocked,
    'safe_state','NEEDS_MANIFEST',
    'execution_boundary','BUILD_BRIEF_TO_PATCH_MANIFEST_TO_ISOLATED_PR',
    'auto_merge',false,
    'direct_production_write',false
  );
end $$;

revoke all on function public.dd_materialize_platform_autobuild_candidates() from public, anon, authenticated;
grant execute on function public.dd_materialize_platform_autobuild_candidates() to service_role;

create or replace function public.dd_run_software_build_controller()
returns uuid
language plpgsql
security definer
set search_path='public','private'
as $$
declare v_id uuid:=gen_random_uuid();v_refresh int;v_ready int;v_blocked int;v_passed int;v_materialized jsonb;
begin
 insert into public.dd_software_build_runs(id,status) values(v_id,'STARTED');
 select public.dd_refresh_software_build_queue() into v_refresh;
 update public.dd_software_build_work_queue set status='BLOCKED',updated_at=now() where owner_decision_required and status in('QUEUED','READY');
 select public.dd_materialize_platform_autobuild_candidates() into v_materialized;
 select count(*) filter(where status='READY'),count(*) filter(where status='BLOCKED'),count(*) filter(where status='PASSED')
 into v_ready,v_blocked,v_passed from public.dd_software_build_work_queue;
 update public.dd_software_build_runs set
   status=case when v_ready>0 or v_blocked>0 then 'PARTIAL' else 'COMPLETED' end,
   queued=v_refresh,ready=v_ready,blocked=v_blocked,passed=v_passed,
   summary=jsonb_build_object(
     'authority','dd_platform_release_audit_10_pass',
     'production_job_authority','dd_jobs',
     'environment','PRODUCTION',
     'test_first',true,'auto_green',false,'direct_production_write',false,'auto_merge',false,
     'materialization',v_materialized,
     'rule','work may be marked PASSED only after authoritative audit evidence is GREEN'
   ),
   completed_at=now() where id=v_id;
 return v_id;
exception when others then
 update public.dd_software_build_runs set status='FAILED',summary=jsonb_build_object('error',sqlerrm),completed_at=now() where id=v_id;
 raise;
end $$;
