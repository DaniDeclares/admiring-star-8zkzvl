-- Revive and extend the existing governed research engine for the Summer 2027 land + dual-business goal.
-- History-first: this does not create a second scheduler. It extends the existing dani-research-engine cron.
-- No application submission, borrowing, entity formation, external publishing, or money movement is authorized here.

create table if not exists public.dd_land_capital_research_directives_v1 (
  directive_key text primary key,
  objective text not null,
  target_date date not null,
  research_scope jsonb not null default '[]'::jsonb,
  ranking_dimensions jsonb not null default '[]'::jsonb,
  authority_limits jsonb not null default '{}'::jsonb,
  state text not null default 'ACTIVE',
  last_researched_at timestamptz,
  next_research_due_at timestamptz,
  evidence jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.dd_land_capital_research_directives_v1 enable row level security;
revoke all on table public.dd_land_capital_research_directives_v1 from anon, authenticated;

insert into public.dd_land_capital_research_directives_v1 (
  directive_key, objective, target_date, research_scope, ranking_dimensions, authority_limits,
  state, next_research_due_at, evidence, updated_at
) values (
  'SUMMER_2027_LAND_DUAL_BUSINESS_V1',
  'Find and continuously improve the fastest credible route to appropriate Georgia land control plus healthy DANI DECLARES, Shadow & Sol, and legitimate agricultural operations by summer 2027.',
  date '2027-06-21',
  jsonb_build_array(
    'USDA FSA farm ownership and operating finance, including beginning-farmer routes',
    'USDA NRCS EQIP/CSP/RCPP/ACEP conservation and land-readiness routes',
    'USDA NIFA, AMS and Rural Development grants and producer programs',
    'Georgia agriculture, conservation, rural development and beginning-farmer programs',
    'American Farmland Trust and reputable private farm viability/agritourism capital',
    'Farm to Stay and other farm-stay/agritourism programs',
    'land tenure, zoning, soils, water, septic, access, insurance and farm-number prerequisites',
    'farm production, agritourism, workshops, U-pick, farm-to-table, lodging and experience revenue models',
    'Shadow & Sol nonprofit education/stewardship/community-program revenue and eligible funding',
    'DANI DECLARES commercial service, facilities, field-ops, admin, events and property-support fit',
    'entity separation, contracts, accounting controls and anti-commingling design',
    'land purchase, lease, lease-option, seller finance and other lawful control structures',
    'underwriting, cash/down-payment requirements, debt service, operating capital and evidence readiness',
    'application calendars, batching deadlines, webinars and time-sensitive prerequisites',
    'parcel-specific capital stack and Summer 2027 execution feasibility'
  ),
  jsonb_build_array(
    'time_to_land_control','cash_required','probability','debt_service','grant_dependency',
    'revenue_start_speed','family_homestead_fit','shadow_and_sol_mission_fit','dani_commercial_fit',
    'agricultural_viability','zoning_and_permitting_risk','infrastructure_cost','reversible_risk','evidence_strength'
  ),
  jsonb_build_object(
    'research_only', true,
    'owner_approval_required_for_application', true,
    'owner_approval_required_for_debt', true,
    'owner_approval_required_for_entity_changes', true,
    'owner_approval_required_for_money_movement', true,
    'no_eligibility_claim_without_evidence', true,
    'history_first', true,
    'reuse_existing_research_engine', true
  ),
  'ACTIVE',
  now(),
  jsonb_build_object(
    'revived_lane', true,
    'existing_usda_work_connected', true,
    'known_program_families', jsonb_build_array('FSA_FARM_LOANS','NRCS_CONSERVATION','NIFA_GRANT','AMS_LOCAL_FOOD','RURAL_DEVELOPMENT','PRIVATE_FARM_VIABILITY','AGRITOURISM'),
    'farm_to_stay', jsonb_build_object('state','PENDING_GUIDELINES','expected_open','late November 2026','award_range','$5,000-$10,000','official_source','https://farmland.org/farm-to-stay')
  ),
  now()
)
on conflict (directive_key) do update set
  objective = excluded.objective,
  target_date = excluded.target_date,
  research_scope = excluded.research_scope,
  ranking_dimensions = excluded.ranking_dimensions,
  authority_limits = excluded.authority_limits,
  state = 'ACTIVE',
  next_research_due_at = least(coalesce(public.dd_land_capital_research_directives_v1.next_research_due_at, now()), now()),
  evidence = public.dd_land_capital_research_directives_v1.evidence || excluded.evidence,
  updated_at = now();

create or replace function private.dd_enqueue_land_capital_research_v1()
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_key text;
  v_url text;
  v_directive jsonb;
begin
  select to_jsonb(d) into v_directive
  from public.dd_land_capital_research_directives_v1 d
  where d.directive_key = 'SUMMER_2027_LAND_DUAL_BUSINESS_V1'
    and d.state = 'ACTIVE'
    and coalesce(d.next_research_due_at, now()) <= now();

  if v_directive is null then return; end if;

  select decrypted_secret into v_key
  from vault.decrypted_secrets where name = 'dd_research_anon_key' limit 1;
  select decrypted_secret into v_url
  from vault.decrypted_secrets where name = 'dd_research_function_url' limit 1;
  if v_key is null or v_url is null then return; end if;

  perform net.http_post(
    url := v_url,
    headers := jsonb_build_object('Content-Type','application/json','Authorization','Bearer ' || v_key,'apikey',v_key),
    body := jsonb_build_object(
      'source','supabase_pg_cron',
      'triggered_at',now(),
      'research_lane','SUMMER_2027_LAND_DUAL_BUSINESS_V1',
      'directive',v_directive,
      'instruction','Research current evidence across every listed scope; compare routes and update only material findings, deadlines, blockers, parcel implications, capital-stack options and recommended next actions. Recover and extend existing USDA/FSA/NRCS/NIFA/AMS/RD work rather than creating a parallel system. Do not claim eligibility without evidence and do not submit, borrow, form entities, publish externally or move money.'
    ),
    timeout_milliseconds := 20000
  );

  update public.dd_land_capital_research_directives_v1
  set last_researched_at = now(),
      next_research_due_at = now() + interval '24 hours',
      updated_at = now()
  where directive_key = 'SUMMER_2027_LAND_DUAL_BUSINESS_V1';
end;
$$;

revoke all on function private.dd_enqueue_land_capital_research_v1() from public, anon, authenticated;

-- Reuse the existing research scheduler; add a dedicated daily deep pass in code/database, not ChatGPT tasks.
select cron.unschedule(jobid) from cron.job where jobname = 'dani-land-capital-research-daily';
select cron.schedule(
  'dani-land-capital-research-daily',
  '17 9 * * *',
  $$select private.dd_enqueue_land_capital_research_v1();$$
);

comment on table public.dd_land_capital_research_directives_v1 is
'Governed research directives extending the existing DANI research engine. Summer 2027 land/business lane is research-only until owner-gated actions are explicitly approved.';
