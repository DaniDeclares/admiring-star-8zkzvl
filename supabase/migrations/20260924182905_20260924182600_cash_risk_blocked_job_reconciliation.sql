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

update public.dd_owner_attention_queue
set status = 'SUPERSEDED',
    metadata = metadata || jsonb_build_object('superseded_by', '20260924182600_cash_risk_blocked_job_reconciliation', 'superseded_at', now())
where domain = 'ACCOUNTING_MONEY'
  and source_record_id = '09c589e5-a7a2-416a-bfe0-46f1ad14818a'
  and status = 'OPEN'
  and reason ilike '%scheduled today%';

insert into public.dd_owner_attention_queue (domain, source_table, source_record_id, reason, priority, status, recommended_action, metadata)
select
  'ACCOUNTING_MONEY', 'dd_jobs', dj.id::text,
  'Job is blocked pending an eligible provider (no confirmed schedule) while carrying a balance due and an unresolved deposit-evidence conflict. Revenue: $' || dj.revenue_total ||
    ', balance due: $' || dj.balance_due || ', deposit expected: $' || dj.deposit_expected || ', Thumbtack CAC: $' || dj.acquisition_cost || '.',
  'URGENT', 'OPEN',
  'Confirm the $50 deposit is actually available before relying on it (payment event has a conflicting pending/cleared note). Resolve the provider block before assuming this job will complete on any given day, and collect the $110 balance at completion once it does. Do not send further Thumbtack replenishment spend against this job until it is unblocked.',
  jsonb_build_object('filed_by', '20260924182600_cash_risk_blocked_job_reconciliation', 'filed_at', now(), 'cash_risk', dd_compute_job_cash_risk(24)->'jobs'->0)
from public.dd_jobs dj
where dj.id = '09c589e5-a7a2-416a-bfe0-46f1ad14818a'
  and not exists (
    select 1 from public.dd_owner_attention_queue
    where domain = 'ACCOUNTING_MONEY' and source_record_id = dj.id::text and status = 'OPEN'
      and reason ilike '%blocked pending an eligible provider%'
  );

select public.dd_run_company_controller();
select public.dd_generate_company_morning_brief();

commit;
