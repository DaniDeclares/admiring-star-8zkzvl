alter table public.dd_provider_capacity_profiles add column if not exists activated_at timestamptz;
alter table public.dd_provider_capacity_profiles add column if not exists deactivated_at timestamptz;
alter table public.dd_provider_capacity_profiles add column if not exists current_jobs integer not null default 0;
alter table public.dd_provider_capacity_profiles add column if not exists current_hours numeric not null default 0;

create or replace function public.dd_set_provider_capacity(p_provider_id uuid, p_status text, p_max_jobs integer, p_max_hours numeric, p_concurrent integer default 1)
returns public.dd_provider_capacity_profiles language plpgsql security definer set search_path=public as $$
declare r public.dd_provider_capacity_profiles;
begin
 if p_status not in ('available','open','active','paused','inactive') then raise exception 'Invalid capacity status'; end if;
 insert into public.dd_provider_capacity_profiles(provider_id,max_jobs_per_day,max_hours_per_day,max_concurrent_jobs,capacity_status,activated_at,updated_at)
 values(p_provider_id,coalesce(p_max_jobs,0),coalesce(p_max_hours,0),greatest(coalesce(p_concurrent,1),0),p_status,case when p_status in ('available','open','active') then now() end,now())
 on conflict do nothing;
 update public.dd_provider_capacity_profiles c set capacity_status=p_status,max_jobs_per_day=coalesce(p_max_jobs,c.max_jobs_per_day),max_hours_per_day=coalesce(p_max_hours,c.max_hours_per_day),max_concurrent_jobs=greatest(coalesce(p_concurrent,c.max_concurrent_jobs),0),activated_at=case when p_status in ('available','open','active') then coalesce(c.activated_at,now()) else c.activated_at end,deactivated_at=case when p_status in ('paused','inactive') then now() else c.deactivated_at end,updated_at=now() where c.provider_id=p_provider_id returning * into r;
 if r.id is null then raise exception 'Provider capacity profile not found or could not be created'; end if;
 return r;
end $$;
revoke all on function public.dd_set_provider_capacity(uuid,text,integer,numeric,integer) from public,anon,authenticated;
grant execute on function public.dd_set_provider_capacity(uuid,text,integer,numeric,integer) to service_role;

create or replace function public.dd_offer_provider(p_job_id uuid,p_provider_id uuid,p_offer_minutes integer default 10,p_sequence integer default 1)
returns uuid language plpgsql security definer set search_path=public as $$
declare v_id uuid;
begin
 if not exists(select 1 from public.dd_jobs where id=p_job_id and job_status in ('ready_for_dispatch','dispatching','open')) then raise exception 'Job is not eligible for dispatch'; end if;
 if not exists(select 1 from public.dd_provider_capacity_profiles where provider_id=p_provider_id and capacity_status in ('available','open','active') and max_jobs_per_day>current_jobs and max_concurrent_jobs>current_jobs) then raise exception 'Provider has no available capacity'; end if;
 insert into public.dd_job_assignments(job_id,provider_id,assignment_status,offered_at,offer_expires_at,offer_sequence,created_at,updated_at)
 values(p_job_id,p_provider_id,'offered',now(),now()+make_interval(mins=>greatest(p_offer_minutes,1)),p_sequence,now(),now()) returning id into v_id;
 return v_id;
end $$;
revoke all on function public.dd_offer_provider(uuid,uuid,integer,integer) from public,anon,authenticated;
grant execute on function public.dd_offer_provider(uuid,uuid,integer,integer) to service_role;

create or replace function public.dd_respond_to_offer(p_assignment_id uuid,p_accept boolean,p_reason text default null)
returns boolean language plpgsql security definer set search_path=public as $$
declare a public.dd_job_assignments;begin
 select * into a from public.dd_job_assignments where id=p_assignment_id for update;
 if a.id is null or a.assignment_status <> 'offered' then raise exception 'Offer is not active'; end if;
 if a.offer_expires_at is not null and a.offer_expires_at <= now() then update public.dd_job_assignments set assignment_status='expired',response_at=now(),updated_at=now() where id=a.id; return false; end if;
 if p_accept then
  update public.dd_job_assignments set assignment_status='accepted',accepted_at=now(),response_at=now(),updated_at=now() where id=a.id;
  update public.dd_jobs set assigned_to=a.provider_id::text,job_status='scheduled',updated_at=now() where id=a.job_id;
  update public.dd_provider_capacity_profiles set current_jobs=current_jobs+1,updated_at=now() where provider_id=a.provider_id;
  return true;
 else
  update public.dd_job_assignments set assignment_status='rejected',rejection_reason=p_reason,rejected_at=now(),response_at=now(),updated_at=now() where id=a.id;
  return false;
 end if;
end $$;
revoke all on function public.dd_respond_to_offer(uuid,boolean,text) from public,anon,authenticated;
grant execute on function public.dd_respond_to_offer(uuid,boolean,text) to service_role;