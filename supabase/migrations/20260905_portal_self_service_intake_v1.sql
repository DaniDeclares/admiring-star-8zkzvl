-- Unified portal self-service intake.
-- Additive only: preserves existing commercial, pricing, fulfillment and provider authority layers.
-- Public users may create non-staff portal identities for themselves and submit onboarding data.
-- Provider applicants enter the existing provider-application workflow; owner approval/qualification remains required.

create table if not exists public.dd_portal_onboarding_intakes (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid not null references auth.users(id) on delete cascade,
  portal_role text not null check (portal_role in ('resident','customer','property_manager','procurement','provider')),
  relationship_type text not null,
  channel_code text,
  organization_name text,
  first_name text,
  last_name text,
  email text not null,
  phone text,
  address text,
  city text,
  state_code text,
  zip_code text,
  service_area text,
  requested_services text[] not null default '{}',
  intake_data jsonb not null default '{}'::jsonb,
  status text not null default 'SUBMITTED' check (status in ('DRAFT','SUBMITTED','UNDER_REVIEW','NEEDS_INFO','ACTIVE','REJECTED')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists dd_portal_onboarding_intakes_user_idx on public.dd_portal_onboarding_intakes(auth_user_id);
create index if not exists dd_portal_onboarding_intakes_status_idx on public.dd_portal_onboarding_intakes(status);

alter table public.dd_portal_identities enable row level security;
drop policy if exists portal_identity_self_insert on public.dd_portal_identities;
create policy portal_identity_self_insert on public.dd_portal_identities for insert to authenticated
with check (auth.uid() = auth_user_id and portal_role <> 'staff_admin' and is_active = true);
drop policy if exists portal_identity_self_update on public.dd_portal_identities;
create policy portal_identity_self_update on public.dd_portal_identities for update to authenticated
using (auth.uid() = auth_user_id and portal_role <> 'staff_admin')
with check (auth.uid() = auth_user_id and portal_role <> 'staff_admin');

alter table public.dd_portal_onboarding_intakes enable row level security;
drop policy if exists portal_intake_self_insert on public.dd_portal_onboarding_intakes;
create policy portal_intake_self_insert on public.dd_portal_onboarding_intakes for insert to authenticated
with check (auth.uid() = auth_user_id);
drop policy if exists portal_intake_self_read on public.dd_portal_onboarding_intakes;
create policy portal_intake_self_read on public.dd_portal_onboarding_intakes for select to authenticated
using (auth.uid() = auth_user_id or private.dd_is_staff_admin());
drop policy if exists portal_intake_staff_all on public.dd_portal_onboarding_intakes;
create policy portal_intake_staff_all on public.dd_portal_onboarding_intakes for all to authenticated
using (private.dd_is_staff_admin()) with check (private.dd_is_staff_admin());

alter table public.dd_provider_applications add column if not exists applicant_user_id uuid references auth.users(id) on delete set null;
create index if not exists dd_provider_applications_applicant_user_idx on public.dd_provider_applications(applicant_user_id);
drop policy if exists provider_application_self_insert on public.dd_provider_applications;
create policy provider_application_self_insert on public.dd_provider_applications for insert to authenticated
with check (auth.uid() = applicant_user_id and application_status in ('DRAFT','SUBMITTED'));
drop policy if exists provider_application_self_read on public.dd_provider_applications;
create policy provider_application_self_read on public.dd_provider_applications for select to authenticated
using (auth.uid() = applicant_user_id or private.dd_is_staff_admin());
drop policy if exists provider_application_self_update on public.dd_provider_applications;
create policy provider_application_self_update on public.dd_provider_applications for update to authenticated
using (auth.uid() = applicant_user_id and application_status in ('DRAFT','NEEDS_INFO'))
with check (auth.uid() = applicant_user_id and application_status in ('DRAFT','SUBMITTED','NEEDS_INFO'));

create or replace function public.dd_portal_onboarding_touch_updated_at()
returns trigger language plpgsql as $$ begin new.updated_at = now(); return new; end $$;
drop trigger if exists dd_portal_onboarding_touch_updated_at on public.dd_portal_onboarding_intakes;
create trigger dd_portal_onboarding_touch_updated_at before update on public.dd_portal_onboarding_intakes for each row execute function public.dd_portal_onboarding_touch_updated_at();
