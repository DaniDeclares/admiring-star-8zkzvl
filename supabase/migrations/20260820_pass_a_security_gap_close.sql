-- PASS A SECURITY GAP CLOSE
--
-- Removes legacy broad authenticated=true RLS policies that remained after the
-- G4-G8 operational hardening pass. This migration changes authorization only.
-- It does not change pricing, catalog values, resolver logic, frozen estimates,
-- Stripe payment links, or commercial calculations.
--
-- Security authority: private.dd_is_staff_admin(), private.dd_current_provider_id()
-- and verified job-assignment relationships.

-- ---------------------------------------------------------------------------
-- 1. Remove self-service mutation of portal authorization records.
-- ---------------------------------------------------------------------------
alter table public.dd_portal_identities enable row level security;
drop policy if exists portal_identity_self_update on public.dd_portal_identities;
drop policy if exists portal_identity_staff_all on public.dd_portal_identities;
create policy portal_identity_staff_all
  on public.dd_portal_identities for all
  to authenticated
  using (private.dd_is_staff_admin())
  with check (private.dd_is_staff_admin());

-- ---------------------------------------------------------------------------
-- 2. Commercial/financial records: staff-only authenticated mutation.
-- Public intake INSERT policies already present remain unchanged.
-- ---------------------------------------------------------------------------

-- Estimates are commercial records. Public intake may create them through the
-- existing INSERT policy; authenticated users must not gain arbitrary mutation.
drop policy if exists "Authenticated can manage dd estimates" on public.dd_estimates;
create policy dd_estimates_staff_all
  on public.dd_estimates for all
  to authenticated
  using (private.dd_is_staff_admin())
  with check (private.dd_is_staff_admin());

drop policy if exists "Authenticated can manage dd estimate addons" on public.dd_estimate_addons;
create policy dd_estimate_addons_staff_all
  on public.dd_estimate_addons for all
  to authenticated
  using (private.dd_is_staff_admin())
  with check (private.dd_is_staff_admin());

drop policy if exists "Authenticated can manage dd estimate packages" on public.dd_estimate_packages;
create policy dd_estimate_packages_staff_all
  on public.dd_estimate_packages for all
  to authenticated
  using (private.dd_is_staff_admin())
  with check (private.dd_is_staff_admin());

drop policy if exists "Authenticated can manage dd estimate media" on public.dd_estimate_media;
create policy dd_estimate_media_staff_all
  on public.dd_estimate_media for all
  to authenticated
  using (private.dd_is_staff_admin())
  with check (private.dd_is_staff_admin());

drop policy if exists "Authenticated can manage dd travel" on public.dd_travel_calculations;
create policy dd_travel_staff_all
  on public.dd_travel_calculations for all
  to authenticated
  using (private.dd_is_staff_admin())
  with check (private.dd_is_staff_admin());

drop policy if exists "Authenticated can manage dd invoices" on public.dd_invoices;
create policy dd_invoices_staff_all
  on public.dd_invoices for all
  to authenticated
  using (private.dd_is_staff_admin())
  with check (private.dd_is_staff_admin());

drop policy if exists "Authenticated can manage dd followup tasks" on public.dd_followup_tasks;
create policy dd_followup_staff_all
  on public.dd_followup_tasks for all
  to authenticated
  using (private.dd_is_staff_admin())
  with check (private.dd_is_staff_admin());

-- ---------------------------------------------------------------------------
-- 3. Job operations: providers read only the jobs they are assigned to.
-- Staff remains the operational authority.
-- ---------------------------------------------------------------------------

drop policy if exists "Authenticated can manage dd jobs" on public.dd_jobs;
create policy dd_jobs_staff_all
  on public.dd_jobs for all
  to authenticated
  using (private.dd_is_staff_admin())
  with check (private.dd_is_staff_admin());
create policy dd_jobs_provider_read
  on public.dd_jobs for select
  to authenticated
  using (
    exists (
      select 1
      from public.dd_job_assignments a
      where a.job_id = dd_jobs.id
        and a.provider_id = private.dd_current_provider_id()
        and a.assignment_status in ('OFFERED','ACCEPTED')
    )
  );

-- Tasks are visible to assigned providers and executable only within their
-- assignment. A trigger below prevents providers from rewriting job linkage or
-- checklist identity while still allowing field-status updates.
drop policy if exists "Authenticated can manage dd job tasks" on public.dd_job_tasks;
create policy dd_job_tasks_staff_all
  on public.dd_job_tasks for all
  to authenticated
  using (private.dd_is_staff_admin())
  with check (private.dd_is_staff_admin());
create policy dd_job_tasks_provider_read
  on public.dd_job_tasks for select
  to authenticated
  using (
    exists (
      select 1
      from public.dd_job_assignments a
      where a.job_id = dd_job_tasks.job_id
        and a.provider_id = private.dd_current_provider_id()
        and a.assignment_status = 'ACCEPTED'
    )
  );
