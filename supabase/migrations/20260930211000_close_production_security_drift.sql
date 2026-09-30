-- Close Production security drift surfaced by dd_run_security_regression_proof.
-- Internal governance/research/projection objects are not anonymous write surfaces.
-- Views are included because PostgreSQL may report inherited table-style grants on views.

alter table if exists public.dd_payment_projection_candidates enable row level security;

revoke insert, update, delete on table
  public.dd_payment_projection_candidates,
  public.dd_external_work_economics_observations,
  public.dd_github_work_approvals,
  public.dd_github_work_execution_receipts,
  public.dd_merch_product_candidates
from anon;

do $$
begin
  if to_regclass('public.dd_external_action_claim_health_v1') is not null then
    execute 'revoke insert, update, delete on public.dd_external_action_claim_health_v1 from anon';
  end if;
  if to_regclass('public.dd_service_release_reconciliation_queue_v1') is not null then
    execute 'revoke insert, update, delete on public.dd_service_release_reconciliation_queue_v1 from anon';
  end if;
end $$;

comment on table public.dd_payment_projection_candidates is
'Candidate-only payment projection authority. RLS enabled; anonymous writes prohibited. Presence never authorizes Stripe side effects.';
