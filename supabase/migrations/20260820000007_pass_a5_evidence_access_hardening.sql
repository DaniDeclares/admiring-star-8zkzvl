-- PASS A.5 — Existing private evidence bucket hardening
-- Uses the bucket/path contract already implemented by api/portal-operations.js:
--   dd-job-evidence/<job_id>/<provider_id>/<timestamp>-<filename>
-- Additive only. No pricing, estimate, invoice, or Stripe mutations.

DROP POLICY IF EXISTS dd_job_evidence_storage_staff_read ON storage.objects;
DROP POLICY IF EXISTS dd_job_evidence_storage_provider_read ON storage.objects;

CREATE POLICY dd_job_evidence_storage_staff_read
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'dd-job-evidence'
  AND (SELECT private.dd_is_staff_admin())
);

CREATE POLICY dd_job_evidence_storage_provider_read
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'dd-job-evidence'
  AND (storage.foldername(name))[2] = (SELECT private.dd_current_provider_id())::text
  AND EXISTS (
    SELECT 1
    FROM public.dd_job_assignments a
    WHERE a.provider_id = (SELECT private.dd_current_provider_id())
      AND a.job_id::text = (storage.foldername(name))[1]
      AND a.assignment_status IN ('OFFERED','ACCEPTED','SCHEDULED','IN_PROGRESS')
  )
);
