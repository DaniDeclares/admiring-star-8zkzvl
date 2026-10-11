-- Forensic reconstruction of two tables that exist in Production but have no creating migration in the Production
-- ledger or in source. Their definitions below were read read-only from the Production catalog on 2026-10-11
-- (information_schema, pg_constraint, pg_indexes, pg_class.relrowsecurity, role_table_grants). Idempotent: a no-op where the
-- tables already exist (Production). It exists so a clean replay can satisfy later Production-ledger migrations that use them
-- (20261006235422 content engine, 20261007014229 holiday outcome routing). No data is created.

create table if not exists public.dd_content_draft_queue (
  id uuid not null default gen_random_uuid(),
  content_key text not null,
  target_surface text not null,
  audience_roles text[] not null default '{}'::text[],
  title_working text not null,
  content_goal text not null,
  source_evidence jsonb not null default '[]'::jsonb,
  required_disclaimers jsonb not null default '[]'::jsonb,
  draft_markdown text,
  status text not null default 'RESEARCH'::text,
  auto_publish_allowed boolean not null default false,
  official_training boolean not null default false,
  owner_review_required boolean not null default true,
  published_resource_id uuid,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now()
);

create table if not exists public.dd_execution_package_routing (
  package_code text not null,
  channel_code text not null,
  front_door_code text not null,
  outcome_code text not null,
  is_front_door_primary boolean not null default false,
  need_regex text not null,
  discovery_question text not null,
  updated_at timestamp with time zone not null default now(),
  constraint dd_execution_package_routing_pkey primary key (package_code),
  constraint dd_execution_package_routing_channel_code_check check (channel_code = any (array['CH01'::text, 'CH02'::text, 'CH03'::text, 'CH04'::text, 'CH05'::text])),
  constraint dd_execution_package_routing_package_code_fkey foreign key (package_code) references public.dd_governed_packages(package_code) on delete cascade
);

alter table public.dd_content_draft_queue enable row level security;
alter table public.dd_execution_package_routing enable row level security;
-- Production grants these tables to service_role only (RLS on, no policies).
revoke all on table public.dd_content_draft_queue from anon, authenticated;
revoke all on table public.dd_execution_package_routing from anon, authenticated;
