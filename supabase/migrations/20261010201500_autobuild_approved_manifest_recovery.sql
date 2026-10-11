-- DANI approved-work handoff: bounded format compatibility and recoverable Tech hold.
-- No new promotion, deployment, publishing, pricing, or outreach permission is granted.
create or replace function public.dd_claim_autobuild_candidate(p_worker_key text)
returns setof public.dd_autobuild_candidates language plpgsql
set search_path = 'public', 'pg_temp'
as $$
begin
  if nullif(btrim(p_worker_key), '') is null then
    raise exception 'worker key required';
  end if;
  if current_user not in ('postgres','service_role') then
    raise exception 'service role required';
  end if;
  return query
  with candidate as (
    select c.id from public.dd_autobuild_candidates c
    where c.status in ('MANIFEST_READY','READY','QUEUED_FOR_BUILD')
      and c.risk_tier='LOW'
      and c.permission_class in ('CODE_BUILD','AUTO_PR_BUILD')
      and c.executor_state='PENDING' and c.blocker is null
      and public.dd_autobuild_structured_files_eligible(c.proposed_build)
    order by c.created_at,c.id for update skip locked limit 1
  )
  update public.dd_autobuild_candidates c
  set executor_state='LEASED',lease_owner=p_worker_key,
      leased_at=now(),lease_expires_at=now()+interval '20 minutes'
  from candidate where c.id=candidate.id returning c.*;
end $$;

create or replace function public.dd_autobuild_structured_files_eligible(p_build text)
returns boolean language plpgsql immutable
set search_path = 'pg_catalog'
as $$
declare v jsonb;
begin
  if p_build is null then return false; end if;
  begin v:=p_build::jsonb; exception when others then return false; end;
  return jsonb_typeof(v)='object'
    and v->>'kind' in ('PATCH_MANIFEST_V1','APPROVED_FILE_CHANGES_V1')
    and jsonb_typeof(v->'files')='array'
    and jsonb_array_length(v->'files') between 1 and 20
    and not exists (
      select 1 from jsonb_array_elements(v->'files') f
      where jsonb_typeof(f)<>'object'
        or jsonb_typeof(f->'path')<>'string'
        or jsonb_typeof(f->'content')<>'string'
        or length(f->>'path') not between 1 and 260
        or left(f->>'path',1)='/'
        or (f->>'path') like '%..%'
        or (f->>'path') ~ '(^|/)(\.env|\.github)(/|$)'
    );
exception when others then return false;
end $$;

-- Re-declare claim after helper exists: deployment order is safe because PL/pgSQL resolves at call time.
revoke execute on function public.dd_claim_autobuild_candidate(text) from public,anon,authenticated;
grant execute on function public.dd_claim_autobuild_candidate(text) to service_role;
revoke execute on function public.dd_autobuild_structured_files_eligible(text) from public,anon,authenticated;
grant execute on function public.dd_autobuild_structured_files_eligible(text) to service_role;

-- Tech supplies a complete, reviewed structured edit, not generated code inferred from a brief.
-- No permission_class/risk_tier/status escalation is allowed by this operation.
create or replace function public.dd_requeue_tech_autobuild_candidate(p_candidate_key text,p_build text,p_tech_receipt jsonb)
returns jsonb language plpgsql
set search_path = 'public','pg_temp'
as $$
declare c public.dd_autobuild_candidates%rowtype;
begin
  if current_user not in ('postgres','service_role') then raise exception 'service role required'; end if;
  if coalesce(p_tech_receipt->>'tech_review_sha','')='' or
     coalesce(p_tech_receipt->>'source_approval_id','')='' then
    raise exception 'Tech review and original approval evidence required';
  end if;
  if not public.dd_autobuild_structured_files_eligible(p_build) then
    raise exception 'bounded approved files manifest required';
  end if;
  select * into c from public.dd_autobuild_candidates
    where candidate_key=p_candidate_key for update;
  if not found then raise exception 'candidate missing'; end if;
  if c.executor_state<>'HELD_IMPLEMENTATION' or
     c.status not in ('MANIFEST_READY','READY','QUEUED_FOR_BUILD') or
     c.risk_tier<>'LOW' or
     c.permission_class not in ('CODE_BUILD','AUTO_PR_BUILD') then
    raise exception 'candidate is not eligible for Tech recovery';
  end if;
  update public.dd_autobuild_candidates set
    proposed_build=p_build,executor_state='PENDING',blocker=null,
    lease_owner=null,leased_at=null,lease_expires_at=null,
    last_error=null,
    proof=coalesce(proof,'{}'::jsonb)||jsonb_build_object('tech_recovery',p_tech_receipt,'requeued_at',now()),
    updated_at=now()
  where id=c.id;
  return jsonb_build_object('candidate_key',p_candidate_key,'state','PENDING','approval_reused',true,
    'production_promotion_authorized',false,'outreach_authorized',false);
end $$;
revoke execute on function public.dd_requeue_tech_autobuild_candidate(text,text,jsonb) from public,anon,authenticated;
grant execute on function public.dd_requeue_tech_autobuild_candidate(text,text,jsonb) to service_role;
