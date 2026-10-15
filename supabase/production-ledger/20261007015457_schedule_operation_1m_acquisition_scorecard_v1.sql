do $$ begin perform cron.unschedule('dani-acquisition-scorecard-production'); exception when others then null; end $$;
select cron.schedule('dani-acquisition-scorecard-production','7 * * * *','select public.dd_refresh_acquisition_scorecard_v1(current_date);');
