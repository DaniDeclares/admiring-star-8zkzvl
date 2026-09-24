-- Continuous legal/tax/entity research loop with accounting + Cass review routing.
-- Research is autonomous; consequential legal/tax/financial execution remains gated.

insert into public.dd_research_authority_policy(domain,auto_research,auto_reconcile_low_risk,owner_required_actions,stale_behavior,notes)
values
('ENTITY_ARCHITECTURE',true,false,array['ASSET_TRANSFER','RELATED_PARTY_CONTRACT','LAND_PURCHASE','DEBT','TAX_ELECTION','REGULATED_SALE'],'BLOCK_RELEASE','Continuous legal/tax/entity research; no autonomous consequential execution.'),
('PROTECTION_BENEFITS',true,false,array['REGULATED_SALE','LICENSE_APPLICATION','PAID_PLAN','EMPLOYEE_BENEFIT_ACTIVATION'],'BLOCK_RELEASE','Continuous insurance/legal-benefit/licensing research.'),
('ACCOUNTING_MONEY',true,false,array['MONEY_MOVEMENT','BOOKING_POLICY_CHANGE','TAX_FILING','DEBT','ASSET_TRANSFER'],'ESCALATE','Accounting consumes validated research impacts; no autonomous money movement or tax filing.')
on conflict (domain) do update set auto_research=excluded.auto_research,auto_reconcile_low_risk=excluded.auto_reconcile_low_risk,owner_required_actions=excluded.owner_required_actions,stale_behavior=excluded.stale_behavior,notes=excluded.notes,updated_at=now();

insert into public.dd_research_work_queue(program_key,work_key,question,required_evidence,priority,status,next_action,owner_decision_required,metadata)
values
('ENTITY_ARCHITECTURE','EA_GA_NONPROFIT_FORMATION','What formation, governance, charitable-registration and recurring Georgia compliance rules apply to Shadow & Sol?','Georgia SOS primary sources; governing statute/regulation where material','P0','QUEUED','Continuously reconcile current filing, governance, solicitation and renewal requirements.',false,'{"cadence":"DAILY","cass_review":true,"accounting_impact":true}'::jsonb),
('ENTITY_ARCHITECTURE','EA_FED_501C3_GOVERNANCE','What federal 501(c)(3) organizational, operational, private-benefit, excess-benefit, compensation and related-party rules constrain the architecture?','IRS primary sources and Treasury rules where material','P0','QUEUED','Maintain current legal map and flag conflicts or changes.',false,'{"cadence":"DAILY","cass_review":true,"accounting_impact":true}'::jsonb),
('ENTITY_ARCHITECTURE','EA_LAND_OWNERSHIP_USE','What lawful ownership/lease/license/shared-use structures can separate charitable, DANI commercial and family/private land use?','IRS + Georgia tax/property + county/local primary authority; attorney review before execution','P0','QUEUED','Compare structures; never promote a structure to execution without owner/legal review.',true,'{"cadence":"DAILY","cass_review":true,"accounting_impact":true}'::jsonb),
('ENTITY_ARCHITECTURE','EA_PROPERTY_TAX','What Georgia/local property-tax exemptions, limitations and mixed-use allocation rules may apply?','Georgia DOR + county assessor + statutes','P1','QUEUED','Research by candidate county as land search narrows.',false,'{"cadence":"WEEKLY","cass_review":true,"accounting_impact":true}'::jsonb),
('ENTITY_ARCHITECTURE','EA_SALES_USE_UBIT','What sales/use tax, unrelated business income, cost-allocation and intercompany accounting rules apply to planned activities?','IRS + Georgia DOR primary authority','P0','QUEUED','Map each planned revenue/cost lane to accounting treatment and unresolved tax questions.',false,'{"cadence":"DAILY","cass_review":true,"accounting_impact":true}'::jsonb),
('ENTITY_ARCHITECTURE','EA_GRANTS_RESTRICTED_FUNDS','What grant, restricted-fund, charitable asset and capital-project rules affect land/building acquisition?','Funder terms + IRS/government primary sources','P1','QUEUED','Separate restricted charitable capital from DANI/private capital.',false,'{"cadence":"WEEKLY","cass_review":true,"accounting_impact":true}'::jsonb),
('PROTECTION_BENEFITS','PB_GA_INS_AUTHORITY','What current individual, agency, appointment, CE and renewal requirements apply before DANI can earn insurance revenue?','Georgia OCI/Sircon/NIPR primary sources and carrier contracts','P0','QUEUED','Keep revenue blocked until every required authority is verified.',true,'{"cadence":"DAILY","cass_review":true,"accounting_impact":true}'::jsonb),
('PROTECTION_BENEFITS','PB_LEGALSHIELD_ECONOMICS','What current LegalShield associate, business-plan and employer-benefit terms are lawful and economically relevant to DANI/Shadow & Sol?','Current LegalShield contracts/official terms plus applicable regulator/tax authority','P1','QUEUED','Separate company expense, workforce benefit, charitable program and commission lanes.',true,'{"cadence":"WEEKLY","cass_review":true,"accounting_impact":true}'::jsonb)
on conflict (work_key) do update set question=excluded.question,required_evidence=excluded.required_evidence,priority=excluded.priority,next_action=excluded.next_action,metadata=excluded.metadata,updated_at=now();

