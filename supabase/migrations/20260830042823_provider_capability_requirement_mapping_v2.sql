ALTER TABLE public.dd_provider_capability_requirements ADD CONSTRAINT dd_provider_capability_requirements_code_key UNIQUE (requirement_code);
CREATE TABLE IF NOT EXISTS public.dd_service_capability_requirements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  canonical_sku text NOT NULL,
  capability_key text NOT NULL,
  requirement_code text NOT NULL REFERENCES public.dd_provider_capability_requirements(requirement_code),
  required boolean NOT NULL DEFAULT true,
  source text NOT NULL DEFAULT 'MASTER_SERVICE_CAPABILITY_CHANNEL_MATRIX',
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(canonical_sku, capability_key, requirement_code)
);
ALTER TABLE public.dd_service_capability_requirements ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.dd_service_capability_requirements FROM anon, authenticated;
DROP POLICY IF EXISTS service_capability_requirement_staff ON public.dd_service_capability_requirements;
CREATE POLICY service_capability_requirement_staff ON public.dd_service_capability_requirements FOR ALL TO authenticated USING (EXISTS (SELECT 1 FROM public.dd_portal_identities p WHERE p.auth_user_id = auth.uid() AND p.is_active AND p.portal_role = 'staff_admin')) WITH CHECK (EXISTS (SELECT 1 FROM public.dd_portal_identities p WHERE p.auth_user_id = auth.uid() AND p.is_active AND p.portal_role = 'staff_admin'));
INSERT INTO public.dd_service_capability_requirements (canonical_sku, capability_key, requirement_code, required)
SELECT m.sku, COALESCE(NULLIF(m.service_family,''), m.sku), rc, true
FROM public.dd_master_service_capability_channel_matrix m
CROSS JOIN LATERAL unnest(COALESCE(m.requirement_codes, ARRAY[]::text[])) rc
JOIN public.dd_provider_capability_requirements r ON r.requirement_code = rc
WHERE m.sku IS NOT NULL AND rc IS NOT NULL AND rc <> ''
ON CONFLICT DO NOTHING;
CREATE INDEX IF NOT EXISTS idx_dd_service_capability_requirements_sku ON public.dd_service_capability_requirements(canonical_sku);
CREATE INDEX IF NOT EXISTS idx_dd_service_capability_requirements_requirement ON public.dd_service_capability_requirements(requirement_code);