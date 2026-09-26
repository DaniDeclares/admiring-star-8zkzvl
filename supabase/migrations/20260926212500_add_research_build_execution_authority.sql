-- Governed execution authority for the research/build handoff plane.
-- Additive only. Does not grant direct production write, auto-merge, deployment,
-- money movement, pricing publication, provider authorization, or external contact.

insert into public.dd_execution_authority_map
(stage_key, authoritative_table, authoritative_record_type, prepare_authority, approve_authority, execute_authority, prohibited_parallel_sources, handoff_condition, owner_override, is_active)
select
  'research_to_implementation',
  'dd_research_implementation_queue',
  'research_implementation',
  array['research_controller']::text[],
  array['operations_controller','owner']::text[],
  array['research_controller']::text[],
  array['direct_production_write','ungoverned_build']::text[],
  'Governed research evidence supports an implementation action with acceptance criteria and risk/permission classification.',
  true,
  true
where not exists (
  select 1 from public.dd_execution_authority_map
  where stage_key='research_to_implementation' and is_active=true
);

insert into public.dd_execution_authority_map
(stage_key, authoritative_table, authoritative_record_type, prepare_authority, approve_authority, execute_authority, prohibited_parallel_sources, handoff_condition, owner_override, is_active)
select
  'software_build_candidate',
  'dd_autobuild_candidates',
  'autobuild_candidate',
  array['software_build_controller']::text[],
  array['operations_controller','owner']::text[],
  array['governed_pr_executor']::text[],
  array['direct_main_write','direct_production_write','auto_merge']::text[],
  'Approved low-risk candidate has explicit bounded edits; protected candidates remain review-gated.',
  true,
  true
where not exists (
  select 1 from public.dd_execution_authority_map
  where stage_key='software_build_candidate' and is_active=true
);
