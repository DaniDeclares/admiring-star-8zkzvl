-- Close the final RLS-without-policy findings without changing pricing or commercial authority.
-- Sensitive estimator configuration and follow-up records are staff-admin only.
-- Lead/service-request intake remains insert-only for anonymous/public intake; no public read/update/delete.

alter table public.dd_estimator_settings enable row level security;
create policy dd_estimator_settings_staff_all
  on public.dd_estimator_settings
  for all to authenticated
  using (private.dd_is_staff_admin())
  with check (private.dd_is_staff_admin());

alter table public.fieldops_estimator_settings enable row level security;
create policy fieldops_estimator_settings_staff_all
  on public.fieldops_estimator_settings
  for all to authenticated
  using (private.dd_is_staff_admin())
  with check (private.dd_is_staff_admin());

alter table public.followups enable row level security;
create policy followups_staff_all
  on public.followups
  for all to authenticated
  using (private.dd_is_staff_admin())
  with check (private.dd_is_staff_admin());

alter table public.leads enable row level security;
create policy leads_public_intake_insert
  on public.leads
  for insert to anon, authenticated
  with check (true);
create policy leads_staff_all
  on public.leads
  for all to authenticated
  using (private.dd_is_staff_admin())
  with check (private.dd_is_staff_admin());

alter table public.service_requests enable row level security;
create policy service_requests_public_intake_insert
  on public.service_requests
  for insert to anon, authenticated
  with check (true);
create policy service_requests_staff_all
  on public.service_requests
  for all to authenticated
  using (private.dd_is_staff_admin())
  with check (private.dd_is_staff_admin());