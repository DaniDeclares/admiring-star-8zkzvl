create or replace view public.dd_master_service_capability_channel_matrix as
select s.sku,
       s.name as service_name,
       d.name as division,
       s.service_family,
       s.pricing_type,
       s.base_price_cents,
       s.resident_discount_eligible,
       s.commercial_status,
       sc.channel_code,
       case when sc.channel_code='CH01' then rs.code end as resident_subchannel_code,
       case when sc.channel_code='CH01' then rs.name end as resident_subchannel,
       sc.eligibility_status as channel_eligibility,
       coalesce(cb.independent_purchase,false) as independent_purchase,
       coalesce(cb.multi_division_composable,false) as multi_division_composable,
       coalesce(cb.multi_service_work_order,false) as multi_service_work_order,
       cb.primary_use_cases,
       sr.requirement_types,
       sr.requirement_codes,
       sr.requirements_required,
       coalesce(pc.provider_count,0) as authorized_provider_capability_count
from services s
left join divisions d on d.id=s.division_id
join dd_service_channel_availability sc on sc.service_id=s.id
left join dd_service_commercial_behavior cb on cb.service_id=s.id
left join lateral (
  select array_agg(distinct requirement_type order by requirement_type) filter(where requirement_type is not null) as requirement_types,
         array_agg(distinct requirement_code order by requirement_code) filter(where requirement_code is not null) as requirement_codes,
         bool_or(required) as requirements_required
  from dd_service_requirements r where r.service_id=s.id
) sr on true
left join lateral (
  select count(*) as provider_count from dd_provider_capabilities p where p.service_id=s.id and p.is_authorized=true
) pc on true
left join dd_ch01_resident_subchannels rs on sc.channel_code='CH01'
where s.is_active=true;
