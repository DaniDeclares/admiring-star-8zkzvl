begin;
create table if not exists public.dd_portal_onboarding_intakes (
 id uuid primary key default gen_random_uuid(),
 auth_user_id uuid not null,
 portal_role text not null,
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
 requested_services text[] not null default '{}'::text[],
 intake_data jsonb not null default '{}'::jsonb,
 status text not null default 'SUBMITTED',
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now()
);
create index if not exists dd_portal_onboarding_intakes_status_idx on public.dd_portal_onboarding_intakes(status);
create index if not exists dd_portal_onboarding_intakes_user_idx on public.dd_portal_onboarding_intakes(auth_user_id);
commit;