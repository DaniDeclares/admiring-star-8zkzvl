-- The public website submits intake through the server-side /api/intake-webhook route.
-- Do not expose direct Data API INSERT access to PII-bearing intake tables.
drop policy if exists leads_public_intake_insert on public.leads;
drop policy if exists service_requests_public_intake_insert on public.service_requests;
