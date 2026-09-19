create table if not exists public.dd_ch01_resident_subchannels (code text primary key, name text not null, description text, is_active boolean not null default true, sort_order integer not null);
insert into public.dd_ch01_resident_subchannels(code,name,description,sort_order) values
('CH01-A','Apartment / Property Residents','Residents connected to a participating apartment community, property, or property-management relationship.',1),
('CH01-B','Regular / Direct Residents','Residents/customers who purchase directly from DANI DECLARES without a participating apartment/property relationship.',2)
on conflict (code) do update set name=excluded.name,description=excluded.description,sort_order=excluded.sort_order,is_active=true;

create table if not exists public.dd_service_customer_routing (service_id uuid not null references public.services(id) on delete cascade, channel_code text not null, subchannel_code text references public.dd_ch01_resident_subchannels(code), eligibility_status text not null default 'PENDING', notes text, created_at timestamptz not null default now(), primary key(service_id,channel_code,subchannel_code));

insert into public.dd_service_customer_routing(service_id,channel_code,subchannel_code,eligibility_status,notes)
select s.id,'CH01',r.code,'ACTIVE',case when r.code='CH01-A' then 'Apartment/property resident relationship; applicable property/resident benefits governed separately.' else 'Direct resident relationship; standard Resident Concierge eligibility.' end
from public.services s cross join public.dd_ch01_resident_subchannels r
where s.is_active=true and exists (select 1 from public.dd_service_channel_availability sc where sc.service_id=s.id and sc.channel_code='CH01' and sc.eligibility_status='ACTIVE')
on conflict (service_id,channel_code,subchannel_code) do update set eligibility_status=excluded.eligibility_status,notes=excluded.notes;

create or replace view public.dd_master_service_customer_routing as
select s.sku,s.name,s.service_family,s.pricing_type,s.base_price_cents,s.resident_discount_eligible,s.commercial_status,
       dcr.channel_code,dcr.subchannel_code,rs.name as resident_subchannel,dcr.eligibility_status,dcr.notes
from public.dd_service_customer_routing dcr
join public.services s on s.id=dcr.service_id
left join public.dd_ch01_resident_subchannels rs on rs.code=dcr.subchannel_code;
