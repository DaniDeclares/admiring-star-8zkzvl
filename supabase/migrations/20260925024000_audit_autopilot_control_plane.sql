-- Audit Autopilot control plane.
-- Tester-first, non-destructive. This does not authorize production deployment, auto-merge,
-- pricing changes, money movement, customer/provider communication, or live lifecycle mutation.

create table if not exists public.dd_audit_autopilot_runs(
 id uuid primary key default gen_random_uuid(),
 started_at timestamptz not null default now(),
 completed_at timestamptz,
 status text not null default 'RUNNING',
 selected_work_id uuid,
 selected_work_key text,
 selected_execution_mode text,
 action_taken text,
 runnable_count int not null default 0,
 blocked_count int not null default 0,
 owner_blocked_count int not null default 0,
 evidence jsonb not null default '{}'::jsonb
);

alter table public.dd_audit_autopilot_runs enable row level security;
revoke all on public.dd_audit_autopilot_runs from anon,authenticated;
grant select,insert,update,delete on public.dd_audit_autopilot_runs to service_role;

create table if not exists public.dd_external_action_attempts(
 id uuid primary key default gen_random_uuid(),
 action_id uuid not null references public.dd_external_action_outbox(id) on delete cascade,
 attempt_no int not null,
 worker_key text not null,
 started_at timestamptz not null default now(),
 completed_at timestamptz,
 outcome text not null default 'STARTED',
 external_reference text,
 error_code text,
 error_detail text,
 receipt jsonb not null default '{}'::jsonb,
 unique(action_id,attempt_no)
);

create table if not exists public.dd_external_action_receipts(
 id uuid primary key default gen_random_uuid(),
 action_id uuid not null references public.dd_external_action_outbox(id) on delete cascade,
 attempt_id uuid references public.dd_external_action_attempts(id),
 receipt_kind text not null,
 external_reference text,
 verified boolean not null default false,
 evidence jsonb not null default '{}'::jsonb,
 created_at timestamptz not null default now()
);

create table if not exists public.dd_external_action_dead_letters(
 id uuid primary key default gen_random_uuid(),
 action_id uuid not null unique references public.dd_external_action_outbox(id) on delete cascade,
 reason text not null,
 last_error_code text,
 last_error text,
 snapshot jsonb not null default '{}'::jsonb,
 created_at timestamptz not null default now(),
 resolved_at timestamptz
);

alter table public.dd_external_action_attempts enable row level security;
alter table public.dd_external_action_receipts enable row level security;
alter table public.dd_external_action_dead_letters enable row level security;
revoke all on public.dd_external_action_attempts,public.dd_external_action_receipts,public.dd_external_action_dead_letters from anon,authenticated;
grant select,insert,update,delete on public.dd_external_action_attempts,public.dd_external_action_receipts,public.dd_external_action_dead_letters to service_role;

create or replace function public.dd_claim_external_actions(
 p_worker_key text,
 p_limit int default 5,
 p_lease_minutes int default 10
)
returns setof public.dd_external_action_outbox
language plpgsql
security definer
set search_path='public'
as $$
begin
 if coalesce(p_worker_key,'')='' then raise exception 'WORKER_KEY_REQUIRED'; end if;

 return query
 with candidates as (
   select id
   from public.dd_external_action_outbox
   where status='PENDING'
     and next_attempt_at<=now()
     and attempt_count<max_attempts
     and destination_system in ('github','vercel')
     and action_type in ('GITHUB_CODE_REPAIR_BRANCH_COMMIT_PR','GITHUB_PR_VERIFY','VERCEL_PREVIEW_VERIFY')
   order by created_at
   for update skip locked
   limit greatest(1,least(coalesce(p_limit,5),20))
 ), claimed as (
   update public.dd_external_action_outbox o
      set status='CLAIMED',
          claimed_at=now(),
          claimed_by=p_worker_key,
          lease_expires_at=now()+make_interval(mins=>greatest(1,least(coalesce(p_lease_minutes,10),30))),
          attempt_count=attempt_count+1,
          updated_at=now()
     from candidates c
    where o.id=c.id
   returning o.*
 )
 select * from claimed;
end $$;

create or replace function public.dd_requeue_expired_external_action_leases()
returns int
language plpgsql
security definer
set search_path='public'
as $$
declare n int;
begin
 update public.dd_external_action_outbox
    set status=case when attempt_count>=max_attempts then 'FAILED' else 'PENDING' end,
        claimed_at=null,
        claimed_by=null,
        lease_expires_at=null,
        next_attempt_at=case when attempt_count>=max_attempts then next_attempt_at else now()+interval '5 minutes' end,
        last_error_code='LEASE_EXPIRED',
        last_error='Worker lease expired before a verified completion receipt.',
        updated_at=now()
  where status='CLAIMED'
    and lease_expires_at<now();

 get diagnostics n=row_count;

 insert into public.dd_external_action_dead_letters(action_id,reason,last_error_code,last_error,snapshot)
 select id,'MAX_ATTEMPTS_AFTER_LEASE_EXPIRY',last_error_code,last_error,
        jsonb_build_object('attempt_count',attempt_count,'max_attempts',max_attempts)
 from public.dd_external_action_outbox o
 where o.status='FAILED'
   and o.last_error_code='LEASE_EXPIRED'
 on conflict(action_id) do nothing;

 return n;
