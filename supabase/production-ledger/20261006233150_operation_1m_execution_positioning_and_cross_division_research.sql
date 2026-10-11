
create table if not exists public.dd_brand_positioning_rules (
  rule_key text primary key,
  statement text not null,
  applies_to text not null,
  required boolean not null default true,
  rule_spec jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);
alter table public.dd_brand_positioning_rules enable row level security;

insert into public.dd_brand_positioning_rules(rule_key,statement,applies_to,required,rule_spec)
values
(
  'CORE_PROMISE',
  'We handle the execution.',
  'ALL_CHANNELS_ALL_DIVISIONS',
  true,
  jsonb_build_object(
    'meaning','Lead with the outcome DANI coordinates and executes, not a single task category.',
    'sales_rule','For each buyer, present the relevant execution front door and the bundle of services that solve their operating problem.',
    'anti_pattern',jsonb_build_array(
      'POSITION_DANI_AS_ONLY_A_CLEANING_COMPANY',
      'LEAD_WITH_ONE_SKU_WHEN_BUYER_HAS_MULTI_STEP_EXECUTION_NEED',
      'IGNORE_ADMIN_FIELD_DOCUMENTATION_LOGISTICS_CREATIVE_NOTARY_OR_PROVIDER_NETWORK_CAPABILITIES'
    )
  )
),
(
  'PROPERTY_MANAGEMENT_EXECUTION',
  'DANI handles the execution behind turns, property readiness, field support, documentation, resident operations, office support and vendor coordination.',
  'CH02_PROPERTY_MANAGEMENT',
  true,
  jsonb_build_object(
    'front_doors',jsonb_build_array(
      'TURNOVER_AND_MAKE_READY',
      'PROPERTY_RESCUE_AND_FIELD_DISPATCH',
      'PROPERTY_CONDITION_AND_DOCUMENTATION',
      'OFFICE_AND_OPERATIONS_RESCUE'
    ),
    'rule','Cleaning is one fulfillment component, not the whole offer.'
  )
),
(
  'OWNER_HOME_REVENUE',
  'Owner-executable remote work is a primary revenue lane alongside provider-dispatched field work.',
  'ALL_CHANNELS',
  true,
  jsonb_build_object(
    'priority','SELL_OWNER_HOME_AND_PROVIDER_FIELD_IN_PARALLEL',
    'reason','Allows owner revenue from home while the provider network performs field execution.'
  )
)
on conflict(rule_key) do update
set statement=excluded.statement,applies_to=excluded.applies_to,required=excluded.required,
    rule_spec=excluded.rule_spec,updated_at=now();

create table if not exists public.dd_research_cross_division_application_rules (
  rule_key text primary key,
  rule_name text not null,
  rule_spec jsonb not null,
  active boolean not null default true,
  updated_at timestamptz not null default now()
);
alter table public.dd_research_cross_division_application_rules enable row level security;

insert into public.dd_research_cross_division_application_rules(rule_key,rule_name,rule_spec)
values
(
  'ALL_RESEARCH_MULTI_DIVISION_REVIEW',
  'Every research input gets a multi-division/channel applicability pass',
  jsonb_build_object(
    'required_dimensions',jsonb_build_array(
      'CH01_RESIDENTS',
      'CH02_PROPERTY_MANAGEMENT',
      'CH03_REAL_ESTATE',
      'CH04_BUSINESS',
      'CH05_GOVERNMENT',
      'ALL_13_DIVISIONS'
    ),
    'classify_each_input_as',jsonb_build_array(
      'DIRECT_REVENUE',
      'CROSS_SELL',
      'FULFILLMENT_UPGRADE',
      'SYSTEM_UPGRADE',
      'FUNDING_CAPITAL',
      'OWNER_HOME_REVENUE',
      'PROVIDER_NETWORK_REVENUE',
      'LONG_TERM_ONLY',
      'REJECT'
    ),
    'rule','Do not file useful research into only the division where it was discovered when the mechanism can lawfully strengthen other channels or divisions.',
    'guardrail','Apply the mechanism broadly, but keep legal, pricing, credential, buyer and fulfillment requirements service-specific.'
  )
),
(
  'RESEARCH_TO_MONEY',
  'Research must resolve to execution',
  jsonb_build_object(
    'required_output',jsonb_build_array(
      'SELLABLE_OFFER',
      'BUYER_TARGET',
      'CROSS_SELL_PATH',
      'FULFILLMENT_PROCESS',
      'SYSTEM_ARTIFACT',
      'FUNDING_APPLICATION',
      'VERIFIED_HOLD_REASON'
    ),
    'anti_pattern','RESEARCH_ARCHIVE_WITH_NO_EXECUTION_PATH'
  )
)
on conflict(rule_key) do update
set rule_name=excluded.rule_name,rule_spec=excluded.rule_spec,active=true,updated_at=now();

