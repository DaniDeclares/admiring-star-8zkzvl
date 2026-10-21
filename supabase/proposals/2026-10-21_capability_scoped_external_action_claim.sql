-- DRAFT ONLY. NOT a migration. Do not run against Production.
-- Requires separate confirmation of installed legacy claim signature/grants,
-- secured Supabase Auth machine identity, and coordinated cutover.
-- A service-role credential held by the same worker bypasses this identity boundary.

CREATE OR REPLACE FUNCTION public.dd_claim_external_actions_scoped(
  p_lane text,
  p_limit integer DEFAULT 5
)
RETURNS SETOF public.dd_external_action_outbox
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $function$
DECLARE
  v_identity uuid;
  v_capability text;
  v_enabled boolean;
BEGIN
  -- Identity must come from an Auth-verified JWT, NOT p_worker_key or p_actions.
  IF coalesce(auth.jwt()->>'role', '') <> 'authenticated' THEN
    RAISE EXCEPTION 'DEDICATED_WORKER_AUTH_REQUIRED' USING ERRCODE='42501';
  END IF;
  v_identity := auth.uid();
  IF v_identity IS NULL THEN
    RAISE EXCEPTION 'DEDICATED_WORKER_AUTH_REQUIRED' USING ERRCODE='42501';
  END IF;

  -- Auth app_metadata is server-controlled; user_metadata is not trusted.
  -- No new authorization table or queue. Admin must provision a dedicated
  -- machine identity, not assign this capability to a human user.
  SELECT raw_app_meta_data->>'dani_machine_capability',
         coalesce((raw_app_meta_data->>'dani_machine_enabled')::boolean, false)
    INTO v_capability, v_enabled
  FROM auth.users WHERE id = v_identity;

  IF coalesce(v_capability, '') <> 'EXTERNAL_GITHUB_TESTER_EXECUTOR_V1'
     OR NOT coalesce(v_enabled, false) THEN
    RAISE EXCEPTION 'WORKER_CAPABILITY_DENIED' USING ERRCODE='42501';
  END IF;

  -- p_lane can only narrow the server-assigned capability; it never grants it.
  IF p_lane NOT IN ('GITHUB','TESTER') OR p_lane IS NULL THEN
    RAISE EXCEPTION 'UNSUPPORTED_EXECUTION_LANE' USING ERRCODE='22023';
  END IF;

  RETURN QUERY
  WITH candidates AS (
    SELECT a.id
    FROM public.dd_external_action_outbox AS a
    WHERE (
      (a.status IN ('PENDING','RETRY_WAIT') AND a.next_attempt_at <= now())
       OR (a.status = 'CLAIMED' AND a.lease_expires_at < now())
    )
      AND (
        (p_lane='TESTER' AND a.destination_system='DANI_TESTER_SUPABASE'
          AND a.action_type IN (
            'RECONCILE_TESTER_PROMOTION_FEEDBACK',
            'INGEST_DANI_PRODUCTION_BRIDGE_LEARNING'))
        OR
        (p_lane='GITHUB' AND a.destination_system='GITHUB'
          AND a.action_type='EXECUTE_APPROVED_GITHUB_WORK')
      )
    ORDER BY a.sequence_no
    FOR UPDATE SKIP LOCKED
    LIMIT greatest(1, least(coalesce(p_limit,5),5))
  )
  UPDATE public.dd_external_action_outbox AS o
    SET status='CLAIMED',
        claimed_at=now(),
        claimed_by='auth-worker:' || v_identity::text,
        lease_expires_at=now()+interval '5 minutes',
        updated_at=now()
  FROM candidates AS c WHERE o.id=c.id
  RETURNING o.*;
END;
$function$;

REVOKE ALL ON FUNCTION public.dd_claim_external_actions_scoped(text,integer)
  FROM PUBLIC, anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.dd_claim_external_actions_scoped(text,integer)
  TO authenticated;

-- IMPORTANT DEFERRED CUTOVER, deliberately NOT included as executable SQL:
-- 1. Replace/revoke legacy dd_claim_external_actions(text,integer) after all
--    callers and installed grants are verified and transitioned.
-- 2. Remove Production service-role secret from action claimant identity.
-- 3. Verify direct table writes cannot bypass the capability/lease rules.
-- 4. Do not enable until dedicated Auth credential issuance/refresh works.
