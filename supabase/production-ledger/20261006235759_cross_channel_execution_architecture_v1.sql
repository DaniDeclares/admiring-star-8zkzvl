
create table if not exists public.dd_channel_execution_architecture (
  channel_code text primary key,
  channel_name text not null,
  core_promise text not null,
  execution_outcomes jsonb not null,
  contributing_divisions jsonb not null,
  owner_home_execution jsonb not null,
  provider_field_execution jsonb not null,
  cross_sell_rule text not null,
  status text not null default 'ACTIVE',
  updated_at timestamptz not null default now()
);
alter table public.dd_channel_execution_architecture enable row level security;

insert into public.dd_channel_execution_architecture(
  channel_code,channel_name,core_promise,execution_outcomes,contributing_divisions,
  owner_home_execution,provider_field_execution,cross_sell_rule,status
)
values
(
  'CH01','Residents',
  'DANI DECLARES handles the execution behind the household need — from planning and coordination through the service, documentation, follow-up and repeat support.',
  jsonb_build_array('HOME_READY','TIME_BACK','HOUSEHOLD_SUPPORT','MOVE_AND_TRANSITION','DOCUMENT_AND_ADMIN_SUPPORT','RECURRING_SUPPORT'),
  jsonb_build_array(
    'home-pet-plant-household-support',
    'administrative-business-operations',
    'logistics-courier-asset-sourcing',
    'notary-document-services',
    'creative-design-production',
    'experiences-resident-programming'
  ),
  jsonb_build_array('SCHEDULING','DOCUMENT_SUPPORT','HOUSEHOLD_ADMIN','RESEARCH_AND_COORDINATION','CUSTOMER_FOLLOWUP','DIGITAL_OR_CREATIVE_DELIVERABLES'),
  jsonb_build_array('CLEANING_AND_RESETS','ERRANDS_AND_LOGISTICS','PET_AND_PLANT_SUPPORT','HOME_WATCH','MOVE_SUPPORT','IN_PERSON_NOTARY_WHEN_AUTHORIZED'),
  'Start with the resident problem, then combine eligible divisions into one execution plan instead of selling isolated tasks.',
  'ACTIVE'
),
(
  'CH02','Property Management',
  'DANI DECLARES handles the execution behind property operations — coordinating the field work, office work, documentation, vendors, exceptions and closeout needed to keep properties moving.',
  jsonb_build_array('TURN_READY','FIELD_ISSUE_RESOLVED','CONDITION_VISIBLE','OFFICE_LOAD_REDUCED','RESIDENT_SUPPORT_EXECUTED','PORTFOLIO_SUPPORT'),
  jsonb_build_array(
    'property-facilities-field-operations',
    'administrative-business-operations',
    'logistics-courier-asset-sourcing',
    'marketing-content-media-production',
    'creative-design-production',
    'experiences-resident-programming',
    'notary-document-services',
    'business-development-growth'
  ),
  jsonb_build_array('VENDOR_COORDINATION','WORK_ORDER_ADMIN','PHOTO_AND_EVIDENCE_REVIEW','CRM_AND_FOLLOWUP','RESIDENT_COMMUNICATION_SUPPORT','CONTENT_AND_RESIDENT_ENGAGEMENT','REPORTING'),
  jsonb_build_array('TURNS_AND_MAKE_READY','INSPECTIONS','LOCKBOX_KEYS','FIELD_DISPATCH','COMMON_AREA_SUPPORT','SIGNAGE_AND_PRINT_DELIVERY','ONSITE_DOCUMENT_EXECUTION'),
  'Never default a property buyer to cleaning. Qualify the operational outcome first, then assemble the authorized services across divisions.',
  'ACTIVE'
),
(
  'CH03','Real Estate',
  'DANI DECLARES handles the execution around listings, transactions, field tasks, client touches and closing support so agents and brokerages can stay focused on the relationship and the deal.',
  jsonb_build_array('LISTING_READY','TRANSACTION_MOVING','FIELD_TASK_COMPLETE','CLIENT_EXPERIENCE_DELIVERED','OFFICE_LOAD_REDUCED','CLOSING_SUPPORTED'),
  jsonb_build_array(
    'real-estate-closing-support',
    'property-facilities-field-operations',
    'administrative-business-operations',
    'marketing-content-media-production',
    'creative-design-production',
    'logistics-courier-asset-sourcing',
    'notary-document-services',
    'business-development-growth'
  ),
  jsonb_build_array('TRANSACTION_ADMIN','SCHEDULING','CRM_FOLLOWUP','LISTING_CONTENT','EMAIL_AND_SOCIAL','DOCUMENT_FORMATTING','CLIENT_GIFT_COORDINATION'),
  jsonb_build_array('LISTING_PREP','OPEN_HOUSE_SETUP','SIGNAGE','FIELD_VERIFICATION','COURIER','MOBILE_NOTARY_WHEN_AUTHORIZED','CLOSING_DELIVERY'),
  'Bundle the listing, transaction, field and client-experience work into one execution path where channel and service rules allow.',
  'ACTIVE'
),
(
  'CH04','Business',
  'DANI DECLARES handles the execution behind business operations — admin, marketing, digital setup, field support, creative production, logistics and recurring operational work.',
  jsonb_build_array('BACK_OFFICE_RUNNING','MARKETING_EXECUTED','DIGITAL_FOUNDATION_BUILT','FIELD_NEED_HANDLED','CLIENT_FOLLOWUP_DONE','RECURRING_SUPPORT'),
  jsonb_build_array(
    'administrative-business-operations',
    'business-formation-digital-infrastructure',
    'marketing-content-media-production',
    'business-development-growth',
    'creative-design-production',
    'logistics-courier-asset-sourcing',
    'property-facilities-field-operations',
    'notary-document-services',
    'classes-workshops-training'
  ),
  jsonb_build_array('VIRTUAL_ASSISTANCE','OPERATIONS','SOP_AND_PROCESS','CRM','MARKETING','CONTENT','BUSINESS_SETUP_ADMIN','RESEARCH','PROJECT_COORDINATION'),
  jsonb_build_array('MOBILE_FIELD_SUPPORT','COURIER','FACILITY_SUPPORT','MERCH_PRODUCTION','ONSITE_NOTARY_WHEN_AUTHORIZED','EVENT_OR_TRAINING_SUPPORT'),
  'Sell the business outcome and combine home-based execution with field/provider execution instead of forcing the buyer into one division.',
  'ACTIVE'
),
(
  'CH05','Government',
  'DANI DECLARES handles the execution of authorized public-sector and institutional work — from pursuit support and mobilization through task performance, evidence, reporting and closeout.',
  jsonb_build_array('COMPLIANT_PURSUIT','MOBILIZED_WORK','TASK_ORDER_EXECUTED','EVIDENCE_COMPLETE','REPORTING_COMPLETE','CLOSEOUT_COMPLETE'),
  jsonb_build_array(
    'government-institutional-procurement',
    'property-facilities-field-operations',
    'administrative-business-operations',
    'logistics-courier-asset-sourcing',
    'marketing-content-media-production',
    'creative-design-production',
    'classes-workshops-training',
    'notary-document-services',
    'business-formation-digital-infrastructure',
    'business-development-growth'
  ),
  jsonb_build_array('SOLICITATION_RESEARCH','PROPOSAL_ADMIN','COMPLIANCE_TRACKING','REPORTING','DOCUMENT_CONTROL','CONTENT_AND_CAPABILITY_MATERIALS','PROJECT_COORDINATION'),
  jsonb_build_array('FACILITY_SERVICES','FIELD_SUPPORT','COURIER_AND_LOGISTICS','PRINT_AND_SIGNAGE','TRAINING_DELIVERY','AUTHORIZED_DOCUMENT_SERVICES'),
  'The governing solicitation/contract controls scope. Within that scope, assemble the authorized divisions needed to execute the requirement end to end.',
  'ACTIVE'
)
on conflict(channel_code) do update
set channel_name=excluded.channel_name,
    core_promise=excluded.core_promise,
    execution_outcomes=excluded.execution_outcomes,
    contributing_divisions=excluded.contributing_divisions,
    owner_home_execution=excluded.owner_home_execution,
    provider_field_execution=excluded.provider_field_execution,
    cross_sell_rule=excluded.cross_sell_rule,
    status='ACTIVE',
    updated_at=now();

