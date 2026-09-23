-- DANI DECLARES full-platform release controls.
-- Establishes the shared job lifecycle ledger, service-task instantiation bridge,
-- and channel-wide 10-pass release audit registry.
--
-- This migration does NOT activate any service. Release state remains governed by
-- existing commercial/release contracts; this migration only records and enforces
-- operational proof infrastructure.

create table if not exists public.dd_job_lifecycle_history (
  id uuid primary key default gen_random_uuid(),
  job_id uuid not null references public.dd_jobs(id) on delete cascade,
  from_status text,
  to_status text not null,
  event_type text not null,
  actor_id uuid references auth.users(id),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists dd_job_lifecycle_history_job_idx
  on public.dd_job_lifecycle_history(job_id, created_at desc);
create index if not exists dd_job_lifecycle_history_actor_idx
  on public.dd_job_lifecycle_history(actor_id, created_at desc);

alter table public.dd_job_lifecycle_history enable row level security;
revoke all on public.dd_job_lifecycle_history from anon;
revoke insert, update, delete on public.dd_job_lifecycle_history from authenticated;
grant select on public.dd_job_lifecycle_history to authenticated;

drop policy if exists dd_job_lifecycle_history_staff_read on public.dd_job_lifecycle_history;
create policy dd_job_lifecycle_history_staff_read
  on public.dd_job_lifecycle_history
  for select
  to authenticated
  using ((select private.dd_is_staff_admin()));

create or replace function private.dd_record_job_lifecycle_history()
returns trigger
language plpgsql
security definer
set search_path = public, private, pg_catalog
as $$
begin
  if tg_op = 'INSERT' then
    insert into public.dd_job_lifecycle_history
      (job_id, from_status, to_status, event_type, actor_id, metadata)
    values
      (new.id, null, new.job_status, 'JOB_CREATED', auth.uid(),
       jsonb_build_object(
         'public_reference', new.public_reference,
         'division_slug', new.division_slug
       ));
    return new;
  end if;

  if new.job_status is distinct from old.job_status then
    insert into public.dd_job_lifecycle_history
      (job_id, from_status, to_status, event_type, actor_id, metadata)
    values
      (new.id, old.job_status, new.job_status, 'JOB_STATUS_CHANGED', auth.uid(),
       jsonb_build_object(
         'public_reference', new.public_reference,
         'division_slug', new.division_slug
       ));
  end if;

  return new;
end;
$$;

revoke execute on function private.dd_record_job_lifecycle_history() from public, anon, authenticated;

drop trigger if exists dd_job_lifecycle_history_trigger on public.dd_jobs;
create trigger dd_job_lifecycle_history_trigger
after insert or update of job_status on public.dd_jobs
for each row
execute function private.dd_record_job_lifecycle_history();

create or replace function private.dd_instantiate_job_tasks(p_job_id uuid)
returns integer
language plpgsql
security definer
set search_path = public, private, pg_catalog
as $$
declare
  v_service_id uuid;
  v_inserted integer := 0;
begin
  select sr.service_id
    into v_service_id
  from public.dd_jobs j
  join public.service_requests sr on sr.id = j.service_request_id
  where j.id = p_job_id;

  if v_service_id is null then
    return 0;
  end if;

  insert into public.dd_job_tasks
    (job_id, task_name, task_type, status, sort_order, notes,
     template_id, is_required, evidence_required)
  select
    p_job_id,
    t.task_name,
    t.task_type,
    'pending',
    t.sort_order,
    t.notes,
    t.id,
    t.is_required,
    t.evidence_required
  from public.dd_task_templates t
  where t.service_id = v_service_id
    and t.is_active = true
    and not exists (
      select 1
      from public.dd_job_tasks jt
      where jt.job_id = p_job_id
        and jt.template_id = t.id
    )
  order by t.sort_order, t.created_at;

  get diagnostics v_inserted = row_count;
  return v_inserted;
end;
$$;

revoke execute on function private.dd_instantiate_job_tasks(uuid) from public, anon, authenticated;

create or replace function private.dd_after_job_created_instantiate_tasks()
returns trigger
language plpgsql
security definer
set search_path = public, private, pg_catalog
as $$
begin
  perform private.dd_instantiate_job_tasks(new.id);
  return new;
end;
$$;

revoke execute on function private.dd_after_job_created_instantiate_tasks() from public, anon, authenticated;

drop trigger if exists dd_job_task_instantiation_trigger on public.dd_jobs;
create trigger dd_job_task_instantiation_trigger
after insert on public.dd_jobs
for each row
execute function private.dd_after_job_created_instantiate_tasks();

create table if not exists public.dd_platform_release_audit_10_pass (
  id uuid primary key default gen_random_uuid(),
  channel_code text not null references public.dd_commercial_channels(code),
  pass_number integer not null check (pass_number between 1 and 10),
  pass_name text not null,
  lifecycle_stage text not null,
  status text not null check (status in ('GREEN','YELLOW','RED','NOT_PROVEN')),
  current_state text not null,
  blocking_gap text not null,
  green_exit_criteria text not null,
  required_build text not null,
  priority text not null default 'P0',
  audit_version text not null default '2026-09-21-platform-v1',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(channel_code, pass_number, audit_version)
);

create index if not exists dd_platform_release_audit_channel_idx
  on public.dd_platform_release_audit_10_pass(channel_code, status, pass_number);

alter table public.dd_platform_release_audit_10_pass enable row level security;
revoke all on public.dd_platform_release_audit_10_pass from anon;
revoke insert, update, delete on public.dd_platform_release_audit_10_pass from authenticated;
grant select on public.dd_platform_release_audit_10_pass to authenticated;

drop policy if exists dd_platform_release_audit_staff_read on public.dd_platform_release_audit_10_pass;
create policy dd_platform_release_audit_staff_read
  on public.dd_platform_release_audit_10_pass
  for select
  to authenticated
  using ((select private.dd_is_staff_admin()));

-- CH01 already has a source-controlled 10-pass audit. Carry its latest assessment
-- into the universal registry rather than duplicating or rewriting it.
insert into public.dd_platform_release_audit_10_pass
  (channel_code, pass_number, pass_name, lifecycle_stage, status, current_state,
   blocking_gap, green_exit_criteria, required_build, priority, audit_version)
select
  'CH01',
  pass_number,
  pass_name,
  lifecycle_stage,
  case status when 'RED' then 'RED' when 'YELLOW' then 'YELLOW' else 'NOT_PROVEN' end,
  current_state,
  blocking_gap,
  green_exit_criteria,
  required_build,
  priority,
  '2026-09-21-platform-v1'
from public.dd_ch01_release_audit_10_pass
where audit_version = (
  select max(audit_version) from public.dd_ch01_release_audit_10_pass
)
on conflict(channel_code, pass_number, audit_version) do update set
  status = excluded.status,
  current_state = excluded.current_state,
  blocking_gap = excluded.blocking_gap,
  green_exit_criteria = excluded.green_exit_criteria,
  required_build = excluded.required_build,
  priority = excluded.priority,
  updated_at = now();

-- Other channels are intentionally marked NOT_PROVEN until they receive their
-- own evidence-backed 10-pass audit. CH02 has partial architecture/runtime work,
-- but no full end-to-end proof is inferred here.
insert into public.dd_platform_release_audit_10_pass
  (channel_code, pass_number, pass_name, lifecycle_stage, status, current_state,
   blocking_gap, green_exit_criteria, required_build, priority, audit_version)
values
  ('CH02', 1, 'Customer entry & relationship', 'CUSTOMER', 'YELLOW', 'Shared architecture and partial runtime path exist; full production proof remains open.', 'Representative channel transaction is not yet proven through every commercial, fulfillment, worker, evidence and closeout gate.', 'A representative governed transaction completes this pass without manual database intervention and leaves auditable evidence.', 'Execute this pass against the channel-specific rules while reusing the shared DANI operating kernel.', 'P0', '2026-09-21-platform-v1'),\n  ('CH02', 2, 'Canonical service identity & sellability', 'SERVICE', 'YELLOW', 'Shared architecture and partial runtime path exist; full production proof remains open.', 'Representative channel transaction is not yet proven through every commercial, fulfillment, worker, evidence and closeout gate.', 'A representative governed transaction completes this pass without manual database intervention and leaves auditable evidence.', 'Execute this pass against the channel-specific rules while reusing the shared DANI operating kernel.', 'P0', '2026-09-21-platform-v1'),\n  ('CH02', 3, 'Scope & input contract', 'SCOPE', 'YELLOW', 'Shared architecture and partial runtime path exist; full production proof remains open.', 'Representative channel transaction is not yet proven through every commercial, fulfillment, worker, evidence and closeout gate.', 'A representative governed transaction completes this pass without manual database intervention and leaves auditable evidence.', 'Execute this pass against the channel-specific rules while reusing the shared DANI operating kernel.', 'P0', '2026-09-21-platform-v1'),\n  ('CH02', 4, 'Pricing & commercial authority', 'COMMERCIAL', 'YELLOW', 'Shared architecture and partial runtime path exist; full production proof remains open.', 'Representative channel transaction is not yet proven through every commercial, fulfillment, worker, evidence and closeout gate.', 'A representative governed transaction completes this pass without manual database intervention and leaves auditable evidence.', 'Execute this pass against the channel-specific rules while reusing the shared DANI operating kernel.', 'P0', '2026-09-21-platform-v1'),\n  ('CH02', 5, 'Request & estimate handoff', 'REQUEST', 'YELLOW', 'Shared architecture and partial runtime path exist; full production proof remains open.', 'Representative channel transaction is not yet proven through every commercial, fulfillment, worker, evidence and closeout gate.', 'A representative governed transaction completes this pass without manual database intervention and leaves auditable evidence.', 'Execute this pass against the channel-specific rules while reusing the shared DANI operating kernel.', 'P0', '2026-09-21-platform-v1'),\n  ('CH02', 6, 'Checkout & payment initiation', 'CHECKOUT', 'YELLOW', 'Shared architecture and partial runtime path exist; full production proof remains open.', 'Representative channel transaction is not yet proven through every commercial, fulfillment, worker, evidence and closeout gate.', 'A representative governed transaction completes this pass without manual database intervention and leaves auditable evidence.', 'Execute this pass against the channel-specific rules while reusing the shared DANI operating kernel.', 'P0', '2026-09-21-platform-v1'),\n  ('CH02', 7, 'Payment → job → accounting', 'PAYMENT', 'YELLOW', 'Shared architecture and partial runtime path exist; full production proof remains open.', 'Representative channel transaction is not yet proven through every commercial, fulfillment, worker, evidence and closeout gate.', 'A representative governed transaction completes this pass without manual database intervention and leaves auditable evidence.', 'Execute this pass against the channel-specific rules while reusing the shared DANI operating kernel.', 'P0', '2026-09-21-platform-v1'),\n  ('CH02', 8, 'Operations → dispatch → scheduling → worker', 'FULFILLMENT', 'NOT_PROVEN', 'Shared architecture and partial runtime path exist; full production proof remains open.', 'Representative channel transaction is not yet proven through every commercial, fulfillment, worker, evidence and closeout gate.', 'A representative governed transaction completes this pass without manual database intervention and leaves auditable evidence.', 'Execute this pass against the channel-specific rules while reusing the shared DANI operating kernel.', 'P0', '2026-09-21-platform-v1'),\n  ('CH02', 9, 'Worker execution → evidence → QA → completion', 'EXECUTION', 'NOT_PROVEN', 'Shared architecture and partial runtime path exist; full production proof remains open.', 'Representative channel transaction is not yet proven through every commercial, fulfillment, worker, evidence and closeout gate.', 'A representative governed transaction completes this pass without manual database intervention and leaves auditable evidence.', 'Execute this pass against the channel-specific rules while reusing the shared DANI operating kernel.', 'P0', '2026-09-21-platform-v1'),\n  ('CH02', 10, 'End-to-end release & production proof', 'PROOF', 'NOT_PROVEN', 'Shared architecture and partial runtime path exist; full production proof remains open.', 'Representative channel transaction is not yet proven through every commercial, fulfillment, worker, evidence and closeout gate.', 'A representative governed transaction completes this pass without manual database intervention and leaves auditable evidence.', 'Execute this pass against the channel-specific rules while reusing the shared DANI operating kernel.', 'P0', '2026-09-21-platform-v1'),\n  ('CH03', 1, 'Customer entry & relationship', 'CUSTOMER', 'NOT_PROVEN', 'Channel exists in the commercial registry, but a channel-specific 10-pass production audit has not yet been completed.', 'Do not infer readiness from shared kernel, catalog rows, or isolated page/API readiness.', 'A representative governed transaction completes this pass without manual database intervention and leaves auditable evidence.', 'Execute this pass against the channel-specific rules while reusing the shared DANI operating kernel.', 'P0', '2026-09-21-platform-v1'),\n  ('CH03', 2, 'Canonical service identity & sellability', 'SERVICE', 'NOT_PROVEN', 'Channel exists in the commercial registry, but a channel-specific 10-pass production audit has not yet been completed.', 'Do not infer readiness from shared kernel, catalog rows, or isolated page/API readiness.', 'A representative governed transaction completes this pass without manual database intervention and leaves auditable evidence.', 'Execute this pass against the channel-specific rules while reusing the shared DANI operating kernel.', 'P0', '2026-09-21-platform-v1'),\n  ('CH03', 3, 'Scope & input contract', 'SCOPE', 'NOT_PROVEN', 'Channel exists in the commercial registry, but a channel-specific 10-pass production audit has not yet been completed.', 'Do not infer readiness from shared kernel, catalog rows, or isolated page/API readiness.', 'A representative governed transaction completes this pass without manual database intervention and leaves auditable evidence.', 'Execute this pass against the channel-specific rules while reusing the shared DANI operating kernel.', 'P0', '2026-09-21-platform-v1'),\n  ('CH03', 4, 'Pricing & commercial authority', 'COMMERCIAL', 'NOT_PROVEN', 'Channel exists in the commercial registry, but a channel-specific 10-pass production audit has not yet been completed.', 'Do not infer readiness from shared kernel, catalog rows, or isolated page/API readiness.', 'A representative governed transaction completes this pass without manual database intervention and leaves auditable evidence.', 'Execute this pass against the channel-specific rules while reusing the shared DANI operating kernel.', 'P0', '2026-09-21-platform-v1'),\n  ('CH03', 5, 'Request & estimate handoff', 'REQUEST', 'NOT_PROVEN', 'Channel exists in the commercial registry, but a channel-specific 10-pass production audit has not yet been completed.', 'Do not infer readiness from shared kernel, catalog rows, or isolated page/API readiness.', 'A representative governed transaction completes this pass without manual database intervention and leaves auditable evidence.', 'Execute this pass against the channel-specific rules while reusing the shared DANI operating kernel.', 'P0', '2026-09-21-platform-v1'),\n  ('CH03', 6, 'Checkout & payment initiation', 'CHECKOUT', 'NOT_PROVEN', 'Channel exists in the commercial registry, but a channel-specific 10-pass production audit has not yet been completed.', 'Do not infer readiness from shared kernel, catalog rows, or isolated page/API readiness.', 'A representative governed transaction completes this pass without manual database intervention and leaves auditable evidence.', 'Execute this pass against the channel-specific rules while reusing the shared DANI operating kernel.', 'P0', '2026-09-21-platform-v1'),\n  ('CH03', 7, 'Payment → job → accounting', 'PAYMENT', 'NOT_PROVEN', 'Channel exists in the commercial registry, but a channel-specific 10-pass production audit has not yet been completed.', 'Do not infer readiness from shared kernel, catalog rows, or isolated page/API readiness.', 'A representative governed transaction completes this pass without manual database intervention and leaves auditable evidence.', 'Execute this pass against the channel-specific rules while reusing the shared DANI operating kernel.', 'P0', '2026-09-21-platform-v1'),\n  ('CH03', 8, 'Operations → dispatch → scheduling → worker', 'FULFILLMENT', 'NOT_PROVEN', 'Channel exists in the commercial registry, but a channel-specific 10-pass production audit has not yet been completed.', 'Do not infer readiness from shared kernel, catalog rows, or isolated page/API readiness.', 'A representative governed transaction completes this pass without manual database intervention and leaves auditable evidence.', 'Execute this pass against the channel-specific rules while reusing the shared DANI operating kernel.', 'P0', '2026-09-21-platform-v1'),\n  ('CH03', 9, 'Worker execution → evidence → QA → completion', 'EXECUTION', 'NOT_PROVEN', 'Channel exists in the commercial registry, but a channel-specific 10-pass production audit has not yet been completed.', 'Do not infer readiness from shared kernel, catalog rows, or isolated page/API readiness.', 'A representative governed transaction completes this pass without manual database intervention and leaves auditable evidence.', 'Execute this pass against the channel-specific rules while reusing the shared DANI operating kernel.', 'P0', '2026-09-21-platform-v1'),\n  ('CH03', 10, 'End-to-end release & production proof', 'PROOF', 'NOT_PROVEN', 'Channel exists in the commercial registry, but a channel-specific 10-pass production audit has not yet been completed.', 'Do not infer readiness from shared kernel, catalog rows, or isolated page/API readiness.', 'A representative governed transaction completes this pass without manual database intervention and leaves auditable evidence.', 'Execute this pass against the channel-specific rules while reusing the shared DANI operating kernel.', 'P0', '2026-09-21-platform-v1'),\n  ('CH04', 1, 'Customer entry & relationship', 'CUSTOMER', 'NOT_PROVEN', 'Channel exists in the commercial registry, but a channel-specific 10-pass production audit has not yet been completed.', 'Do not infer readiness from shared kernel, catalog rows, or isolated page/API readiness.', 'A representative governed transaction completes this pass without manual database intervention and leaves auditable evidence.', 'Execute this pass against the channel-specific rules while reusing the shared DANI operating kernel.', 'P0', '2026-09-21-platform-v1'),\n  ('CH04', 2, 'Canonical service identity & sellability', 'SERVICE', 'NOT_PROVEN', 'Channel exists in the commercial registry, but a channel-specific 10-pass production audit has not yet been completed.', 'Do not infer readiness from shared kernel, catalog rows, or isolated page/API readiness.', 'A representative governed transaction completes this pass without manual database intervention and leaves auditable evidence.', 'Execute this pass against the channel-specific rules while reusing the shared DANI operating kernel.', 'P0', '2026-09-21-platform-v1'),\n  ('CH04', 3, 'Scope & input contract', 'SCOPE', 'NOT_PROVEN', 'Channel exists in the commercial registry, but a channel-specific 10-pass production audit has not yet been completed.', 'Do not infer readiness from shared kernel, catalog rows, or isolated page/API readiness.', 'A representative governed transaction completes this pass without manual database intervention and leaves auditable evidence.', 'Execute this pass against the channel-specific rules while reusing the shared DANI operating kernel.', 'P0', '2026-09-21-platform-v1'),\n  ('CH04', 4, 'Pricing & commercial authority', 'COMMERCIAL', 'NOT_PROVEN', 'Channel exists in the commercial registry, but a channel-specific 10-pass production audit has not yet been completed.', 'Do not infer readiness from shared kernel, catalog rows, or isolated page/API readiness.', 'A representative governed transaction completes this pass without manual database intervention and leaves auditable evidence.', 'Execute this pass against the channel-specific rules while reusing the shared DANI operating kernel.', 'P0', '2026-09-21-platform-v1'),\n  ('CH04', 5, 'Request & estimate handoff', 'REQUEST', 'NOT_PROVEN', 'Channel exists in the commercial registry, but a channel-specific 10-pass production audit has not yet been completed.', 'Do not infer readiness from shared kernel, catalog rows, or isolated page/API readiness.', 'A representative governed transaction completes this pass without manual database intervention and leaves auditable evidence.', 'Execute this pass against the channel-specific rules while reusing the shared DANI operating kernel.', 'P0', '2026-09-21-platform-v1'),\n  ('CH04', 6, 'Checkout & payment initiation', 'CHECKOUT', 'NOT_PROVEN', 'Channel exists in the commercial registry, but a channel-specific 10-pass production audit has not yet been completed.', 'Do not infer readiness from shared kernel, catalog rows, or isolated page/API readiness.', 'A representative governed transaction completes this pass without manual database intervention and leaves auditable evidence.', 'Execute this pass against the channel-specific rules while reusing the shared DANI operating kernel.', 'P0', '2026-09-21-platform-v1'),\n  ('CH04', 7, 'Payment → job → accounting', 'PAYMENT', 'NOT_PROVEN', 'Channel exists in the commercial registry, but a channel-specific 10-pass production audit has not yet been completed.', 'Do not infer readiness from shared kernel, catalog rows, or isolated page/API readiness.', 'A representative governed transaction completes this pass without manual database intervention and leaves auditable evidence.', 'Execute this pass against the channel-specific rules while reusing the shared DANI operating kernel.', 'P0', '2026-09-21-platform-v1'),\n  ('CH04', 8, 'Operations → dispatch → scheduling → worker', 'FULFILLMENT', 'NOT_PROVEN', 'Channel exists in the commercial registry, but a channel-specific 10-pass production audit has not yet been completed.', 'Do not infer readiness from shared kernel, catalog rows, or isolated page/API readiness.', 'A representative governed transaction completes this pass without manual database intervention and leaves auditable evidence.', 'Execute this pass against the channel-specific rules while reusing the shared DANI operating kernel.', 'P0', '2026-09-21-platform-v1'),\n  ('CH04', 9, 'Worker execution → evidence → QA → completion', 'EXECUTION', 'NOT_PROVEN', 'Channel exists in the commercial registry, but a channel-specific 10-pass production audit has not yet been completed.', 'Do not infer readiness from shared kernel, catalog rows, or isolated page/API readiness.', 'A representative governed transaction completes this pass without manual database intervention and leaves auditable evidence.', 'Execute this pass against the channel-specific rules while reusing the shared DANI operating kernel.', 'P0', '2026-09-21-platform-v1'),\n  ('CH04', 10, 'End-to-end release & production proof', 'PROOF', 'NOT_PROVEN', 'Channel exists in the commercial registry, but a channel-specific 10-pass production audit has not yet been completed.', 'Do not infer readiness from shared kernel, catalog rows, or isolated page/API readiness.', 'A representative governed transaction completes this pass without manual database intervention and leaves auditable evidence.', 'Execute this pass against the channel-specific rules while reusing the shared DANI operating kernel.', 'P0', '2026-09-21-platform-v1'),\n  ('CH05', 1, 'Customer entry & relationship', 'CUSTOMER', 'NOT_PROVEN', 'Channel exists in the commercial registry, but a channel-specific 10-pass production audit has not yet been completed.', 'Do not infer readiness from shared kernel, catalog rows, or isolated page/API readiness.', 'A representative governed transaction completes this pass without manual database intervention and leaves auditable evidence.', 'Execute this pass against the channel-specific rules while reusing the shared DANI operating kernel.', 'P0', '2026-09-21-platform-v1'),\n  ('CH05', 2, 'Canonical service identity & sellability', 'SERVICE', 'NOT_PROVEN', 'Channel exists in the commercial registry, but a channel-specific 10-pass production audit has not yet been completed.', 'Do not infer readiness from shared kernel, catalog rows, or isolated page/API readiness.', 'A representative governed transaction completes this pass without manual database intervention and leaves auditable evidence.', 'Execute this pass against the channel-specific rules while reusing the shared DANI operating kernel.', 'P0', '2026-09-21-platform-v1'),\n  ('CH05', 3, 'Scope & input contract', 'SCOPE', 'NOT_PROVEN', 'Channel exists in the commercial registry, but a channel-specific 10-pass production audit has not yet been completed.', 'Do not infer readiness from shared kernel, catalog rows, or isolated page/API readiness.', 'A representative governed transaction completes this pass without manual database intervention and leaves auditable evidence.', 'Execute this pass against the channel-specific rules while reusing the shared DANI operating kernel.', 'P0', '2026-09-21-platform-v1'),\n  ('CH05', 4, 'Pricing & commercial authority', 'COMMERCIAL', 'NOT_PROVEN', 'Channel exists in the commercial registry, but a channel-specific 10-pass production audit has not yet been completed.', 'Do not infer readiness from shared kernel, catalog rows, or isolated page/API readiness.', 'A representative governed transaction completes this pass without manual database intervention and leaves auditable evidence.', 'Execute this pass against the channel-specific rules while reusing the shared DANI operating kernel.', 'P0', '2026-09-21-platform-v1'),\n  ('CH05', 5, 'Request & estimate handoff', 'REQUEST', 'NOT_PROVEN', 'Channel exists in the commercial registry, but a channel-specific 10-pass production audit has not yet been completed.', 'Do not infer readiness from shared kernel, catalog rows, or isolated page/API readiness.', 'A representative governed transaction completes this pass without manual database intervention and leaves auditable evidence.', 'Execute this pass against the channel-specific rules while reusing the shared DANI operating kernel.', 'P0', '2026-09-21-platform-v1'),\n  ('CH05', 6, 'Checkout & payment initiation', 'CHECKOUT', 'NOT_PROVEN', 'Channel exists in the commercial registry, but a channel-specific 10-pass production audit has not yet been completed.', 'Do not infer readiness from shared kernel, catalog rows, or isolated page/API readiness.', 'A representative governed transaction completes this pass without manual database intervention and leaves auditable evidence.', 'Execute this pass against the channel-specific rules while reusing the shared DANI operating kernel.', 'P0', '2026-09-21-platform-v1'),\n  ('CH05', 7, 'Payment → job → accounting', 'PAYMENT', 'NOT_PROVEN', 'Channel exists in the commercial registry, but a channel-specific 10-pass production audit has not yet been completed.', 'Do not infer readiness from shared kernel, catalog rows, or isolated page/API readiness.', 'A representative governed transaction completes this pass without manual database intervention and leaves auditable evidence.', 'Execute this pass against the channel-specific rules while reusing the shared DANI operating kernel.', 'P0', '2026-09-21-platform-v1'),\n  ('CH05', 8, 'Operations → dispatch → scheduling → worker', 'FULFILLMENT', 'NOT_PROVEN', 'Channel exists in the commercial registry, but a channel-specific 10-pass production audit has not yet been completed.', 'Do not infer readiness from shared kernel, catalog rows, or isolated page/API readiness.', 'A representative governed transaction completes this pass without manual database intervention and leaves auditable evidence.', 'Execute this pass against the channel-specific rules while reusing the shared DANI operating kernel.', 'P0', '2026-09-21-platform-v1'),\n  ('CH05', 9, 'Worker execution → evidence → QA → completion', 'EXECUTION', 'NOT_PROVEN', 'Channel exists in the commercial registry, but a channel-specific 10-pass production audit has not yet been completed.', 'Do not infer readiness from shared kernel, catalog rows, or isolated page/API readiness.', 'A representative governed transaction completes this pass without manual database intervention and leaves auditable evidence.', 'Execute this pass against the channel-specific rules while reusing the shared DANI operating kernel.', 'P0', '2026-09-21-platform-v1'),\n  ('CH05', 10, 'End-to-end release & production proof', 'PROOF', 'NOT_PROVEN', 'Channel exists in the commercial registry, but a channel-specific 10-pass production audit has not yet been completed.', 'Do not infer readiness from shared kernel, catalog rows, or isolated page/API readiness.', 'A representative governed transaction completes this pass without manual database intervention and leaves auditable evidence.', 'Execute this pass against the channel-specific rules while reusing the shared DANI operating kernel.', 'P0', '2026-09-21-platform-v1')

on conflict(channel_code, pass_number, audit_version) do update set
  status = excluded.status,
  current_state = excluded.current_state,
  blocking_gap = excluded.blocking_gap,
  green_exit_criteria = excluded.green_exit_criteria,
  required_build = excluded.required_build,
  priority = excluded.priority,
  updated_at = now();

-- Close the specific public SECURITY DEFINER execution finding surfaced by
-- Supabase Advisors. The function remains usable as a trigger function.
revoke execute on function public.dd_link_provider_portal_identity() from public, anon, authenticated;