create table if not exists public.dd_cass_finance_compliance_queue (
 id uuid primary key default gen_random_uuid(),
 source_domain text not null, source_key text not null, review_type text not null, title text not null,
 accounting_question text not null, legal_or_tax_dependency text, financial_statement_area text,
 entity_scope text not null, status text not null default 'OPEN' check(status in ('OPEN','IN_REVIEW','WAITING_EVIDENCE','OWNER_DECISION','RESOLVED','CLOSED')),
 priority text not null default 'P1' check(priority in ('P0','P1','P2','P3')),
 owner_decision_required boolean not null default false, evidence jsonb not null default '[]'::jsonb,
 recommended_accounting_treatment text, cass_notes text, resolved_at timestamptz,
 created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
 unique(source_domain,source_key,review_type)
);
alter table public.dd_cass_finance_compliance_queue enable row level security;
revoke all on public.dd_cass_finance_compliance_queue from anon, authenticated;

insert into public.dd_cass_finance_compliance_queue
(source_domain,source_key,review_type,title,accounting_question,legal_or_tax_dependency,financial_statement_area,entity_scope,priority,owner_decision_required)
values
('ENTITY_ARCHITECTURE','EA_LAND_OWNERSHIP_USE','STRUCTURE_REVIEW','Shadow & Sol / DANI / private land allocation','Separate acquisition basis, improvements, shared costs, rent/license payments and capital contributions by entity/use.','FMV, private-benefit/excess-benefit, property-tax and final ownership structure','Fixed assets / leases / intercompany','DANI + Shadow & Sol + private','P0',true),
('ENTITY_ARCHITECTURE','EA_SALES_USE_UBIT','TAX_ACCOUNTING','Nonprofit/commercial revenue and expense separation','Build a chart-of-accounts and allocation policy preventing charitable, DANI and private funds from commingling.','UBIT, Georgia sales/use tax, restricted funds, related-party rules','Revenue / expenses / due-to-due-from','DANI + Shadow & Sol','P0',false),
('ENTITY_ARCHITECTURE','EA_GRANTS_RESTRICTED_FUNDS','RESTRICTED_FUNDS','Grant and restricted capital tracking','Track restricted grants/donations for land/facilities separately from unrestricted and DANI/private capital.','Grant restrictions + charitable asset rules','Restricted net assets / fixed assets / grants','Shadow & Sol','P1',false),
('PROTECTION_BENEFITS','PB_GA_INS_AUTHORITY','REVENUE_RECOGNITION','Insurance licensing and commission accounting','Do not forecast/recognize insurance commission revenue until authority, appointment, payee and commission contract are verified.','Georgia licensing + carrier agreement','Commission revenue / licensing expense','DANI','P0',true),
('PROTECTION_BENEFITS','PB_LEGALSHIELD_ECONOMICS','BENEFIT_AND_REVENUE','LegalShield expense/benefit/commission separation','Separate DANI legal-plan expense, workforce benefit expense, possible associate commissions, and Shadow & Sol program expense.','Vendor agreements + worker classification + charitable-purpose rules','Operating expense / benefits / commission revenue / program expense','DANI + Shadow & Sol','P1',true)
on conflict (source_domain,source_key,review_type) do update set accounting_question=excluded.accounting_question,legal_or_tax_dependency=excluded.legal_or_tax_dependency,financial_statement_area=excluded.financial_statement_area,entity_scope=excluded.entity_scope,priority=excluded.priority,owner_decision_required=excluded.owner_decision_required,updated_at=now();

create or replace view public.dd_cass_portal_compliance_v1 with (security_invoker=true) as
select q.*,w.status research_status,w.blocker research_blocker,w.last_researched_at,w.metadata research_metadata
from public.dd_cass_finance_compliance_queue q left join public.dd_research_work_queue w on w.work_key=q.source_key
where q.status<>'CLOSED';

create or replace view public.dd_accounting_research_impacts_v1 with (security_invoker=true) as
select q.id,q.source_domain,q.source_key,q.title,q.accounting_question,q.legal_or_tax_dependency,q.financial_statement_area,q.entity_scope,q.status,q.priority,q.owner_decision_required,w.status research_status,w.blocker,w.next_action,w.last_researched_at
from public.dd_cass_finance_compliance_queue q left join public.dd_research_work_queue w on w.work_key=q.source_key
where q.status not in ('RESOLVED','CLOSED');

insert into public.dd_automation_recipes
(recipe_key,recipe_name,domain,trigger_type,execution_mode,risk_tier,is_active,condition_spec,action_spec,owner_attention_on_match,cooldown_minutes)
values
('entity_legal_research_watch','Entity Legal Research Watch','ENTITY_ARCHITECTURE','SCHEDULE','STAGE_INTERNAL','HIGH',true,
 '{"continuous":true,"due_source_scan":true,"program_keys":["ENTITY_ARCHITECTURE","PROTECTION_BENEFITS"],"prioritize_primary_authority":true}'::jsonb,
 '{"refresh_due_sources":true,"reconcile_evidence":true,"detect_conflicts":true,"route_financial_impacts_to":"dd_cass_finance_compliance_queue","route_owner_only_if":["owner_decision_required","authority_conflict","material_financial_change"],"no_external_action":true}'::jsonb,true,60),
('cass_compliance_review_sync','Cass Compliance Review Sync','ACCOUNTING_MONEY','SCHEDULE','STAGE_INTERNAL','MEDIUM',true,
 '{"source_view":"dd_accounting_research_impacts_v1","open_items_only":true}'::jsonb,
 '{"surface_in":"dd_cass_portal_compliance_v1","update_accounting_controller":true,"no_money_movement":true,"no_tax_filing":true}'::jsonb,false,60)
on conflict (recipe_key) do update set is_active=true,condition_spec=excluded.condition_spec,action_spec=excluded.action_spec,cooldown_minutes=excluded.cooldown_minutes,updated_at=now();
