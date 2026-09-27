create or replace function public.dd_claim_autobuild_candidate(p_worker_key text)
returns setof public.dd_autobuild_candidates
language plpgsql
security invoker
set search_path='public'
as $$
begin
  if nullif(btrim(p_worker_key),'') is null then
    raise exception 'worker key required';
  end if;

  return query
  with candidate as (
    select id
    from public.dd_autobuild_candidates
    where status in ('MANIFEST_READY','READY','QUEUED_FOR_BUILD')
      and risk_tier='LOW'
      and permission_class in ('CODE_BUILD','AUTO_PR_BUILD')
      and executor_state='PENDING'
    order by created_at,id
    for update skip locked
    limit 1
  )
  update public.dd_autobuild_candidates c
  set executor_state='LEASED',
      lease_owner=p_worker_key,
      leased_at=now(),
      lease_expires_at=now()+interval '20 minutes'
  from candidate
  where c.id=candidate.id
  returning c.*;
end $$;

revoke execute on function public.dd_claim_autobuild_candidate(text) from public,anon,authenticated;
grant execute on function public.dd_claim_autobuild_candidate(text) to postgres,service_role;
