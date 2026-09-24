
alter table public.dd_service_components
  add column if not exists component_kind text not null default 'COST_INPUT';

alter table public.dd_service_components
  drop constraint if exists dd_service_components_kind_chk;
alter table public.dd_service_components
  add constraint dd_service_components_kind_chk
  check (component_kind in ('COST_INPUT','SCOPE_UNIT','JOB_CHARGE','MODIFIER'));

comment on column public.dd_service_components.component_kind is
  'COST_INPUT = labor/material/travel unit used for costing. SCOPE_UNIT = customer-meaningful unit of work (e.g. Bathroom Deep). JOB_CHARGE = once-per-work-order charge (visit/dispatch). MODIFIER = condition adjustment (e.g. Pet Home). Component id and code are permanent; price changes go to dd_component_price_versions.';

create or replace function public.dd_guard_component_identity()
returns trigger language plpgsql set search_path = public as $$
begin
  if new.component_code is distinct from old.component_code then
    raise exception 'COMPONENT_CODE_IMMUTABLE: %', old.component_code;
  end if;
  if old.component_kind <> 'COST_INPUT'
     and new.component_kind is distinct from old.component_kind then
    raise exception 'COMPONENT_KIND_IMMUTABLE: %', old.component_code;
  end if;
  return new;
end $$;

drop trigger if exists trg_dd_guard_component_identity on public.dd_service_components;
create trigger trg_dd_guard_component_identity
  before update on public.dd_service_components
  for each row execute function public.dd_guard_component_identity();

create table if not exists public.dd_component_recipes (
  id uuid primary key default gen_random_uuid(),
  parent_component_id uuid not null references public.dd_service_components(id) on delete restrict,
  child_component_id  uuid not null references public.dd_service_components(id) on delete restrict,
  quantity numeric not null check (quantity > 0),
  quantity_basis text not null default 'PER_PARENT_UNIT'
    check (quantity_basis in ('PER_PARENT_UNIT','PER_ORDER')),
  evidence_status text not null default 'PROVISIONAL_ESTIMATE',
  effective_from timestamptz not null default now(),
  effective_to timestamptz,
  notes text,
  created_at timestamptz not null default now(),
  check (parent_component_id <> child_component_id)
);
create unique index if not exists dd_component_recipes_active_uq
  on public.dd_component_recipes(parent_component_id, child_component_id)
  where effective_to is null;
create index if not exists idx_dd_component_recipes_child on public.dd_component_recipes(child_component_id);

create or replace function public.dd_validate_recipe_kinds()
returns trigger language plpgsql set search_path = public as $$
declare pk text; ck text;
begin
  select component_kind into pk from public.dd_service_components where id = new.parent_component_id;
  select component_kind into ck from public.dd_service_components where id = new.child_component_id;
  if pk = 'COST_INPUT' then raise exception 'RECIPE_PARENT_MUST_NOT_BE_COST_INPUT'; end if;
  if ck <> 'COST_INPUT' then raise exception 'RECIPE_CHILD_MUST_BE_COST_INPUT'; end if;
  return new;
end $$;
drop trigger if exists trg_dd_validate_recipe_kinds on public.dd_component_recipes;
create trigger trg_dd_validate_recipe_kinds
  before insert or update on public.dd_component_recipes
  for each row execute function public.dd_validate_recipe_kinds();

