-- Digital Product Revenue Lane v1
-- Goal: turn reusable DANI know-how/software into measurable sellable products without changing core business focus.
-- No marketplace publishing or paid spend is authorized by this migration.

create table if not exists public.dd_digital_product_experiments_v1 (
  id uuid primary key default gen_random_uuid(),
  product_key text unique not null,
  title text not null,
  product_type text not null check (product_type in ('BROWSER_GAME','DOWNLOADABLE_GAME','MICRO_APP','CALCULATOR','TEMPLATE','DIGITAL_KIT')),
  buyer text not null,
  problem_or_fun text not null,
  hypothesis text not null,
  minimum_price numeric(10,2) not null default 0,
  storefront text,
  storefront_url text,
  build_status text not null default 'IDEA' check (build_status in ('IDEA','SELECTED','BUILDING','QA','SELLABLE','PUBLISHED','PAUSED','KILLED')),
  publish_approval text not null default 'OWNER_REVIEW_REQUIRED',
  impressions bigint not null default 0,
  visits bigint not null default 0,
  checkout_starts bigint not null default 0,
  purchases bigint not null default 0,
  gross_revenue numeric(12,2) not null default 0,
  refunds numeric(12,2) not null default 0,
  evidence jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.dd_digital_product_experiments_v1 enable row level security;
revoke all on public.dd_digital_product_experiments_v1 from anon, authenticated;

insert into public.dd_digital_product_experiments_v1
(product_key,title,product_type,buyer,problem_or_fun,hypothesis,minimum_price,storefront,build_status,evidence)
values
('TURN_DAY_GAME_V1','Turn Day','BROWSER_GAME','cozy/time-management players','Turn a messy apartment into a rent-ready unit under time and budget pressure','A polished 3-5 minute browser loop can validate whether DANI operational knowledge can become entertaining IP',0,'ITCH_IO','SELECTED',jsonb_build_object('priority',1,'launch_model','free_or_donation_first','source','DANI property-turn knowledge')),
('JOB_PROFIT_CALCULATOR_V1','Job Profit Calculator','CALCULATOR','cleaners, mobile service providers and small contractors','Owners quote jobs without seeing labor, travel, materials and margin together','A simple calculator tied to real field-service economics can convert faster than a game because it solves an immediate money problem',9,'ITCH_IO','SELECTED',jsonb_build_object('priority',2,'launch_model','paid_download_or_micro_app')),
('TURN_ESTIMATOR_V1','Property Turn Estimator','MICRO_APP','small landlords, cleaners and property support operators','Turn scopes are hard to price consistently','A guided scope-to-estimate tool can monetize reusable DANI quoting logic without exposing private operational data',19,'ITCH_IO','IDEA',jsonb_build_object('priority',3)),
('FIELD_PHOTO_LOG_KIT_V1','Field Photo Log Kit','DIGITAL_KIT','mobile field service providers','Proof-of-work documentation is inconsistent','A ready-to-use documentation kit can be a low-build-time first digital sale',7,'ITCH_IO','IDEA',jsonb_build_object('priority',4))
on conflict (product_key) do nothing;

create or replace view public.dd_digital_product_scoreboard_v1
with (security_invoker=true) as
select product_key,title,product_type,buyer,minimum_price,storefront,build_status,publish_approval,
       impressions,visits,checkout_starts,purchases,gross_revenue,refunds,
       case when visits > 0 then round((purchases::numeric/visits::numeric)*100,2) else 0 end as visit_to_purchase_pct,
       gross_revenue-refunds as net_revenue,evidence,updated_at
from public.dd_digital_product_experiments_v1;

comment on table public.dd_digital_product_experiments_v1 is
'Canonical measurable experiments for DANI digital products. A product is not launched until discovery, payment/donation where applicable, delivery and measurement are proven.';
