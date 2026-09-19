
alter table private.dd_master_service_universe_reconciliation
  drop constraint dd_master_service_universe_reconciliation_evidence_status_check;

alter table private.dd_master_service_universe_reconciliation
  add constraint dd_master_service_universe_reconciliation_evidence_status_check
  check (evidence_status in (
    'CAPABILITY_GAP_CANDIDATE',
    'EVIDENCE_QUALITY_REVIEW',
    'ECOSYSTEM_REVIEW',
    'DANI_CAPABILITY_AUTHORITY',
    'HISTORICAL_PACKAGE_REVIEW'
  ));

create table private.dd_master_service_universe_catalog_capability_evidence (
  reconciliation_id uuid not null references private.dd_master_service_universe_reconciliation(id) on delete cascade,
  catalog_provider_capability_id uuid not null unique references private.dd_catalog_provider_capability_master(id) on delete restrict,
  created_at timestamptz not null default now(),
  primary key (reconciliation_id, catalog_provider_capability_id)
);

create table private.dd_master_service_universe_legacy_package_evidence (
  reconciliation_id uuid not null references private.dd_master_service_universe_reconciliation(id) on delete cascade,
  service_package_id uuid not null unique references public.dd_service_packages(id) on delete restrict,
  created_at timestamptz not null default now(),
  primary key (reconciliation_id, service_package_id)
);

with source_rows as (
  select
    id,
    'dani-capability:' || lower(capability_key) as reconciliation_key,
    capability_key as display_name,
    division_id::text as prospective_division_code,
    eligibility_status,
    scope_boundary,
    required_qualification,
    equipment_dependency,
    source_authority,
    notes
  from private.dd_catalog_provider_capability_master
),
aggregated as (
  select
    reconciliation_key,
    min(display_name) as display_name,
    min(prospective_division_code) as prospective_division_code,
    string_agg(distinct 'Eligibility: ' || eligibility_status, ' | ') as eligibility_notes,
    string_agg(distinct 'Scope: ' || scope_boundary, ' | ') as scope_notes,
    string_agg(distinct 'Qualification: ' || required_qualification, ' | ') as qualification_notes,
    string_agg(distinct 'Equipment: ' || equipment_dependency, ' | ') as equipment_notes,
    string_agg(distinct 'Authority: ' || source_authority, ' | ') as authority_notes,
    string_agg(distinct notes, ' | ') filter (where notes is not null and notes <> '') as source_notes
  from source_rows
  group by reconciliation_key
),
upserted as (
  insert into private.dd_master_service_universe_reconciliation (
    capability_key, display_name, source_direction, source_type, evidence_status,
    prospective_division_code, commercial_decision, recommended_commercial_form,
    fulfillment_mode, provider_authorization_status, provider_evidence_count,
    provider_count, reconciliation_notes
  )
  select
    reconciliation_key,
    display_name,
    'DANI_TOP_DOWN',
    'DANI_CAPABILITY_ARCHITECTURE',
    'DANI_CAPABILITY_AUTHORITY',
    prospective_division_code,
    'PENDING_SERVICE_DECOMPOSITION',
    'CAPABILITY_FAMILY',
    'DANI_CONTROLLED_MIXED_FULFILLMENT',
    'PENDING_CAPABILITY_AUTHORIZATION',
    0,
    0,
    concat_ws(' | ', eligibility_notes, scope_notes, qualification_notes, equipment_notes, authority_notes, source_notes)
  from aggregated
  on conflict (capability_key) do update set
    display_name = excluded.display_name,
    prospective_division_code = excluded.prospective_division_code,
    reconciliation_notes = excluded.reconciliation_notes,
    updated_at = now()
  returning id, capability_key
)
insert into private.dd_master_service_universe_catalog_capability_evidence (
  reconciliation_id, catalog_provider_capability_id
)
select u.id, s.id
from source_rows s
join upserted u on u.capability_key = s.reconciliation_key
on conflict (catalog_provider_capability_id) do nothing;

with source_rows as (
  select
    id,
    'legacy-package:' || lower(package_slug) as reconciliation_key,
    coalesce(nullif(public_name, ''), package_name) as display_name,
    division_slug,
    category,
    pricing_model,
    status_boundary,
    is_public,
    is_active
  from public.dd_service_packages
),
aggregated as (
  select
    reconciliation_key,
    min(display_name) as display_name,
    min(division_slug) as division_slug,
    min(category) as category,
    string_agg(distinct 'Pricing model: ' || pricing_model, ' | ') as pricing_notes,
    string_agg(distinct 'Status boundary: ' || status_boundary, ' | ') as status_notes,
    string_agg(distinct 'Public: ' || is_public::text, ' | ') as public_notes,
    string_agg(distinct 'Active: ' || is_active::text, ' | ') as active_notes
  from source_rows
  group by reconciliation_key
),
upserted as (
  insert into private.dd_master_service_universe_reconciliation (
    capability_key, display_name, source_direction, source_type, evidence_status,
    prospective_division_code, prospective_service_family, commercial_decision,
    recommended_commercial_form, fulfillment_mode, provider_authorization_status,
    provider_evidence_count, provider_count, reconciliation_notes
  )
  select
    reconciliation_key,
    display_name,
    'DANI_LEGACY_ARCHIVE',
    'LEGACY_SERVICE_PACKAGE',
    'HISTORICAL_PACKAGE_REVIEW',
    division_slug,
    category,
    'PENDING_HISTORICAL_RECONCILIATION',
    case when category in ('retainer', 'B2B-APT-RETAINER') then 'RETAINER' else 'PACKAGE' end,
    'NOT_DETERMINED',
    'NOT_AUTHORIZED',
    0,
    0,
    concat_ws(' | ', 'Legacy package key: ' || reconciliation_key, pricing_notes, status_notes, public_notes, active_notes)
  from aggregated
  on conflict (capability_key) do update set
    display_name = excluded.display_name,
    prospective_division_code = excluded.prospective_division_code,
    prospective_service_family = excluded.prospective_service_family,
    reconciliation_notes = excluded.reconciliation_notes,
    updated_at = now()
  returning id, capability_key
)
insert into private.dd_master_service_universe_legacy_package_evidence (
  reconciliation_id, service_package_id
)
select u.id, s.id
from source_rows s
join upserted u on u.capability_key = s.reconciliation_key
on conflict (service_package_id) do nothing;