update public.dd_channel_front_doors
set customer_promise = case channel_code
  when 'CH01' then
    case front_door_code
      when 'CH01-F01' then 'DANI handles the execution needed to get the home back to a clean, orderly, ready-to-use condition — including coordination, service, documentation and follow-up.'
      when 'CH01-F02' then 'DANI handles the execution of household tasks and coordination that are consuming the resident''s time and attention.'
      when 'CH01-F03' then 'DANI handles the execution of agreed pet and plant care routines, scheduling, handoff and follow-up.'
      when 'CH01-F04' then 'DANI handles the execution of documented away-support checks and household coordination without representing a security service.'
      when 'CH01-F05' then 'DANI handles the execution behind moves, guests, travel and seasonal workload spikes across eligible household-support services.'
    end
  when 'CH02' then
    case front_door_code
      when 'CH02-F01' then 'DANI handles the execution required to move a vacant unit or property toward rent-ready condition, not just one isolated task.'
      when 'CH02-F02' then 'DANI handles the execution of onsite tasks, field visits, coordination needs and time-sensitive property issues.'
      when 'CH02-F03' then 'DANI handles the execution needed to verify property condition and return management-ready documentation and evidence.'
      when 'CH02-F04' then 'DANI handles the execution of overloaded property-office and administrative operations so site teams can keep moving.'
    end
  when 'CH03' then
    case front_door_code
      when 'CH03-F01' then 'DANI handles the execution required to prepare a listing or property for market activity across field, creative, logistics and administrative work.'
      when 'CH03-F02' then 'DANI handles the execution of transaction-related field, document, coordination and deadline work that keeps a deal moving toward closing.'
      when 'CH03-F03' then 'DANI handles the execution of onsite verification, photos, access support and property documentation for the real-estate team.'
      when 'CH03-F04' then 'DANI handles the execution of brokerage administrative, marketing and coordination workload so transactions and clients keep moving.'
    end
  when 'CH04' then
    case front_door_code
      when 'CH04-F01' then 'DANI handles the execution needed to keep business locations operational, presentable and supported across field and back-office work.'
      when 'CH04-F02' then 'DANI handles the execution of administrative, marketing, digital and coordination workload that interferes with running the business.'
      when 'CH04-F03' then 'DANI handles the execution of recurring workplace programs across eligible service divisions and one or more business locations.'
      when 'CH04-F04' then 'DANI handles the execution of time-sensitive business needs while keeping scope, communication, evidence and closeout visible.'
    end
  when 'CH05' then
    case front_door_code
      when 'CH05-F01' then 'DANI handles the execution of authorized government and institutional facility/service requirements with documented performance and closeout.'
      when 'CH05-F02' then 'DANI handles the execution of the controlled pursuit and proposal workflow for an identified solicitation without inventing eligibility, scope or pricing.'
      when 'CH05-F03' then 'DANI handles the execution of awarded work against the controlling contract, SOW/PWS/SOO, line items and task orders.'
      when 'CH05-F04' then 'DANI handles the execution of compliance, evidence, reporting and closeout required by the governing agreement.'
    end
