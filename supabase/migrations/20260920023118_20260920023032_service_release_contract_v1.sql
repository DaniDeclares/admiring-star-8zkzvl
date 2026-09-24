
create table if not exists public.dd_service_release_verifications (
  canonical_sku text primary key,
  stripe_price_verified_at timestamptz,
  payment_path_verified_at timestamptz,
  runtime_verified_at timestamptz,
  regression_verified_at timestamptz,
  production_smoke_verified_at timestamptz,
  verification_commit_sha text,
  notes text,
  updated_at timestamptz not null default now()
);
alter table public.dd_service_release_verifications enable row level security;
revoke all on table public.dd_service_release_verifications from anon;
grant select on table public.dd_service_release_verifications to authenticated;
grant select, insert, update, delete on table public.dd_service_release_verifications to service_role;
drop policy if exists "authenticated can read service release verifications" on public.dd_service_release_verifications;
create policy "authenticated can read service release verifications" on public.dd_service_release_verifications for select to authenticated using (true);

create table if not exists public.dd_service_payment_policy (
  policy_key text primary key,
  initial_payment_percent numeric(5,2) not null,
  currency text not null default 'USD',
  policy_version text not null,
  is_active boolean not null default true,
  updated_at timestamptz not null default now(),
  constraint dd_service_payment_policy_percent_check check (initial_payment_percent >= 0 and initial_payment_percent <= 100)
);
alter table public.dd_service_payment_policy enable row level security;
revoke all on table public.dd_service_payment_policy from anon;
grant select on table public.dd_service_payment_policy to authenticated;
grant select, insert, update, delete on table public.dd_service_payment_policy to service_role;
drop policy if exists "authenticated can read service payment policy" on public.dd_service_payment_policy;
create policy "authenticated can read service payment policy" on public.dd_service_payment_policy for select to authenticated using (true);
insert into public.dd_service_payment_policy(policy_key,initial_payment_percent,currency,policy_version,is_active)
values('DEFAULT',53.50,'USD','2026-09-20-53_5_INITIAL_PAYMENT-v1',true)
on conflict(policy_key) do update set initial_payment_percent=excluded.initial_payment_percent,currency=excluded.currency,policy_version=excluded.policy_version,is_active=excluded.is_active,updated_at=now();

