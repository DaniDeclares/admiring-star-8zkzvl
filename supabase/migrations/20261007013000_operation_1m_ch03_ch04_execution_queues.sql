
-- Operation $1M: strengthen owner-home routing and add CH03/CH04 execution queues without inventing buyer intent or bundle prices.

CREATE OR REPLACE VIEW public.dd_owner_home_sales_queue_v1
WITH (security_invoker=true)
AS
WITH oh AS (
  SELECT sku FROM public.dd_owner_home_live_sellable_v1
), base AS (
  SELECT
    s.id,
    s.company_name,
    s.contact_name,
    s.sales_metadata ->> 'channel_code' AS channel_code,
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
    (
      upper(coalesce(s.source_direction,''))='INBOUND'
      OR s.disposition IN ('DECISION_MAKER_REACHED','EXISTING_VENDOR_REVISIT','QUOTE_REQUESTED','READY_TO_BUY')
      OR coalesce(s.amount_collected,0)>0
      OR upper(coalesce(s.campaign_status,''))='RESPONDED'
    ) AS warm,
    (
      s.pain_point IS NOT NULL
      OR s.intent_tier IN ('HIGH','TRANSACTION')
      OR s.disposition IN ('QUOTE_REQUESTED','READY_TO_BUY')
    ) AS explicit_need,
    coalesce(r.release_state='LIVE_READY',false) AS live_offer,
    (
      (s.email IS NOT NULL OR s.phone IS NOT NULL)
      AND upper(coalesce(s.campaign_status,''))<>'BOUNCED'
    )
    OR coalesce(s.sales_metadata #>> '{owner_home_queue_20261007,route}','') ILIKE 'LINKEDIN%'
      AS contact_route,
    coalesce(s.suggested_sku IN (SELECT sku FROM oh),false) AS home_fulfillable,
    (
      s.disposition IN ('QUOTE_REQUESTED','READY_TO_BUY')
      OR coalesce(s.quoted_amount,0)>0
    ) AS payment_path,
    (
      coalesce(s.sales_metadata->>'routine_outreach_suppressed','false')='true'
      OR s.next_action ILIKE '%RELATIONSHIP RECOVERY HOLD%'
      OR s.next_action ILIKE '%owner-sent%'
      OR coalesce(s.sales_metadata #>> '{owner_home_queue_20261007,route}','') ILIKE '%OWNER_ONLY%'
    ) AS owner_only
  FROM public.dd_sales_queue s
  LEFT JOIN public.dd_service_release_contract_v1 r
    ON r.canonical_sku=s.suggested_sku
  WHERE coalesce(s.do_not_contact,false)=false
    AND s.disposition NOT IN ('NOT_INTERESTED','CLOSED_LOST')
    AND coalesce(s.sales_metadata #>> '{channel_tag_20261006,status}','')
        NOT IN ('PARTNER_NOT_BUYER','TEST_RECORD')
), scored AS (
  SELECT b.*,
    (CASE WHEN b.warm THEN 32 ELSE 0 END
     + CASE WHEN b.explicit_need THEN 16 ELSE 0 END
     + CASE WHEN b.live_offer THEN 8 ELSE 0 END
     + CASE WHEN b.contact_route THEN 4 ELSE 0 END
     + CASE WHEN b.home_fulfillable THEN 2 ELSE 0 END
     + CASE WHEN b.payment_path THEN 1 ELSE 0 END) AS rank_score,
    row_number() OVER (
      PARTITION BY lower(coalesce(nullif(b.company_name,''),b.contact_name,b.id::text))
      ORDER BY b.warm DESC,b.explicit_need DESC,b.live_offer DESC,b.contact_route DESC
    ) AS company_slot
  FROM base b
)
SELECT
  id,company_name,contact_name,channel_code,disposition,campaign_status,suggested_sku,
  offer_state,intent_tier,amount_collected,quoted_amount,next_action,last_contacted_at,
  next_permitted_contact_at,contact_pressure_state,warm,explicit_need,live_offer,
  contact_route,home_fulfillable,payment_path,owner_only,rank_score,company_slot,
  CASE
    WHEN disposition='PAYMENT_SUCCEEDED'
      AND next_action ILIKE 'Post-job follow-up sent%'
      THEN 'Await repeat/referral response; no additional payment or immediate outreach'
    WHEN disposition='PAYMENT_SUCCEEDED'
      THEN 'Close out fulfillment + QA, then ask for repeat/referral (owner)'
    WHEN owner_only
      THEN 'OWNER ONLY: use the verified owner-controlled route; no automated outreach'
    WHEN suggested_sku IS NULL
      THEN 'Match to an existing LIVE_READY offer from stated need before any outreach'
    WHEN NOT live_offer
      THEN 'Offer held: repair release gate before quoting'
    WHEN NOT contact_route
      THEN 'Find verified route (no guessed emails)'
    WHEN payment_path
      THEN 'Advance governed quote/payment path only from explicit buyer scope'
    ELSE 'Prepare governed outreach via danideclaresns@gmail.com (respect cadence and authority)'
  END AS next_exact_action
FROM scored
WHERE company_slot=1
ORDER BY rank_score DESC,last_contacted_at NULLS FIRST;

CREATE OR REPLACE VIEW public.dd_channel_execution_component_inventory_v1
WITH (security_invoker=true)
AS
SELECT
  fd.channel_code,
  fd.channel_name,
  fd.front_door_code,
  fd.front_door_name,
  fd.audience,
  fd.customer_promise,
  fd.execution_outcomes,
  d.slug AS division_slug,
  d.name AS division_name,
  s.sku AS canonical_sku,
  s.name AS service_name,
  s.pricing_type,
  s.starting_price,
  m.channel_eligibility,
  m.independent_purchase,
  m.multi_division_composable,
  m.multi_service_work_order,
  coalesce(oh.home_executable,false) AS owner_home_executable,
  coalesce(oh.provider_optional,false) AS provider_optional,
  oh.owner_fulfillment_mode,
  r.release_state,
  r.payment_ledger_ok,
  r.runtime_accuracy_ok
FROM public.dd_channel_execution_front_doors_v1 fd
CROSS JOIN LATERAL jsonb_array_elements_text(fd.contributing_divisions) cd(division_slug)
JOIN public.divisions d
  ON d.slug=cd.division_slug
 AND d.is_active=true
JOIN public.services s
  ON s.division_id=d.id
 AND s.is_active=true
JOIN public.dd_service_release_contract_v1 r
  ON r.canonical_sku=s.sku
 AND r.release_state='LIVE_READY'
JOIN public.dd_master_service_capability_channel_matrix m
  ON m.sku=s.sku
 AND m.channel_code=fd.channel_code
 AND m.channel_eligibility IN ('ACTIVE','ELIGIBLE','QUOTE_REQUIRED')
LEFT JOIN public.dd_owner_home_service_priority oh
  ON oh.canonical_sku=s.sku
WHERE fd.channel_code IN ('CH03','CH04');

COMMENT ON VIEW public.dd_channel_execution_component_inventory_v1 IS
'Governed inventory of LIVE_READY component services eligible to contribute to CH03/CH04 front doors. This is not a bundle, quote, buyer-intent assertion, or authorization to contact. Prices remain service-level authority.';

CREATE OR REPLACE VIEW public.dd_ch03_ch04_buyer_queue_v1
WITH (security_invoker=true)
AS
WITH buyers AS (
  SELECT
    s.id,
    s.company_name,
    s.contact_name,
    s.email,
    s.phone,
    s.sales_metadata->>'channel_code' AS channel_code,
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
    coalesce(s.do_not_contact,false) AS do_not_contact,
    coalesce(s.sales_metadata #>> '{owner_home_queue_20261007,route}','') AS owner_route
  FROM public.dd_sales_queue s
  WHERE coalesce(s.do_not_contact,false)=false
    AND coalesce(s.sales_metadata->>'channel_code','') IN ('CH03','CH04')
    AND s.disposition NOT IN ('NOT_INTERESTED','CLOSED_LOST')
    AND coalesce(s.sales_metadata #>> '{channel_tag_20261006,status}','')
        NOT IN ('PARTNER_NOT_BUYER','TEST_RECORD')
), normalized AS (
  SELECT
    b.*,
    fd.front_door_name,
    fd.customer_promise,
    (fd.front_door_code IS NOT NULL) AS front_door_verified,
    (
      b.pain_point IS NOT NULL
      OR b.intent_tier IN ('HIGH','TRANSACTION')
      OR b.disposition IN ('QUOTE_REQUESTED','READY_TO_BUY')
    ) AS explicit_need,
    (
      (b.email IS NOT NULL OR b.phone IS NOT NULL)
      AND upper(coalesce(b.campaign_status,''))<>'BOUNCED'
    ) OR b.owner_route ILIKE 'LINKEDIN%' AS contact_route,
    (
      b.owner_route ILIKE '%OWNER_ONLY%'
      OR b.next_action ILIKE '%owner-sent%'
      OR b.next_action ILIKE '%RELATIONSHIP RECOVERY HOLD%'
    ) AS owner_only
  FROM buyers b
  LEFT JOIN public.dd_channel_execution_front_doors_v1 fd
    ON fd.channel_code=b.channel_code
   AND fd.front_door_code=b.front_door_code
), counts AS (
  SELECT
    n.*,
    coalesce((
      SELECT count(*)::int
      FROM public.dd_channel_execution_component_inventory_v1 i
      WHERE i.channel_code=n.channel_code
        AND i.front_door_code=n.front_door_code
    ),0) AS live_component_count,
    coalesce((
      SELECT count(*)::int
      FROM public.dd_channel_execution_component_inventory_v1 i
      WHERE i.channel_code=n.channel_code
        AND i.front_door_code=n.front_door_code
        AND i.owner_home_executable
    ),0) AS owner_home_component_count,
    coalesce((
      SELECT count(*)::int
      FROM public.dd_channel_execution_component_inventory_v1 i
      WHERE i.channel_code=n.channel_code
        AND i.front_door_code=n.front_door_code
        AND NOT i.owner_home_executable
    ),0) AS provider_field_component_count,
    r.release_state AS suggested_offer_state
  FROM normalized n
  LEFT JOIN public.dd_service_release_contract_v1 r
    ON r.canonical_sku=n.suggested_sku
)
SELECT
  *,
  CASE
    WHEN owner_only
      THEN 'OWNER_ONLY_ROUTE'
    WHEN NOT explicit_need
      THEN 'QUALIFY_NEED'
    WHEN NOT front_door_verified
      THEN 'MAP_FRONT_DOOR_FROM_EXISTING_EVIDENCE'
    WHEN suggested_sku IS NOT NULL AND suggested_offer_state='LIVE_READY'
      THEN 'ADVANCE_MATCHED_OFFER'
    WHEN live_component_count>0
      THEN 'COMPOSE_EXECUTION_PLAN_FROM_LIVE_COMPONENTS'
    ELSE 'REPAIR_SELLABILITY_OR_AUTHORIZATION'
  END AS next_execution_state,
  CASE
    WHEN owner_only
      THEN 'Owner-controlled reply only; do not automate.'
    WHEN NOT explicit_need
      THEN 'Ask one bounded discovery question; do not infer purchase intent.'
    WHEN NOT front_door_verified
      THEN 'Map the buyer to an existing CH03/CH04 front door using recorded evidence before selecting services.'
    WHEN suggested_sku IS NOT NULL AND suggested_offer_state='LIVE_READY'
      THEN 'Use the existing governed service match; quote only after scope/price authority is satisfied.'
    WHEN live_component_count>0
      THEN 'Select only components supported by the stated need; keep each service price authoritative and do not invent bundle pricing.'
    ELSE 'Hold commercial action until eligible component services are LIVE_READY.'
  END AS next_exact_action
FROM counts;

REVOKE ALL ON public.dd_channel_execution_component_inventory_v1, public.dd_ch03_ch04_buyer_queue_v1 FROM anon;
GRANT SELECT ON public.dd_channel_execution_component_inventory_v1, public.dd_ch03_ch04_buyer_queue_v1 TO authenticated, service_role;
