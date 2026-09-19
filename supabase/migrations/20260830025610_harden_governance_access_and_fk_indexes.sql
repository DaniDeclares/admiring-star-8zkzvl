begin;

-- Governance/control-plane tables are internal. Keep the existing staff/admin SELECT
-- policies, but eliminate direct client DML privileges and enable RLS.
alter table public.dd_master_service_reconciliation_ledger enable row level security;
alter table public.dd_governed_commercial_offers enable row level security;
alter table public.dd_governed_service_offers enable row level security;

revoke all privileges on table public.dd_master_service_reconciliation_ledger from anon, authenticated;
revoke all privileges on table public.dd_governed_commercial_offers from anon, authenticated;
revoke all privileges on table public.dd_governed_service_offers from anon, authenticated;

-- Authenticated staff/procurement operators retain read-only control-plane visibility
-- through the already-existing policies. All writes remain server-side.
grant select on table public.dd_master_service_reconciliation_ledger to authenticated;
grant select on table public.dd_governed_commercial_offers to authenticated;
grant select on table public.dd_governed_service_offers to authenticated;

grant select, insert, update, delete, references, trigger, truncate on table public.dd_master_service_reconciliation_ledger to service_role;
grant select, insert, update, delete, references, trigger, truncate on table public.dd_governed_commercial_offers to service_role;
grant select, insert, update, delete, references, trigger, truncate on table public.dd_governed_service_offers to service_role;

-- Ensure runtime_service_id foreign-key joins have dedicated indexes.
create index if not exists idx_dd_master_service_reconciliation_ledger_runtime_service_id
  on public.dd_master_service_reconciliation_ledger(runtime_service_id);

create index if not exists idx_dd_governed_service_offers_runtime_service_id
  on public.dd_governed_service_offers(runtime_service_id);

commit;