-- Quote Builder commercial composition slice 1.
-- Customer-facing packages/add-ons are intentionally separate from dd_service_package_components (fulfillment/economics BOM).
create table if not exists public.dd_governed_packages (
 id uuid primary key default gen_random_uuid(), package_code text not null unique, package_name text not null,
 channel_code text not null, jurisdiction_code text, commercial_status text not null default 'DRAFT' check (commercial_status in ('DRAFT','ACTIVE','PAUSED','RETIRED')),
 pricing_method text not null default 'FIXED' check (pricing_method in ('FIXED','SUM_COMPONENTS','RULED')),
 fixed_price_cents integer check (fixed_price_cents is null or fixed_price_cents >= 0), description text, metadata jsonb not null default '{}'::jsonb,
 effective_from timestamptz not null default now(), effective_to timestamptz, created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists public.dd_governed_package_components (
 id uuid primary key default gen_random_uuid(), package_id uuid not null references public.dd_governed_packages(id) on delete cascade,
 service_id uuid not null references public.services(id), quantity numeric not null default 1 check (quantity > 0), required boolean not null default true,
 sort_order integer not null default 0, metadata jsonb not null default '{}'::jsonb, unique(package_id,service_id)
);
create table if not exists public.dd_service_addon_rules (
 id uuid primary key default gen_random_uuid(), parent_service_id uuid not null references public.services(id), addon_service_id uuid not null references public.services(id),
 channel_code text not null, jurisdiction_code text, status text not null default 'DRAFT' check (status in ('DRAFT','ACTIVE','PAUSED','RETIRED')),
 addon_price_cents integer check (addon_price_cents is null or addon_price_cents >= 0),
 pricing_method text not null default 'FIXED' check (pricing_method in ('FIXED','GOVERNED_SERVICE_PRICE','RULED')),
 min_quantity numeric check (min_quantity is null or min_quantity > 0), max_quantity numeric check (max_quantity is null or max_quantity >= min_quantity),
 metadata jsonb not null default '{}'::jsonb, effective_from timestamptz not null default now(), effective_to timestamptz,
 created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
 unique(parent_service_id,addon_service_id,channel_code,jurisdiction_code)
);
alter table public.dd_governed_packages enable row level security;
alter table public.dd_governed_package_components enable row level security;
alter table public.dd_service_addon_rules enable row level security;
-- Deliberately no public/authenticated mutation policies. Server/service-role paths remain authority until activated.
