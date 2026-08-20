-- PASS A.3 — Operational RLS hardening
--
-- Purpose: replace the intentional deny-all posture on G4-G8 operational tables
-- with narrow portal-role policies. This migration is operational only.
-- It does NOT read, write, recalculate, or alter pricing/catalog/estimate data.
--
-- Security authority:
--   auth.jwt() -> app_metadata -> portal_role / organization_id / provider_id
--
-- Important: the current dd_providers schema does not contain a user_id column,
-- and the current job schema does not expose a verified customer/property-manager
-- relationship in these migrations. Therefore this migration deliberately does
-- NOT invent those relationships. Provider-level policies require provider_id
-- in app_metadata; organization-level read access is available only where the
-- row is explicitly tied to that organization. Customer/procurement access to
-- operational ledgers remains deny-by-default until a verified relationship is
-- present in the schema.

create or replace function public.dd_is_staff_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(auth.jwt() -> 'app_metadata' ->> 'portal_role', '') = 'staff_admin';
$$;

create or replace function public.dd_current_org_id()
returns uuid
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v text;
begin
  v := auth.jwt() -> 'app_metadata' ->> 'organization_id';
  if v is null or v = '' then return null; end if;
  begin
    return v::uuid;
  exception when invalid_text_representation then
    return null;
  end;
end;
$$;

create or replace function public.dd_current_provider_id()
returns uuid
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v text;
begin
  v := auth.jwt() -> 'app_metadata' ->> 'provider_id';
  if v is null or v = '' then return null; end if;
  begin
    return v::uuid;
  exception when invalid_text_representation then
    return null;
  end;
end;
$$;

-- ---------------------------------------------------------------------------
-- Provider network
-- ---------------------------------------------------------------------------

alter table public.dd_provider_organizations enable row level security;
drop policy if exists dd_provider_org_staff_all on public.dd_provider_organizations;
drop policy if exists dd_provider_org_member_read on public.dd_provider_organizations;
create policy dd_provider_org_staff_all
  on public.dd_provider_organizations for all
  using (public.dd_is_staff_admin())
  with check (public.dd_is_staff_admin());
create policy dd_provider_org_member_read
  on public.dd_provider_organizations for select
  using (id = public.dd_current_org_id());

alter table public.dd_providers enable row level security;
drop policy if exists dd_providers_staff_all on public.dd_providers;
drop policy if exists dd_providers_member_read on public.dd_providers;
create policy dd_providers_staff_all
  on public.dd_providers for all
  using (public.dd_is_staff_admin())
  with check (public.dd_is_staff_admin());
create policy dd_providers_member_read
  on public.dd_providers for select
  using (
    id = public.dd_current_provider_id()
    or org_id = public.dd_current_org_id()
  );

alter table public.dd_provider_capabilities enable row level security;
drop policy if exists dd_provider_caps_staff_all on public.dd_provider_capabilities;
drop policy if exists dd_provider_caps_member_read on public.dd_provider_capabilities;
create policy dd_provider_caps_staff_all
  on public.dd_provider_capabilities for all
  using (public.dd_is_staff_admin())
  with check (public.dd_is_staff_admin());
create policy dd_provider_caps_member_read
  on public.dd_provider_capabilities for select
  using (
    provider_id = public.dd_current_provider_id()
    or exists (
      select 1 from public.dd_providers p
      where p.id = dd_provider_capabilities.provider_id
        and p.org_id = public.dd_current_org_id()
    )
  );

alter table public.dd_provider_coverage enable row level security;
drop policy if exists dd_provider_coverage_staff_all on public.dd_provider_coverage;
drop policy if exists dd_provider_coverage_member_read on public.dd_provider_coverage;
create policy dd_provider_coverage_staff_all
  on public.dd_provider_coverage for all
  using (public.dd_is_staff_admin())
  with check (public.dd_is_staff_admin());
create policy dd_provider_coverage_member_read
  on public.dd_provider_coverage for select
  using (
    provider_id = public.dd_current_provider_id()
    or exists (
      select 1 from public.dd_providers p
      where p.id = dd_provider_coverage.provider_id
        and p.org_id = public.dd_current_org_id()
    )
  );

alter table public.dd_provider_availability enable row level security;
drop policy if exists dd_provider_availability_staff_all on public.dd_provider_availability;
drop policy if exists dd_provider_availability_provider_all on public.dd_provider_availability;
create policy dd_provider_availability_staff_all
  on public.dd_provider_availability for all
  using (public.dd_is_staff_admin())
  with check (public.dd_is_staff_admin());
create policy dd_provider_availability_provider_all
  on public.dd_provider_availability for all
  using (provider_id = public.dd_current_provider_id())
  with check (provider_id = public.dd_current_provider_id());

-- ---------------------------------------------------------------------------
-- Dispatch and scheduling
-- ---------------------------------------------------------------------------

alter table public.dd_job_assignments enable row level security;
drop policy if exists dd_assignments_staff_all on public.dd_job_assignments;
drop policy if exists dd_assignments_provider_select on public.dd_job_assignments;
create policy dd_assignments_staff_all
  on public.dd_job_assignments for all
  using (public.dd_is_staff_admin())
  with check (public.dd_is_staff_admin());
create policy dd_assignments_provider_select
  on public.dd_job_assignments for select
  using (provider_id = public.dd_current_provider_id());

