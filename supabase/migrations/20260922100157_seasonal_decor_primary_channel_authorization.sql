
insert into public.dd_service_channel_availability(service_id,channel_code,eligibility_status,notes)
select s.id,ch.channel_code,
       case when ch.channel_code='CH01' then 'ACTIVE' else 'PENDING' end,
       case when ch.channel_code='CH01'
            then 'OWNER_CONFIRMED_LAUNCH_PORTFOLIO_2026-09-22: primary resident-facing seasonal decorating distribution authorized; other channels remain pending.'
            else 'Seasonal decorating may be relevant but remains pending separate channel adjudication.' end
from public.services s
cross join (values('CH01'),('CH02'),('CH03'),('CH04'),('CH05')) ch(channel_code)
where s.sku in ('DNI-01F-003','DNI-01F-004')
on conflict(service_id,channel_code) do update set eligibility_status=excluded.eligibility_status,notes=excluded.notes;
