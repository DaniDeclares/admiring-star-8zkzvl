-- Disposable runner only; no business approval is inferred from synthetic data.
-- psql supplies the actual checked-out candidate SHA.
SELECT set_config('dd_proof.candidate_sha', :'candidate_sha', false);
SELECT set_config('dd_proof.baseline', (
 SELECT jsonb_build_object(
 'receipts',(SELECT count(*) FROM public.dd_audit_proof_receipts),
 'verifications',(SELECT count(*) FROM public.dd_service_release_verifications),
 'requests',(SELECT count(*) FROM public.service_requests),
 'estimates',(SELECT count(*) FROM public.dd_estimates),
 'payment_events',(SELECT count(*) FROM public.dd_payment_events),
 'provider_orgs',(SELECT count(*) FROM public.dd_provider_organizations),
 'providers',(SELECT count(*) FROM public.dd_providers),
 'offers',(SELECT count(*) FROM public.dd_estimate_assignment_offers),
 'economics',(SELECT count(*) FROM public.dd_estimate_economics_snapshots),
 'components',(SELECT count(*) FROM public.dd_estimate_component_snapshots),
 'evidence',(SELECT count(*) FROM public.dd_service_release_evidence_receipts)
 )::text),false);
BEGIN;
DO $proof$
DECLARE
 sku text;
 rid uuid;
 receipt public.dd_audit_proof_receipts%ROWTYPE;
 before_receipts bigint;
 after_receipts bigint;
 recurring jsonb;
 sha text := current_setting('dd_proof.candidate_sha');
BEGIN
 IF sha !~ '^[0-9a-f]{40}$' THEN RAISE EXCEPTION 'CANDIDATE_SHA_INVALID'; END IF;
 SELECT count(*) INTO before_receipts FROM public.dd_audit_proof_receipts;
 FOREACH sku IN ARRAY ARRAY['DNI-02A-003','DNI-02A-009'] LOOP
  SELECT public.dd_prove_demanded_sow_release_for_sku(sku,sha) INTO rid;
  IF rid IS NULL THEN RAISE EXCEPTION 'PROOF_RECEIPT_ID_MISSING:%',sku; END IF;
  SELECT * INTO receipt FROM public.dd_audit_proof_receipts WHERE id=rid;
  IF NOT FOUND THEN RAISE EXCEPTION 'PROOF_RECEIPT_MISSING:%',rid; END IF;
  IF receipt.status IS DISTINCT FROM 'PASS'
     OR receipt.assertions_failed IS DISTINCT FROM 0 THEN
    RAISE EXCEPTION 'CH02_PROOF_NOT_PASS:% receipt=%',sku,rid;
  END IF;
  IF NOT EXISTS(
    SELECT 1 FROM public.dd_service_release_verifications
     WHERE canonical_sku=sku AND payment_path_verified_at IS NOT NULL
       AND verification_commit_sha=sha
  ) THEN RAISE EXCEPTION 'MISSING_PAYMENT_VERIFICATION:%',sku; END IF;
 END LOOP;
 SELECT count(*) INTO after_receipts FROM public.dd_audit_proof_receipts;
 IF after_receipts IS DISTINCT FROM before_receipts+2 THEN
   RAISE EXCEPTION 'EXPECTED_TWO_RECEIPTS: before=% after=%',before_receipts,after_receipts;
 END IF;
 IF EXISTS(SELECT 1 FROM public.service_requests
           WHERE location_address='SYNTHETIC CH02 RELEASE PROOF') THEN
   RAISE EXCEPTION 'SYNTHETIC_REQUEST_NOT_ROLLED_BACK';
 END IF;
 SELECT public.dd_prove_recurring_payment_path('DNI-01G-001') INTO recurring;
 IF recurring IS NULL OR recurring->>'status' IS DISTINCT FROM 'PASS' THEN
   RAISE EXCEPTION 'RECURRING_PROOF_NOT_PASS:%',recurring::text;
 END IF;
 RAISE NOTICE 'PROOF_ASSERTIONS_PASS_BEFORE_ROLLBACK: CH02=2 RECURRING=1';
END $proof$;
ROLLBACK;
-- Independent same-session post-rollback baseline comparison.
DO $post$
DECLARE
 before_state jsonb := current_setting('dd_proof.baseline')::jsonb;
 after_state jsonb;
BEGIN
 SELECT jsonb_build_object(
 'receipts',(SELECT count(*) FROM public.dd_audit_proof_receipts),
 'verifications',(SELECT count(*) FROM public.dd_service_release_verifications),
 'requests',(SELECT count(*) FROM public.service_requests),
 'estimates',(SELECT count(*) FROM public.dd_estimates),
 'payment_events',(SELECT count(*) FROM public.dd_payment_events),
 'provider_orgs',(SELECT count(*) FROM public.dd_provider_organizations),
 'providers',(SELECT count(*) FROM public.dd_providers),
 'offers',(SELECT count(*) FROM public.dd_estimate_assignment_offers),
 'economics',(SELECT count(*) FROM public.dd_estimate_economics_snapshots),
 'components',(SELECT count(*) FROM public.dd_estimate_component_snapshots),
 'evidence',(SELECT count(*) FROM public.dd_service_release_evidence_receipts)
 ) INTO after_state;
 IF after_state IS DISTINCT FROM before_state THEN
   RAISE EXCEPTION 'OUTER_ROLLBACK_BASELINE_MISMATCH: before=% after=%',before_state,after_state;
 END IF;
 RAISE NOTICE 'POST_ROLLBACK_COUNTS_RESTORED: 11 tables';
END $post$;
