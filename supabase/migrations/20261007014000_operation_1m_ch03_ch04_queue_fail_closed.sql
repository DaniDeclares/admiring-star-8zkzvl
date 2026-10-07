
-- Operation $1M: make CH03/CH04 buyer execution-state booleans fail closed instead of treating NULL as evidence.

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
    coalesce(fd.front_door_code IS NOT NULL,false) AS front_door_verified,
    coalesce(
      b.pain_point IS NOT NULL
      OR b.intent_tier IN ('HIGH','TRANSACTION')
      OR b.disposition IN ('QUOTE_REQUESTED','READY_TO_BUY'),
      false
    ) AS explicit_need,
    coalesce(
      (
        (b.email IS NOT NULL OR b.phone IS NOT NULL)
        AND upper(coalesce(b.campaign_status,''))<>'BOUNCED'
      ) OR b.owner_route ILIKE 'LINKEDIN%',
      false
    ) AS contact_route,
    coalesce(
      b.owner_route ILIKE '%OWNER_ONLY%'
      OR b.next_action ILIKE '%owner-sent%'
      OR b.next_action ILIKE '%RELATIONSHIP RECOVERY HOLD%',
      false
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
    WHEN suggested_sku IS NOT NULL AND suggested_offer_state='LIVE_READY'
      THEN 'ADVANCE_MATCHED_OFFER'
    WHEN NOT front_door_verified
      THEN 'MAP_FRONT_DOOR_FROM_EXISTING_EVIDENCE'
    WHEN live_component_count>0
      THEN 'COMPOSE_EXECUTION_PLAN_FROM_LIVE_COMPONENTS'
    ELSE 'REPAIR_SELLABILITY_OR_AUTHORIZATION'
  END AS next_execution_state,
  CASE
    WHEN owner_only
      THEN 'Owner-controlled reply only; do not automate.'
    WHEN NOT explicit_need
      THEN 'Ask one bounded discovery question; do not infer purchase intent.'
    WHEN suggested_sku IS NOT NULL AND suggested_offer_state='LIVE_READY'
      THEN 'Use the existing governed service match; quote only after scope/price authority is satisfied.'
    WHEN NOT front_door_verified
      THEN 'Map the buyer to an existing CH03/CH04 front door using recorded evidence before selecting services.'
    WHEN live_component_count>0
      THEN 'Select only components supported by the stated need; keep each service price authoritative and do not invent bundle pricing.'
    ELSE 'Hold commercial action until eligible component services are LIVE_READY.'
  END AS next_exact_action
FROM counts;

REVOKE ALL ON public.dd_ch03_ch04_buyer_queue_v1 FROM anon;
GRANT SELECT ON public.dd_ch03_ch04_buyer_queue_v1 TO authenticated, service_role;