alter table public.dd_job_appointments enable row level security;
drop policy if exists dd_appointments_staff_all on public.dd_job_appointments;
drop policy if exists dd_appointments_provider_all on public.dd_job_appointments;
create policy dd_appointments_staff_all
  on public.dd_job_appointments for all
  using (public.dd_is_staff_admin())
  with check (public.dd_is_staff_admin());
create policy dd_appointments_provider_select
  on public.dd_job_appointments for select
  using (provider_id = public.dd_current_provider_id());

alter table public.dd_dispatch_events enable row level security;
drop policy if exists dd_dispatch_events_staff_all on public.dd_dispatch_events;
drop policy if exists dd_dispatch_events_provider_read on public.dd_dispatch_events;
create policy dd_dispatch_events_staff_all
  on public.dd_dispatch_events for all
  using (public.dd_is_staff_admin())
  with check (public.dd_is_staff_admin());
create policy dd_dispatch_events_provider_read
  on public.dd_dispatch_events for select
  using (
    exists (
      select 1
      from public.dd_job_assignments a
      where a.job_id = dd_dispatch_events.job_id
        and a.provider_id = public.dd_current_provider_id()
    )
  );

-- ---------------------------------------------------------------------------
-- Field execution
-- ---------------------------------------------------------------------------

alter table public.dd_task_templates enable row level security;
drop policy if exists dd_task_templates_staff_all on public.dd_task_templates;
drop policy if exists dd_task_templates_authenticated_read on public.dd_task_templates;
create policy dd_task_templates_staff_all
  on public.dd_task_templates for all
  using (public.dd_is_staff_admin())
  with check (public.dd_is_staff_admin());
create policy dd_task_templates_authenticated_read
  on public.dd_task_templates for select
  using (auth.role() = 'authenticated');

alter table public.dd_task_events enable row level security;
drop policy if exists dd_task_events_staff_all on public.dd_task_events;
drop policy if exists dd_task_events_provider_read on public.dd_task_events;
create policy dd_task_events_staff_all
  on public.dd_task_events for all
  using (public.dd_is_staff_admin())
  with check (public.dd_is_staff_admin());
create policy dd_task_events_provider_read
  on public.dd_task_events for select
  using (
    exists (
      select 1
      from public.dd_job_assignments a
      where a.job_id = dd_task_events.job_id
        and a.provider_id = public.dd_current_provider_id()
    )
  );

-- ---------------------------------------------------------------------------
-- Evidence / change orders / completion review
-- ---------------------------------------------------------------------------

alter table public.dd_change_orders enable row level security;
drop policy if exists dd_change_orders_staff_all on public.dd_change_orders;
drop policy if exists dd_change_orders_provider_read on public.dd_change_orders;
drop policy if exists dd_change_orders_provider_insert on public.dd_change_orders;
create policy dd_change_orders_staff_all
  on public.dd_change_orders for all
  using (public.dd_is_staff_admin())
  with check (public.dd_is_staff_admin());
create policy dd_change_orders_provider_read
  on public.dd_change_orders for select
  using (
    exists (
      select 1 from public.dd_job_assignments a
      where a.job_id = dd_change_orders.job_id
        and a.provider_id = public.dd_current_provider_id()
        and a.assignment_status in ('OFFERED','ACCEPTED')
    )
  );
create policy dd_change_orders_provider_insert
  on public.dd_change_orders for insert
  with check (
    requested_by_id = auth.uid()
    and exists (
      select 1 from public.dd_job_assignments a
      where a.job_id = dd_change_orders.job_id
        and a.provider_id = public.dd_current_provider_id()
        and a.assignment_status = 'ACCEPTED'
    )
  );

alter table public.dd_completion_reviews enable row level security;
drop policy if exists dd_completion_reviews_staff_all on public.dd_completion_reviews;
drop policy if exists dd_completion_reviews_provider_read on public.dd_completion_reviews;
create policy dd_completion_reviews_staff_all
  on public.dd_completion_reviews for all
  using (public.dd_is_staff_admin())
  with check (public.dd_is_staff_admin());
create policy dd_completion_reviews_provider_read
  on public.dd_completion_reviews for select
  using (
    exists (
      select 1 from public.dd_job_assignments a
      where a.job_id = dd_completion_reviews.job_id
        and a.provider_id = public.dd_current_provider_id()
    )
  );

-- ---------------------------------------------------------------------------
-- Financial/event infrastructure: no portal-role read/write access.
-- Server-side service-role operations remain the owner of these ledgers.
-- ---------------------------------------------------------------------------

alter table public.dd_payment_events enable row level security;
drop policy if exists dd_payment_events_staff_all on public.dd_payment_events;
create policy dd_payment_events_staff_all
  on public.dd_payment_events for all
  using (public.dd_is_staff_admin())
  with check (public.dd_is_staff_admin());

alter table public.dd_event_outbox enable row level security;
drop policy if exists dd_event_outbox_staff_all on public.dd_event_outbox;
create policy dd_event_outbox_staff_all
  on public.dd_event_outbox for all
  using (public.dd_is_staff_admin())
  with check (public.dd_is_staff_admin());

-- Security-definer helpers are intentionally hardened against search_path hijacking.
alter function public.dd_is_staff_admin() set search_path = public;
alter function public.dd_current_org_id() set search_path = public;
alter function public.dd_current_provider_id() set search_path = public;
