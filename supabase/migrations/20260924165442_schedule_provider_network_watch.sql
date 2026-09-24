do $$
begin
  if not exists (select 1 from cron.job where jobname='provider-network-watch') then
    perform cron.schedule(
      'provider-network-watch',
      '*/15 * * * *',
      'select public.dd_run_provider_network_watch();'
    );
  end if;
end $$;
