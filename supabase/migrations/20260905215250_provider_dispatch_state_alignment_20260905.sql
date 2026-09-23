create or replace function public.dd_dispatch_eligible_jobs(p_limit integer default 25)
returns table(job_id uuid, provider_id uuid, assignment_id uuid, eligibility_score numeric)
language sql security definer
set search_path = public
as $$
with open_jobs as (
  select j.id as jid, j.scheduled_start, j.work_order_id
  from dd_jobs j
  where lower(j.job_status) in ('ready_for_dispatch','dispatching','open','new')
    and j.assigned_to is null
  order by j.scheduled_start nulls last, j.created_at
  limit greatest(coalesce(p_limit,25),1)
), candidates as (
  select o.jid, c.provider_id as pid,
    (case when lower(coalesce(c.capacity_status,'')) in ('available','open','active') then 50 else 0 end
     + case when c.max_jobs_per_day > 0 then 25 else 0 end
     + case when c.max_concurrent_jobs > 0 then 25 else 0 end)::numeric as score
  from open_jobs o
  cross join dd_provider_capacity_profiles c
  join dd_providers p on p.id=c.provider_id and p.is_active is true
  join dd_provider_organizations org on org.id=p.org_id
  where lower(coalesce(c.capacity_status,'')) in ('available','open','active')
    and c.max_jobs_per_day > 0 and c.max_concurrent_jobs > 0
    and org.is_active is true
    and upper(coalesce(org.qualification_status,''))='QUALIFIED'
    and upper(coalesce(org.compliance_status,'')) in ('VERIFIED','ACTIVE')
    and upper(coalesce(org.agreement_status,'')) in ('ACTIVE','EXECUTED')
    and upper(coalesce(org.network_access_level,''))='AUTHORIZED'
    and upper(coalesce(org.permission_status,''))='AUTHORIZED'
    and coalesce(org.accepts_new_work,false) is true
    and (o.work_order_id is null or not exists (select 1 from dd_work_orders wo where wo.id=o.work_order_id and wo.service_id is not null)
      or exists (select 1 from dd_work_orders wo join dd_provider_capabilities pc on pc.provider_org_id=org.id and pc.provider_id=p.id and pc.service_id=wo.service_id and pc.is_authorized is true where wo.id=o.work_order_id))
    and not exists (select 1 from dd_job_assignments a where a.job_id=o.jid and a.provider_id=c.provider_id and lower(a.assignment_status) in ('offered','accepted','assigned','in_progress'))
), ranked as (
  select c.*, row_number() over(partition by c.jid order by c.score desc,c.pid) rn from candidates c
), ins as (
  insert into dd_job_assignments(job_id,provider_id,assignment_status,offered_at,created_at,updated_at)
  select r.jid,r.pid,'offered',now(),now(),now() from ranked r where r.rn=1
  returning id as aid,job_id as jid,provider_id as pid
)
select i.jid,i.pid,i.aid,r.score from ins i join ranked r on r.jid=i.jid and r.pid=i.pid;
$$;
revoke all on function public.dd_dispatch_eligible_jobs(integer) from public,anon,authenticated;
grant execute on function public.dd_dispatch_eligible_jobs(integer) to service_role;
