create table if not exists public.dd_autobuild_candidates(
 id uuid primary key default gen_random_uuid(), candidate_key text not null unique, source_type text, source_record_id text, domain text, title text,
 proposed_build text, evidence jsonb not null default '{}'::jsonb, acceptance_criteria text, risk_tier text not null default 'HIGH', permission_class text not null default 'REVIEW_REQUIRED',
 status text not null default 'PENDING', blocker text, executor_state text not null default 'PENDING', lease_owner text, leased_at timestamptz, lease_expires_at timestamptz,
 attempt_count integer not null default 0, last_error text, branch_name text, pull_request_number integer, pull_request_url text, head_sha text, built_at timestamptz,
 proof jsonb not null default '{}'::jsonb, created_at timestamptz not null default now(), updated_at timestamptz not null default now());
alter table public.dd_autobuild_candidates enable row level security;
revoke all on public.dd_autobuild_candidates from public,anon,authenticated;
grant select,insert,update on public.dd_autobuild_candidates to service_role;
create index if not exists dd_autobuild_candidates_claim_idx on public.dd_autobuild_candidates(executor_state,risk_tier,permission_class,status,created_at);

create or replace function public.dd_claim_autobuild_candidate(p_worker_key text)
returns setof public.dd_autobuild_candidates
language plpgsql
security invoker
set search_path='public'
as $$
begin
  if nullif(btrim(p_worker_key),'') is null then
    raise exception 'worker key required';
  end if;

  return query
  with candidate as (
    select id
    from public.dd_autobuild_candidates
    where status in ('MANIFEST_READY','READY','QUEUED_FOR_BUILD')
      and risk_tier='LOW'
      and permission_class in ('CODE_BUILD','AUTO_PR_BUILD')
      and executor_state='PENDING'
    order by created_at,id
    for update skip locked
    limit 1
  )
  update public.dd_autobuild_candidates c
  set executor_state='LEASED',
      lease_owner=p_worker_key,
      leased_at=now(),
      lease_expires_at=now()+interval '20 minutes'
  from candidate
  where c.id=candidate.id
  returning c.*;
end $$;

revoke execute on function public.dd_claim_autobuild_candidate(text) from public,anon,authenticated;
grant execute on function public.dd_claim_autobuild_candidate(text) to postgres,service_role;
