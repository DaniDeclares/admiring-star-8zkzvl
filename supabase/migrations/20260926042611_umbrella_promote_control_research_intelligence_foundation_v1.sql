
create table if not exists public.dd_domain_external_evidence (
 id uuid primary key default gen_random_uuid(),
 evidence_key text not null unique,
 domain text not null,
 source_system text not null,
 evidence_type text not null,
 status text not null check(status in ('VERIFIED','PARTIAL','FAILED','STALE')),
 observed_at timestamptz not null,
 valid_through timestamptz,
 facts jsonb not null default '{}'::jsonb,
 authority_scope text not null default 'OBSERVATION_ONLY',
 external_contact_allowed boolean not null default false,
 money_action_allowed boolean not null default false,
 production_mutation_allowed boolean not null default false,
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now()
);

create table if not exists public.dd_enterprise_control_runs (
 id uuid primary key default gen_random_uuid(),
 started_at timestamptz not null default now(),
 completed_at timestamptz,
 status text not null default 'STARTED' check(status in ('STARTED','COMPLETED','DEGRADED','FAILED')),
 research_run_id uuid,
 safe_automation_run_id uuid,
 service_discovery_run_id uuid,
 commercial_reconciliation_run_id uuid,
 owner_attention_open integer not null default 0,
 external_actions_pending integer not null default 0,
 external_actions_claimed integer not null default 0,
 external_actions_retry_wait integer not null default 0,
 external_actions_dead_letter integer not null default 0,
 agent_runs_running integer not null default 0,
 agent_runs_broken integer not null default 0,
 summary jsonb not null default '{}'::jsonb
);

create table if not exists public.dd_intelligence_sources (
 id uuid primary key default gen_random_uuid(),
 source_key text not null unique,
 source_name text not null,
 source_family text not null,
 access_mode text not null,
 public_source boolean not null default true,
 terms_review_required boolean not null default true,
 robots_respect_required boolean not null default true,
 pii_minimization_required boolean not null default true,
 allowed_collection_scope jsonb not null default '{}'::jsonb,
 default_miner_keys text[] not null default '{}'::text[],
 status text not null default 'ACTIVE' check(status in ('ACTIVE','PAUSED','BLOCKED','RETIRED')),
 metadata jsonb not null default '{}'::jsonb,
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now(),
 terms_gate_status text not null default 'PENDING' check(terms_gate_status in ('NOT_REQUIRED','PENDING','APPROVED','BLOCKED')),
 terms_checked_at timestamptz,
 rate_limit_per_hour integer not null default 30,
 provenance_required boolean not null default true,
 collector_execution_allowed boolean not null default false
);

create table if not exists public.dd_intelligence_miners (
 id uuid primary key default gen_random_uuid(),
 miner_key text not null unique,
 miner_family text not null,
 miner_name text not null,
 purpose text not null,
 output_class text[] not null default '{}'::text[],
 default_route text[] not null default '{}'::text[],
 authority_boundary jsonb not null default '{"observation_only":true,"may_contact":false,"may_spend_money":false,"production_write":false,"may_change_policy":false,"may_change_pricing":false}'::jsonb,
 status text not null default 'ACTIVE' check(status in ('ACTIVE','PAUSED','RETIRED')),
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now()
);

create table if not exists public.dd_intelligence_observations (
 id uuid primary key default gen_random_uuid(),
 observation_key text not null unique,
 source_key text not null,
 source_record_key text,
 observed_at timestamptz not null default now(),
 subject_type text not null default 'UNKNOWN',
 subject_key text,
 subject_name text,
 event_type text,
 observed_claim text not null,
 evidence_url text,
 evidence_locator jsonb not null default '{}'::jsonb,
 signal_tags text[] not null default '{}'::text[],
 channel_hint text,
 geography_hint text,
 source_confidence numeric(5,4) not null default .5 check(source_confidence between 0 and 1),
 verification_status text not null default 'UNVERIFIED' check(verification_status in ('UNVERIFIED','PARTIAL','VERIFIED','CONFLICTED','STALE','REJECTED')),
 authority_status text not null default 'OBSERVATION_ONLY',
 raw_payload jsonb not null default '{}'::jsonb,
 content_hash text,
 first_seen_at timestamptz not null default now(),
 last_seen_at timestamptz not null default now(),
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now()
);
create unique index if not exists dd_intelligence_observation_source_record_uidx
 on public.dd_intelligence_observations(source_key,source_record_key) where source_record_key is not null;
