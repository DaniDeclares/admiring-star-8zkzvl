-- Remove exact duplicate/redundant indexes confirmed by the live catalog.
DROP INDEX IF EXISTS public.uq_dd_provider_org_internal_alias;
DROP INDEX IF EXISTS public.idx_dd_jobs_service_request_id;

-- Cover foreign keys identified by the performance advisor in high-use provider,
-- catalog-routing, and commercial relationship paths.
CREATE INDEX IF NOT EXISTS idx_dd_business_build_relationships_provider_org ON public.dd_business_build_relationships (provider_org_id);
CREATE INDEX IF NOT EXISTS idx_dd_business_build_relationships_network_access ON public.dd_business_build_relationships (network_access_level);
CREATE INDEX IF NOT EXISTS idx_dd_commercial_relationships_network_access ON public.dd_commercial_relationships (network_access_level);
CREATE INDEX IF NOT EXISTS idx_dd_commercial_relationships_relationship_type ON public.dd_commercial_relationships (relationship_type);
CREATE INDEX IF NOT EXISTS idx_dd_provider_organizations_commercial_relationship ON public.dd_provider_organizations (commercial_relationship_type);
CREATE INDEX IF NOT EXISTS idx_dd_provider_organizations_network_access ON public.dd_provider_organizations (network_access_level);
CREATE INDEX IF NOT EXISTS idx_dd_provider_assets_provider_org ON public.dd_provider_assets (provider_org_id);
CREATE INDEX IF NOT EXISTS idx_dd_provider_assets_provider ON public.dd_provider_assets (provider_id);
CREATE INDEX IF NOT EXISTS idx_dd_provider_service_reconciliation_canonical ON public.dd_provider_service_reconciliation (canonical_service_id);
CREATE INDEX IF NOT EXISTS idx_dd_service_channel_availability_channel ON public.dd_service_channel_availability (channel_code);
CREATE INDEX IF NOT EXISTS idx_dd_service_customer_routing_subchannel ON public.dd_service_customer_routing (subchannel_code);
CREATE INDEX IF NOT EXISTS idx_dd_service_market_pricing_rules_pricing_rule ON public.dd_service_market_pricing_rules (pricing_rule_id);
CREATE INDEX IF NOT EXISTS idx_dd_service_market_pricing_rules_service ON public.dd_service_market_pricing_rules (service_id);
CREATE INDEX IF NOT EXISTS idx_dd_service_normalization_register_source ON public.dd_service_normalization_register (source_service_id);