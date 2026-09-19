
-- job_evidence_provider_insert only checked that the inserting provider's own JWT
-- provider_id matched the row's provider_id column. It never checked job_id against
-- dd_job_assignments, so any authenticated provider could insert dd_job_evidence rows
-- against ANY job, not just their own assigned/accepted one. Because Postgres RLS
-- PERMISSIVE policies are combined with OR, this legacy policy fully neutralized the
-- correct assignment check already enforced by dd_job_evidence_provider_insert_assigned
-- (provider_id = private.dd_current_provider_id() AND an ACCEPTED dd_job_assignments
-- row exists for that job). The modern policy already covers all legitimate provider
-- evidence-upload cases, so the legacy policy is dropped rather than patched.
DROP POLICY IF EXISTS job_evidence_provider_insert ON public.dd_job_evidence;
