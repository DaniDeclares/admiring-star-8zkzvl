-- CH02 strategy contract v1
-- Locks the research-derived channel strategy without promoting candidate
-- service prices or micro-services to public storefront authority.

create table if not exists public.dd_channel_strategy_contracts (
  id uuid primary key default gen_random_uuid(),
  channel_code text not null references public.dd_commercial_channels(code),
  contract_version text not null,
  status text not null default 'LOCKED',
  primary_role text not null,
  front_door_offers jsonb not null default '[]'::jsonb,
  supporting_layers jsonb not null default '[]'::jsonb,
  buyer_architecture jsonb not null default '[]'::jsonb,
  icp jsonb not null default '{}'::jsonb,
  compliance_gates jsonb not null default '[]'::jsonb,
  service_family_architecture jsonb not null default '[]'::jsonb,
  emergency_framework jsonb not null default '{}'::jsonb,
  commercial_rules jsonb not null default '{}'::jsonb,
  sales_funnel jsonb not null default '[]'::jsonb,
  release_checklist jsonb not null default '[]'::jsonb,
  deferred_items jsonb not null default '[]'::jsonb,
  source_basis text not null,
  effective_date date not null default current_date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(channel_code, contract_version)
);

alter table public.dd_channel_strategy_contracts enable row level security;
drop policy if exists "channel strategy contracts deny public" on public.dd_channel_strategy_contracts;
create policy "channel strategy contracts deny public"
on public.dd_channel_strategy_contracts
for all to anon, authenticated
using (false)
with check (false);

