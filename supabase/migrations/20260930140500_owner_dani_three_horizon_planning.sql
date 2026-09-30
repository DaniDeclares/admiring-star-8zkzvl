-- OWNER DANI human planning horizons: weekly, monthly, long-term. Reuses Brain objectives and owner attention; preserves entity boundaries.

create table if not exists public.dd_owner_horizon_objectives(
 id uuid primary key default gen_random_uuid(), owner_person_key text not null default 'WORLD_DANIELLE_HUMAN',
 horizon text not null check(horizon in ('WEEKLY','MONTHLY','LONG_TERM')), objective_key text not null references public.dd_brain_objectives(objective_key),
 rank integer not null default 100, active boolean not null default true, rationale text, metadata jsonb not null default '{}'::jsonb,
 created_at timestamptz not null default now(), updated_at timestamptz not null default now(), unique(owner_person_key,horizon,objective_key));
alter table public.dd_owner_horizon_objectives enable row level security;
revoke all on public.dd_owner_horizon_objectives from public,anon,authenticated;
grant select,insert,update,delete on public.dd_owner_horizon_objectives to service_role;

create table if not exists public.dd_owner_problem_inbox(
 id uuid primary key default gen_random_uuid(), owner_person_key text not null default 'WORLD_DANIELLE_HUMAN', problem_statement text not null,
 source_context text, urgency text not null default 'NORMAL' check(urgency in ('CRITICAL','HIGH','NORMAL','LOW')),
 status text not null default 'OPEN' check(status in ('OPEN','CLASSIFIED','RESOLVED','HELD')), classified_horizons text[] not null default '{}'::text[],
 primary_horizon text check(primary_horizon is null or primary_horizon in ('WEEKLY','MONTHLY','LONG_TERM')), linked_objective_keys text[] not null default '{}'::text[],
 company_implications jsonb not null default '{}'::jsonb, personal_implications jsonb not null default '{}'::jsonb, classification_reason text,
 metadata jsonb not null default '{}'::jsonb, created_at timestamptz not null default now(), updated_at timestamptz not null default now(), resolved_at timestamptz);
alter table public.dd_owner_problem_inbox enable row level security;
revoke all on public.dd_owner_problem_inbox from public,anon,authenticated;
grant select,insert,update,delete on public.dd_owner_problem_inbox to service_role;
create policy dd_owner_horizon_objectives_service_role_all on public.dd_owner_horizon_objectives for all to service_role using (true) with check (true);
create policy dd_owner_problem_inbox_service_role_all on public.dd_owner_problem_inbox for all to service_role using (true) with check (true);

insert into public.dd_owner_horizon_objectives(horizon,objective_key,rank,rationale,metadata)
select x.horizon,x.objective_key,x.rank,x.rationale,jsonb_build_object('source','OWNER_DANI_THREE_HORIZON_MODEL','preserve_entity_boundaries',true)
from (values
 ('WEEKLY','NEAR_TERM_REVENUE_AND_STABILITY',10,'Immediate collected revenue and stability must drive this week''s operating priorities.'),
 ('WEEKLY','OWNER_TIME_LEVERAGE',20,'This week''s repeated work should be automated or routed so urgent execution does not consume all owner time.'),
 ('MONTHLY','DECEMBER_18_HOUSING_STABILITY',10,'Monthly capital and operating decisions must improve the December housing transition path.'),
 ('MONTHLY','DANI_DURABLE_BUSINESS',20,'Monthly work should convert urgent selling into repeatable profitable operations.'),
 ('LONG_TERM','INTERGENERATIONAL_WEALTH_AND_LEGACY',10,'Long-term decisions should build durable family wealth and legacy without sacrificing current stability.'),
 ('LONG_TERM','LAND_ACQUISITION_DESTINATION',20,'Long-term capital strategy should improve feasibility of owned land and the family compound/homestead.'),
 ('LONG_TERM','TRUST_AND_ESTATE_READINESS',30,'Long-term wealth should mature toward professionally designed estate and trust readiness.'),
 ('LONG_TERM','SHADOW_SOL_DURABLE_MISSION',40,'Long-term planning should preserve Shadow & Sol as a separate mission-centered organization.')
) x(horizon,objective_key,rank,rationale)
on conflict(owner_person_key,horizon,objective_key) do update set rank=excluded.rank,rationale=excluded.rationale,active=true,metadata=excluded.metadata,updated_at=now();

CREATE OR REPLACE FUNCTION public.dd_get_owner_horizon_context(p_owner_person_key text DEFAULT 'WORLD_DANIELLE_HUMAN'::text)
 RETURNS jsonb
 LANGUAGE sql
 SET search_path TO 'public', 'pg_temp'
