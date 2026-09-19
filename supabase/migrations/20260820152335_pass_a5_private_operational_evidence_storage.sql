-- PASS A.5: private evidence storage boundary
-- No public reads; object paths are bound to provider/job identities.
insert into storage.buckets (id, name, public)
values ('operational_evidence', 'operational_evidence', false)
on conflict (id) do update set public = false;

-- Remove only policies owned by this boundary so the migration is idempotent.
drop policy if exists dd_evidence_staff_read on storage.objects;
drop policy if exists dd_evidence_provider_read on storage.objects;
drop policy if exists dd_evidence_provider_insert on storage.objects;
drop policy if exists dd_evidence_staff_insert on storage.objects;

create policy dd_evidence_staff_read
on storage.objects for select
to authenticated
using (
  bucket_id = 'operational_evidence'
  and public.dd_is_staff_admin()
);

create policy dd_evidence_provider_read
on storage.objects for select
to authenticated
using (
  bucket_id = 'operational_evidence'
  and (storage.foldername(name))[1] = public.dd_current_provider_id()::text
);

create policy dd_evidence_staff_insert
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'operational_evidence'
  and public.dd_is_staff_admin()
);

create policy dd_evidence_provider_insert
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'operational_evidence'
  and (storage.foldername(name))[1] = public.dd_current_provider_id()::text
  and exists (
    select 1
    from public.dd_job_assignments a
    where a.provider_id = public.dd_current_provider_id()
      and a.job_id::text = (storage.foldername(name))[2]
      and a.assignment_status in ('OFFERED','ACCEPTED','SCHEDULED','IN_PROGRESS')
  )
);

-- Prevent anonymous object access regardless of bucket metadata.
revoke all on storage.objects from anon;
