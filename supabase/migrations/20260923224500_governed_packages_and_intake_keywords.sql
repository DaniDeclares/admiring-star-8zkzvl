-- Slice 1 of the Quote Builder / commercial composition engine work
-- (see /mnt/project-files/quote-builder/quote-builder-audit-2026-09-23.md).
--
-- Additive only. Creates the governed "package" commercial object as its own object
-- type, distinct from dd_service_package_components (which is a fulfillment BOM for
-- provider payout economics, not customer-facing pricing -- do not confuse the two).
-- No row here makes anything sellable: every package is created HOLD and only becomes
-- SELL_NOW when commercial authority explicitly authorizes it, same discipline as
-- dd_governed_service_offers.

create table if not exists public.dd_governed_packages (
  id uuid primary key default gen_random_uuid(),
  package_code text not null unique,
  package_name text not null,
  division text,
  commercial_offer_status text not null default 'HOLD'
    check (commercial_offer_status in ('SELL_NOW','HOLD','INTAKE_ONLY','DO_NOT_SELL')),
  package_price_cents integer,
  pricing_type text not null default 'FIXED_PACKAGE'
    check (pricing_type in ('FIXED_PACKAGE','SUM_OF_COMPONENTS')),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_dd_governed_packages_status on public.dd_governed_packages(commercial_offer_status);

create table if not exists public.dd_governed_package_components (
  id uuid primary key default gen_random_uuid(),
  package_id uuid not null references public.dd_governed_packages(id) on delete cascade,
  canonical_sku text not null,
  quantity integer not null default 1,
  is_required boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  unique(package_id, canonical_sku)
);
create index if not exists idx_dd_governed_package_components_package on public.dd_governed_package_components(package_id);
create index if not exists idx_dd_governed_package_components_sku on public.dd_governed_package_components(canonical_sku);

comment on table public.dd_governed_packages is 'Named, governed commercial packages with their own price/economics distinct from the sum of their component services. Created empty by this migration -- a package only becomes sellable when commercial authority sets commercial_offer_status = SELL_NOW. Do not confuse with dd_service_package_components, which is a fulfillment BOM for provider payout, not customer pricing.';
comment on table public.dd_governed_package_components is 'Canonical SKUs that compose a governed package. canonical_sku is validated against dd_governed_service_offers at the application layer (Quote Builder / scope composer), matching the existing dd_service_package_components convention rather than adding a new FK to keep this additive.';

-- A canonical service can be sold standalone (existing dd_governed_service_offers /
-- services pricing, unchanged) AND separately be eligible as an add-on with its own,
-- typically lower, governed price when attached to another service or package -- without
-- duplicating the underlying service identity. One canonical_sku can have zero, one, or
-- (if eligibility differs by parent) more than one add-on pricing row.
create table if not exists public.dd_service_addon_rules (
  id uuid primary key default gen_random_uuid(),
  canonical_sku text not null,
  addon_price_cents integer not null,
  status text not null default 'HOLD' check (status in ('SELL_NOW','HOLD','DO_NOT_SELL')),
  eligible_parent_skus text[],
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_dd_service_addon_rules_sku on public.dd_service_addon_rules(canonical_sku);
create index if not exists idx_dd_service_addon_rules_status on public.dd_service_addon_rules(status);
comment on table public.dd_service_addon_rules is 'Add-on-role governed pricing for a canonical_sku that already exists in dd_governed_service_offers/services as a standalone service. Distinct commercial identity (price/eligibility), same underlying service record -- Quote Builder resolves whichever price applies based on the line item''s componentRole (STANDALONE vs ADD_ON). eligible_parent_skus NULL means eligible as an add-on to any SELL_NOW parent/package; a non-null array restricts it. Created empty -- an add-on price only applies once explicitly authorized (status = SELL_NOW).';

-- Optional keyword hints a service can declare for the Live Discovery scope-composer
-- (src/lib/operations/scopeComposer2026.js) to match customer language against, beyond
-- just its name/family. Nullable and additive: absence changes nothing about existing
-- pricing, checkout or catalog behavior. Never authoritative on its own -- every match it
-- powers is surfaced as a human-reviewed candidate, not an auto-added line item.
alter table public.services add column if not exists intake_keywords text[];
comment on column public.services.intake_keywords is 'Optional free-text phrases the Live Discovery scope-composer matches against raw customer language to suggest this service as a candidate. Never authoritative on its own.';
