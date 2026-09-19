CREATE TABLE public.dd_discovery_transfer_register (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    discovery_code text NOT NULL UNIQUE,
    discovery_name text NOT NULL,
    discovery_description text,
    source_business text NOT NULL CHECK (source_business IN ('Shadow & Sol', 'DANI DECLARES', 'Cross-Business Observation')),
    classification text NOT NULL CHECK (classification IN ('DANI_SPECIFIC', 'SHADOW_SOL_SPECIFIC', 'TRANSFERABLE', 'FUTURE_ESTATE')),
    adoption_status text NOT NULL CHECK (adoption_status IN ('ADOPTED', 'ADAPTED', 'AUDIT_PENDING', 'DEFERRED', 'NOT_ADOPTED')),
    governance_stage text NOT NULL DEFAULT 'DISCOVERED' CHECK (governance_stage IN ('DISCOVERED', 'EVALUATED', 'DECIDED', 'IMPLEMENTED')),
    dani_application text,
    shadow_sol_origin text,
    ip_boundary_note text NOT NULL DEFAULT 'Concept/architecture only. No Shadow & Sol brand, catalog, pricing, SKUs, or IP is transferred or referenced by this record.',
    related_matrix_number integer REFERENCES public.dd_operating_matrix_registry(matrix_number),
    decided_by text NOT NULL DEFAULT 'Danielle Fong (Owner/Managing Director)',
    decided_at timestamptz,
    source_reference text,
    notes text,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.dd_discovery_transfer_register IS 'Governance layer sitting above the 11-matrix DANI architecture. Records strategic discoveries surfaced while building Shadow & Sol (or DANI) and their classification/adoption status for DANI DECLARES. Enforces Discover -> Evaluate -> Decide -> Independently Implement. Never a shared customer/commercial database between the two businesses -- ownership, catalog, brand, and IP remain fully separate (separate Supabase projects: shadow-and-sol vs DaniDeclares Project).';

ALTER TABLE public.dd_discovery_transfer_register ENABLE ROW LEVEL SECURITY;

CREATE POLICY staff_admin_all_dd_discovery_transfer_register
ON public.dd_discovery_transfer_register
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM dd_portal_identities pi
    WHERE pi.auth_user_id = auth.uid()
      AND pi.is_active = true
      AND pi.portal_role = ANY (ARRAY['staff_admin'::text, 'procurement'::text])
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM dd_portal_identities pi
    WHERE pi.auth_user_id = auth.uid()
      AND pi.is_active = true
      AND pi.portal_role = ANY (ARRAY['staff_admin'::text, 'procurement'::text])
  )
);

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_dd_discovery_transfer_register_updated_at
BEFORE UPDATE ON public.dd_discovery_transfer_register
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();