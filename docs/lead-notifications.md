# DANI DECLARES — Lead Notifications
## Current architecture
Service requests submitted through `/request-service` are persisted to `leads` and `service_requests`. The intake webhook now publishes notification intents to the transactional outbox after successful persistence. Email is queued when `NOTIFICATION_EMAIL` is configured; SMS is queued when `NOTIFICATION_PHONE` is configured. Notification delivery is handled by `api/process-outbox.js`.
## Delivery
Email uses Resend via `RESEND_API_KEY` + `RESEND_FROM_EMAIL` (or `NOTIFICATION_FROM_EMAIL`). SMS uses Twilio `TWILIO_ACCOUNT_SID` + `TWILIO_API_KEY_SID` + `TWILIO_API_KEY_SECRET` and accepts either `TWILIO_FROM_NUMBER` or the existing `TWILIO_PHONE_NUMBER` environment variable.
## Scheduler
Supabase `pg_cron` job `process-notification-outbox-secure` runs every five minutes and calls `/api/process-outbox` using the Vault secret `dd_cron_secret`. The current Vault contains a valid-length secret. Vercel Production still requires the matching `CRON_SECRET` environment variable before the worker will accept the call.
## Owner notification setup
Configure `NOTIFICATION_EMAIL` to the desired DANI operations inbox. Configure `NOTIFICATION_PHONE` if SMS alerts to Danielle are desired. Do not place secrets or private credentials in source control.
## Failure behavior
A successful customer intake is not failed merely because notification delivery/queueing fails. Notification failures are logged and the request remains persisted for operational recovery.
