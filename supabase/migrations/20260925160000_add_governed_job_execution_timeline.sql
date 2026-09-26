-- Governed job execution timeline.
-- Separates operational observations from QA, payment and payout authority.
create table if not exists public.dd_job_execution_events (
 id uuid primary key default gen_random_uuid(),
 job_id uuid not null references public.dd_jobs(id) on delete cascade,
 assignment_id uuid null references public.dd_job_assignments(id) on delete set null,
 provider_id uuid null,
 event_type text not null,
 event_at timestamptz not null,
 source_type text not null,
 source_reference text null,
 actor_type text null,
 state text not null default 'RECORDED',
 facts jsonb not null default '{}'::jsonb,
 created_at timestamptz not null default now(),
 constraint dd_job_execution_events_type_chk check (event_type in ('ARRIVAL_WINDOW_OPEN','ARRIVAL_WINDOW_CLOSE','PROVIDER_ARRIVED','SITE_ACCESS_GRANTED','WORK_STARTED','SCOPE_EXCEPTION_REPORTED','OWNER_VISIBILITY_LOST','PROVIDER_REPORTED_COMPLETE','COMPLETION_EVIDENCE_RECEIVED','CUSTOMER_CONFIRMED_COMPLETE','CUSTOMER_ISSUE_REPORTED','CUSTOMER_PAYMENT_RECEIVED','TIP_RECEIVED','QA_APPROVED','PROVIDER_PAYABLE_CLEARED','PROVIDER_PAID','JOB_CLOSED')),
 constraint dd_job_execution_events_source_chk check (source_type in ('SYSTEM','PROVIDER_PORTAL','CUSTOMER_PORTAL','OWNER','PHONE_CALL','TEXT','EMAIL','PAYMENT_PROVIDER','QA','MIGRATION'))
);
create index if not exists dd_job_execution_events_job_time_idx on public.dd_job_execution_events(job_id,event_at);
create unique index if not exists dd_job_execution_events_source_dedupe_idx on public.dd_job_execution_events(job_id,event_type,source_type,source_reference) where source_reference is not null;
alter table public.dd_job_execution_events enable row level security;
revoke all on public.dd_job_execution_events from anon,authenticated;
grant all on public.dd_job_execution_events to service_role;
comment on table public.dd_job_execution_events is 'Append-only operational timeline. Provider-reported completion does not equal QA approval, customer acceptance, payment, or payout.';
create or replace function public.dd_job_execution_state(p_job_id uuid) returns jsonb language sql stable security invoker set search_path=public,pg_temp as $$
 select jsonb_build_object('jobId',p_job_id,'providerArrivedAt',min(event_at) filter(where event_type='PROVIDER_ARRIVED'),'siteAccessAt',min(event_at) filter(where event_type='SITE_ACCESS_GRANTED'),'workStartedAt',min(event_at) filter(where event_type='WORK_STARTED'),'providerReportedCompleteAt',max(event_at) filter(where event_type='PROVIDER_REPORTED_COMPLETE'),'evidenceReceivedAt',max(event_at) filter(where event_type='COMPLETION_EVIDENCE_RECEIVED'),'customerConfirmedAt',max(event_at) filter(where event_type='CUSTOMER_CONFIRMED_COMPLETE'),'paymentReceivedAt',max(event_at) filter(where event_type='CUSTOMER_PAYMENT_RECEIVED'),'tipReceivedAt',max(event_at) filter(where event_type='TIP_RECEIVED'),'qaApprovedAt',max(event_at) filter(where event_type='QA_APPROVED'),'providerPayableClearedAt',max(event_at) filter(where event_type='PROVIDER_PAYABLE_CLEARED'),'providerPaidAt',max(event_at) filter(where event_type='PROVIDER_PAID'),'closedAt',max(event_at) filter(where event_type='JOB_CLOSED')) from public.dd_job_execution_events where job_id=p_job_id
$$;
revoke all on function public.dd_job_execution_state(uuid) from public,anon,authenticated;
grant execute on function public.dd_job_execution_state(uuid) to service_role;