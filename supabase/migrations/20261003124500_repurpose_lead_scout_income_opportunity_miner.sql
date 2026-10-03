-- Repurpose the existing DANI Lead Scout; do not create a parallel worker.
-- Owner decision 2026-10-03: mine income opportunities into four deterministic routes:
-- OWNER_PERSONAL, CODE_EXECUTABLE, PROVIDER_DISPATCH, REJECT.
-- This migration changes worker responsibility/authority only. It does not authorize
-- applications, bids, outreach, acceptance, pricing, payment collection, or job execution.

update public.dd_revenue_agent_registry
set
  agent_name = 'DANI Income Opportunity Scout',
  responsibility = 'Mine and verify paid opportunities, then classify each candidate for governed downstream handling. OWNER_PERSONAL means remote-only W-2 or non-dispatchable 1099 work Danielle can personally perform with primarily asynchronous written/system work, minimal phone/video meetings, no required driving/field travel, and enough schedule flexibility to handle owner availability constraints. CODE_EXECUTABLE means DANI systems/code/AI-assisted workflows can lawfully perform most or all of the contracted deliverable, with truthful representation, inspectable output, human QA where required, and a real DANI payment/collection path. PROVIDER_DISPATCH means the opportunity fits a governed DANI service/provider capability and can be routed through existing dispatch authority. REJECT means it fails fit, legality, authority, economics, evidence, or execution requirements. Verify public opportunity/company/contact facts with provenance; record evidence and recommended route only. Never infer that AI/code use, subcontracting, dispatch, an application, bid, acceptance, or collection is permitted when the source does not establish it.',
  allowed_actions = '["read_research_staging","discover_public_paid_opportunity","verify_public_opportunity","verify_public_company_identity","verify_public_business_contact","record_source_evidence","classify_owner_personal_candidate","classify_code_executable_candidate","classify_provider_dispatch_candidate","classify_reject_candidate","assess_async_remote_fit","assess_dispatchability","assess_automation_fit","assess_collection_path","submit_verified_research_facts"]'::jsonb,
  prohibited_actions = '["send_outreach","submit_application","submit_bid","accept_contract","accept_terms","infer_consent","infer_subcontracting_permission","infer_ai_permission","change_pricing","create_quote","collect_payment","move_money","change_job_state","authorize_provider","dispatch_provider","change_accounting","bypass_promotion_gate","store_unnecessary_personal_or_family_details"]'::jsonb,
  is_active = true,
  updated_at = now()
where agent_key = 'DANI_LEAD_SCOUT';

-- Fail closed if the worker being repurposed is absent. A missing existing worker is
-- an architecture/reconciliation problem, not permission to create a duplicate.
do $$
begin
  if not exists (
    select 1
    from public.dd_revenue_agent_registry
    where agent_key = 'DANI_LEAD_SCOUT'
      and agent_name = 'DANI Income Opportunity Scout'
      and is_active = true
  ) then
    raise exception 'DANI_LEAD_SCOUT_NOT_REPURPOSED';
  end if;
end $$;
