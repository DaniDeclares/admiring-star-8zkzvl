-- Pass 9 completion/QA non-destructive subproof.
-- Proves the database completion gate is attached and that current completed jobs do not violate
-- required-task, required-evidence, evidence-QA, or approved-review invariants.

insert into public.dd_audit_subproof_requirements(
  proof_key,pass_number,lifecycle_stage,description,executor_function,metadata
)
values(
  'PASS9_COMPLETION_QA_GUARDS',
  9,
  'EXECUTION',
  'Completed jobs must have canonical done required tasks, required evidence present and QA-verified, and at least one approved completion review.',
  'dd_prove_pass9_completion_qa_guards',
  jsonb_build_object('non_destructive',true,'external_side_effects',false,'scope','completion-qa-subproof')
)
on conflict(proof_key) do update
set description=excluded.description,
    executor_function=excluded.executor_function,
    metadata=excluded.metadata,
    updated_at=now();

create or replace function public.dd_prove_pass9_completion_qa_guards()
returns uuid
language plpgsql
security definer
set search_path='public'
as $$
declare
  rid uuid:=gen_random_uuid();
  total int:=0;
  passed int:=0;
  failed int:=0;
  v_guard_trigger int;
  v_guard_semantics int;
  v_completed_bad_tasks int;
  v_completed_missing_evidence int;
  v_completed_unverified_evidence int;
  v_completed_without_review int;
  ev jsonb;
begin
  select count(*) into v_guard_trigger
  from pg_trigger t
  join pg_class c on c.oid=t.tgrelid
  join pg_namespace n on n.oid=c.relnamespace
  join pg_proc p on p.oid=t.tgfoid
  where n.nspname='public'
    and c.relname='dd_jobs'
    and not t.tgisinternal
    and p.proname='dd_guard_job_completion';

  total:=total+1;
  if v_guard_trigger>=1 then passed:=passed+1; else failed:=failed+1; end if;

  select count(*) into v_guard_semantics
  from pg_proc p
  join pg_namespace n on n.oid=p.pronamespace
  where n.nspname='public'
    and p.proname='dd_guard_job_completion'
    and pg_get_functiondef(p.oid) ilike '%REQUIRED_TASKS_INCOMPLETE%'
    and pg_get_functiondef(p.oid) ilike '%REQUIRED_EVIDENCE_MISSING%'
    and pg_get_functiondef(p.oid) ilike '%REQUIRED_EVIDENCE_NOT_QA_VERIFIED%'
    and pg_get_functiondef(p.oid) ilike '%COMPLETION_QA_APPROVAL_REQUIRED%'
    and pg_get_functiondef(p.oid) ilike '%lower(coalesce(status%done%';

  total:=total+1;
  if v_guard_semantics=1 then passed:=passed+1; else failed:=failed+1; end if;

  select count(*) into v_completed_bad_tasks
  from public.dd_jobs j
  where upper(coalesce(j.job_status,''))='COMPLETED'
    and exists(
      select 1
      from public.dd_job_tasks t
      where t.job_id=j.id
        and t.is_required=true
        and lower(coalesce(t.status,''))<>'done'
    );

  total:=total+1;
  if v_completed_bad_tasks=0 then passed:=passed+1; else failed:=failed+1; end if;

  select count(*) into v_completed_missing_evidence
  from public.dd_jobs j
  where upper(coalesce(j.job_status,''))='COMPLETED'
    and exists(
      select 1
      from public.dd_job_tasks t
      where t.job_id=j.id
        and t.is_required=true
        and t.evidence_required=true
        and not exists(
          select 1
          from public.dd_job_evidence e
          where e.job_id=t.job_id
            and e.task_id=t.id
            and coalesce(e.storage_url,'')<>''
        )
    );

  total:=total+1;
  if v_completed_missing_evidence=0 then passed:=passed+1; else failed:=failed+1; end if;

  select count(*) into v_completed_unverified_evidence
  from public.dd_jobs j
  where upper(coalesce(j.job_status,''))='COMPLETED'
    and exists(
      select 1
      from public.dd_job_tasks t
      where t.job_id=j.id
        and t.is_required=true
        and t.evidence_required=true
        and exists(
          select 1
          from public.dd_job_evidence e
          where e.job_id=t.job_id
            and e.task_id=t.id
            and coalesce(e.storage_url,'')<>''
            and upper(coalesce(e.verification_status,'')) not in ('VERIFIED','APPROVED')
        )
    );

  total:=total+1;
  if v_completed_unverified_evidence=0 then passed:=passed+1; else failed:=failed+1; end if;

  select count(*) into v_completed_without_review
  from public.dd_jobs j
  where upper(coalesce(j.job_status,''))='COMPLETED'
    and not exists(
      select 1
      from public.dd_completion_reviews r
      where r.job_id=j.id
        and upper(coalesce(r.status,''))='APPROVED'
    );

  total:=total+1;
  if v_completed_without_review=0 then passed:=passed+1; else failed:=failed+1; end if;

  ev:=jsonb_build_object(
    'completion_guard_trigger_count',v_guard_trigger,
    'completion_guard_semantics_count',v_guard_semantics,
    'completed_with_incomplete_required_tasks',v_completed_bad_tasks,
    'completed_missing_required_evidence',v_completed_missing_evidence,
    'completed_with_unverified_required_evidence',v_completed_unverified_evidence,
    'completed_without_approved_review',v_completed_without_review,
    'external_delivery',false,
    'authoritative_pass_advanced',false
  );

  insert into public.dd_audit_proof_receipts(
    id,work_key,proof_key,status,assertions_total,assertions_passed,assertions_failed,evidence
  )
  values(
    rid,
    'PASS-09-QA',
    'PASS9_COMPLETION_QA_GUARDS',
    case when failed=0 then 'PASS' else 'FAIL' end,
    total,passed,failed,ev
  );

  return rid;
end $$;

revoke all on function public.dd_prove_pass9_completion_qa_guards() from public,anon,authenticated;
grant execute on function public.dd_prove_pass9_completion_qa_guards() to service_role;
