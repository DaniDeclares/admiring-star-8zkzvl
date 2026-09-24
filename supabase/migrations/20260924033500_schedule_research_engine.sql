-- Schedule the governed Protection & Benefits research engine through Supabase pg_cron.
-- Environment-specific invocation details live in Vault:
--   dd_research_anon_key
--   dd_research_function_url
-- No credentials or project URLs are committed here.

create schema if not exists private;

create or replace function private.dd_trigger_research_engine()
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_key text;
  v_url text;
begin
  select decrypted_secret
    into v_key
  from vault.decrypted_secrets
  where name = 'dd_research_anon_key'
  limit 1;

  select decrypted_secret
    into v_url
  from vault.decrypted_secrets
  where name = 'dd_research_function_url'
  limit 1;

  if v_key is null or v_url is null then
    return;
  end if;

  perform net.http_post(
    url := v_url,
    headers := jsonb_build_object(
      'Content-Type','application/json',
      'Authorization','Bearer ' || v_key,
      'apikey',v_key
    ),
    body := jsonb_build_object(
      'source','supabase_pg_cron',
      'triggered_at',now()
    ),
    timeout_milliseconds := 20000
  );
end;
$$;

select cron.unschedule(jobid)
from cron.job
where jobname = 'dani-research-engine';

select cron.schedule(
  'dani-research-engine',
  '*/15 * * * *',
  $$select private.dd_trigger_research_engine();$$
);
