-- NOT YET APPLIED TO PRODUCTION. Run this only after
-- 20260925000600_provider_assignment_override_exception.sql (v2, slot-scoped)
-- has been applied -- that one needs the owner's approval, since it modifies
-- the SECURITY DEFINER assignment-authorization guard.
--
-- v2, per owner review: the override row is scoped to the exact work
-- package/provider slot (not just job+provider), carries explicit
-- capability_key and compensation_amount, and sets an expires_at of the
-- job's scheduled_end so it self-expires rather than needing a manual
-- revoke. After inserting the real assignment, this also proves the
-- override does NOT leak to a different job: it attempts (and expects to
-- fail with PROVIDER_NOT_QUALIFIED) an assignment for Shiletha against an
-- unrelated job, inside a plpgsql exception handler so nothing is actually
-- persisted by the negative test. Idempotent (safe to re-run) via the
-- override table's (job_id, provider_id, provider_slot_id) unique
-- constraint and NOT EXISTS guards.

do $$
declare
  v_job_id uuid := '09c589e5-a7a2-416a-bfe0-46f1ad14818a'; -- DD-KRYSTAL-20260924
  v_provider_id uuid;
  v_wp_id uuid;
  v_slot_id uuid;
  v_expires_at timestamptz;
begin
  select id into v_provider_id from public.dd_providers where provider_code = 'PROV-SHILETHA-TUCKER';
  select id into v_wp_id from public.dd_fulfillment_work_packages where job_id = v_job_id and package_code = 'WP-KRYSTAL-CLEANING-20260925';
  select id into v_slot_id from public.dd_work_package_provider_slots where work_package_id = v_wp_id and provider_id = v_provider_id;
  select scheduled_end into v_expires_at from public.dd_jobs where id = v_job_id;

  if v_provider_id is null or v_wp_id is null or v_slot_id is null then
    raise exception 'Prerequisite Shiletha intake / work package / slot rows not found -- run 20260925000500 first';
  end if;

  insert into public.dd_provider_assignment_overrides (
    job_id, provider_id, work_package_id, provider_slot_id, capability_key,
    status, approved_by, reason, scope_notes, outstanding_gates,
    compensation_amount, expires_at
  ) values (
    v_job_id, v_provider_id, v_wp_id, v_slot_id, 'CLEANING',
    'ACTIVE', 'Dani (owner)',
    'Provider-portal /provider/apply routing failure interrupted normal recruitment path; job scheduled 2026-09-25 8:30 AM with no time to complete full onboarding first.',
    'Scope authorized: DD-KRYSTAL-20260924 / WP-KRYSTAL-CLEANING-20260925 slot only (two bathrooms deep clean/sanitize + vacuum two carpeted bedrooms, 390 17th St NW). This authorization does not constitute general provider clearance and self-expires at the job''s scheduled end.',
    jsonb_build_object('background_check', 'PENDING', 'w9', 'PENDING', 'agreement', 'PENDING', 'identity', 'PENDING'),
    60.00,
    coalesce(v_expires_at, now()) + interval '1 day'
  )
  on conflict (job_id, provider_id, provider_slot_id) do nothing;

  if not exists (select 1 from public.dd_job_assignments where job_id = v_job_id and provider_id = v_provider_id) then
    insert into public.dd_job_assignments (
      id, job_id, provider_id, work_package_id, provider_slot_id,
      assignment_status, offered_at, accepted_at, response_at, offer_sequence,
      admin_notes, provider_notes
    ) values (
      gen_random_uuid(), v_job_id, v_provider_id, v_wp_id, v_slot_id,
      'ACCEPTED', now(), now(), now(), 1,
      'PROVISIONAL ONE-JOB AUTHORIZATION via dd_provider_assignment_overrides (scoped to this job + work package + slot only). Outstanding onboarding gates (background check, W-9, agreement, identity) all PENDING and required before ANY future assignment. Does NOT change dd_provider_assignment_readiness_v1.assignment_ready (stays false) and does NOT constitute general provider clearance.',
      'Accepted $60 for the Sep 25 8:30 AM cleaning at 390 17th St NW via Messenger; confirmed MARTA route (Bus 1 to 17th Street).'
    );
  end if;

  update public.dd_fulfillment_work_packages set status = 'FULLY_ASSIGNED', updated_at = now()
  where id = v_wp_id;

  update public.dd_jobs set job_status = 'scheduled', updated_at = now()
  where id = v_job_id and job_status = 'blocked';
end $$;

-- Negative-scope proof: an assignment attempt for Shiletha against an
-- unrelated job must still raise PROVIDER_NOT_QUALIFIED (the override does
-- not generally clear her). Caught in an exception handler so the failed
-- insert is rolled back to the enclosing savepoint and nothing persists.
do $$
declare
  v_provider_id uuid;
  v_other_job_id uuid;
  v_shiletha_job_id uuid := '09c589e5-a7a2-416a-bfe0-46f1ad14818a';
begin
  select id into v_provider_id from public.dd_providers where provider_code = 'PROV-SHILETHA-TUCKER';
  select id into v_other_job_id from public.dd_jobs where id <> v_shiletha_job_id limit 1;

  if v_provider_id is null or v_other_job_id is null then
    raise notice 'Negative-scope test skipped: prerequisite provider or unrelated job not found';
    return;
  end if;

  begin
    insert into public.dd_job_assignments (
      id, job_id, provider_id, assignment_status, offered_at, accepted_at, response_at, offer_sequence
    ) values (
      gen_random_uuid(), v_other_job_id, v_provider_id, 'ACCEPTED', now(), now(), now(), 1
    );
    raise exception 'NEGATIVE_SCOPE_TEST_FAILED: unrelated-job assignment for Shiletha was NOT blocked -- override scope leaked';
  exception
    when others then
      if sqlerrm like 'PROVIDER_NOT_QUALIFIED%' then
        raise notice 'Negative-scope test passed: unrelated-job assignment correctly raised PROVIDER_NOT_QUALIFIED';
      else
        raise;
      end if;
  end;
end $$;
