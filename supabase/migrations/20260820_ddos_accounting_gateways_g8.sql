-- G8 — Accounting Synchronization & Edge Gateways
-- Additive only. Existing Stripe Price/Payment Link objects and canonical pricing are untouched.

create table if not exists public.dd_payment_events (
  id uuid primary key default gen_random_uuid(),
  provider text not null default 'stripe',
  provider_event_id text not null unique,
  provider_payment_id text,
  request_id uuid references public.service_requests(id) on delete set null,
  job_id uuid references public.dd_jobs(id) on delete set null,
  invoice_id uuid references public.dd_invoices(id) on delete set null,
  change_order_id uuid references public.dd_change_orders(id) on delete set null,
  event_type text not null,
  payment_status text not null,
  amount_received numeric(10,2) not null default 0,
  currency text not null default 'usd',
  raw_metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists idx_dd_payment_events_request
  on public.dd_payment_events(request_id, created_at desc);
create index if not exists idx_dd_payment_events_job
  on public.dd_payment_events(job_id, created_at desc);
create index if not exists idx_dd_payment_events_invoice
  on public.dd_payment_events(invoice_id, created_at desc);

create table if not exists public.dd_event_outbox (
  id uuid primary key default gen_random_uuid(),
  event_key text not null unique,
  event_type text not null,
  channel text not null,
  aggregate_type text not null,
  aggregate_id uuid,
  payload jsonb not null default '{}'::jsonb,
  status text not null default 'PENDING',
  attempts integer not null default 0,
  available_at timestamptz not null default now(),
  processed_at timestamptz,
  last_error text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_dd_event_outbox_pending
  on public.dd_event_outbox(status, available_at);

alter table public.dd_payment_events enable row level security;
alter table public.dd_event_outbox enable row level security;

-- No anonymous/public write policies are introduced. Server-side operations own these ledgers.
