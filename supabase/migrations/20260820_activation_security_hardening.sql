-- Activation security hardening
-- Keeps operational tables server-side until portal-specific policies are provisioned.
-- Service-role/server-side operations remain available; anon/authenticated PostgREST access is denied
-- by RLS until explicit role-aware policies are introduced.

ALTER TABLE public.dd_provider_organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dd_providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dd_provider_capabilities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dd_provider_coverage ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dd_job_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dd_dispatch_events ENABLE ROW LEVEL SECURITY;

ALTER FUNCTION public.dd_fieldops_touch_updated_at() SET search_path = public;
ALTER FUNCTION public.dd_portal_touch_updated_at() SET search_path = public;
