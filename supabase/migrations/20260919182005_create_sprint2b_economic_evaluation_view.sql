
create or replace view public.vw_sprint2b_economic_evaluation as
with target as (
  select *
  from public.dd_master_service_universe
  where canonical_sku in (
    'DNI-02A-007','DNI-02A-008','DNI-02A-013','DNI-02A-014',
    'DNI-04A-001','DNI-04A-002','DNI-04A-003','DNI-04A-004','DNI-04A-005',
    'DNI-04A-006','DNI-04A-007','DNI-04A-008','DNI-04A-009','DNI-04A-010',
    'DNI-04A-011','DNI-04A-012','DNI-04A-013','DNI-04A-014','DNI-04A-015',
    'DNI-04A-016','DNI-04A-017','DNI-04A-018','DNI-04A-019','DNI-04A-020'
  )
),
parsed as (
  select
    t.*,
    nullif(substring(t.internal_cost from '([0-9]+(\.[0-9]+)?)\s*hrs?'), '')::numeric as draft_hours,
    nullif(substring(t.internal_cost from '\+\s*~?\$([0-9]+(\.[0-9]+)?)\s*(materials|parts)'), '')::numeric as stated_materials,
    nullif(substring(t.margin_economics from 'owner-approved lock \(\$([0-9]+(\.[0-9]+)?)\)'), '')::numeric as owner_approved_price_from_note,
    nullif(substring(t.margin_economics from 'owner-approved lock \(\$([0-9]+(\.[0-9]+)?)\)'), '')::numeric as note_price
  from target t
)
select
  p.canonical_sku as sku,
  p.service_name,
  p.customer_price,
  p.internal_cost,
  p.margin_economics,
  p.draft_hours,
  coalesce(p.stated_materials,0) as stated_materials,
  30.00::numeric as owner_labor_rate,
  round((p.draft_hours * 30.00)::numeric,2) as owner_labor_cost,
  round((p.draft_hours * 30.00 + coalesce(p.stated_materials,0))::numeric,2) as owner_floor_direct_cost,
  round((2 * (p.draft_hours * 30.00 + coalesce(p.stated_materials,0)))::numeric,2) as owner_floor_50_margin_minimum,
  p.owner_approved_price_from_note,
  case
    when p.canonical_sku like 'DNI-04A-%' then 'REMOTE_OR_BLOCK_SCOPED'
    else 'FIELD_TRAVEL_NOT_INCLUDED_IN_THIS_SCENARIO'
  end as travel_treatment,
  case
    when p.canonical_sku like 'DNI-04A-%' then 'NO_TIMED_DANI_JOB_EVIDENCE'
    else 'NO_TIMED_DANI_JOB_EVIDENCE'
  end as duration_evidence_status,
  'SCENARIO_ONLY_NOT_AUDITED'::text as evaluation_status,
  'Draft hours are parsed from the legacy narrative only. This view does not promote them to audited economics and excludes unverified travel, dispatch, pass-through, software, equipment, and other direct costs.'::text as evaluation_note
from parsed p;
