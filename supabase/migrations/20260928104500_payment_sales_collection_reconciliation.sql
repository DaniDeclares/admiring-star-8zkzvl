-- Keep sales collection truth synchronized with canonical payment events.
-- Reconciliation only: never creates, captures, refunds, or moves money.

create or replace function public.dd_reconcile_sales_collection_from_payments(p_request_id uuid default null)
returns jsonb
language plpgsql
security invoker
set search_path='public'
as $$
declare
  v_updated integer := 0;
begin
  if p_request_id is not null then
    perform pg_advisory_xact_lock(hashtextextended(p_request_id::text,0));
  end if;

  with resolved_events as (
    select
      coalesce(p.request_id,j.service_request_id) as request_id,
      p.payment_status,
      p.amount_received
    from public.dd_payment_events p
    left join public.dd_jobs j on j.id=p.job_id
    where coalesce(p.request_id,j.service_request_id) is not null
      and (p_request_id is null or coalesce(p.request_id,j.service_request_id)=p_request_id)
  ),
  request_totals as (
    select
      r.id as request_id,
      coalesce(sum(e.amount_received) filter (where lower(coalesce(e.payment_status,''))='succeeded'),0)::numeric(12,2) as succeeded_total
    from public.service_requests r
    left join resolved_events e on e.request_id=r.id
    where p_request_id is null or r.id=p_request_id
    group by r.id
  ),
  matched_sales as (
    select
      s.id,
      least(coalesce(s.quoted_amount,rt.succeeded_total),rt.succeeded_total)::numeric(12,2) as reconciled_total
    from public.dd_sales_queue s
    join public.dd_jobs j on j.id=s.job_id
    join request_totals rt on rt.request_id=j.service_request_id
    where s.amount_collected is distinct from least(coalesce(s.quoted_amount,rt.succeeded_total),rt.succeeded_total)
  ),
  updated as (
    update public.dd_sales_queue s
       set amount_collected=m.reconciled_total,
           updated_at=now(),
           notes=coalesce(s.notes,'')||E'\nCollection total reconciled from canonical payment events; no money movement performed.'
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
declare
  v_old_request uuid;
  v_new_request uuid;
begin
  if tg_op='UPDATE' then
    v_old_request:=old.request_id;
    if v_old_request is null and old.job_id is not null then
      select service_request_id into v_old_request from public.dd_jobs where id=old.job_id;
    end if;
  end if;

  v_new_request:=new.request_id;
  if v_new_request is null and new.job_id is not null then
    select service_request_id into v_new_request from public.dd_jobs where id=new.job_id;
  end if;

  if v_old_request is not null and v_old_request is distinct from v_new_request then
    perform public.dd_reconcile_sales_collection_from_payments(v_old_request);
  end if;
  if v_new_request is not null then
    perform public.dd_reconcile_sales_collection_from_payments(v_new_request);
  end if;
  return new;
end;
$$;

revoke all on function public.dd_reconcile_sales_collection_payment_trigger() from public, anon, authenticated;

drop trigger if exists trg_dd_reconcile_sales_collection_payment on public.dd_payment_events;
create trigger trg_dd_reconcile_sales_collection_payment
after insert or update of payment_status,amount_received,request_id,job_id
on public.dd_payment_events
for each row
execute function public.dd_reconcile_sales_collection_payment_trigger();

comment on function public.dd_reconcile_sales_collection_from_payments(uuid)
is 'Idempotently reconciles dd_sales_queue.amount_collected from canonical dd_payment_events using explicit request_id or job->service_request identity. Serializes per request to prevent concurrent stale totals. Handles success revocation and reassignment. Never moves money.';
