
create or replace function public.dd_start_job(p_job_id uuid)
returns public.dd_jobs
language plpgsql
security definer
set search_path = public, private
as $$
declare
  j public.dd_jobs;
  actor_id uuid;
  actor_is_staff boolean;
  actor_provider uuid;
begin
  if auth.uid() is null then raise exception 'AUTH_REQUIRED'; end if;

  actor_is_staff := private.dd_is_staff_admin();
  actor_provider := private.dd_current_provider_id();
  actor_id := case when actor_is_staff then auth.uid() else actor_provider end;

  if actor_id is null then raise exception 'PORTAL_ACTOR_REQUIRED'; end if;

  select * into j
  from public.dd_jobs
  where id = p_job_id
  for update;

  if j.id is null then raise exception 'JOB_NOT_FOUND'; end if;

  if not actor_is_staff and coalesce(j.assigned_to,'') <> actor_provider::text then
    raise exception 'JOB_ACTOR_UNAUTHORIZED';
  end if;

  if j.work_order_id is null then
    raise exception 'WORK_ORDER_REQUIRED_FOR_TELEMETRY';
  end if;

  if lower(coalesce(j.job_status,'')) not in ('scheduled','en_route','arrived') then
    raise exception 'START_JOB_INVALID_STATE:%', j.job_status;
  end if;

  if exists (
    select 1 from public.dd_dispatch_events
    where job_id = j.id and event_type = 'START_JOB'
  ) then
    raise exception 'START_JOB_ALREADY_RECORDED';
  end if;

  update public.dd_jobs
  set job_status = 'in_progress', updated_at = now()
  where id = j.id
  returning * into j;

  insert into public.dd_dispatch_events
    (job_id, actor_id, event_type, description, metadata)
  values
    (j.id, actor_id, 'START_JOB',
     'Field execution started.',
     jsonb_build_object(
       'previous_status', 'scheduled',
       'next_status', 'in_progress',
       'work_order_id', j.work_order_id,
       'telemetry_source', 'APPLICATION_PORTAL_ACTION'
     ));

  return j;
end;
$$;

create or replace function public.dd_complete_job(p_job_id uuid)
returns public.dd_jobs
language plpgsql
security definer
set search_path = public, private
as $$
declare
  j public.dd_jobs;
  actor_id uuid;
  actor_is_staff boolean;
  actor_provider uuid;
begin
  if auth.uid() is null then raise exception 'AUTH_REQUIRED'; end if;

  actor_is_staff := private.dd_is_staff_admin();
  actor_provider := private.dd_current_provider_id();
  actor_id := case when actor_is_staff then auth.uid() else actor_provider end;

  if actor_id is null then raise exception 'PORTAL_ACTOR_REQUIRED'; end if;

  select * into j
  from public.dd_jobs
  where id = p_job_id
  for update;

  if j.id is null then raise exception 'JOB_NOT_FOUND'; end if;

  if not actor_is_staff and coalesce(j.assigned_to,'') <> actor_provider::text then
    raise exception 'JOB_ACTOR_UNAUTHORIZED';
  end if;

  if j.work_order_id is null then
    raise exception 'WORK_ORDER_REQUIRED_FOR_TELEMETRY';
  end if;

  if lower(coalesce(j.job_status,'')) <> 'in_progress' then
    raise exception 'COMPLETE_JOB_INVALID_STATE:%', j.job_status;
  end if;

  if not exists (
    select 1 from public.dd_dispatch_events
    where job_id = j.id and event_type = 'START_JOB'
  ) then
    raise exception 'START_JOB_TELEMETRY_MISSING';
  end if;

  if exists (
    select 1 from public.dd_dispatch_events
    where job_id = j.id and event_type = 'COMPLETE_JOB'
  ) then
    raise exception 'COMPLETE_JOB_ALREADY_RECORDED';
  end if;

  /*
   * COMPLETE_JOB means field execution finished, not final QA closure.
   * The operational job therefore moves to SUBMITTED; existing completion
   * review/evidence gates remain authoritative for COMPLETED.
   */
  update public.dd_jobs
  set job_status = 'submitted', updated_at = now()
  where id = j.id
  returning * into j;

  insert into public.dd_dispatch_events
    (job_id, actor_id, event_type, description, metadata)
  values
    (j.id, actor_id, 'COMPLETE_JOB',
     'Field execution completed and submitted for QA.',
     jsonb_build_object(
       'previous_status', 'in_progress',
       'next_status', 'submitted',
       'work_order_id', j.work_order_id,
       'telemetry_source', 'APPLICATION_PORTAL_ACTION'
     ));

  return j;
end;
$$;

revoke all on function public.dd_start_job(uuid) from public, anon;
revoke all on function public.dd_complete_job(uuid) from public, anon;
grant execute on function public.dd_start_job(uuid) to authenticated;
grant execute on function public.dd_complete_job(uuid) to authenticated;
