drop function if exists public.dd_dispatch_eligible_jobs(integer);
create function public.dd_dispatch_eligible_jobs(p_limit integer default 25)
returns table(job_id uuid, provider_id uuid, assignment_id uuid, eligibility_score numeric)
language sql security definer set search_path=public
as $$
with open_jobs as (
  select j.id as jid, j.scheduled_start
  from dd_jobs j
  where j.job_status in ('ready_for_dispatch','dispatching','open') and j.assigned_to is null
  order by j.scheduled_start nulls last, j.created_at
  limit p_limit
), candidates as (
  select o.jid, c.provider_id as pid,
    (case when c.capacity_status in ('available','open','active') then 50 else 0 end
     + case when c.max_jobs_per_day > 0 then 25 else 0 end
     + case when c.max_concurrent_jobs > 0 then 25 else 0 end)::numeric as score
  from open_jobs o cross join dd_provider_capacity_profiles c
  where c.capacity_status in ('available','open','active')
    and c.max_jobs_per_day > 0 and c.max_concurrent_jobs > 0
    and not exists (
      select 1 from dd_job_assignments a
      where a.job_id=o.jid and a.provider_id=c.provider_id
        and a.assignment_status in ('offered','accepted','assigned','in_progress')
    )
), ranked as (
  select c.jid,c.pid,c.score,
    row_number() over(partition by c.jid order by c.score desc,c.pid) as rn
  from candidates c
), ins as (
  insert into dd_job_assignments(job_id,provider_id,assignment_status,offered_at,created_at,updated_at)
  select r.jid,r.pid,'offered',now(),now(),now() from ranked r where r.rn=1
  returning id as aid, job_id as jid, provider_id as pid
)
select i.jid as job_id,i.pid as provider_id,i.aid as assignment_id,r.score as eligibility_score
from ins i join ranked r on r.jid=i.jid and r.pid=i.pid;
$$;
revoke all on function public.dd_dispatch_eligible_jobs(integer) from public, anon, authenticated;
grant execute on function public.dd_dispatch_eligible_jobs(integer) to service_role;