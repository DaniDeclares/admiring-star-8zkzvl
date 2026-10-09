-- Read-only commercial readiness diagnostic; no price, release state or buyer plan is mutated.
-- Tiered margin thresholds remain governed by existing authority, never guessed here.
create or replace view public.dd_commercial_readiness_diagnostic_v1 with (security_invoker = true) as
select u.canonical_sku,
       u.division,
       u.service_family,
       u.service_name,
       u.underwriting_status,
       u.customer_price_present,
       u.internal_cost_present,
       u.provider_payout_present,
       u.margin_economics_present,
       u.scope_present,
       u.exclusions_present,
       u.compliance_present,
       coalesce(e.economics_ready,false) as economics_authority_ready,
       e.economics_reason,
       coalesce(r.release_state,'NO_RELEASE_CONTRACT') as existing_release_state,
       r.blocking_gate as existing_blocking_gate,
       case
         when coalesce(u.customer_price_present,false)=false then 'MISSING_STANDARD_PRICE'
         when coalesce(u.scope_present,false)=false then 'MISSING_SCOPE'
         when coalesce(u.exclusions_present,false)=false then 'MISSING_EXCLUSIONS'
         when coalesce(u.compliance_present,false)=false then 'COMPLIANCE_EVIDENCE_REQUIRED'
         when coalesce(u.internal_cost_present,false)=false then 'COST_MODEL_REQUIRED'
         when coalesce(u.provider_payout_present,false)=false then 'PAYOUT_MODEL_REQUIRED'
         when coalesce(u.margin_economics_present,false)=false then 'FAMILY_MARGIN_PROOF_REQUIRED'
         when coalesce(e.economics_ready,false)=false then 'EXISTING_ECONOMICS_GATE'
         when r.canonical_sku is null then 'NO_RELEASE_CONTRACT'
         when r.release_state <> 'LIVE_READY' then 'EXISTING_RELEASE_GATE'
         else 'EXISTING_GATES_READY'
       end as diagnostic_next_gate,
       (coalesce(e.economics_ready,false) and r.release_state='LIVE_READY'
        and coalesce(u.internal_cost_present,false)
        and coalesce(u.provider_payout_present,false)
        and coalesce(u.margin_economics_present,false)
        and coalesce(u.scope_present,false)
        and coalesce(u.exclusions_present,false)
        and coalesce(u.compliance_present,false)) as diagnostic_ready,
       'OBSERVATION_ONLY_NO_PRICE_OR_RELEASE_AUTHORITY'::text as authority_mode
from public.dd_service_underwriting_audit u
left join public.dd_service_economics_authority_v1 e on e.canonical_sku=u.canonical_sku
left join public.dd_service_release_contract_v1 r on r.canonical_sku=u.canonical_sku;
comment on view public.dd_commercial_readiness_diagnostic_v1 is
 'Observability only. Existing release and pricing authorities remain canonical. No family margin thresholds inferred; missing proof never auto-approves.';

-- Internal diagnostic only; do not grant public Data API access.
revoke all on public.dd_commercial_readiness_diagnostic_v1 from public, anon, authenticated;
grant select on public.dd_commercial_readiness_diagnostic_v1 to service_role;
