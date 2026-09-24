create unique index if not exists dd_jobs_service_request_id_unique on public.dd_jobs(service_request_id) where service_request_id is not null;
