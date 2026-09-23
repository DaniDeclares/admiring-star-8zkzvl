-- Harden the existing G10 evidence bucket actually used by api/portal-operations.js.
-- Its signed-upload path is <job_id>/<provider_id>/<timestamp>-<filename>.
drop policy if exists dd_job_evidence_storage_staff_read on storage.objects;
drop policy if exists dd_job_evidence_storage_provider_read on storage.objects;

create policy dd_job_evidence_storage_staff_read
on storage.objects for select
to authenticated
using (
  bucket_id = 'dd-job-evidence'
  and (select public.dd_is_staff_admin())
);

create policy dd_job_evidence_storage_provider_read
on storage.objects for select
to authenticated
using (
  bucket_id = 'dd-job-evidence'
  and (storage.foldername(name))[2] = (select public.dd_current_provider_id())::text
  and exists (
    select 1
    from public.dd_job_assignments a
    where a.provider_id = (select public.dd_current_provider_id())
      and a.job_id::text = (storage.foldername(name))[1]
      and a.assignment_status in ('OFFERED','ACCEPTED','SCHEDULED','IN_PROGRESS')
  )
);
