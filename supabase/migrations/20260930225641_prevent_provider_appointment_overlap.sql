
alter table public.dd_job_appointments
  drop constraint if exists dd_job_appointments_provider_no_overlap;

alter table public.dd_job_appointments
  add constraint dd_job_appointments_provider_no_overlap
  exclude using gist (
    provider_id with =,
    tstzrange(starts_at, ends_at, '[)') with &&
  )
  where (appointment_status <> 'CANCELLED');

comment on constraint dd_job_appointments_provider_no_overlap on public.dd_job_appointments
is 'Prevents a provider from being assigned overlapping active appointments; cancelled appointments do not block scheduling.';
