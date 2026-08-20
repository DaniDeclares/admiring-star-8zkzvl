-- The deployed worker is api/process-outbox.js.
-- Keep the five-minute Supabase scheduler, but target the real Vercel function path.
-- No pricing or financial logic changes.

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
    url := 'https://danideclares.com/api/process-outbox',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || v_secret
    ),
    body := jsonb_build_object('source', 'supabase_pg_cron', 'triggered_at', now()),
    timeout_milliseconds := 10000
  );
END;
$$;

REVOKE ALL ON FUNCTION private.dd_trigger_notification_worker() FROM PUBLIC;
REVOKE ALL ON FUNCTION private.dd_trigger_notification_worker() FROM authenticated;