create index if not exists dd_intelligence_observation_content_hash_idx
 on public.dd_intelligence_observations(source_key,content_hash) where content_hash is not null;
create index if not exists dd_intelligence_observations_source_idx on public.dd_intelligence_observations(source_key,observed_at desc);

create table if not exists public.dd_intelligence_miner_hits (
 id uuid primary key default gen_random_uuid(),
 observation_id uuid not null references public.dd_intelligence_observations(id) on delete cascade,
 miner_key text not null,
 signal_type text not null,
 signal_strength numeric(5,4) not null default .5 check(signal_strength between 0 and 1),
 relevance_score numeric(5,4) not null default .5 check(relevance_score between 0 and 1),
 channel_code text,
 service_family_hint text,
 route_target text not null,
 route_state text not null default 'OBSERVED' check(route_state in ('OBSERVED','VERIFY','RESEARCH','SALES_CANDIDATE','MARKET_INTELLIGENCE','RISK_REVIEW','SUPPLY_CANDIDATE','ARCHIVED')),
 requires_independent_verification boolean not null default true,
 contact_authority_allowed boolean not null default false,
 commercial_unlock_allowed boolean not null default false,
 pricing_authority_allowed boolean not null default false,
 implementation_authority_allowed boolean not null default false,
 rationale jsonb not null default '{}'::jsonb,
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now(),
 unique(observation_id,miner_key,signal_type,route_target)
);

create table if not exists public.dd_intelligence_collection_queue (
 id uuid primary key default gen_random_uuid(),
 collection_key text not null unique,
 source_key text not null,
 collector_kind text not null,
 query_profile jsonb not null default '{}'::jsonb,
 requested_miner_keys text[] not null default '{}'::text[],
 priority text not null default 'P2' check(priority in ('P0','P1','P2','P3')),
 status text not null default 'QUEUED' check(status in ('QUEUED','READY','RUNNING','SUCCEEDED','PARTIAL','BLOCKED','FAILED','PAUSED')),
 external_contact_allowed boolean not null default false,
 money_action_allowed boolean not null default false,
 production_mutation_allowed boolean not null default false,
 terms_gate_required boolean not null default true,
 last_run_at timestamptz,
 next_run_at timestamptz,
 blocker text,
 metadata jsonb not null default '{}'::jsonb,
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now()
);

create table if not exists public.dd_intelligence_collection_runs (
 id uuid primary key default gen_random_uuid(),
 run_key text not null unique,
 collection_key text not null,
 source_key text not null,
 replay_of_run_id uuid references public.dd_intelligence_collection_runs(id),
 run_state text not null check(run_state in ('STARTED','SUCCEEDED','PARTIAL','BLOCKED','FAILED')),
 gate_receipt jsonb not null default '{}'::jsonb,
 input_fingerprint text not null,
 discovered_count integer not null default 0,
 ingested_count integer not null default 0,
 deduped_count integer not null default 0,
 routed_hit_count integer not null default 0,
 external_contact_count integer not null default 0,
 money_action_count integer not null default 0,
 production_mutation_count integer not null default 0,
 started_at timestamptz not null default now(),
 completed_at timestamptz,
 error_text text,
 metadata jsonb not null default '{}'::jsonb
);

create table if not exists public.dd_intelligence_collection_run_items (
 id uuid primary key default gen_random_uuid(),
 run_id uuid not null references public.dd_intelligence_collection_runs(id) on delete cascade,
 observation_key text not null,
 source_record_key text,
 content_hash text,
 disposition text not null check(disposition in ('INGESTED','DEDUPED','REJECTED','BLOCKED')),
 observation_id uuid references public.dd_intelligence_observations(id),
 provenance jsonb not null default '{}'::jsonb,
 created_at timestamptz not null default now(),
 unique(run_id,observation_key)
);

