
create table if not exists public.dd_autobuild_policy(
 policy_key text primary key, enabled boolean not null default true, target_environment text not null default 'TESTER',
 allowed_actions jsonb not null, prohibited_actions jsonb not null, escalation_domains jsonb not null,
 max_candidates_per_cycle integer not null default 5, max_open_candidates integer not null default 20,
 require_evidence boolean not null default true, require_acceptance_criteria boolean not null default true,
 require_isolated_branch boolean not null default true, auto_merge_allowed boolean not null default false,
 production_write_allowed boolean not null default false, permission_expansion_allowed boolean not null default false,
 external_money_action_allowed boolean not null default false, customer_provider_contact_allowed boolean not null default false,
 kill_switch boolean not null default false, updated_at timestamptz not null default now(),
 max_concurrent_builds integer not null default 1, max_consecutive_failures integer not null default 2,
 lease_minutes integer not null default 30, consecutive_failures integer not null default 0,
 circuit_open boolean not null default false, circuit_opened_at timestamptz
);
create table if not exists public.dd_autobuild_candidates(
 id uuid primary key default gen_random_uuid(), candidate_key text not null unique, source_type text not null,
 source_record_id text not null, domain text not null, title text not null, proposed_build text not null,
 evidence jsonb not null default '{}'::jsonb, acceptance_criteria text not null, risk_tier text not null,
 permission_class text not null, status text not null default 'CANDIDATE', blocker text, code_repair_work_id uuid,
 created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
 lease_token uuid, lease_owner text, leased_at timestamptz, lease_expires_at timestamptz,
 attempt_count integer not null default 0, executor_state text not null default 'PENDING',
 branch_name text, pull_request_number integer, pull_request_url text, head_sha text,
 proof jsonb not null default '{}'::jsonb, last_error text, built_at timestamptz, proven_at timestamptz
);
create table if not exists public.dd_code_repair_work_queue(
 id uuid primary key default gen_random_uuid(), policy_key text not null, work_key text not null unique,
 failure_kind text not null, failure_evidence jsonb not null default '{}'::jsonb,
 repo text not null default 'DaniDeclares/admiring-star-8zkzvl', target_branch text not null default 'main',
 status text not null default 'QUEUED', execution_mode text not null default 'DRY_RUN',
 last_result jsonb not null default '{}'::jsonb, attempts integer not null default 0,
 created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
 governed_run_id uuid, decision_snapshot_id uuid, external_action_id uuid, claimed_by text, claimed_at timestamptz
);
create table if not exists public.dd_security_regression_runs(
 id uuid primary key default gen_random_uuid(), environment text not null default 'PRODUCTION',
 status text not null, assertions_total integer not null, assertions_passed integer not null,
 assertions_failed integer not null, findings jsonb not null default '[]'::jsonb, created_at timestamptz not null default now()
);
create table if not exists public.dd_provider_onboarding_work_queue(
 application_id uuid primary key, provider_id uuid, readiness_status text not null default 'REVIEWING',
 blockers jsonb not null default '[]'::jsonb, required_documents jsonb not null default '[]'::jsonb,
 missing_documents jsonb not null default '[]'::jsonb, next_action text, last_evaluated_at timestamptz not null default now(),
 metadata jsonb not null default '{}'::jsonb
);
create table if not exists public.dd_provider_onboarding_worker_runs(
 id uuid primary key default gen_random_uuid(), started_at timestamptz not null default now(), completed_at timestamptz,
 status text not null default 'RUNNING', applications_scanned integer not null default 0, ready_count integer not null default 0,
 blocked_count integer not null default 0, evidence jsonb not null default '{}'::jsonb
);
create table if not exists public.dd_pricing_coverage_snapshots(
 id uuid primary key default gen_random_uuid(), snapshot_date date not null, division text not null, channel_code text not null,
 service_count integer not null default 0, evidence_ready_count integer not null default 0,
 economics_ready_count integer not null default 0, review_ready_count integer not null default 0, created_at timestamptz not null default now(),
 unique(snapshot_date,division,channel_code)
);
create table if not exists public.dd_service_pricing_research_queue(
 id uuid primary key default gen_random_uuid(), service_id uuid not null, canonical_sku text not null, service_family text not null,
 research_status text not null default 'QUEUED', priority integer not null default 100, pricing_model text,
 geography_scope text not null default 'METRO_ATLANTA', evidence_target integer not null default 3, evidence_count integer not null default 0,
 economics_ready boolean not null default false, current_price_cents integer, proposed_price_cents integer,
 minimum_viable_price_cents integer, variance_percent numeric, confidence text, blocking_reason text,
 last_researched_at timestamptz, created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
 modeled_direct_cost_cents integer, expected_contribution_cents integer, expected_margin_percent numeric,
 economics_evidence_status text, division text, channel_scope text[] not null default '{}'::text[], coverage_status text not null default 'UNASSESSED',
 unique(service_id,geography_scope)
);
create table if not exists public.dd_sales_queue_lead_bridge(
 sales_queue_id uuid primary key, lead_id uuid not null, bridge_reason text not null default 'CANONICAL_QUOTE_LEAD_AUTHORITY',
 created_at timestamptz not null default now()
);
create table if not exists public.dd_job_economics_feedback(
 job_id uuid primary key, sales_queue_id uuid, canonical_sku text, revenue_collected numeric not null default 0,
 known_provider_cost numeric not null default 0, known_contribution numeric not null default 0, known_margin_percent numeric,
 evidence_status text not null default 'PARTIAL', pricing_review_recommended boolean not null default false,
 evidence jsonb not null default '{}'::jsonb, calculated_at timestamptz not null default now()
);
create table if not exists public.dd_cass_finance_compliance_queue(
 id uuid primary key default gen_random_uuid(), source_domain text not null, source_key text not null, review_type text not null,
 title text not null, accounting_question text not null, legal_or_tax_dependency text, financial_statement_area text,
 entity_scope text not null, status text not null default 'OPEN', priority text not null default 'P1',
 owner_decision_required boolean not null default false, evidence jsonb not null default '[]'::jsonb,
 recommended_accounting_treatment text, cass_notes text, resolved_at timestamptz,
 created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
 unique(source_domain,source_key,review_type)
);

