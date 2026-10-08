-- Evidence-only hardening of the existing sales-touch reconciliation bridge.
-- No new queue/worker/governor; no outreach, dispositions, or campaign permission changes.
-- Exclude ambiguous shared addresses and incomplete message receipts.
create or replace function public.dd_reconcile_outbound_sales_touch_bridge()
returns table(updated_rows integer, touched_missing_timestamp integer)
language plpgsql
security invoker
set search_path=''
as $$
declare
  v_updated integer := 0;
  v_missing integer := 0;
begin
  with unique_buyer_email as (
    select lower(trim(q.email)) email
    from public.dd_sales_queue q
    where nullif(trim(coalesce(q.email,'')),'') is not null
    group by lower(trim(q.email))
    having count(*) = 1
  ), outbound as (
    select
      lower(trim(recipient.email)) email,
      count(distinct e.external_message_id)::integer proven_attempts,
      max(e.received_at) latest_contact_at
    from public.dd_communication_events e
    cross join lateral jsonb_array_elements_text(
      case when jsonb_typeof(e.recipient_addresses)='array'
        then e.recipient_addresses else '[]'::jsonb end
    ) as recipient(email)
    join unique_buyer_email u on u.email=lower(trim(recipient.email))
    where e.channel='GMAIL'
      and e.direction='OUTBOUND'
      and nullif(trim(e.external_message_id),'') is not null
      and e.received_at is not null
      and e.received_at <= now()
      and nullif(trim(recipient.email),'') is not null
    group by lower(trim(recipient.email))
  )
  update public.dd_sales_queue q
  set
    contact_attempts=greatest(coalesce(q.contact_attempts,0),outbound.proven_attempts),
    last_contacted_at=greatest(q.last_contacted_at,outbound.latest_contact_at),
    last_contact_channel=case
      when q.last_contacted_at is null or outbound.latest_contact_at >= q.last_contacted_at
        then 'EMAIL' else q.last_contact_channel end,
    updated_at=now()
  from outbound
  where lower(trim(q.email))=outbound.email
    and (
      outbound.proven_attempts>coalesce(q.contact_attempts,0)
      or q.last_contacted_at is null
      or outbound.latest_contact_at>q.last_contacted_at
      or (q.last_contact_channel is null and outbound.latest_contact_at>=q.last_contacted_at)
    );
  get diagnostics v_updated=row_count;
  select count(*)::integer into v_missing
  from public.dd_sales_queue q
  where coalesce(q.contact_attempts,0)>0 and q.last_contacted_at is null;
  return query select v_updated,v_missing;
end;
$$;
revoke all on function public.dd_reconcile_outbound_sales_touch_bridge() from public,anon,authenticated;
grant execute on function public.dd_reconcile_outbound_sales_touch_bridge() to service_role;
comment on function public.dd_reconcile_outbound_sales_touch_bridge() is
'Evidence-only Gmail outbound bridge: complete message ID and timestamp, unambiguous exact buyer email, no future receipts. Never authorizes contact, rewrites disposition, or fabricates missing chronology.';
