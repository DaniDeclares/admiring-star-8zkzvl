create or replace function public.dd_validate_job_evidence_scope()
returns trigger
language plpgsql
security definer
set search_path = public, private
as $$
declare
  task_job uuid;
  provider_ok boolean;
begin
  if new.task_id is not null then
    select job_id into task_job
    from public.dd_job_tasks
    where id = new.task_id;

    if task_job is null or task_job <> new.job_id then
      raise exception 'EVIDENCE_TASK_JOB_MISMATCH';
    end if;
  end if;

  select exists (
    select 1
    from public.dd_job_assignments a
    join public.dd_providers p on p.id = a.provider_id
    where a.job_id = new.job_id
      and a.provider_id = new.provider_id
      and a.assignment_status = 'ACCEPTED'
      and p.is_active = true
  ) into provider_ok;

  if not provider_ok then
    raise exception 'EVIDENCE_PROVIDER_NOT_AUTHORIZED_FOR_JOB';
  end if;

  return new;
end;
$$;

drop trigger if exists dd_validate_job_evidence_scope on public.dd_job_evidence;
create trigger dd_validate_job_evidence_scope
before insert or update on public.dd_job_evidence
for each row execute function public.dd_validate_job_evidence_scope();

comment on function public.dd_validate_job_evidence_scope() is 'Defense-in-depth gate: evidence must belong to the declared job/task and come from an active provider with an accepted assignment.';