create table if not exists public.dd_research_capacity_policy (
 policy_key text primary key,
 enabled boolean not null default true,
 max_sources_per_program_per_cycle integer not null default 2,
 max_total_sources_per_cycle integer not null default 8,
 reserve_non_service_discovery_pct integer not null default 75,
 priority_weights jsonb not null default '{"P0":100,"P1":50,"P2":10}'::jsonb,
 protected_programs text[] not null default '{}'::text[],
 updated_at timestamptz not null default now()
);
create table if not exists public.dd_research_coverage_gaps (
 gap_key text primary key,
 program_key text not null,
 open_work_items integer not null default 0,
 p0_open integer not null default 0,
 p1_open integer not null default 0,
 active_sources integer not null default 0,
 gap_status text not null default 'OPEN' check(gap_status in ('OPEN','COVERED','BLOCKED')),
 priority text not null default 'P1',
 next_action text not null,
 observed_at timestamptz not null default now(),
 updated_at timestamptz not null default now()
);
create table if not exists public.dd_research_dispatch_runs (
 id uuid primary key default gen_random_uuid(),
 started_at timestamptz not null default now(),
 completed_at timestamptz,
 status text not null default 'RUNNING',
 selected_sources jsonb not null default '[]'::jsonb,
 coverage_gaps_open integer not null default 0,
 service_discovery_selected integer not null default 0,
 non_service_selected integer not null default 0,
 summary jsonb not null default '{}'::jsonb
);
create table if not exists public.dd_research_pipeline_runs (
 id uuid primary key default gen_random_uuid(),
 started_at timestamptz not null default now(),
 completed_at timestamptz,
 status text not null default 'STARTED',
 pricing_economics_refreshed integer not null default 0,
 pricing_coverage_refreshed integer not null default 0,
 leads_promoted integer not null default 0,
 channel_items_resolved integer not null default 0,
 support_items_resolved integer not null default 0,
 fulfillment_items_resolved integer not null default 0,
 activation_items_resolved integer not null default 0,
 research_triggered boolean not null default false,
 summary jsonb not null default '{}'::jsonb
);
create table if not exists public.dd_research_synthesis_queue (
 id uuid primary key default gen_random_uuid(),
 synthesis_key text not null unique,
 research_work_id uuid,
 program_key text not null,
 work_key text,
 evidence_ids uuid[] not null default '{}'::uuid[],
 evidence_count integer not null default 0,
 confirmed_authority_levels text[] not null default '{}'::text[],
 synthesis_state text not null default 'READY' check(synthesis_state in ('READY','SYNTHESIZED','ROUTED','REVIEW_REQUIRED','BLOCKED','FAILED')),
 proposed_action_class text,
 proposed_build text,
 implementation_payload jsonb not null default '{}'::jsonb,
 acceptance_criteria text,
 permission_class text not null default 'REVIEW_REQUIRED' check(permission_class in ('AUTO_TESTER_BUILD','REVIEW_REQUIRED')),
 blocker text,
 synthesized_at timestamptz,
 routed_at timestamptz,
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now()
);

do $$
declare t text;
begin
 foreach t in array ARRAY[
 'dd_domain_external_evidence','dd_enterprise_control_runs',
 'dd_intelligence_sources','dd_intelligence_miners','dd_intelligence_observations','dd_intelligence_miner_hits',
 'dd_intelligence_collection_queue','dd_intelligence_collection_runs','dd_intelligence_collection_run_items',
 'dd_research_capacity_policy','dd_research_coverage_gaps','dd_research_dispatch_runs','dd_research_pipeline_runs','dd_research_synthesis_queue'
 ] loop
   execute format('alter table public.%I enable row level security',t);
   execute format('revoke all on public.%I from anon,authenticated',t);
   execute format('grant all on public.%I to service_role',t);
 end loop;
end $$;