end $$;

revoke all on function public.dd_claim_external_actions(text,int,int) from public,anon,authenticated;
revoke all on function public.dd_requeue_expired_external_action_leases() from public,anon,authenticated;
grant execute on function public.dd_claim_external_actions(text,int,int) to service_role;
grant execute on function public.dd_requeue_expired_external_action_leases() to service_role;

create table if not exists public.dd_audit_proof_receipts(
 id uuid primary key default gen_random_uuid(),
 work_id uuid references public.dd_software_build_work_queue(id) on delete set null,
 work_key text not null,
 proof_key text not null,
 proof_version text not null default 'v1',
 environment text not null default 'TESTER',
 status text not null,
 assertions_total int not null default 0,
 assertions_passed int not null default 0,
 assertions_failed int not null default 0,
 evidence jsonb not null default '{}'::jsonb,
 created_at timestamptz not null default now()
);

create index if not exists dd_audit_proof_receipts_work_key_idx
  on public.dd_audit_proof_receipts(work_key,created_at desc);

alter table public.dd_audit_proof_receipts enable row level security;
revoke all on public.dd_audit_proof_receipts from anon,authenticated;
grant select,insert,update,delete on public.dd_audit_proof_receipts to service_role;

create table if not exists public.dd_audit_proof_registry(
 proof_key text primary key,
 pass_number int,
 work_type text,
 execution_mode text not null default 'RUNTIME_PROOF',
 executor_function text not null,
 scope text not null default 'CORE',
 status text not null default 'ACTIVE',
 acceptance_scope text not null,
 metadata jsonb not null default '{}'::jsonb,
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now()
);

alter table public.dd_audit_proof_registry enable row level security;
revoke all on public.dd_audit_proof_registry from anon,authenticated;
grant select,insert,update,delete on public.dd_audit_proof_registry to service_role;

insert into public.dd_audit_proof_registry(
 proof_key,pass_number,work_type,executor_function,scope,acceptance_scope,metadata
)
values(
 'CORE_RUNTIME_INVARIANTS',
 null,
 'CORE_HEALTH',
 'dd_run_core_runtime_health_proof',
 'CORE',
 'Cross-cutting health evidence only; never advances a channel/pass work item by itself.',
 jsonb_build_object('authoritative_gate',false,'non_destructive',true)
)
on conflict(proof_key) do update
set acceptance_scope=excluded.acceptance_scope,
    metadata=excluded.metadata,
    updated_at=now();

create or replace function public.dd_run_core_runtime_health_proof()
returns uuid
language plpgsql
security definer
set search_path='public'
as $$
declare
 v_id uuid:=gen_random_uuid();
 total int:=0;
 passed int:=0;
 failed int:=0;
 v_dup int;
 v_accept_no_appt int;
 v_appt_no_accept int;
 v_mismatch int;
 v_outbox_stuck int;
 ev jsonb;
begin
 select count(*) into v_dup
 from (
   select job_id,count(*)
   from public.dd_job_assignments
   where assignment_status='ACCEPTED'
   group by job_id
   having count(*)>1
 ) x;
 total:=total+1;
 if v_dup=0 then passed:=passed+1; else failed:=failed+1; end if;

 select count(*) into v_accept_no_appt
 from public.dd_job_assignments a
 where a.assignment_status='ACCEPTED'
   and not exists(
     select 1 from public.dd_job_appointments ap where ap.job_id=a.job_id
   );
 total:=total+1;
 if v_accept_no_appt=0 then passed:=passed+1; else failed:=failed+1; end if;

 select count(*) into v_appt_no_accept
 from public.dd_job_appointments ap
 where not exists(
   select 1 from public.dd_job_assignments a
   where a.job_id=ap.job_id and a.assignment_status='ACCEPTED'
 );
 total:=total+1;
 if v_appt_no_accept=0 then passed:=passed+1; else failed:=failed+1; end if;

 select count(*) into v_mismatch
 from public.dd_job_appointments ap
 join public.dd_job_assignments a
   on a.job_id=ap.job_id
  and a.assignment_status='ACCEPTED'
 where ap.provider_id is not null
   and a.provider_id is not null
   and ap.provider_id<>a.provider_id;
 total:=total+1;
 if v_mismatch=0 then passed:=passed+1; else failed:=failed+1; end if;

 select count(*) into v_outbox_stuck
 from public.dd_external_action_outbox
 where status='CLAIMED'
   and lease_expires_at<now();
 total:=total+1;
 if v_outbox_stuck=0 then passed:=passed+1; else failed:=failed+1; end if;

 ev:=jsonb_build_object(
   'accepted_assignment_duplicates',v_dup,
   'accepted_without_appointment',v_accept_no_appt,
   'appointment_without_accepted_assignment',v_appt_no_accept,
   'appointment_provider_mismatch',v_mismatch,
   'expired_external_action_leases',v_outbox_stuck,
   'non_destructive',true,
   'authoritative_gate',false
 );

 insert into public.dd_audit_proof_receipts(
   id,work_key,proof_key,status,assertions_total,assertions_passed,assertions_failed,evidence
 )
 values(
   v_id,'CORE-HEALTH','CORE_RUNTIME_INVARIANTS',
   case when failed=0 then 'PASS' else 'FAIL' end,
   total,passed,failed,ev
 );

 return v_id;
