-- Read-only assertions over current Tester records.
-- No fabricated buyer evidence, no status changes, no public release.
do $proof$
declare bad_count integer;
begin
 select count(*) into bad_count
 from public.dd_sales_queue s
 where public.dd_buyer_evidence_v2(s.id)->>'stated' is not null
   and public.dd_buyer_evidence_v2(s.id)->>'source_evidence_status'
       is distinct from 'EXACT_LINKED_INBOUND_REQUEST';
 if bad_count > 0 then
   raise exception 'Unverified buyer-stated evidence: %', bad_count;
 end if;

 select count(*) into bad_count
 from public.dd_commercial_readiness_diagnostic_v1
 where diagnostic_ready
   and (not coalesce(customer_price_present,false)
     or not coalesce(internal_cost_present,false)
     or not coalesce(provider_payout_present,false)
     or not coalesce(margin_economics_present,false)
     or not coalesce(scope_present,false)
     or not coalesce(exclusions_present,false)
     or not coalesce(economics_authority_ready,false)
     or existing_release_state is distinct from 'LIVE_READY');
 if bad_count > 0 then
   raise exception 'Readiness bypassed a required gate: %',bad_count;
 end if;
end
$proof$;