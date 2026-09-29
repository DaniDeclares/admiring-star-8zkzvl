-- Restore the canonical scheduled operating-work lease contract.
-- Backend-only RPCs. Workers may claim/finish only their own leases.

create or replace function public.dd_requeue_expired_scheduled_work_leases()
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare v_count integer;
begin
  update public.dd_scheduled_operating_work
  set status='QUEUED',
      payload=(payload - 'claimed_by' - 'claimed_at' - 'lease_expires_at')
        || jsonb_build_object('requeued_at',now(),'requeue_reason','LEASE_EXPIRED'),
      updated_at=now()
  where status='LEASED'
    and nullif(payload->>'lease_expires_at','')::timestamptz <= now();
  get diagnostics v_count = row_count;
  return v_count;
end $$;

create or replace function public.dd_claim_scheduled_operating_work(
  p_worker_key text,
  p_work_type text,
  p_limit integer default 10
)
returns setof public.dd_scheduled_operating_work
language plpgsql
security definer
set search_path = public
as $$
begin
  if nullif(btrim(p_worker_key),'') is null or nullif(btrim(p_work_type),'') is null then
    raise exception 'worker key and work type are required';
  end if;
  if p_limit < 1 or p_limit > 10 then raise exception 'claim limit must be 1..10'; end if;
  return query
  with candidates as (
    select id from public.dd_scheduled_operating_work
    where status='QUEUED' and work_type=p_work_type
    order by work_date,created_at
    for update skip locked limit p_limit
  ), claimed as (
    update public.dd_scheduled_operating_work w
    set status='LEASED',
        payload=w.payload || jsonb_build_object(
          'claimed_by',p_worker_key,'claimed_at',now(),
          'lease_expires_at',now()+interval '30 minutes',
          'attempt_count',coalesce((w.payload->>'attempt_count')::int,0)+1
        ),
        updated_at=now()
    from candidates c where w.id=c.id
    returning w.*
  )
  select * from claimed;
end $$;

create or replace function public.dd_finish_scheduled_operating_work(
  p_work_id uuid,
  p_worker_key text,
  p_success boolean,
  p_execution_receipt jsonb default '{}'::jsonb,
  p_blocker text default null
)
returns public.dd_scheduled_operating_work
language plpgsql
security definer
set search_path = public
as $$
declare v_row public.dd_scheduled_operating_work;
begin
  if nullif(btrim(p_worker_key),'') is null then raise exception 'worker key is required'; end if;
  if p_success and coalesce(p_execution_receipt,'{}'::jsonb)='{}'::jsonb then
    raise exception 'successful completion requires durable execution receipt';
  end if;
  if not p_success and nullif(btrim(p_blocker),'') is null then
    raise exception 'failed completion requires a specific blocker';
  end if;

  update public.dd_scheduled_operating_work
  set status=case when p_success then 'COMPLETED' else 'BLOCKED' end,
      payload=(payload - 'lease_expires_at') || jsonb_build_object(
        'completed_at',case when p_success then to_jsonb(now()) else 'null'::jsonb end,
        'execution_receipt',coalesce(p_execution_receipt,'{}'::jsonb),
        'blocker',case when p_success then 'null'::jsonb else to_jsonb(p_blocker) end
      ),
      updated_at=now()
  where id=p_work_id and status='LEASED' and payload->>'claimed_by'=p_worker_key
  returning * into v_row;

  if v_row.id is null then raise exception 'work row is not actively leased to worker %',p_worker_key; end if;
  return v_row;
end $$;

revoke all on function public.dd_requeue_expired_scheduled_work_leases() from public,anon,authenticated;
revoke all on function public.dd_claim_scheduled_operating_work(text,text,integer) from public,anon,authenticated;
revoke all on function public.dd_finish_scheduled_operating_work(uuid,text,boolean,jsonb,text) from public,anon,authenticated;
grant execute on function public.dd_requeue_expired_scheduled_work_leases() to service_role;
grant execute on function public.dd_claim_scheduled_operating_work(text,text,integer) to service_role;
grant execute on function public.dd_finish_scheduled_operating_work(uuid,text,boolean,jsonb,text) to service_role;
