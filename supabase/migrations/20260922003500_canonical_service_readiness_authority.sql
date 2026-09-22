-- DANI DECLARES canonical service readiness authority reconciliation
-- Purpose:
-- 1) Preserve dd_service_readiness_v1 as offer/configuration-level diagnostic history.
-- 2) Preserve dd_service_release_contract_v1 as the production release authority.
-- 3) Provide a one-row-per-canonical-SKU summary so offer rows are never counted as services.
-- No business records are mutated by this migration.

COMMENT ON VIEW public.dd_service_readiness_v1 IS
'CONFIGURATION DIAGNOSTIC ONLY. Grain is governed-offer row, not canonical service. Do not use row counts or LIVE_* labels from this view as production release authority. Use dd_service_canonical_readiness_v1 for one-row-per-SKU reporting and dd_service_release_contract_v1 for production release authority.';

COMMENT ON VIEW public.dd_service_release_contract_v1 IS
'PRODUCTION RELEASE AUTHORITY. One row per canonical SKU. LIVE_READY requires the governed end-to-end release gates; HOLD/BLOCKED services must not be represented as production-released.';

CREATE OR REPLACE VIEW public.dd_service_canonical_readiness_v1
WITH (security_invoker=true) AS
WITH config AS (
  SELECT
    canonical_sku,
    count(*)::bigint AS governed_offer_row_count,
    bool_or(commercial_offer_status = 'SELL_NOW') AS has_sell_now_offer,
    bool_or(commercial_offer_status = 'DO_NOT_SELL') AS has_do_not_sell_offer,
    bool_or(readiness_state = 'LIVE_CHECKOUT_READY') AS has_checkout_config,
    bool_or(readiness_state = 'LIVE_MANUAL_INVOICE_ONLY') AS has_manual_invoice_config,
    bool_or(readiness_state = 'LIVE_QUOTE_ONLY') AS has_quote_config,
    bool_or(readiness_state = 'BLOCKED') AS has_blocked_offer,
    array_agg(DISTINCT readiness_state ORDER BY readiness_state) AS configuration_states,
    array_agg(DISTINCT commercial_offer_status ORDER BY commercial_offer_status) AS commercial_offer_states
  FROM public.dd_service_readiness_v1
  GROUP BY canonical_sku
)
SELECT
  rc.canonical_sku,
  rc.service_name,
  rc.division,
  rc.runtime_service_id,
  rc.service_family,
  c.governed_offer_row_count,
  c.commercial_offer_states,
  c.configuration_states,
  c.has_sell_now_offer,
  c.has_do_not_sell_offer,
  (c.has_sell_now_offer AND c.has_do_not_sell_offer) AS conflicting_offer_governance,
  c.has_checkout_config,
  c.has_manual_invoice_config,
  c.has_quote_config,
  c.has_blocked_offer,
  rc.blocking_gate,
  rc.release_state,
  (rc.release_state = 'LIVE_READY') AS production_sellable
FROM public.dd_service_release_contract_v1 rc
LEFT JOIN config c USING (canonical_sku);

COMMENT ON VIEW public.dd_service_canonical_readiness_v1 IS
'Canonical service reporting surface: exactly one row per canonical SKU. Configuration states summarize dd_service_readiness_v1 offer rows; release_state and production_sellable come only from dd_service_release_contract_v1. Use production_sellable for sales/release counts.';

GRANT SELECT ON public.dd_service_canonical_readiness_v1 TO authenticated, service_role;

DO $$
DECLARE
  v_release bigint;
  v_summary bigint;
  v_duplicates bigint;
  v_live bigint;
BEGIN
  SELECT count(*) INTO v_release FROM public.dd_service_release_contract_v1;
  SELECT count(*) INTO v_summary FROM public.dd_service_canonical_readiness_v1;
  SELECT count(*) - count(DISTINCT canonical_sku) INTO v_duplicates
    FROM public.dd_service_canonical_readiness_v1;
  SELECT count(*) INTO v_live
    FROM public.dd_service_canonical_readiness_v1
    WHERE production_sellable;

  IF v_release <> v_summary THEN
    RAISE EXCEPTION 'Canonical readiness row count % does not match release contract row count %', v_summary, v_release;
  END IF;
  IF v_duplicates <> 0 THEN
    RAISE EXCEPTION 'Canonical readiness contains % duplicate canonical SKU rows', v_duplicates;
  END IF;
  IF v_live <> (SELECT count(*) FROM public.dd_service_release_contract_v1 WHERE release_state='LIVE_READY') THEN
    RAISE EXCEPTION 'Canonical readiness LIVE count diverges from release authority';
  END IF;
END $$;
