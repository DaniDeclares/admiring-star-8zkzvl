create or replace function public.dd_guard_provider_assignment()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  p record;
  o record;
begin
  select id, is_active, org_id into p from public.dd_providers where id = new.provider_id;
  if p.id is null or p.is_active is not true then
    raise exception 'PROVIDER_NOT_ACTIVE';
  end if;
  if p.org_id is null then
    raise exception 'PROVIDER_ORGANIZATION_REQUIRED';
  end if;
  select id, is_active, qualification_status, compliance_status, agreement_status, accepts_new_work
    into o
  from public.dd_provider_organizations where id = p.org_id;
  if o.id is null or o.is_active is not true then
    raise exception 'PROVIDER_ORGANIZATION_NOT_ACTIVE';
  end if;
  if upper(coalesce(o.qualification_status,'')) <> 'QUALIFIED' then
    raise exception 'PROVIDER_NOT_QUALIFIED';
  end if;
  if upper(coalesce(o.compliance_status,'')) <> 'VERIFIED' then
    raise exception 'PROVIDER_COMPLIANCE_NOT_VERIFIED';
  end if;
  if upper(coalesce(o.agreement_status,'')) not in ('ACTIVE','EXECUTED') then
    raise exception 'PROVIDER_AGREEMENT_NOT_ACTIVE';
  end if;
  if coalesce(o.accepts_new_work,false) is not true then
    raise exception 'PROVIDER_NOT_ACCEPTING_WORK';
  end if;
  return new;
end;
$$;

drop trigger if exists trg_dd_job_assignments_provider_gate on public.dd_job_assignments;
create trigger trg_dd_job_assignments_provider_gate
before insert or update of provider_id on public.dd_job_assignments
for each row execute function public.dd_guard_provider_assignment();

create or replace function public.dd_guard_job_completion()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  required_tasks integer;
  incomplete_tasks integer;
  missing_evidence integer;
  unverified_evidence integer;
  approved_reviews integer;
begin
  if upper(coalesce(new.job_status,'')) = 'COMPLETED'
     and upper(coalesce(old.job_status,'')) <> 'COMPLETED' then
    select count(*) into required_tasks
      from public.dd_job_tasks
      where job_id = new.id and is_required is true;

    select count(*) into incomplete_tasks
      from public.dd_job_tasks
      where job_id = new.id and is_required is true
        and upper(coalesce(status,'')) <> 'COMPLETED';

    if incomplete_tasks > 0 then
      raise exception 'REQUIRED_TASKS_INCOMPLETE';
    end if;

    select count(*) into missing_evidence
      from public.dd_job_tasks t
      where t.job_id = new.id
        and t.is_required is true
        and t.evidence_required is true
        and not exists (
          select 1 from public.dd_job_evidence e
          where e.job_id = t.job_id
            and e.task_id = t.id
            and coalesce(e.storage_url,'') <> ''
        );

    if missing_evidence > 0 then
      raise exception 'REQUIRED_EVIDENCE_MISSING';
    end if;

    select count(*) into unverified_evidence
      from public.dd_job_tasks t
      where t.job_id = new.id
        and t.is_required is true
        and t.evidence_required is true
        and exists (
          select 1 from public.dd_job_evidence e
          where e.job_id = t.job_id
            and e.task_id = t.id
            and coalesce(e.storage_url,'') <> ''
            and upper(coalesce(e.verification_status,'')) not in ('VERIFIED','APPROVED')
        );

    if unverified_evidence > 0 then
      raise exception 'REQUIRED_EVIDENCE_NOT_QA_VERIFIED';
    end if;

    select count(*) into approved_reviews
      from public.dd_completion_reviews
      where job_id = new.id
        and upper(coalesce(status,'')) = 'APPROVED';

    if approved_reviews = 0 then
      raise exception 'COMPLETION_QA_APPROVAL_REQUIRED';
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists trg_dd_jobs_completion_gate on public.dd_jobs;
create trigger trg_dd_jobs_completion_gate
before update of job_status on public.dd_jobs
for each row execute function public.dd_guard_job_completion();