drop view if exists public.dd_service_release_contract_v1;
create view public.dd_service_release_contract_v1 with(security_invoker=true) as
with offer_rollup as (
  select o.canonical_sku,
    max(o.service_name) filter(where o.commercial_offer_status='SELL_NOW') as service_name,
    max(o.division) as division,
    count(distinct o.runtime_service_id) filter(where o.runtime_service_id is not null) as runtime_id_count,
    (array_agg(o.runtime_service_id) filter(where o.runtime_service_id is not null))[1] as runtime_service_id,
    bool_or(o.commercial_offer_status='SELL_NOW') as has_sell_now,
    bool_or(o.commercial_offer_status='DO_NOT_SELL') as has_do_not_sell
  from public.dd_governed_service_offers o
  group by o.canonical_sku
),
channel_rollup as (
  select service_id,count(*) filter(where eligibility_status in('ACTIVE','ELIGIBLE','QUOTE_REQUIRED')) authorized_channel_count,count(*) filter(where eligibility_status in('ACTIVE','ELIGIBLE')) direct_channel_count
  from public.dd_service_channel_availability group by service_id
),
pricing_rollup as (
  select service_id,count(*) filter(where status='ACTIVE' and lock_status='LOCKED') locked_active_rule_count,count(*) filter(where status='PENDING_RECONCILIATION' or lock_status<>'LOCKED') unresolved_rule_count
  from public.dd_service_pricing_rules group by service_id
),
fulfillment_rollup as (
  select service_id,count(*) filter(where required=true) required_requirement_count from public.dd_service_requirements group by service_id
),
provider_rollup as (
  select service_id,count(*) provider_capability_count from public.dd_provider_capabilities group by service_id
),
routing_rollup as (
  select service_id,count(*) routing_count from private.dd_work_order_routing group by service_id
),
task_rollup as (
  select service_id,count(*) active_task_template_count from public.dd_task_templates where is_active=true group by service_id
),
stripe_rollup as (
  select r.canonical_sku,bool_or(r.stripe_payment_link_id is not null) has_payment_link,bool_or(r.stripe_price_id is not null) has_stripe_price,bool_or(r.activation_decision='ACTIVATE') stripe_register_authorized
  from public.dd_stripe_launch_register r group by r.canonical_sku
),
sync_rollup as (
  select canonical_sku,bool_or(stripe_livemode=true and sync_status='SYNCED_ACTIVE') stripe_sync_active from public.dd_stripe_catalog_sync group by canonical_sku
)
select
  o.canonical_sku,o.service_name,o.division,s.id runtime_service_id,s.service_family,s.name runtime_service_name,s.description,s.pricing_type,s.billing_cycle,s.resident_discount_eligible,s.pricing_engine_code,
  coalesce(p.locked_active_rule_count,0) locked_active_rule_count,coalesce(p.unresolved_rule_count,0) unresolved_rule_count,
  coalesce(c.authorized_channel_count,0) authorized_channel_count,coalesce(c.direct_channel_count,0) direct_channel_count,
  coalesce(f.required_requirement_count,0) required_requirement_count,coalesce(pr.provider_capability_count,0) provider_capability_count,coalesce(r.routing_count,0) routing_count,coalesce(t.active_task_template_count,0) active_task_template_count,
  coalesce(sr.has_payment_link,false) has_payment_link,coalesce(sr.has_stripe_price,false) has_stripe_price,coalesce(sr.stripe_register_authorized,false) stripe_register_authorized,coalesce(ss.stripe_sync_active,false) stripe_sync_active,
  coalesce(v.stripe_price_verified_at is not null,false) stripe_price_verified,coalesce(v.payment_path_verified_at is not null,false) payment_path_verified,coalesce(v.runtime_verified_at is not null,false) runtime_verified,coalesce(v.regression_verified_at is not null,false) regression_verified,coalesce(v.production_smoke_verified_at is not null,false) production_smoke_verified,
  coalesce(pp.initial_payment_percent,0) initial_payment_percent,
  (o.runtime_id_count=1 and o.runtime_service_id is not null and s.is_active=true and s.sku=o.canonical_sku) canonical_identity_ok,
  (nullif(trim(coalesce(o.service_name,'')),'') is not null and nullif(trim(coalesce(s.description,'')),'') is not null and nullif(trim(coalesce(s.pricing_type,'')),'') is not null and nullif(trim(coalesce(s.billing_cycle,'')),'') is not null and s.resident_discount_eligible is not null and o.has_sell_now=true and coalesce(o.has_do_not_sell,false)=false) commercial_definition_ok,
  (s.pricing_engine_code is not null and exists(select 1 from public.dd_pricing_engines e where e.engine_code=s.pricing_engine_code and e.is_active=true) and coalesce(p.locked_active_rule_count,0)>0 and coalesce(p.unresolved_rule_count,0)=0) pricing_engine_ok,
  (s.quote_input_schema is not null and jsonb_typeof(s.quote_input_schema)='object') quote_path_ok,
  (coalesce(c.authorized_channel_count,0)>0 and coalesce(c.direct_channel_count,0)>0) channel_authorization_ok,
  (coalesce(f.required_requirement_count,0)>0 and coalesce(pr.provider_capability_count,0)>0 and (coalesce(r.routing_count,0)>0 or coalesce(t.active_task_template_count,0)>0)) fulfillment_matrix_ok,
  (case when s.pricing_type in('BESPOKE_SOW','SOW','SOW_PROCUREMENT','QUOTE','STARTING_AT','CONFIGURED','VARIABLE_QUOTE') or s.starting_price is null then coalesce(v.payment_path_verified_at is not null,false) and coalesce(pp.initial_payment_percent,0)=53.50 else coalesce(sr.has_payment_link,false) and coalesce(sr.has_stripe_price,false) and coalesce(sr.stripe_register_authorized,false) and coalesce(ss.stripe_sync_active,false) and coalesce(v.stripe_price_verified_at is not null,false) end) payment_ledger_ok,
  (coalesce(v.runtime_verified_at is not null,false) and coalesce(v.production_smoke_verified_at is not null,false)) runtime_accuracy_ok,
  case
    when not(o.runtime_id_count=1 and o.runtime_service_id is not null and s.is_active=true and s.sku=o.canonical_sku) then 'CANONICAL_IDENTITY'
    when not(nullif(trim(coalesce(o.service_name,'')),'') is not null and nullif(trim(coalesce(s.description,'')),'') is not null and nullif(trim(coalesce(s.pricing_type,'')),'') is not null and nullif(trim(coalesce(s.billing_cycle,'')),'') is not null and s.resident_discount_eligible is not null and o.has_sell_now=true and coalesce(o.has_do_not_sell,false)=false) then 'COMMERCIAL_DEFINITION'
    when not(s.pricing_engine_code is not null and exists(select 1 from public.dd_pricing_engines e where e.engine_code=s.pricing_engine_code and e.is_active=true) and coalesce(p.locked_active_rule_count,0)>0 and coalesce(p.unresolved_rule_count,0)=0) then 'PRICING_ENGINE'
    when not(s.quote_input_schema is not null and jsonb_typeof(s.quote_input_schema)='object') then 'QUOTE_PATH'
    when not(coalesce(c.authorized_channel_count,0)>0 and coalesce(c.direct_channel_count,0)>0) then 'CHANNEL_AUTHORIZATION'
    when not(coalesce(f.required_requirement_count,0)>0 and coalesce(pr.provider_capability_count,0)>0 and (coalesce(r.routing_count,0)>0 or coalesce(t.active_task_template_count,0)>0)) then 'FULFILLMENT_MATRIX'
    when not((case when s.pricing_type in('BESPOKE_SOW','SOW','SOW_PROCUREMENT','QUOTE','STARTING_AT','CONFIGURED','VARIABLE_QUOTE') or s.starting_price is null then coalesce(v.payment_path_verified_at is not null,false) and coalesce(pp.initial_payment_percent,0)=53.50 else coalesce(sr.has_payment_link,false) and coalesce(sr.has_stripe_price,false) and coalesce(sr.stripe_register_authorized,false) and coalesce(ss.stripe_sync_active,false) and coalesce(v.stripe_price_verified_at is not null,false) end)) then 'PAYMENT_LEDGER'
    when not(coalesce(v.runtime_verified_at is not null,false) and coalesce(v.production_smoke_verified_at is not null,false)) then 'RUNTIME_ACCURACY'
    when not coalesce(v.regression_verified_at is not null,false) then 'REGRESSION_VERIFIED'
    else 'NONE'
  end blocking_gate,
  case
    when o.has_do_not_sell=true and o.has_sell_now=false then 'BLOCKED'
    when (
      o.runtime_id_count=1 and o.runtime_service_id is not null and s.is_active=true and s.sku=o.canonical_sku
      and nullif(trim(coalesce(o.service_name,'')),'') is not null and nullif(trim(coalesce(s.description,'')),'') is not null and nullif(trim(coalesce(s.pricing_type,'')),'') is not null and nullif(trim(coalesce(s.billing_cycle,'')),'') is not null and s.resident_discount_eligible is not null
      and o.has_sell_now=true and coalesce(o.has_do_not_sell,false)=false
      and s.pricing_engine_code is not null and exists(select 1 from public.dd_pricing_engines e where e.engine_code=s.pricing_engine_code and e.is_active=true)
      and coalesce(p.locked_active_rule_count,0)>0 and coalesce(p.unresolved_rule_count,0)=0
      and s.quote_input_schema is not null and jsonb_typeof(s.quote_input_schema)='object'
      and coalesce(c.authorized_channel_count,0)>0 and coalesce(c.direct_channel_count,0)>0
      and coalesce(f.required_requirement_count,0)>0 and coalesce(pr.provider_capability_count,0)>0 and (coalesce(r.routing_count,0)>0 or coalesce(t.active_task_template_count,0)>0)
      and (case when s.pricing_type in('BESPOKE_SOW','SOW','SOW_PROCUREMENT','QUOTE','STARTING_AT','CONFIGURED','VARIABLE_QUOTE') or s.starting_price is null then coalesce(v.payment_path_verified_at is not null,false) and coalesce(pp.initial_payment_percent,0)=53.50 else coalesce(sr.has_payment_link,false) and coalesce(sr.has_stripe_price,false) and coalesce(sr.stripe_register_authorized,false) and coalesce(ss.stripe_sync_active,false) and coalesce(v.stripe_price_verified_at is not null,false) end)
      and coalesce(v.runtime_verified_at is not null,false) and coalesce(v.production_smoke_verified_at is not null,false) and coalesce(v.regression_verified_at is not null,false)
    ) then 'LIVE_READY'
    else 'HOLD'
  end release_state
from offer_rollup o
left join public.services s on s.id=o.runtime_service_id
left join pricing_rollup p on p.service_id=s.id
left join channel_rollup c on c.service_id=s.id
left join fulfillment_rollup f on f.service_id=s.id
left join provider_rollup pr on pr.service_id=s.id
left join routing_rollup r on r.service_id=s.id
left join task_rollup t on t.service_id=s.id
left join stripe_rollup sr on sr.canonical_sku=o.canonical_sku
left join sync_rollup ss on ss.canonical_sku=o.canonical_sku
left join public.dd_service_release_verifications v on v.canonical_sku=o.canonical_sku
left join public.dd_service_payment_policy pp on pp.policy_key='DEFAULT' and pp.is_active=true;
grant select on public.dd_service_release_contract_v1 to authenticated, service_role;
