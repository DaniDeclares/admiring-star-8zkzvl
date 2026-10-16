-- Draft-only migration. Apply to isolated Tester before production.
-- Existing rows retain original status, payload, event_key and attempts.
alter table public.dd_event_outbox
  add column if not exists notification_identity text,
  add column if not exists request_fingerprint text,
  add column if not exists frozen_request jsonb,
  add column if not exists first_attempt_at timestamptz,
  add column if not exists provider_email_id text,
  add column if not exists delivery_outcome text,
  add column if not exists claim_token uuid,
  add column if not exists claimed_at timestamptz;
create unique index if not exists dd_event_outbox_notification_identity_unique
  on public.dd_event_outbox(notification_identity)
  where notification_identity is not null;
comment on column public.dd_event_outbox.delivery_outcome is
  'ACCEPTED, REJECTED, RETRYABLE, UNCERTAIN; provider acceptance is not delivery.';
-- Never auto-release PROCESSING rows with uncertain external effects.
