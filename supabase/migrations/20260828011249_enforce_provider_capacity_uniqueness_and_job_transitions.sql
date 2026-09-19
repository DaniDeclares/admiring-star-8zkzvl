create unique index if not exists ux_dd_provider_capacity_profiles_provider on public.dd_provider_capacity_profiles(provider_id) where provider_id is not null;

create or replace function public.dd_transition_job(p_job_id uuid,p_new_status text)
returns public.dd_jobs language plpgsql security definer set search_path=public as $$
declare j public.dd_jobs; old_status text;
begin
 select * into j from public.dd_jobs where id=p_job_id for update;
 if j.id is null then raise exception 'Job not found'; end if;
 old_status:=j.job_status;
 if p_new_status not in ('new','ready_for_dispatch','dispatching','scheduled','en_route','arrived','in_progress','submitted','qa','blocked','completed','cancelled','closed') then raise exception 'Invalid job status'; end if;
 if p_new_status='en_route' and old_status not in ('scheduled','assigned') then raise exception 'Invalid transition to en_route'; end if;
 if p_new_status='arrived' and old_status<>'en_route' then raise exception 'Invalid transition to arrived'; end if;
 if p_new_status='in_progress' and old_status not in ('arrived','scheduled') then raise exception 'Invalid transition to in_progress'; end if;
 if p_new_status='submitted' and old_status<>'in_progress' then raise exception 'Invalid transition to submitted'; end if;
 if p_new_status='qa' and old_status<>'submitted' then raise exception 'Invalid transition to qa'; end if;
 if p_new_status='completed' and old_status<>'qa' then raise exception 'Invalid transition to completed'; end if;
 update public.dd_jobs set job_status=p_new_status,updated_at=now() where id=p_job_id returning * into j;
 return j;
end $$;
revoke all on function public.dd_transition_job(uuid,text) from public,anon,authenticated;
grant execute on function public.dd_transition_job(uuid,text) to service_role;