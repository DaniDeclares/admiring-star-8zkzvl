-- Universal channel front-door and architecture audit controls.
-- DANI DECLARES: one operating kernel, channel-specific commercial/fulfillment rules.
-- No channel is promoted to production readiness by this migration.

create table if not exists public.dd_channel_front_doors (
  id uuid primary key default gen_random_uuid(),
  channel_code text not null references public.dd_commercial_channels(code),
  front_door_code text not null,
  front_door_name text not null,
  audience text not null,
  customer_promise text not null,
  primary_triggers jsonb not null default '[]'::jsonb,
  entry_surfaces jsonb not null default '[]'::jsonb,
  required_context jsonb not null default '[]'::jsonb,
  commercial_route text not null,
  fulfillment_route text not null,
  pricing_visibility text not null,
  status text not null default 'LOCKED' check (status in ('LOCKED','DRAFT','SUPERSEDED','INACTIVE')),
  source_basis text not null,
  basis_type text not null check (basis_type in ('RESEARCH','DECISION','DANI_INTERPRETATION','SYSTEM_CONTROL')),
  research_evidence jsonb not null default '[]'::jsonb,
  public_navigation_order integer not null,
  architecture_version text not null default '2026-09-21-channel-v1',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(channel_code, front_door_code, architecture_version)
);

alter table public.dd_channel_front_doors enable row level security;
revoke all on public.dd_channel_front_doors from anon;
revoke insert, update, delete on public.dd_channel_front_doors from authenticated;
grant select on public.dd_channel_front_doors to authenticated;
drop policy if exists dd_channel_front_doors_staff_read on public.dd_channel_front_doors;
create policy dd_channel_front_doors_staff_read on public.dd_channel_front_doors
for select to authenticated using ((select private.dd_is_staff_admin()));
create index if not exists dd_channel_front_doors_channel_idx
on public.dd_channel_front_doors(channel_code,status,public_navigation_order);

create table if not exists public.dd_channel_architecture_10_pass (
  id uuid primary key default gen_random_uuid(),
  channel_code text not null references public.dd_commercial_channels(code),
  pass_number integer not null check (pass_number between 1 and 10),
  audit_round integer not null check (audit_round in (1,2)),
  pass_name text not null,
  lifecycle_stage text not null,
  status text not null check (status in ('GREEN','YELLOW','RED','NOT_PROVEN')),
  current_state text not null,
  architecture_decision text not null,
  research_basis text not null,
  research_evidence jsonb not null default '[]'::jsonb,
  blocking_gap text not null,
  required_build text not null,
  proof_gate text not null,
  audit_version text not null default '2026-09-21-channel-v1',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(channel_code,pass_number,audit_version)
);

alter table public.dd_channel_architecture_10_pass enable row level security;
revoke all on public.dd_channel_architecture_10_pass from anon;
revoke insert, update, delete on public.dd_channel_architecture_10_pass from authenticated;
grant select on public.dd_channel_architecture_10_pass to authenticated;
drop policy if exists dd_channel_architecture_10_pass_staff_read on public.dd_channel_architecture_10_pass;
create policy dd_channel_architecture_10_pass_staff_read on public.dd_channel_architecture_10_pass
for select to authenticated using ((select private.dd_is_staff_admin()));
create index if not exists dd_channel_architecture_10_pass_idx
on public.dd_channel_architecture_10_pass(channel_code,audit_round,pass_number,status);