create table if not exists public.dd_owner_home_service_priority (
  canonical_sku text primary key,
  owner_fulfillment_mode text not null,
  priority_tier text not null,
  home_executable boolean not null,
  provider_optional boolean not null default false,
  rationale text not null,
  updated_at timestamptz not null default now()
);
alter table public.dd_owner_home_service_priority enable row level security;

insert into public.dd_owner_home_service_priority(
  canonical_sku,owner_fulfillment_mode,priority_tier,home_executable,provider_optional,rationale
)
select s.sku,'OWNER_REMOTE','P0',true,true,
       'Owner can fulfill from home using administrative/business-operations capability; provider network may absorb overflow.'
from public.services s
where s.sku in (
  'DNI-04A-001','DNI-04A-003','DNI-04A-004','DNI-04A-005','DNI-04A-006',
  'DNI-04A-007','DNI-04A-008','DNI-04A-009','DNI-04A-010','DNI-04A-011',
  'DNI-04A-012','DNI-04A-013','DNI-04A-014','DNI-04A-015','DNI-04A-016',
  'DNI-04A-017','DNI-04A-018','DNI-04A-019'
)
on conflict(canonical_sku) do update
set owner_fulfillment_mode=excluded.owner_fulfillment_mode,
    priority_tier=excluded.priority_tier,home_executable=excluded.home_executable,
    provider_optional=excluded.provider_optional,rationale=excluded.rationale,updated_at=now();

insert into public.dd_owner_home_service_priority(
  canonical_sku,owner_fulfillment_mode,priority_tier,home_executable,provider_optional,rationale
)
select s.sku,'OWNER_REMOTE_ADMIN_SUPPORT','P0',true,false,
       'Owner can perform business formation/compliance research and administrative support remotely; excludes technical workstation/computer service work.'
from public.services s
where s.sku in (
  'DNI-06A-001','DNI-06A-002','DNI-06A-003','DNI-06A-004','DNI-06A-005',
  'DNI-06A-006','DNI-06A-007','DNI-06A-008','DNI-06A-009','DNI-06A-010'
)
on conflict(canonical_sku) do update
set owner_fulfillment_mode=excluded.owner_fulfillment_mode,
    priority_tier=excluded.priority_tier,home_executable=excluded.home_executable,
    provider_optional=excluded.provider_optional,rationale=excluded.rationale,updated_at=now();

insert into public.dd_owner_home_service_priority(
  canonical_sku,owner_fulfillment_mode,priority_tier,home_executable,provider_optional,rationale
)
select s.sku,'OWNER_HOME_PRODUCTION','P1',true,true,
       'DTF/heat-press work is owner-capable from home when equipment/materials are available; provider network can fulfill overflow.'
from public.services s
where s.sku in ('DNI-11A-017','DNI-11A-018')
on conflict(canonical_sku) do update
set owner_fulfillment_mode=excluded.owner_fulfillment_mode,
    priority_tier=excluded.priority_tier,home_executable=excluded.home_executable,
    provider_optional=excluded.provider_optional,rationale=excluded.rationale,updated_at=now();

create or replace view public.dd_owner_home_live_sellable_v1
with (security_invoker=true)
as
select
  p.priority_tier,
  p.owner_fulfillment_mode,
  s.sku,
  s.name,
  d.slug as division_slug,
  s.starting_price,
  s.pricing_type,
  r.release_state,
  r.blocking_gate
from public.dd_owner_home_service_priority p
join public.services s on s.sku=p.canonical_sku
join public.divisions d on d.id=s.division_id
join public.dd_service_release_contract_v1 r on r.canonical_sku=s.sku
where p.home_executable=true
  and s.is_active=true
  and r.release_state='LIVE_READY'
  and r.blocking_gate='NONE'
order by case p.priority_tier when 'P0' then 0 else 1 end,s.starting_price desc,s.sku;

select
  (select count(*) from public.dd_owner_home_service_priority where home_executable) as owner_home_catalog,
  (select count(*) from public.dd_owner_home_live_sellable_v1) as owner_home_live_sellable,
  (select count(*) from public.dd_brand_positioning_rules where required) as positioning_rules;
