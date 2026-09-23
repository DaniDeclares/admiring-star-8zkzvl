-- CH02 service adjudication queue
-- Purpose: govern interpretation/release of existing CH02-tagged services.
-- No source service, price, or storefront state is changed by this migration.

create table if not exists public.dd_ch02_service_adjudication (
  id uuid primary key default gen_random_uuid(),
  channel_code text not null references public.dd_commercial_channels(code),
  sku text not null,
  service_name text not null,
  source_service_family text,
  proposed_front_door text,
  disposition text not null default 'REVIEW',
  customer_facing_role text,
  backend_component boolean not null default false,
  cross_channel_review boolean not null default false,
  compliance_review_required boolean not null default true,
  pricing_adjudication_required boolean not null default true,
  provider_capacity_review_required boolean not null default true,
  rationale text,
  source_basis text not null,
  priority integer not null default 50,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(channel_code, sku)
);

alter table public.dd_ch02_service_adjudication enable row level security;
drop policy if exists "deny public access ch02 adjudication" on public.dd_ch02_service_adjudication;
create policy "deny public access ch02 adjudication"
on public.dd_ch02_service_adjudication for all to anon, authenticated
using (false) with check (false);

insert into public.dd_ch02_service_adjudication
(channel_code,sku,service_name,source_service_family,proposed_front_door,disposition,customer_facing_role,backend_component,cross_channel_review,compliance_review_required,pricing_adjudication_required,provider_capacity_review_required,rationale,source_basis,priority)
select
 'CH02', m.sku, m.service_name, m.service_family,
 case
   when m.service_family = '02A Property Operations & Turnover Packages' then
     case
       when lower(m.service_name) like '%turn%' or lower(m.service_name) like '%make-ready%' or lower(m.service_name) like '%move-in%' or lower(m.service_name) like '%move-out%' then 'TURNOVER_MAKE_READY'
       when lower(m.service_name) like '%inspection%' or lower(m.service_name) like '%condition%' or lower(m.service_name) like '%documentation%' then 'PROPERTY_CONDITION_DOCUMENTATION'
       else 'PROPERTY_RESCUE_FIELD_DISPATCH'
     end
   when m.service_family = 'Property, Facilities & Field Operations' then
     case
       when lower(m.service_name) like '%inspection%' or lower(m.service_name) like '%condition%' or lower(m.service_name) like '%documentation%' then 'PROPERTY_CONDITION_DOCUMENTATION'
       else 'PROPERTY_RESCUE_FIELD_DISPATCH'
     end
   when m.service_family = '01A Home & Cleaning' then 'TURNOVER_MAKE_READY'
   when m.service_family in ('01B Pet Care & Household Pet Support','01C Indoor Plant Care','01D Household Concierge','01E Move & Household Transition','01F Seasonal/Holiday','Experiences & Resident Programming') then 'SUPPORTING_LAYER'
   when m.service_family like '04A%' or m.service_family = 'Administrative & Business Operations' then 'OFFICE_OPERATIONS_RESCUE'
   when m.service_family like 'Notary%' or m.service_family like '05A%' or m.service_family like 'Real Estate%' then 'CROSS_CHANNEL_REVIEW'
   else 'CROSS_CHANNEL_REVIEW'
 end,
 case
   when m.service_family in ('01B Pet Care & Household Pet Support','01C Indoor Plant Care','01D Household Concierge','01E Move & Household Transition','01F Seasonal/Holiday','Experiences & Resident Programming') then 'SUPPORTING_LAYER'
   when m.service_family like 'Notary%' or m.service_family like '05A%' or m.service_family like 'Real Estate%' then 'CROSS_CHANNEL_REVIEW'
   else 'FRONT_DOOR_CANDIDATE'
 end,
 case
   when m.service_family like 'Notary%' or m.service_family like '05A%' or m.service_family like 'Real Estate%' then 'Cross-channel service; do not release as a CH02 front door without explicit adjudication.'
   when m.service_family = '02A Property Operations & Turnover Packages' then 'Core property-operations offer candidate.'
   when m.service_family = 'Property, Facilities & Field Operations' then 'Core field/property-operations offer candidate.'
   when m.service_family = '01A Home & Cleaning' then 'Property turnover/make-ready component or entry offer candidate.'
   when m.service_family like '04A%' or m.service_family = 'Administrative & Business Operations' then 'Property-office operations support candidate; requires property-specific scope.'
   else 'Supporting capability; not a CH02 front door by default.'
 end,
 case when m.service_family in ('01B Pet Care & Household Pet Support','01C Indoor Plant Care','01D Household Concierge','01E Move & Household Transition','01F Seasonal/Holiday','Experiences & Resident Programming') then true else false end,
 case when m.service_family like 'Notary%' or m.service_family like '05A%' or m.service_family like 'Real Estate%' then true else false end,
 true,true,true,
 'Initial CH02 adjudication generated from the locked CH02 strategy contract and existing channel matrix. No source service, price, or storefront state changed.',
 'CH02 strategy contract 2026-09-20.v1 + existing dd_master_service_capability_channel_matrix',
 case
   when m.service_family = '02A Property Operations & Turnover Packages' then 10
   when m.service_family = 'Property, Facilities & Field Operations' then 20
   when m.service_family = '01A Home & Cleaning' then 30
   when m.service_family like '04A%' or m.service_family = 'Administrative & Business Operations' then 40
   when m.service_family like 'Real Estate%' or m.service_family like 'Notary%' or m.service_family like '05A%' then 80
   else 60
 end
