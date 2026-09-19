CREATE TABLE IF NOT EXISTS public.dd_provider_applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  application_status text NOT NULL DEFAULT 'SUBMITTED' CHECK (application_status IN ('DRAFT','SUBMITTED','UNDER_REVIEW','NEEDS_INFO','APPROVED','REJECTED','WITHDRAWN')),
  applicant_type text NOT NULL CHECK (applicant_type IN ('INDIVIDUAL','BUSINESS')),
  legal_name text NOT NULL,
  dba_name text,
  contact_first_name text NOT NULL,
  contact_last_name text NOT NULL,
  contact_email text NOT NULL,
  contact_phone text NOT NULL,
  physical_address text,
  service_radius_miles numeric,
  service_zip_codes text[],
  tax_form_status text NOT NULL DEFAULT 'PENDING' CHECK (tax_form_status IN ('NOT_REQUIRED','PENDING','RECEIVED','VERIFIED','REJECTED')),
  insurance_status text NOT NULL DEFAULT 'NOT_REQUIRED' CHECK (insurance_status IN ('NOT_REQUIRED','PENDING','RECEIVED','VERIFIED','REJECTED')),
  identity_status text NOT NULL DEFAULT 'PENDING' CHECK (identity_status IN ('PENDING','RECEIVED','VERIFIED','REJECTED')),
  agreement_status text NOT NULL DEFAULT 'PENDING' CHECK (agreement_status IN ('PENDING','RECEIVED','EXECUTED','REJECTED')),
  background_check_status text NOT NULL DEFAULT 'NOT_STARTED' CHECK (background_check_status IN ('NOT_STARTED','PENDING','CLEARED','REVIEW','FAILED','NOT_REQUIRED')),
  compliance_status text NOT NULL DEFAULT 'PENDING' CHECK (compliance_status IN ('PENDING','IN_REVIEW','VERIFIED','REJECTED')),
  network_access_level text NOT NULL DEFAULT 'NONE' CHECK (network_access_level IN ('NONE','APPLICANT','BETA','AUTHORIZED')),
  source text DEFAULT 'PUBLIC_APPLICATION',
  referral_source text,
  notes text,
  submitted_at timestamptz,
  reviewed_at timestamptz,
  reviewed_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.dd_provider_application_capabilities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id uuid NOT NULL REFERENCES public.dd_provider_applications(id) ON DELETE CASCADE,
  canonical_service_id uuid REFERENCES public.services(id),
  canonical_sku text,
  capability_key text NOT NULL,
  capability_description text,
  applicant_experience text,
  years_experience numeric,
  requires_license boolean NOT NULL DEFAULT false,
  requirement_status text NOT NULL DEFAULT 'PENDING' CHECK (requirement_status IN ('PENDING','NOT_REQUIRED','REQUIRED','VERIFIED','REJECTED')),
  authorization_status text NOT NULL DEFAULT 'GATED' CHECK (authorization_status IN ('GATED','PENDING_REVIEW','AUTHORIZED','REVOKED')),
  evidence_status text NOT NULL DEFAULT 'PENDING' CHECK (evidence_status IN ('PENDING','PARTIAL','COMPLETE','VERIFIED','REJECTED')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(application_id, capability_key, canonical_sku)
);

CREATE TABLE IF NOT EXISTS public.dd_provider_application_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id uuid NOT NULL REFERENCES public.dd_provider_applications(id) ON DELETE CASCADE,
  capability_id uuid REFERENCES public.dd_provider_application_capabilities(id) ON DELETE CASCADE,
  document_type text NOT NULL CHECK (document_type IN ('GOVERNMENT_ID','W9','COI','BUSINESS_REGISTRATION','PROFESSIONAL_LICENSE','CERTIFICATION','AUTO_INSURANCE','BACKGROUND_CONSENT','AGREEMENT','PORTFOLIO','WORK_SAMPLE','OTHER')),
  storage_path text,
  verification_status text NOT NULL DEFAULT 'PENDING' CHECK (verification_status IN ('PENDING','VERIFIED','REJECTED','EXPIRED')),
  issuing_authority text,
  document_number text,
  jurisdiction text,
  issue_date date,
  expiration_date date,
  reviewer_notes text,
  uploaded_at timestamptz NOT NULL DEFAULT now(),
  verified_at timestamptz,
  verified_by uuid
);

CREATE TABLE IF NOT EXISTS public.dd_provider_capability_requirements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  requirement_code text NOT NULL,
  requirement_name text NOT NULL,
  requirement_description text,
  requirement_type text NOT NULL CHECK (requirement_type IN ('IDENTITY','TAX','INSURANCE','LICENSE','CERTIFICATION','BACKGROUND','AGREEMENT','PORTFOLIO','WORK_SAMPLE','VEHICLE','OTHER')),
  applies_to text NOT NULL CHECK (applies_to IN ('ALL','INDIVIDUAL','BUSINESS','CAPABILITY')),
  capability_key text,
  required boolean NOT NULL DEFAULT true,
  jurisdiction text,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(requirement_code, capability_key, jurisdiction)
);

CREATE TABLE IF NOT EXISTS public.dd_provider_application_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id uuid NOT NULL REFERENCES public.dd_provider_applications(id) ON DELETE CASCADE,
  event_type text NOT NULL,
  from_status text,
  to_status text,
  actor_id uuid,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_dd_provider_applications_status ON public.dd_provider_applications(application_status);
