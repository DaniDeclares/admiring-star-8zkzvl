-- Provider payout bands and researched provisional economics.
-- No payout values are seeded by this migration.

alter table public.dd_component_cost_baselines drop constraint if exists dd_component_cost_evidence_chk;
alter table public.dd_component_cost_baselines add constraint dd_component_cost_evidence_chk check (evidence_status in ('UNRESOLVED','RESEARCH_BENCHMARK','OWNER_CONFIRMED','DOCUMENT_EVIDENCE','SYSTEM_VERIFIED','EXTERNAL_VERIFIED'));
alter table public.dd_economic_policies drop constraint if exists dd_economic_policy_evidence_chk;
alter table public.dd_economic_policies add constraint dd_economic_policy_evidence_chk check (evidence_status in ('UNRESOLVED','RESEARCH_BENCHMARK','OWNER_CONFIRMED','DOCUMENT_EVIDENCE','SYSTEM_VERIFIED','EXTERNAL_VERIFIED'));
alter table public.dd_provider_compensation_rules drop constraint if exists dd_provider_comp_rules_evidence_chk;
alter table public.dd_provider_compensation_rules add constraint dd_provider_comp_rules_evidence_chk check (evidence_status in ('UNRESOLVED','RESEARCH_BENCHMARK','OWNER_CONFIRMED','DOCUMENT_EVIDENCE','SYSTEM_VERIFIED','EXTERNAL_VERIFIED'));
alter table public.dd_owner_compensation_rules drop constraint if exists dd_owner_comp_rules_evidence_chk;
alter table public.dd_owner_compensation_rules add constraint dd_owner_comp_rules_evidence_chk check (evidence_status in ('UNRESOLVED','RESEARCH_BENCHMARK','OWNER_CONFIRMED','DOCUMENT_EVIDENCE','SYSTEM_VERIFIED','EXTERNAL_VERIFIED'));

create table if not exists public.dd_provider_payout_bands (
  id uuid primary key default gen_random_uuid(),
  provider_id uuid references public.dd_providers(id) on delete cascade,
  service_id uuid not null references public.services(id) on delete cascade,
  component_id uuid references public.dd_service_components(id) on delete cascade,
  compensation_type text not null default 'NEGOTIATED_PROJECT',
  initial_offer_amount numeric not null,
  target_payout_amount numeric not null,
  maximum_payout_amount numeric not null,
  currency text not null default 'USD',
  equipment_basis text not null default 'DANI_SUPPLIED',
  material_basis text not null default 'DANI_SUPPLIED',
  evidence_status text not null default 'UNRESOLVED',
  source_type text,
  source_reference text,
  escalation_policy jsonb not null default '{"mode":"MANUAL","auto_step_up":false}'::jsonb,
  status text not null default 'DRAFT',
  effective_from timestamptz not null default now(),
  effective_to timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint dd_provider_payout_band_order_chk check (initial_offer_amount >= 0 and target_payout_amount >= initial_offer_amount and maximum_payout_amount >= target_payout_amount),
  constraint dd_provider_payout_band_status_chk check (status in ('DRAFT','ACTIVE','PAUSED','RETIRED')),
  constraint dd_provider_payout_band_evidence_chk check (evidence_status in ('UNRESOLVED','RESEARCH_BENCHMARK','OWNER_CONFIRMED','DOCUMENT_EVIDENCE','SYSTEM_VERIFIED','EXTERNAL_VERIFIED')),
  constraint dd_provider_payout_band_equipment_chk check (equipment_basis in ('DANI_SUPPLIED','PROVIDER_SUPPLIED','MIXED','NOT_APPLICABLE')),
  constraint dd_provider_payout_band_material_chk check (material_basis in ('DANI_SUPPLIED','PROVIDER_SUPPLIED','REIMBURSED_APPROVED_COST','INCLUDED_IN_PAYOUT','MIXED','NOT_APPLICABLE'))
);
create index if not exists idx_dd_provider_payout_bands_lookup on public.dd_provider_payout_bands(service_id,component_id,provider_id,status,effective_from desc);
alter table public.dd_provider_payout_bands enable row level security;
revoke all on public.dd_provider_payout_bands from anon, authenticated;
grant select,insert,update,delete on public.dd_provider_payout_bands to service_role;

alter table public.dd_estimate_assignment_offers
  add column if not exists initial_offer_amount numeric,
  add column if not exists target_payout_amount numeric,
  add column if not exists maximum_payout_amount numeric,
  add column if not exists economic_ceiling_amount numeric,
  add column if not exists budgeted_provider_cost numeric,
  add column if not exists payout_band_snapshot jsonb not null default '{}'::jsonb;
