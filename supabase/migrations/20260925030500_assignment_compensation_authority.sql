alter table public.dd_job_assignments
  add column if not exists source_assignment_offer_id uuid references public.dd_estimate_assignment_offers(id) on delete set null,
  add column if not exists economics_snapshot_id uuid references public.dd_estimate_economics_snapshots(id) on delete set null,
  add column if not exists authorized_provider_compensation numeric,
  add column if not exists compensation_basis_snapshot jsonb not null default '{}'::jsonb;

create unique index if not exists uq_dd_job_assignments_source_offer
  on public.dd_job_assignments(source_assignment_offer_id)
  where source_assignment_offer_id is not null;

alter table public.dd_job_assignments drop constraint if exists dd_job_assignments_authorized_comp_nonnegative;
alter table public.dd_job_assignments add constraint dd_job_assignments_authorized_comp_nonnegative
  check(authorized_provider_compensation is null or authorized_provider_compensation>=0);