end $$;

revoke all on function public.dd_run_core_runtime_health_proof() from public,anon,authenticated;
grant execute on function public.dd_run_core_runtime_health_proof() to service_role;

create or replace function public.dd_run_next_safe_runtime_proof()
returns uuid
language plpgsql
security definer
set search_path='public'
as $$
declare rid uuid;
begin
 select public.dd_run_core_runtime_health_proof() into rid;
 return rid;
end $$;

revoke all on function public.dd_run_next_safe_runtime_proof() from public,anon,authenticated;
grant execute on function public.dd_run_next_safe_runtime_proof() to service_role;

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
 ) into v_executor_configured;

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

 select public.dd_run_next_safe_runtime_proof() into v_proof;

 if v_proof is not null then
   v_action:='RUNTIME_PROOF_EXECUTED';
 else
   select * into v_work
   from public.dd_software_build_work_queue
   where status='READY'
     and owner_decision_required=false
   order by case priority when 'P0' then 0 when 'P1' then 1 else 2 end,
            pass_number,updated_at,id
   limit 1
   for update skip locked;

   if found then
     update public.dd_software_build_work_queue
        set attempts=attempts+1,
            last_attempt_at=now(),
            last_result=jsonb_build_object(
              'autopilot_run',v_run,
              'classification','AWAITING_EXECUTOR',
              'safe_to_auto_promote',false,
              'reason','Code build requires governed source-control executor + CI evidence; SQL supervisor will not author/merge code.'
            ),
            updated_at=now()
      where id=v_work.id;

     v_action:='CODE_BUILD_AWAITING_EXECUTOR';
   end if;
 end if;

 select
   count(*) filter(where status='READY' and owner_decision_required=false),
   count(*) filter(where status='BLOCKED'),
   count(*) filter(where status='BLOCKED' and owner_decision_required=true)
 into v_runnable,v_blocked,v_owner
 from public.dd_software_build_work_queue;

 insert into public.dd_owner_attention_queue(
   domain,source_table,source_record_id,reason,priority,recommended_action,metadata
 )
 select
   'SOFTWARE_PLATFORM',
   'dd_software_build_work_queue',
   w.id::text,
   'Audit autopilot reached an owner-decision boundary',
   w.priority,
   'Review the specific owner decision; autonomous audit remains active on other runnable work.',
   jsonb_build_object(
     'work_key',w.work_key,
     'pass_number',w.pass_number,
     'execution_mode',w.execution_mode,
     'autopilot',true
   )
 from public.dd_software_build_work_queue w
 where w.status='BLOCKED'
   and w.owner_decision_required=true
   and not exists(
     select 1
     from public.dd_owner_attention_queue q
     where q.status='OPEN'
       and q.source_table='dd_software_build_work_queue'
       and q.source_record_id=w.id::text
       and q.reason='Audit autopilot reached an owner-decision boundary'
   );

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
          'runtime_proof_receipt',v_proof,
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
exception
 when others then
  update public.dd_audit_autopilot_runs
     set completed_at=now(),
         status='FAILED',
         evidence=jsonb_build_object('error',sqlerrm)
   where id=v_run;
  raise;
end $$;

revoke all on function public.dd_run_audit_autopilot_supervisor() from public,anon,authenticated;
grant execute on function public.dd_run_audit_autopilot_supervisor() to service_role;

do $$
begin
 if not exists(select 1 from cron.job where jobname='audit-autopilot-supervisor') then
   perform cron.schedule(
     'audit-autopilot-supervisor',
     '11,26,41,56 * * * *',
     'select public.dd_run_audit_autopilot_supervisor();'
   );
 end if;

 if not exists(select 1 from cron.job where jobname='audit-core-runtime-health') then
   perform cron.schedule(
     'audit-core-runtime-health',
     '16,46 * * * *',
     'select public.dd_run_core_runtime_health_proof();'
   );
 end if;

 if not exists(select 1 from cron.job where jobname='external-action-lease-recovery') then
   perform cron.schedule(
     'external-action-lease-recovery',
     '*/10 * * * *',
     'select public.dd_requeue_expired_external_action_leases();'
   );
 end if;
end $$;
