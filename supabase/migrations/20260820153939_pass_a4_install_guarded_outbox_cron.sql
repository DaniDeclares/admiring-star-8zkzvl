-- PASS A.4 — Install the 5-minute scheduler without ever making an unauthenticated call.
-- The job is intentionally inert until Vault contains dd_cron_secret.
-- When the secret is provisioned, it must match Vercel's CRON_SECRET value.

create or replace function private.dd_trigger_notification_worker()
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_secret text;
begin
  select decrypted_secret
    into v_secret
  from vault.decrypted_secrets
  where name = 'dd_cron_secret'
  limit 1;

  -- Fail closed while production credential binding is incomplete.
  if v_secret is null or length(v_secret) < 32 then
    return;
  end if;

  perform net.http_post(
    url := 'https://danideclares.com/api/cron/notification-worker',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || v_secret
    ),
    body := jsonb_build_object('source', 'supabase_pg_cron', 'triggered_at', now()),
    timeout_milliseconds := 10000
  );
end;
$$;

-- Replace any previous copy deterministically.
select cron.unschedule(jobid)
from cron.job
where jobname = 'process-notification-outbox-secure';

select cron.schedule(
  'process-notification-outbox-secure',
  '*/5 * * * *',
  $$select private.dd_trigger_notification_worker();$$
);
