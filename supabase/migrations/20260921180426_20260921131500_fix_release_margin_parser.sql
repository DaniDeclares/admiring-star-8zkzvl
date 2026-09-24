create or replace view public.dd_service_release_contract_v1 as  WITH offer_rollup AS (
         SELECT o_1.canonical_sku,
            max(o_1.service_name) FILTER (WHERE o_1.commercial_offer_status = 'SELL_NOW'::text) AS service_name,
            max(o_1.division) AS division,
            count(DISTINCT o_1.runtime_service_id) FILTER (WHERE o_1.runtime_service_id IS NOT NULL) AS runtime_id_count,
            (array_agg(o_1.runtime_service_id) FILTER (WHERE o_1.runtime_service_id IS NOT NULL))[1] AS runtime_service_id,
            bool_or(o_1.commercial_offer_status = 'SELL_NOW'::text) AS has_sell_now,
            bool_or(o_1.commercial_offer_status = 'DO_NOT_SELL'::text) AS has_do_not_sell
           FROM dd_governed_service_offers o_1
          GROUP BY o_1.canonical_sku
        ), channel_rollup AS (
         SELECT dd_service_channel_availability.service_id,
            count(*) FILTER (WHERE dd_service_channel_availability.eligibility_status = ANY (ARRAY['ACTIVE'::text, 'ELIGIBLE'::text, 'QUOTE_REQUIRED'::text])) AS authorized_channel_count,
            count(*) FILTER (WHERE dd_service_channel_availability.eligibility_status = ANY (ARRAY['ACTIVE'::text, 'ELIGIBLE'::text])) AS direct_channel_count
           FROM dd_service_channel_availability
          GROUP BY dd_service_channel_availability.service_id
        ), pricing_rollup AS (
         SELECT dd_service_pricing_rules.service_id,
            count(*) FILTER (WHERE dd_service_pricing_rules.status = 'ACTIVE'::text AND dd_service_pricing_rules.lock_status = 'LOCKED'::text) AS locked_active_rule_count,
            count(*) FILTER (WHERE dd_service_pricing_rules.status = 'PENDING_RECONCILIATION'::text OR dd_service_pricing_rules.lock_status <> 'LOCKED'::text) AS unresolved_rule_count
           FROM dd_service_pricing_rules
          GROUP BY dd_service_pricing_rules.service_id
        ), economics_rollup AS (
         SELECT DISTINCT ON (dd_master_service_universe.canonical_sku) dd_master_service_universe.canonical_sku,
            dd_master_service_universe.internal_cost,
            dd_master_service_universe.margin_economics
           FROM dd_master_service_universe
          WHERE dd_master_service_universe.lifecycle_status = 'CANONICAL_ACTIVE'::text
          ORDER BY dd_master_service_universe.canonical_sku, dd_master_service_universe.updated_at DESC
        ), fulfillment_rollup AS (
         SELECT dd_service_requirements.service_id,
            count(*) FILTER (WHERE dd_service_requirements.required = true) AS required_requirement_count
           FROM dd_service_requirements
          GROUP BY dd_service_requirements.service_id
        ), provider_rollup AS (
         SELECT dd_provider_capabilities.service_id,
            count(*) FILTER (WHERE dd_provider_capabilities.is_authorized = true) AS provider_capability_count
           FROM dd_provider_capabilities
          GROUP BY dd_provider_capabilities.service_id
        ), routing_rollup AS (
         SELECT dd_work_order_routing.service_id,
            count(*) AS routing_count
           FROM private.dd_work_order_routing
          GROUP BY dd_work_order_routing.service_id
        ), task_rollup AS (
         SELECT dd_task_templates.service_id,
            count(*) AS active_task_template_count,
            count(*) FILTER (WHERE dd_task_templates.evidence_required = true) AS active_evidence_task_count
           FROM dd_task_templates
          WHERE dd_task_templates.is_active = true
          GROUP BY dd_task_templates.service_id
        ), stripe_rollup AS (
         SELECT r_1.canonical_sku,
            bool_or(r_1.stripe_payment_link_id IS NOT NULL) AS has_payment_link,
            bool_or(r_1.stripe_price_id IS NOT NULL) AS has_stripe_price,
            bool_or(r_1.activation_decision = ANY (ARRAY['ACTIVATE'::text, 'ACTIVE'::text])) AS stripe_register_authorized
           FROM dd_stripe_launch_register r_1
          GROUP BY r_1.canonical_sku
        ), sync_rollup AS (
         SELECT dd_stripe_catalog_sync.canonical_sku,
            bool_or(dd_stripe_catalog_sync.stripe_livemode = true AND dd_stripe_catalog_sync.sync_status = 'SYNCED_ACTIVE'::text) AS stripe_sync_active
           FROM dd_stripe_catalog_sync
          GROUP BY dd_stripe_catalog_sync.canonical_sku
        )
 SELECT o.canonical_sku,
    o.service_name,
    o.division,
    s.id AS runtime_service_id,
    s.service_family,
    s.name AS runtime_service_name,
    s.description,
    s.pricing_type,
    s.billing_cycle,
    s.resident_discount_eligible,
    s.pricing_engine_code,
    COALESCE(p.locked_active_rule_count, 0::bigint) AS locked_active_rule_count,
    COALESCE(p.unresolved_rule_count, 0::bigint) AS unresolved_rule_count,
    COALESCE(c.authorized_channel_count, 0::bigint) AS authorized_channel_count,
    COALESCE(c.direct_channel_count, 0::bigint) AS direct_channel_count,
    COALESCE(f.required_requirement_count, 0::bigint) AS required_requirement_count,
    COALESCE(pr.provider_capability_count, 0::bigint) AS provider_capability_count,
    COALESCE(r.routing_count, 0::bigint) AS routing_count,
    COALESCE(t.active_task_template_count, 0::bigint) AS active_task_template_count,
    COALESCE(sr.has_payment_link, false) AS has_payment_link,
    COALESCE(sr.has_stripe_price, false) AS has_stripe_price,
    COALESCE(sr.stripe_register_authorized, false) AS stripe_register_authorized,
    COALESCE(ss.stripe_sync_active, false) AS stripe_sync_active,
    COALESCE(v.stripe_price_verified_at IS NOT NULL, false) AS stripe_price_verified,
    COALESCE(v.payment_path_verified_at IS NOT NULL, false) AS payment_path_verified,
    COALESCE(v.runtime_verified_at IS NOT NULL, false) AS runtime_verified,
    COALESCE(v.regression_verified_at IS NOT NULL, false) AS regression_verified,
    COALESCE(v.production_smoke_verified_at IS NOT NULL, false) AS production_smoke_verified,
    COALESCE(pp.initial_payment_percent, 0::numeric) AS initial_payment_percent,
    o.runtime_id_count = 1 AND o.runtime_service_id IS NOT NULL AND s.is_active AND s.sku = o.canonical_sku AS canonical_identity_ok,
    NULLIF(TRIM(BOTH FROM COALESCE(o.service_name, ''::text)), ''::text) IS NOT NULL AND NULLIF(TRIM(BOTH FROM COALESCE(s.description, ''::text)), ''::text) IS NOT NULL AND NULLIF(TRIM(BOTH FROM COALESCE(s.pricing_type, ''::text)), ''::text) IS NOT NULL AND NULLIF(TRIM(BOTH FROM COALESCE(s.billing_cycle, ''::text)), ''::text) IS NOT NULL AND s.resident_discount_eligible IS NOT NULL AND o.has_sell_now AS commercial_definition_ok,
    s.pricing_engine_code IS NOT NULL AND (EXISTS ( SELECT 1
           FROM dd_pricing_engines e_1
          WHERE e_1.engine_code = s.pricing_engine_code AND e_1.is_active)) AND COALESCE(p.locked_active_rule_count, 0::bigint) > 0 AND COALESCE(p.unresolved_rule_count, 0::bigint) = 0 AS pricing_engine_ok,
    s.pricing_type = 'FIXED'::text AND COALESCE(p.locked_active_rule_count, 0::bigint) > 0 OR s.quote_input_schema IS NOT NULL AND jsonb_typeof(s.quote_input_schema) = 'object'::text AS quote_path_ok,
    COALESCE(c.authorized_channel_count, 0::bigint) > 0 AND COALESCE(c.direct_channel_count, 0::bigint) > 0 AS channel_authorization_ok,
    COALESCE(f.required_requirement_count, 0::bigint) > 0 AND COALESCE(pr.provider_capability_count, 0::bigint) > 0 AND COALESCE(r.routing_count, 0::bigint) > 0 AND COALESCE(t.active_task_template_count, 0::bigint) > 0 AND COALESCE(t.active_evidence_task_count, 0::bigint) > 0 AS fulfillment_matrix_ok,
        CASE
            WHEN (s.pricing_type = ANY (ARRAY['BESPOKE_SOW'::text, 'SOW'::text, 'SOW_PROCUREMENT'::text, 'QUOTE'::text, 'STARTING_AT'::text, 'CONFIGURED'::text, 'VARIABLE_QUOTE'::text])) OR s.starting_price IS NULL THEN COALESCE(v.payment_path_verified_at IS NOT NULL, false) AND COALESCE(pp.initial_payment_percent, 0::numeric) = 53.50
            ELSE COALESCE(sr.has_payment_link, false) AND COALESCE(sr.has_stripe_price, false) AND COALESCE(sr.stripe_register_authorized, false) AND COALESCE(ss.stripe_sync_active, false) AND COALESCE(v.stripe_price_verified_at IS NOT NULL, false)
        END AS payment_ledger_ok,
    COALESCE(v.runtime_verified_at IS NOT NULL, false) AND COALESCE(v.production_smoke_verified_at IS NOT NULL, false) AS runtime_accuracy_ok,
        CASE
            WHEN o.has_do_not_sell AND NOT o.has_sell_now THEN 'BLOCKED'::text
            WHEN NOT (o.runtime_id_count = 1 AND o.runtime_service_id IS NOT NULL AND s.is_active AND s.sku = o.canonical_sku) THEN 'CANONICAL_IDENTITY'::text
            WHEN NOT (NULLIF(TRIM(BOTH FROM COALESCE(o.service_name, ''::text)), ''::text) IS NOT NULL AND NULLIF(TRIM(BOTH FROM COALESCE(s.description, ''::text)), ''::text) IS NOT NULL AND NULLIF(TRIM(BOTH FROM COALESCE(s.pricing_type, ''::text)), ''::text) IS NOT NULL AND NULLIF(TRIM(BOTH FROM COALESCE(s.billing_cycle, ''::text)), ''::text) IS NOT NULL AND s.resident_discount_eligible IS NOT NULL AND o.has_sell_now) THEN 'COMMERCIAL_DEFINITION'::text
            WHEN NOT (COALESCE(NULLIF(TRIM(BOTH FROM e.internal_cost), ''::text), ''::text) <> ''::text AND COALESCE(NULLIF(TRIM(BOTH FROM e.margin_economics), ''::text), ''::text) <> ''::text AND e.internal_cost !~* 'PENDING_RECONCILIATION|DRAFT|NOT AN AUDITED|NEEDS DANIELLE|PRICE MISMATCH|FLAGGED, NOT RESOLVED|PROVISIONAL|PLANNING ASSUMPTION'::text AND e.margin_economics !~* 'PENDING_RECONCILIATION|DRAFT|NOT AN AUDITED|NEEDS DANIELLE|PRICE MISMATCH|FLAGGED, NOT RESOLVED|PROVISIONAL|PLANNING ASSUMPTION'::text AND COALESCE(NULLIF("substring"(e.margin_economics, '(-?[0-9]+(\\.[0-9]+)?)\\s*%'::text), ''::text), '0'::text)::numeric >= 50::numeric) THEN 'ECONOMICS'::text
            WHEN NOT (s.pricing_engine_code IS NOT NULL AND (EXISTS ( SELECT 1
               FROM dd_pricing_engines e_1
              WHERE e_1.engine_code = s.pricing_engine_code AND e_1.is_active)) AND COALESCE(p.locked_active_rule_count, 0::bigint) > 0 AND COALESCE(p.unresolved_rule_count, 0::bigint) = 0) THEN 'PRICING_ENGINE'::text
            WHEN NOT (s.pricing_type = 'FIXED'::text AND COALESCE(p.locked_active_rule_count, 0::bigint) > 0 OR s.quote_input_schema IS NOT NULL AND jsonb_typeof(s.quote_input_schema) = 'object'::text) THEN 'QUOTE_PATH'::text
            WHEN NOT (COALESCE(c.authorized_channel_count, 0::bigint) > 0 AND COALESCE(c.direct_channel_count, 0::bigint) > 0) THEN 'CHANNEL_AUTHORIZATION'::text
            WHEN NOT (COALESCE(f.required_requirement_count, 0::bigint) > 0 AND COALESCE(pr.provider_capability_count, 0::bigint) > 0 AND COALESCE(r.routing_count, 0::bigint) > 0 AND COALESCE(t.active_task_template_count, 0::bigint) > 0 AND COALESCE(t.active_evidence_task_count, 0::bigint) > 0) THEN 'FULFILLMENT_MATRIX'::text
            WHEN NOT
            CASE
                WHEN (s.pricing_type = ANY (ARRAY['BESPOKE_SOW'::text, 'SOW'::text, 'SOW_PROCUREMENT'::text, 'QUOTE'::text, 'STARTING_AT'::text, 'CONFIGURED'::text, 'VARIABLE_QUOTE'::text])) OR s.starting_price IS NULL THEN COALESCE(v.payment_path_verified_at IS NOT NULL, false) AND COALESCE(pp.initial_payment_percent, 0::numeric) = 53.50
                ELSE COALESCE(sr.has_payment_link, false) AND COALESCE(sr.has_stripe_price, false) AND COALESCE(sr.stripe_register_authorized, false) AND COALESCE(ss.stripe_sync_active, false) AND COALESCE(v.stripe_price_verified_at IS NOT NULL, false)
            END THEN 'PAYMENT_LEDGER'::text
            WHEN NOT (COALESCE(v.runtime_verified_at IS NOT NULL, false) AND COALESCE(v.production_smoke_verified_at IS NOT NULL, false)) THEN 'RUNTIME_ACCURACY'::text
            WHEN NOT COALESCE(v.regression_verified_at IS NOT NULL, false) THEN 'REGRESSION_VERIFIED'::text
            ELSE 'NONE'::text
        END AS blocking_gate,
        CASE
            WHEN o.has_do_not_sell AND NOT o.has_sell_now THEN 'BLOCKED'::text
            WHEN o.runtime_id_count = 1 AND o.runtime_service_id IS NOT NULL AND s.is_active AND s.sku = o.canonical_sku AND NULLIF(TRIM(BOTH FROM COALESCE(o.service_name, ''::text)), ''::text) IS NOT NULL AND NULLIF(TRIM(BOTH FROM COALESCE(s.description, ''::text)), ''::text) IS NOT NULL AND NULLIF(TRIM(BOTH FROM COALESCE(s.pricing_type, ''::text)), ''::text) IS NOT NULL AND NULLIF(TRIM(BOTH FROM COALESCE(s.billing_cycle, ''::text)), ''::text) IS NOT NULL AND s.resident_discount_eligible IS NOT NULL AND o.has_sell_now AND COALESCE(NULLIF(TRIM(BOTH FROM e.internal_cost), ''::text), ''::text) <> ''::text AND COALESCE(NULLIF(TRIM(BOTH FROM e.margin_economics), ''::text), ''::text) <> ''::text AND e.internal_cost !~* 'PENDING_RECONCILIATION|DRAFT|NOT AN AUDITED|NEEDS DANIELLE|PRICE MISMATCH|FLAGGED, NOT RESOLVED|PROVISIONAL|PLANNING ASSUMPTION'::text AND e.margin_economics !~* 'PENDING_RECONCILIATION|DRAFT|NOT AN AUDITED|NEEDS DANIELLE|PRICE MISMATCH|FLAGGED, NOT RESOLVED|PROVISIONAL|PLANNING ASSUMPTION'::text AND COALESCE(NULLIF("substring"(e.margin_economics, '(-?[0-9]+(\\.[0-9]+)?)\\s*%'::text), ''::text), '0'::text)::numeric >= 50::numeric AND s.pricing_engine_code IS NOT NULL AND (EXISTS ( SELECT 1
               FROM dd_pricing_engines e_1
              WHERE e_1.engine_code = s.pricing_engine_code AND e_1.is_active)) AND COALESCE(p.locked_active_rule_count, 0::bigint) > 0 AND COALESCE(p.unresolved_rule_count, 0::bigint) = 0 AND (s.pricing_type = 'FIXED'::text AND COALESCE(p.locked_active_rule_count, 0::bigint) > 0 OR s.quote_input_schema IS NOT NULL AND jsonb_typeof(s.quote_input_schema) = 'object'::text) AND COALESCE(c.authorized_channel_count, 0::bigint) > 0 AND COALESCE(c.direct_channel_count, 0::bigint) > 0 AND COALESCE(f.required_requirement_count, 0::bigint) > 0 AND COALESCE(pr.provider_capability_count, 0::bigint) > 0 AND COALESCE(r.routing_count, 0::bigint) > 0 AND COALESCE(t.active_task_template_count, 0::bigint) > 0 AND COALESCE(t.active_evidence_task_count, 0::bigint) > 0 AND
            CASE
                WHEN (s.pricing_type = ANY (ARRAY['BESPOKE_SOW'::text, 'SOW'::text, 'SOW_PROCUREMENT'::text, 'QUOTE'::text, 'STARTING_AT'::text, 'CONFIGURED'::text, 'VARIABLE_QUOTE'::text])) OR s.starting_price IS NULL THEN COALESCE(v.payment_path_verified_at IS NOT NULL, false) AND COALESCE(pp.initial_payment_percent, 0::numeric) = 53.50
                ELSE COALESCE(sr.has_payment_link, false) AND COALESCE(sr.has_stripe_price, false) AND COALESCE(sr.stripe_register_authorized, false) AND COALESCE(ss.stripe_sync_active, false) AND COALESCE(v.stripe_price_verified_at IS NOT NULL, false)
            END AND COALESCE(v.runtime_verified_at IS NOT NULL, false) AND COALESCE(v.production_smoke_verified_at IS NOT NULL, false) AND COALESCE(v.regression_verified_at IS NOT NULL, false) THEN 'LIVE_READY'::text
            ELSE 'HOLD'::text
        END AS release_state
   FROM offer_rollup o
     LEFT JOIN services s ON s.id = o.runtime_service_id
     LEFT JOIN pricing_rollup p ON p.service_id = s.id
     LEFT JOIN economics_rollup e ON e.canonical_sku = o.canonical_sku
     LEFT JOIN channel_rollup c ON c.service_id = s.id
     LEFT JOIN fulfillment_rollup f ON f.service_id = s.id
     LEFT JOIN provider_rollup pr ON pr.service_id = s.id
     LEFT JOIN routing_rollup r ON r.service_id = s.id
     LEFT JOIN task_rollup t ON t.service_id = s.id
     LEFT JOIN stripe_rollup sr ON sr.canonical_sku = o.canonical_sku
     LEFT JOIN sync_rollup ss ON ss.canonical_sku = o.canonical_sku
     LEFT JOIN dd_service_release_verifications v ON v.canonical_sku = o.canonical_sku
     LEFT JOIN dd_service_payment_policy pp ON pp.policy_key = 'DEFAULT'::text AND pp.is_active;;
