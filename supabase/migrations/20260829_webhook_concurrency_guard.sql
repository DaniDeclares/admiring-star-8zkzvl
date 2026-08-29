-- One operational job per service request.
-- This closes the concurrent Stripe webhook race that can otherwise create duplicate jobs
-- before the payment-event idempotency check runs.
create unique index if not exists dd_jobs_service_request_id_unique
  on public.dd_jobs(service_request_id)
  where service_request_id is not null;
