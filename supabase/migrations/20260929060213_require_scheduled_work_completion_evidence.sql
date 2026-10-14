-- Harden canonical scheduled-work completion evidence.
-- Existing lease/claim/requeue contract is preserved. No scheduler or queue duplication.

create or replace function private.dd_finish_scheduled_operating_work(
  p_id uuid,
  p_worker_key text,
  p_success boolean,
  p_receipt jsonb,
  p_blocker text default null
)
returns jsonb
language plpgsql
security definer
set search_path to 'public','private'
as $$
declare w public.dd_scheduled_operating_work%rowtype;
begin
  select * into w from public.dd_scheduled_operating_work where id=p_id for update;
  if not found then raise exception 'WORK_NOT_FOUND'; end if;
  if w.status<>'IN_PROGRESS' or coalesce(w.payload->>'claimed_by','')<>p_worker_key then
    raise exception 'LEASE_NOT_OWNED';
  end if;
  if p_success and coalesce(p_receipt,'{}'::jsonb)='{}'::jsonb then
    raise exception 'DURABLE_EXECUTION_RECEIPT_REQUIRED';
  end if;
  if not p_success and nullif(btrim(p_blocker),'') is null then
    raise exception 'SPECIFIC_BLOCKER_REQUIRED';
  end if;

  update public.dd_scheduled_operating_work
  set status=case when p_success then 'COMPLETED' else 'BLOCKED' end,
      payload=coalesce(payload,'{}'::jsonb)||jsonb_build_object(
        'execution_receipt',coalesce(p_receipt,'{}'::jsonb),
        'completed_at',case when p_success then now() else null end,
        'blocker',case when p_success then null else p_blocker end
      ),
      updated_at=now()
  where id=p_id;

  return jsonb_build_object('id',p_id,'status',case when p_success then 'COMPLETED' else 'BLOCKED' end);
end $$;

comment on function private.dd_finish_scheduled_operating_work(uuid,text,boolean,jsonb,text)
is 'Canonical scheduled-work finisher. Success requires a non-empty durable execution receipt; failure requires a specific blocker.';
