
insert into public.dd_service_channel_availability(service_id,channel_code,eligibility_status,notes)
select g.runtime_service_id,'CH02','ACTIVE',
       'RECONCILED_2026-09-23: backfilled primary distribution authorization from the same owner-approved Division 02 package cohort and established CH02 distribution decision; no additional channels activated.'
from public.dd_governed_service_offers g
join public.dd_launch_portfolio lp on lp.canonical_sku=g.canonical_sku
where g.canonical_sku in ('DNI-02A-025','DNI-02A-026','DNI-02A-027','DNI-02A-028')
  and g.source_authority='OWNER_MASTER_PRICEBOOK_2026-09-18'
  and lp.evidence_status='OWNER_CONFIRMED'
  and not exists (
    select 1 from public.dd_service_channel_availability a
    where a.service_id=g.runtime_service_id and a.channel_code='CH02'
  );