end,
updated_at=now()
where channel_code in ('CH01','CH02','CH03','CH04','CH05');

create or replace view public.dd_channel_multidivision_execution_v1
with (security_invoker=true)
as
select
  a.channel_code,
  a.channel_name,
  a.core_promise,
  d.slug as division_slug,
  d.name as division_name,
  case
    when a.contributing_divisions ? d.slug then true
    else false
  end as contributes_to_channel,
  count(s.id) filter (where sca.eligibility_status='ACTIVE') as authorized_services,
  count(s.id) filter (
    where sca.eligibility_status='ACTIVE'
      and r.release_state='LIVE_READY'
      and r.blocking_gate='NONE'
  ) as live_ready_services
from public.dd_channel_execution_architecture a
cross join public.divisions d
left join public.services s on s.division_id=d.id and s.is_active=true
left join public.dd_service_channel_availability sca
  on sca.service_id=s.id and sca.channel_code=a.channel_code
left join public.dd_service_release_contract_v1 r on r.canonical_sku=s.sku
where d.is_active=true
group by a.channel_code,a.channel_name,a.core_promise,d.slug,d.name,a.contributing_divisions
having a.contributing_divisions ? d.slug
order by a.channel_code,d.name;

create or replace view public.dd_channel_execution_front_doors_v1
with (security_invoker=true)
as
select
  f.channel_code,
  a.channel_name,
  f.front_door_code,
  f.front_door_name,
  f.audience,
  f.customer_promise,
  a.core_promise,
  a.execution_outcomes,
  a.contributing_divisions,
  a.owner_home_execution,
  a.provider_field_execution,
  a.cross_sell_rule
from public.dd_channel_front_doors f
join public.dd_channel_execution_architecture a using(channel_code)
where f.status='LOCKED' and a.status='ACTIVE'
order by f.channel_code,f.public_navigation_order,f.front_door_code;

select
  (select count(*) from public.dd_channel_execution_architecture where status='ACTIVE') as active_channels,
  (select count(*) from public.dd_channel_multidivision_execution_v1 where contributes_to_channel) as channel_division_links,
  (select count(*) from public.dd_channel_front_doors where customer_promise ilike '%handles the execution%') as execution_front_doors;
