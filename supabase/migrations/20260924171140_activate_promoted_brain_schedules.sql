do $$
begin
 if not exists(select 1 from cron.job where jobname='safe-automation-sweep') then perform cron.schedule('safe-automation-sweep','*/15 * * * *','select public.dd_run_safe_automation_recipes();'); end if;
 if not exists(select 1 from cron.job where jobname='company-controller-hourly') then perform cron.schedule('company-controller-hourly','7 * * * *','select public.dd_run_company_controller();'); end if;
 if not exists(select 1 from cron.job where jobname='service-discovery-daily') then perform cron.schedule('service-discovery-daily','17 4 * * *','select public.dd_run_service_discovery_controller();'); end if;
 if not exists(select 1 from cron.job where jobname='commercial-reconciliation-daily') then perform cron.schedule('commercial-reconciliation-daily','27 4 * * *','select public.dd_run_commercial_reconciliation();'); end if;
 if not exists(select 1 from cron.job where jobname='morning-brief-daily') then perform cron.schedule('morning-brief-daily','45 11 * * *','select public.dd_generate_company_morning_brief();'); end if;
end$$;
