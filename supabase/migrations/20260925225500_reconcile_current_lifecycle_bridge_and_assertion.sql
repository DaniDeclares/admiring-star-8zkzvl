-- Reconcile PR #420 lifecycle intent to the current tester schema.
-- Do not backfill legacy synthetic rows; this governs future canonical transitions only.

create or replace function public.dd_sync_work_order_from_job_current(p_job_id uuid)
returns void
language plpgsql
security definer
set search_path = 'public'
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

  update public.dd_work_orders
     set provider_pay_amount = coalesce(a.authorized_provider_compensation, provider_pay_amount),
         travel_amount = coalesce(a.travel_allowance_snapshot, travel_amount, 0),
         scheduled_start = coalesce(j.scheduled_start, scheduled_start),
         scheduled_end = coalesce(j.scheduled_end, scheduled_end),
         updated_at = now()
   where id = wo.id;

  current_rank := case upper(coalesce(wo.status,''))
    when 'INSTANTIATED' then 0
    when 'OFFERED' then 1
    when 'ACCEPTED' then 2
    when 'SCHEDULED' then 3
    when 'EN_ROUTE' then 4
    when 'IN_PROGRESS' then 5
    when 'SUBMITTED' then 6
    when 'QA_REVIEW' then 7
    when 'QA_PASS' then 8
    when 'CUSTOMER_CLOSED' then 9
    when 'PAYABLE' then 10
    when 'PAID' then 11
    else 99
  end;

  if lower(coalesce(j.job_status,'')) = 'new' then
    target_rank := 2; target_status := 'ACCEPTED';
  elsif lower(coalesce(j.job_status,'')) = 'scheduled' then
    target_rank := 3; target_status := 'SCHEDULED';
  elsif lower(coalesce(j.job_status,'')) = 'in_progress' then
    target_rank := 5; target_status := 'IN_PROGRESS';
  elsif lower(coalesce(j.job_status,'')) = 'completed' then
    target_rank := 8; target_status := 'QA_PASS';
  else
    return;
  end if;

  if current_rank = 99 or current_rank >= target_rank then return; end if;

  update public.dd_work_orders
     set status = target_status,
         updated_at = now()
   where id = wo.id;
end;
$function$;

create or replace function public.dd_sync_work_order_from_job_current_trigger()
returns trigger
language plpgsql
security definer
set search_path = 'public'
as $function$
begin
  perform public.dd_sync_work_order_from_job_current(
    case when tg_table_name = 'dd_jobs' then new.id else new.job_id end
  );
  return new;
end;
$function$;

drop trigger if exists dd_sync_work_order_from_job_current_status on public.dd_jobs;
create trigger dd_sync_work_order_from_job_current_status
after insert or update of job_status, work_order_id, scheduled_start, scheduled_end
on public.dd_jobs
for each row execute function public.dd_sync_work_order_from_job_current_trigger();

drop trigger if exists dd_sync_work_order_from_assignment_current on public.dd_job_assignments;
create trigger dd_sync_work_order_from_assignment_current
after insert or update of assignment_status, authorized_provider_compensation, travel_allowance_snapshot
on public.dd_job_assignments
for each row execute function public.dd_sync_work_order_from_job_current_trigger();

revoke all on function public.dd_sync_work_order_from_job_current(uuid) from public, anon, authenticated;
revoke all on function public.dd_sync_work_order_from_job_current_trigger() from public, anon, authenticated;
grant execute on function public.dd_sync_work_order_from_job_current(uuid) to service_role;
grant execute on function public.dd_sync_work_order_from_job_current_trigger() to service_role;

create or replace function public.dd_lifecycle_assert_work_order(p_work_order_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = 'public'
as $function$
declare
  wo public.dd_work_orders;
  j public.dd_jobs;
  a public.dd_job_assignments;
  appointment_count integer := 0;
  evidence_count integer := 0;
  approved_review_count integer := 0;
  payment_event_count integer := 0;
  canonical_ap_count integer := 0;
begin
  select * into wo from public.dd_work_orders where id = p_work_order_id;
  if wo.id is null then raise exception 'WORK_ORDER_NOT_FOUND'; end if;

  select * into j
  from public.dd_jobs
  where work_order_id = p_work_order_id
  order by created_at desc
  limit 1;

  if j.id is not null then
    select * into a
    from public.dd_job_assignments
    where job_id = j.id
      and upper(coalesce(assignment_status,'')) = 'ACCEPTED'
    order by coalesce(accepted_at, created_at) desc
    limit 1;

    select count(*) into appointment_count
      from public.dd_job_appointments
     where job_id = j.id and appointment_status <> 'CANCELLED';

    select count(*) into evidence_count
      from public.dd_job_evidence
     where job_id = j.id;

    select count(*) into approved_review_count
      from public.dd_completion_reviews
     where job_id = j.id and upper(coalesce(status,'')) = 'APPROVED';

    select count(*) into payment_event_count
      from public.dd_payment_events
     where job_id = j.id;

    if a.id is not null then
      select count(*) into canonical_ap_count
        from public.dd_accounts_payable_ledger
       where assignment_id = a.id;
    end if;
  end if;

  return jsonb_build_object(
    'work_order_id', wo.id,
    'work_order_status', wo.status,
    'job_id', j.id,
    'job_status', j.job_status,
    'has_customer_price', wo.customer_price is not null,
    'has_accepted_assignment', a.id is not null,
    'has_schedule', coalesce(j.scheduled_start, wo.scheduled_start) is not null,
    'active_appointment_count', appointment_count,
    'job_evidence_count', evidence_count,
    'approved_review_count', approved_review_count,
    'payment_event_count', payment_event_count,
    'canonical_ap_count', canonical_ap_count,
    'evidence_handoff_proven', evidence_count > 0,
    'qa_handoff_proven', approved_review_count > 0,
    'payment_handoff_proven', payment_event_count > 0,
    'ap_handoff_proven', canonical_ap_count > 0,
    'external_payout_authorized', false,
    'checked_at', now()
  );
end;
$function$;

revoke all on function public.dd_lifecycle_assert_work_order(uuid) from public, anon, authenticated;
grant execute on function public.dd_lifecycle_assert_work_order(uuid) to service_role;
