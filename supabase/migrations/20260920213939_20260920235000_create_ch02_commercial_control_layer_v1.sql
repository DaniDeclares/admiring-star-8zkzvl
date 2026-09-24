
begin;
create table if not exists public.dd_ch02_commercial_triggers (
 id uuid primary key default gen_random_uuid(), channel_code text not null default 'CH02',
 trigger_code text not null unique, trigger_name text not null, pain_statement text not null,
 buyer_roles jsonb not null default '[]'::jsonb, entry_front_door text not null,
 recommended_entry_model text not null, discovery_question text not null, expansion_signal text,
 source_basis text not null, basis_type text not null check (basis_type in ('RESEARCH','DECISION','IMPLEMENTATION')),
 status text not null default 'LOCKED' check (status in ('LOCKED','DRAFT','RETIRED')), sort_order integer not null default 0,
 created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists public.dd_ch02_buyer_authority_map (
 id uuid primary key default gen_random_uuid(), channel_code text not null default 'CH02',
 buyer_role_code text not null unique, buyer_role_name text not null, pain_owned jsonb not null default '[]'::jsonb,
 typical_entry_offers jsonb not null default '[]'::jsonb, authorization_scope text not null,
 regional_corporate_handoff text not null, procurement_handoff text not null, sales_question text not null,
 source_basis text not null, basis_type text not null check (basis_type in ('RESEARCH','DECISION','IMPLEMENTATION')),
 status text not null default 'LOCKED' check (status in ('LOCKED','DRAFT','RETIRED')),
 created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists public.dd_ch02_offer_crosswalk (
 id uuid primary key default gen_random_uuid(), channel_code text not null default 'CH02',
 adjudication_id uuid not null unique references public.dd_ch02_service_adjudication(id) on delete cascade,
 offer_code text not null, offer_name text not null, front_door_code text not null,
 buying_modes jsonb not null default '[]'::jsonb, default_entry_model text not null,
 expansion_models jsonb not null default '[]'::jsonb, contract_artifact_code text not null,
 sales_question text not null, next_step text not null, source_basis text not null,
 basis_type text not null check (basis_type in ('RESEARCH','DECISION','IMPLEMENTATION')),
 status text not null default 'LOCKED' check (status in ('LOCKED','DRAFT','RETIRED')),
 created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists public.dd_ch02_sla_matrix (
 id uuid primary key default gen_random_uuid(), channel_code text not null default 'CH02',
 sla_code text not null unique, sla_name text not null, engagement_model_codes jsonb not null default '[]'::jsonb,
 coverage_hours text not null, response_target text not null, completion_target text,
 evidence_deadline text not null, rework_rule text not null, escalation_rule text not null,
 capacity_condition text not null, emergency_premium_rule text, source_basis text not null,
 basis_type text not null check (basis_type in ('RESEARCH','DECISION','IMPLEMENTATION')),
 status text not null default 'LOCKED' check (status in ('LOCKED','DRAFT','RETIRED')),
 created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists public.dd_ch02_evidence_standards (
 id uuid primary key default gen_random_uuid(), channel_code text not null default 'CH02',
 evidence_code text not null unique, evidence_name text not null, applies_to_front_doors jsonb not null default '[]'::jsonb,
 required_artifacts jsonb not null default '[]'::jsonb, acceptance_rules jsonb not null default '[]'::jsonb,
 rejection_rules jsonb not null default '[]'::jsonb, closeout_recipient text not null, retention_rule text not null,
 source_basis text not null, basis_type text not null check (basis_type in ('RESEARCH','DECISION','IMPLEMENTATION')),
 status text not null default 'LOCKED', created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists public.dd_ch02_scope_compliance_matrix (
 id uuid primary key default gen_random_uuid(), channel_code text not null default 'CH02',
 scope_code text not null unique, work_class text not null, jurisdiction text not null default 'GA_SC',
 self_perform_status text not null, coordination_status text not null, licensed_provider_required boolean not null default false,
 credential_requirement text, insurance_requirement text, authorization_threshold text, site_access_requirement text,
 special_trigger text, prohibited_without_structure text, source_basis text not null,
 basis_type text not null check (basis_type in ('RESEARCH','DECISION','IMPLEMENTATION')),
 status text not null default 'LOCKED', created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists public.dd_ch02_procurement_requirements (
 id uuid primary key default gen_random_uuid(), channel_code text not null default 'CH02',
 procurement_code text not null unique, stage_order integer not null, stage_name text not null,
 required_inputs jsonb not null default '[]'::jsonb, approval_owner text not null,
 payment_requirements jsonb not null default '[]'::jsonb, vendor_requirements jsonb not null default '[]'::jsonb,
 handoff_rule text not null, source_basis text not null,
 basis_type text not null check (basis_type in ('RESEARCH','DECISION','IMPLEMENTATION')),
 status text not null default 'LOCKED', created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists public.dd_ch02_geography_route_rules (
 id uuid primary key default gen_random_uuid(), channel_code text not null default 'CH02',
 geography_code text not null unique, territory_name text not null, priority_level text not null,
 route_density_rule text not null, dispatch_radius_rule text not null, multi_unit_efficiency_rule text not null,
 portfolio_expansion_rule text not null, travel_pricing_rule text not null, source_basis text not null,
 basis_type text not null check (basis_type in ('RESEARCH','DECISION','IMPLEMENTATION')),
 status text not null default 'LOCKED', created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create index if not exists idx_ch02_offer_crosswalk_front_door on public.dd_ch02_offer_crosswalk(front_door_code);
create index if not exists idx_ch02_offer_crosswalk_offer_code on public.dd_ch02_offer_crosswalk(offer_code);
create index if not exists idx_ch02_triggers_front_door on public.dd_ch02_commercial_triggers(entry_front_door);
create index if not exists idx_ch02_buyer_role on public.dd_ch02_buyer_authority_map(buyer_role_code);
alter table public.dd_ch02_commercial_triggers enable row level security;
alter table public.dd_ch02_buyer_authority_map enable row level security;
alter table public.dd_ch02_offer_crosswalk enable row level security;
alter table public.dd_ch02_sla_matrix enable row level security;
alter table public.dd_ch02_evidence_standards enable row level security;
alter table public.dd_ch02_scope_compliance_matrix enable row level security;
alter table public.dd_ch02_procurement_requirements enable row level security;
alter table public.dd_ch02_geography_route_rules enable row level security;
revoke all on public.dd_ch02_commercial_triggers,public.dd_ch02_buyer_authority_map,public.dd_ch02_offer_crosswalk,public.dd_ch02_sla_matrix,public.dd_ch02_evidence_standards,public.dd_ch02_scope_compliance_matrix,public.dd_ch02_procurement_requirements,public.dd_ch02_geography_route_rules from anon,authenticated;
grant select,insert,update,delete on public.dd_ch02_commercial_triggers,public.dd_ch02_buyer_authority_map,public.dd_ch02_offer_crosswalk,public.dd_ch02_sla_matrix,public.dd_ch02_evidence_standards,public.dd_ch02_scope_compliance_matrix,public.dd_ch02_procurement_requirements,public.dd_ch02_geography_route_rules to service_role;

insert into public.dd_ch02_commercial_triggers
(trigger_code,trigger_name,pain_statement,buyer_roles,entry_front_door,recommended_entry_model,discovery_question,expansion_signal,source_basis,basis_type,sort_order) values
('TURNOVER_SURGE','Move-out / turnover surge','Turns are killing us.','["PROPERTY_MANAGER","REGIONAL_MANAGER","MAINTENANCE_DIRECTOR"]','TURNOVER_MAKE_READY','ONE_TIME_SERVICE','Where are turns backing up right now?','Recurring monthly turnover volume','CH02 research: trigger map + outbound conversation 1','RESEARCH',10),
('FAILED_VENDOR','Failed vendor / no-show','We can’t get the small job handled because the vendor failed.','["PROPERTY_MANAGER","MAINTENANCE_DIRECTOR","REGIONAL_MANAGER"]','PROPERTY_RESCUE_FIELD_DISPATCH','ONE_TIME_SERVICE','What work is currently waiting because a vendor missed it?','Repeat rescue volume / preferred support need','CH02 research: trigger map + outbound conversation 2','RESEARCH',20),
('PAPERWORK_CHASE','Paperwork / photo / vendor chase','We’re constantly chasing paperwork, photos, and vendors.','["PROPERTY_MANAGER","REGIONAL_MANAGER","COMPLIANCE_SPECIALIST"]','PROPERTY_CONDITION_DOCUMENTATION','PILOT','What documentation or vendor follow-up is consuming the most office time?','Recurring documentation/admin workload','CH02 research: outbound conversation 3','RESEARCH',30),
('OFFICE_OVERLOAD','Office capacity overload','The office is drowning.','["PROPERTY_MANAGER","REGIONAL_MANAGER","CORPORATE_OPERATIONS"]','OFFICE_OPERATIONS_RESCUE','FRACTIONAL_SUPPORT','Which recurring administrative work is pulling your team away from property operations?','Recurring fractional workload','CH02 research: outbound conversation 4','RESEARCH',40),
('RELIABLE_PARTNER','Need a reliable outside operating partner','We need a reliable outside partner we can call without starting from zero every time.','["REGIONAL_MANAGER","REGIONAL_DIRECTOR","CORPORATE_OPERATIONS","ASSET_CAPITAL_PROJECTS"]','PROPERTY_RESCUE_FIELD_DISPATCH','RECURRING_PROGRAM','How often do these issues recur across your properties?','Priority support / retainer / portfolio agreement','CH02 research: expansion pain','RESEARCH',50),
('AUDIT_NOTICE','Audit / inspection readiness','We need the property ready for an audit or inspection.','["COMPLIANCE_SPECIALIST","REGIONAL_MANAGER","CORPORATE_OPERATIONS"]','PROPERTY_CONDITION_DOCUMENTATION','PILOT','What deadline and evidence package are required?','Recurring pre-audit readiness','CH02 research: trigger map','RESEARCH',60),
('ASSET_ACQUISITION','Acquisition / portfolio transition','We need property conditions, vendors, and documentation aligned during transition.','["INCOMING_TRANSITION_DIRECTOR","REGIONAL_ASSET_DIRECTOR","CAPITAL_PROJECTS"]','PROPERTY_CONDITION_DOCUMENTATION','PROJECT','What must be known, documented, or reconciled before transition?','Portfolio agreement','CH02 research: trigger map','RESEARCH',70),
('RESIDENT_MOVEIN_FAILURE','Resident move-in emergency','A resident arrived to a failed unit or urgent property condition.','["PROPERTY_MANAGER","MAINTENANCE_DIRECTOR"]','PROPERTY_RESCUE_FIELD_DISPATCH','ONE_TIME_SERVICE','What failed at the property and what must be restored first?','Priority support','CH02 research: trigger map','RESEARCH',80)
on conflict (trigger_code) do update set trigger_name=excluded.trigger_name,pain_statement=excluded.pain_statement,buyer_roles=excluded.buyer_roles,entry_front_door=excluded.entry_front_door,recommended_entry_model=excluded.recommended_entry_model,discovery_question=excluded.discovery_question,expansion_signal=excluded.expansion_signal,source_basis=excluded.source_basis,basis_type=excluded.basis_type,sort_order=excluded.sort_order,updated_at=now();

insert into public.dd_ch02_buyer_authority_map
(buyer_role_code,buyer_role_name,pain_owned,typical_entry_offers,authorization_scope,regional_corporate_handoff,procurement_handoff,sales_question,source_basis,basis_type) values
('PROPERTY_MANAGER','Property Manager','["turnover","maintenance","vendor coordination","documentation"]','["TURNOVER_MAKE_READY","PROPERTY_RESCUE_FIELD_DISPATCH","PROPERTY_CONDITION_DOCUMENTATION"]','Property/community operational needs within delegated spend and vendor policy.','Escalate portfolio, regional, or spend-threshold decisions.','Initiates vendor setup/PO process when required.','What can you authorize at the property level, and what requires regional approval?','CH02 research: buyer roles + procurement mechanics gap','RESEARCH'),
('REGIONAL_MANAGER','Regional Manager / Director','["multi-property operations","vendor performance","recurring volume","escalations"]','["TURNOVER_MAKE_READY","PROPERTY_RESCUE_FIELD_DISPATCH","PROPERTY_CONDITION_DOCUMENTATION","OFFICE_OPERATIONS_RESCUE"]','Regional operational scope and recurring vendor relationships subject to company policy.','Corporate procurement/legal/finance may control MSA, insurance, and portfolio terms.','Moves approved relationship into regional/corporate procurement.','How many properties would use this if the first job works?','CH02 research: buyer roles + expansion model','RESEARCH'),
('MAINTENANCE_DIRECTOR','Maintenance Supervisor / Director','["maintenance backlog","failed vendors","emergency response","turn readiness"]','["PROPERTY_RESCUE_FIELD_DISPATCH","TURNOVER_MAKE_READY"]','Maintenance-related work within delegated authority and licensing rules.','Licensed trades, larger capital work, or portfolio terms may require higher approval.','Coordinates approved vendor onboarding and work authorization.','Which recurring work is hardest to keep covered with your current vendor network?','CH02 research: buyer roles + scope boundary','RESEARCH'),
('COMPLIANCE_SPECIALIST','Compliance / Quality Specialist','["inspection readiness","documentation","audit evidence","vendor compliance"]','["PROPERTY_CONDITION_DOCUMENTATION","OFFICE_OPERATIONS_RESCUE"]','Documentation/readiness requirements; may recommend but not independently authorize physical work.','Escalates spend and contractual commitments to operations/procurement.','Requires evidence and vendor compliance package before approved work.','What evidence has to be in the file for this to be considered complete?','CH02 research: buyer roles + evidence/vendor readiness','RESEARCH'),
('CORPORATE_OPERATIONS','Corporate Operations / Procurement','["vendor governance","portfolio consistency","administrative capacity","procurement"]','["OFFICE_OPERATIONS_RESCUE","PROPERTY_RESCUE_FIELD_DISPATCH","PORTFOLIO_AGREEMENT"]','Corporate commercial approval and procurement governance.','May require legal, finance, risk, or regional operating approval.','Owns or controls MSA/PO/vendor onboarding/payment requirements.','What vendor, insurance, PO, and payment requirements must a new operating partner satisfy?','CH02 research: procurement mechanics gap','RESEARCH'),
('ASSET_CAPITAL_PROJECTS','Asset / Capital Projects Leadership','["acquisition transition","portfolio condition","capital coordination"]','["PROPERTY_CONDITION_DOCUMENTATION","PORTFOLIO_AGREEMENT"]','Project/asset scope subject to capital authorization and procurement policy.','Coordinates with regional operations, procurement, and ownership.','Project-specific SOW/PO/MSA path as required.','What must be documented or reconciled before the asset moves into the next operating phase?','CH02 research: buyer roles','RESEARCH')
on conflict (buyer_role_code) do update set buyer_role_name=excluded.buyer_role_name,pain_owned=excluded.pain_owned,typical_entry_offers=excluded.typical_entry_offers,authorization_scope=excluded.authorization_scope,regional_corporate_handoff=excluded.regional_corporate_handoff,procurement_handoff=excluded.procurement_handoff,sales_question=excluded.sales_question,updated_at=now();

insert into public.dd_ch02_sla_matrix
(sla_code,sla_name,engagement_model_codes,coverage_hours,response_target,completion_target,evidence_deadline,rework_rule,escalation_rule,capacity_condition,emergency_premium_rule,source_basis,basis_type) values
('STANDARD','Standard Service','["ONE_TIME_SERVICE","PILOT","PACKAGE","RECURRING_PROGRAM"]','Business hours; scheduled service windows','Confirm intake and scope within one business day.','Scheduled according to approved scope and provider availability.','Evidence delivered with closeout or within one business day.','Defined rework for scope-conforming defects; exclusions documented.','Escalate blocked access, scope change, provider failure, or compliance issue before proceeding.','Provider capacity and geography must be confirmed before commitment.','Not applicable.','CH02 strategy + SLA architecture gap','DECISION'),
('PRIORITY','Priority Support','["PRIORITY_SUPPORT","RETAINER"]','Contract-defined priority coverage hours','Priority response target defined in SOW/retainer; no implied 24/7.','Contract-defined target based on eligible work and territory.','Evidence delivered by agreed closeout deadline.','Contract-defined rework and escalation.','Escalate when target is threatened or scope exceeds authority.','Reserved/priority capacity must be explicitly contracted.','After-hours/priority premium only when contract or approved quote states it.','CH02 strategy: emergency/priority feature + SLA gap','DECISION'),
('EMERGENCY','Emergency / After-Hours','["PRIORITY_SUPPORT","RETAINER"]','Only contract-defined coverage hours','Response target is defined per agreement and territory.','Best-effort or contract-defined completion depending on scope.','Evidence deadline defined before dispatch where practicable.','Safety, access, provider, and scope exclusions govern rework.','Immediate escalation for unsafe conditions, regulated work, access failure, or scope expansion.','Eligible work, territory, provider availability, and authority must all be satisfied.','After-hours/emergency premium applies only when explicitly approved.','CH02 strategy: emergency framework','DECISION'),
('FRACTIONAL','Fractional Front Office','["FRACTIONAL_SUPPORT"]','Contract-defined recurring office coverage','Work queue acknowledged within agreed operating window.','Recurring task cadence defined in SOW.','Administrative completion/evidence by agreed reporting cadence.','Correction within agreed service window.','Escalate decisions requiring client authority, resident relationship ownership, or regulated judgment.','Dedicated capacity must be contracted.','Not applicable unless separately contracted.','CH02 research + fractional front-office lane','DECISION')
on conflict (sla_code) do update set sla_name=excluded.sla_name,engagement_model_codes=excluded.engagement_model_codes,coverage_hours=excluded.coverage_hours,response_target=excluded.response_target,completion_target=excluded.completion_target,evidence_deadline=excluded.evidence_deadline,rework_rule=excluded.rework_rule,escalation_rule=excluded.escalation_rule,capacity_condition=excluded.capacity_condition,emergency_premium_rule=excluded.emergency_premium_rule,updated_at=now();

insert into public.dd_ch02_evidence_standards
(evidence_code,evidence_name,applies_to_front_doors,required_artifacts,acceptance_rules,rejection_rules,closeout_recipient,retention_rule,source_basis,basis_type) values
('FIELD_EXECUTION','Field execution closeout','["TURNOVER_MAKE_READY","PROPERTY_RESCUE_FIELD_DISPATCH"]','["before_after_photos","time_date_record","completion_checklist","access_key_record_when_applicable"]','["Scope completed","required evidence attached","exceptions documented"]','["Missing required evidence","unresolved scope item","unauthorized change"]','Client property/operations contact and DANI job record.','Retain according to governing contract and applicable record policy.','CH02 research: evidence/closeout standard','RESEARCH'),
('CONDITION_AUDIT','Condition / inspection package','["PROPERTY_CONDITION_DOCUMENTATION"]','["condition_checklist","photos","deficiency_matrix","time_date_record","site_access_record"]','["Every required inspection area addressed","deficiencies categorized","photos trace to location"]','["Untraceable photos","incomplete checklist","undocumented access limitation"]','Client operations/compliance contact.','Retain according to governing contract and applicable record policy.','CH02 research: property-condition evidence','RESEARCH'),
('TRASHOUT','Trash-out / abandonment closeout','["TURNOVER_MAKE_READY","PROPERTY_RESCUE_FIELD_DISPATCH"]','["before_after_photos","inventory_log_when_applicable","dump_ticket","time_date_record"]','["Removal scope completed","disposal evidence reconciled"]','["Missing disposal evidence","undocumented excluded property"]','Client property/operations contact.','Retain according to governing contract and applicable record policy.','CH02 research: evidence examples','RESEARCH'),
('VENDOR_ADMIN','Vendor/admin closeout','["OFFICE_OPERATIONS_RESCUE"]','["task_completion_log","document_reconciliation_log","vendor_status_record","exceptions_log"]','["Requested records reconciled","exceptions surfaced"]','["Missing source record","unresolved exception hidden","unauthorized client decision made"]','Client operations/procurement contact.','Retain according to governing contract and applicable record policy.','CH02 research: administrative evidence','RESEARCH'),
('FRACTIONAL_REPORT','Fractional support reporting','["OFFICE_OPERATIONS_RESCUE"]','["work_queue_report","completed_task_log","open_exception_log","handoff_log"]','["Recurring queue processed to agreed cadence","open decisions clearly handed back"]','["Decision made without authority","incomplete handoff","undocumented exception"]','Designated client operations owner.','Retain according to governing contract and applicable record policy.','CH02 research: fractional front-office boundary','RESEARCH')
on conflict (evidence_code) do update set evidence_name=excluded.evidence_name,applies_to_front_doors=excluded.applies_to_front_doors,required_artifacts=excluded.required_artifacts,acceptance_rules=excluded.acceptance_rules,rejection_rules=excluded.rejection_rules,closeout_recipient=excluded.closeout_recipient,retention_rule=excluded.retention_rule,updated_at=now();

insert into public.dd_ch02_scope_compliance_matrix
(scope_code,work_class,self_perform_status,coordination_status,licensed_provider_required,credential_requirement,insurance_requirement,authorization_threshold,site_access_requirement,special_trigger,prohibited_without_structure,source_basis,basis_type) values
('GENERAL_FIELD','General property field execution','ALLOWED_WHEN_GATED','ALLOWED',false,'Provider onboarding and task-specific capability validation.','Current required commercial insurance.','Client authorization per contract/SOW/work order.','Verified site/access/key protocol.','Jurisdiction and property-specific restrictions.','Regulated trade work outside approved credential/provider structure.','CH02 research: regulatory/scope matrix gap','DECISION'),
('REGULATED_TRADE','Licensed trade / specialty work','COORDINATE_ONLY','ALLOWED',true,'Applicable state/local license and provider credential verification.','Trade-specific insurance as required.','Client authorization plus applicable procurement requirements.','Site access and safety requirements.','License, code, specialty, or jurisdiction trigger.','Self-performance without required license/credential/structure.','CH02 research: regulatory/scope boundary','RESEARCH'),
('PRE_1978','Pre-1978 / lead-related trigger','DO_NOT_SELF_PERFORM_UNLESS_CLEARED','COORDINATE_WITH_QUALIFIED_PROVIDER',true,'Applicable RRP/lead-related qualification where required.','Specialty coverage as applicable.','Written scope and authorization before work.','Access and occupant/site controls.','Pre-1978 or lead-related trigger.','Lead-related regulated work without required structure.','CH02 research: regulatory/scope matrix gap','RESEARCH'),
('HAZARDOUS','Hazardous materials / unsafe conditions','DO_NOT_SELF_PERFORM','COORDINATE_SPECIALIST',true,'Qualified specialist/certification as applicable.','Specialty insurance as applicable.','Written authorization and specialist scope.','Safety/access controls.','Hazardous material or unsafe condition identified.','Handling/disposal without qualified structure.','CH02 research: regulatory/scope matrix gap','RESEARCH'),
('PROPERTY_AUTHORITY','Leasing / resident relationship authority','DO_NOT_PERFORM','NOT_APPLICABLE',false,'Not applicable.','Not applicable.','Client retains authority.','Client-controlled relationship.','Lease, resident complaint, showing, or resident verification function.','Selling property-management/leasing authority as fractional support.','CH02 research: internal/outsource boundary','RESEARCH')
on conflict (scope_code) do update set work_class=excluded.work_class,self_perform_status=excluded.self_perform_status,coordination_status=excluded.coordination_status,licensed_provider_required=excluded.licensed_provider_required,credential_requirement=excluded.credential_requirement,insurance_requirement=excluded.insurance_requirement,authorization_threshold=excluded.authorization_threshold,site_access_requirement=excluded.site_access_requirement,special_trigger=excluded.special_trigger,prohibited_without_structure=excluded.prohibited_without_structure,updated_at=now();

insert into public.dd_ch02_procurement_requirements
(procurement_code,stage_order,stage_name,required_inputs,approval_owner,payment_requirements,vendor_requirements,handoff_rule,source_basis,basis_type) values
('DISCOVERY',10,'Discovery','["property_or_portfolio_context","pain_trigger","buyer_role","scope_summary"]','Operating buyer / designated client contact','["billing_entity_unknown_until_confirmed"]','[]','Convert qualified pain into defined entry scope.','CH02 research: procurement mechanics gap','RESEARCH'),
('APPROVAL',20,'Commercial Approval','["scope","price_or_quote","sla","evidence_requirements","exceptions"]','Client-authorized buyer per spend policy','["payment_terms_to_be_confirmed"]','["vendor_onboarding_if_required"]','Do not treat verbal interest as a production authorization when client policy requires PO/SOW.','CH02 research: procurement mechanics gap','RESEARCH'),
('ONBOARDING',30,'Vendor Onboarding','["legal_business_name","w9","coi","required_vendor_forms"]','Client procurement/vendor management','["approved_payment_terms"]','["coi","w9","background_information_as_required","vendor_network_registration"]','Fulfillment cannot begin when required onboarding is incomplete unless the client explicitly authorizes an allowed exception.','CH02 research: vendor readiness','RESEARCH'),
('PO_SOW',40,'PO / SOW / Work Order','["approved_scope","authorized_price","service_window","site_access","client_reference"]','Authorized client approver','["po_or_equivalent_when_required"]','["provider_assignment_requirements"]','Create the governed work authorization before dispatch when required.','CH02 research: procurement behavior','RESEARCH'),
('PAYMENT',50,'Invoice / Payment','["invoice_requirements","client_reference","closeout_evidence"]','Client AP / finance','["payment_terms","invoice_submission_channel"]','[]','Invoice only after the commercial and evidence conditions for billing are satisfied.','CH02 research: procurement mechanics gap','RESEARCH'),
('RENEWAL',60,'Renewal / Expansion','["performance_evidence","volume","service_issues","pricing_review"]','Regional/corporate owner as applicable','["renewal_terms"]','["updated_compliance_documents_as_required"]','Use completed work and recurring volume to propose program, priority, retainer, or portfolio structure.','CH02 strategy: sales progression','DECISION')
on conflict (procurement_code) do update set stage_name=excluded.stage_name,required_inputs=excluded.required_inputs,approval_owner=excluded.approval_owner,payment_requirements=excluded.payment_requirements,vendor_requirements=excluded.vendor_requirements,handoff_rule=excluded.handoff_rule,updated_at=now();

insert into public.dd_ch02_geography_route_rules
(geography_code,territory_name,priority_level,route_density_rule,dispatch_radius_rule,multi_unit_efficiency_rule,portfolio_expansion_rule,travel_pricing_rule,source_basis,basis_type) values
('GA_METRO_ATLANTA','Metro Atlanta','PRIMARY','Prioritize dense property clusters and repeatable routes.','Use contracted/approved dispatch radius and current travel pricing rules.','Bundle same-site or nearby work when scope and authorization permit.','Expand from single property to community cluster to portfolio.','Apply existing DANI travel/dispatch pricing rules; do not invent CH02-specific mileage outside approved pricing authority.','CH02 ICP + geography/route economics gap','DECISION'),
('SC_UPSTATE','Greenville-Spartanburg','EXPANSION_1','Prioritize accounts with multiple nearby properties.','Use approved territory/radius and quote travel where required.','Prefer multi-unit or route density over isolated low-economics dispatches.','Expand from pilot property to regional cluster.','Use existing approved travel/dispatch pricing rules.','CH02 ICP + geography/route economics gap','DECISION'),
('SC_MIDLANDS','Columbia','EXPANSION_2','Prioritize repeatable portfolio routes.','Use approved territory/radius and quote travel where required.','Bundle work by property cluster where feasible.','Expand from pilot to regional relationship.','Use existing approved travel/dispatch pricing rules.','CH02 ICP + geography/route economics gap','DECISION'),
('SC_LOWCOUNTRY','Charleston','EXPANSION_3','Prioritize portfolio density and planned service windows.','Use approved territory/radius and quote travel where required.','Use scheduled route blocks when economics support them.','Expand only after route economics and provider capacity are validated.','Use existing approved travel/dispatch pricing rules.','CH02 ICP + geography/route economics gap','DECISION')
on conflict (geography_code) do update set territory_name=excluded.territory_name,priority_level=excluded.priority_level,route_density_rule=excluded.route_density_rule,dispatch_radius_rule=excluded.dispatch_radius_rule,multi_unit_efficiency_rule=excluded.multi_unit_efficiency_rule,portfolio_expansion_rule=excluded.portfolio_expansion_rule,travel_pricing_rule=excluded.travel_pricing_rule,updated_at=now();

insert into public.dd_ch02_offer_crosswalk
(adjudication_id,offer_code,offer_name,front_door_code,buying_modes,default_entry_model,expansion_models,contract_artifact_code,sales_question,next_step,source_basis,basis_type)
select c.adjudication_id,
case c.front_door_code when 'TURNOVER_MAKE_READY' then 'CH02-OFFER-01' when 'PROPERTY_RESCUE_FIELD_DISPATCH' then 'CH02-OFFER-02' when 'PROPERTY_CONDITION_DOCUMENTATION' then 'CH02-OFFER-03' when 'OFFICE_OPERATIONS_RESCUE' then 'CH02-OFFER-04' else 'CH02-OFFER-X' end,
case c.front_door_code when 'TURNOVER_MAKE_READY' then 'Turnover & Make-Ready' when 'PROPERTY_RESCUE_FIELD_DISPATCH' then 'Property Rescue & Field Dispatch' when 'PROPERTY_CONDITION_DOCUMENTATION' then 'Property Condition & Documentation' when 'OFFICE_OPERATIONS_RESCUE' then 'Office & Operations Rescue' else coalesce(c.front_door_code,'CH02 Cross-Channel') end,
c.front_door_code,
case c.front_door_code when 'TURNOVER_MAKE_READY' then '["ONE_TIME_SERVICE","PILOT","RECURRING_PROGRAM","PRIORITY_SUPPORT","RETAINER","PORTFOLIO_AGREEMENT"]'::jsonb when 'PROPERTY_RESCUE_FIELD_DISPATCH' then '["ONE_TIME_SERVICE","PILOT","RECURRING_PROGRAM","PRIORITY_SUPPORT","RETAINER","PORTFOLIO_AGREEMENT"]'::jsonb when 'PROPERTY_CONDITION_DOCUMENTATION' then '["ONE_TIME_SERVICE","PILOT","PROJECT","RECURRING_PROGRAM","FRACTIONAL_SUPPORT","PORTFOLIO_AGREEMENT"]'::jsonb when 'OFFICE_OPERATIONS_RESCUE' then '["PILOT","RECURRING_PROGRAM","FRACTIONAL_SUPPORT","RETAINER","PORTFOLIO_AGREEMENT"]'::jsonb else '["ONE_TIME_SERVICE","PILOT"]'::jsonb end,
case c.front_door_code when 'OFFICE_OPERATIONS_RESCUE' then 'PILOT' else 'ONE_TIME_SERVICE' end,
case c.front_door_code when 'OFFICE_OPERATIONS_RESCUE' then '["RECURRING_PROGRAM","FRACTIONAL_SUPPORT","RETAINER","PORTFOLIO_AGREEMENT"]'::jsonb else '["RECURRING_PROGRAM","PRIORITY_SUPPORT","RETAINER","PORTFOLIO_AGREEMENT"]'::jsonb end,
case c.front_door_code when 'OFFICE_OPERATIONS_RESCUE' then 'SOW' else 'WORK_ORDER' end,
case c.front_door_code when 'TURNOVER_MAKE_READY' then 'What is driving your current turn backlog?' when 'PROPERTY_RESCUE_FIELD_DISPATCH' then 'What property issue needs a reliable field response right now?' when 'PROPERTY_CONDITION_DOCUMENTATION' then 'What condition or documentation decision do you need supported?' when 'OFFICE_OPERATIONS_RESCUE' then 'Which recurring office workload is consuming your team’s capacity?' else 'What operational problem are you trying to solve?' end,
case c.front_door_code when 'OFFICE_OPERATIONS_RESCUE' then 'Define recurring workload and SOW.' else 'Confirm scope, authorization, pricing, and service window.' end,
'CH02 research crosswalk + locked CH02 engagement architecture v1','DECISION'
from public.dd_ch02_sellable_catalog c
where c.front_door_code in ('TURNOVER_MAKE_READY','PROPERTY_RESCUE_FIELD_DISPATCH','PROPERTY_CONDITION_DOCUMENTATION','OFFICE_OPERATIONS_RESCUE')
on conflict (adjudication_id) do update set offer_code=excluded.offer_code,offer_name=excluded.offer_name,front_door_code=excluded.front_door_code,buying_modes=excluded.buying_modes,default_entry_model=excluded.default_entry_model,expansion_models=excluded.expansion_models,contract_artifact_code=excluded.contract_artifact_code,sales_question=excluded.sales_question,next_step=excluded.next_step,updated_at=now();

create or replace view public.dd_ch02_commercial_control_layer as
select o.id as crosswalk_id,o.adjudication_id,o.offer_code,o.offer_name,o.front_door_code,o.buying_modes,o.default_entry_model,o.expansion_models,o.contract_artifact_code,o.sales_question,o.next_step,
c.sku,c.service_name,c.source_service_family,c.customer_facing_role,c.sellability_state,c.public_intake_eligible,c.public_action,c.quote_or_scope_required,c.pricing_type,c.base_price_cents,c.pricing_lock_status,c.pricing_status,c.compliance_review_required,c.pricing_adjudication_required,c.provider_capacity_review_required,c.fulfillment_gate_status,c.engagement_architecture_version
from public.dd_ch02_offer_crosswalk o join public.dd_ch02_sellable_catalog c on c.adjudication_id=o.adjudication_id;
revoke all on public.dd_ch02_commercial_control_layer from anon,authenticated;
grant select on public.dd_ch02_commercial_control_layer to service_role;
commit;