AS $function$
 select jsonb_build_object(
  'owner_person_key',p_owner_person_key,
  'weekly',coalesce((select jsonb_agg(jsonb_build_object('objective_key',h.objective_key,'objective',b.objective,'success_definition',b.success_definition,'rank',h.rank,'rationale',h.rationale) order by h.rank) from public.dd_owner_horizon_objectives h join public.dd_brain_objectives b using(objective_key) where h.owner_person_key=p_owner_person_key and h.horizon='WEEKLY' and h.active and b.active),'[]'::jsonb),
  'monthly',coalesce((select jsonb_agg(jsonb_build_object('objective_key',h.objective_key,'objective',b.objective,'success_definition',b.success_definition,'rank',h.rank,'rationale',h.rationale) order by h.rank) from public.dd_owner_horizon_objectives h join public.dd_brain_objectives b using(objective_key) where h.owner_person_key=p_owner_person_key and h.horizon='MONTHLY' and h.active and b.active),'[]'::jsonb),
  'long_term',coalesce((select jsonb_agg(jsonb_build_object('objective_key',h.objective_key,'objective',b.objective,'success_definition',b.success_definition,'rank',h.rank,'rationale',h.rationale) order by h.rank) from public.dd_owner_horizon_objectives h join public.dd_brain_objectives b using(objective_key) where h.owner_person_key=p_owner_person_key and h.horizon='LONG_TERM' and h.active and b.active),'[]'::jsonb),
  'open_problems',coalesce((select jsonb_agg(jsonb_build_object('id',i.id,'problem',i.problem_statement,'urgency',i.urgency,'primary_horizon',i.primary_horizon,'horizons',i.classified_horizons,'linked_objectives',i.linked_objective_keys,'company_implications',i.company_implications,'personal_implications',i.personal_implications,'reason',i.classification_reason) order by case i.urgency when 'CRITICAL' then 1 when 'HIGH' then 2 when 'NORMAL' then 3 else 4 end,i.created_at) from public.dd_owner_problem_inbox i where i.owner_person_key=p_owner_person_key and i.status in ('OPEN','CLASSIFIED')),'[]'::jsonb)
 )
$function$
;

CREATE OR REPLACE FUNCTION public.dd_world_generate_owner_brief()
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'pg_temp'
AS $function$
declare v jsonb; v_horizons jsonb;
begin
 select public.dd_get_owner_horizon_context('WORLD_DANIELLE_HUMAN') into v_horizons;
 v:=jsonb_build_object(
 'owner_person_key','WORLD_DANIELLE_HUMAN',
 'planning_horizons',v_horizons,
 'dani',jsonb_build_object('operator_items',(select count(*) from dd_world_operator_decision_ledger where entity_scope='DANI_DECLARES'),'career_people',(select count(*) from dd_world_career_states where entity_scope='DANI_DECLARES')),
 'shadow_sol',jsonb_build_object('operator_items',(select count(*) from dd_world_operator_decision_ledger where entity_scope='SHADOW_AND_SOL'),'career_people',(select count(*) from dd_world_career_states where entity_scope='SHADOW_AND_SOL')),
 'family',jsonb_build_object('modeled_members',(select count(*) from dd_world_family_household where active),'objectives',jsonb_build_array('stability','time','education','opportunity','land','wealth','legacy')),
 'cross_entity',jsonb_build_object('conflict_review_items',(select count(*) from dd_world_operator_decision_ledger where cross_entity and conflict_review_required),'rule','Whole-life owner receives both views but cannot erase entity boundaries.'));
 insert into dd_world_owner_brief(brief_key,dani_state,shadow_sol_state,family_state,cross_entity_state,tensions,opportunities)
 values('OWNER_BRIEF:'||to_char(now(),'YYYY-MM-DD'),
 (v->'dani')||jsonb_build_object('owner_horizon_context',v_horizons),
 v->'shadow_sol',
 (v->'family')||jsonb_build_object('owner_horizon_context',v_horizons),
 v->'cross_entity',
 jsonb_build_array('Optimize urgent weekly stability without consuming monthly operating runway or long-term family assets.','Preserve separate DANI and Shadow & Sol economics, authority, accounting and conflicts.'),
 jsonb_build_array('Route immediate cash problems toward governed DANI revenue actions.','Use monthly decisions to turn urgent sales into repeatable operating capacity.','Use long-term decisions to compound family wealth, land feasibility and durable mission capacity.'))
 on conflict(brief_key) do update set generated_at=now(),dani_state=excluded.dani_state,shadow_sol_state=excluded.shadow_sol_state,family_state=excluded.family_state,cross_entity_state=excluded.cross_entity_state,tensions=excluded.tensions,opportunities=excluded.opportunities;
 return v;
end $function$
;

