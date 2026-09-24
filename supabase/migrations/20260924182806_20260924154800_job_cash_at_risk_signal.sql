begin;

alter table public.dd_jobs
  add column if not exists revenue_total numeric,
  add column if not exists deposit_expected numeric,
  add column if not exists balance_due numeric,
  add column if not exists acquisition_cost numeric;

create table if not exists public.dd_job_cost_actuals (
  id uuid primary key default gen_random_uuid(),
  job_id uuid not null references public.dd_jobs(id) on delete cascade,
  estimate_component_snapshot_id uuid,
  provider_id uuid references public.dd_providers(id) on delete set null,
  owner_user_id uuid references auth.users(id) on delete set null,
  cost_type text not null check (cost_type = any (array['OWNER_LABOR','PROVIDER_LABOR','MATERIAL','PROCUREMENT','SUBCONTRACT','TRAVEL','PAYMENT_PROCESSING','REFUND','CHARGEBACK','REWORK','OTHER'])),
  quantity numeric not null default 1,
  unit_cost numeric,
  amount numeric not null,
  source_type text not null,
  source_reference text,
  status text not null default 'RECORDED' check (status = any (array['ESTIMATED','RECORDED','APPROVED','VOID'])),
  incurred_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

alter table public.dd_job_cost_actuals enable row level security;
revoke all on public.dd_job_cost_actuals from public, anon, authenticated;
grant select, insert, update, delete on public.dd_job_cost_actuals to service_role;

update public.dd_jobs
set revenue_total = 160.00,
    deposit_expected = 50.00,
    balance_due = 110.00,
    acquisition_cost = 42.40
where id = '09c589e5-a7a2-416a-bfe0-46f1ad14818a'
  and revenue_total is null;

create or replace function public.dd_compute_job_cash_risk(p_lookahead_hours int default 72)
returns jsonb
language plpgsql
security definer
set search_path to 'public'
as $function$
declare
  v_jobs jsonb;
  v_at_risk_count int;
begin
  with base as (
    select
      dj.id as job_id,
      dj.job_title,
      dj.job_status,
      dj.scheduled_start,
      dj.location_address,
      dj.revenue_total,
      dj.deposit_expected,
      dj.balance_due,
      dj.acquisition_cost,
      coalesce((select sum(pe.amount_received) from dd_payment_events pe
                where pe.job_id = dj.id and pe.event_type = 'DEPOSIT_RECEIVED'
                  and pe.payment_status = 'succeeded'), 0) as deposit_confirmed_received,
      coalesce((select sum(jca.amount) from dd_job_cost_actuals jca
                where jca.job_id = dj.id and jca.status is distinct from 'VOID'), 0) as fulfillment_cost_recorded,
      exists(select 1 from dd_job_cost_actuals jca where jca.job_id = dj.id) as fulfillment_cost_tracked,
      exists(
        select 1 from dd_payment_events pe
        where pe.job_id = dj.id
          and (pe.raw_metadata->>'evidence_update') ilike '%pending%'
      ) as has_conflicting_payment_evidence
    from dd_jobs dj
    where upper(coalesce(dj.job_status,'')) not in ('COMPLETED','CLOSED','CANCELLED')
      and coalesce(dj.balance_due, 0) > 0
      and dj.scheduled_start is not null
      and dj.scheduled_start between now() - interval '24 hours' and now() + make_interval(hours => p_lookahead_hours)
  ),
  scored as (
    select b.*,
      ((not fulfillment_cost_tracked)
        or (deposit_confirmed_received < coalesce(deposit_expected, 0))
        or has_conflicting_payment_evidence) as cash_at_risk,
      (select jsonb_agg(reason) from (
          select 'fulfillment cost not tracked -- dd_job_cost_actuals has no rows for this job' as reason
            where not fulfillment_cost_tracked
          union all
          select 'confirmed deposit received ($' || deposit_confirmed_received || ') is less than expected ($' || coalesce(deposit_expected, 0) || ')'
            where deposit_confirmed_received < coalesce(deposit_expected, 0)
          union all
          select 'payment event carries a conflicting pending/cleared note -- verify bank app before treating deposit as spendable'
            where has_conflicting_payment_evidence
        ) r) as risk_reasons
    from base b
  )
  select
    coalesce(jsonb_agg(jsonb_build_object(
      'job_id', job_id, 'job_title', job_title, 'job_status', job_status,
      'scheduled_start', scheduled_start, 'location_address', location_address,
      'revenue_total', revenue_total, 'deposit_expected', deposit_expected, 'balance_due', balance_due,
      'acquisition_cost', acquisition_cost, 'deposit_confirmed_received', deposit_confirmed_received,
      'fulfillment_cost_recorded', fulfillment_cost_recorded, 'fulfillment_cost_tracked', fulfillment_cost_tracked,
      'cash_at_risk', cash_at_risk, 'risk_reasons', coalesce(risk_reasons, '[]'::jsonb)
    ) order by scheduled_start), '[]'::jsonb),
    count(*) filter (where cash_at_risk)
  into v_jobs, v_at_risk_count
  from scored;

  return jsonb_build_object(
    'computed_at', now(),
    'lookahead_hours', p_lookahead_hours,
    'jobs', v_jobs,
    'at_risk_count', coalesce(v_at_risk_count, 0),
    'note', 'No connected bank-balance feed exists yet; this signal covers job revenue/deposit/CAC/fulfillment-cost evidence only, not live liquidity.'
  );
end
$function$;

revoke all on function public.dd_compute_job_cash_risk(int) from public;
grant execute on function public.dd_compute_job_cash_risk(int) to service_role;

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
  v_cash_risk jsonb;
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

  v_cash_risk := dd_compute_job_cash_risk(72);

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
      when 'ACCOUNTING_MONEY' then jsonb_build_object(
             'cash_at_risk_jobs', v_cash_risk->'jobs',
             'cash_at_risk_count', v_cash_risk->'at_risk_count',
             'cash_risk_computed_at', v_cash_risk->'computed_at',
             'cash_risk_note', v_cash_risk->'note')
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
    'software_non_green', v_sw, 'open_jobs', v_jobs, 'provider_metrics', v_provider_metrics,
    'cash_at_risk_count', v_cash_risk->'at_risk_count');
end
$function$;

insert into public.dd_owner_attention_queue (domain, source_table, source_record_id, reason, priority, status, recommended_action, metadata)
select
  'ACCOUNTING_MONEY', 'dd_jobs', dj.id::text,
  'Job scheduled today with an unresolved deposit-evidence conflict and no fulfillment-cost tracking. Revenue: $' || dj.revenue_total ||
    ', balance due: $' || dj.balance_due || ', deposit expected: $' || dj.deposit_expected || ', Thumbtack CAC: $' || dj.acquisition_cost || '.',
  'URGENT', 'OPEN',
  'Verify the $50 Zelle deposit is actually available in the Chase app before relying on it (payment event has a conflicting pending/cleared note). Collect the $110 balance at job completion. Do not send the $70 Thumbtack replenishment before that.',
  jsonb_build_object('filed_by', '20260924154800_job_cash_at_risk_signal', 'filed_at', now(), 'cash_risk', dd_compute_job_cash_risk(24)->'jobs'->0)
from public.dd_jobs dj
where dj.id = '09c589e5-a7a2-416a-bfe0-46f1ad14818a'
  and not exists (
    select 1 from public.dd_owner_attention_queue
    where domain = 'ACCOUNTING_MONEY' and source_record_id = dj.id::text and status = 'OPEN'
  );

select public.dd_run_company_controller();
select public.dd_generate_company_morning_brief();

commit;
