-- Existing paid-first subscriptions are the owning aggregate. No offers/prices seeded.
-- Reuse the exact existing baseline when Tester lacks it; Production already owns it.
create table if not exists public.dd_service_subscriptions (
  id uuid primary key default gen_random_uuid(),
  service_request_id uuid not null references public.service_requests(id) on delete restrict,
  estimate_id uuid references public.dd_estimates(id) on delete restrict,
  service_id uuid references public.services(id) on delete restrict,
  canonical_sku text not null,
  stripe_checkout_session_id text unique,
  stripe_customer_id text,
  stripe_subscription_id text unique,
  latest_stripe_invoice_id text,
  subscription_status text not null default 'CHECKOUT_CREATED',
  first_payment_verified_at timestamptz,
  current_period_end timestamptz,
  canceled_at timestamptz,
  raw_metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(service_request_id, canonical_sku)
);
create index if not exists dd_service_subscriptions_request_idx on public.dd_service_subscriptions(service_request_id);
create index if not exists dd_service_subscriptions_invoice_idx on public.dd_service_subscriptions(latest_stripe_invoice_id);
comment on table public.dd_service_subscriptions is 'Governed recurring-service lifecycle. Subscription Checkout is not fulfillment authority; first and renewal fulfillment require successful paid invoice evidence.';

alter table public.dd_service_subscriptions enable row level security;
revoke all on public.dd_service_subscriptions from public,anon,authenticated;
grant select,insert,update on public.dd_service_subscriptions to service_role;
create table public.dd_service_subscription_terms (
 id uuid primary key default gen_random_uuid(),
 estimate_id uuid not null unique references public.dd_estimates(id) on delete restrict,
 canonical_sku text not null,
 monthly_amount_cents integer not null check (monthly_amount_cents > 0),
 terms jsonb not null,
 approved_by uuid not null references auth.users(id),
 approved_at timestamptz not null default now(),
 accepted_by uuid references auth.users(id),
 accepted_at timestamptz,
 check ((accepted_by is null) = (accepted_at is null))
);
alter table public.dd_service_subscriptions add column if not exists cancel_at_period_end boolean not null default false;
create table public.dd_service_subscription_cycles (
 id uuid primary key default gen_random_uuid(),
 subscription_id uuid not null references public.dd_service_subscriptions(id) on delete restrict,
 stripe_invoice_id text not null unique,
 period_start timestamptz not null,
 period_end timestamptz not null check (period_end > period_start),
 amount_paid_cents integer not null check (amount_paid_cents > 0),
 terms_snapshot jsonb not null,
 estimate_id uuid references public.dd_estimates(id) on delete restrict,
 job_id uuid unique references public.dd_jobs(id) on delete restrict,
 fulfillment_status text not null default 'REVIEW_REQUIRED' check (fulfillment_status in ('REVIEW_REQUIRED','READY','COMPLETED')),
 created_at timestamptz not null default now(),
 unique(subscription_id,period_start,period_end)
);
create table public.dd_service_subscription_usage (
 id uuid primary key default gen_random_uuid(),
 cycle_id uuid not null references public.dd_service_subscription_cycles(id) on delete restrict,
 job_id uuid not null references public.dd_jobs(id) on delete restrict,
 allowance_key text not null,
 quantity numeric not null check (quantity > 0),
 recorded_by uuid not null references auth.users(id),
 created_at timestamptz not null default now(),
 unique(cycle_id,job_id,allowance_key)
);
create or replace function public.dd_guard_subscription_usage() returns trigger language plpgsql set search_path=public as $$
declare cycle public.dd_service_subscription_cycles;
begin
 select * into cycle from public.dd_service_subscription_cycles where id=new.cycle_id for update;
 if cycle.job_id is distinct from new.job_id then raise exception 'CYCLE_JOB_MISMATCH'; end if;
 if not exists(select 1 from public.dd_jobs where id=new.job_id and upper(job_status)='COMPLETED')
 or not exists(select 1 from public.dd_completion_reviews where job_id=new.job_id and upper(status)='APPROVED')
 then raise exception 'COMPLETION_QA_APPROVAL_REQUIRED'; end if;
 if not exists(select 1 from jsonb_array_elements(cycle.terms_snapshot->'allowances') a where a->>'key'=new.allowance_key)
 then raise exception 'ALLOWANCE_NOT_INCLUDED'; end if;
 return new;
end $$;
create trigger subscription_usage_gate before insert on public.dd_service_subscription_usage for each row execute function public.dd_guard_subscription_usage();
alter table public.dd_service_subscription_terms enable row level security;
alter table public.dd_service_subscription_cycles enable row level security;
alter table public.dd_service_subscription_usage enable row level security;
revoke all on public.dd_service_subscription_terms,public.dd_service_subscription_cycles,public.dd_service_subscription_usage from public,anon,authenticated;
grant select,insert,update on public.dd_service_subscription_terms,public.dd_service_subscription_cycles to service_role;
grant select,insert on public.dd_service_subscription_usage to service_role;
revoke all on function public.dd_guard_subscription_usage() from public,anon,authenticated;
comment on table public.dd_service_subscription_usage is 'QA-approved completed job usage. Excess is quote-required, never an automatic charge. Immutable per job/allowance.';
