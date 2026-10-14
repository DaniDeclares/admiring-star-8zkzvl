
alter table public.dd_job_appointments
add constraint dd_job_appointments_no_provider_overlap
exclude using gist (
  provider_id with =,
  tstzrange(starts_at, ends_at, '[)') with &&
)
where (appointment_status <> 'CANCELLED');
