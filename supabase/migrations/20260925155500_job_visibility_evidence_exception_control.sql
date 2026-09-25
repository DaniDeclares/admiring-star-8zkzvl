-- Job visibility / evidence exception control.
-- Records facts without inferring completion, direct payment, dispute, or scope expansion.
create table if not exists public.dd_job_visibility_observations(
 id uuid primary key default gen_random_uuid(), job_id uuid not null references public.dd_jobs(id) on delete cascade,
 observed_at timestamptz not null, observation_type text not null, operational_state text not null default 'UNKNOWN',
 customer_contact_state text, provider_contact_state text, expected_end_at timestamptz, evidence_count integer not null default 0,
 facts jsonb not null default '{}'::jsonb, possible_explanations jsonb not null default '[]'::jsonb,
 resolution_state text not null default 'OPEN', created_at timestamptz not null default now()
);
create index if not exists dd_job_visibility_observations_job_time_idx on public.dd_job_visibility_observations(job_id,observed_at desc);
alter table public.dd_job_visibility_observations enable row level security;
revoke all on public.dd_job_visibility_observations from anon,authenticated;
grant all on public.dd_job_visibility_observations to service_role;

create or replace function public.dd_evaluate_job_visibility(p_job_id uuid,p_observed_at timestamptz default now())
returns jsonb language plpgsql security definer set search_path=public as $$
declare j public.dd_jobs%rowtype; ev_count integer:=0; overdue boolean:=false; open_attention uuid;
begin
 select * into j from public.dd_jobs where id=p_job_id;
 if j.id is null then return jsonb_build_object('state','JOB_NOT_FOUND'); end if;
 select count(*) into ev_count from public.dd_job_evidence where job_id=p_job_id;
 overdue:=j.scheduled_end is not null and p_observed_at>j.scheduled_end and lower(coalesce(j.job_status,'')) not in ('completed','cancelled','closed');
 if overdue and ev_count=0 then
  select id into open_attention from public.dd_owner_attention_queue where source_table='dd_jobs' and source_record_id=j.id::text
   and status='OPEN' and reason='JOB_VISIBILITY_LOST_AFTER_EXPECTED_END' order by created_at desc limit 1;
  if open_attention is null then
   insert into public.dd_owner_attention_queue(domain,source_table,source_record_id,reason,priority,status,recommended_action,metadata)
   values('FULFILLMENT','dd_jobs',j.id::text,'JOB_VISIBILITY_LOST_AFTER_EXPECTED_END','P0','OPEN',
   'Confirm provider/customer status; obtain required before/during/after evidence; determine whether scope changed; do not infer completion, failure, direct payment, or payout eligibility.',
   jsonb_build_object('scheduled_start',j.scheduled_start,'scheduled_end',j.scheduled_end,'observed_at',p_observed_at,'evidence_count',ev_count,'state','UNKNOWN','requires_human_resolution',true))
   returning id into open_attention;
  end if;
 end if;
 return jsonb_build_object('jobId',j.id,'scheduledEnd',j.scheduled_end,'observedAt',p_observed_at,'overdue',overdue,'evidenceCount',ev_count,
 'operationalState',case when overdue and ev_count=0 then 'UNKNOWN_VISIBILITY_EXCEPTION' else 'NO_EXCEPTION_PROVEN' end,'attentionId',open_attention);
end $$;
revoke all on function public.dd_evaluate_job_visibility(uuid,timestamptz) from public,anon,authenticated;
grant execute on function public.dd_evaluate_job_visibility(uuid,timestamptz) to service_role;
