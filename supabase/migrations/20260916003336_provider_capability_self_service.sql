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