create policy dd_job_tasks_provider_update
  on public.dd_job_tasks for update
  to authenticated
  using (
    exists (
      select 1
      from public.dd_job_assignments a
      where a.job_id = dd_job_tasks.job_id
        and a.provider_id = private.dd_current_provider_id()
        and a.assignment_status = 'ACCEPTED'
    )
  )
  with check (
    exists (
      select 1
      from public.dd_job_assignments a
      where a.job_id = dd_job_tasks.job_id
        and a.provider_id = private.dd_current_provider_id()
        and a.assignment_status = 'ACCEPTED'
    )
  );

-- Provider task mutation guard: only operational checklist fields may change.
create or replace function private.dd_guard_provider_task_update()
returns trigger
language plpgsql
security definer
set search_path = public, private
as $$
begin
  if private.dd_is_staff_admin() then
    return new;
  end if;

  if new.id is distinct from old.id
     or new.job_id is distinct from old.job_id
     or new.template_id is distinct from old.template_id
     or new.task_name is distinct from old.task_name
     or new.task_type is distinct from old.task_type
     or new.sort_order is distinct from old.sort_order
     or new.is_required is distinct from old.is_required
     or new.evidence_required is distinct from old.evidence_required
     or new.due_at is distinct from old.due_at
  then
    raise exception 'Provider may not alter task definition or job linkage';
  end if;

  if new.completed_by is distinct from old.completed_by
     and new.completed_by is distinct from auth.uid()
  then
    raise exception 'completed_by must be the authenticated provider';
  end if;

  return new;
end;
$$;

drop trigger if exists trg_dd_guard_provider_task_update on public.dd_job_tasks;
create trigger trg_dd_guard_provider_task_update
before update on public.dd_job_tasks
for each row execute function private.dd_guard_provider_task_update();

-- ---------------------------------------------------------------------------
-- 4. Legacy FieldOps mirrors: keep public intake inserts, remove broad
-- authenticated management. Staff retains administration.
-- ---------------------------------------------------------------------------

drop policy if exists "Authenticated can manage fieldops estimates" on public.fieldops_estimates;
create policy fieldops_estimates_staff_all
  on public.fieldops_estimates for all
  to authenticated
  using (private.dd_is_staff_admin())
  with check (private.dd_is_staff_admin());

drop policy if exists "Authenticated can manage fieldops estimate addons" on public.fieldops_estimate_addons;
create policy fieldops_estimate_addons_staff_all
  on public.fieldops_estimate_addons for all
  to authenticated
  using (private.dd_is_staff_admin())
  with check (private.dd_is_staff_admin());

drop policy if exists "Authenticated can manage fieldops estimate packages" on public.fieldops_estimate_packages;
create policy fieldops_estimate_packages_staff_all
  on public.fieldops_estimate_packages for all
  to authenticated
  using (private.dd_is_staff_admin())
  with check (private.dd_is_staff_admin());

drop policy if exists "Authenticated can manage fieldops media metadata" on public.fieldops_estimate_media;
create policy fieldops_estimate_media_staff_all
  on public.fieldops_estimate_media for all
  to authenticated
  using (private.dd_is_staff_admin())
  with check (private.dd_is_staff_admin());

drop policy if exists "Authenticated can manage fieldops estimate tasks" on public.fieldops_estimate_tasks;
create policy fieldops_estimate_tasks_staff_all
  on public.fieldops_estimate_tasks for all
  to authenticated
  using (private.dd_is_staff_admin())
  with check (private.dd_is_staff_admin());

drop policy if exists "Authenticated can manage fieldops travel calculations" on public.fieldops_travel_calculations;
create policy fieldops_travel_staff_all
  on public.fieldops_travel_calculations for all
  to authenticated
  using (private.dd_is_staff_admin())
  with check (private.dd_is_staff_admin());

-- ---------------------------------------------------------------------------
-- 5. Replace deprecated auth.role() usage in task-template access.
-- ---------------------------------------------------------------------------
drop policy if exists dd_task_templates_authenticated_read on public.dd_task_templates;
create policy dd_task_templates_authenticated_read
  on public.dd_task_templates for select
  to authenticated
  using (true);

-- ---------------------------------------------------------------------------
-- 6. Public security-definer helpers are no longer part of the authorization
-- surface. Existing policies use private equivalents.
-- ---------------------------------------------------------------------------
revoke execute on function public.dd_is_staff_admin() from public;
revoke execute on function public.dd_current_org_id() from public;
revoke execute on function public.dd_current_provider_id() from public;

-- Explicitly document the intended invariant in the database.
comment on function private.dd_guard_provider_task_update() is
  'Provider task-update guard. Prevents reassignment or rewriting of checklist definition; allows only field execution changes.';
