
do $$
declare
  v_expected integer := 8;
  v_updated integer;
begin
  with candidates as (
    select service_id, proposed_starting_price
    from public.vw_legacy_price_reconciliation
    where is_active=true
      and reconciliation_status='UNAMBIGUOUS_STALE'
  ),
  updated as (
    update public.services s
    set starting_price=c.proposed_starting_price,
        updated_at=now()
    from candidates c
    where s.id=c.service_id
      and s.is_active=true
      and s.starting_price is distinct from c.proposed_starting_price
    returning s.id
  )
  select count(*) into v_updated from updated;

  if v_updated <> v_expected then
    raise exception 'Fail-closed legacy price reconciliation: expected % updates, got %', v_expected, v_updated;
  end if;
end $$;
