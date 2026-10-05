-- Keep work-order QA state aligned with canonical completion-review outcomes.
-- Tuesday-readiness repair: closes the completion-review -> work-order QA seam without
-- creating a parallel QA authority. Tester-first; no Production mutation.

create or replace function public.dd_sync_completion_review_to_work_order_qa()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_qa_status text;
begin
  v_qa_status := case upper(coalesce(new.status,''))
    when 'APPROVED' then 'APPROVED'
    when 'REJECTED' then 'REJECTED'
    else null
  end;

  if v_qa_status is null then
    return new;
  end if;

  update public.dd_work_orders w
  set qa_status = v_qa_status,
      updated_at = now()
  from public.dd_jobs j
  where j.id = new.job_id
    and j.work_order_id = w.id
    and w.qa_status is distinct from v_qa_status;

  return new;
end
$$;

comment on function public.dd_sync_completion_review_to_work_order_qa() is
'Keeps canonical work-order QA state aligned with APPROVED/REJECTED completion-review outcomes for linked jobs.';

revoke execute on function public.dd_sync_completion_review_to_work_order_qa() from public, anon, authenticated;
grant execute on function public.dd_sync_completion_review_to_work_order_qa() to service_role;

drop trigger if exists dd_completion_review_work_order_qa_sync on public.dd_completion_reviews;

create trigger dd_completion_review_work_order_qa_sync
after insert or update of status on public.dd_completion_reviews
for each row
when (upper(coalesce(new.status,'')) in ('APPROVED','REJECTED'))
execute function public.dd_sync_completion_review_to_work_order_qa();
