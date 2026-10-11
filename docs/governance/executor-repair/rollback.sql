-- Rollback for the governed-PR-executor repair. Restores Production's pre-repair claim function
-- (captured read-only 2026-10-11) and drops the functions the repair adds. Function-only; no table data touched.
-- Signatures taken from the disposable apply of the exact repo migrations (pg_get_function_identity_arguments).
-- Order: restore the old claim function first, then drop the helpers it no longer uses.
create or replace function public.dd_claim_autobuild_candidate(p_worker_key text) returns setof dd_autobuild_candidates language plpgsql set search_path to 'public' as $function$
begin
  if nullif(btrim(p_worker_key),'') is null then raise exception 'worker key required'; end if;
  return query with candidate as (select id from public.dd_autobuild_candidates where status in ('MANIFEST_READY','READY','QUEUED_FOR_BUILD') and risk_tier='LOW' and permission_class in ('CODE_BUILD','AUTO_PR_BUILD') and executor_state='PENDING' and blocker is null and (case when proposed_build is null then false else (proposed_build::jsonb->>'kind')='PATCH_MANIFEST_V1' and jsonb_typeof(proposed_build::jsonb->'files')='array' and jsonb_array_length(proposed_build::jsonb->'files')>0 end) order by created_at,id for update skip locked limit 1)
  update public.dd_autobuild_candidates c set executor_state='LEASED',lease_owner=p_worker_key,leased_at=now(),lease_expires_at=now()+interval '20 minutes' from candidate where c.id=candidate.id returning c.*;
end $function$;


drop function if exists public.dd_autobuild_structured_files_eligible(p_build text);
drop function if exists public.dd_hold_expired_autobuild_leases(p_limit integer);
drop function if exists public.dd_reconcile_autobuild_promotion_reviews(p_limit integer);
drop function if exists public.dd_record_autobuild_pr_evidence(p_candidate_key text, p_worker_key text, p_pr_number integer, p_pr_url text, p_branch text, p_head_sha text, p_run_id text);
drop function if exists public.dd_register_autobuild_promotion_review(p_candidate_key text);
drop function if exists public.dd_requeue_tech_autobuild_candidate(p_candidate_key text, p_build text, p_tech_receipt jsonb);
drop function if exists public.dd_route_autobuild_briefs_to_tech(p_limit integer);
