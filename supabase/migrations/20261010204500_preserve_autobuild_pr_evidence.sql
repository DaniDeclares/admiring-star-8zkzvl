-- Preserve prior approval/Tech recovery provenance when recording a generated PR.
-- Service-role only. Never approves independent review, release or Production deployment.
create or replace function public.dd_record_autobuild_pr_evidence(
  p_candidate_key text,p_worker_key text,p_pr_number integer,p_pr_url text,
  p_branch text,p_head_sha text,p_run_id text
) returns jsonb language plpgsql security definer
set search_path='public','pg_temp' as $$
declare c public.dd_autobuild_candidates%rowtype;
begin
 -- SECURITY DEFINER: current_user is the function owner here, so it cannot identify the caller. Use the JWT role
 -- (claims JSON, as Supabase auth.role() does; PostgREST no longer sets the legacy per-claim GUC) or a direct privileged session.
 if coalesce(nullif(current_setting('request.jwt.claim.role',true),''),nullif(current_setting('request.jwt.claims',true),'')::jsonb ->> 'role','') <> 'service_role'
    and session_user not in ('postgres','service_role') then raise exception 'service role required'; end if;
 if p_pr_number<=0 or p_head_sha !~ '^[0-9a-f]{40}$' or
    p_pr_url !~ '^https://github[.]com/DaniDeclares/admiring-star-8zkzvl/pull/[0-9]+$' or
    p_branch not like 'dani/autobuild-%' then raise exception 'invalid PR evidence'; end if;
 select * into c from public.dd_autobuild_candidates where candidate_key=p_candidate_key for update;
 if not found or c.executor_state<>'LEASED' or c.lease_owner is distinct from p_worker_key then
   raise exception 'autobuild lease must match PR evidence reporter'; end if;
 update public.dd_autobuild_candidates set
   status='PR_OPENED',executor_state='PR_OPENED',
   branch_name=p_branch,pull_request_number=p_pr_number,pull_request_url=p_pr_url,
   head_sha=p_head_sha,built_at=now(),lease_owner=null,lease_expires_at=null,
   proof=coalesce(c.proof,'{}'::jsonb)||jsonb_build_object(
      'github_pr',jsonb_build_object('number',p_pr_number,'url',p_pr_url,'sha',p_head_sha,'run_id',p_run_id),
      'review_state','PENDING_INDEPENDENT_REVIEW',
      'promotion_state','NOT_AUTHORIZED','production_verification','NOT_RUN',
      'auto_merge',false,'production_direct_write',false),
   updated_at=now()
 where id=c.id;
 return jsonb_build_object('state','PR_OPENED','candidate_key',p_candidate_key,'promotion_authorized',false);
end $$;
revoke execute on function public.dd_record_autobuild_pr_evidence(text,text,integer,text,text,text,text) from public,anon,authenticated;
grant execute on function public.dd_record_autobuild_pr_evidence(text,text,integer,text,text,text,text) to service_role;