insert into public.dd_channel_front_doors
(channel_code,front_door_code,front_door_name,audience,customer_promise,primary_triggers,entry_surfaces,required_context,commercial_route,fulfillment_route,pricing_visibility,status,source_basis,basis_type,public_navigation_order)
values
('CH01','CH01-F01','Home Cleaning & Home Reset','Resident / household buyer','Get the home back to a clean, orderly, ready-to-use condition.','["cleaning backlog","household overload","maintenance lapse"]','["public resident site","resident account","staff sales"]','["home/address","service","condition","access","timing","safety/pet context"]','Governed catalog → service intake → approved price → resident checkout/payment','Paid request → job → service tasks → assignment → evidence → QA → completion','Public price only for a LIVE_READY released service','LOCKED','Existing CH01 front-door architecture and live governance tables.','DECISION',1),
('CH01','CH01-F02','Household Concierge & Errands','Resident / household buyer','Hand off household tasks consuming time and attention.','["household overload","time pressure"]','["public resident site","resident account","phone/staff"]','["task type","origin/destination","access","timing","special handling"]','Governed catalog → structured request/quote where required → payment','Paid/approved job → dispatch → field execution → evidence → closeout','Service-specific governed pricing only','LOCKED','Existing CH01 front-door architecture and live governance tables.','DECISION',2),
('CH01','CH01-F03','Pet & Plant Care','Resident / household buyer','Keep household pets and indoor plants cared for on an agreed routine.','["pet care","plant care"]','["public resident site","resident account","phone/staff"]','["pet/plant type","care instructions","access","schedule","safety boundaries"]','Governed service → qualification → payment or quote','Job → qualified worker path → task/evidence requirements → QA → completion','Released governed pricing only','LOCKED','Existing CH01 front-door architecture and live governance tables.','DECISION',3),
('CH01','CH01-F04','Home Watch & Away Support','Absent homeowner / resident','Provide a documented household check without representing a security service.','["away from home"]','["public resident site","resident account","phone/staff"]','["property/access","check scope","contacts","exception instructions","cadence"]','Governed service → recurring or one-time quote/payment','Scheduled visit → checklist → evidence → exception escalation → closeout','Governed service pricing only','LOCKED','Existing CH01 front-door architecture and live governance tables.','DECISION',4),
('CH01','CH01-F05','Move, Guest & Seasonal Support','Resident / household buyer','Handle temporary workload spikes from moving, hosting, travel and seasonal change.','["move transition","guest/event","seasonal","organization"]','["public resident site","resident account","phone/staff"]','["transition/event type","deadline","home context","quantity","access","special handling"]','Governed multi-line quote from canonical services','Work package → tasks → scheduling → dispatch → evidence → closeout','Governed quote; no unapproved bundle price','LOCKED','Existing CH01 front-door architecture and live governance tables.','DECISION',5),

('CH02','CH02-F01','Turnover & Make-Ready','Property management / property operations buyer','Move a vacant unit or property toward rent-ready condition.','["vacancy","turnover","move-out","make-ready deadline"]','["property page","property operations","phone/outbound","staff quote builder"]','["property/unit","quantity","condition","deadline","access","scope/evidence"]','Solution family → canonical services → governed estimate → approval → invoice/payment','Approved/paid work → job → tasks → scheduling → provider → QA','No public fixed package price','LOCKED','DANI CH02 architecture and live offer crosswalk.','DECISION',1),
('CH02','CH02-F02','Property Rescue & Field Dispatch','Property management / property operations buyer','Handle an onsite task, field visit, coordination need or time-sensitive property issue.','["onsite gap","time pressure","vendor handoff","access/key need"]','["property page","property operations","phone/outbound","staff quote builder"]','["property","request type","urgency","access","site contact","evidence"]','Solution family → canonical service → governed quote/approval','Job → dispatch → field task/evidence → QA → closeout','Governed quote','LOCKED','DANI CH02 architecture and live offer crosswalk.','DECISION',2),
('CH02','CH02-F03','Property Condition & Documentation','Property management / property operations buyer','See what is happening onsite and receive management-ready documentation.','["condition unknown","inspection","damage documentation","vendor verification"]','["property page","property operations","phone/outbound","staff quote builder"]','["property/unit","inspection scope","photo/report requirements","access","deadline"]','Solution family → canonical documentation services → governed estimate','Scheduled field visit → checklist/photos/report → QA → delivery','Governed quote','LOCKED','DANI CH02 architecture and live offer crosswalk.','DECISION',3),
('CH02','CH02-F04','Office & Operations Rescue','Property management / property operations buyer','Relieve overloaded property-office and administrative operations.','["office backlog","vendor administration","records cleanup","month-end pressure"]','["property page","property operations","phone/outbound","staff quote builder"]','["organization/property","workstream","volume","deadline","systems/documents","access"]','Solution family → canonical administrative services → governed estimate/recurring agreement','Work package → operational tasks → evidence/approval → closeout','Governed quote/recurring program','LOCKED','DANI CH02 architecture and live offer crosswalk.','DECISION',4),

