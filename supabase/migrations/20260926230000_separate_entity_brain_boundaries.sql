-- Tester-only entity brain boundary repair.
-- DANI DECLARES and Shadow & Sol are separate entities.
-- Shared Base-of-Bases reality may inform both, but generic brain processing cannot auto-seed either entity.

create table if not exists public.dd_entity_boundary_policy (
  entity_key text primary key,
  entity_name text not null,
  brain_scope text not null,
  research_scope text not null,
  build_scope text not null,
  operations_scope text not null,
  shared_reality_read_allowed boolean not null default true,
  cross_entity_auto_seed_allowed boolean not null default false,
  explicit_inter_entity_relationship_required boolean not null default true,
  production_authority boolean not null default false,
  status text not null default 'ACTIVE',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.dd_entity_boundary_policy enable row level security;
revoke all on public.dd_entity_boundary_policy from anon, authenticated;
grant select on public.dd_entity_boundary_policy to service_role;

insert into public.dd_entity_boundary_policy(entity_key,entity_name,brain_scope,research_scope,build_scope,operations_scope,metadata)
values
('DANI_DECLARES','DANI DECLARES LLC','DANI_DECLARES','DANI_DECLARES','DANI_DECLARES','DANI_DECLARES','{"environment":"TESTER","shared_layer":"BASE_OF_BASES_REALITY"}'::jsonb),
('SHADOW_AND_SOL','Shadow & Sol','SHADOW_AND_SOL','SHADOW_AND_SOL','SHADOW_AND_SOL','SHADOW_AND_SOL','{"environment":"TESTER","shared_layer":"BASE_OF_BASES_REALITY"}'::jsonb)
on conflict(entity_key) do update set cross_entity_auto_seed_allowed=false,explicit_inter_entity_relationship_required=true,updated_at=now();

update public.dd_brain_objectives
set active=false,metadata=coalesce(metadata,'{}'::jsonb)||'{"superseded_by_entity_boundary_policy":true,"superseded_reason":"OWNER_CONFIRMED_SEPARATE_ENTITIES_20260926"}'::jsonb,updated_at=now()
where objective_key in ('FAMILY_ECOSYSTEM','CROSS_ENTITY_SYNERGY');

update public.dd_brain_objectives set parent_objective_key=null,updated_at=now()
where objective_key in ('DANI_DURABLE_BUSINESS','SHADOW_SOL_DURABLE_MISSION');

create or replace function public.dd_seed_dani_brain_builds()
returns jsonb language plpgsql set search_path to 'public' as $$
declare v_service int:=0;
begin
 if not exists(select 1 from dd_entity_boundary_policy where entity_key='DANI_DECLARES' and status='ACTIVE' and cross_entity_auto_seed_allowed=false) then
  return jsonb_build_object('status','BLOCKED','reason','ENTITY_BOUNDARY_POLICY_MISSING');
 end if;
 insert into dd_ecosystem_build_candidates(candidate_key,entity_scope,candidate_type,title,source_type,source_reference,lifecycle_state,hypothesis)
 select 'DANI:SERVICE:'||candidate_key,'DANI_DECLARES','SERVICE',service_name,'SERVICE_DISCOVERY',candidate_key,'RESEARCH_PASS_1',
 jsonb_build_object('adjacency_reason',adjacency_reason,'channels',proposed_channels,'activation_prohibited',true,'entity_boundary','DANI_ONLY')
 from dd_service_discovery_candidates on conflict(candidate_key) do nothing;
 get diagnostics v_service=row_count;
 return jsonb_build_object('status','COMPLETED','entity','DANI_DECLARES','candidates_created',v_service,'production_mutation',false);
end $$;

create or replace function public.dd_seed_shadow_sol_brain_builds()
returns jsonb language plpgsql set search_path to 'public' as $$
declare v_shadow int:=0;
begin
 if not exists(select 1 from dd_entity_boundary_policy where entity_key='SHADOW_AND_SOL' and status='ACTIVE' and cross_entity_auto_seed_allowed=false) then
  return jsonb_build_object('status','BLOCKED','reason','ENTITY_BOUNDARY_POLICY_MISSING');
 end if;
 insert into dd_ecosystem_build_candidates(candidate_key,entity_scope,candidate_type,title,source_type,source_reference,lifecycle_state,hypothesis)
 select 'SS:RESEARCH:'||work_key,'SHADOW_AND_SOL',
 case when question ilike '%educator%' or question ilike '%teacher%' then 'EDUCATOR_CREATOR_MODEL'
      when question ilike '%customer%' or question ilike '%student%' then 'CUSTOMER_PROGRAM_MODEL'
      when question ilike '%land%' or question ilike '%glamp%' then 'LAND_EXPERIENCE_MODEL'
      else 'PROGRAM_OR_OPERATING_MODEL' end,
 left(question,240),'RESEARCH_WORK',work_key,'RESEARCH_PASS_1',
 jsonb_build_object('program_key',program_key,'required_evidence',required_evidence,'owner_decision_required',owner_decision_required,'entity_boundary','SHADOW_SOL_ONLY')
 from dd_research_work_queue where program_key='ENTITY_ARCHITECTURE'
 on conflict(candidate_key) do nothing;
 get diagnostics v_shadow=row_count;
 return jsonb_build_object('status','COMPLETED','entity','SHADOW_AND_SOL','candidates_created',v_shadow,'production_mutation',false);
end $$;

create or replace function public.dd_seed_ecosystem_brain_builds()
returns jsonb language plpgsql set search_path to 'public' as $$
begin
 return jsonb_build_object('status','BLOCKED','reason','CROSS_ENTITY_AUTO_SEED_DISABLED',
 'required_interface','EXPLICIT_ENTITY_SPECIFIC_SEEDER_OR_GOVERNED_INTER_ENTITY_RELATIONSHIP',
 'dani_seeder','dd_seed_dani_brain_builds','shadow_sol_seeder','dd_seed_shadow_sol_brain_builds','production_mutation',false);
end $$;

create or replace function public.dd_brain_trickle_down()
returns jsonb language plpgsql security definer set search_path to 'public' as $$
declare v_h int:=0; v_w int:=0;
begin
 insert into dd_brain_hypotheses(hypothesis_key,signal_key,entity_scope,hypothesis,expected_benefit,risks)
 select 'HYP:'||s.signal_key,s.signal_key,s.entity_scope,s.statement,
 jsonb_build_object('objective',case when s.entity_scope='SHADOW_AND_SOL' then 'SHADOW_SOL_DURABLE_MISSION'
 when s.entity_scope='DANI_DECLARES' then 'DANI_DURABLE_BUSINESS' else 'BASE_OF_BASES_RESEARCH' end,
 'requires_measurement',true,'entity_boundary_enforced',true),
 jsonb_build_array('unknown_demand','unknown_economics','unknown_governance','unknown_fulfillment')
 from dd_brain_signals s where s.status='NEW' on conflict(hypothesis_key) do nothing;
 get diagnostics v_h=row_count;

 insert into dd_research_work_queue(program_key,work_key,question,required_evidence,priority,status,blocker,next_action,owner_decision_required,metadata)
 select 'CRAFT_PROJECT_CORPUS_2026_09_26','BRAIN:'||h.hypothesis_key,'Test hypothesis: '||h.hypothesis,
 'Provenance; current evidence; economics where applicable; legal/compliance/accounting evidence where applicable; fulfillment feasibility; conflicts; synthetic-test design; explicit falsification criteria.',
 'P0','QUEUED','RESEARCH_PASS_1_REQUIRED','Research before construction. Preserve contradictory evidence and failure criteria.',false,
 jsonb_build_object('brain_hypothesis_key',h.hypothesis_key,'entity_scope',h.entity_scope,'required_passes',h.research_pass_target,'synthetic_test_required',h.synthetic_test_required,'tester_only',true,'cross_entity_auto_seed',false)
 from dd_brain_hypotheses h where h.status='PROPOSED'
 on conflict(program_key,work_key) do update set question=excluded.question,required_evidence=excluded.required_evidence,metadata=excluded.metadata,updated_at=now();
 get diagnostics v_w=row_count;
 update dd_brain_signals set status='ROUTED',updated_at=now() where status='NEW';
 update dd_brain_hypotheses set status='RESEARCHING',updated_at=now() where status='PROPOSED';
 return jsonb_build_object('status','COMPLETED','hypotheses_created',v_h,'research_items_routed',v_w,'cross_entity_auto_seed',false,'entity_specific_build_seed_required',true,'production_mutation',false);
end $$;

create table if not exists public.dd_entity_automation_nodes (
 node_key text primary key, entity_key text not null, node_type text not null, controller_function text not null,
 execution_environment text not null default 'TESTER', autonomous_enabled boolean not null default false,
 production_mutation_allowed boolean not null default false, external_contact_allowed boolean not null default false,
 money_action_allowed boolean not null default false, cross_entity_seed_allowed boolean not null default false,
 status text not null default 'ACTIVE', metadata jsonb not null default '{}'::jsonb,
 created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
alter table public.dd_entity_automation_nodes enable row level security;
revoke all on public.dd_entity_automation_nodes from anon, authenticated;
grant select on public.dd_entity_automation_nodes to service_role;

insert into public.dd_entity_automation_nodes(node_key,entity_key,node_type,controller_function,autonomous_enabled,metadata)
values
('BASE_OF_BASES_BRAIN','BASE_OF_BASES','SHARED_RESEARCH_ROUTER','dd_brain_trickle_down',true,'{"authority":"RESEARCH_ONLY","entity_build_seeding":false}'::jsonb),
('DANI_BRAIN_CONTROLLER','DANI_DECLARES','ENTITY_BRAIN_CONTROLLER','dd_run_dani_brain_cycle',true,'{"authority":"TESTER_RESEARCH_AND_DANI_BUILD_CANDIDATES_ONLY"}'::jsonb),
('SHADOW_SOL_BRAIN_CONTROLLER','SHADOW_AND_SOL','ENTITY_BRAIN_CONTROLLER','dd_run_shadow_sol_brain_cycle',false,'{"authority":"SEPARATE_ENTITY_TESTER_ONLY","not_scheduled_by_dani":true}'::jsonb)
on conflict(node_key) do update set entity_key=excluded.entity_key,node_type=excluded.node_type,controller_function=excluded.controller_function,
autonomous_enabled=excluded.autonomous_enabled,cross_entity_seed_allowed=false,updated_at=now();

create or replace function public.dd_run_dani_brain_cycle()
returns jsonb language plpgsql security definer set search_path to 'public' as $$
declare v_brain jsonb; v_seed jsonb; v_research uuid; v_auto jsonb;
begin
 select dd_brain_trickle_down() into v_brain;
 select dd_seed_dani_brain_builds() into v_seed;
 select dd_run_research_pipeline_controller() into v_research;
 select dd_run_research_to_autobuild_controller() into v_auto;
 return jsonb_build_object('status','COMPLETED','entity','DANI_DECLARES','environment','TESTER','brain',v_brain,
 'dani_seed',v_seed,'research_pipeline_run',v_research,'autobuild',v_auto,'shadow_sol_seeded',false,'cross_entity_seed',false,
 'production_mutation',false,'money_action',false,'external_contact',false);
end $$;

create or replace function public.dd_run_shadow_sol_brain_cycle()
returns jsonb language plpgsql security definer set search_path to 'public' as $$
declare v_brain jsonb; v_seed jsonb; v_research uuid;
begin
 select dd_brain_trickle_down() into v_brain;
 select dd_seed_shadow_sol_brain_builds() into v_seed;
 select dd_run_research_pipeline_controller() into v_research;
 return jsonb_build_object('status','COMPLETED','entity','SHADOW_AND_SOL','environment','TESTER','brain',v_brain,
 'shadow_sol_seed',v_seed,'research_pipeline_run',v_research,'dani_seeded',false,'cross_entity_seed',false,
 'production_mutation',false,'money_action',false,'external_contact',false);
end $$;

do $$
declare jid bigint;
begin
 for jid in select jobid from cron.job where jobname='dd-tester-dani-brain-controller' loop perform cron.unschedule(jid); end loop;
 perform cron.schedule('dd-tester-dani-brain-controller','6,21,36,51 * * * *','select public.dd_run_dani_brain_cycle();');
end $$;
