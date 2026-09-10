-- Canonical GovCon acquisition territory control.
-- This is separate from the commercial service-area architecture.

create table if not exists public.dd_govcon_acquisition_territories (
  id uuid primary key default gen_random_uuid(),
  tier text not null unique,
  name text not null,
  description text not null,
  pursuit_rule text not null,
  sort_order integer not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.dd_contract_opportunities
  add column if not exists acquisition_territory text;

alter table public.dd_contract_opportunities
  add column if not exists acquisition_territory_status text;

insert into public.dd_govcon_acquisition_territories
  (tier, name, description, pursuit_rule, sort_order)
values
  ('CORE', 'Atlanta Metro', 'Atlanta metro and immediate surrounding operating area.', 'Normal GovCon acquisition territory; pursue when opportunity, capability, compliance and economics qualify.', 1),
  ('CORRIDOR', 'Atlanta to Greenville', 'Northeast Georgia corridor through Greenville, South Carolina.', 'Normal pursuit territory; prioritize opportunities along the Atlanta-to-Greenville corridor and Upstate SC.', 2),
  ('MAXIMUM', 'Spartanburg', 'Spartanburg, South Carolina is the hard maximum geographic boundary.', 'Selective only; pursue when operational economics and fulfillment coverage justify the trip.', 3),
  ('SITE_QUALIFIED', 'Verify Locations', 'Statewide or multi-location opportunities that may contain qualifying sites.', 'Do not treat as territory-wide. Screen each place of performance and pursue only qualifying locations inside Core/Corridor/Maximum.', 4),
  ('OUTSIDE', 'Outside Territory', 'Locations materially beyond the approved Atlanta-to-Greenville-Spartanburg acquisition territory.', 'Do not pursue as an active DANI acquisition target; retain only for benchmark/research context.', 5)
on conflict (tier) do update set
  name = excluded.name,
  description = excluded.description,
  pursuit_rule = excluded.pursuit_rule,
  sort_order = excluded.sort_order,
  is_active = true,
  updated_at = now();

-- Existing research records are classified below from their recorded place of performance.
update public.dd_contract_opportunities
set acquisition_territory = 'CORRIDOR', acquisition_territory_status = 'ACTIVE_PURSUIT'
where public_reference = 'DD-OPP-C8FD1646';

update public.dd_contract_opportunities
set jurisdiction_code = 'SC', acquisition_territory = 'OUTSIDE', acquisition_territory_status = 'DO_NOT_PURSUIT'
where public_reference in ('DD-OPP-4BC9B28A', 'DD-OPP-3A035B10', 'DD-OPP-E0606DFE', 'DD-OPP-BDBF2EAB', 'DD-OPP-F7602A82');

update public.dd_contract_opportunities
set jurisdiction_code = 'SC', acquisition_territory = 'SITE_QUALIFIED', acquisition_territory_status = 'SCREEN_BY_LOCATION'
where public_reference = 'DD-OPP-72F0C8B7';

update public.dd_contract_opportunities
set acquisition_territory = 'CORE', acquisition_territory_status = 'ACTIVE_PURSUIT'
where public_reference in ('DD-OPP-34CF3CA0', 'DD-OPP-B7E2A37D', 'DD-OPP-ACBE99B9', 'DD-OPP-5E8ED57C', 'DD-OPP-81C309CB', 'DD-OPP-3AB17E4E');

update public.dd_contract_opportunities
set acquisition_territory = 'SITE_QUALIFIED', acquisition_territory_status = 'SCREEN_BY_LOCATION'
where public_reference in ('DD-OPP-705B0F9A', 'DD-OPP-58BFCFE3');

update public.dd_contract_opportunities
set acquisition_territory = 'OUTSIDE', acquisition_territory_status = 'DO_NOT_PURSUIT'
where public_reference = 'DD-OPP-BB24D23C';

update public.dd_contract_opportunities
set acquisition_territory = 'OUTSIDE', acquisition_territory_status = 'DO_NOT_PURSUIT'
where title = 'Roof / Gutter / Exterior Cleaning';

update public.dd_contract_opportunities
set acquisition_territory = 'OUTSIDE', acquisition_territory_status = 'DO_NOT_PURSUIT'
where place_of_performance in ('Augusta, GA', 'Athens, GA');