CREATE INDEX IF NOT EXISTS idx_dd_provider_applications_email ON public.dd_provider_applications(lower(contact_email));
CREATE INDEX IF NOT EXISTS idx_dd_provider_application_capabilities_application ON public.dd_provider_application_capabilities(application_id);
CREATE INDEX IF NOT EXISTS idx_dd_provider_application_capabilities_sku ON public.dd_provider_application_capabilities(canonical_sku);
CREATE INDEX IF NOT EXISTS idx_dd_provider_application_documents_application ON public.dd_provider_application_documents(application_id);
CREATE INDEX IF NOT EXISTS idx_dd_provider_application_events_application ON public.dd_provider_application_events(application_id, created_at DESC);

ALTER TABLE public.dd_provider_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dd_provider_application_capabilities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dd_provider_application_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dd_provider_capability_requirements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dd_provider_application_events ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON public.dd_provider_applications FROM anon, authenticated;
REVOKE ALL ON public.dd_provider_application_capabilities FROM anon, authenticated;
REVOKE ALL ON public.dd_provider_application_documents FROM anon, authenticated;
REVOKE ALL ON public.dd_provider_capability_requirements FROM anon, authenticated;
REVOKE ALL ON public.dd_provider_application_events FROM anon, authenticated;

DROP POLICY IF EXISTS provider_application_staff_read ON public.dd_provider_applications;
DROP POLICY IF EXISTS provider_application_staff_write ON public.dd_provider_applications;
CREATE POLICY provider_application_staff_read ON public.dd_provider_applications FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM public.dd_portal_identities p WHERE p.auth_user_id = auth.uid() AND p.is_active AND p.portal_role = 'staff_admin'));
CREATE POLICY provider_application_staff_write ON public.dd_provider_applications FOR ALL TO authenticated USING (EXISTS (SELECT 1 FROM public.dd_portal_identities p WHERE p.auth_user_id = auth.uid() AND p.is_active AND p.portal_role = 'staff_admin')) WITH CHECK (EXISTS (SELECT 1 FROM public.dd_portal_identities p WHERE p.auth_user_id = auth.uid() AND p.is_active AND p.portal_role = 'staff_admin'));

DROP POLICY IF EXISTS provider_application_capability_staff ON public.dd_provider_application_capabilities;
CREATE POLICY provider_application_capability_staff ON public.dd_provider_application_capabilities FOR ALL TO authenticated USING (EXISTS (SELECT 1 FROM public.dd_portal_identities p WHERE p.auth_user_id = auth.uid() AND p.is_active AND p.portal_role = 'staff_admin')) WITH CHECK (EXISTS (SELECT 1 FROM public.dd_portal_identities p WHERE p.auth_user_id = auth.uid() AND p.is_active AND p.portal_role = 'staff_admin'));

DROP POLICY IF EXISTS provider_application_document_staff ON public.dd_provider_application_documents;
CREATE POLICY provider_application_document_staff ON public.dd_provider_application_documents FOR ALL TO authenticated USING (EXISTS (SELECT 1 FROM public.dd_portal_identities p WHERE p.auth_user_id = auth.uid() AND p.is_active AND p.portal_role = 'staff_admin')) WITH CHECK (EXISTS (SELECT 1 FROM public.dd_portal_identities p WHERE p.auth_user_id = auth.uid() AND p.is_active AND p.portal_role = 'staff_admin'));

DROP POLICY IF EXISTS provider_requirement_staff ON public.dd_provider_capability_requirements;
CREATE POLICY provider_requirement_staff ON public.dd_provider_capability_requirements FOR ALL TO authenticated USING (EXISTS (SELECT 1 FROM public.dd_portal_identities p WHERE p.auth_user_id = auth.uid() AND p.is_active AND p.portal_role = 'staff_admin')) WITH CHECK (EXISTS (SELECT 1 FROM public.dd_portal_identities p WHERE p.auth_user_id = auth.uid() AND p.is_active AND p.portal_role = 'staff_admin'));

DROP POLICY IF EXISTS provider_application_event_staff ON public.dd_provider_application_events;
CREATE POLICY provider_application_event_staff ON public.dd_provider_application_events FOR ALL TO authenticated USING (EXISTS (SELECT 1 FROM public.dd_portal_identities p WHERE p.auth_user_id = auth.uid() AND p.is_active AND p.portal_role = 'staff_admin')) WITH CHECK (EXISTS (SELECT 1 FROM public.dd_portal_identities p WHERE p.auth_user_id = auth.uid() AND p.is_active AND p.portal_role = 'staff_admin'));

INSERT INTO public.dd_provider_capability_requirements (requirement_code, requirement_name, requirement_description, requirement_type, applies_to, required)
VALUES
('ID_BASIC','Government photo ID','Identity verification for applicant before network authorization.','IDENTITY','ALL',true),
('TAX_W9','W-9','Tax documentation appropriate to the provider relationship.','TAX','ALL',true),
('AGREEMENT_DD','DANI DECLARES agreement','Executed agreement required before authorization.','AGREEMENT','ALL',true),
('BACKGROUND_CONSENT','Background verification consent','Consent where background screening is required by role/service or company policy.','BACKGROUND','ALL',false),
('COI_GENERAL','General liability insurance','Insurance evidence when required by service, relationship, contract, or risk tier.','INSURANCE','BUSINESS',false),
('LICENSE_SERVICE','Service-specific license','Only required where the selected capability legally or operationally requires a professional license.','LICENSE','CAPABILITY',false),
('CERT_SERVICE','Service-specific certification','Only required where the selected capability requires a certification.','CERTIFICATION','CAPABILITY',false),
('AUTO_MOBILE','Auto insurance','Required for driving/delivery/mobile services when applicable.','VEHICLE','CAPABILITY',false),
('PORTFOLIO_MEDIA','Portfolio/work samples','Evidence appropriate for creative, photography, marketing, technology, or similar capability.','PORTFOLIO','CAPABILITY',false)
ON CONFLICT DO NOTHING;