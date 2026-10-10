-- Correct the already-source-controlled brief-to-Tech bridge BEFORE Production installation.
-- Repair same existing function/queue; no new scheduler, policy, PR or deployment.
-- Each locked candidate is linked only after its Tech work row is visible.
create or replace function public.dd_route_autobuild_briefs_to_tech(p_limit integer default 10)
returns jsonb language plpgsql security definer
set search_path='public','pg_temp' as $$
declare
  v_candidate record;
  v_work_id public.dd_code_repair_work_queue.id%type;
  v_linked integer := 0;
  v_changed integer := 0;
begin
  -- SECURITY DEFINER current_user is the function owner, not the RPC caller.
  -- Accept an authenticated service_role JWT or a direct privileged session.
  if coalesce(current_setting('request.jwt.claim.role',true),'') <> 'service_role'
     and session_user not in ('postgres','service_role') then
    raise exception 'service role required';
  end if;
  if p_limit is null or p_limit < 1 or p_limit > 25 then
    raise exception 'bounded batch required';
  end if;
  if not exists (select 1 from public.dd_code_repair_policy
    where policy_key='PLATFORM_SAFE_MANIFEST_V2' and status='ACTIVE') then
    raise exception 'existing Tech repair policy inactive';
  end if;
  for v_candidate in
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
  loop
    v_work_id := null;
    insert into public.dd_code_repair_work_queue
      (policy_key,work_key,failure_kind,failure_evidence,repo,target_branch,status,execution_mode)
    values ('PLATFORM_SAFE_MANIFEST_V2','AUTOBUILD_SPEC:'||v_candidate.candidate_key,
      'APPROVED_BRIEF_NEEDS_FILE_MANIFEST',
      jsonb_build_object('candidate_key',v_candidate.candidate_key,'title',v_candidate.title,
        'original_blocker',v_candidate.blocker,'source_approval',coalesce(v_candidate.proof,'{}'::jsonb),
        'build_brief',v_candidate.proposed_build::jsonb,
        'requested_output','TECH_REVIEWED_PATCH_MANIFEST_V1',
        'do_not_request_repeat_owner_approval',true,
        'no_merge_or_deployment_authority',true),
      'DaniDeclares/admiring-star-8zkzvl','main','QUEUED','DRY_RUN')
    on conflict (work_key) do nothing returning id into v_work_id;
    if v_work_id is null then
      select w.id into v_work_id from public.dd_code_repair_work_queue w
      where w.work_key='AUTOBUILD_SPEC:'||v_candidate.candidate_key;
    end if;
    if v_work_id is not null then
      update public.dd_autobuild_candidates c
      set code_repair_work_id=v_work_id,
          proof=coalesce(c.proof,'{}'::jsonb) ||
            jsonb_build_object('tech_spec_work_key','AUTOBUILD_SPEC:'||v_candidate.candidate_key,
              'tech_spec_routed_at',now()),
          updated_at=now()
      where c.id=v_candidate.id and c.code_repair_work_id is null
        and c.executor_state='PENDING'
        and c.status in ('MANIFEST_READY','READY','QUEUED_FOR_BUILD');
      get diagnostics v_changed = row_count;
      v_linked := v_linked + v_changed;
    end if;
  end loop;
  return jsonb_build_object('linked_to_existing_tech_queue',v_linked,
    'new_pr_created',false,'approval_reset',false,'production_permission_granted',false);
end $$;
revoke execute on function public.dd_route_autobuild_briefs_to_tech(integer) from public,anon,authenticated;
grant execute on function public.dd_route_autobuild_briefs_to_tech(integer) to service_role;
