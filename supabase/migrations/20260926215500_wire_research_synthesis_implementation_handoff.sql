-- Repair the governed research -> synthesis -> implementation handoff.
-- Additive wiring only. It does not invent implementation directives and does not
-- grant auto-merge, production deployment/write, money movement, pricing publication,
-- provider authorization, assignment, or external contact.

create unique index if not exists dd_execution_handoff_research_impl_uq
on public.dd_execution_handoff_ledger
(source_stage,target_stage,authoritative_table,authoritative_record_id,actor_key)
where source_stage='research_synthesis'
  and target_stage='research_to_implementation'
  and authoritative_table='dd_research_implementation_queue'
  and actor_key='research_synthesis_worker';

create or replace function public.dd_record_research_implementation_handoff()
returns trigger
language plpgsql
security definer
set search_path=''
as $function$
begin
  insert into public.dd_execution_handoff_ledger(
    source_stage,target_stage,authoritative_record_id,authoritative_table,
    handoff_reason,actor_key,status,metadata)
  values(
    'research_synthesis','research_to_implementation',new.id,
    'dd_research_implementation_queue',
    'Evidence-backed research produced a typed governed implementation record.',
    'research_synthesis_worker','RECORDED',
    jsonb_build_object(
      'implementation_key',new.implementation_key,
      'program_key',new.program_key,
      'work_key',new.work_key,
      'action_class',new.action_class,
      'risk_tier',new.risk_tier,
      'permission_class',new.permission_class,
      'status',new.status,
      'autobuild_candidate_id',new.autobuild_candidate_id,
      'production_direct_write',false,
      'auto_merge',false,
      'deploy_production',false))
  on conflict do nothing;
  return new;
end
$function$;

drop trigger if exists dd_research_implementation_handoff_trg
on public.dd_research_implementation_queue;

create trigger dd_research_implementation_handoff_trg
after insert on public.dd_research_implementation_queue
for each row execute function public.dd_record_research_implementation_handoff();

create or replace function public.dd_run_research_synthesis_after_pipeline()
returns trigger
language plpgsql
security definer
set search_path=''
as $function$
begin
  if new.status='COMPLETED'
     and (old.status is distinct from new.status or old.completed_at is distinct from new.completed_at) then
    perform public.dd_run_research_synthesis_worker();
  end if;
  return new;
end
$function$;

drop trigger if exists dd_research_pipeline_synthesis_trg
on public.dd_research_pipeline_runs;

create trigger dd_research_pipeline_synthesis_trg
after update of status,completed_at on public.dd_research_pipeline_runs
for each row execute function public.dd_run_research_synthesis_after_pipeline();

-- Backfill receipts only for already-existing implementation records. This records
-- lineage; it does not change their execution status or grant new authority.
insert into public.dd_execution_handoff_ledger(
  source_stage,target_stage,authoritative_record_id,authoritative_table,
  handoff_reason,actor_key,status,metadata)
select
  'research_synthesis','research_to_implementation',q.id,
  'dd_research_implementation_queue',
  'Backfilled lineage receipt for an existing governed research implementation record.',
  'research_synthesis_worker','RECORDED',
  jsonb_build_object(
    'implementation_key',q.implementation_key,
    'program_key',q.program_key,
    'work_key',q.work_key,
    'action_class',q.action_class,
    'risk_tier',q.risk_tier,
    'permission_class',q.permission_class,
    'status',q.status,
    'autobuild_candidate_id',q.autobuild_candidate_id,
    'backfill',true,
    'production_direct_write',false,
    'auto_merge',false,
    'deploy_production',false)
from public.dd_research_implementation_queue q
on conflict do nothing;
