create table if not exists private.dd_provider_capability_reconciliation (
  id uuid primary key default gen_random_uuid(),
  provider_service_universe_id uuid not null references public.dd_provider_service_universe(id) on delete cascade,
  provider_id uuid not null,
  provider_code text not null,
  provider_name text not null,
  source_capability_evidence text,
  source_service_evidence text,
  canonical_division_code text not null,
  canonical_capability_key text not null,
  mapping_type text not null check (mapping_type in ('DIRECT','COMPOSITE_SPLIT','EVIDENCE_ONLY','CAPABILITY_GAP','ECOSYSTEM_ONLY')),
  confidence text not null check (confidence in ('HIGH','MEDIUM','LOW')),
  commercial_relevance text not null check (commercial_relevance in ('CORE','ADD_ON','FULFILLMENT','REFERRAL','NOT_COMMERCIAL')),
  qualification_gate text,
  mapping_rationale text not null,
  created_at timestamptz not null default now(),
  unique(provider_service_universe_id, canonical_capability_key)
);
create index if not exists idx_dd_pcr_capability on private.dd_provider_capability_reconciliation(canonical_capability_key);
create index if not exists idx_dd_pcr_division on private.dd_provider_capability_reconciliation(canonical_division_code);
create index if not exists idx_dd_pcr_provider on private.dd_provider_capability_reconciliation(provider_id);