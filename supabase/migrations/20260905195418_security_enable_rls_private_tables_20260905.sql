-- Defense-in-depth: private operational/catalog tables must not be directly readable
-- or writable through authenticated/anonymous PostgREST access.
-- Existing application access uses server-side/service-role paths; no client policies
-- are intentionally granted on these private tables.

ALTER TABLE private.dd_provider_commercial_terms ENABLE ROW LEVEL SECURITY;
ALTER TABLE private.dd_provider_routing_destinations ENABLE ROW LEVEL SECURITY;
ALTER TABLE private.dd_work_order_routing ENABLE ROW LEVEL SECURITY;
ALTER TABLE private.dd_provider_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE private.dd_catalog_provider_master ENABLE ROW LEVEL SECURITY;
ALTER TABLE private.dd_catalog_provider_capability_master ENABLE ROW LEVEL SECURITY;
ALTER TABLE private.dd_catalog_inventory_master ENABLE ROW LEVEL SECURITY;
ALTER TABLE private.dd_catalog_capability_dependency_master ENABLE ROW LEVEL SECURITY;
ALTER TABLE private.dd_master_service_universe_reconciliation ENABLE ROW LEVEL SECURITY;
ALTER TABLE private.dd_master_service_universe_provider_evidence ENABLE ROW LEVEL SECURITY;
ALTER TABLE private.dd_master_service_universe_catalog_capability_evidence ENABLE ROW LEVEL SECURITY;
ALTER TABLE private.dd_master_service_universe_legacy_package_evidence ENABLE ROW LEVEL SECURITY;
ALTER TABLE private.dd_provider_capability_reconciliation ENABLE ROW LEVEL SECURITY;
ALTER TABLE private.dd_service_capability_relationship ENABLE ROW LEVEL SECURITY;
