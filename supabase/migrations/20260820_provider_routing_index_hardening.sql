begin;

-- Routing indexes: cover the foreign keys used by assignment, service, and provider lookups.
create index if not exists dd_provider_commercial_terms_service_idx
  on private.dd_provider_commercial_terms(service_id);

create index if not exists dd_work_order_routing_service_idx
  on private.dd_work_order_routing(service_id);

create index if not exists dd_work_order_routing_selected_provider_idx
  on private.dd_work_order_routing(selected_provider_id);

-- The earlier contract-control migration added the same provider-org index under a
-- different name; keep the canonical existing G4/Provider Network index only.
drop index if exists public.idx_dd_job_assignments_provider_org_status;

commit;
