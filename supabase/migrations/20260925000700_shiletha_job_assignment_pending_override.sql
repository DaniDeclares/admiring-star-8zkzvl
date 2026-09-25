-- NOT YET APPLIED TO PRODUCTION. Run this only after
-- 20260925000600_provider_assignment_override_exception.sql has been
-- applied (that one needs the owner's approval -- refused by the
-- session's security-weaken guardrail since it modifies the
-- SECURITY DEFINER assignment-authorization guard).
--
-- Once the override table/trigger exist, this: (1) records the explicit
-- owner-approved override row scoping Shiletha Tucker to this one job,
-- (2) inserts the dd_job_assignments row (now permitted by the guard via
-- that override), (3) marks the job scheduled and the work package fully
-- assigned. It is idempotent (safe to re-run) via the override table's
-- (job_id, provider_id) unique constraint and NOT EXISTS guards.

do $$
declare
  v_job_id uuid := '09c589e5-a7a2-416a-bfe0-46f1ad14818a'; -- DD-KRYSTAL-20260924
  v_provider_id uuid;
  v_wp_id uuid;
  v_slot_id uuid;
begin
  select id into v_provider_id from public.dd_providers where provider_code = 'PROV-SHILETHA-TUCKER';
  select id into v_wp_id from public.dd_fulfillment_work_packages where job_id = v_job_id and package_code = 'WP-KRYSTAL-CLEANING-20260925';
  select id into v_slot_id from public.dd_work_package_provider_slots where work_package_id = v_wp_id and provider_id = v_provider_id;

  if v_provider_id is null or v_wp_id is null or v_slot_id is null then
    raise exception 'Prerequisite Shiletha intake / work package / slot rows not found -- run 20260925000500 first';
  end if;

  insert into public.dd_provider_assignment_overrides (
    job_id, provider_id, approved_by, reason, scope_notes, outstanding_gates, expires_at
  ) values (
    v_job_id, v_provider_id, 'Dani (owner)',
    'Provider-portal /provider/apply routing failure interrupted normal recruitment path; job scheduled 2026-09-25 8:30 AM with no time to complete full onboarding first.',
    'Scope authorized: DD-KRYSTAL-20260924 only (two bathrooms deep clean/sanitize + vacuum two carpeted bedrooms, 390 17th St NW). Compensation: $60 flat via Zelle. This authorization expires with this assignment -- it does not constitute general provider clearance.',
    jsonb_build_object('background_check', 'PENDING', 'w9', 'PENDING', 'agreement', 'PENDING', 'identity', 'PENDING'),
    (select scheduled_end from public.dd_jobs where id = v_job_id) + interval '1 day'
  )
  on conflict (job_id, provider_id) do nothing;

  if not exists (select 1 from public.dd_job_assignments where job_id = v_job_id and provider_id = v_provider_id) then
    insert into public.dd_job_assignments (
      id, job_id, provider_id, work_package_id, provider_slot_id,
      assignment_status, offered_at, accepted_at, response_at, offer_sequence,
      admin_notes, provider_notes
    ) values (
      gen_random_uuid(), v_job_id, v_provider_id, v_wp_id, v_slot_id,
      'ACCEPTED', now(), now(), now(), 1,
      'PROVISIONAL ONE-JOB AUTHORIZATION via dd_provider_assignment_overrides. Outstanding onboarding gates (background check, W-9, agreement, identity) all PENDING and required before ANY future assignment. Does NOT change dd_provider_assignment_readiness_v1.assignment_ready (stays false) and does NOT constitute general provider clearance.',
      'Accepted $60 for the Sep 25 8:30 AM cleaning at 390 17th St NW via Messenger; confirmed MARTA route (Bus 1 to 17th Street).'
    );
  end if;

  update public.dd_fulfillment_work_packages set status = 'FULLY_ASSIGNED', updated_at = now()
  where id = v_wp_id;

  update public.dd_jobs set job_status = 'scheduled', updated_at = now()
  where id = v_job_id and job_status = 'blocked';
end $$;