('CH03','CH03-F01','Listing & Property Preparation','Brokerage / agent / transaction team','Prepare a listing or property for market activity with coordinated support.','["pre-listing","listing launch","showing readiness","property prep"]','["real estate services page","brokerage referral","phone/outbound","staff sales"]','["property","listing phase","deadline","access","requested services","documentation"]','Problem family → canonical services → governed quote/SOW','Property work order → schedule → field/coordination tasks → evidence → closeout','Controlled quote/starting-at only when released','LOCKED','NAR transaction lifecycle research and DANI CH03 architecture.','RESEARCH',1),
('CH03','CH03-F02','Transaction & Closing Support','Agent / transaction coordinator / brokerage operations','Keep transaction-related field, document and deadline work moving toward closing.','["contract executed","inspection","pre-closing","closing deadline","possession"]','["real estate services page","brokerage referral","phone/outbound","staff sales"]','["transaction/property","milestones","deadline","parties","access","documents/tasks"]','Controlled quote/SOW → approval → invoice/payment or approved account terms','Transaction work package → deadline-driven tasks → evidence → closeout','Controlled quote','LOCKED','NAR transaction procedures and transaction-coordination research.','RESEARCH',2),
('CH03','CH03-F03','Property Field & Documentation','Agent / brokerage / transaction team','Get reliable onsite verification, photos, access support and property documentation.','["site check","lockbox/access","inspection support","condition documentation","vendor verification"]','["real estate services page","brokerage referral","phone/outbound"]','["property","visit purpose","access method","photo/report standard","deadline","contact"]','Canonical field/documentation service → controlled quote/payment','Scheduled visit → checklist/photos → QA → delivery','Controlled quote unless explicitly released','LOCKED','NAR materials on property appointments, inspections, access and transaction support.','RESEARCH',3),
('CH03','CH03-F04','Brokerage & Office Operations','Brokerage / team / office operations','Take administrative and coordination work off the brokerage team.','["transaction admin backlog","CRM cleanup","document collection","team overload"]','["real estate services page","brokerage referral","phone/outbound"]','["brokerage/team","workstream","volume","deadline","system/access"]','Canonical administrative services → quote/recurring agreement','Assigned work package → admin execution → evidence/approval → closeout','Quote/recurring program','LOCKED','NAR research on transaction coordinators and assistants.','RESEARCH',4),

('CH04','CH04-F01','Facility & Site Support','Business owner / facilities / operations buyer','Keep business locations operational, presentable and supported.','["facility issue","site condition","maintenance coordination","opening/closing"]','["business services page","direct inquiry","phone/outbound","referral"]','["organization","site/location","need","access","urgency","service window","PO/work order"]','Business need → canonical service → quote/SOW or recurring agreement','Location job → schedule/dispatch → field tasks/evidence → QA → invoice','Commercial quote/contract','LOCKED','Commercial FSM/facilities research.','RESEARCH',1),
('CH04','CH04-F02','Workplace & Office Operations','Business owner / office / operations manager','Relieve operational and administrative workload that interferes with running the business.','["office backlog","admin overload","document/vendor coordination","event/workplace support"]','["business services page","direct inquiry","phone/outbound"]','["business/location","workstream","volume","deadline","access/system"]','Canonical administrative/operational services → quote or recurring agreement','Assigned work package → tasks → evidence/approval → closeout','Commercial quote/recurring agreement','LOCKED','Commercial service-management research.','RESEARCH',2),
('CH04','CH04-F03','Recurring Facility & Workplace Programs','Business / facilities buyer','Create a dependable recurring service program across business locations.','["recurring maintenance","scheduled support","multi-location","service agreement"]','["business services page","direct sales","referral"]','["locations","cadence","scope","SLA","billing terms","contacts","access"]','Service agreement/program → recurring schedule → periodic billing','Agreement → generated visits/jobs → dispatch → evidence → recurring QA','Contract/recurring pricing','LOCKED','Commercial FSM recurring-agreement research.','RESEARCH',3),
('CH04','CH04-F04','Urgent & Time-Sensitive Response','Business / facilities / operations buyer','Respond to a time-sensitive business-site need with operational visibility.','["emergency","deadline","business disruption","same-day need"]','["business services page","phone","direct dispatch request","staff sales"]','["site","issue","urgency/SLA","access","decision maker","safety constraints"]','Controlled urgent quote/authorization → dispatch-ready job','Priority job → dispatch → field status/evidence → escalation → QA','Controlled quote; rush/SLA governed','LOCKED','Commercial facilities work-order research.','RESEARCH',4),

