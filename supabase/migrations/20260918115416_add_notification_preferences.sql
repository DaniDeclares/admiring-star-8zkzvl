-- Lets any portal account (provider, resident, customer, property manager, procurement, staff)
-- choose how they receive notifications -- email and/or SMS -- and provide the phone number to
-- text. One row per Supabase auth user, self-managed from a new /portal/settings page.

create table if not exists public.dd_notification_preferences (
  auth_user_id uuid primary key references auth.users(id) on delete cascade,
  email_enabled boolean not null default true,
  sms_enabled boolean not null default false,
  sms_phone_number text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.dd_notification_preferences enable row level security;

drop policy if exists dd_notification_preferences_self on public.dd_notification_preferences;
create policy dd_notification_preferences_self
  on public.dd_notification_preferences for all
  using (auth_user_id = auth.uid())
  with check (auth_user_id = auth.uid());
