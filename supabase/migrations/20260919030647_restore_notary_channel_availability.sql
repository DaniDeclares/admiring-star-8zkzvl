-- Restore production-proven notary channel availability written before the verification-only migration.
insert into public.dd_service_channel_availability(service_id,channel_code,eligibility_status,notes)
select s.id,ch,'ACTIVE','Notary/signing work: no channel-dependent capacity constraint (travel/jurisdiction-based, not customer-type-based). Danielle Fong holds a verified, compliance-checked notary commission covering GA/SC. CH04 (plain B2B) omitted -- division 05 does not offer that customer type in the request flow.'
from public.services s cross join unnest(array['CH01','CH02','CH03','CH05']) ch
where s.service_family in ('05A Notary & Signing Services','Notary & Document Services') and s.sku <> 'DNI-05A-007'
on conflict(service_id,channel_code) do update set eligibility_status='ACTIVE',notes=excluded.notes;

update public.dd_governed_service_offers o set channel_availability_count=4
from public.services s where o.runtime_service_id=s.id and s.service_family in ('05A Notary & Signing Services','Notary & Document Services') and s.sku <> 'DNI-05A-007';