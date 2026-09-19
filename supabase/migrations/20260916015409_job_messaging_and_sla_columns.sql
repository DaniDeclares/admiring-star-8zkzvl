create table if not exists public.dd_messages (
  id uuid primary key default gen_random_uuid(),
  job_id uuid not null references public.dd_jobs(id) on delete cascade,
  sender_auth_user_id uuid not null references auth.users(id),
  sender_role text not null,
  body text not null check (char_length(trim(body)) > 0),
  created_at timestamptz not null default now()
);
create index if not exists dd_messages_job_id_created_at_idx on public.dd_messages (job_id, created_at);
alter table public.dd_messages enable row level security;

alter table public.dd_jobs add column if not exists sla_due_at timestamptz;

alter table public.dd_provider_application_documents add column if not exists version integer not null default 1;
alter table public.dd_provider_application_documents add column if not exists expires_at timestamptz;
alter table public.dd_vendor_onboarding_documents add column if not exists version integer not null default 1;
alter table public.dd_vendor_onboarding_documents add column if not exists expires_at timestamptz;