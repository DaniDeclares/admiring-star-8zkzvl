-- dd_provider_application_capabilities had no grant for authenticated (same
-- missing-grant pattern as dd_provider_applications, fixed separately) and
-- its only RLS policy required staff_admin -- there was no way for an
-- applicant to record their own selected canonical service capabilities.
-- This is what let every self-service provider signup reach staff review
-- with zero capabilities, which dd_approve_provider_application then
-- correctly refuses to approve (NO_CANONICAL_CAPABILITIES_SELECTED).
grant select, insert on public.dd_provider_application_capabilities to authenticated;

create policy provider_application_capability_self_read
on public.dd_provider_application_capabilities
for select to authenticated
using (
  exists (
    select 1 from public.dd_provider_applications a
    where a.id = application_id and a.applicant_user_id = auth.uid()
  )
);

create policy provider_application_capability_self_insert
on public.dd_provider_application_capabilities
for insert to authenticated
with check (
  exists (
    select 1 from public.dd_provider_applications a
    where a.id = application_id and a.applicant_user_id = auth.uid()
  )
);
