
insert into public.dd_research_programs(program_key,program_name,domain,objective,status,release_blocked,green_rule,metadata)
values(
 'FAMILY_BUSINESS_BUDGET_INTELLIGENCE',
 'Family + DANI Budget, Runway & Financial Operating Intelligence',
 'HOUSEHOLD_BUSINESS_FINANCIAL_PLANNING',
 'Recover and reconcile the full historical household/family and DANI budget record, distinguish historical/superseded assumptions from current verified obligations, reconcile business books and cash-flow evidence, and produce a linked-but-separate household and business financial operating model that supports housing stability, owner compensation, business solvency, reserves, taxes, growth and documented income.',
 'RESEARCHING',true,
 'GREEN requires dated provenance, conflict/supersession handling, current-source verification, linked-but-separate household/business models, reconciled accounting evidence, owner-compensation capacity, cash-flow/runway proof and explicit owner approval before money movement, debt, spending commitments, payroll/classification, pricing or other protected financial actions.',
 jsonb_build_object(
  'focus_order',2,
  'focus_condition','BECOME_TOTAL_FOCUS_AFTER_MONDAY_READINESS_IS_PROVEN_COMPLETE_AND_FUNCTIONING',
  'priority_mode','NEXT_AFTER_MONDAY_READINESS',
  'research_mode','continuous',
  'historical_recovery','ALL_AVAILABLE_CHAT_THREADS_AND_CONNECTED_EVIDENCE',
  'accounting_agent_required',true,
  'do_not_treat_old_numbers_as_current',true,
  'linked_but_separate_models',jsonb_build_array('HOUSEHOLD_FAMILY','DANI_DECLARES_LLC'),
  'protected_actions',jsonb_build_array('MONEY_MOVEMENT','DEBT','SPENDING_COMMITMENT','PAYROLL_CLASSIFICATION','PRICING_AUTHORITY'),
  'historical_budget_signals',jsonb_build_object(
    'housing_deadline','2026-12-18',
    'rent_monthly_historical',1260,
    'december_target_current_historical',8500,
    'december_target_superseded_historical',10000,
    'household_weekly_model_historical',1100,
    'personal_minimum_weekly_historical',831.60,
    'personal_planning_need_weekly_historical',897.01,
    'household_scenarios_monthly_historical',jsonb_build_array(5500,6500,7500),
    'child_support_monthly_historical',400,
    'snap_monthly_historical',1200,
    'phone_monthly_historical',240,
    'vehicle_monthly_historical_range',jsonb_build_array(1050,1300),
    'credit_balance_reserve_historical',813,
    'dani_weekly_collected_floor_current_plan',3000,
    'dani_weekly_collected_stretch_current_plan',4000,
    'tax_reserve_historical_range_pct',jsonb_build_array(25,30),
    'provider_labor_target_max_pct',40
  ),
  'accounting_snapshot_2026_09_26',jsonb_build_object(
    'qbo_connected',true,
    'qbo_ytd_income',105.67,
    'qbo_ytd_expenses',0,
    'qbo_total_assets',105.67,
    'qbo_cash_end_period',50.53,
    'interpretation','INCOMPLETE_BOOKS_DO_NOT_OVERRIDE_HISTORICAL_EVIDENCE'
  )
 )
)
on conflict(program_key) do update set
 objective=excluded.objective,status='RESEARCHING',release_blocked=true,green_rule=excluded.green_rule,
 metadata=public.dd_research_programs.metadata||excluded.metadata,updated_at=now();

insert into public.dd_research_work_queue(program_key,work_key,question,required_evidence,priority,status,next_action,owner_decision_required,metadata)
values
('FAMILY_BUSINESS_BUDGET_INTELLIGENCE','FBB_HISTORY_RECOVERY',
 'What budget, cash-flow, revenue-target, owner-compensation, household-support, housing, transportation, debt/credit, tax/reserve, savings/capital and business-allocation plans have been discussed historically, and which versions superseded or conflict with others?',
 'Dated chat-history recovery + connected files/email/accounting evidence; preserve provenance and historical status rather than silently reconciling.',
 'P0','RESEARCHING','Build a dated financial assumption/evidence ledger with CURRENT_VERIFIED, HISTORICAL, SUPERSEDED, CONFLICTING and UNKNOWN_CURRENT_STATUS classifications.',false,
 jsonb_build_object('focus_order',2,'implementation_action_class','DATABASE_REFRESH','no_old_number_as_current',true)),
('FAMILY_BUSINESS_BUDGET_INTELLIGENCE','FBB_HOUSEHOLD_CURRENT',
 'What is the current verified household/family cash requirement through and after the 2026-12-18 housing transition?',
 'Current obligations and due dates for housing, utilities/phone, food/household, transportation, childcare/family support, legal/admin obligations, debt/credit, insurance, emergency reserve and other essential needs; distinguish noncash benefits from cash.',
 'P0','RESEARCHING','Reverify each historical household assumption before using it in a current budget; produce weekly/monthly/runway views.',false,
 jsonb_build_object('focus_order',2,'implementation_action_class','ACCOUNTING_REVIEW','protected_personal_finance',true)),
