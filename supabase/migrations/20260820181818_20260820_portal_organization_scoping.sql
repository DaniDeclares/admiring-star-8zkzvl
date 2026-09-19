-- Organization scoping for B2B/property-manager/procurement portal authorization.
-- Nullable by design: existing B2C jobs remain lead-scoped until explicitly associated.
ALTER TABLE public.service_requests
  ADD COLUMN IF NOT EXISTS organization_id uuid;

ALTER TABLE public.dd_jobs
  ADD COLUMN IF NOT EXISTS organization_id uuid;

CREATE INDEX IF NOT EXISTS idx_service_requests_organization_id
  ON public.service_requests (organization_id);

CREATE INDEX IF NOT EXISTS idx_dd_jobs_organization_id
  ON public.dd_jobs (organization_id);