create table if not exists public.dd_component_price_versions (
  id uuid primary key default gen_random_uuid(),
  component_id uuid not null references public.dd_service_components(id) on delete restrict,
  version integer not null check (version > 0),
  price_status text not null check (price_status in ('PROVISIONAL','CALIBRATING','GOVERNED','RETIRED')),
  channel_code text,
  pricing_basis text not null default 'FLAT' check (pricing_basis in ('FLAT','PERCENT_OF_SCOPE_LABOR')),
  standalone_price_cents integer check (standalone_price_cents >= 0),
  bundled_price_cents integer check (bundled_price_cents >= 0),
  percent_value numeric check (percent_value >= 0),
  estimated_minutes numeric check (estimated_minutes >= 0),
  observation_count integer not null default 0 check (observation_count >= 0),
  evidence_status text not null default 'PROVISIONAL_ESTIMATE',
  source_reference text,
  effective_from timestamptz not null default now(),
  effective_to timestamptz,
  superseded_by uuid references public.dd_component_price_versions(id),
  created_at timestamptz not null default now(),
  unique (component_id, version),
  check (pricing_basis <> 'FLAT' or bundled_price_cents is not null or standalone_price_cents is not null),
  check (pricing_basis <> 'PERCENT_OF_SCOPE_LABOR' or percent_value is not null)
);
create unique index if not exists dd_component_price_versions_one_open_uq
  on public.dd_component_price_versions(component_id, coalesce(channel_code,'*'))
  where effective_to is null;
create index if not exists idx_dd_component_price_versions_superseded_by on public.dd_component_price_versions(superseded_by);

create or replace function public.dd_guard_price_version_immutable()
returns trigger language plpgsql set search_path = public as $$
begin
  if (to_jsonb(new) - array['effective_to','superseded_by','price_status'])
     is distinct from (to_jsonb(old) - array['effective_to','superseded_by','price_status']) then
    raise exception 'PRICE_VERSION_IMMUTABLE: create a new version instead';
  end if;
  if new.price_status <> old.price_status and new.price_status <> 'RETIRED' then
    raise exception 'PRICE_STATUS_CHANGE_REQUIRES_NEW_VERSION';
  end if;
  return new;
end $$;
drop trigger if exists trg_dd_guard_price_version_immutable on public.dd_component_price_versions;
create trigger trg_dd_guard_price_version_immutable
  before update on public.dd_component_price_versions
  for each row execute function public.dd_guard_price_version_immutable();

create table if not exists public.dd_component_composition_rules (
  id uuid primary key default gen_random_uuid(),
  rule_code text not null unique,
  rule_type text not null check (rule_type in ('REQUIRED_PER_ORDER','ONE_PER_ORDER','MAX_QUANTITY','MUTUALLY_EXCLUSIVE','REQUIRES','MODIFIER_APPLIES_TO','MANUAL_REVIEW_TRIGGER')),
  subject_component_id uuid not null references public.dd_service_components(id) on delete restrict,
  object_component_id uuid references public.dd_service_components(id) on delete restrict,
  parameters jsonb not null default '{}'::jsonb,
  severity text not null default 'BLOCK' check (severity in ('BLOCK','WARN','REVIEW')),
  is_active boolean not null default true,
  rationale text,
  created_at timestamptz not null default now()
);
create index if not exists idx_dd_component_rules_subject on public.dd_component_composition_rules(subject_component_id);
create index if not exists idx_dd_component_rules_object on public.dd_component_composition_rules(object_component_id);

create table if not exists public.dd_customer_travel_policies (
  id uuid primary key default gen_random_uuid(),
  policy_code text not null unique,
  included_miles numeric not null check (included_miles >= 0),
  distance_basis text not null default 'ONE_WAY' check (distance_basis in ('ONE_WAY','ROUND_TRIP')),
  charge_per_mile_beyond_cents integer not null check (charge_per_mile_beyond_cents >= 0),
  evidence_status text not null,
  source_reference text,
  status text not null default 'ACTIVE',
  effective_from timestamptz not null default now(),
  effective_to timestamptz,
  created_at timestamptz not null default now()
);

comment on column public.dd_provider_travel_policies.cents_per_mile is
  'MISNAMED: value is DOLLARS per mile (e.g. 0.76 = IRS 2026 H2). DB reader dd_finalize_provider_route_offer multiplies by it as dollars. Do not rename or rescale until all application readers are audited.';

alter table public.dd_component_recipes enable row level security;
alter table public.dd_component_price_versions enable row level security;
alter table public.dd_component_composition_rules enable row level security;
alter table public.dd_customer_travel_policies enable row level security;
