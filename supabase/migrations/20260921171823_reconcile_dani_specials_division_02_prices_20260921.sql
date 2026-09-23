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
  select count(*) into v
  from public.danis_specials_offers
  where service_id='DSS-CAN-DNI02A004'
    and price=200.00 and active=true and commercial_status='UNDERWRITING_REQUIRED';
  if v<>1 then raise exception 'DSS-CAN-DNI02A004 special price reconciliation failed'; end if;

  select count(*) into v
  from public.danis_specials_offers
  where service_id in ('DSS-CAN-DNI02A005','DSS-CAN-DNI02A012')
    and price=275.00 and active=true and commercial_status='UNDERWRITING_REQUIRED';
  if v<>2 then raise exception 'DSS-CAN-DNI02A005/012 special price reconciliation failed'; end if;
end $$;

commit;