('FAMILY_BUSINESS_BUDGET_INTELLIGENCE','FBB_BUSINESS_RECONCILIATION',
 'What is DANI DECLARES LLC actual current financial position after reconciling QBO, PayPal, bank/processor evidence, receipts, invoices, provider payouts, software, supplies, travel, insurance and historically commingled transactions?',
 'QuickBooks + PayPal + available bank/processor statements + receipts/contracts/invoices + transaction classification; internal transfers excluded from revenue.',
 'P0','RESEARCHING','Reconcile incomplete QBO against source evidence; classify personal/business/transfers; do not infer zero expenses from incomplete books.',false,
 jsonb_build_object('focus_order',2,'implementation_action_class','ACCOUNTING_REVIEW','qbo_snapshot_incomplete',true,'cass_review',true)),
('FAMILY_BUSINESS_BUDGET_INTELLIGENCE','FBB_OWNER_COMPENSATION',
 'What owner compensation/distribution capacity can DANI sustainably support while preserving fulfillment, provider compensation, fees, operating expenses, insurance/software, tax reserve, working capital and growth?',
 'Reconciled DANI contribution/cash flow + entity/tax treatment + current household cash requirement; owner compensation separate from service labor economics.',
 'P0','RESEARCHING','Model capacity by collected-revenue and contribution-margin scenarios; preserve single-member LLC treatment unless current legal/tax facts change.',false,
 jsonb_build_object('focus_order',2,'implementation_action_class','ACCOUNTING_REVIEW','owner_approval_required',true)),
('FAMILY_BUSINESS_BUDGET_INTELLIGENCE','FBB_DEC18_RUNWAY',
 'What weekly collected revenue, contribution, owner compensation and reserve path is required to reach the verified December 18 housing/security objective without starving business operations?',
 'Current household target + reconciled business costs + current sales pipeline/collections + tax/working-capital requirements + documented-income requirements.',
 'P0','RESEARCHING','Reconcile the historical $10,000 target, later $8,500 target and other weekly models against current facts; create downside/base/upside runway without treating historical targets as current truth.',false,
 jsonb_build_object('focus_order',2,'implementation_action_class','FINANCIAL_MODEL','historical_targets',jsonb_build_array(10000,8500))),
('FAMILY_BUSINESS_BUDGET_INTELLIGENCE','FBB_BUSINESS_BUDGET',
 'What annual/monthly/weekly operating budget should DANI use by channel/service family with COGS, provider labor, materials, travel, processor fees, software, insurance, compliance, taxes, working capital, capital expenditure and owner compensation separated?',
 'Reconciled actuals + governed pricing/economics + provider payout evidence + service/channel mix + recurring obligations + current capital plan.',
 'P0','RESEARCHING','Build budget and variance architecture; compare historical allocation models against actual contribution economics rather than locking arbitrary percentages.',false,
 jsonb_build_object('focus_order',2,'implementation_action_class','FINANCIAL_MODEL','cass_review',true)),
('FAMILY_BUSINESS_BUDGET_INTELLIGENCE','FBB_CAPITAL_RESERVES',
 'What reserve and capital buckets are required for taxes, emergency/working capital, equipment, vehicle/mobility, inventory/merch, staffing/providers, certifications/compliance, technology and future property expansion?',
 'Current obligations + volatility + business plan + funding restrictions + accounting treatment; separate operating cash, reserves and restricted/external funding.',
 'P1','RESEARCHING','Create prioritized reserve/capital schedule after core solvency/runway is reconciled.',false,
 jsonb_build_object('focus_order',2,'implementation_action_class','FINANCIAL_MODEL','cass_review',true)),
('FAMILY_BUSINESS_BUDGET_INTELLIGENCE','FBB_ACCOUNTING_DASHBOARD',
 'What must Cass/accounting and Owner HQ show so household requirement, owner-compensation capacity, business runway, AR/AP, cash, taxes/reserves, upcoming obligations and budget variance are visible without commingling personal and company books?',
 'Current dashboard/schema + accounting authority + privacy boundaries + reconciled source data + action/approval contracts.',
 'P0','RESEARCHING','Design linked but separate owner/accounting views; personal planning inputs may inform owner-compensation need but must not become company expenses without valid business classification.',false,
 jsonb_build_object('focus_order',2,'implementation_action_class','CODE_BUILD','cass_review',true,'privacy_boundary_required',true)),
('FAMILY_BUSINESS_BUDGET_INTELLIGENCE','FBB_TRICKLE_DOWN',
 'Does financial research actually cascade into accounting reconciliation tasks, budget models, dashboard requirements, revenue targets and governed implementation without automatically moving money or changing protected financial authority?',
 'Research→synthesis→accounting review→financial model→software build/dashboard→proof trace with receipts and blocked states.',
 'P0','RESEARCHING','Audit the financial handoffs and create missing safe workers/nodes; protected actions remain owner-gated.',false,
 jsonb_build_object('focus_order',2,'implementation_action_class','OBSERVABILITY','auto_money_movement',false))
on conflict(work_key) do update set
 question=excluded.question,required_evidence=excluded.required_evidence,priority=excluded.priority,status='RESEARCHING',
 next_action=excluded.next_action,metadata=public.dd_research_work_queue.metadata||excluded.metadata,updated_at=now();

do $$
begin
 perform public.dd_run_research_pipeline_controller();
 perform public.dd_run_research_synthesis_worker();
 perform public.dd_route_research_implementation();
 perform public.dd_run_company_controller();
exception when others then
 raise notice 'Budget research seeded; immediate cascade deferred: %',sqlerrm;
end $$;
