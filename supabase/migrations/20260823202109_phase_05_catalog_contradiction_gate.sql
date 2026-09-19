create table if not exists public.dd_catalog_governance (
  id uuid primary key default gen_random_uuid(),
  authority_version text not null,
  phase text not null,
  status text not null,
  pricing_status text not null,
  effective_date date not null default current_date,
  rules jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.dd_catalog_governance enable row level security;

drop policy if exists "catalog governance deny public" on public.dd_catalog_governance;
create policy "catalog governance deny public" on public.dd_catalog_governance for all to anon, authenticated using (false) with check (false);

insert into public.dd_catalog_governance (authority_version, phase, status, pricing_status, rules)
select 'Master Operating Architecture Authority v1.0', 'PHASE_0_5_ACTIVE_CLEANOUT', 'CANONICAL_CATALOG_ONLY', 'PENDING_RECONCILIATION', jsonb_build_object(
  'customer_price_authority', 'canonical catalog only',
  'legacy_prices', 'evidence_only',
  'provider_economics', 'never_customer_price',
  'channels', jsonb_build_array('CH01','CH02','CH03','CH04','CH05','CH06'),
  'divisions', 13,
  'legacy_travel_engine', 'disabled',
  'legacy_packages', 'quarantined',
  'legacy_addons', 'quarantined'
)
where not exists (select 1 from public.dd_catalog_governance);

update public.services
set starting_price = null,
    price_note = 'PENDING_RECONCILIATION — legacy numeric pricing is evidence only.',
    is_active = false,
    updated_at = now();

update public.dd_service_packages
set locked_price = null,
    starting_price = null,
    typical_min = null,
    typical_max = null,
    is_public = false,
    is_active = false,
    status_boundary = 'DEPRECATED_HISTORICAL / PENDING_RECONCILIATION',
    updated_at = now();

update public.dd_service_addons
set base_price = null,
    min_price = null,
    max_price = null,
    is_active = false,
    quote_notes = 'PENDING_RECONCILIATION — legacy numeric pricing is evidence only.',
    updated_at = now();

update public.fieldops_packages
set starting_price = null,
    typical_min = null,
    typical_max = null,
    is_active = false,
    updated_at = now();

update public.fieldops_addons
set base_price = null,
    min_price = null,
    max_price = null,
    is_active = false,
    quote_notes = 'PENDING_RECONCILIATION — legacy numeric pricing is evidence only.',
    updated_at = now();

create or replace function public.block_legacy_travel_calculation()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  raise exception 'LEGACY_TRAVEL_ENGINE_DISABLED: use canonical market/service-area treatment and governed intake';
end;
$$;

drop trigger if exists trg_block_legacy_dd_travel_calculations on public.dd_travel_calculations;
create trigger trg_block_legacy_dd_travel_calculations
before insert or update on public.dd_travel_calculations
for each row execute function public.block_legacy_travel_calculation();

drop trigger if exists trg_block_legacy_fieldops_travel_calculations on public.fieldops_travel_calculations;
create trigger trg_block_legacy_fieldops_travel_calculations
before insert or update on public.fieldops_travel_calculations
for each row execute function public.block_legacy_travel_calculation();
