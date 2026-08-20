-- G6 — Tasks, Checklists & Field Execution
-- Operational only. This migration does not create or mutate pricing.
-- It intentionally contains no price, discount, tax, travel, materials, or invoice fields.

create table if not exists public.dd_task_templates (
  id uuid primary key default gen_random_uuid(),
  template_key text not null unique,
  channel_type text,
  service_id uuid references public.services(id) on delete set null,
  task_type text not null,
  task_name text not null,
  is_required boolean not null default true,
  evidence_required boolean not null default false,
  sort_order integer not null default 100,
  notes text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_dd_task_templates_lookup
  on public.dd_task_templates(channel_type, service_id, is_active, sort_order);

alter table public.dd_job_tasks
  add column if not exists template_id uuid references public.dd_task_templates(id) on delete set null,
  add column if not exists is_required boolean not null default true,
  add column if not exists evidence_required boolean not null default false,
  add column if not exists evidence_ref text,
  add column if not exists completed_at timestamptz,
  add column if not exists completed_by uuid,
  add column if not exists blocked_reason text;

create index if not exists idx_dd_job_tasks_execution
  on public.dd_job_tasks(job_id, is_required, status, sort_order);

create unique index if not exists uq_dd_job_tasks_job_template
  on public.dd_job_tasks(job_id, template_id)
  where template_id is not null;

create table if not exists public.dd_task_events (
  id uuid primary key default gen_random_uuid(),
  job_id uuid not null references public.dd_jobs(id) on delete cascade,
  task_id uuid references public.dd_job_tasks(id) on delete set null,
  actor_id uuid,
  event_type text not null,
  description text not null,
  metadata jsonb,
  created_at timestamptz not null default now()
);

create index if not exists idx_dd_task_events_job
  on public.dd_task_events(job_id, created_at desc);

create index if not exists idx_dd_task_events_task
  on public.dd_task_events(task_id, created_at desc);

-- Generic channel-level templates. Service-specific templates should only be
-- added after their canonical service IDs have been verified in the catalog.
insert into public.dd_task_templates
  (template_key, channel_type, task_type, task_name, is_required, evidence_required, sort_order, notes)
values
  ('B2C_STANDARD_INTAKE_VERIFY', 'B2C', 'INTAKE_VERIFY', 'Verify booked scope and access instructions', true, false, 10, null),
  ('B2B_APT_PROPERTY_ACCESS_VERIFY', 'B2B-APT', 'PROPERTY_ACCESS_VERIFY', 'Verify property access, unit readiness, and site instructions', true, true, 10, null),
  ('B2B_APT_SCOPE_DOCUMENTATION', 'B2B-APT', 'SCOPE_DOCUMENTATION', 'Document field condition against approved work scope', true, true, 20, null),
  ('B2B_RE_PROPERTY_SCOPE_VERIFY', 'B2B-RE', 'PROPERTY_SCOPE_VERIFY', 'Verify property preparation scope and access instructions', true, true, 10, null),
  ('B2B_SCOPE_DOCUMENTATION', 'B2B', 'SCOPE_DOCUMENTATION', 'Document field condition against approved commercial scope', true, true, 10, null),
  ('B2B2C_SCOPE_VERIFY', 'B2B2C', 'SCOPE_VERIFY', 'Verify approved service scope and access instructions', true, true, 10, null),
  ('B2G_SITE_REQUIREMENTS_VERIFY', 'B2G', 'SITE_REQUIREMENTS_VERIFY', 'Verify site-specific statement-of-work requirements before execution', true, true, 10, null),
  ('B2G_COMPLETION_DOCUMENTATION', 'B2G', 'COMPLETION_DOCUMENTATION', 'Capture required completion documentation for the task order', true, true, 20, null)
on conflict (template_key) do update set
  channel_type = excluded.channel_type,
  task_type = excluded.task_type,
  task_name = excluded.task_name,
  is_required = excluded.is_required,
  evidence_required = excluded.evidence_required,
  sort_order = excluded.sort_order,
  is_active = true,
  updated_at = now();

-- Keep operational tables behind authenticated server-side workflows. No public
-- booking or anonymous write policies are introduced by G6.
alter table public.dd_task_templates enable row level security;
alter table public.dd_task_events enable row level security;

-- Existing dd_job_tasks RLS posture is preserved. G6 does not broaden it.
