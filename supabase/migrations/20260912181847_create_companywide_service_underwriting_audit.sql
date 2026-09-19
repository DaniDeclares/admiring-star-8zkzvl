create table if not exists public.dd_service_underwriting_audit (
  id uuid primary key default gen_random_uuid(),
  canonical_sku text not null,
  division text not null,
  service_family text,
  service_name text not null,
  lifecycle_status text,
  customer_price_present boolean not null default false,
  internal_cost_present boolean not null default false,
  provider_payout_present boolean not null default false,
  margin_economics_present boolean not null default false,
  scope_present boolean not null default false,
  exclusions_present boolean not null default false,
  sop_present boolean not null default false,
  workflow_present boolean not null default false,
  qa_present boolean not null default false,
  intake_present boolean not null default false,
  compliance_present boolean not null default false,
  channel_rules_present_count integer not null default 0,
  pricing_rule_count integer not null default 0,
  market_rule_count integer not null default 0,
  capability_requirement_count integer not null default 0,
  underwriting_status text not null,
  next_action text not null,
  audit_version text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(canonical_sku, audit_version)
);

create index if not exists idx_dd_service_underwriting_audit_division on public.dd_service_underwriting_audit(division);
create index if not exists idx_dd_service_underwriting_audit_status on public.dd_service_underwriting_audit(underwriting_status);

insert into public.dd_service_underwriting_audit (
  canonical_sku, division, service_family, service_name, lifecycle_status,
  customer_price_present, internal_cost_present, provider_payout_present, margin_economics_present,
  scope_present, exclusions_present, sop_present, workflow_present, qa_present, intake_present, compliance_present,
  channel_rules_present_count, pricing_rule_count, market_rule_count, capability_requirement_count,
  underwriting_status, next_action, audit_version
)
select
  m.canonical_sku, m.division, m.service_family, m.service_name, m.lifecycle_status,
  (nullif(btrim(m.customer_price),'') is not null),
  (nullif(btrim(m.internal_cost),'') is not null),
  (nullif(btrim(m.provider_payout),'') is not null),
  (nullif(btrim(m.margin_economics),'') is not null),
  (nullif(btrim(m.scope),'') is not null),
  (nullif(btrim(m.exclusions),'') is not null),
  (nullif(btrim(m.sop),'') is not null),
  (nullif(btrim(m.workflow),'') is not null),
  (nullif(btrim(m.qa),'') is not null),
  (nullif(btrim(m.intake_requirements),'') is not null),
  (nullif(btrim(m.compliance_legal_boundaries),'') is not null),
  ((case when nullif(btrim(m.ch01_rule),'') is not null then 1 else 0 end) +
   (case when nullif(btrim(m.ch02_rule),'') is not null then 1 else 0 end) +
   (case when nullif(btrim(m.ch03_rule),'') is not null then 1 else 0 end) +
   (case when nullif(btrim(m.ch04_rule),'') is not null then 1 else 0 end) +
   (case when nullif(btrim(m.ch05_rule),'') is not null then 1 else 0 end)),
  coalesce((select count(*) from public.dd_service_pricing_rules p where p.service_id=m.id),0),
  coalesce((select count(*) from public.dd_service_market_pricing_rules mp where mp.service_id=m.id),0),
  coalesce((select count(*) from public.dd_service_capability_requirements cr where cr.canonical_sku=m.canonical_sku),0),
  case
    when m.lifecycle_status <> 'CANONICAL_ACTIVE' then 'NOT_ACTIVE'
    when nullif(btrim(m.internal_cost),'') is not null
      and nullif(btrim(m.provider_payout),'') is not null
      and nullif(btrim(m.margin_economics),'') is not null
      and nullif(btrim(m.customer_price),'') is not null
      and nullif(btrim(m.sop),'') is not null
      and nullif(btrim(m.workflow),'') is not null
      and nullif(btrim(m.qa),'') is not null
      and nullif(btrim(m.intake_requirements),'') is not null
      and nullif(btrim(m.compliance_legal_boundaries),'') is not null
    then 'ECONOMICS_AND_EXECUTION_EVIDENCE_PRESENT'
    else 'UNDERWRITING_REQUIRED'
  end,
  case
    when m.lifecycle_status <> 'CANONICAL_ACTIVE' then 'No commercial action; preserve lifecycle history.'
    when nullif(btrim(m.internal_cost),'') is null then 'Capture actual labor/material/travel/equipment/overhead economics.'
    when nullif(btrim(m.provider_payout),'') is null then 'Validate owner-direct economics or contracted provider payout basis.'
    when nullif(btrim(m.margin_economics),'') is null then 'Calculate gross profit and margin from verified economics.'
    when nullif(btrim(m.sop),'') is null or nullif(btrim(m.workflow),'') is null or nullif(btrim(m.qa),'') is null then 'Complete execution SOP/workflow/QA evidence.'
    when nullif(btrim(m.intake_requirements),'') is null then 'Complete intake requirements.'
    when nullif(btrim(m.compliance_legal_boundaries),'') is null then 'Complete compliance/legal boundary review.'
    when ((case when nullif(btrim(m.ch01_rule),'') is not null then 1 else 0 end) + (case when nullif(btrim(m.ch02_rule),'') is not null then 1 else 0 end) + (case when nullif(btrim(m.ch03_rule),'') is not null then 1 else 0 end) + (case when nullif(btrim(m.ch04_rule),'') is not null then 1 else 0 end) + (case when nullif(btrim(m.ch05_rule),'') is not null then 1 else 0 end)) < 5 then 'Complete five-channel applicability rules; do not invent prices where not supported.'
    else 'Review for PASS 1 approval using evidence-backed pricing and scope.'
  end,
  '2026-09-12-PASS2'
from public.dd_master_service_universe m
where m.lifecycle_status='CANONICAL_ACTIVE'
on conflict (canonical_sku, audit_version) do update set
  division=excluded.division, service_family=excluded.service_family, service_name=excluded.service_name,
  lifecycle_status=excluded.lifecycle_status,
  customer_price_present=excluded.customer_price_present, internal_cost_present=excluded.internal_cost_present,
  provider_payout_present=excluded.provider_payout_present, margin_economics_present=excluded.margin_economics_present,
  scope_present=excluded.scope_present, exclusions_present=excluded.exclusions_present,
  sop_present=excluded.sop_present, workflow_present=excluded.workflow_present, qa_present=excluded.qa_present,
  intake_present=excluded.intake_present, compliance_present=excluded.compliance_present,
  channel_rules_present_count=excluded.channel_rules_present_count, pricing_rule_count=excluded.pricing_rule_count,
  market_rule_count=excluded.market_rule_count, capability_requirement_count=excluded.capability_requirement_count,
  underwriting_status=excluded.underwriting_status, next_action=excluded.next_action, updated_at=now();

alter table public.dd_service_underwriting_audit enable row level security;
revoke all on public.dd_service_underwriting_audit from anon, authenticated;