('CH05','CH05-F01','Government / Institutional Facility Services','Agency / institution / contracting or program buyer','Provide documented services under an authorized government/institutional requirement.','["facility requirement","institutional need","market research","sources sought"]','["government capabilities page","procurement outreach","opportunity research","prime/subcontractor outreach"]','["agency/buyer","requirement","place of performance","NAICS/PSC","period","security/access","vehicle"]','Procurement qualification → solicitation/contract/SOW path; no consumer checkout','Award/authorized task → contract line/task order → job → acceptance','No consumer-style public pricing','LOCKED','GSA/SBA federal procurement lifecycle and DANI CH05 architecture.','RESEARCH',1),
('CH05','CH05-F02','Solicitation & Proposal Response','Government contracting / procurement buyer','Respond to an identified solicitation with a controlled offer package.','["RFI","RFQ","RFP","IFB","solicitation deadline"]','["government opportunities page","opportunity research","prime outreach","staff pursuit workspace"]','["solicitation","line items/CLINs","instructions","evaluation factors","deadline","certifications","attachments"]','Opportunity → qualification → proposal/quote → submission gates → award decision','Awarded scope only → contract/task-order fulfillment','No consumer checkout; proposal pricing controlled by solicitation/quote authority','LOCKED','GSA solicitation lifecycle guidance.','RESEARCH',2),
('CH05','CH05-F03','Contract & Task Order Fulfillment','Contracting officer / program manager / authorized buyer','Execute awarded work against the controlling contract and authorized task order.','["contract award","task order","notice to proceed","authorized work order"]','["contract/customer portal","staff operations","authorized task order intake"]','["contract","CLIN/line item","SOW/PWS/SOO","period/place","funding","deliverables","acceptance"]','Award/contract/task order → governed line items → work authorization → fulfillment','Contract/task order → job/tasks → schedule/dispatch → evidence → acceptance','Contract-specific; no consumer checkout','LOCKED','FAR/GSA contract and line-item controls.','RESEARCH',3),
('CH05','CH05-F04','Compliance, Reporting & Closeout','Agency / contracting / program / audit buyer','Maintain required documentation, performance evidence and closeout records.','["deliverable submission","inspection/acceptance","modification","invoice","closeout"]','["contract portal","staff contract workspace","authorized customer channel"]','["contract requirements","deliverables","acceptance evidence","modifications","invoice/payment","closeout"]','Contract administration → invoice/payment → reporting → closeout/renewal','Evidence/QA → acceptance → invoice → contract record → closeout','Contract/PO/payment terms only','LOCKED','GSA contract-management and FAR traceability guidance.','RESEARCH',4)
on conflict(channel_code,front_door_code,architecture_version) do update set
front_door_name=excluded.front_door_name,audience=excluded.audience,customer_promise=excluded.customer_promise,
primary_triggers=excluded.primary_triggers,entry_surfaces=excluded.entry_surfaces,required_context=excluded.required_context,
commercial_route=excluded.commercial_route,fulfillment_route=excluded.fulfillment_route,pricing_visibility=excluded.pricing_visibility,
status=excluded.status,source_basis=excluded.source_basis,basis_type=excluded.basis_type,
public_navigation_order=excluded.public_navigation_order,updated_at=now();

