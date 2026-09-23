-- DANI DECLARES service-level fulfillment and initial-payment contract.
-- Separates reusable routing templates from actual work-order assignments.
-- Adds structured task instructions/evidence and a dedicated initial-payment ledger.

CREATE TABLE IF NOT EXISTS public.dd_service_work_order_routing_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  service_id uuid NOT NULL REFERENCES public.services(id) ON DELETE CASCADE,
  channel_code text NOT NULL,
  capability_key text NOT NULL,
  selection_policy text NOT NULL DEFAULT 'AUTHORIZED_CAPABILITY_MATCH',
  routing_instructions text NOT NULL,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(service_id, channel_code, capability_key)
);

ALTER TABLE public.dd_service_work_order_routing_templates ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.dd_service_work_order_routing_templates FROM anon;
GRANT SELECT ON public.dd_service_work_order_routing_templates TO authenticated;
GRANT ALL ON public.dd_service_work_order_routing_templates TO service_role;

ALTER TABLE public.dd_task_templates ADD COLUMN IF NOT EXISTS evidence_spec jsonb;
ALTER TABLE public.dd_task_templates ADD COLUMN IF NOT EXISTS instruction_steps jsonb;

CREATE TABLE IF NOT EXISTS public.dd_service_initial_payment_links (
  canonical_sku text PRIMARY KEY,
  stripe_price_id text NOT NULL,
  stripe_payment_link_id text NOT NULL,
  initial_payment_percent numeric(5,2) NOT NULL,
  initial_amount_cents integer NOT NULL,
  currency text NOT NULL DEFAULT 'usd',
  verified_at timestamptz,
  source text NOT NULL,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.dd_service_initial_payment_links ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.dd_service_initial_payment_links FROM anon;
GRANT SELECT ON public.dd_service_initial_payment_links TO authenticated;
GRANT ALL ON public.dd_service_initial_payment_links TO service_role;
