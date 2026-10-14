-- Prevent abandoned leases from causing repeated PRs or permanently invisible work.
-- Never automatically requeues an uncertain build: Tech must reconcile GitHub first.
create or replace function public.dd_hold_expired_autobuild_leases(p_limit integer default 10)
returns jsonb language plpgsql security definer set search_path='public','pg_temp' as $$
declare v_count integer;
begin
 -- SECURITY DEFINER: current_user is the function owner here, so it cannot identify the caller. Use the JWT role
 -- (claims JSON, as Supabase auth.role() does; PostgREST no longer sets the legacy per-claim GUC) or a direct privileged session.
 if coalesce(nullif(current_setting('request.jwt.claim.role',true),''),nullif(current_setting('request.jwt.claims',true),'')::jsonb ->> 'role','') <> 'service_role'
    and session_user not in ('postgres','service_role') then raise exception 'service role required'; end if;
 if p_limit is null or p_limit<1 or p_limit>25 then raise exception 'bounded batch required'; end if;
 with stuck as (
   select id from public.dd_autobuild_candidates
   where executor_state='LEASED' and lease_expires_at < now()
     and status in ('MANIFEST_READY','READY','QUEUED_FOR_BUILD')
   order by lease_expires_at,id for update skip locked limit p_limit
 ), held as (
   update public.dd_autobuild_candidates c
   set executor_state='HELD_IMPLEMENTATION',
       blocker='TECH_RECONCILE_EXPIRED_LEASE_AND_GITHUB_PR',
       last_error='Lease expired; Tech must check for an existing branch/PR before requeue to prevent duplicates.',
       lease_owner=null,leased_at=null,lease_expires_at=null,updated_at=now(),
       proof=coalesce(c.proof,'{}'::jsonb)||jsonb_build_object('expired_lease_held_at',now(),
        'requires_github_reconciliation',true)
   from stuck where c.id=stuck.id returning c.id
 ) select count(*) into v_count from held;
 return jsonb_build_object('held_expired_leases',v_count,'approval_reset',false,
   'new_pr_created',false,'production_permission_granted',false);
end $$;
revoke execute on function public.dd_hold_expired_autobuild_leases(integer) from public,anon,authenticated;
grant execute on function public.dd_hold_expired_autobuild_leases(integer) to service_role;
