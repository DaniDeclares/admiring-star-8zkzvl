-- Reconcile source-controlled CH02 commercial engagement architecture with the already-live governed state.
-- Idempotent by design; this records the source migration in the authoritative migration ledger.
create table if not exists public.dd_ch02_engagement_models (
  id uuid primary key default gen_random_uuid(),
  channel_code text not null references public.dd_commercial_channels(code),
  model_code text not null,
  model_name text not null,
  model_class text not null,
  definition text not null,
  entry_role text,
  recurring boolean not null default false,
  reserved_capacity boolean not null default false,
  priority_benefits boolean not null default false,
  contract_required boolean not null default false,
  pricing_basis jsonb not null default '{}'::jsonb,
  allowed_features jsonb not null default '[]'::jsonb,
  operational_constraints jsonb not null default '[]'::jsonb,
  customer_facing_positioning text,
  status text not null default 'LOCKED',
  sort_order integer not null default 0,
  source_basis text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(channel_code, model_code),
  check (model_class in ('TRANSACTIONAL','PROGRAMMATIC','RELATIONSHIP','CAPACITY','PORTFOLIO')),
  check (status in ('DRAFT','LOCKED','RETIRED')),
  check (entry_role in ('ENTRY','CONVERSION','EXPANSION','SPECIALTY'))
);
create table if not exists public.dd_ch02_contract_artifact_types (
  id uuid primary key default gen_random_uuid(),
  channel_code text not null references public.dd_commercial_channels(code),
  artifact_code text not null,
  artifact_name text not null,
  artifact_class text not null,
  parent_artifact_code text,
  purpose text not null,
  required_for_model_codes jsonb not null default '[]'::jsonb,
  governs jsonb not null default '[]'::jsonb,
  status text not null default 'LOCKED',
  sort_order integer not null default 0,
  source_basis text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(channel_code, artifact_code),
  check (artifact_class in ('RELATIONSHIP','SCOPE','AUTHORIZATION')),
  check (status in ('DRAFT','LOCKED','RETIRED'))
);
create table if not exists public.dd_ch02_volume_commitment_rules (
  id uuid primary key default gen_random_uuid(),
  channel_code text not null references public.dd_commercial_channels(code),
  rule_code text not null,
  applies_to_model_codes jsonb not null default '[]'::jsonb,
  commitment_basis text not null,
  measurement_period text not null,
  minimum_commitment numeric,
  maximum_commitment numeric,
  adjustment_type text not null,
  adjustment_value numeric,
  adjustment_unit text,
  qualification_rule jsonb not null default '{}'::jsonb,
  pricing_control text not null,
  status text not null default 'LOCKED',
  source_basis text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(channel_code, rule_code),
  check (adjustment_type in ('PERCENT_DISCOUNT','FIXED_DISCOUNT','PRIORITY_ACCESS','CAPACITY_RESERVATION','QUOTE_ADJUSTMENT')),
  check (pricing_control in ('CANDIDATE_ONLY','QUOTE_GOVERNED','LOCKED_AFTER_APPROVAL')),
  check (status in ('DRAFT','LOCKED','RETIRED'))
);
alter table public.dd_channel_strategy_contracts add column if not exists engagement_architecture jsonb not null default '{}'::jsonb;
alter table public.dd_ch02_engagement_models enable row level security;
alter table public.dd_ch02_contract_artifact_types enable row level security;
alter table public.dd_ch02_volume_commitment_rules enable row level security;
drop policy if exists "dd_ch02_engagement_models_deny_public" on public.dd_ch02_engagement_models;
create policy "dd_ch02_engagement_models_deny_public" on public.dd_ch02_engagement_models for all to anon, authenticated using (false) with check (false);
drop policy if exists "dd_ch02_contract_artifact_types_deny_public" on public.dd_ch02_contract_artifact_types;
create policy "dd_ch02_contract_artifact_types_deny_public" on public.dd_ch02_contract_artifact_types for all to anon, authenticated using (false) with check (false);
drop policy if exists "dd_ch02_volume_commitment_rules_deny_public" on public.dd_ch02_volume_commitment_rules;
create policy "dd_ch02_volume_commitment_rules_deny_public" on public.dd_ch02_volume_commitment_rules for all to anon, authenticated using (false) with check (false);
insert into public.dd_ch02_engagement_models (channel_code,model_code,model_name,model_class,definition,entry_role,recurring,reserved_capacity,priority_benefits,contract_required,pricing_basis,allowed_features,operational_constraints,customer_facing_positioning,status,sort_order,source_basis) values
('CH02','ONE_TIME_SERVICE','One-Time Service','TRANSACTIONAL','One defined property-operations job performed to an agreed scope, followed by evidence and closeout.','ENTRY',false,false,false,false,'{"basis":["defined scope","validated quantity","governed service price","approved quote when required"]}','["defined job","evidence/closeout","change control when scope changes"]','["scope must be validated before fulfillment","regulated work remains subject to applicable gates"]','A defined property-operations service with clear scope and closeout.','LOCKED',10,'CH02 commercial architecture decision 2026-09-20'),
('CH02','PILOT','Pilot','PROGRAMMATIC','A time-bounded trial used to establish operating fit before an ongoing relationship is awarded.','CONVERSION',true,false,false,true,'{"basis":["defined pilot period","defined service quantities","approved pilot scope"]}','["turns","field runs","documentation visits","administrative-support hours"]','["pilot scope must define quantity and period","no implied renewal or unlimited response"]','A defined Property Operations Pilot with an agreed period and scope.','LOCKED',20,'CH02 commercial architecture decision 2026-09-20'),
('CH02','PACKAGE','Package','PROGRAMMATIC','A predefined combination of compatible services sold as one commercial offering.','ENTRY',false,false,false,false,'{"basis":["predefined service combination","validated scope","governed component pricing"]}','["bundled services","defined deliverables","standardized closeout"]','["components must remain individually governable","variable or regulated work may require separate scope"]','A coordinated package of property-operations services.','LOCKED',30,'CH02 commercial architecture decision 2026-09-20'),
('CH02','RECURRING_PROGRAM','Recurring Service Program','PROGRAMMATIC','A scheduled cadence of defined services delivered weekly, biweekly, monthly, per-turn, or per-property.','CONVERSION',true,false,false,true,'{"basis":["cadence","service scope","property/portfolio coverage","approved pricing terms"]}','["recurring field routes","recurring property-watch support","turnover programs","scheduled documentation"]','["cadence and coverage must be explicit","capacity is not unlimited unless separately contracted"]','A recurring property support program built around your operating cadence.','LOCKED',40,'CH02 commercial architecture decision 2026-09-20'),
('CH02','PRIORITY_SUPPORT','Preferred Property Support Program','RELATIONSHIP','An ongoing relationship model that provides defined priority and coordination benefits without implying unlimited emergency availability.','CONVERSION',true,false,true,true,'{"basis":["relationship commitment","defined service terms","volume or cadence where applicable"]}','["priority dispatch","preferred scheduling windows","pre-negotiated service terms","designated point of contact","portfolio coordination"]','["response targets must be defined","coverage hours, territory, eligible work, minimums and after-hours terms must be explicit"]','Preferred Property Support with defined priority, coordination, and service terms.','LOCKED',50,'CH02 commercial architecture decision 2026-09-20'),
('CH02','RETAINER','Property Operations Support Retainer','CAPACITY','A monthly commercial arrangement reserving agreed service capacity or scope for the customer.','CONVERSION',true,true,true,true,'{"basis":["monthly reserved capacity","included scope","overage/change-order rules"]}','["priority scheduling","included field blocks","documentation visits","administrative-support hours","turnover capacity","vendor coordination","monthly reporting"]','["reserved capacity must be measurable","unused capacity, rollover, overage and cancellation rules must be defined"]','Monthly Property Operations Support with reserved capacity and defined scope.','LOCKED',60,'CH02 commercial architecture decision 2026-09-20'),
('CH02','FRACTIONAL_SUPPORT','Fractional Front-Office Support','CAPACITY','Reserved administrative or field-support capacity delivered as hourly, block, recurring, or dedicated monthly support.','SPECIALTY',true,true,false,true,'{"basis":["hours or blocks","monthly capacity","portfolio allocation where applicable"]}','["10-hour blocks","20-hour recurring blocks","dedicated monthly administrative capacity","portfolio-distributed support"]','["capacity must be measurable","role boundaries and included work must be explicit","regulated professional services excluded unless separately authorized and qualified"]','Fractional front-office and property-operations support sized to the customer’s needs.','LOCKED',70,'CH02 commercial architecture decision 2026-09-20'),
('CH02','PORTFOLIO_AGREEMENT','Portfolio Agreement','PORTFOLIO','A portfolio-level commercial relationship spanning multiple properties or communities, under which property-level work can be authorized without recreating the relationship each time.','EXPANSION',true,true,true,true,'{"basis":["portfolio scope","property coverage","volume/cadence","contract terms"]}','["multiple properties","portfolio reporting","property-level work orders","volume commitments","programs and retainers"]','["individual properties remain identifiable","each work order must have authorized scope","portfolio agreement does not erase service-specific compliance gates"]','A portfolio-level service relationship for coordinated support across communities.','LOCKED',80,'CH02 commercial architecture decision 2026-09-20')
on conflict (channel_code,model_code) do update set model_name=excluded.model_name,model_class=excluded.model_class,definition=excluded.definition,entry_role=excluded.entry_role,recurring=excluded.recurring,reserved_capacity=excluded.reserved_capacity,priority_benefits=excluded.priority_benefits,contract_required=excluded.contract_required,pricing_basis=excluded.pricing_basis,allowed_features=excluded.allowed_features,operational_constraints=excluded.operational_constraints,customer_facing_positioning=excluded.customer_facing_positioning,status=excluded.status,sort_order=excluded.sort_order,source_basis=excluded.source_basis,updated_at=now();
insert into public.dd_ch02_contract_artifact_types (channel_code,artifact_code,artifact_name,artifact_class,parent_artifact_code,purpose,required_for_model_codes,governs,status,sort_order,source_basis) values
('CH02','MSA','Master Service Agreement','RELATIONSHIP',null,'Establishes the legal and commercial relationship, including insurance, payment, access, confidentiality, documentation, provider/subcontractor rules, compliance boundaries, termination, disputes, and general responsibilities.','["PILOT","RECURRING_PROGRAM","PRIORITY_SUPPORT","RETAINER","FRACTIONAL_SUPPORT","PORTFOLIO_AGREEMENT"]','["relationship rules","general commercial terms","general compliance boundaries","responsibilities"]','LOCKED',10,'CH02 commercial architecture decision 2026-09-20'),
('CH02','SOW','Statement of Work','SCOPE','MSA','Defines a specific authorized scope under the relationship: property, units or locations, quantity, schedule, price, materials, special requirements, evidence, and completion criteria.','["PILOT","RECURRING_PROGRAM","PRIORITY_SUPPORT","RETAINER","FRACTIONAL_SUPPORT","PORTFOLIO_AGREEMENT"]','["specific scope","deliverables","schedule","commercial terms","acceptance"]','LOCKED',20,'CH02 commercial architecture decision 2026-09-20'),
('CH02','WORK_ORDER','Work Order / Service Request','AUTHORIZATION','SOW','Authorizes a discrete execution unit beneath the governing agreement/SOW, including the property, service, quantity, timing, and fulfillment instructions.','["ONE_TIME_SERVICE","PILOT","PACKAGE","RECURRING_PROGRAM","PRIORITY_SUPPORT","RETAINER","FRACTIONAL_SUPPORT","PORTFOLIO_AGREEMENT"]','["execution authorization","dispatch scope","property-level work"]','LOCKED',30,'CH02 commercial architecture decision 2026-09-20'),
('CH02','PORTFOLIO_AGREEMENT','Portfolio Agreement','RELATIONSHIP',null,'Defines the portfolio-level relationship spanning multiple properties; individual work is authorized beneath it by SOWs and/or work orders.','["PORTFOLIO_AGREEMENT"]','["portfolio coverage","property list","volume/cadence","reporting","commercial relationship"]','LOCKED',5,'CH02 commercial architecture decision 2026-09-20')
on conflict (channel_code,artifact_code) do update set artifact_name=excluded.artifact_name,artifact_class=excluded.artifact_class,parent_artifact_code=excluded.parent_artifact_code,purpose=excluded.purpose,required_for_model_codes=excluded.required_for_model_codes,governs=excluded.governs,status=excluded.status,sort_order=excluded.sort_order,source_basis=excluded.source_basis,updated_at=now();
insert into public.dd_ch02_volume_commitment_rules (channel_code,rule_code,applies_to_model_codes,commitment_basis,measurement_period,minimum_commitment,maximum_commitment,adjustment_type,adjustment_value,adjustment_unit,qualification_rule,pricing_control,status,source_basis) values
('CH02','MONTHLY_TURN_VOLUME','["RECURRING_PROGRAM","PRIORITY_SUPPORT","RETAINER","PORTFOLIO_AGREEMENT"]','completed_turns_per_month','MONTHLY',null,null,'PERCENT_DISCOUNT',null,'PERCENT','{"qualifies_when":"documented recurring monthly unit volume is committed and operationally supportable","requires":"scope validation, provider capacity, margin review"}','QUOTE_GOVERNED','LOCKED','CH02 commercial architecture decision 2026-09-20'),
('CH02','PORTFOLIO_VOLUME','["RECURRING_PROGRAM","PRIORITY_SUPPORT","RETAINER","PORTFOLIO_AGREEMENT"]','properties_or_units_under_agreement','CONTRACT_TERM',null,null,'QUOTE_ADJUSTMENT',null,'COMMERCIAL_RULE','{"qualifies_when":"customer commits portfolio coverage or measurable unit/property volume","requires":"portfolio scope, geography, capacity and margin review"}','QUOTE_GOVERNED','LOCKED','CH02 commercial architecture decision 2026-09-20'),
('CH02','FIELD_ROUTE_COMMITMENT','["RECURRING_PROGRAM","PRIORITY_SUPPORT","RETAINER","PORTFOLIO_AGREEMENT"]','scheduled_field_runs','MONTHLY',null,null,'CAPACITY_RESERVATION',null,'ROUTE_BLOCK','{"qualifies_when":"recurring geographic field route is scheduled and supportable","requires":"route density, geography and provider capacity review"}','LOCKED_AFTER_APPROVAL','LOCKED','CH02 commercial architecture decision 2026-09-20'),
('CH02','FRACTIONAL_CAPACITY','["FRACTIONAL_SUPPORT","RETAINER","PORTFOLIO_AGREEMENT"]','reserved_support_hours_or_blocks','MONTHLY',null,null,'CAPACITY_RESERVATION',null,'HOURS_OR_BLOCKS','{"qualifies_when":"customer reserves a defined recurring support capacity","requires":"role scope, capacity, overage and cancellation rules"}','LOCKED_AFTER_APPROVAL','LOCKED','CH02 commercial architecture decision 2026-09-20')
on conflict (channel_code,rule_code) do update set applies_to_model_codes=excluded.applies_to_model_codes,commitment_basis=excluded.commitment_basis,measurement_period=excluded.measurement_period,minimum_commitment=excluded.minimum_commitment,maximum_commitment=excluded.maximum_commitment,adjustment_type=excluded.adjustment_type,adjustment_value=excluded.adjustment_value,adjustment_unit=excluded.adjustment_unit,qualification_rule=excluded.qualification_rule,pricing_control=excluded.pricing_control,status=excluded.status,source_basis=excluded.source_basis,updated_at=now();
update public.dd_channel_strategy_contracts set engagement_architecture='{"status":"LOCKED","version":"2026-09-20.v1","engagement_models":["ONE_TIME_SERVICE","PILOT","PACKAGE","RECURRING_PROGRAM","PRIORITY_SUPPORT","RETAINER","FRACTIONAL_SUPPORT","PORTFOLIO_AGREEMENT"],"contract_artifacts":[{"code":"MSA","role":"relationship_umbrella"},{"code":"SOW","role":"specific_scope_under_relationship"},{"code":"WORK_ORDER","role":"specific_execution_authorization"},{"code":"PORTFOLIO_AGREEMENT","role":"multi_property_relationship"}],"commercial_progression":"One-Time Service -> Pilot -> Recurring Program -> Priority Support / Retainer / Fractional Support -> Portfolio Agreement","sales_conversion_logic":"Sell the first job -> discover recurring volume -> convert transaction into program -> convert program into retainer or portfolio agreement.","membership_positioning":"Membership is optional terminology only; it is not the core CH02 B2B architecture.","emergency_positioning":"Emergency support is a contract feature governed by coverage hours, territory, eligible work, response target, minimum charge, after-hours premium, and provider availability. No implied 24/7 promise.","volume_pricing":"Volume or commitment adjustments are governed commercial rules, not automatic discounts. They require scope validation, provider capacity, geography, cost/margin review, and approval.","fractional_front_office":"Dedicated commercial lane with hourly/block, recurring, retainer, and portfolio structures.","hierarchy":"Portfolio Agreement / MSA -> Property / Community -> SOW or Work Order -> Fulfillment -> Evidence / Closeout"}'::jsonb,updated_at=now() where channel_code='CH02' and contract_version='2026-09-20.v1';
