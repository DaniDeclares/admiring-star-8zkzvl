create table if not exists public.dd_catalog_source_artifacts (
 id uuid primary key default gen_random_uuid(),
 artifact_code text not null unique,
 artifact_name text not null,
 artifact_type text not null,
 status text not null default 'AUDIT_SOURCE',
 master_catalog_dependency boolean not null default true,
 notes text,
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now()
);
insert into public.dd_catalog_source_artifacts (artifact_code,artifact_name,artifact_type,status,master_catalog_dependency,notes) values
('ART-RESIDENT-GUIDE','Community Concierge & Resident Life Guide','RESIDENT_GUIDE','AUDIT_SOURCE',true,'Use as service/catalog evidence before final resident materials are printed.'),
('ART-RESIDENT-WELCOME','Resident Welcome Packet','RESIDENT_WELCOME_PACKET','AUDIT_SOURCE',true,'Use as service/catalog evidence before final resident materials are printed.'),
('ART-VENDOR-PACKET','DANI DECLARES Vendor Packet','VENDOR_PACKET','AUDIT_SOURCE',true,'Use as service/catalog evidence before final vendor materials are printed.'),
('ART-PROVIDER-NETWORK','DANI DECLARES Provider Network Master','PROVIDER_EVIDENCE','AUDIT_SOURCE',true,'Provider service menus and qualification evidence feed master service reconciliation.')
on conflict (artifact_code) do update set artifact_name=excluded.artifact_name,artifact_type=excluded.artifact_type,status=excluded.status,master_catalog_dependency=excluded.master_catalog_dependency,updated_at=now();
insert into public.dd_geographies (geography_type,parent_id,code,name,state_code,status,notes)
select 'MARKET',g.id,v.code,v.name,'GA','RESEARCHING','Recovered Georgia target market from Master pricing architecture; exact service-specific market prices are only entered where source evidence exists.'
from public.dd_geographies g cross join (values
('JONESBORO','Jonesboro'),('TUCKER','Tucker'),('STONE_MOUNTAIN','Stone Mountain'),('CHAMBLEE','Chamblee'),('BROOKHAVEN','Brookhaven'),('MIDTOWN','Midtown'),('BUCKHEAD','Buckhead')) v(code,name)
where g.geography_type='STATE' and g.code='GA'
on conflict (geography_type,code) do update set name=excluded.name,state_code=excluded.state_code,updated_at=now();
insert into public.dd_market_service_commercial_rules (geography_id,service_id,channel_code,subchannel_code,customer_price_type,customer_price_cents,pricing_basis,status,notes)
select g.id,s.id,v.channel_code,v.subchannel_code,'FIXED',v.price_cents,'Master pricing architecture - market-specific mattress schedule','PENDING_RECONCILIATION','Source-derived market price; retain as evidence until the service-level commercial reconciliation formally locks the price.'
from (values
('JONESBORO','CH02',null,5000),('JONESBORO','CH01','CH01-B',4000),('JONESBORO','CH03',null,4000),('JONESBORO','CH04',null,5500),
('TUCKER','CH02',null,5500),('TUCKER','CH01','CH01-B',4500),('TUCKER','CH03',null,4500),('TUCKER','CH04',null,6000),
('STONE_MOUNTAIN','CH02',null,6000),('STONE_MOUNTAIN','CH01','CH01-B',5000),('STONE_MOUNTAIN','CH03',null,5000),('STONE_MOUNTAIN','CH04',null,6500),
('CHAMBLEE','CH02',null,6500),('CHAMBLEE','CH01','CH01-B',5500),('CHAMBLEE','CH03',null,5500),('CHAMBLEE','CH04',null,7000),
('BROOKHAVEN','CH02',null,7500),('BROOKHAVEN','CH01','CH01-B',6500),('BROOKHAVEN','CH03',null,6500),('BROOKHAVEN','CH04',null,8000),
('MIDTOWN','CH02',null,8500),('MIDTOWN','CH01','CH01-B',7500),('MIDTOWN','CH03',null,7500),('MIDTOWN','CH04',null,9000),
('BUCKHEAD','CH02',null,10000),('BUCKHEAD','CH01','CH01-B',8500),('BUCKHEAD','CH03',null,8500),('BUCKHEAD','CH04',null,10500)
) v(market_code,channel_code,subchannel_code,price_cents)
join public.dd_geographies g on g.geography_type='MARKET' and g.code=v.market_code
join public.services s on s.sku='DNI-01A-038';