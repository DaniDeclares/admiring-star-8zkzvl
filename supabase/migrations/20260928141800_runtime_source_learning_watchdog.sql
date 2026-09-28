begin;

create table if not exists public.dd_runtime_source_fingerprints (
  object_key text primary key,
  object_type text not null default 'FUNCTION',
  current_hash text not null,
  previous_hash text,
  first_seen_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now(),
  last_changed_at timestamptz,
  metadata jsonb not null default '{}'::jsonb
);

alter table public.dd_runtime_source_fingerprints enable row level security;

revoke all on table public.dd_runtime_source_fingerprints from public;
revoke all on table public.dd_runtime_source_fingerprints from anon;
revoke all on table public.dd_runtime_source_fingerprints from authenticated;
grant select,insert,update on table public.dd_runtime_source_fingerprints to service_role;

create or replace function public.dd_run_runtime_source_watchdog()
returns jsonb
language plpgsql
security definer
set search_path to 'public'
as $function$
declare
  rec record;
  v_hash text;
  v_prev text;
  v_changed int := 0;
  v_checked int := 0;
  v_missing int := 0;
  v_evidence_key text;
begin
  for rec in
    select * from (values
      ('public.dd_brain_trickle_down()'),
      ('public.dd_run_enterprise_control_plane()'),
      ('public.dd_run_unattended_green_controller()'),
      ('public.dd_run_revenue_orchestrator()'),
      ('public.dd_capture_production_learning_for_tester()'),
      ('public.dd_capture_production_release_feedback()'),
      ('public.dd_enqueue_dani_bridge_learning_transport()')
    ) as x(signature)
  loop
    v_checked := v_checked + 1;

    begin
      select md5(pg_get_functiondef(to_regprocedure(rec.signature)))
      into v_hash;

      if v_hash is null then
        v_hash := 'MISSING';
        v_missing := v_missing + 1;
      end if;
    exception when others then
      v_hash := 'MISSING';
      v_missing := v_missing + 1;
    end;

    select current_hash into v_prev
    from public.dd_runtime_source_fingerprints
    where object_key=rec.signature;

    insert into public.dd_runtime_source_fingerprints(
      object_key,object_type,current_hash,previous_hash,last_seen_at,last_changed_at,metadata
    ) values (
      rec.signature,'FUNCTION',v_hash,null,now(),null,
      jsonb_build_object(
        'environment','PRODUCTION',
        'governance_rule','RUNTIME_CHANGE_REQUIRES_SOURCE_RECONCILIATION'
      )
    )
    on conflict(object_key) do update set
      previous_hash=case
        when public.dd_runtime_source_fingerprints.current_hash is distinct from excluded.current_hash
          then public.dd_runtime_source_fingerprints.current_hash
        else public.dd_runtime_source_fingerprints.previous_hash
      end,
      current_hash=excluded.current_hash,
      last_seen_at=now(),
      last_changed_at=case
        when public.dd_runtime_source_fingerprints.current_hash is distinct from excluded.current_hash
          then now()
        else public.dd_runtime_source_fingerprints.last_changed_at
      end,
      metadata=excluded.metadata;

    if v_prev is not null and v_prev is distinct from v_hash then
      v_changed := v_changed + 1;
      v_evidence_key := 'RUNTIME_SOURCE_DRIFT:'||md5(rec.signature);

      insert into public.dd_learning_evidence_intake(
        evidence_key,evidence_origin,domain,source_system,source_reference,
        observation,evidence_payload,authority_class,requires_new_test,status
      ) values (
        v_evidence_key,
        'PRODUCTION',
        'AI_DATA_GOVERNANCE_INTELLIGENCE',
        'RUNTIME_SOURCE_WATCHDOG',
        rec.signature,
        'Critical Production runtime definition changed. Reconcile the runtime definition to governed GitHub source and release evidence before treating the change as canonical.',
        jsonb_build_object(
          'object_key',rec.signature,
          'previous_hash',v_prev,
          'current_hash',v_hash,
          'environment','PRODUCTION',
          'tester_role','LAB_CONTROL_PLANE',
          'github_role','SOURCE_BLUEPRINT',
          'production_role','REAL_RUNTIME',
          'production_authority',false
        ),
        'GOVERNANCE',
        true,
        'NEW'
      )
      on conflict(evidence_key) do update set
        observation=excluded.observation,
        evidence_payload=excluded.evidence_payload,
        requires_new_test=true,
        status=case
          when public.dd_learning_evidence_intake.status in ('ADOPTED','REJECTED','TESTED')
            then 'NEW'
          else public.dd_learning_evidence_intake.status
        end,
        updated_at=now();
    end if;
  end loop;

  perform public.dd_capture_production_learning_for_tester();

  return jsonb_build_object(
    'status','COMPLETED',
    'checked',v_checked,
    'changed',v_changed,
    'missing',v_missing,
    'learning_pipeline_reused',true,
    'production_authority_expanded',false,
    'merge_or_deploy_performed',false
  );
end
$function$;

revoke all on function public.dd_run_runtime_source_watchdog() from public;
revoke all on function public.dd_run_runtime_source_watchdog() from anon;
revoke all on function public.dd_run_runtime_source_watchdog() from authenticated;
grant execute on function public.dd_run_runtime_source_watchdog() to service_role;

do $$
begin
  if exists (select 1 from pg_namespace where nspname='cron') then
    perform cron.schedule(
      'dani-runtime-source-watchdog',
      '13,28,43,58 * * * *',
      'select public.dd_run_runtime_source_watchdog();'
    );
  end if;
end
$$;

commit;
