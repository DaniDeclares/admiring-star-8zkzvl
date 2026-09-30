-- Close the exact security regressions surfaced by dd_run_security_regression_proof.
-- Internal governance/research tables are not anonymous write surfaces.

alter table public.dd_github_well_architected_review_matrix enable row level security;

revoke insert, update, delete
  on public.dd_github_well_architected_review_matrix
  from anon;

revoke insert, update, delete
  on public.dd_observational_pattern_candidates
  from anon;

revoke insert, update, delete
  on public.dd_real_sales_engine_v1
  from anon;
