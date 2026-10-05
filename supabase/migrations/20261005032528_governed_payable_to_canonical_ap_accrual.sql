-- Governed QA-approved provider payable -> canonical AP accrual.
-- Reuses existing payable/AP authorities; does not clear payout, settle funds, or contact externally.
-- Compatible with Production's current AP shape and Tester's assignment-aware AP shape.

create or replace function public.dd_accrue_ap_from_approved_payable(p_payable_id uuid)
returns uuid
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_pp public.dd_provider_payables%rowtype;
  v_job public.dd_jobs%rowtype;
  v_qa_status text;
  v_ap_id uuid;
  v_existing_provider uuid;
  v_assignment_id uuid;
  v_total numeric;
  v_base_for_ledger numeric;
  v_has_assignment_id boolean;
begin
  select *
  into v_pp
  from public.dd_provider_payables
  where id = p_payable_id
  for update;

  if not found then
    raise exception 'PAYABLE_NOT_FOUND';
  end if;

  if upper(coalesce(v_pp.status,'')) not in ('APPROVED','PAID') then
    raise exception 'PAYABLE_NOT_APPROVED';
  end if;

  if v_pp.provider_id is null then
    raise exception 'PROVIDER_REQUIRED_FOR_AP';
  end if;

  select *
  into v_job
  from public.dd_jobs
  where id = v_pp.job_id;

  if not found then
    raise exception 'JOB_NOT_FOUND_FOR_PAYABLE';
  end if;

  if v_job.work_order_id is null then
    raise exception 'WORK_ORDER_REQUIRED_FOR_AP';
  end if;

  select w.qa_status
  into v_qa_status
  from public.dd_work_orders w
  where w.id = v_job.work_order_id;

  if not found then
    raise exception 'WORK_ORDER_NOT_FOUND_FOR_AP';
  end if;

  if upper(coalesce(v_qa_status,'')) not in ('APPROVED','PASS') then
    raise exception 'QA_NOT_APPROVED';
  end if;

  -- Production currently enforces one canonical AP row per work order.
  select ap.id, ap.provider_id
  into v_ap_id, v_existing_provider
  from public.dd_accounts_payable_ledger ap
  where ap.work_order_id = v_job.work_order_id
  order by ap.accrued_at, ap.id
  limit 1;

  if v_ap_id is not null then
    if v_existing_provider is distinct from v_pp.provider_id then
      raise exception 'AP_PROVIDER_CONFLICT';
    end if;
    return v_ap_id;
  end if;

  v_total := coalesce(
    v_pp.total_amount,
    coalesce(v_pp.base_amount,0)
      + coalesce(v_pp.travel_amount,0)
      + coalesce(v_pp.overtime_amount,0)
      + coalesce(v_pp.bonus_amount,0)
      + coalesce(v_pp.expense_amount,0)
      + coalesce(v_pp.adjustment_amount,0)
  );

  if v_total < 0 then
    raise exception 'NEGATIVE_PAYABLE_TOTAL';
  end if;

  -- Preserve the payable's total without relabeling ordinary adjustments as change orders.
  v_base_for_ledger := greatest(v_total - coalesce(v_pp.travel_amount,0), 0);

  select exists (
    select 1
    from information_schema.columns
    where table_schema='public'
      and table_name='dd_accounts_payable_ledger'
      and column_name='assignment_id'
  )
  into v_has_assignment_id;

  if v_has_assignment_id then
    select a.id
    into v_assignment_id
    from public.dd_job_assignments a
    where a.job_id = v_pp.job_id
      and a.provider_id = v_pp.provider_id
      and upper(coalesce(a.assignment_status,'')) in ('ACCEPTED','COMPLETED')
    order by a.accepted_at desc nulls last, a.created_at desc, a.id
    limit 1;

    if v_assignment_id is null then
      raise exception 'ASSIGNMENT_REQUIRED_FOR_AP';
    end if;

    execute
      'insert into public.dd_accounts_payable_ledger
       (work_order_id,assignment_id,provider_id,base_payout_amount,travel_allowance,
        approved_change_order_addition,total_final_payable,is_cleared_for_payout,accrued_at)
       values ($1,$2,$3,$4,$5,0,$6,false,now())
       returning id'
    into v_ap_id
    using v_job.work_order_id, v_assignment_id, v_pp.provider_id,
          v_base_for_ledger, coalesce(v_pp.travel_amount,0), v_total;
  else
    insert into public.dd_accounts_payable_ledger(
      work_order_id,provider_id,base_payout_amount,travel_allowance,
      approved_change_order_addition,total_final_payable,is_cleared_for_payout,accrued_at
    )
    values(
      v_job.work_order_id,v_pp.provider_id,v_base_for_ledger,coalesce(v_pp.travel_amount,0),
      0,v_total,false,now()
    )
    returning id into v_ap_id;
  end if;

  return v_ap_id;
end
$$;

comment on function public.dd_accrue_ap_from_approved_payable(uuid) is
'Accrues canonical AP only from an APPROVED/PAID provider payable whose linked work order QA is APPROVED/PASS. Never clears payout or settles funds.';

revoke all on function public.dd_accrue_ap_from_approved_payable(uuid) from public, anon, authenticated;
grant execute on function public.dd_accrue_ap_from_approved_payable(uuid) to service_role;

create or replace function public.dd_accrue_ap_from_approved_payable_trigger()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  perform public.dd_accrue_ap_from_approved_payable(new.id);
  return new;
end
$$;

revoke all on function public.dd_accrue_ap_from_approved_payable_trigger() from public, anon, authenticated;
grant execute on function public.dd_accrue_ap_from_approved_payable_trigger() to service_role;

drop trigger if exists dd_provider_payable_ap_accrual on public.dd_provider_payables;

create trigger dd_provider_payable_ap_accrual
after insert or update of status on public.dd_provider_payables
for each row
when (upper(coalesce(new.status,'')) in ('APPROVED','PAID'))
execute function public.dd_accrue_ap_from_approved_payable_trigger();
