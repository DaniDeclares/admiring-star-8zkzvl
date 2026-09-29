-- Authoritative durable scheduled-work queue contract.
create table if not exists public.dd_scheduled_operating_work (
  id uuid primary key default gen_random_uuid(),
  work_type text not null,
  status text not null default 'QUEUED' check (status in ('QUEUED','IN_PROGRESS','COMPLETED','BLOCKED')),
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists dd_scheduled_operating_work_claim_idx
  on public.dd_scheduled_operating_work(status, work_type, created_at);

-- Governed scheduled operating work consumer control-plane contract.
-- Runtime external capabilities remain owned by their governed workers.
-- This migration does not send email, move money, mutate protected pricing, or authorize providers.

create or replace function private.dd_claim_scheduled_operating_work(
  p_worker_key text,
  p_work_type text default null,
  p_limit integer default 10
) returns setof public.dd_scheduled_operating_work
language plpgsql security definer set search_path='public','private' as $$
begin
  if nullif(btrim(p_worker_key),'') is null then raise exception 'WORKER_KEY_REQUIRED'; end if;
  return query
  with candidates as (
    select id from public.dd_scheduled_operating_work
    where status='QUEUED'
      and (p_work_type is null or work_type=p_work_type)
      and coalesce((payload->>'next_attempt_at')::timestamptz,now())<=now()
    order by created_at
    for update skip locked
    limit greatest(1,least(p_limit,50))
  )
  update public.dd_scheduled_operating_work w
  set status='IN_PROGRESS',
      payload=coalesce(w.payload,'{}'::jsonb)||jsonb_build_object(
        'claimed_by',p_worker_key,'claim_token',gen_random_uuid()::text,'claimed_at',now(),'lease_expires_at',now()+interval '30 minutes',
        'attempt_count',coalesce((w.payload->>'attempt_count')::int,0)+1),
      updated_at=now()
  from candidates c where w.id=c.id returning w.*;
end $$;

create or replace function private.dd_finish_scheduled_operating_work(
  p_id uuid,p_worker_key text,p_claim_token text,p_success boolean,p_receipt jsonb,p_blocker text default null
) returns jsonb language plpgsql security definer set search_path='public','private' as $$
declare w public.dd_scheduled_operating_work%rowtype; attempts int;
begin
  select * into w from public.dd_scheduled_operating_work where id=p_id for update;
  if not found then raise exception 'WORK_NOT_FOUND'; end if;
  if nullif(btrim(p_worker_key),'') is null or nullif(btrim(p_claim_token),'') is null then raise exception 'LEASE_IDENTITY_REQUIRED'; end if;
  if w.status<>'IN_PROGRESS' or coalesce(w.payload->>'claimed_by','')<>p_worker_key or coalesce(w.payload->>'claim_token','')<>p_claim_token or nullif(w.payload->>'lease_expires_at','')::timestamptz<=now() then raise exception 'LEASE_NOT_OWNED'; end if;
  attempts:=coalesce((w.payload->>'attempt_count')::int,1);
  update public.dd_scheduled_operating_work
  set status=case when p_success then 'COMPLETED' else case when attempts>=3 then 'BLOCKED' else 'QUEUED' end end,
      payload=(coalesce(payload,'{}'::jsonb)-'claimed_by'-'claim_token'-'claimed_at'-'lease_expires_at')||
        jsonb_build_object('execution_receipt',coalesce(p_receipt,'{}'::jsonb),'last_blocker',p_blocker,
          'completed_at',case when p_success then now() else null end,
          'next_attempt_at',case when p_success or attempts>=3 then null else now()+(interval '5 minutes'*power(2,attempts-1)) end),
      updated_at=now()
  where id=p_id;
  return jsonb_build_object('id',p_id,'success',p_success,'attempt_count',attempts);
end $$;

create or replace function private.dd_requeue_expired_scheduled_work_leases()
returns integer language plpgsql security definer set search_path='public','private' as $$
declare n int;
begin
  update public.dd_scheduled_operating_work
  set status=case when coalesce((payload->>'attempt_count')::int,0)>=3 then 'BLOCKED' else 'QUEUED' end,
      payload=(coalesce(payload,'{}'::jsonb)-'claimed_by'-'claimed_at'-'lease_expires_at')||
        jsonb_build_object('last_error','LEASE_EXPIRED','last_error_at',now(),
          'next_attempt_at',case when coalesce((payload->>'attempt_count')::int,0)>=3 then null else now()+interval '10 minutes' end),
      updated_at=now()
  where status='IN_PROGRESS' and nullif(payload->>'lease_expires_at','')::timestamptz<now();
  get diagnostics n=row_count; return n;
end $$;

create or replace function public.dd_claim_scheduled_operating_work(p_worker_key text,p_work_type text default null,p_limit integer default 10)
returns setof public.dd_scheduled_operating_work language sql security definer set search_path='public','private'
as $ select * from private.dd_claim_scheduled_operating_work(p_worker_key,p_work_type,p_limit) $;
create or replace function public.dd_finish_scheduled_operating_work(p_id uuid,p_worker_key text,p_claim_token text,p_success boolean,p_receipt jsonb,p_blocker text default null)
returns jsonb language sql security definer set search_path='public','private'
as $ select private.dd_finish_scheduled_operating_work(p_id,p_worker_key,p_claim_token,p_success,p_receipt,p_blocker) $;
create or replace function public.dd_requeue_expired_scheduled_work_leases()
returns integer language sql security definer set search_path='public','private'
as $$ select private.dd_requeue_expired_scheduled_work_leases() $$;

revoke all on function private.dd_claim_scheduled_operating_work(text,text,integer) from public,anon,authenticated;
revoke all on function private.dd_finish_scheduled_operating_work(uuid,text,text,boolean,jsonb,text) from public,anon,authenticated;
revoke all on function private.dd_requeue_expired_scheduled_work_leases() from public,anon,authenticated;
revoke all on function public.dd_claim_scheduled_operating_work(text,text,integer) from public,anon,authenticated;
revoke all on function public.dd_finish_scheduled_operating_work(uuid,text,text,boolean,jsonb,text) from public,anon,authenticated;
revoke all on function public.dd_requeue_expired_scheduled_work_leases() from public,anon,authenticated;
grant execute on function public.dd_claim_scheduled_operating_work(text,text,integer) to service_role;
grant execute on function public.dd_finish_scheduled_operating_work(uuid,text,text,boolean,jsonb,text) to service_role;
grant execute on function public.dd_requeue_expired_scheduled_work_leases() to service_role;
