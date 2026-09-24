-- Cass / Accounting Agent authority and compliance boundaries.
-- Owner approved in chat on 2026-09-24.

update public.dd_execution_authority_map
set approve_authority='["accounting_role","owner"]'::jsonb,
    updated_at=now()
where stage_key='accounting_reconciliation'
  and is_active=true;

insert into public.dd_agent_runtime_policy
(policy_key,agent_key,stage_key,risk_tier,max_agent_turns,max_tool_calls,max_retries,max_elapsed_seconds,token_budget,cost_budget_usd,fallback_mode,require_human_approval,breaker_destination,is_active)
values
('accounting_agent_reconciliation_cass_v1','accounting_agent','accounting_reconciliation','CRITICAL',6,12,1,240,24000,1.25,'PAUSE_AND_ESCALATE',true,'dd_accounting_exception_queue',true),
('accounting_agent_exceptions_cass_v1','accounting_agent','accounting_exceptions','CRITICAL',5,10,1,180,20000,1.00,'PAUSE_AND_ESCALATE',true,'dd_accounting_exception_queue',true),
('accounting_agent_ap_cass_v1','accounting_agent','accounts_payable','CRITICAL',5,10,1,180,20000,1.00,'PAUSE_AND_ESCALATE',true,'dd_accounting_exception_queue',true)
on conflict (policy_key) do update set
agent_key=excluded.agent_key,stage_key=excluded.stage_key,risk_tier=excluded.risk_tier,
max_agent_turns=excluded.max_agent_turns,max_tool_calls=excluded.max_tool_calls,max_retries=excluded.max_retries,
max_elapsed_seconds=excluded.max_elapsed_seconds,token_budget=excluded.token_budget,cost_budget_usd=excluded.cost_budget_usd,
fallback_mode=excluded.fallback_mode,require_human_approval=excluded.require_human_approval,
breaker_destination=excluded.breaker_destination,is_active=true,updated_at=now();

insert into public.dd_agent_policy_registry
(policy_key,version,agent_key,stage_key,policy_type,content_hash,policy_document,status,effective_at,created_by)
values
(
'cass_accounting_compliance_boundary',1,'accounting_agent','accounting_reconciliation','ACCOUNTING_COMPLIANCE',
md5('cass_accounting_compliance_boundary_v1'),
jsonb_build_object(
 'provider_id','669b63c2-0050-4f14-9505-70a34d77b416',
 'supervisor_role','accounting_role',
 'allowed_human_scope',jsonb_build_array(
   'record financial transactions and adjustments',
   'prepare trial balances',
   'internal verification and analysis of books and accounts',
   'prepare unaudited financial statements schedules and reports',
   'design bookkeeping systems and internal controls',
   'AP/AR administration',
   'bookkeeping setup and monthly reconciliation',
   'cash-flow and budget analysis',
   'funding-readiness evidence and schedules'
 ),
 'prohibited_without_separate_credential_or_owner_gate',jsonb_build_array(
   'represent Cass or DANI as CPA or licensed public accountant',
   'audit review attest assurance or certify financial statements',
   'substantive compensated federal tax-return preparation without valid PTIN',
   'IRS representation beyond credentialed or otherwise authorized rights',
   'approve debt spending capital use pricing write-offs or disputed obligations',
   'silently classify ambiguous transactions',
   'fabricate balances transactions evidence or reconciliations'
 ),
 'agent_role','prepare reconcile flag and route; never substitute for human approval where required',
 'contractor_control_boundary','govern deliverables deadlines security access and acceptance criteria; do not prescribe unnecessary detailed methods sequence or training',
 'authorities',jsonb_build_array(
   'Georgia O.C.G.A. 43-3-32',
   'Georgia State Board of Accountancy Rules',
   'IRS PTIN requirements 2026',
   'IRS Publication 15-A 2026'
 ),
 'owner_approval','2026-09-24'
),
'ACTIVE',now(),'owner_approved_chat'
)
on conflict (policy_key,version) do update set
policy_document=excluded.policy_document,content_hash=excluded.content_hash,status='ACTIVE',effective_at=now(),created_by='owner_approved_chat';

update public.dd_revenue_agent_registry
set responsibility='Orchestrate and reconcile DANI accounting work from authoritative operational and financial events. Read governed source registers before re-deriving historical revenue/spend. Prepare, reconcile, flag and route work to Cass governed accounting lanes; Cass/accounting-role or owner approval is required where authority maps or runtime policy require it. Never perform credential-gated attest/audit work or unauthorized substantive tax-return preparation.',
    allowed_actions='["reconcile_sources","prepare_bookkeeping","route_cass_lane","prepare_reporting","prepare_budget","prepare_funding_readiness","raise_accounting_exception","prepare_ap_ar","prepare_unaudited_schedules"]'::jsonb,
    prohibited_actions='["invent_transaction","silently_classify_ambiguous_item","change_customer_price","change_operational_job_state","override_owner_capital_decision","approve_spending","approve_debt","approve_writeoff","certify_financial_statement","perform_audit_attest_assurance","substantive_tax_return_preparation_without_credential_gate","represent_user_before_irs_without_authority"]'::jsonb,
    updated_at=now()
where agent_key='accounting_agent';
