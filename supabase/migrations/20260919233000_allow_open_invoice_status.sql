-- Stripe invoice lifecycle includes an OPEN state after finalization.
-- Keep DANI's local invoice_status aligned with the authoritative Stripe status.
alter table public.dd_invoices
  drop constraint if exists dd_invoices_invoice_status_check;

alter table public.dd_invoices
  add constraint dd_invoices_invoice_status_check
  check (invoice_status = any (array['draft'::text, 'open'::text, 'sent'::text, 'paid'::text, 'partial'::text, 'void'::text, 'uncollectible'::text, 'refunded'::text]));
