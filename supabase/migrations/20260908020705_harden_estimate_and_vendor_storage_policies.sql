create policy "dd_vendor_onboarding_staff_read" on storage.objects for select to authenticated using (bucket_id = 'dd-vendor-onboarding' and dd_is_staff_admin());

create policy "dd_estimate_media_staff_all" on storage.objects for all to authenticated using (bucket_id = 'dd-estimate-media' and dd_is_staff_admin()) with check (bucket_id = 'dd-estimate-media' and dd_is_staff_admin());

create policy "fieldops_estimate_media_staff_all" on storage.objects for all to authenticated using (bucket_id = 'fieldops-estimate-media' and dd_is_staff_admin()) with check (bucket_id = 'fieldops-estimate-media' and dd_is_staff_admin());