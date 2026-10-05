-- Tester-only self-build convergence for evidence-backed REVERIFY candidates.
-- Consumes one safe candidate per cycle and records NO_SOURCE_CHANGE without branches/PRs.
-- No Production mutation, money movement, external contact, auto-merge, or permission expansion.

create or replace function public.dd_run_tester_autobuild_no_source_cycle()
returns jsonb
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_candidate public.dd_autobuild_candidates%rowtype;
  v_policy public.dd_autobuild_policy%rowtype;
  v_token uuid := gen_random_uuid();
begin
  select * into v_policy
  from public.dd_autobuild_policy
  where policy_key='DANI_TESTER_RESEARCH_TO_BUILD';

  if not found then
    return jsonb_build_object('status','HELD','reason','AUTOBUILD_POLICY_MISSING','environment','TESTER');
  end if;

  if not v_policy.enabled or coalesce(v_policy.kill_switch,false) or coalesce(v_policy.circuit_open,false) then
    return jsonb_build_object('status','HELD','reason','AUTOBUILD_POLICY_NOT_RUNNABLE','environment','TESTER');
  end if;

  if upper(coalesce(v_policy.target_environment,'')) <> 'TESTER' then
    return jsonb_build_object('status','HELD','reason','AUTOBUILD_POLICY_NOT_TESTER','environment','TESTER');
  end if;

  select c.* into v_candidate
  from public.dd_autobuild_candidates c
  where c.status='QUEUED_FOR_BUILD'
    and c.executor_state='PENDING'
    and c.source_type='RESEARCH'
    and c.permission_class='AUTO_TESTER_BUILD'
    and c.risk_tier='LOW'
    and upper(coalesce(c.domain,''))='REVERIFY'
    and coalesce(c.acceptance_criteria,'') <> ''
    and coalesce(c.evidence,'{}'::jsonb) <> '{}'::jsonb
    and coalesce(c.proposed_build,'') ilike 'Record and reconcile the evidence-backed research conclusion only%'
  order by c.created_at, c.id
  for update skip locked
  limit 1;

  if not found then
    return jsonb_build_object(
      'status','NO_CANDIDATE','environment','TESTER',
      'production_mutation',false,'money_action',false,'external_contact',false
    );
  end if;

  update public.dd_autobuild_candidates
  set lease_token=v_token,
      lease_owner='TESTER_AUTOBUILD_NO_SOURCE',
      leased_at=now(),
      lease_expires_at=now()+interval '15 minutes',
      attempt_count=attempt_count+1,
      executor_state='CLASSIFYING',
      updated_at=now()
  where id=v_candidate.id;

  update public.dd_autobuild_candidates
  set status='PROVEN',
      executor_state='NO_SOURCE_CHANGE',
      proof=coalesce(proof,'{}'::jsonb) || jsonb_build_object(
        'decision','NO_SOURCE_CHANGE',
        'reason','REVERIFY_RESEARCH_CONCLUSION_ONLY',
        'environment','TESTER',
        'worker','dd_run_tester_autobuild_no_source_cycle',
        'candidate_key',candidate_key,
        'evaluated_at',now(),
        'source_change_required',false,
        'branch_created',false,
        'pull_request_created',false,
        'production_mutation',false,
        'money_action',false,
        'external_contact',false
      ),
      blocker=null,
      built_at=coalesce(built_at,now()),
      proven_at=now(),
      lease_expires_at=null,
      updated_at=now()
  where id=v_candidate.id;

  return jsonb_build_object(
    'status','COMPLETED',
    'environment','TESTER',
    'candidate_id',v_candidate.id,
    'candidate_key',v_candidate.candidate_key,
    'decision','NO_SOURCE_CHANGE',
    'source_change_required',false,
    'branch_created',false,
    'pull_request_created',false,
    'production_mutation',false,
    'money_action',false,
    'external_contact',false
  );
end
$$;

revoke all on function public.dd_run_tester_autobuild_no_source_cycle() from public,anon,authenticated;
grant execute on function public.dd_run_tester_autobuild_no_source_cycle() to service_role;

select cron.unschedule(jobid)
from cron.job
where jobname='dani-tester-autobuild-no-source-cycle';

select cron.schedule(
  'dani-tester-autobuild-no-source-cycle',
  '7,22,37,52 * * * *',
  $$select public.dd_run_tester_autobuild_no_source_cycle();$$
);
