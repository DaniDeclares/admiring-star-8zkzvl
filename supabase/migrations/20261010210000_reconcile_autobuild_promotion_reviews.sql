-- Recover the existing build->promotion review handoff after partial workflow failures.
-- Never grants review pass, owner approval, or Production release rights.
create or replace function public.dd_reconcile_autobuild_promotion_reviews(p_limit integer default 10)
returns jsonb language plpgsql security definer set search_path='public','pg_temp'
as $$
declare v record; v_handled integer:=0; v_failed integer:=0; v_errors jsonb:='[]'::jsonb;
begin
 if current_user not in ('postgres','service_role') then raise exception 'service role required'; end if;
 if p_limit is null or p_limit<1 or p_limit>25 then raise exception 'bounded batch required'; end if;
 for v in
   select c.candidate_key from public.dd_autobuild_candidates c
   where c.status='PR_OPENED' and c.executor_state='PR_OPENED'
     and c.pull_request_number is not null and c.head_sha ~ '^[0-9a-f]{40}$'
     and c.pull_request_url is not null and c.risk_tier='LOW'
     and c.permission_class in ('CODE_BUILD','AUTO_PR_BUILD')
     and not exists (
       select 1 from public.dd_promotion_candidates p
       where p.candidate_key='AUTOBUILD_REVIEW:'||c.candidate_key
     )
   order by c.built_at nulls last,c.created_at,c.id
   limit p_limit
 loop
   begin
     perform public.dd_register_autobuild_promotion_review(v.candidate_key);
     v_handled:=v_handled+1;
   exception when others then
     v_failed:=v_failed+1;
     v_errors:=v_errors||jsonb_build_array(jsonb_build_object(
       'candidate_key',v.candidate_key,'error',left(sqlerrm,240)));
   end;
 end loop;
 return jsonb_build_object('review_links_recovered',v_handled,'failures',v_failed,
   'errors',v_errors,'production_approval_granted',false,'external_action_granted',false);
end $$;
revoke execute on function public.dd_reconcile_autobuild_promotion_reviews(integer) from public,anon,authenticated;
grant execute on function public.dd_reconcile_autobuild_promotion_reviews(integer) to service_role;
