create table if not exists public.dd_sc_property_candidates (
 id uuid primary key default gen_random_uuid(),
 candidate_key text not null unique,
 address text not null,
 listing_type text not null,
 property_type text,
 asking_price numeric,
 annual_base_rent numeric,
 monthly_base_rent numeric,
 available_sf numeric,
 lot_acres numeric,
 county text,
 zoning_summary text,
 school_zone_target text not null default 'WREN_ANCHOR',
 school_zone_status text not null default 'UNVERIFIED' check (school_zone_status in ('UNVERIFIED','MATCH','NO_MATCH','NOT_APPLICABLE')),
 live_work_status text not null default 'UNVERIFIED' check (live_work_status in ('UNVERIFIED','POSSIBLE_REQUIRES_APPROVAL','PERMITTED_VERIFIED','NOT_PERMITTED')),
 dani_fit text not null default 'RESEARCH',
 strategic_tier text not null default 'RESEARCH',
 source_url text,
 source_checked_at timestamptz,
 underwriting_status text not null default 'SCREENING',
 blocker text,
 notes text,
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now()
);
alter table public.dd_sc_property_candidates enable row level security;
revoke all on public.dd_sc_property_candidates from anon,authenticated;

insert into public.dd_sc_property_candidates
(candidate_key,address,listing_type,property_type,asking_price,annual_base_rent,monthly_base_rent,available_sf,lot_acres,county,zoning_summary,dani_fit,strategic_tier,source_url,source_checked_at,blocker,notes)
values
('SC_2514_RIVER_1200','2514 River Rd, Piedmont, SC 29673','LEASE','FLEX',null,17340,1445,1200,null,null,'Not verified','STRONG_STARTER_BASE','STARTER_OPERATIONS','https://www.loopnet.com/Listing/2514-River-Rd-Piedmont-SC/38475817/',now(),'School attendance and live/work status unverified; commercial suite is not presently a residential solution.','Current listing shows 1,200 SF flex at $14.45/SF/YR; useful as low-overhead SC business base.'),
('SC_709_HWY17','709 Highway 17, Piedmont, SC 29673','LEASE','FLEX',null,104500,8708.33,11000,4.87,'Anderson','Un-zoned per listing','FUTURE_SCALE_BASE','SCALE_OPERATIONS','https://www.loopnet.com/Listing/709-Highway-17-Piedmont-SC/42188394/',now(),'Live/work and school attendance require parcel verification; NNN expenses additional.','11,000 SF flex/light manufacturing; 3 drive-ins; Anderson County; listing says un-zoned.'),
('SC_203_JACKSON','203 Jackson Dr, Piedmont, SC 29673','SALE','LAND_MIXED_USE',3200000,null,null,null,20,null,'Listing markets mixed-use; official parcel diligence required','LONG_TERM_LAND_REFERENCE','FUTURE_LAND','https://www.realtor.com/realestateandhomes-detail/203-Jackson-Dr_Piedmont_SC_29673_M58307-49361',now(),'Price is far above current near-term capital position; school zone, permitted uses, utilities, flood/environmental and development economics unverified.','20 acres marketed for residential/commercial/development; useful benchmark for long-term combined-use economics, not a current acquisition recommendation.'),
('SC_673_SANDY_SPRINGS','673 Sandy Springs Rd, Piedmont, SC 29673','LEASE','WAREHOUSE_SUBLEASE',null,48000,4000,4000,null,null,'Not verified','POSSIBLE_STARTER_WAREHOUSE','STARTER_OPERATIONS','https://www.tenantbase.com/us/building/171274',now(),'NNN/expense load, school zone, legal use and current availability require confirmation.','Approx. 4,000 SF warehouse sublease with offices; published $4,000/month plus expenses.'),
('SC_185_EXCHANGE','185 Exchange Logistics Park Dr, Piedmont, SC 29673','LEASE','INDUSTRIAL_FLEX',null,379368,31614,34488,5.15,'Anderson','Industrial / listing sources note no zoning restrictions in park context','TOO_LARGE_NOW_REFERENCE','SCALE_OPERATIONS','https://www.propertyshark.com/cre/commercial-property/us/sc/piedmont/185-exchange-logistics-park-dr/',now(),'Far above current operating scale; live/work likely incompatible with industrial configuration without substantial approvals; verify zoning/occupancy.','Current listing approx. $11/SF/YR NNN, 34,488 SF; useful market comp for future scale.')
on conflict(candidate_key) do update set asking_price=excluded.asking_price,annual_base_rent=excluded.annual_base_rent,monthly_base_rent=excluded.monthly_base_rent,available_sf=excluded.available_sf,lot_acres=excluded.lot_acres,county=excluded.county,zoning_summary=excluded.zoning_summary,dani_fit=excluded.dani_fit,strategic_tier=excluded.strategic_tier,source_url=excluded.source_url,source_checked_at=excluded.source_checked_at,blocker=excluded.blocker,notes=excluded.notes,updated_at=now();
