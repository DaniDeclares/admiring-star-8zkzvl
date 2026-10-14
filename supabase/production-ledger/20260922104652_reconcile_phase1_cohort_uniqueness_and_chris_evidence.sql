
create unique index if not exists dd_launch_cohort_route_uq
on public.dd_launch_fulfillment_cohort(
  cohort_code,
  subject_kind,
  subject_key
);

-- Chris evidence uniqueness (Production applied form)
create unique index if not exists dd_chris_evidence_subject_uq
on public.dd_chris_evidence(subject_kind, subject_key)
where subject_key is not null;
