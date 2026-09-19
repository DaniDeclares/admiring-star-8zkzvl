-- Stripe estimate invoice execution boundary
alter table public.dd_invoices
  add column if not exists stripe_customer_id text,
  add column if not exists hosted_invoice_url text,
  add column if not exists stripe_invoice_status text,
  add column if not exists stripe_invoice_created_at timestamptz,
  add column if not exists stripe_invoice_finalized_at timestamptz,
  add column if not exists stripe_invoice_paid_at timestamptz,
  add column if not exists stripe_invoice_last_event_at timestamptz;

create index if not exists idx_dd_invoices_stripe_invoice_id
  on public.dd_invoices(stripe_invoice_id)
  where stripe_invoice_id is not null;

create index if not exists idx_dd_invoices_estimate_stripe
  on public.dd_invoices(estimate_id, created_at desc);
