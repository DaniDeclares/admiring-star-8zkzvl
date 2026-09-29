create or replace function public.dd_guard_job_completion() returns trigger language plpgsql set search_path='public' as $$
declare incomplete_tasks integer; missing_evidence integer; unverified_evidence integer; approved_reviews integer;
begin
 if upper(coalesce(new.job_status,''))='COMPLETED' and upper(coalesce(old.job_status,''))<>'COMPLETED' then
  select count(*) into incomplete_tasks from public.dd_job_tasks where job_id=new.id and is_required is true and upper(coalesce(status,'')) not in('COMPLETED','DONE');
  if incomplete_tasks>0 then raise exception 'REQUIRED_TASKS_INCOMPLETE'; end if;
  select count(*) into missing_evidence from public.dd_job_tasks t where t.job_id=new.id and t.is_required and t.evidence_required and not exists(select 1 from public.dd_job_evidence e where e.job_id=t.job_id and e.task_id=t.id and coalesce(e.storage_url,'')<>'');
  if missing_evidence>0 then raise exception 'REQUIRED_EVIDENCE_MISSING'; end if;
  select count(*) into unverified_evidence from public.dd_job_tasks t where t.job_id=new.id and t.is_required and t.evidence_required and exists(select 1 from public.dd_job_evidence e where e.job_id=t.job_id and e.task_id=t.id and coalesce(e.storage_url,'')<>'' and upper(coalesce(e.verification_status,'')) not in('VERIFIED','APPROVED'));
  if unverified_evidence>0 then raise exception 'REQUIRED_EVIDENCE_NOT_QA_VERIFIED'; end if;
  select count(*) into approved_reviews from public.dd_completion_reviews where job_id=new.id and upper(coalesce(status,''))='APPROVED';
  if approved_reviews=0 then raise exception 'COMPLETION_QA_APPROVAL_REQUIRED'; end if;
 end if; return new;
end$$;