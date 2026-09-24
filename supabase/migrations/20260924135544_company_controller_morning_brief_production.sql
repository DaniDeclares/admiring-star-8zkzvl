-- Company Controller / Morning Brief — production migration
--
-- Ports the Company Controller + Morning Brief schema that has so far only
-- existed in TESTER Supabase (okvepooyxurujcwgfoju) into production
-- (ajxezpczaemunlcmqlgl), so the Owner HQ Morning Brief section (PR #389)
-- has real objects to read instead of the API throwing on missing tables.
--
-- SCOPE NOTE: dd_refresh_company_domain_state() in TESTER also reads six
-- tables that do not exist in production yet (dd_software_build_work_queue,
-- dd_service_support_readiness, dd_capability_gap_queue,
-- dd_commercial_reconciliation_runs, dd_provider_intelligence_summary_v1,
-- dd_provider_intelligence_v1) — those belong to the research-engine /
-- provider-intelligence subsystems that are still TESTER-only. Rather than
-- also porting those subsystems sight unseen, the production version of the
-- refresh function below guards every one of those lookups with
-- to_regclass(...) and leaves the affected domain at UNKNOWN with an
-- evidence note when its source table isn't in production yet. Nothing here
-- infers GREEN from missing data. Porting those six tables (and turning
-- those domains RED/YELLOW for real) is a separate, larger decision — not
-- bundled into this migration.
--
-- This migration creates schema only. It does not schedule any cron job to
-- call dd_run_company_controller()/dd_generate_company_morning_brief() in
-- production — whether/how often to run those is an owner decision (see the
-- Morning Brief's own "Should be automated" section).
--
-- Idempotent and safe to re-run.

begin;

-- 1. dd_company_domain_state -------------------------------------------------
create table if not exists public.dd_company_domain_state (
  domain text primary key,
  status text not null default 'UNKNOWN',
  summary text,
  metrics jsonb not null default '{}'::jsonb,
  meaningful_changes jsonb not null default '[]'::jsonb,
  blockers jsonb not null default '[]'::jsonb,
  next_autonomous_action text,
  owner_decision_required boolean not null default false,
  financial_impact jsonb not null default '{}'::jsonb,
  risk jsonb not null default '{}'::jsonb,
  evidence jsonb not null default '{}'::jsonb,
  observed_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

insert into public.dd_company_domain_state (domain, evidence)
select d, jsonb_build_object('seeded_by', '20260924133000_company_controller_morning_brief_production', 'seeded_at', now())
from unnest(array[
  'ACCOUNTING_MONEY','CAPITAL_FUNDING','COMMERCIAL_INTELLIGENCE','COMPLIANCE_RISK',
  'CUSTOMER_SUCCESS_SUPPORT','DATA_QUALITY','FULFILLMENT_DISPATCH','GOVCON_INSTITUTIONAL',
  'INTEGRATIONS','MARKETING','PRICING_ECONOMICS','PROVIDER_OPERATIONS','SALES_REVENUE',
  'SECURITY','SERVICE_CATALOG','SOFTWARE_PLATFORM'
]) as d
on conflict (domain) do nothing;

-- 2. dd_company_controller_runs ----------------------------------------------
create table if not exists public.dd_company_controller_runs (
  id uuid primary key default gen_random_uuid(),
  started_at timestamptz not null default now(),
  completed_at timestamptz,
  status text not null default 'RUNNING',
  domains_green int not null default 0,
  domains_yellow int not null default 0,
  domains_red int not null default 0,
  domains_unknown int not null default 0,
  owner_decisions int not null default 0,
  evidence jsonb not null default '{}'::jsonb
);

-- 3. dd_overnight_soak_receipts -----------------------------------------------
create table if not exists public.dd_overnight_soak_receipts (
  id uuid primary key default gen_random_uuid(),
  run_at timestamptz not null default now(),
  research_queued int not null default 0,
  owner_attention_open int not null default 0,
  commercial_conflicts int not null default 0,
  support_ready int not null default 0,
  services_total int not null default 0,
  capability_researching int not null default 0,
  evidence_stale int not null default 0,
  notes jsonb not null default '{}'::jsonb
);

-- 4. dd_company_morning_briefs ------------------------------------------------
create table if not exists public.dd_company_morning_briefs (
  id uuid primary key default gen_random_uuid(),
  brief_date date not null default current_date unique,
  generated_at timestamptz not null default now(),
  baseline_soak_receipt_id uuid,
  company_status text not null default 'UNKNOWN',
  headline text,
  overnight_verified jsonb not null default '{}'::jsonb,
  revenue_sales jsonb not null default '{}'::jsonb,
  owner_attention jsonb not null default '{}'::jsonb,
  meaningful_changes jsonb not null default '{}'::jsonb,
  unresolved_blockers jsonb not null default '{}'::jsonb,
  software_platform jsonb not null default '{}'::jsonb,
  business_health jsonb not null default '{}'::jsonb,
  evidence jsonb not null default '{}'::jsonb
);

-- brief_date already carries a UNIQUE constraint from the table definition
-- above (needed for the function's ON CONFLICT (brief_date) below); this
-- guards a re-run against an older copy of the table that predates it.
do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conrelid = 'public.dd_company_morning_briefs'::regclass
      and contype = 'u'
      and conkey = (select array_agg(attnum) from pg_attribute
                    where attrelid = 'public.dd_company_morning_briefs'::regclass
                      and attname = 'brief_date')
  ) then
    alter table public.dd_company_morning_briefs add constraint dd_company_morning_briefs_brief_date_key unique (brief_date);
  end if;
end $$;

-- 5. dashboard view -----------------------------------------------------------
create or replace view public.dd_company_controller_dashboard_v1
with (security_invoker = true) as
select domain, status, summary, metrics, meaningful_changes, blockers,
       next_autonomous_action, owner_decision_required, financial_impact,
       risk, evidence, observed_at
from public.dd_company_domain_state
order by case status when 'RED' then 1 when 'YELLOW' then 2 when 'UNKNOWN' then 3 else 4 end, domain;

-- 6. RLS: service-role only (owner-controller internals; no anon/authenticated
--    access, matching TESTER's posture for these same tables) ----------------
alter table public.dd_company_domain_state enable row level security;
alter table public.dd_company_controller_runs enable row level security;
alter table public.dd_overnight_soak_receipts enable row level security;
alter table public.dd_company_morning_briefs enable row level security;

revoke all on public.dd_company_domain_state from public, anon, authenticated;
revoke all on public.dd_company_controller_runs from public, anon, authenticated;
revoke all on public.dd_overnight_soak_receipts from public, anon, authenticated;
revoke all on public.dd_company_morning_briefs from public, anon, authenticated;
revoke all on public.dd_company_controller_dashboard_v1 from public, anon, authenticated;

grant select, insert, update, delete on public.dd_company_domain_state to service_role;
grant select, insert, update, delete on public.dd_company_controller_runs to service_role;
grant select, insert, update, delete on public.dd_overnight_soak_receipts to service_role;
grant select, insert, update, delete on public.dd_company_morning_briefs to service_role;
grant select on public.dd_company_controller_dashboard_v1 to service_role;

-- 7. Functions ----------------------------------------------------------------
-- Production-safe refresh: every metric that depends on a subsystem not yet
-- ported to production is guarded with to_regclass(...) and left UNKNOWN
-- rather than fabricated.
create or replace function public.dd_refresh_company_domain_state()
returns jsonb
language plpgsql
security definer
set search_path to 'public'
as $function$
declare
  v_q int; v_att int; v_leads int; v_jobs int;
  v_sw int; v_support int; v_services int; v_caps int; v_conf int;
  v_provider_metrics jsonb := '{}'::jsonb;
  v_provider_blockers jsonb := '[]'::jsonb;
  v_has_sw boolean := to_regclass('public.dd_software_build_work_queue') is not null;
  v_has_support boolean := to_regclass('public.dd_service_support_readiness') is not null;
  v_has_caps boolean := to_regclass('public.dd_capability_gap_queue') is not null;
  v_has_conf boolean := to_regclass('public.dd_commercial_reconciliation_runs') is not null;
  v_has_provider_summary boolean := to_regclass('public.dd_provider_intelligence_summary_v1') is not null;
  v_has_provider_detail boolean := to_regclass('public.dd_provider_intelligence_v1') is not null;
begin
  select count(*) into v_q from dd_research_work_queue where status = 'QUEUED';
  select count(*) into v_att from dd_owner_attention_queue where status = 'OPEN';
  select count(*) into v_leads from dd_sales_queue;
  select count(*) into v_jobs from dd_jobs where upper(coalesce(job_status,'')) not in ('COMPLETED','CLOSED','CANCELLED');

  if v_has_sw then
    execute 'select count(*) from dd_software_build_work_queue where status not in (''COMPLETED'',''GREEN'')' into v_sw;
  end if;

  if v_has_support then
    execute 'select count(*) filter (where support_ready), count(*) from dd_service_support_readiness' into v_support, v_services;
  end if;

  if v_has_caps then
    execute 'select count(*) from dd_capability_gap_queue where status = ''RESEARCHING''' into v_caps;
  end if;

  if v_has_conf then
    execute 'select coalesce((select conflicts from dd_commercial_reconciliation_runs order by completed_at desc nulls last limit 1), 0)' into v_conf;
  end if;

  if v_has_provider_summary then
    execute 'select jsonb_build_object(''provider_orgs'',provider_orgs,''approved_orgs'',approved_orgs,''qualified_orgs'',qualified_orgs,''duplicate_provider_orgs'',duplicate_provider_orgs,''orgs_with_authorized_capabilities'',orgs_with_authorized_capabilities,''orgs_with_active_portal'',orgs_with_active_portal) from dd_provider_intelligence_summary_v1' into v_provider_metrics;
  end if;

  if v_has_provider_detail then
    execute 'select coalesce(jsonb_agg(jsonb_build_object(''provider_org_id'',provider_org_id,''provider_org_name'',provider_org_name,''status'',intelligence_status,''active_provider_records'',active_provider_records,''authorized_capabilities'',authorized_capabilities,''active_portal_identities'',active_portal_identities)) filter (where intelligence_status in (''DUPLICATE_PROVIDER_RECORDS'',''ORG_EVIDENCED_CAPABILITY_MISSING'',''INSUFFICIENT_EVIDENCE'')), ''[]''::jsonb) from dd_provider_intelligence_v1' into v_provider_blockers;
  end if;

  update dd_company_domain_state set
    status = case
      when domain in ('ACCOUNTING_MONEY','FULFILLMENT_DISPATCH') then 'RED'
      when domain = 'SOFTWARE_PLATFORM' then case when v_has_sw then 'RED' else 'UNKNOWN' end
      when domain = 'PROVIDER_OPERATIONS' then case when v_has_provider_summary then 'YELLOW' else 'UNKNOWN' end
      when domain = 'CUSTOMER_SUCCESS_SUPPORT' then case when v_has_support then 'YELLOW' else 'UNKNOWN' end
      when domain = 'SERVICE_CATALOG' then case when v_has_support then 'YELLOW' else 'UNKNOWN' end
      when domain = 'COMMERCIAL_INTELLIGENCE' then case when v_has_conf then 'YELLOW' else 'UNKNOWN' end
      when domain in ('PRICING_ECONOMICS','COMPLIANCE_RISK','INTEGRATIONS','DATA_QUALITY') then 'YELLOW'
      else 'UNKNOWN'
    end,
    metrics = case domain
      when 'SALES_REVENUE' then jsonb_build_object('sales_queue', v_leads)
      when 'FULFILLMENT_DISPATCH' then jsonb_build_object('open_jobs', v_jobs, 'e2e_proof', false)
      when 'PROVIDER_OPERATIONS' then coalesce(v_provider_metrics,'{}'::jsonb) || jsonb_build_object('capability_researching', v_caps, 'subsystem_in_production', v_has_provider_summary)
      when 'CUSTOMER_SUCCESS_SUPPORT' then jsonb_build_object('support_ready', v_support, 'services_total', v_services, 'subsystem_in_production', v_has_support)
      when 'COMMERCIAL_INTELLIGENCE' then jsonb_build_object('research_queued', v_q, 'latest_conflicts', v_conf, 'subsystem_in_production', v_has_conf)
      when 'SOFTWARE_PLATFORM' then jsonb_build_object('non_green_build_work', v_sw, 'autonomous_repair_executor', false, 'subsystem_in_production', v_has_sw)
      when 'SERVICE_CATALOG' then jsonb_build_object('services_total', v_services, 'support_ready', v_support, 'subsystem_in_production', v_has_support)
      else metrics
    end,
    blockers = case when domain = 'PROVIDER_OPERATIONS' then v_provider_blockers else blockers end,
    evidence = case
      when domain in ('SOFTWARE_PLATFORM','PROVIDER_OPERATIONS','CUSTOMER_SUCCESS_SUPPORT','SERVICE_CATALOG','COMMERCIAL_INTELLIGENCE')
        then jsonb_build_object('derived_by','dd_refresh_company_domain_state','derived_at',now(),'no_green_inference',true,
             'note', case when domain='SOFTWARE_PLATFORM' and not v_has_sw then 'dd_software_build_work_queue not yet in production'
                          when domain='PROVIDER_OPERATIONS' and not v_has_provider_summary then 'dd_provider_intelligence_summary_v1 not yet in production'
                          when domain in ('CUSTOMER_SUCCESS_SUPPORT','SERVICE_CATALOG') and not v_has_support then 'dd_service_support_readiness not yet in production'
                          when domain='COMMERCIAL_INTELLIGENCE' and not v_has_conf then 'dd_commercial_reconciliation_runs not yet in production'
                          else 'live' end)
      else jsonb_build_object('derived_by','dd_refresh_company_domain_state','derived_at',now(),'no_green_inference',true)
    end,
    observed_at = now(),
    updated_at = now();

  return jsonb_build_object('domains', 16, 'research_queued', v_q, 'owner_attention_open', v_att,
    'services_total', v_services, 'support_ready', v_support, 'capability_researching', v_caps,
    'software_non_green', v_sw, 'open_jobs', v_jobs, 'provider_metrics', v_provider_metrics);
end
$function$;

create or replace function public.dd_run_company_controller()
returns uuid
language plpgsql
security definer
set search_path to 'public'
as $function$
declare v_id uuid; v_g int; v_y int; v_r int; v_u int; v_o int; v_refresh jsonb;
begin
  insert into dd_company_controller_runs(status) values('RUNNING') returning id into v_id;
  v_refresh := dd_refresh_company_domain_state();
  select count(*) filter (where status='GREEN'), count(*) filter (where status='YELLOW'),
         count(*) filter (where status='RED'), count(*) filter (where status='UNKNOWN')
  into v_g, v_y, v_r, v_u from dd_company_domain_state;
  select count(*) into v_o from dd_owner_attention_queue where status = 'OPEN';
  update dd_company_controller_runs set completed_at = now(),
    status = case when v_r > 0 then 'RED' when v_y > 0 or v_u > 0 then 'YELLOW' else 'GREEN' end,
    domains_green = v_g, domains_yellow = v_y, domains_red = v_r, domains_unknown = v_u,
    owner_decisions = v_o,
    evidence = jsonb_build_object('refresh', v_refresh, 'no_external_side_effects', true, 'production_authority', false)
  where id = v_id;
  return v_id;
end
$function$;

create or replace function public.dd_generate_company_morning_brief()
returns uuid
language plpgsql
security definer
set search_path to 'public'
as $function$
declare v_id uuid; v_base uuid; v_status text; v_last dd_overnight_soak_receipts%rowtype;
begin
  perform dd_run_company_controller();
  select * into v_last from dd_overnight_soak_receipts order by run_at desc limit 1;
  v_base := v_last.id;
  select case when exists(select 1 from dd_company_domain_state where status='RED') then 'RED'
              when exists(select 1 from dd_company_domain_state where status in ('YELLOW','UNKNOWN')) then 'YELLOW'
              else 'GREEN' end into v_status;
  insert into dd_company_morning_briefs(brief_date, baseline_soak_receipt_id, company_status, headline,
    overnight_verified, revenue_sales, owner_attention, meaningful_changes, unresolved_blockers,
    software_platform, business_health, evidence)
  values(current_date, v_base, v_status,
    'DANI morning operating brief — verified state only.',
    jsonb_build_object('latest_soak_receipt', v_base, 'research_queued', v_last.research_queued,
      'owner_attention_open', v_last.owner_attention_open, 'support_ready', v_last.support_ready,
      'services_total', v_last.services_total, 'capability_researching', v_last.capability_researching,
      'evidence_stale', v_last.evidence_stale),
    (select jsonb_build_object('sales_queue', coalesce((metrics->>'sales_queue')::int,0), 'status', status)
       from dd_company_domain_state where domain='SALES_REVENUE'),
    jsonb_build_object('open_count', (select count(*) from dd_owner_attention_queue where status='OPEN'),
      'p0', (select count(*) from dd_owner_attention_queue where status='OPEN' and priority='P0'),
      'p1', (select count(*) from dd_owner_attention_queue where status='OPEN' and priority='P1')),
    coalesce((select jsonb_agg(jsonb_build_object('domain', domain, 'changes', meaningful_changes))
       from dd_company_domain_state where jsonb_array_length(meaningful_changes) > 0), '[]'::jsonb),
    coalesce((select jsonb_agg(jsonb_build_object('domain', domain, 'status', status, 'blockers', blockers, 'next', next_autonomous_action))
       from dd_company_domain_state where status in ('RED','YELLOW','UNKNOWN')), '[]'::jsonb),
    (select jsonb_build_object('status', status, 'metrics', metrics, 'next', next_autonomous_action, 'evidence', evidence)
       from dd_company_domain_state where domain='SOFTWARE_PLATFORM'),
    (select jsonb_object_agg(domain, jsonb_build_object('status', status, 'metrics', metrics)) from dd_company_domain_state),
    jsonb_build_object('generator','dd_generate_company_morning_brief','generated_at',now(),'verified_only',true,'production_authority',false))
  on conflict (brief_date) do update set generated_at=now(), baseline_soak_receipt_id=excluded.baseline_soak_receipt_id,
    company_status=excluded.company_status, headline=excluded.headline, overnight_verified=excluded.overnight_verified,
    revenue_sales=excluded.revenue_sales, owner_attention=excluded.owner_attention, meaningful_changes=excluded.meaningful_changes,
    unresolved_blockers=excluded.unresolved_blockers, software_platform=excluded.software_platform,
    business_health=excluded.business_health, evidence=excluded.evidence
  returning id into v_id;
  return v_id;
end
$function$;

revoke all on function public.dd_refresh_company_domain_state() from public;
revoke all on function public.dd_run_company_controller() from public;
revoke all on function public.dd_generate_company_morning_brief() from public;
grant execute on function public.dd_refresh_company_domain_state() to service_role;
grant execute on function public.dd_run_company_controller() to service_role;
grant execute on function public.dd_generate_company_morning_brief() to service_role;

-- 8. Data fix: Cass (Cassandra Rosser) confirmed her own portal access by
--    text to Dani at 7:33am ET on 2026-09-24. This closes the stale
--    "access recovery remains unverified" owner-attention item with an
--    explicit note that the confirmation is owner-reported (text), not a
--    system-observed successful auth event. It does NOT touch her
--    onboarding status (W-9, agreement, payout, rate card, background
--    check all remain PENDING in dd_provider_applications — unaffected by
--    this migration) and fabricates no documents.
update public.dd_owner_attention_queue
set status = 'RESOLVED',
    resolved_at = now(),
    recommended_action = 'Portal access confirmed by owner (Dani, text message, 2026-09-24 ~7:33am ET). Continue collecting Cass''s outstanding onboarding items (W-9, signed agreement, payout setup, rate card, background check) separately — those remain PENDING.',
    metadata = metadata || jsonb_build_object(
      'owner_confirmed_access', true,
      'owner_confirmation_channel', 'TEXT',
      'owner_confirmation_by', 'Dani',
      'owner_confirmation_at', '2026-09-24T07:33:00-04:00',
      'resolved_by', '20260924133000_company_controller_morning_brief_production'
    )
where id = 'cec08f9b-e8ba-43dc-8ef5-e9e4849cd3d1'
  and status = 'OPEN';

commit;
