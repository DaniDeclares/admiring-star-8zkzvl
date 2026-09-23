
create table private.dd_master_service_universe_reconciliation (
  id uuid primary key default gen_random_uuid(),
  capability_key text not null unique,
  display_name text not null,
  source_direction text not null default 'PROVIDER_DISCOVERY',
  source_type text not null default 'ATOMIC_PROVIDER_EVIDENCE',
  evidence_status text not null check (evidence_status in ('CAPABILITY_GAP_CANDIDATE', 'EVIDENCE_QUALITY_REVIEW', 'ECOSYSTEM_REVIEW')),
  prospective_division_code text,
  prospective_service_family text,
  existing_service_id uuid references public.services(id),
  existing_sku text,
  commercial_decision text not null default 'PENDING_COMMERCIAL_REVIEW',
  recommended_commercial_form text not null default 'PENDING_CLASSIFICATION',
  channel_mapping_status text not null default 'PENDING',
  fulfillment_mode text not null default 'THIRD_PARTY_PENDING_QUALIFICATION',
  provider_authorization_status text not null default 'NOT_AUTHORIZED',
  provider_evidence_count integer not null default 0,
  provider_count integer not null default 0,
  reconciliation_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (existing_service_id is null and existing_sku is null)
);

create table private.dd_master_service_universe_provider_evidence (
  reconciliation_id uuid not null references private.dd_master_service_universe_reconciliation(id) on delete cascade,
  provider_service_universe_id uuid not null unique references public.dd_provider_service_universe(id) on delete restrict,
  created_at timestamptz not null default now(),
  primary key (reconciliation_id, provider_service_universe_id)
);

with atomic as (
  select
    id,
    provider_id,
    service_evidence,
    matched_division,
    matched_service_family,
    lower(regexp_replace(trim(service_evidence), '\s+', ' ', 'g')) as capability_key
  from public.dd_provider_service_universe
  where notes = 'ATOMIC_SERVICE_EXTRACTED_FROM_COMPOSITE_PROVIDER_EVIDENCE'
),
classified as (
  select
    capability_key,
    min(service_evidence) as display_name,
    case
      when capability_key ~ '(capability not stated|exact act not identified|exact inventory to verify|exact services to verify|collaboration offered|messaged danielle|sent message|website shown|portfolio and packages|serves georgia|atlanta \+ travel|multi-state service|network source|national association|petals parchment|venue shown|southern vintage|knows custom|knows djs|breakdown|^setup$|check-in/pickup|vetted caregivers|^activities$|^favors$)'
        then 'EVIDENCE_QUALITY_REVIEW'
      else 'CAPABILITY_GAP_CANDIDATE'
    end as evidence_status,
    case when count(distinct matched_division) filter (where matched_division is not null) = 1
      then min(matched_division) filter (where matched_division is not null)
    end as prospective_division_code,
    case when count(distinct matched_service_family) filter (where matched_service_family is not null) = 1
      then min(matched_service_family) filter (where matched_service_family is not null)
    end as prospective_service_family,
    count(*)::integer as provider_evidence_count,
    count(distinct provider_id)::integer as provider_count
  from atomic
  group by capability_key
),
upserted as (
  insert into private.dd_master_service_universe_reconciliation (
    capability_key, display_name, evidence_status, prospective_division_code,
    prospective_service_family, provider_evidence_count, provider_count, reconciliation_notes
  )
  select
    capability_key, display_name, evidence_status, prospective_division_code,
    prospective_service_family, provider_evidence_count, provider_count,
    'Provider-discovery record. No DANI service, SKU, channel mapping, provider authorization, capacity, or economics created by this reconciliation.'
  from classified
  on conflict (capability_key) do update set
    display_name = excluded.display_name,
    evidence_status = excluded.evidence_status,
    prospective_division_code = excluded.prospective_division_code,
    prospective_service_family = excluded.prospective_service_family,
    provider_evidence_count = excluded.provider_evidence_count,
    provider_count = excluded.provider_count,
    updated_at = now()
  returning id, capability_key
)
insert into private.dd_master_service_universe_provider_evidence (
  reconciliation_id, provider_service_universe_id
)
select u.id, a.id
from atomic a
join upserted u using (capability_key)
on conflict (provider_service_universe_id) do nothing;

with atomic as (
  select
    id,
    lower(regexp_replace(trim(service_evidence), '\s+', ' ', 'g')) as capability_key
  from public.dd_provider_service_universe
  where notes = 'ATOMIC_SERVICE_EXTRACTED_FROM_COMPOSITE_PROVIDER_EVIDENCE'
),
classified as (
  select
    id,
    case
      when capability_key ~ '(capability not stated|exact act not identified|exact inventory to verify|exact services to verify|collaboration offered|messaged danielle|sent message|website shown|portfolio and packages|serves georgia|atlanta \+ travel|multi-state service|network source|national association|petals parchment|venue shown|southern vintage|knows custom|knows djs|breakdown|^setup$|check-in/pickup|vetted caregivers|^activities$|^favors$)'
        then 'EVIDENCE_QUALITY_REVIEW'
      else 'CAPABILITY_GAP_CANDIDATE'
    end as next_status
  from atomic
)
update public.dd_provider_service_universe p
set
  reconciliation_status = c.next_status,
  fulfillment_method = 'THIRD_PARTY_PENDING_QUALIFICATION',
  notes = p.notes || '; REGISTERED_IN_MASTER_SERVICE_UNIVERSE; NO_DANI_SERVICE_OR_SKU_CREATED',
  updated_at = now()
from classified c
where p.id = c.id
  and p.reconciliation_status = 'DIVISION_MAPPED_PENDING_SERVICE_NORMALIZATION';
