
create or replace function public.dd_requeue_expired_external_action_leases()
returns integer language plpgsql security definer set search_path to 'public' as $$
declare n int;
begin
 update public.dd_external_action_outbox
 set status=case when attempt_count>=max_attempts then 'FAILED' else 'PENDING' end,
 claimed_at=null,claimed_by=null,lease_expires_at=null,
 next_attempt_at=case when attempt_count>=max_attempts then next_attempt_at else now()+interval '5 minutes' end,
 last_error_code='LEASE_EXPIRED',last_error='Worker lease expired before a verified completion receipt.',updated_at=now()
 where status='CLAIMED' and lease_expires_at<now();
 get diagnostics n=row_count;
 insert into public.dd_external_action_dead_letters(outbox_id,destination_system,action_type,failure_class,final_error)
 select id,destination_system,action_type,'MAX_ATTEMPTS_AFTER_LEASE_EXPIRY',coalesce(last_error,'Worker lease expired before verified completion')
 from public.dd_external_action_outbox o
 where o.status='FAILED' and o.last_error_code='LEASE_EXPIRED'
 and not exists(select 1 from public.dd_external_action_dead_letters d where d.outbox_id=o.id);
 return n;
end $$;
revoke all on function public.dd_requeue_expired_external_action_leases() from public, anon, authenticated;
grant execute on function public.dd_requeue_expired_external_action_leases() to service_role;
