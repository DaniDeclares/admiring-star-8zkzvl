
update public.dd_research_authority_policy
set auto_reconcile_low_risk=true, updated_at=now()
where domain in ('PRICING','SERVICE_DISCOVERY','PROVIDER_CAPACITY','SOFTWARE');

select cron.schedule('dani-research-pipeline-controller-production','4,14,24,34,44,54 * * * *',$$select public.dd_run_research_pipeline_controller();$$)
where not exists(select 1 from cron.job where jobname='dani-research-pipeline-controller-production');

select cron.schedule('dani-provider-onboarding-coordinator-production','6,26,46 * * * *',$$select public.dd_run_provider_onboarding_coordinator();$$)
where not exists(select 1 from cron.job where jobname='dani-provider-onboarding-coordinator-production');

select cron.schedule('dani-provider-requirement-reconciliation-production','16,36,56 * * * *',$$select public.dd_reconcile_provider_requirement_research_candidates();$$)
where not exists(select 1 from cron.job where jobname='dani-provider-requirement-reconciliation-production');

select cron.schedule('dani-support-signal-rollup-production','23 */2 * * *',$$select public.dd_rollup_support_signals();$$)
where not exists(select 1 from cron.job where jobname='dani-support-signal-rollup-production');

select cron.schedule('dani-unattended-green-production','7,37 * * * *',$$select public.dd_run_unattended_green_controller();$$)
where not exists(select 1 from cron.job where jobname='dani-unattended-green-production');
