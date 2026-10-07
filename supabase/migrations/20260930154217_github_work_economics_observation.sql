-- External paid-work outcomes are evidence for economics study, never pricing/pay authority.
create table if not exists public.dd_external_work_economics_observations (
 id uuid primary key default gen_random_uuid(),
 execution_receipt_id uuid not null references public.dd_github_work_execution_receipts(id) on delete restrict,
 approval_id uuid not null references public.dd_github_work_approvals(id) on delete restrict,
 worker_archetype_key text,
 capability_domain text,
 client_region jsonb not null default '{}'::jsonb,
 approved_compensation_usd numeric(12,2),
 accepted_compensation_usd numeric(12,2),
 observed_minutes integer check(observed_minutes is null or observed_minutes>=0),
 rework_minutes integer check(rework_minutes is null or rework_minutes>=0),
 acceptance_state text,
 payout_state text,
 effective_hourly_usd numeric(12,2),
 evidence jsonb not null default '{}'::jsonb,
 evidence_state text not null default 'OBSERVED'
   check(evidence_state in ('OBSERVED','CORROBORATED','REJECTED','SUPERSEDED')),
 authority_class text not null default 'RESEARCH_EVIDENCE_ONLY'
   check(authority_class='RESEARCH_EVIDENCE_ONLY'),
 created_at timestamptz not null default now(),
 unique(execution_receipt_id)
);
alter table public.dd_external_work_economics_observations enable row level security;
grant select on public.dd_external_work_economics_observations to authenticated,service_role;

create or replace function public.dd_capture_github_work_economics_observation(p_receipt_id uuid)
returns jsonb language plpgsql security definer set search_path='' as $$
declare r public.dd_github_work_execution_receipts%rowtype;
declare a public.dd_github_work_approvals%rowtype;
declare mins int; rw int; paid numeric; archetype text; domain text; region jsonb;
begin
 select * into r from public.dd_github_work_execution_receipts where id=p_receipt_id;
 if not found then raise exception 'EXECUTION_RECEIPT_NOT_FOUND'; end if;
 select * into a from public.dd_github_work_approvals where id=r.approval_id;
 if not found then raise exception 'APPROVAL_NOT_FOUND'; end if;
 if r.phase not in ('ACCEPTANCE','PAYMENT') then raise exception 'TERMINAL_WORK_EVIDENCE_REQUIRED'; end if;
 mins:=nullif(r.evidence->>'observed_minutes','')::int;
 rw:=coalesce(nullif(r.evidence->>'rework_minutes','')::int,0);
 paid:=coalesce(nullif(r.evidence->>'accepted_compensation_usd','')::numeric,a.approved_compensation_usd);
 archetype:=nullif(r.evidence->>'worker_archetype_key','');
 domain:=nullif(r.evidence->>'capability_domain','');
 region:=coalesce(r.evidence->'client_region','{}'::jsonb);
 insert into public.dd_external_work_economics_observations(
  execution_receipt_id,approval_id,worker_archetype_key,capability_domain,client_region,
  approved_compensation_usd,accepted_compensation_usd,observed_minutes,rework_minutes,
  acceptance_state,payout_state,effective_hourly_usd,evidence)
 values(r.id,a.id,archetype,domain,region,a.approved_compensation_usd,paid,mins,rw,
  r.evidence->>'acceptance_state',r.evidence->>'payout_state',
  case when paid is not null and coalesce(mins,0)+rw>0 then round(paid*60/(mins+rw),2) end,
  r.evidence)
 on conflict(execution_receipt_id) do update set
  worker_archetype_key=excluded.worker_archetype_key,capability_domain=excluded.capability_domain,
  client_region=excluded.client_region,accepted_compensation_usd=excluded.accepted_compensation_usd,
  observed_minutes=excluded.observed_minutes,rework_minutes=excluded.rework_minutes,
  acceptance_state=excluded.acceptance_state,payout_state=excluded.payout_state,
  effective_hourly_usd=excluded.effective_hourly_usd,evidence=excluded.evidence;
 return jsonb_build_object('status','OBSERVED','authority_class','RESEARCH_EVIDENCE_ONLY',
  'worker_archetype_key',archetype,'capability_domain',domain,'client_region',region,
  'pricing_authority',false,'provider_pay_authority',false);
end $$;
revoke all on function public.dd_capture_github_work_economics_observation(uuid) from public,anon,authenticated;
grant execute on function public.dd_capture_github_work_economics_observation(uuid) to service_role;