do $$
declare t text;
begin
 foreach t in array ARRAY[
 'dd_autobuild_policy','dd_autobuild_candidates','dd_code_repair_work_queue','dd_security_regression_runs',
 'dd_provider_onboarding_work_queue','dd_provider_onboarding_worker_runs','dd_pricing_coverage_snapshots',
 'dd_service_pricing_research_queue','dd_sales_queue_lead_bridge','dd_job_economics_feedback','dd_cass_finance_compliance_queue'
 ] loop
  execute format('alter table public.%I enable row level security',t);
  execute format('revoke all on public.%I from anon,authenticated',t);
  execute format('grant all on public.%I to service_role',t);
 end loop;
end $$;

insert into public.dd_autobuild_policy(policy_key,enabled,target_environment,allowed_actions,prohibited_actions,escalation_domains,
 max_candidates_per_cycle,max_open_candidates,require_evidence,require_acceptance_criteria,require_isolated_branch,
 auto_merge_allowed,production_write_allowed,permission_expansion_allowed,external_money_action_allowed,customer_provider_contact_allowed,
 kill_switch,max_concurrent_builds,max_consecutive_failures,lease_minutes)
values('DANI_PRODUCTION_AUTOBUILD_OBSERVE_ONLY',true,'TESTER',
 '["queue_candidate","record_evidence","open_isolated_branch","open_pull_request","run_tests"]'::jsonb,
 '["merge_pull_request","deploy_production","write_production_database","expand_permissions","move_money","contact_customer","contact_provider","publish_pricing","publish_service"]'::jsonb,
 '["SECURITY","MONEY","PROVIDER_AUTHORIZATION","PRODUCTION_RELEASE"]'::jsonb,
 5,20,true,true,true,false,false,false,false,false,true,1,2,30)
on conflict(policy_key) do update set updated_at=now(),kill_switch=true,production_write_allowed=false,auto_merge_allowed=false;
