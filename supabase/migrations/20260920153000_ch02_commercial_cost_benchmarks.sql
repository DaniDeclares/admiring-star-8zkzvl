create table if not exists public.dd_commercial_cost_benchmarks (
  id uuid primary key default gen_random_uuid(),
  channel_code text not null,
  cost_pool text not null check (cost_pool in ('DIRECT_COGS','OPERATING_OVERHEAD','CORPORATE_GA')),
  category text not null,
  lower_percent numeric(6,3),
  upper_percent numeric(6,3),
  benchmark_percent numeric(6,3),
  source_type text not null,
  source_reference text not null,
  source_date date,
  governance_status text not null default 'REFERENCE_ONLY',
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(channel_code,cost_pool,category,source_type)
);

insert into public.dd_commercial_cost_benchmarks
(channel_code,cost_pool,category,lower_percent,upper_percent,benchmark_percent,source_type,source_reference,source_date,governance_status,notes)
values
('CH02','DIRECT_COGS','Fully loaded direct labor',45,55,48,'USER_PROVIDED_BENCHMARK','Commercial B2B Cost Structure Analysis supplied 2026-09-20',date '2026-09-20','REFERENCE_ONLY','Internal underwriting reference; not a customer price rule. External BSCAI/ISSA research independently supports labor as the dominant cost component, but not this exact 45%-55% range.'),
('CH02','DIRECT_COGS','Consumables and specialized materials',3,6,6,'USER_PROVIDED_BENCHMARK','Commercial B2B Cost Structure Analysis supplied 2026-09-20',date '2026-09-20','REFERENCE_ONLY','Internal underwriting reference; not a customer price rule.'),
('CH02','DIRECT_COGS','Disposal and tipping fees',2,4,null,'USER_PROVIDED_BENCHMARK','Commercial B2B Cost Structure Analysis supplied 2026-09-20',date '2026-09-20','REFERENCE_ONLY','Internal underwriting reference; apply only when disposal is actually incurred/pass-through.'),
('CH02','OPERATING_OVERHEAD','Insurance and risk',5,8,6.5,'USER_PROVIDED_BENCHMARK','Commercial B2B Cost Structure Analysis supplied 2026-09-20',date '2026-09-20','REFERENCE_ONLY','Internal underwriting reference; actual insurance allocation must come from DANI records.'),
('CH02','OPERATING_OVERHEAD','Fleet, fuel and mobilization',4,7,5.5,'USER_PROVIDED_BENCHMARK','Commercial B2B Cost Structure Analysis supplied 2026-09-20',date '2026-09-20','REFERENCE_ONLY','Internal underwriting reference; market/trip economics remain separate pricing dimensions.'),
('CH02','OPERATING_OVERHEAD','Equipment depreciation',2,4,2.5,'USER_PROVIDED_BENCHMARK','Commercial B2B Cost Structure Analysis supplied 2026-09-20',date '2026-09-20','REFERENCE_ONLY','Internal underwriting reference; actual equipment economics must be reconciled to owned/leased assets.'),
('CH02','CORPORATE_GA','Software and CRM infrastructure',4,6,4.5,'USER_PROVIDED_BENCHMARK','Commercial B2B Cost Structure Analysis supplied 2026-09-20',date '2026-09-20','REFERENCE_ONLY','Internal underwriting reference; actual software allocation comes from DANI expense records.'),
('CH02','CORPORATE_GA','Accounts payable and invoicing administration',3,5,3,'USER_PROVIDED_BENCHMARK','Commercial B2B Cost Structure Analysis supplied 2026-09-20',date '2026-09-20','REFERENCE_ONLY','Internal underwriting reference; transaction fees should be reconciled to actual processor costs.'),
('CH02','CORPORATE_GA','Cyber liability and administrative insurance',1,2,null,'USER_PROVIDED_BENCHMARK','Commercial B2B Cost Structure Analysis supplied 2026-09-20',date '2026-09-20','REFERENCE_ONLY','Internal underwriting reference; actual policy allocation comes from DANI records.')
on conflict (channel_code,cost_pool,category,source_type) do update set
 lower_percent=excluded.lower_percent,
 upper_percent=excluded.upper_percent,
 benchmark_percent=excluded.benchmark_percent,
 source_reference=excluded.source_reference,
 source_date=excluded.source_date,
 governance_status=excluded.governance_status,
 notes=excluded.notes,
 updated_at=now();

comment on table public.dd_commercial_cost_benchmarks is 'Internal commercial underwriting reference ranges. Never used as public customer pricing. External sources and actual DANI cost evidence must be kept distinct from user-provided benchmark inputs.';