do $$
declare v_channel text; v_status text; v_current text; v_basis text; v_gap text; v_build text; v_proof text; v_pass_name text; v_stage text;
begin
foreach v_channel in array ARRAY['CH01','CH02','CH03','CH04','CH05'] loop
for i in 1..10 loop
v_pass_name := case i when 1 then 'Market / Buyer' when 2 then 'Front Door / Relationship' when 3 then 'Service Discovery' when 4 then 'Intake / Scope' when 5 then 'Commercial Model' when 6 then 'Quote / Approval or Procurement Authorization' when 7 then 'Payment / Award → Job' when 8 then 'Operations / Dispatch / Worker' when 9 then 'QA / Evidence / Completion' else 'Closeout / Repeat / Renewal' end;
v_stage := case when i<=2 then 'CUSTOMER' when i=3 then 'SERVICE' when i=4 then 'SCOPE' when i in (5,6) then 'COMMERCIAL' when i=7 then 'PAYMENT' when i=8 then 'FULFILLMENT' when i=9 then 'EXECUTION' else 'PROOF' end;
v_status := case when v_channel='CH01' and i in (1,2,3,4,8,9,10) then 'RED' when v_channel='CH01' then 'YELLOW' when v_channel='CH02' and i<=7 then 'YELLOW' when v_channel in ('CH03','CH04','CH05') and i<=5 then 'YELLOW' else 'NOT_PROVEN' end;
v_current := case v_channel when 'CH01' then 'Existing CH01 architecture is defined; runtime release blockers remain.' when 'CH02' then 'CH02 is the reference implementation; full worker/evidence proof remains open.' when 'CH03' then 'CH03 architecture is researched and defined; runtime channel implementation is not proven.' when 'CH04' then 'CH04 architecture is researched and defined; runtime channel implementation is not proven.' else 'CH05 procurement architecture is defined; procurement execution is not proven.' end;
v_basis := case v_channel when 'CH01' then 'Existing CH01 audit + live CH01 governance tables.' when 'CH02' then 'DANI CH02 architecture source + live CH02 governance tables.' when 'CH03' then 'NAR transaction lifecycle and transaction-coordination research.' when 'CH04' then 'Housecall Pro, Jobber and ServiceChannel commercial FSM/facilities research.' else 'GSA, SBA and FAR procurement guidance.' end;
v_gap := case when v_channel='CH01' then case i when 1 then 'Five front doors are not carried through resident acquisition/intake.' when 2 then 'Canonical CH01 service resolution is not deterministic.' when 3 then 'Service-specific CH01 inputs/evidence contracts are incomplete.' when 4 then 'CH01-B executable pricing and economic baselines are incomplete.' when 5 then 'Server-side commercial provenance is incomplete at intake.' when 6 then 'Checkout still relies on generic CH01 resolution.' when 7 then 'Paid-to-job/task/dispatch reconciliation is not fully proven.' when 8 then 'Worker capacity/coverage/assignment path is not proven for launch SKUs.' when 9 then 'CH01 task/evidence/QA completion contract is not proven.' else 'No complete resident transaction has passed release proof.' end when v_channel='CH02' then 'Representative CH02 transaction is not yet proven through the complete lifecycle.' when v_channel='CH03' then 'Channel-specific runtime contracts and release evidence are not implemented.' when v_channel='CH04' then 'Channel-specific account/location, commercial and release controls are not implemented.' else 'Solicitation-to-award-to-task-order execution and acceptance proof are not implemented as one channel.' end;
v_build := case v_channel when 'CH01' then 'Execute the existing CH01 release blockers and then run an end-to-end resident smoke transaction.' when 'CH02' then 'Run a representative CH02 transaction through quote, approval, payment, job, dispatch, evidence and closeout.' when 'CH03' then 'Build CH03 strategy, routing, buyer authority, service adjudication, scope inputs, commercial controls and proof.' when 'CH04' then 'Build CH04 strategy, routing, account/location model, commercial controls, recurring/urgent rules and proof.' else 'Build CH05 procurement strategy, solicitation gates, contract/CLIN controls, task-order fulfillment, compliance and proof.' end;
v_proof := case v_channel when 'CH01' then 'One released resident SKU completes acquisition → price → payment → job → tasks → assignment → appointment → evidence/QA → completion.' when 'CH02' then 'One CH02 solution family completes quote → approval → invoice/payment → job → tasks → assignment → appointment → evidence/QA → completion.' when 'CH03' then 'One representative listing/transaction service completes front door → quote/SOW → job → worker/evidence → closeout.' when 'CH04' then 'One representative business service completes authorization → job → dispatch → evidence → invoice → repeat/renewal.' else 'One representative opportunity progresses solicitation/response → award → line/task order → fulfillment → acceptance/evidence → invoice/closeout.' end;
insert into public.dd_channel_architecture_10_pass(channel_code,pass_number,audit_round,pass_name,lifecycle_stage,status,current_state,architecture_decision,research_basis,blocking_gap,required_build,proof_gate)
values(v_channel,i,case when i<=5 then 1 else 2 end,v_pass_name,v_stage,v_status,v_current,'Every channel uses the same 10-pass release kernel; the front-door, commercial and fulfillment implementation varies by channel.',v_basis,v_gap,v_build,v_proof)
on conflict(channel_code,pass_number,audit_version) do update set
audit_round=excluded.audit_round,pass_name=excluded.pass_name,lifecycle_stage=excluded.lifecycle_stage,status=excluded.status,current_state=excluded.current_state,
architecture_decision=excluded.architecture_decision,research_basis=excluded.research_basis,blocking_gap=excluded.blocking_gap,required_build=excluded.required_build,proof_gate=excluded.proof_gate,updated_at=now();
end loop;
end loop;
end $$;
