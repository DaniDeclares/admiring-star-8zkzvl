-- DANI DECLARES commercial authority + provider wall + canonical B2B retainer reconciliation.
-- Stripe is not mutated by this migration.

create table if not exists public.dd_commercial_authority (
  id uuid primary key default gen_random_uuid(),
  provider_org_id uuid not null references public.dd_provider_organizations(id) on delete cascade,
  pricing_authority text not null default 'DANI_DECLARES',
  marketing_authority text not null default 'DANI_DECLARES',
  customer_relationship_authority text not null default 'DANI_DECLARES',
  provider_role text not null default 'FULFILLMENT_ONLY',
  authorization_basis text not null,
  effective_date date,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(provider_org_id)
);

alter table public.dd_commercial_authority enable row level security;
revoke all on table public.dd_commercial_authority from anon;
revoke all on table public.dd_commercial_authority from authenticated;

insert into public.dd_commercial_authority (
  provider_org_id,
  pricing_authority,
  marketing_authority,
  customer_relationship_authority,
  provider_role,
  authorization_basis,
  effective_date,
  is_active
)
select id,
       'DANI_DECLARES',
       'DANI_DECLARES',
       'DANI_DECLARES',
       'FULFILLMENT_ONLY',
       'Provider authorization supplied by DANI DECLARES: NAWFside granted DANI DECLARES control of customer-facing pricing and marketing.',
       agreement_effective_date,
       true
from public.dd_provider_organizations
where internal_alias = 'nawfside'
on conflict (provider_org_id) do update set
  pricing_authority = excluded.pricing_authority,
  marketing_authority = excluded.marketing_authority,
  customer_relationship_authority = excluded.customer_relationship_authority,
  provider_role = excluded.provider_role,
  authorization_basis = excluded.authorization_basis,
  effective_date = excluded.effective_date,
  is_active = true,
  updated_at = now();

-- Keep NAWFside commercially authorized but operationally gated until compliance is verified.
update public.dd_provider_organizations
set accepts_new_work = false
where internal_alias = 'nawfside' and compliance_status <> 'VERIFIED';

-- Replace the conflicting 12-tier historical B2B retainer ladder with the current canonical ladder.
with canonical(package_slug, price) as (
  values
    ('b2b_apt_ret_001', 1500.00),
    ('b2b_apt_ret_002', 3250.00),
    ('b2b_apt_ret_003', 5500.00),
    ('b2b_apt_ret_004', 1850.00),
    ('b2b_apt_ret_005', 2450.00),
    ('b2b_apt_ret_006', 1750.00),
    ('b2b_apt_ret_007', 1650.00),
    ('b2b_apt_ret_008', 1450.00),
    ('b2b_apt_ret_009', 1950.00),
    ('b2b_apt_ret_010', 2150.00),
    ('b2b_apt_ret_011', 2850.00),
    ('b2b_apt_ret_012', 7500.00)
)
update public.dd_service_packages p
set locked_price = canonical.price,
    starting_price = canonical.price,
    updated_at = now()
from canonical
where p.division_slug = 'propertyops'
  and p.package_slug = canonical.package_slug;

-- Remove the known $5/hr placeholder from the legacy public services catalog.
update public.services
set starting_price = 45.00,
    price_note = 'Canonical baseline. Final scope may be quoted separately.'
where slug = 'admin-support';

update public.services
set starting_price = 50.00,
    price_note = 'Canonical B2B I-9 verification baseline.'
where slug = 'i9-verification';