from public.dd_master_service_capability_channel_matrix m
where m.channel_code='CH02'
on conflict (channel_code,sku) do update set
 service_name=excluded.service_name,
 source_service_family=excluded.source_service_family,
 proposed_front_door=excluded.proposed_front_door,
 disposition=excluded.disposition,
 customer_facing_role=excluded.customer_facing_role,
 backend_component=excluded.backend_component,
 cross_channel_review=excluded.cross_channel_review,
 rationale=excluded.rationale,
 priority=excluded.priority,
 updated_at=now();

update public.dd_ch02_service_adjudication
set proposed_front_door='CROSS_CHANNEL_REVIEW',
    disposition='CROSS_CHANNEL_REVIEW',
    customer_facing_role='Cross-channel business service; CH02 requires a property-specific variant or explicit property-office use case.',
    cross_channel_review=true,
    rationale='CH02 research supports office/operations rescue only when tied to property operations. Generic business, government-readiness, finance, and R.E.A.C.H. offers are not automatically CH02.',
    priority=80,
    updated_at=now()
where channel_code='CH02'
  and source_service_family in ('04A Administrative & Document Services','04A Government & Vendor Readiness','04A R.E.A.C.H. Outside Company Buildouts','04A Money, CRM & Follow-Up','Administrative & Business Operations')
  and sku not in ('DNI-04A-002','DNI-04A-010','DNI-04A-013','DNI-04A-014','DNI-04A-018','DNI-04A-020','DNI-04A-031','DNI-04A-033','DNI-04A-034','DNI-04A-035','DNI-04A-036','DNI-04A-039','DNI-04A-040');

update public.dd_ch02_service_adjudication
set customer_facing_role='CH02 front-door candidate, but customer-facing naming/scope must be property-specific before release.',
    rationale='Operationally relevant to property-office workflows; retain as a candidate but require CH02-specific scope and buyer/use-case language before storefront release.',
    updated_at=now()
where channel_code='CH02'
  and sku in ('DNI-04A-002','DNI-04A-010','DNI-04A-013','DNI-04A-014','DNI-04A-018','DNI-04A-020','DNI-04A-031','DNI-04A-033','DNI-04A-034','DNI-04A-035','DNI-04A-036','DNI-04A-039','DNI-04A-040');

create index if not exists idx_dd_ch02_adjudication_disposition on public.dd_ch02_service_adjudication(disposition,priority);
create index if not exists idx_dd_ch02_adjudication_front_door on public.dd_ch02_service_adjudication(proposed_front_door,priority);
