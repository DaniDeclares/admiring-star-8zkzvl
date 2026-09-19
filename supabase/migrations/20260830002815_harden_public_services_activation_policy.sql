DROP POLICY IF EXISTS "Public can read active services" ON public.services;

CREATE POLICY "Public can read sellable active services"
ON public.services
FOR SELECT
TO public
USING (
  is_active = true
  AND commercial_status = 'CANONICAL_ACTIVE'
  AND commercial_intent_status = 'SELL_NOW'
);