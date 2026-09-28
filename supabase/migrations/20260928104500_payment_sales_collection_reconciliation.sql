-- Keep sales collection truth synchronized with canonical succeeded payment events.
-- This function reconciles records only; it never creates, captures, refunds, or moves money.

create or replace function public.dd_reconcile_sales_collection_from_payments(p_request_id uuid default null)
returns jsonb
language plpgsql
security invoker
set search_path='public'
as $$
declare
  v_updated integer := 0;
begin
  with payment_totals as (
    select
      p.request_id,
      sum(p.amount_received) filter (where lower(p.payment_status)='succeeded')::numeric(12,2) as succeeded_total
    from public.dd_payment_events p
    where p.request_id is not null
      and (p_request_id is null or p.request_id=p_request_id)
    group by p.request_id
  ),
  matched_sales as (
    select
      s.id,
      least(coalesce(s.quoted_amount,pt.succeeded_total),pt.succeeded_total)::numeric(12,2) as reconciled_total
    from public.dd_sales_queue s
    join public.dd_service_requests r
      on lower(coalesce(r.customer_email,''))=lower(coalesce(s.email,''))
    join payment_totals pt on pt.request_id=r.id
    where pt.succeeded_total is not null
      and pt.succeeded_total >= 0
      and (s.amount_collected is distinct from least(coalesce(s.quoted_amount,pt.succeeded_total),pt.succeeded_total))
  ),
  updated as (
    update public.dd_sales_queue s
       set amount_collected=m.reconciled_total,
           updated_at=now(),
           notes=coalesce(s.notes,'')||E'\nCollection total reconciled from canonical succeeded payment events; no money movement performed.'
      from matched_sales m
     where s.id=m.id
     returning s.id
  )
  select count(*) into v_updated from updated;

  return jsonb_build_object('request_id',p_request_id,'sales_rows_updated',v_updated,'money_moved',false,'reconciled_at',now());
end;
$$;

revoke all on function public.dd_reconcile_sales_collection_from_payments(uuid) from public, anon, authenticated;
grant execute on function public.dd_reconcile_sales_collection_from_payments(uuid) to service_role;

create or replace function public.dd_reconcile_sales_collection_payment_trigger()
returns trigger
language plpgsql
security invoker
set search_path='public'
as $$
begin
  if new.request_id is not null
     and lower(coalesce(new.payment_status,''))='succeeded'
     and new.amount_received is not null then
    perform public.dd_reconcile_sales_collection_from_payments(new.request_id);
  end if;
  return new;
end;
$$;

revoke all on function public.dd_reconcile_sales_collection_payment_trigger() from public, anon, authenticated;

drop trigger if exists trg_dd_reconcile_sales_collection_payment on public.dd_payment_events;
create trigger trg_dd_reconcile_sales_collection_payment
after insert or update of payment_status,amount_received,request_id
on public.dd_payment_events
for each row
execute function public.dd_reconcile_sales_collection_payment_trigger();

comment on function public.dd_reconcile_sales_collection_from_payments(uuid)
is 'Idempotently reconciles dd_sales_queue.amount_collected from canonical succeeded dd_payment_events. Never moves money.';