CREATE OR REPLACE FUNCTION public.dd_refresh_owner_horizon_attention()
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'pg_temp'
AS $function$
declare v_added int:=0;
begin
 if current_user not in ('postgres','service_role') then raise exception 'service_role required'; end if;
 with src as (
  select i.id,i.problem_statement,i.urgency,i.primary_horizon,i.classified_horizons,i.linked_objective_keys,i.classification_reason
  from public.dd_owner_problem_inbox i where i.owner_person_key='WORLD_DANIELLE_HUMAN' and i.status in ('OPEN','CLASSIFIED') and i.urgency in ('CRITICAL','HIGH')
 ), ins as (
  insert into public.dd_owner_attention_queue(domain,source_table,source_record_id,reason,priority,status,recommended_action,metadata)
  select 'OWNER_HORIZON', 'dd_owner_problem_inbox', s.id::text,
   s.problem_statement,
   case when s.urgency='CRITICAL' then 'P0' else 'P1' end,
   'OPEN',
   'Prioritize actions that resolve the primary horizon while preserving linked monthly/long-term objectives and entity boundaries.',
   jsonb_build_object('primary_horizon',s.primary_horizon,'classified_horizons',s.classified_horizons,'linked_objective_keys',s.linked_objective_keys,'classification_reason',s.classification_reason,'owner_person_key','WORLD_DANIELLE_HUMAN')
  from src s where not exists(select 1 from public.dd_owner_attention_queue q where q.status='OPEN' and q.source_table='dd_owner_problem_inbox' and q.source_record_id=s.id::text)
  returning 1
 ) select count(*) into v_added from ins;
 return jsonb_build_object('status','COMPLETED','attention_added',v_added,'production_mutation',false,'money_action',false,'external_contact',false);
end $function$
;

CREATE OR REPLACE FUNCTION public.dd_run_autonomous_body_closure_cycle()
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'pg_temp'
AS $function$
declare
 v_work jsonb; v_operating jsonb; v_external jsonb; v_research jsonb; v_synthesis jsonb; v_delivery jsonb; v_source_coverage jsonb; v_directives jsonb; v_owner_horizons jsonb;
 v_safe_recipe uuid; v_advance jsonb; v_audit jsonb; v_safe uuid; v_health uuid; v_automation_health uuid; v_workforce jsonb; v_organism jsonb; v_world_match jsonb;
begin
 select public.dd_refresh_remaining_work_queue() into v_work;
 select public.dd_consume_internal_scheduled_operating_work(10) into v_operating;
 select public.dd_dispatch_external_scheduled_operating_work(20) into v_external;
 select public.dd_reconcile_source_discovery_coverage() into v_source_coverage;
 select public.dd_execute_research_work_v1(8) into v_research;
 select public.dd_refresh_owner_horizon_attention() into v_owner_horizons;
 select public.dd_type_reverify_research_directives() into v_directives;
 select public.dd_run_research_synthesis_worker() into v_synthesis;
 select public.dd_reconcile_world_service_match_research(100) into v_world_match;
 select public.dd_run_synthetic_workforce_machine_economics(100) into v_workforce;
 select public.dd_run_dani_brain_delivery_worker(10,'AUTONOMOUS_BODY_CLOSURE') into v_delivery;
 select public.dd_run_safe_automation_recipes() into v_safe_recipe;
 select public.dd_run_ecosystem_candidate_advancement_controller(50) into v_advance;
 select public.dd_run_active_audit_subproofs(50) into v_audit;
 select public.dd_run_next_safe_runtime_proof() into v_safe;
 select public.dd_run_core_runtime_health_proof() into v_health;
 select public.dd_run_automation_health_supervisor() into v_automation_health;
 select public.dd_refresh_remaining_work_queue() into v_work;
 select public.dd_run_end_to_end_organism_audit() into v_organism;
 return jsonb_build_object('status','COMPLETED','remaining_work_refresh',v_work,'scheduled_operating_work',v_operating,
   'external_operating_handoff',v_external,'source_discovery_reconciliation',v_source_coverage,'research_execution',v_research,'owner_horizon_attention',v_owner_horizons,'research_directive_typing',v_directives,'research_synthesis',v_synthesis,'world_service_match_reconciliation',v_world_match,
   'synthetic_workforce_machine_economics',v_workforce,'brain_delivery',v_delivery,'safe_automation_recipe_receipt',v_safe_recipe,
   'candidate_advancement',v_advance,'audit_subproofs',v_audit,'safe_runtime_receipt',v_safe,
   'runtime_health_receipt',v_health,'automation_handoff_health_receipt',v_automation_health,'end_to_end_organism_audit',v_organism,
   'composition_policy','REUSE_EXISTING_WORKERS','production_mutation_authorized',false,
   'external_contact_authorized',false,'money_action_authorized',false);
end $function$
;
revoke execute on function public.dd_get_owner_horizon_context(text) from public,anon,authenticated;
grant execute on function public.dd_get_owner_horizon_context(text) to service_role;
revoke execute on function public.dd_world_generate_owner_brief() from public,anon,authenticated;
grant execute on function public.dd_world_generate_owner_brief() to service_role;
revoke execute on function public.dd_refresh_owner_horizon_attention() from public,anon,authenticated;
grant execute on function public.dd_refresh_owner_horizon_attention() to service_role;
