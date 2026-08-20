-- PASS A.4 — Guarded Supabase scheduler for the notification outbox.
-- Supabase pg_cron runs every five minutes, but the job is fail-closed until
-- Vault contains `dd_cron_secret`. That secret must match Vercel CRON_SECRET.
-- No credentials are stored in source control.

CREATE OR REPLACE FUNCTION private.dd_trigger_notification_worker()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_secret text;
BEGIN
  SELECT decrypted_secret
    INTO v_secret
  FROM vault.decrypted_secrets
  WHERE name = 'dd_cron_secret'
  LIMIT 1;

  IF v_secret IS NULL OR length(v_secret) < 32 THEN
    RETURN;
  END IF;

  PERFORM net.http_post(
    url := 'https://danideclares.com/api/cron/notification-worker',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || v_secret
    ),
    body := jsonb_build_object('source', 'supabase_pg_cron', 'triggered_at', now()),
    timeout_milliseconds := 10000
  );
END;
$$;

SELECT cron.unschedule(jobid)
FROM cron.job
WHERE jobname = 'process-notification-outbox-secure';

SELECT cron.schedule(
  'process-notification-outbox-secure',
  '*/5 * * * *',
  $$SELECT private.dd_trigger_notification_worker();$$
);
