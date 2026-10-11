create or replace function public.dd_reconcile_outbound_sales_touch_bridge()
returns table(updated_rows integer, touched_missing_timestamp integer)
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_updated integer := 0;
  v_missing integer := 0;
begin
  with outbound as (
    select lower(trim(r.email)) as email,
           count(distinct e.external_message_id)::integer as proven_attempts,
           max(e.received_at) as latest_contact_at
    from public.dd_communication_events e
    cross join lateral jsonb_array_elements_text(e.recipient_addresses) as r(email)
    where e.channel = 'GMAIL'
      and e.direction = 'OUTBOUND'
      and trim(r.email) <> ''
    group by lower(trim(r.email))
  )
  update public.dd_sales_queue q
  set contact_attempts = greatest(coalesce(q.contact_attempts, 0), outbound.proven_attempts),
      last_contacted_at = case when q.last_contacted_at is null then outbound.latest_contact_at when outbound.latest_contact_at > q.last_contacted_at then outbound.latest_contact_at else q.last_contacted_at end,
      last_contact_channel = case when q.last_contacted_at is null or outbound.latest_contact_at >= q.last_contacted_at then 'EMAIL' else q.last_contact_channel end,
      updated_at = now()
  from outbound
  where lower(trim(coalesce(q.email, ''))) = outbound.email
    and (outbound.proven_attempts > coalesce(q.contact_attempts, 0)
      or q.last_contacted_at is null
      or outbound.latest_contact_at > q.last_contacted_at
      or q.last_contact_channel is null);
  get diagnostics v_updated = row_count;
  select count(*)::integer into v_missing
  from public.dd_sales_queue q
  where coalesce(q.contact_attempts, 0) > 0 and q.last_contacted_at is null;
  return query select v_updated, v_missing;
end;
$$;
revoke all on function public.dd_reconcile_outbound_sales_touch_bridge() from public, anon, authenticated;
grant execute on function public.dd_reconcile_outbound_sales_touch_bridge() to service_role;
