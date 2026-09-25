-- Synchronize canonical job/assignment execution state into the FOS work-order ledger.
-- The work-order state guard remains authoritative; this bridge advances only through legal forward states.

create or replace function public.dd_sync_work_order_from_job(p_job_id uuid)
returns void
language plpgsql
security definer
set search_path to 'public'
as $function$
declare
  j public.dd_jobs;
  wo public.dd_work_orders;
  a public.dd_job_assignments;
  slot public.dd_work_package_provider_slots;
  target_rank integer := 0;
  current_rank integer := 0;
begin
  select * into j from public.dd_jobs where id=p_job_id;
  if j.id is null or j.work_order_id is null then return; end if;

  select * into wo from public.dd_work_orders where id=j.work_order_id for update;
  if wo.id is null or wo.status in ('PAID','CANCELLED') then return; end if;

  select * into a
  from public.dd_job_assignments
  where job_id=j.id and upper(coalesce(assignment_status,''))='ACCEPTED'
  order by coalesce(accepted_at,created_at) desc
  limit 1;

  if a.id is null then return; end if;
  if a.provider_slot_id is not null then
    select * into slot from public.dd_work_package_provider_slots where id=a.provider_slot_id;
  end if;

  -- Keep operational identity/economics/schedule aligned with the accepted assignment.
  update public.dd_work_orders
  set primary_provider_id=a.provider_id,
      provider_pay_amount=coalesce(slot.total_provider_offer,slot.service_payout_amount,provider_pay_amount),
      travel_amount=coalesce(slot.travel_payout_amount,travel_amount,0),
      scheduled_start=coalesce(j.scheduled_start,scheduled_start),
      scheduled_end=coalesce(j.scheduled_end,scheduled_end),
      updated_at=now()
  where id=wo.id;

  target_rank := case lower(coalesce(j.job_status,''))
    when 'scheduled' then 3
    when 'en_route' then 4
    when 'arrived' then 4
    when 'in_progress' then 5
    when 'submitted' then 6
    when 'completed' then 6
    else 2
  end;

  select * into wo from public.dd_work_orders where id=j.work_order_id;
  current_rank := case wo.status
    when 'INSTANTIATED' then 0 when 'OFFERED' then 1 when 'ACCEPTED' then 2
    when 'SCHEDULED' then 3 when 'EN_ROUTE' then 4 when 'IN_PROGRESS' then 5
    when 'SUBMITTED' then 6 when 'QA_REVIEW' then 7 when 'QA_PASS' then 8
    when 'CUSTOMER_CLOSED' then 9 when 'PAYABLE' then 10 when 'PAID' then 11
    else 99 end;

  -- Never rewind or interfere once QA has taken authority.
  if current_rank >= 7 or current_rank=99 then return; end if;

  if current_rank < 1 and target_rank >= 1 then update public.dd_work_orders set status='OFFERED',updated_at=now() where id=wo.id; current_rank:=1; end if;
  if current_rank < 2 and target_rank >= 2 then update public.dd_work_orders set status='ACCEPTED',updated_at=now() where id=wo.id; current_rank:=2; end if;
  if current_rank < 3 and target_rank >= 3 then update public.dd_work_orders set status='SCHEDULED',updated_at=now() where id=wo.id; current_rank:=3; end if;
  if current_rank < 4 and target_rank >= 4 then update public.dd_work_orders set status='EN_ROUTE',updated_at=now() where id=wo.id; current_rank:=4; end if;
  if current_rank < 5 and target_rank >= 5 then
    if current_rank < 4 then update public.dd_work_orders set status='EN_ROUTE',updated_at=now() where id=wo.id; current_rank:=4; end if;
    update public.dd_work_orders set status='IN_PROGRESS',updated_at=now() where id=wo.id; current_rank:=5;
  end if;
  if current_rank < 6 and target_rank >= 6 then update public.dd_work_orders set status='SUBMITTED',updated_at=now() where id=wo.id; end if;
end;$function$;

create or replace function public.dd_sync_work_order_from_job_trigger()
returns trigger language plpgsql security definer set search_path to 'public'
as $function$
begin
  perform public.dd_sync_work_order_from_job(case when tg_table_name='dd_jobs' then new.id else new.job_id end);
  return new;
end;$function$;

drop trigger if exists dd_sync_work_order_from_job_status on public.dd_jobs;
create trigger dd_sync_work_order_from_job_status
after insert or update of job_status,work_order_id,scheduled_start,scheduled_end on public.dd_jobs
for each row execute function public.dd_sync_work_order_from_job_trigger();

drop trigger if exists dd_sync_work_order_from_assignment on public.dd_job_assignments;
create trigger dd_sync_work_order_from_assignment
after insert or update of assignment_status,provider_id,provider_slot_id on public.dd_job_assignments
for each row execute function public.dd_sync_work_order_from_job_trigger();

revoke all on function public.dd_sync_work_order_from_job(uuid) from public,anon,authenticated;
revoke all on function public.dd_sync_work_order_from_job_trigger() from public,anon,authenticated;
grant execute on function public.dd_sync_work_order_from_job(uuid) to service_role;
grant execute on function public.dd_sync_work_order_from_job_trigger() to service_role;

-- Reconcile already-valid accepted assignments into their linked work orders.
do $$
declare r record;
begin
  for r in
    select distinct j.id
    from public.dd_jobs j
    join public.dd_job_assignments a on a.job_id=j.id
    where j.work_order_id is not null and upper(coalesce(a.assignment_status,''))='ACCEPTED'
  loop
    perform public.dd_sync_work_order_from_job(r.id);
  end loop;
end $$;
