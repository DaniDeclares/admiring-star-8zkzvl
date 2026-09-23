create table if not exists public.dd_geographies (
 id uuid primary key default gen_random_uuid(),
 geography_type text not null check (geography_type in ('COUNTRY','STATE','MARKET','LOCAL_AREA','ZIP')),
 parent_id uuid references public.dd_geographies(id) on delete restrict,
 code text not null,
 name text not null,
 state_code text,
 status text not null default 'PLANNED' check (status in ('PLANNED','RESEARCHING','LAUNCHING','LAUNCH_READY','ACTIVE','RESTRICTED','PAUSED','NOT_OPEN')),
 notes text,
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now(),
 unique(geography_type,code)
);
create index if not exists idx_dd_geographies_parent on public.dd_geographies(parent_id);
create table if not exists public.dd_market_service_commercial_rules (
 id uuid primary key default gen_random_uuid(),
 geography_id uuid not null references public.dd_geographies(id) on delete restrict,
 service_id uuid references public.services(id) on delete restrict,
 channel_code text not null,
 subchannel_code text,
 availability_status text not null default 'PENDING_RECONCILIATION' check (availability_status in ('AVAILABLE','GATED','QUOTE_REQUIRED','PROVIDER_REQUIRED','REFERRAL','UNAVAILABLE','PENDING_RECONCILIATION')),
 customer_price_type text,
 customer_price_cents integer,
 customer_price_modifier numeric,
 pricing_basis text,
 status text not null default 'PENDING_RECONCILIATION',
 notes text,
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now()
);
create index if not exists idx_dd_market_service_rules_geo on public.dd_market_service_commercial_rules(geography_id);
create index if not exists idx_dd_market_service_rules_service on public.dd_market_service_commercial_rules(service_id);
create table if not exists public.dd_market_provider_economics (
 id uuid primary key default gen_random_uuid(),
 geography_id uuid not null references public.dd_geographies(id) on delete restrict,
 provider_id uuid,
 capability_key text,
 pay_basis text,
 target_pay_cents integer,
 pay_modifier numeric,
 economics_basis text,
 status text not null default 'PENDING_RECONCILIATION',
 notes text,
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now()
);
create index if not exists idx_dd_market_provider_econ_geo on public.dd_market_provider_economics(geography_id);
create index if not exists idx_dd_market_provider_econ_cap on public.dd_market_provider_economics(capability_key);
create table if not exists public.dd_geographic_service_compliance (
 id uuid primary key default gen_random_uuid(),
 geography_id uuid not null references public.dd_geographies(id) on delete restrict,
 service_id uuid references public.services(id) on delete restrict,
 capability_key text,
 eligibility_status text not null default 'PENDING_RECONCILIATION',
 required_license text,
 insurance_requirement text,
 worker_classification_rule text,
 tax_or_fee_rule text,
 notes text,
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now()
);
create index if not exists idx_dd_geo_compliance_geo on public.dd_geographic_service_compliance(geography_id);
comment on table public.dd_geographies is 'National geographic hierarchy: country -> state -> market -> local area -> ZIP. Georgia is initial production market; nationwide expansion is supported without inventing future markets.';
comment on table public.dd_market_service_commercial_rules is 'Market-aware customer commercial availability and pricing layer. Customer pricing may vary by market, channel, and CH01 subchannel.';
comment on table public.dd_market_provider_economics is 'Market-aware provider compensation layer kept separate from customer pricing.';
comment on table public.dd_geographic_service_compliance is 'Geographic service eligibility/compliance layer; restrictions can vary by geography.';
insert into public.dd_geographies (geography_type,code,name,state_code,status,notes) values ('COUNTRY','US','United States',null,'ACTIVE','National architecture authority; market activation is managed below country level.') on conflict (geography_type,code) do update set status=excluded.status,updated_at=now();
insert into public.dd_geographies (geography_type,parent_id,code,name,state_code,status,notes) select 'STATE',id,'GA','Georgia','GA','ACTIVE','Initial production commercial jurisdiction; detailed markets are activated separately.' from public.dd_geographies where geography_type='COUNTRY' and code='US' on conflict (geography_type,code) do update set status=excluded.status,updated_at=now();
insert into public.dd_geographies (geography_type,parent_id,code,name,state_code,status,notes) select 'STATE',id,'SC','South Carolina','SC','PLANNED','Future expansion jurisdiction; not part of current production commercial catalog.' from public.dd_geographies where geography_type='COUNTRY' and code='US' on conflict (geography_type,code) do update set status=excluded.status,updated_at=now();