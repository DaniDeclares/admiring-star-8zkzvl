-- Operation $1M: buyer queues fail closed on need evidence and exclude partner lanes.
-- High intent tier alone is not treated as a stated buyer problem.
CREATE OR REPLACE VIEW public.dd_owner_home_sales_queue_v1
WITH (security_invoker=true)
AS
 WITH oh AS (
         SELECT dd_owner_home_live_sellable_v1.sku
           FROM dd_owner_home_live_sellable_v1
        ), base AS (
         SELECT s.id,
            s.company_name,
            s.contact_name,
            s.sales_metadata ->> 'channel_code'::text AS channel_code,
            s.disposition,
            s.campaign_status,
            s.suggested_sku,
            r.release_state AS offer_state,
            s.intent_tier,
            s.amount_collected,
            s.quoted_amount,
            s.next_action,
            s.last_contacted_at,
            s.next_permitted_contact_at,
            s.contact_pressure_state,
            upper(COALESCE(s.source_direction, ''::text)) = 'INBOUND'::text OR (s.disposition = ANY (ARRAY['DECISION_MAKER_REACHED'::text, 'EXISTING_VENDOR_REVISIT'::text, 'QUOTE_REQUESTED'::text, 'READY_TO_BUY'::text])) OR COALESCE(s.amount_collected, 0::numeric) > 0::numeric OR upper(COALESCE(s.campaign_status, ''::text)) = 'RESPONDED'::text AS warm,
            s.pain_point IS NOT NULL OR (s.disposition = ANY (ARRAY['QUOTE_REQUESTED'::text, 'READY_TO_BUY'::text])) AS explicit_need,
            COALESCE(r.release_state = 'LIVE_READY'::text, false) AS live_offer,
            (s.email IS NOT NULL OR s.phone IS NOT NULL) AND upper(COALESCE(s.campaign_status, ''::text)) <> 'BOUNCED'::text OR COALESCE(s.sales_metadata #>> '{owner_home_queue_20261007,route}'::text[], ''::text) ~~* 'LINKEDIN%'::text AS contact_route,
            COALESCE((s.suggested_sku IN ( SELECT oh.sku
                   FROM oh)), false) AS home_fulfillable,
            (s.disposition = ANY (ARRAY['QUOTE_REQUESTED'::text, 'READY_TO_BUY'::text])) OR COALESCE(s.quoted_amount, 0::numeric) > 0::numeric AS payment_path,
            COALESCE(s.sales_metadata ->> 'routine_outreach_suppressed'::text, 'false'::text) = 'true'::text OR s.next_action ~~* '%RELATIONSHIP RECOVERY HOLD%'::text OR s.next_action ~~* '%owner-sent%'::text OR COALESCE(s.sales_metadata #>> '{owner_home_queue_20261007,route}'::text[], ''::text) ~~* '%OWNER_ONLY%'::text AS owner_only
           FROM dd_sales_queue s
             LEFT JOIN dd_service_release_contract_v1 r ON r.canonical_sku = s.suggested_sku
          WHERE COALESCE(s.do_not_contact, false) = false AND COALESCE(s.lane, ''::text) <> 'PARTNER'::text AND (s.disposition <> ALL (ARRAY['NOT_INTERESTED'::text, 'CLOSED_LOST'::text])) AND (COALESCE(s.sales_metadata #>> '{channel_tag_20261006,status}'::text[], ''::text) <> ALL (ARRAY['PARTNER_NOT_BUYER'::text, 'TEST_RECORD'::text]))
        ), scored AS (
         SELECT b.id,
            b.company_name,
            b.contact_name,
            b.channel_code,
            b.disposition,
            b.campaign_status,
            b.suggested_sku,
            b.offer_state,
            b.intent_tier,
            b.amount_collected,
            b.quoted_amount,
            b.next_action,
            b.last_contacted_at,
            b.next_permitted_contact_at,
            b.contact_pressure_state,
            b.warm,
            b.explicit_need,
            b.live_offer,
            b.contact_route,
            b.home_fulfillable,
            b.payment_path,
            b.owner_only,
                CASE
                    WHEN b.warm THEN 32
                    ELSE 0
                END +
                CASE
                    WHEN b.explicit_need THEN 16
                    ELSE 0
                END +
                CASE
                    WHEN b.live_offer THEN 8
                    ELSE 0
                END +
                CASE
                    WHEN b.contact_route THEN 4
                    ELSE 0
                END +
                CASE
                    WHEN b.home_fulfillable THEN 2
                    ELSE 0
                END +
                CASE
                    WHEN b.payment_path THEN 1
                    ELSE 0
                END AS rank_score,
            row_number() OVER (PARTITION BY (lower(COALESCE(NULLIF(b.company_name, ''::text), b.contact_name, b.id::text))) ORDER BY b.warm DESC, b.explicit_need DESC, b.live_offer DESC, b.contact_route DESC) AS company_slot
           FROM base b
        )
 SELECT id,
    company_name,
    contact_name,
    channel_code,
    disposition,
    campaign_status,
    suggested_sku,
    offer_state,
    intent_tier,
    amount_collected,
    quoted_amount,
    next_action,
    last_contacted_at,
    next_permitted_contact_at,
    contact_pressure_state,
    warm,
    explicit_need,
    live_offer,
    contact_route,
    home_fulfillable,
    payment_path,
    owner_only,
    rank_score,
    company_slot,
        CASE
            WHEN disposition = 'PAYMENT_SUCCEEDED'::text AND next_action ~~* 'Post-job follow-up sent%'::text THEN 'Await repeat/referral response; no additional payment or immediate outreach'::text
            WHEN disposition = 'PAYMENT_SUCCEEDED'::text THEN 'Close out fulfillment + QA, then ask for repeat/referral (owner)'::text
            WHEN owner_only THEN 'OWNER ONLY: use the verified owner-controlled route; no automated outreach'::text
            WHEN suggested_sku IS NULL THEN 'Match to an existing LIVE_READY offer from stated need before any outreach'::text
            WHEN NOT live_offer THEN 'Offer held: repair release gate before quoting'::text
            WHEN NOT contact_route THEN 'Find verified route (no guessed emails)'::text
            WHEN payment_path THEN 'Advance governed quote/payment path only from explicit buyer scope'::text
            ELSE 'Prepare governed outreach via danideclaresns@gmail.com (respect cadence and authority)'::text
        END AS next_exact_action
   FROM scored
  WHERE company_slot = 1
  ORDER BY rank_score DESC, last_contacted_at NULLS FIRST;

CREATE OR REPLACE VIEW public.dd_ch03_ch04_buyer_queue_v1
WITH (security_invoker=true)
AS
 WITH buyers AS (
         SELECT s.id,
            s.company_name,
            s.contact_name,
            s.email,
            s.phone,
            s.sales_metadata ->> 'channel_code'::text AS channel_code,
            s.front_door_code,
            s.pain_point,
            s.disposition,
            s.intent_tier,
            s.source_confidence,
            s.decision_maker_confirmed,
            s.campaign_status,
            s.contact_pressure_state,
            s.next_permitted_contact_at,
            s.suggested_sku,
            s.next_action,
            s.last_contacted_at,
            COALESCE(s.do_not_contact, false) AS do_not_contact,
            COALESCE(s.sales_metadata #>> '{owner_home_queue_20261007,route}'::text[], ''::text) AS owner_route
           FROM dd_sales_queue s
          WHERE COALESCE(s.do_not_contact, false) = false AND COALESCE(s.lane, ''::text) <> 'PARTNER'::text AND (COALESCE(s.sales_metadata ->> 'channel_code'::text, ''::text) = ANY (ARRAY['CH03'::text, 'CH04'::text])) AND (s.disposition <> ALL (ARRAY['NOT_INTERESTED'::text, 'CLOSED_LOST'::text])) AND (COALESCE(s.sales_metadata #>> '{channel_tag_20261006,status}'::text[], ''::text) <> ALL (ARRAY['PARTNER_NOT_BUYER'::text, 'TEST_RECORD'::text]))
        ), normalized AS (
         SELECT b.id,
            b.company_name,
            b.contact_name,
            b.email,
            b.phone,
            b.channel_code,
            b.front_door_code,
            b.pain_point,
            b.disposition,
            b.intent_tier,
            b.source_confidence,
            b.decision_maker_confirmed,
            b.campaign_status,
            b.contact_pressure_state,
            b.next_permitted_contact_at,
            b.suggested_sku,
            b.next_action,
            b.last_contacted_at,
            b.do_not_contact,
            b.owner_route,
            fd.front_door_name,
            fd.customer_promise,
            COALESCE(fd.front_door_code IS NOT NULL, false) AS front_door_verified,
            COALESCE(b.pain_point IS NOT NULL OR (b.disposition = ANY (ARRAY['QUOTE_REQUESTED'::text, 'READY_TO_BUY'::text])), false) AS explicit_need,
            COALESCE((b.email IS NOT NULL OR b.phone IS NOT NULL) AND upper(COALESCE(b.campaign_status, ''::text)) <> 'BOUNCED'::text OR b.owner_route ~~* 'LINKEDIN%'::text, false) AS contact_route,
            COALESCE(b.owner_route ~~* '%OWNER_ONLY%'::text OR b.next_action ~~* '%owner-sent%'::text OR b.next_action ~~* '%RELATIONSHIP RECOVERY HOLD%'::text, false) AS owner_only
           FROM buyers b
             LEFT JOIN dd_channel_execution_front_doors_v1 fd ON fd.channel_code = b.channel_code AND fd.front_door_code = b.front_door_code
        ), counts AS (
         SELECT n.id,
            n.company_name,
            n.contact_name,
            n.email,
            n.phone,
            n.channel_code,
            n.front_door_code,
            n.pain_point,
            n.disposition,
            n.intent_tier,
            n.source_confidence,
            n.decision_maker_confirmed,
            n.campaign_status,
            n.contact_pressure_state,
            n.next_permitted_contact_at,
            n.suggested_sku,
            n.next_action,
            n.last_contacted_at,
            n.do_not_contact,
            n.owner_route,
            n.front_door_name,
            n.customer_promise,
            n.front_door_verified,
            n.explicit_need,
            n.contact_route,
            n.owner_only,
            COALESCE(( SELECT count(*)::integer AS count
                   FROM dd_channel_execution_component_inventory_v1 i
                  WHERE i.channel_code = n.channel_code AND i.front_door_code = n.front_door_code), 0) AS live_component_count,
            COALESCE(( SELECT count(*)::integer AS count
                   FROM dd_channel_execution_component_inventory_v1 i
                  WHERE i.channel_code = n.channel_code AND i.front_door_code = n.front_door_code AND i.owner_home_executable), 0) AS owner_home_component_count,
            COALESCE(( SELECT count(*)::integer AS count
                   FROM dd_channel_execution_component_inventory_v1 i
                  WHERE i.channel_code = n.channel_code AND i.front_door_code = n.front_door_code AND NOT i.owner_home_executable), 0) AS provider_field_component_count,
            r.release_state AS suggested_offer_state
           FROM normalized n
             LEFT JOIN dd_service_release_contract_v1 r ON r.canonical_sku = n.suggested_sku
        )
 SELECT id,
    company_name,
    contact_name,
    email,
    phone,
    channel_code,
    front_door_code,
    pain_point,
    disposition,
    intent_tier,
    source_confidence,
    decision_maker_confirmed,
    campaign_status,
    contact_pressure_state,
    next_permitted_contact_at,
    suggested_sku,
    next_action,
    last_contacted_at,
    do_not_contact,
    owner_route,
    front_door_name,
    customer_promise,
    front_door_verified,
    explicit_need,
    contact_route,
    owner_only,
    live_component_count,
    owner_home_component_count,
    provider_field_component_count,
    suggested_offer_state,
        CASE
            WHEN owner_only THEN 'OWNER_ONLY_ROUTE'::text
            WHEN NOT explicit_need THEN 'QUALIFY_NEED'::text
            WHEN suggested_sku IS NOT NULL AND suggested_offer_state = 'LIVE_READY'::text THEN 'ADVANCE_MATCHED_OFFER'::text
            WHEN NOT front_door_verified THEN 'MAP_FRONT_DOOR_FROM_EXISTING_EVIDENCE'::text
            WHEN live_component_count > 0 THEN 'COMPOSE_EXECUTION_PLAN_FROM_LIVE_COMPONENTS'::text
            ELSE 'REPAIR_SELLABILITY_OR_AUTHORIZATION'::text
        END AS next_execution_state,
        CASE
            WHEN owner_only THEN 'Owner-controlled reply only; do not automate.'::text
            WHEN NOT explicit_need THEN 'Ask one bounded discovery question; do not infer purchase intent.'::text
            WHEN suggested_sku IS NOT NULL AND suggested_offer_state = 'LIVE_READY'::text THEN 'Use the existing governed service match; quote only after scope/price authority is satisfied.'::text
            WHEN NOT front_door_verified THEN 'Map the buyer to an existing CH03/CH04 front door using recorded evidence before selecting services.'::text
            WHEN live_component_count > 0 THEN 'Select only components supported by the stated need; keep each service price authoritative and do not invent bundle pricing.'::text
            ELSE 'Hold commercial action until eligible component services are LIVE_READY.'::text
        END AS next_exact_action
   FROM counts;

REVOKE ALL ON public.dd_owner_home_sales_queue_v1, public.dd_ch03_ch04_buyer_queue_v1 FROM anon;
GRANT SELECT ON public.dd_ch03_ch04_buyer_queue_v1 TO authenticated,service_role;
