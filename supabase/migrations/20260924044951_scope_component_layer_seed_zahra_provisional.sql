
insert into public.dd_service_components
  (component_code, component_name, description, unit_type, cost_category,
   default_fulfillment_mode, component_kind, is_active, metadata)
values
  ('JOB_CHARGE_VISIT_DISPATCH','Visit / dispatch','Once per work order: travel within included radius, walkthrough/setup, supply-kit handling, transaction overhead. Never duplicated inside packages.','JOB','DIRECT','IN_HOUSE','JOB_CHARGE',true,'{"calibration_case":"ZAHRA_Q1"}'),
  ('CLN_SCOPE_BATHROOM_DEEP','Bathroom — deep clean','One bathroom, deep scope.','ROOM','LABOR','IN_HOUSE','SCOPE_UNIT',true,'{"calibration_case":"ZAHRA_Q1"}'),
  ('CLN_SCOPE_KITCHEN_STANDARD','Kitchen — standard clean','One kitchen, standard scope.','ROOM','LABOR','IN_HOUSE','SCOPE_UNIT',true,'{"calibration_case":"ZAHRA_Q1"}'),
  ('CLN_SCOPE_LIVING_ROOM_STANDARD','Living room — standard clean','One living area, standard scope.','ROOM','LABOR','IN_HOUSE','SCOPE_UNIT',true,'{"calibration_case":"ZAHRA_Q1"}'),
  ('CLN_SCOPE_WOOD_FLOOR','Wood floor cleaning','Wood floors in living + kitchen areas (Zahra baseline area).','AREA','LABOR','IN_HOUSE','SCOPE_UNIT',true,'{"calibration_case":"ZAHRA_Q1"}'),
  ('MOD_PET_HOME','Pet-home modifier','Pet hair on surfaces, baseboards, floors in cleaned areas. 1–2 pets, normal shedding.','JOB','LABOR','IN_HOUSE','MODIFIER',true,'{"calibration_case":"ZAHRA_Q1"}')
on conflict (component_code) do nothing;

insert into public.dd_component_recipes (parent_component_id, child_component_id, quantity, quantity_basis, notes)
select p.id,c.id,v.qty,v.basis,'Zahra Q1 provisional estimate'
from (values
 ('JOB_CHARGE_VISIT_DISPATCH','CLEANING_LABOR_HOUR',0.25,'PER_ORDER'),
 ('JOB_CHARGE_VISIT_DISPATCH','CLEANING_CONSUMABLES_JOB',1,'PER_ORDER'),
 ('CLN_SCOPE_BATHROOM_DEEP','CLEANING_LABOR_HOUR',1.25,'PER_PARENT_UNIT'),
 ('CLN_SCOPE_KITCHEN_STANDARD','CLEANING_LABOR_HOUR',1.0,'PER_PARENT_UNIT'),
 ('CLN_SCOPE_LIVING_ROOM_STANDARD','CLEANING_LABOR_HOUR',0.5833,'PER_PARENT_UNIT'),
 ('CLN_SCOPE_WOOD_FLOOR','CLEANING_LABOR_HOUR',0.5833,'PER_PARENT_UNIT'),
 ('MOD_PET_HOME','CLEANING_LABOR_HOUR',0.5,'PER_ORDER')
) v(parent,child,qty,basis)
join public.dd_service_components p on p.component_code=v.parent
join public.dd_service_components c on c.component_code=v.child
on conflict do nothing;

insert into public.dd_component_price_versions
(component_id,version,price_status,pricing_basis,bundled_price_cents,estimated_minutes,evidence_status,source_reference)
select c.id,1,'PROVISIONAL','FLAT',v.cents,v.minutes,'PROVISIONAL_ESTIMATE',
'Zahra Quote v1 (2026-09-24), approved working quote; calibration case #1'
from (values
 ('JOB_CHARGE_VISIT_DISPATCH',6500,45),
 ('CLN_SCOPE_BATHROOM_DEEP',5500,75),
 ('CLN_SCOPE_KITCHEN_STANDARD',4500,60),
 ('CLN_SCOPE_LIVING_ROOM_STANDARD',2500,35),
 ('CLN_SCOPE_WOOD_FLOOR',2500,35),
 ('MOD_PET_HOME',3000,30)
) v(code,cents,minutes)
join public.dd_service_components c on c.component_code=v.code
on conflict (component_id,version) do nothing;

insert into public.dd_component_composition_rules
(rule_code,rule_type,subject_component_id,object_component_id,parameters,severity,rationale)
select v.rule_code,v.rule_type,s.id,o.id,v.params::jsonb,v.severity,v.rationale
from (values
 ('VISIT_REQUIRED','REQUIRED_PER_ORDER','JOB_CHARGE_VISIT_DISPATCH',null,'{}','BLOCK','Every on-site work order carries exactly one visit/dispatch charge.'),
 ('VISIT_ONCE','ONE_PER_ORDER','JOB_CHARGE_VISIT_DISPATCH',null,'{}','BLOCK','Job-level costs occur once per work order, never per room or inside packages.'),
 ('PET_ONCE','ONE_PER_ORDER','MOD_PET_HOME',null,'{}','BLOCK','Pet modifier applies once per order.'),
 ('PET_NEEDS_SCOPE','REQUIRES','MOD_PET_HOME',null,'{"requires_any_kind":"SCOPE_UNIT"}','BLOCK','A modifier cannot be sold without scope work to modify.'),
 ('PET_HEAVY_REVIEW','MANUAL_REVIEW_TRIGGER','MOD_PET_HOME',null,'{"if":"pets > 2 or heavy_shedding"}','REVIEW','Provisional pet price assumes 1–2 pets, normal shedding.')
) v(rule_code,rule_type,subj,obj,params,severity,rationale)
join public.dd_service_components s on s.component_code=v.subj
left join public.dd_service_components o on o.component_code=v.obj
on conflict (rule_code) do nothing;

insert into public.dd_customer_travel_policies
(policy_code,included_miles,distance_basis,charge_per_mile_beyond_cents,evidence_status,source_reference)
values ('CUSTOMER_TRAVEL_15MI_250',15,'ONE_WAY',250,'OWNER_CONFIRMED',
'Owner-locked policy restated 2026-09-24: 15 mi included; beyond = $2.50/mi one-way. Internal cost uses governed round-trip mileage.')
on conflict (policy_code) do nothing;
