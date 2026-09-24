-- Reconcile 20260924154800_job_cash_at_risk_signal.sql (#395) against the
-- Krystal Livingston job's state as of applying #395 to production: by the
-- time #395 was deployed, the job had moved from "scheduled today 3-5pm" to
-- job_status='blocked' with scheduled_start=null (customer approved a move to
-- Sep 25 morning, exact time pending; Danielle can't self-fulfill without a
-- vehicle; external-provider offer is $60 flat, not the $70 figure #395's
-- prose assumed; Cass declined). #395's dd_compute_job_cash_risk() only
-- flagged jobs with a non-null scheduled_start, so a blocked/unscheduled job
-- with money still at risk fell out of the signal entirely. This migration
-- was applied directly to production during that same deploy window (git
-- history for it was written after the fact — this file is that record, not
-- a rewrite of #395's merged content).
--
-- Purely additive/corrective, idempotent:
--   1. Extends dd_compute_job_cash_risk() so a BLOCKED job with a null
--      scheduled_start and a balance due is included and flagged with its
--      own reason ("blocked with no confirmed schedule while a balance is
--      still due"), instead of silently dropping out of the lookahead window.
--   2. No change to dd_refresh_company_domain_state() — the ACCOUNTING_MONEY
--      wiring from #395 already folds whatever dd_compute_job_cash_risk()
--      returns, so extending the risk function is sufficient.

begin;

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
      ) as has_conflicting_payment_evidence,
      (dj.scheduled_start is null and upper(coalesce(dj.job_status,'')) = 'BLOCKED') as blocked_unscheduled
    from dd_jobs dj
    where upper(coalesce(dj.job_status,'')) not in ('COMPLETED','CLOSED','CANCELLED')
      and coalesce(dj.balance_due, 0) > 0
      and (
        (dj.scheduled_start is not null
          and dj.scheduled_start between now() - interval '24 hours' and now() + make_interval(hours => p_lookahead_hours))
        or (dj.scheduled_start is null and upper(coalesce(dj.job_status,'')) = 'BLOCKED')
      )
  ),
  scored as (
    select b.*,
      ((not fulfillment_cost_tracked)
        or (deposit_confirmed_received < coalesce(deposit_expected, 0))
        or has_conflicting_payment_evidence
        or blocked_unscheduled) as cash_at_risk,
      (select jsonb_agg(reason) from (
          select 'fulfillment cost not tracked -- dd_job_cost_actuals has no rows for this job' as reason
            where not fulfillment_cost_tracked
          union all
          select 'confirmed deposit received ($' || deposit_confirmed_received || ') is less than expected ($' || coalesce(deposit_expected, 0) || ')'
            where deposit_confirmed_received < coalesce(deposit_expected, 0)
          union all
          select 'payment event carries a conflicting pending/cleared note -- verify bank app before treating deposit as spendable'
            where has_conflicting_payment_evidence
          union all
          select 'job is blocked with no confirmed schedule while a balance is still due -- revenue timing is unresolved, not just deposit/cost evidence'
            where blocked_unscheduled
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
    ) order by scheduled_start nulls first), '[]'::jsonb),
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

select public.dd_run_company_controller();
select public.dd_generate_company_morning_brief();

commit;