insert into public.dd_channel_strategy_contracts (
  channel_code, contract_version, status, primary_role,
  front_door_offers, supporting_layers, buyer_architecture, icp,
  compliance_gates, service_family_architecture, emergency_framework,
  commercial_rules, sales_funnel, release_checklist, deferred_items, source_basis
) values (
  'CH02','2026-09-20.v1','LOCKED',
  'B2B property-operations service partner',
  '[
    {"code":"CH02-F01","name":"Turnover & Make-Ready","role":"primary acquisition wedge"},
    {"code":"CH02-F02","name":"Property Rescue / Field Dispatch","role":"secondary acquisition wedge"},
    {"code":"CH02-F03","name":"Property Condition & Documentation","role":"secondary acquisition wedge"},
    {"code":"CH02-F04","name":"Office / Operations Rescue","role":"fourth acquisition wedge"}
  ]'::jsonb,
  '[
    {"name":"Logistics","role":"fulfillment capability"},
    {"name":"Vendor coordination","role":"fulfillment capability"},
    {"name":"Recurring support","role":"expansion path"},
    {"name":"Cross-sells","role":"supporting commercial layer"},
    {"name":"Backend components","role":"hidden execution layer"}
  ]'::jsonb,
  '[
    {"role":"Property Manager","buys":["turns","field visits","documentation","small-job dispatch"]},
    {"role":"Regional Manager / Director","buys":["portfolio support","recurring services","vendor coordination","turn management"]},
    {"role":"Maintenance Director","buys":["overflow labor","supply logistics","failed-turn rescue"]},
    {"role":"Asset / Capital Projects","buys":["post-construction detail","property condition documentation","project support"]},
    {"role":"Corporate Operations / Compliance","buys":["vendor files","administrative cleanup","documentation"]}
  ]'::jsonb,
  '{
    "primary_market":"Metro Atlanta multifamily operators",
    "unit_range":"100-5000+",
    "characteristics":["multiple communities","recurring unit turnover","maintenance/vendor coordination burden","formal vendor onboarding","conventional or BTR housing"],
    "expansion_markets":["Greenville-Spartanburg","Columbia","Charleston"]
  }'::jsonb,
  '[
    {"gate":"jurisdiction","required":true},
    {"gate":"work_type","required":true},
    {"gate":"license_required","required":true},
    {"gate":"self_perform_or_subcontract","required":true},
    {"gate":"provider_credential_status","required":true},
    {"gate":"insurance_requirement","required":true},
    {"gate":"authorization_threshold","required":true},
    {"gate":"site_access","required":true},
    {"gate":"pre_1978_trigger","required":true},
    {"gate":"RRP_or_other_specialty_requirement","required":"when applicable"}
  ]'::jsonb,
  '[
    {"code":"CH02-SF01","name":"Unit Turns & Make-Ready","buyer_outcome":"faster rent-ready units"},
    {"code":"CH02-SF02","name":"Maintenance & Field Support","buyer_outcome":"additional execution capacity"},
    {"code":"CH02-SF03","name":"Property Condition & Inspections","buyer_outcome":"visibility and documented condition"},
    {"code":"CH02-SF04","name":"Common Areas & Property Presentation","buyer_outcome":"property appearance and readiness"},
    {"code":"CH02-SF05","name":"Resident Experience Support","buyer_outcome":"service execution without another internal team"},
    {"code":"CH02-SF06","name":"Property Logistics & Emergency Response","buyer_outcome":"field issue handling when site team cannot"}
  ]'::jsonb,
  '{
    "trigger":"What happened?","response":"What needs to happen now?","authority":"Who authorized it?",
    "site_access":"Who can enter?","scope":"What can DANI perform?","coordination":"What requires another provider?",
    "evidence":"What must be documented?","closeout":"What does the property manager receive?",
    "commercial":"Fixed / starting / SOW / rush / pass-through?"
  }'::jsonb,
  '{
    "pricing_state":"candidate_until_adjudicated",
    "required_sequence":["scope validation","cost model","provider capacity","margin","geography","rush rules","final locked price"],
    "principle":"Do not hide major variable trades inside low flat-rate turn SKUs",
    "recurring_path":["one-time diagnostic","one-time execution","repeat jobs","property-level recurring support","portfolio agreement"]
  }'::jsonb,
  '["Prospect","Property / portfolio identified","Operational pain identified","Entry service selected","Scope qualified","Quote/SOW","Commercial approval","Portal/account","Payment","Dispatch","Evidence","Closeout","Repeat/retainer opportunity"]'::jsonb,
  '["CH02 Channel Contract","Final 4 front-door offers","Backend component map","Cross-sell map","Emergency framework","Buyer/ICP map","Compliance matrix","Pricing adjudication queue","Provider capability requirements","CH02 sales funnel","Release checklist"]'::jsonb,
  '[
    {"item":"STR turnover","status":"DEFER"},
    {"item":"Post-construction detail","status":"FUTURE_HIGH_VALUE_EXPANSION"},
    {"item":"Broad regulated-trade offerings","status":"DEFER"},
    {"item":"Positioning DANI as property manager","status":"PROHIBITED_UNLESS_LICENSED_STRUCTURE_EXISTS"},
    {"item":"New database","status":"DEFER"},
    {"item":"Every micro-service as customer-facing","status":"DEFER"}
  ]'::jsonb,
  'September 20, 2026 CH02 research baseline + CH02 adjudication document; source-derived architecture retained without promoting candidate pricing to final.'
)
on conflict (channel_code, contract_version) do update set
  status=excluded.status,
  primary_role=excluded.primary_role,
  front_door_offers=excluded.front_door_offers,
  supporting_layers=excluded.supporting_layers,
  buyer_architecture=excluded.buyer_architecture,
  icp=excluded.icp,
  compliance_gates=excluded.compliance_gates,
  service_family_architecture=excluded.service_family_architecture,
  emergency_framework=excluded.emergency_framework,
  commercial_rules=excluded.commercial_rules,
  sales_funnel=excluded.sales_funnel,
  release_checklist=excluded.release_checklist,
  deferred_items=excluded.deferred_items,
  source_basis=excluded.source_basis,
  updated_at=now();
