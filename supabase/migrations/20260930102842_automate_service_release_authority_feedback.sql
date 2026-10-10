
select cron.unschedule(jobid) from cron.job where jobname='production-learning-research-router';
select cron.schedule(
 'production-learning-research-router',
 '2,17,32,47 * * * *',
 $cron$
 select public.dd_capture_service_release_authority_fingerprints();
 select public.dd_route_production_learning_to_research();
 select public.dd_bind_production_learning_signals_to_evidence_intake();
 $cron$
);
