ALTER TABLE public.services
  ADD COLUMN IF NOT EXISTS commercial_intent_status varchar(30) NOT NULL DEFAULT 'FULFILLMENT_GATED';

ALTER TABLE public.services
  DROP CONSTRAINT IF EXISTS services_commercial_intent_status_check;

ALTER TABLE public.services
  ADD CONSTRAINT services_commercial_intent_status_check
  CHECK (commercial_intent_status IN ('SELL_NOW','INTAKE_ONLY','FULFILLMENT_GATED','DO_NOT_SELL'));

CREATE INDEX IF NOT EXISTS services_public_commercial_activation_idx
  ON public.services (commercial_intent_status, is_active, commercial_status);

-- Fail closed: only explicitly approved offers may be SELL_NOW.
UPDATE public.services
SET commercial_intent_status = 'FULFILLMENT_GATED'
WHERE commercial_intent_status IS DISTINCT FROM 'SELL_NOW';

-- Use the live schema's authoritative SKU field. Do not assume the sample service_sku name.
UPDATE public.services
SET commercial_intent_status = 'SELL_NOW'
WHERE sku IN (
  'DNI-01A-001',
  'DNI-01A-002',
  'DNI-01A-003',
  'DNI-01A-004',
  'DNI-01C-001',
  'DNI-01D-002'
);

-- The five launch offer families named in the approved activation plan are
-- represented by six live SKUs because CH01 resident pricing has separate
-- source SKU expressions. Only rows that exist are changed.
