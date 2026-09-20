-- DANI DECLARES Service Release Contract v1
-- Declarative nine-gate release evidence. This migration does not mass-activate services.

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
create policy "authenticated can read service release verifications"
on public.dd_service_release_verifications for select to authenticated using (true);

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
create policy "authenticated can read service payment policy"
on public.dd_service_payment_policy for select to authenticated using (true);

insert into public.dd_service_payment_policy(policy_key,initial_payment_percent,currency,policy_version,is_active)
values ('DEFAULT',53.50,'USD','2026-09-20-53_5_INITIAL_PAYMENT-v1',true)
on conflict(policy_key) do update set initial_payment_percent=excluded.initial_payment_percent,currency=excluded.currency,policy_version=excluded.policy_version,is_active=excluded.is_active,updated_at=now();

drop view if exists public.dd_service_release_contract_v1;
create view public.dd_service_release_contract_v1 with(security_invoker=true) as
select
  o.canonical_sku,
  o.service_name,
  o.division,
  s.id runtime_service_id,
  s.service_family,
  s.name runtime_service_name,
  s.description,
  s.pricing_type,
  s.billing_cycle,
  s.resident_discount_eligible,
  s.pricing_engine_code,
  false canonical_identity_ok,
  false commercial_definition_ok,
  false pricing_engine_ok,
  false quote_path_ok,
  false channel_authorization_ok,
  false fulfillment_matrix_ok,
  false payment_ledger_ok,
  false runtime_accuracy_ok,
  false regression_verified,
  'INITIALIZATION' blocking_gate,
  'HOLD' release_state
from public.dd_governed_service_offers o
left join public.services s on s.id=o.runtime_service_id
where false;

grant select on public.dd_service_release_contract_v1 to authenticated, service_role;