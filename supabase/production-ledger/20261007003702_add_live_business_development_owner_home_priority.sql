
insert into public.dd_owner_home_service_priority(
  canonical_sku,owner_fulfillment_mode,priority_tier,home_executable,provider_optional,rationale
)
select s.sku,'OWNER_REMOTE_BUSINESS_DEVELOPMENT','P0',true,true,
       'Owner can fulfill remotely using DANI business-development, research, systems and outreach capability; provider support may absorb specialized overflow.'
from public.services s
where s.sku in (
  'DNI-08A-007','DNI-08A-008','DNI-08A-010','DNI-08A-011',
  'DNI-08A-012','DNI-08A-017','DNI-08A-018','DNI-08A-019'
)
on conflict(canonical_sku) do update
set owner_fulfillment_mode=excluded.owner_fulfillment_mode,
    priority_tier=excluded.priority_tier,
    home_executable=true,
    provider_optional=excluded.provider_optional,
    rationale=excluded.rationale,
    updated_at=now();
