-- PROPOSED, NOT APPLIED. Versioned, tier-aware theoretical baselines. Historical rows are never rewritten.
-- Authority for the purpose of each rate:
--   DEC-LABOR-001 (APPROVED 2026-09-01, owner): $60 / $75 / $100 per hour are INTERNAL DIRECT-FULFILLMENT LABOR COST rates
--   (economic metrics for owner-operated work). They are not wages, retail prices, or provider payout rates.
--   Provider-led cost therefore comes from provider payout evidence (dd_provider_payout_bands / work-order payout), never from the tier card.
--   The $30 legacy value came from LEGACY_NARRATIVE_PARSED baselines; the one AUDITED baseline carries $23.40. Both stay as history.
-- Additive columns (defaults keep every existing row valid as version 1, legacy):
alter table public.dd_service_economic_baselines
  add column if not exists baseline_version int not null default 1,
  add column if not exists labor_basis text not null default 'LEGACY_THEORETICAL_30',
  add column if not exists labor_tier text,
  add column if not exists fulfillment_path text,
  add column if not exists supersedes_baseline_id uuid references public.dd_service_economic_baselines(id),
  add column if not exists payout_band_id uuid;

alter table public.dd_service_economic_baselines
  add constraint dd_seb_labor_basis_chk check (labor_basis in ('LEGACY_THEORETICAL_30','AUDITED_RATE','OWNER_TIER_RATE','PROVIDER_PAYOUT_BAND')),
  add constraint dd_seb_labor_tier_chk check (labor_tier is null or labor_tier in ('TIER_1','TIER_2','TIER_3')),
  add constraint dd_seb_path_chk check (fulfillment_path is null or fulfillment_path in ('OWNER_FULL_EXECUTION','OWNER_COORDINATION_PROVIDER_LED','PROVIDER_LED')),
  -- a v2+ owner-tier baseline must carry the approved rate for its tier
  add constraint dd_seb_owner_tier_rate_chk check (labor_basis<>'OWNER_TIER_RATE'
     or (labor_tier is not null and baseline_version>=2 and labor_rate=case labor_tier when 'TIER_1' then 60 when 'TIER_2' then 75 else 100 end)),
  -- provider-led baselines must point at payout evidence
  add constraint dd_seb_provider_basis_chk check (labor_basis<>'PROVIDER_PAYOUT_BAND' or payout_band_id is not null);

-- the old one-theoretical-per-service rule becomes one-per-service-per-version; $30 stays enforced for LEGACY rows only
drop index if exists public.dd_service_economic_baselines_one_theoretical_per_service_idx;
create unique index if not exists dd_seb_one_theoretical_per_service_version_idx
  on public.dd_service_economic_baselines (master_service_id, baseline_version) where evidence_status='THEORETICAL_BASELINE';
alter table public.dd_service_economic_baselines drop constraint if exists dd_service_economic_baselines_theoretical_policy_chk;
alter table public.dd_service_economic_baselines add constraint dd_service_economic_baselines_theoretical_policy_chk
  check (evidence_status<>'THEORETICAL_BASELINE' or labor_basis<>'LEGACY_THEORETICAL_30' or labor_rate=30.00);

-- Current baseline = highest version per runtime service. The refresh picks it; v1 rows remain queryable.
create or replace view public.dd_service_economic_baseline_current_v1 with (security_invoker=true) as
select distinct on (runtime_service_id) * from public.dd_service_economic_baselines
where runtime_service_id is not null
order by runtime_service_id, baseline_version desc, updated_at desc;
-- dd_refresh_pricing_research_economics and dd_stage_tester_economics_evidence then join this view instead of the table
-- (one-line change each; applied only after review).
