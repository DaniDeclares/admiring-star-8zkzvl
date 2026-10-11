begin;

update public.danis_specials_offers d
set price = case d.service_id
  when 'DSS-CAN-DNI02A004' then 200.00
  when 'DSS-CAN-DNI02A005' then 275.00
  when 'DSS-CAN-DNI02A012' then 275.00
end
where d.service_id in ('DSS-CAN-DNI02A004','DSS-CAN-DNI02A005','DSS-CAN-DNI02A012');

do $$
declare v int;
begin
  -- Price-only reconciliation: historical absence must not create a special,
  -- and an existing special must retain its underwriting gate.
  if exists (
    select 1 from public.danis_specials_offers d
    where d.service_id in ('DSS-CAN-DNI02A004','DSS-CAN-DNI02A005','DSS-CAN-DNI02A012')
      and not (
        d.price = case d.service_id
          when 'DSS-CAN-DNI02A004' then 200.00
          else 275.00 end
        and d.active=true
        and d.commercial_status='UNDERWRITING_REQUIRED'
      )
  ) then
    raise exception 'D02 special price/underwriting reconciliation failed for existing historical row';
  end if;
end $$;

commit;