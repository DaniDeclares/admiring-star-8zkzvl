-- Recover existing approved BUILD_BRIEF_V1 handoffs into the existing Tech work queue.
-- Briefs are not executable patches. No new queue, approval, PR, merge or deploy.
create or replace function public.dd_route_autobuild_briefs_to_tech(p_limit integer default 10)
returns jsonb language plpgsql security definer
set search_path='public','pg_temp' as $$
declare
  v_count integer := 0;
  v_linked integer := 0;
begin
  if current_user not in ('postgres','service_role') then raise exception 'service role required'; end if;
  if p_limit is null or p_limit < 1 or p_limit > 25 then raise exception 'bounded batch required'; end if;
  if not exists (select 1 from public.dd_code_repair_policy
    where policy_key='PLATFORM_SAFE_MANIFEST_V2' and status='ACTIVE') then
    raise exception 'existing Tech repair policy inactive';
  end if;
  with pending as (
    select c.id,c.candidate_key,c.title,c.proposed_build,c.blocker,c.proof
    from public.dd_autobuild_candidates c
    where c.status in ('MANIFEST_READY','READY','QUEUED_FOR_BUILD')
      and c.executor_state='PENDING' and c.risk_tier='LOW'
      and c.permission_class in ('CODE_BUILD','AUTO_PR_BUILD')
      and c.code_repair_work_id is null
      and c.proposed_build is not null
      and public.dd_autobuild_structured_files_eligible(c.proposed_build)=false
      and c.proposed_build::jsonb ->> 'kind'='BUILD_BRIEF_V1'
    order by c.created_at,c.id for update skip locked limit p_limit
  ), routed as (
    insert into public.dd_code_repair_work_queue
      (policy_key,work_key,failure_kind,failure_evidence,repo,target_branch,status,execution_mode)
    select 'PLATFORM_SAFE_MANIFEST_V2','AUTOBUILD_SPEC:'||candidate_key,
      'APPROVED_BRIEF_NEEDS_FILE_MANIFEST',
      jsonb_build_object('candidate_key',candidate_key,'title',title,
        'original_blocker',blocker,'source_approval',coalesce(proof,'{}'::jsonb),
        'build_brief',proposed_build::jsonb,
        'requested_output','TECH_REVIEWED_PATCH_MANIFEST_V1',
        'do_not_request_repeat_owner_approval',true,
        'no_merge_or_deployment_authority',true),
      'DaniDeclares/admiring-star-8zkzvl','main','QUEUED','DRY_RUN'
    from pending on conflict (work_key) do nothing returning id
  ), linked as (
    update public.dd_autobuild_candidates c
      set code_repair_work_id=w.id,
          proof=coalesce(c.proof,'{}'::jsonb) ||
            jsonb_build_object('tech_spec_work_key',w.work_key,'tech_spec_routed_at',now()),
          updated_at=now()
      from public.dd_code_repair_work_queue w
      where w.work_key='AUTOBUILD_SPEC:'||c.candidate_key
        and c.code_repair_work_id is null
        and c.executor_state='PENDING'
        and c.status in ('MANIFEST_READY','READY','QUEUED_FOR_BUILD')
      returning c.id
  )
  select count(*) into v_linked from linked;
  return jsonb_build_object('linked_to_existing_tech_queue',v_linked,
    'new_pr_created',false,'approval_reset',false,'production_permission_granted',false);
end $$;
revoke execute on function public.dd_route_autobuild_briefs_to_tech(integer) from public,anon,authenticated;
grant execute on function public.dd_route_autobuild_briefs_to_tech(integer) to service_role;
