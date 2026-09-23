-- Canonical summary job lifecycle: jobs summarize execution; work orders carry the detailed FOS lifecycle.
create or replace function public.dd_normalize_job_status()
returns trigger language plpgsql as $$
begin
  new.job_status := case upper(coalesce(new.job_status,''))
    when 'NEW' then 'new'
    when 'CREATED' then 'new'
    when 'DISPATCH_REVIEW' then 'new'
    when 'ASSIGNMENT_OFFERED' then 'new'
    when 'SCHEDULED' then 'scheduled'
    when 'IN_PROGRESS' then 'in_progress'
    when 'BLOCKED' then 'blocked'
    when 'COMPLETED' then 'completed'
    when 'CANCELLED' then 'cancelled'
    when 'CLOSED' then 'closed'
    else new.job_status
  end;
  return new;
end $$;
drop trigger if exists trg_dd_jobs_normalize_status on public.dd_jobs;
create trigger trg_dd_jobs_normalize_status before insert or update of job_status on public.dd_jobs for each row execute function public.dd_normalize_job_status();

create or replace function public.dd_normalize_task_status()
returns trigger language plpgsql as $$
begin
  new.status := case upper(coalesce(new.status,''))
    when 'PENDING' then 'open'
    when 'OPEN' then 'open'
    when 'IN_PROGRESS' then 'in_progress'
    when 'COMPLETED' then 'done'
    when 'DONE' then 'done'
    when 'BLOCKED' then 'blocked'
    when 'SKIPPED' then 'skipped'
    when 'CANCELLED' then 'cancelled'
    else new.status
  end;
  return new;
end $$;
drop trigger if exists trg_dd_job_tasks_normalize_status on public.dd_job_tasks;
create trigger trg_dd_job_tasks_normalize_status before insert or update of status on public.dd_job_tasks for each row execute function public.dd_normalize_task_status();

alter table public.dd_job_tasks drop constraint if exists dd_job_tasks_status_check;
alter table public.dd_job_tasks add constraint dd_job_tasks_status_check check (status = any(array['open','in_progress','done','blocked','skipped','cancelled']::text[]));

create or replace function public.dd_transition_job(p_job_id uuid,p_new_status text)
returns public.dd_jobs language plpgsql security definer set search_path=public as $$
declare j public.dd_jobs; old_status text; new_status text;
begin
 select * into j from public.dd_jobs where id=p_job_id for update;
 if j.id is null then raise exception 'Job not found'; end if;
 old_status:=j.job_status;
 new_status:=case upper(coalesce(p_new_status,'')) when 'NEW' then 'new' when 'CREATED' then 'new' when 'DISPATCH_REVIEW' then 'new' when 'ASSIGNMENT_OFFERED' then 'new' when 'SCHEDULED' then 'scheduled' when 'IN_PROGRESS' then 'in_progress' when 'BLOCKED' then 'blocked' when 'COMPLETED' then 'completed' when 'CANCELLED' then 'cancelled' when 'CLOSED' then 'closed' else p_new_status end;
 if new_status not in ('new','scheduled','in_progress','blocked','completed','cancelled','closed') then raise exception 'Invalid job status'; end if;
 if old_status='new' and new_status not in ('new','scheduled','cancelled') then raise exception 'Invalid transition'; end if;
 if old_status='scheduled' and new_status not in ('scheduled','in_progress','cancelled') then raise exception 'Invalid transition'; end if;
 if old_status='in_progress' and new_status not in ('in_progress','blocked','completed','cancelled') then raise exception 'Invalid transition'; end if;
 if old_status='blocked' and new_status not in ('blocked','in_progress','cancelled') then raise exception 'Invalid transition'; end if;
 if old_status='completed' and new_status<>'closed' then raise exception 'Invalid transition'; end if;
 if old_status in ('cancelled','closed') and new_status<>old_status then raise exception 'Terminal job state cannot be changed'; end if;
 update public.dd_jobs set job_status=new_status,updated_at=now() where id=p_job_id returning * into j; return j;
end $$;

-- Preserve the detailed FOS lifecycle as the authoritative work-order execution state.
create or replace function public.dd_dispatch_eligible_jobs(p_limit integer default 25)
returns table(job_id uuid,provider_id uuid,assignment_id uuid,eligibility_score numeric)
language sql security definer set search_path=public as $$
with open_jobs as (
 select j.id jid,j.scheduled_start,j.work_order_id from dd_jobs j where j.job_status='new' and j.assigned_to is null order by j.scheduled_start nulls last,j.created_at limit greatest(coalesce(p_limit,25),1)
), candidates as (
 select o.jid,c.provider_id pid,(case when upper(coalesce(c.capacity_status,''))='AVAILABLE' then 50 else 0 end + case when c.max_jobs_per_day>0 then 25 else 0 end + case when c.max_concurrent_jobs>0 then 25 else 0 end)::numeric score
 from open_jobs o cross join dd_provider_capacity_profiles c join dd_providers p on p.id=c.provider_id and p.is_active join dd_provider_organizations org on org.id=p.org_id
 where upper(coalesce(c.capacity_status,''))='AVAILABLE' and c.max_jobs_per_day>current_jobs and c.max_concurrent_jobs>current_jobs and org.is_active and upper(coalesce(org.qualification_status,''))='QUALIFIED' and upper(coalesce(org.compliance_status,''))='VERIFIED' and upper(coalesce(org.agreement_status,'')) in ('ACTIVE','EXECUTED') and upper(coalesce(org.network_access_level,''))='AUTHORIZED' and upper(coalesce(org.permission_status,''))='AUTHORIZED' and coalesce(org.accepts_new_work,false)
 and (o.work_order_id is null or not exists(select 1 from dd_work_orders wo where wo.id=o.work_order_id and wo.service_id is not null) or exists(select 1 from dd_work_orders wo join dd_provider_capabilities pc on pc.provider_org_id=org.id and pc.provider_id=p.id and pc.service_id=wo.service_id and pc.is_authorized where wo.id=o.work_order_id))
 and not exists(select 1 from dd_job_assignments a where a.job_id=o.jid and a.provider_id=c.provider_id and a.assignment_status in ('OFFERED','ACCEPTED'))
), ranked as (select c.*,row_number() over(partition by jid order by score desc,pid) rn from candidates c), ins as (
 insert into dd_job_assignments(job_id,provider_id,assignment_status,offered_at,created_at,updated_at) select jid,pid,'OFFERED',now(),now(),now() from ranked where rn=1 returning id aid,job_id jid,provider_id pid)
select i.jid,i.pid,i.aid,r.score from ins i join ranked r on r.jid=i.jid and r.pid=i.pid; $$;
