alter table public.dd_portal_identities enable row level security;

create policy "portal_identity_self_read"
on public.dd_portal_identities
for select to authenticated
using ((select auth.uid()) = auth_user_id);

create policy "portal_identity_self_update"
on public.dd_portal_identities
for update to authenticated
using ((select auth.uid()) = auth_user_id)
with check ((select auth.uid()) = auth_user_id);

alter table public.dd_job_evidence enable row level security;

create policy "job_evidence_staff_read"
on public.dd_job_evidence
for select to authenticated
using (coalesce((select auth.jwt() -> 'app_metadata' ->> 'role'), '') in ('staff_admin','admin'));

create policy "job_evidence_provider_own_read"
on public.dd_job_evidence
for select to authenticated
using (
  coalesce((select auth.jwt() -> 'app_metadata' ->> 'role'), '') = 'provider'
  and provider_id = ((select auth.jwt() -> 'app_metadata' ->> 'provider_id')::uuid)
);

create policy "job_evidence_provider_insert"
on public.dd_job_evidence
for insert to authenticated
with check (
  coalesce((select auth.jwt() -> 'app_metadata' ->> 'role'), '') = 'provider'
  and provider_id = ((select auth.jwt() -> 'app_metadata' ->> 'provider_id')::uuid)
);

update storage.buckets set public = false
where id in ('dd-job-evidence','dd-estimate-media','fieldops-estimate-media');

create policy "job_evidence_storage_staff_read"
on storage.objects
for select to authenticated
using (
  bucket_id = 'dd-job-evidence'
  and coalesce((select auth.jwt() -> 'app_metadata' ->> 'role'), '') in ('staff_admin','admin')
);

create policy "job_evidence_storage_owner_read"
on storage.objects
for select to authenticated
using (bucket_id = 'dd-job-evidence' and owner_id = (select auth.uid())::text);

create policy "job_evidence_storage_provider_upload"
on storage.objects
for insert to authenticated
with check (
  bucket_id = 'dd-job-evidence'
  and coalesce((select auth.jwt() -> 'app_metadata' ->> 'role'), '') = 'provider'
  and owner_id = (select auth.uid())::text
);