create table if not exists public.dd_public_intake_failures (
 id uuid primary key default gen_random_uuid(),
 trace_id text not null unique,
 route text not null,
 stage text not null,
 error_code text not null,
 error_name text,
 error_message text,
 service_id text,
 front_door_code text,
 channel_type text,
 customer_email text,
 request_context jsonb not null default '{}'::jsonb,
 created_at timestamptz not null default now()
);
alter table public.dd_public_intake_failures enable row level security;
comment on table public.dd_public_intake_failures is 'Server-side diagnostics for failed public intake requests. No anon/authenticated policies: service-role/operator diagnostics only.';
create index if not exists idx_dd_public_intake_failures_created_at on public.dd_public_intake_failures(created_at desc);
create index if not exists idx_dd_public_intake_failures_error_code on public.dd_public_intake_failures(error_code, created_at desc);
