
insert into public.dd_owner_home_service_priority(
  canonical_sku,owner_fulfillment_mode,priority_tier,home_executable,provider_optional,rationale
)
select s.sku,'OWNER_REMOTE_MARKETING','P0',true,true,
       'Owner can fulfill remotely using marketing/content capability; provider support may be used for overflow or specialized production.'
from public.services s
where s.sku between 'DNI-07A-001' and 'DNI-07A-010'
on conflict(canonical_sku) do update
set owner_fulfillment_mode=excluded.owner_fulfillment_mode,
    priority_tier=excluded.priority_tier,
    home_executable=excluded.home_executable,
    provider_optional=excluded.provider_optional,
    rationale=excluded.rationale,
    updated_at=now();
