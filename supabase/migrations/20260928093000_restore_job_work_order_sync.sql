-- Restore the canonical job -> work-order synchronization function proven in Tester.
-- Bounded repair for Production runtime drift. No direct payable creation or money movement.

create or replace function public.dd_sync_work_order_from_job_current(p_job_id uuid)
returns void
language plpgsql
security definer
set search_path='public'
as $function$
declare
  j public.dd_jobs;
  wo public.dd_work_orders;
  a public.dd_job_assignments;
  current_rank integer := 0;
  target_rank integer := 0;
  target_status text := null;
begin
  select * into j from public.dd_jobs where id = p_job_id;
  if j.id is null or j.work_order_id is null then return; end if;

  select * into wo from public.dd_work_orders where id = j.work_order_id for update;
  if wo.id is null then return; end if;

  select * into a
  from public.dd_job_assignments
  where job_id = j.id
    and upper(coalesce(assignment_status,'')) = 'ACCEPTED'
  order by coalesce(accepted_at, created_at) desc
  limit 1;

  if a.id is null then return; end if;

  -- Once payable/paid, economics are ledger-bound and must not drift from later job/assignment edits.
  if upper(coalesce(wo.status,'')) not in ('PAYABLE','PAID') then
    update public.dd_work_orders
       set provider_pay_amount = coalesce(a.authorized_provider_compensation, provider_pay_amount),
           travel_amount = coalesce(a.travel_allowance_snapshot, travel_amount, 0),
           scheduled_start = coalesce(j.scheduled_start, scheduled_start),
           scheduled_end = coalesce(j.scheduled_end, scheduled_end),
           updated_at = now()
     where id = wo.id;
  end if;

  current_rank := case upper(coalesce(wo.status,''))
    when 'INSTANTIATED' then 0 when 'OFFERED' then 1 when 'ACCEPTED' then 2
    when 'SCHEDULED' then 3 when 'EN_ROUTE' then 4 when 'IN_PROGRESS' then 5
    when 'SUBMITTED' then 6 when 'QA_REVIEW' then 7 when 'QA_PASS' then 8
    when 'CUSTOMER_CLOSED' then 9 when 'PAYABLE' then 10 when 'PAID' then 11
    else 99 end;

  if lower(coalesce(j.job_status,'')) = 'new' then
    target_rank := 2; target_status := 'ACCEPTED';
  elsif lower(coalesce(j.job_status,'')) = 'scheduled' then
    target_rank := 3; target_status := 'SCHEDULED';
  elsif lower(coalesce(j.job_status,'')) = 'in_progress' then
    target_rank := 5; target_status := 'IN_PROGRESS';
  elsif lower(coalesce(j.job_status,'')) = 'submitted' then
    target_rank := 6; target_status := 'SUBMITTED';
  elsif lower(coalesce(j.job_status,'')) = 'completed' then
    -- COMPLETED is protected by dd_guard_job_completion; reaching it means
    -- required tasks/evidence and approved completion review already passed.
    target_rank := 8; target_status := 'QA_PASS';
  else
    return;
  end if;

  if current_rank = 99 or current_rank >= target_rank then return; end if;

  update public.dd_work_orders
     set status = target_status,
         qa_status = case when target_status='QA_PASS' then 'PASSED' else qa_status end,
         completed_at = case when target_status='QA_PASS' then coalesce(completed_at,now()) else completed_at end,
         updated_at = now()
   where id = wo.id;
end;
$function$;

revoke all on function public.dd_sync_work_order_from_job_current(uuid) from public, anon, authenticated;
grant execute on function public.dd_sync_work_order_from_job_current(uuid) to service_role;

comment on function public.dd_sync_work_order_from_job_current(uuid)
is 'Canonical guarded job-to-work-order synchronization. Restored from Tester proof; service-role only.';
