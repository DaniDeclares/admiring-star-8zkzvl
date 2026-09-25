alter table public.dd_job_assignments
  add column if not exists travel_allowance_snapshot numeric not null default 0;
alter table public.dd_job_assignments
  drop constraint if exists dd_job_assignments_travel_allowance_nonnegative;
alter table public.dd_job_assignments
  add constraint dd_job_assignments_travel_allowance_nonnegative check (travel_allowance_snapshot >= 0);

alter table public.dd_change_orders
  add column if not exists assignment_id uuid references public.dd_job_assignments(id) on delete set null,
  add column if not exists provider_pay_delta numeric not null default 0;
alter table public.dd_change_orders
  drop constraint if exists dd_change_orders_provider_pay_delta_nonnegative;
alter table public.dd_change_orders
  add constraint dd_change_orders_provider_pay_delta_nonnegative check (provider_pay_delta >= 0);
create index if not exists idx_dd_change_orders_assignment on public.dd_change_orders(assignment_id, status, created_at desc);

create or replace function public.dd_accrue_provider_payable_from_assignment(p_assignment_id uuid)
returns uuid
language plpgsql
security definer
set search_path='public'
as $function$
declare
 a public.dd_job_assignments%rowtype;
 j public.dd_jobs%rowtype;
 ap_id uuid;
 authorized_total numeric;
 travel numeric;
 base numeric;
 change_addition numeric;
begin
 select * into a from public.dd_job_assignments where id=p_assignment_id for update;
 if a.id is null then raise exception 'ASSIGNMENT_NOT_FOUND'; end if;
 if upper(coalesce(a.assignment_status,''))<>'ACCEPTED' then raise exception 'ASSIGNMENT_NOT_ACCEPTED'; end if;
 if a.provider_id is null then raise exception 'PROVIDER_REQUIRED'; end if;
 if a.authorized_provider_compensation is null then raise exception 'AUTHORIZED_PROVIDER_COMPENSATION_REQUIRED'; end if;

 select * into j from public.dd_jobs where id=a.job_id;
 if j.id is null then raise exception 'JOB_NOT_FOUND'; end if;
 if j.work_order_id is null then raise exception 'WORK_ORDER_REQUIRED'; end if;

 authorized_total:=round(coalesce(a.authorized_provider_compensation,0),2);
 travel:=round(least(greatest(coalesce(a.travel_allowance_snapshot,0),0),authorized_total),2);
 base:=round(greatest(authorized_total-travel,0),2);

 select round(coalesce(sum(provider_pay_delta),0),2)
 into change_addition
 from public.dd_change_orders
 where assignment_id=a.id and status='APPROVED';

 insert into public.dd_accounts_payable_ledger(
   work_order_id,assignment_id,provider_id,economics_snapshot_id,
   base_payout_amount,travel_allowance,approved_change_order_addition,total_final_payable,
   is_cleared_for_payout,metadata
 )
 values(
   j.work_order_id,a.id,a.provider_id,a.economics_snapshot_id,
   base,travel,change_addition,round(base+travel+change_addition,2),false,
   jsonb_build_object('source','ACCEPTED_ASSIGNMENT','authorizedProviderCompensation',authorized_total,'external_payout_authorized',false)
 )
 on conflict(assignment_id) do update
 set economics_snapshot_id=excluded.economics_snapshot_id,
     base_payout_amount=excluded.base_payout_amount,
     travel_allowance=excluded.travel_allowance,
     approved_change_order_addition=excluded.approved_change_order_addition,
     total_final_payable=excluded.total_final_payable,
     metadata=coalesce(public.dd_accounts_payable_ledger.metadata,'{}'::jsonb)||excluded.metadata
 returning id into ap_id;

 insert into public.dd_provider_earnings_ledger(
   provider_id,provider_org_id,work_order_id,assignment_id,payable_id,
   earning_type,source_id,base_amount,reimbursement_amount,adjustment_amount,total_approved_amount,
   earning_status,hold_reason,metadata
 )
 values(
   a.provider_id,a.provider_org_id,j.work_order_id,a.id,ap_id,
   'JOB_ASSIGNMENT',a.id::text,base,travel,change_addition,round(base+travel+change_addition,2),
   'PENDING','QA_AND_PAYOUT_CLEARANCE_REQUIRED',
   jsonb_build_object('external_payout_authorized',false)
 )
 on conflict(payable_id) do update
 set base_amount=excluded.base_amount,
     reimbursement_amount=excluded.reimbursement_amount,
     adjustment_amount=excluded.adjustment_amount,
     total_approved_amount=excluded.total_approved_amount,
     metadata=coalesce(public.dd_provider_earnings_ledger.metadata,'{}'::jsonb)||excluded.metadata;

 return ap_id;
end
$function$;

create or replace function public.dd_refresh_payable_after_change_order()
returns trigger
language plpgsql
security definer
set search_path='public'
as $function$
begin
 if new.assignment_id is not null
    and new.status='APPROVED'
    and (old.status is distinct from new.status or old.provider_pay_delta is distinct from new.provider_pay_delta)
 then
   perform public.dd_accrue_provider_payable_from_assignment(new.assignment_id);
 end if;
 return new;
end
$function$;
revoke all on function public.dd_refresh_payable_after_change_order() from public,anon,authenticated;
grant execute on function public.dd_refresh_payable_after_change_order() to service_role;

drop trigger if exists trg_dd_refresh_payable_after_change_order on public.dd_change_orders;
create trigger trg_dd_refresh_payable_after_change_order
after update on public.dd_change_orders
for each row execute function public.dd_refresh_payable_after_change_order();
