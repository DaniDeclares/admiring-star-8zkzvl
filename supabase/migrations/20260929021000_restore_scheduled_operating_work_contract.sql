-- Harden the canonical six-argument scheduled-work completion contract from #475.
-- Claim-token ownership remains mandatory; this migration only adds durable receipt/blocker requirements.



create or replace function private.dd_finish_scheduled_operating_work(
  p_id uuid,
  p_worker_key text,
  p_claim_token text,
  p_success boolean,
  p_receipt jsonb,
  p_blocker text default null
)
returns jsonb language plpgsql security definer set search_path to 'public','private' as $$
declare w public.dd_scheduled_operating_work%rowtype;
begin
 select * into w from public.dd_scheduled_operating_work where id=p_id for update;
 if not found then raise exception 'WORK_NOT_FOUND'; end if;
 if nullif(btrim(p_worker_key),'') is null then raise exception 'WORKER_KEY_REQUIRED'; end if;
 if nullif(btrim(p_claim_token),'') is null then raise exception 'CLAIM_TOKEN_REQUIRED'; end if;
 if p_success is null then raise exception 'SUCCESS_DECISION_REQUIRED'; end if;
 if w.status<>'IN_PROGRESS' or coalesce(w.payload->>'claimed_by','')<>p_worker_key
    or coalesce(w.payload->>'claim_token','')<>p_claim_token
    or coalesce((w.payload->>'lease_expires_at')::timestamptz,'epoch'::timestamptz)<=now() then
   raise exception 'LEASE_NOT_OWNED';
 end if;
 if p_success and (p_receipt is null or jsonb_typeof(p_receipt)<>'object' or p_receipt='{}'::jsonb) then raise exception 'DURABLE_EXECUTION_RECEIPT_REQUIRED'; end if;
 if not p_success and nullif(btrim(p_blocker),'') is null then raise exception 'SPECIFIC_BLOCKER_REQUIRED'; end if;
 update public.dd_scheduled_operating_work set
   status=case when p_success then 'COMPLETED' else 'BLOCKED' end,
   payload=coalesce(payload,'{}'::jsonb)||jsonb_build_object('execution_receipt',coalesce(p_receipt,'{}'::jsonb),'completed_at',case when p_success then now() else null end,'blocker',case when p_success then null else p_blocker end),updated_at=now()
 where id=p_id;
 return jsonb_build_object('id',p_id,'status',case when p_success then 'COMPLETED' else 'BLOCKED' end);
end $$;
revoke all on function private.dd_finish_scheduled_operating_work(uuid,text,text,boolean,jsonb,text) from public,anon,authenticated;
grant execute on function private.dd_finish_scheduled_operating_work(uuid,text,text,boolean,jsonb,text) to service_role;
comment on function private.dd_finish_scheduled_operating_work(uuid,text,text,boolean,jsonb,text) is 'Canonical claim-token scheduled-work finisher. Requires live lease ownership and durable success evidence; failures require a specific blocker.';

create or replace function public.dd_finish_scheduled_operating_work(p_id uuid,p_worker_key text,p_claim_token text,p_success boolean,p_receipt jsonb,p_blocker text default null)
returns jsonb language sql security definer set search_path='public','private'
as $ select private.dd_finish_scheduled_operating_work(p_id,p_worker_key,p_claim_token,p_success,p_receipt,p_blocker) $;
revoke all on function public.dd_finish_scheduled_operating_work(uuid,text,text,boolean,jsonb,text) from public,anon,authenticated;
grant execute on function public.dd_finish_scheduled_operating_work(uuid,text,text,boolean,jsonb,text) to service_role;
