-- Route successfully built PR evidence into the existing promotion review register.
-- This creates ONLY a blocked, unproven review candidate; no promotion authority.
create or replace function public.dd_register_autobuild_promotion_review(p_candidate_key text)
returns jsonb language plpgsql security definer set search_path='public','pg_temp'
as $$
declare c public.dd_autobuild_candidates%rowtype; v_key text; v_id uuid;
begin
 if current_user not in ('postgres','service_role') then raise exception 'service role required'; end if;
 select * into c from public.dd_autobuild_candidates where candidate_key=p_candidate_key for update;
 if not found then raise exception 'autobuild candidate missing'; end if;
 if c.status<>'PR_OPENED' or c.executor_state<>'PR_OPENED' or c.pull_request_number is null
    or c.head_sha is null or length(c.head_sha)<>40 or c.pull_request_url is null
    or c.risk_tier<>'LOW' or c.permission_class not in ('CODE_BUILD','AUTO_PR_BUILD') then
   raise exception 'verified PR build evidence missing or not eligible for review routing';
 end if;
 v_key='AUTOBUILD_REVIEW:'||c.candidate_key;
 insert into public.dd_promotion_candidates(
   candidate_key,component_domain,component_name,source_reference,classification,
   proof_status,dependency_status,security_status,production_diff_status,
   rollback_status,owner_approval_status,production_verification_status,blocking_reason,evidence
 ) values (
   v_key,coalesce(nullif(c.domain,''),'SOFTWARE_PLATFORM'),left(c.title,240),
   'GitHub PR #'||c.pull_request_number||' @ '||c.head_sha,
   'PROMOTE_AFTER_FIX','UNPROVEN','UNCHECKED','UNCHECKED','UNCHECKED',
   'UNDEFINED','NOT_REQUESTED','NOT_RUN',
   'Independent review, Tester provenance, rollback, owner/standing promotion authority and Production proof are not yet verified',
   jsonb_build_object('autobuild_candidate_key',c.candidate_key,'source_pr',c.pull_request_url,
     'source_sha',c.head_sha,'github_build_proof',c.proof,'route','REVIEW_ONLY',
     'tester_proof_verified',false,'deployment_authorized',false,'external_marketing_authorized',false)
 ) on conflict(candidate_key) do nothing;
 select id into v_id from public.dd_promotion_candidates where candidate_key=v_key;
 return jsonb_build_object('status','REVIEW_REGISTERED','review_candidate_key',v_key,
  'review_candidate_id',v_id,'independent_review','PENDING',
  'production_mutation_authorized',false,'publishing_authorized',false);
end $$;
revoke execute on function public.dd_register_autobuild_promotion_review(text) from public,anon,authenticated;
grant execute on function public.dd_register_autobuild_promotion_review(text) to service_role;
