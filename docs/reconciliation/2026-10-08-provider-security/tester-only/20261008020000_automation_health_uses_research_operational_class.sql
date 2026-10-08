-- Automation health supervisor: consume the existing research operational classification.
--
-- History: dd_run_automation_health_supervisor (extend_automation_health_for_handoff_continuity_20260928)
-- predates classify_rejected_research_fanout_as_quarantined (2026-09-30), which created
-- dd_research_executable_backlog_v1.operational_class (QUARANTINED / DEPENDENCY_HELD / EXECUTABLE / RESOLVED).
-- dd_refresh_research_coverage_gaps was reconciled to that classification on 2026-10-01; the health
-- supervisor never was. It counted every BLOCKED row (27,413, of which 25,127 are intentionally
-- quarantined runaway history) and declared the RESEARCH_TO_SOURCE_DISCOVERY handoff stalled whenever
-- ANY blocked row and ANY open discovery request coexisted, regardless of whether they were related.
--
-- Repair (no new classification list, no new table, no weakened gate):
--   * blocked_research        = DEPENDENCY_HELD rows only (quarantined history no longer counted)
--   * quarantined_research    = reported separately for transparency
--   * awaiting_source_research= DEPENDENCY_HELD rows whose blocker is SOURCE_DISCOVERY_REQUIRED
--   * the handoff is NEEDS_CONSUMER_OR_SOURCE only when open discovery requests coexist with work
--     actually waiting on source discovery
--   * oldest_open_discovery_hours and open_requests_without_candidates make the stall measurable
-- Everything else (other handoffs, DEGRADED rule, owner-attention dedupe) is unchanged.

create or replace function public.dd_run_automation_health_supervisor()
 returns uuid
 language plpgsql
 security definer
 set search_path to 'public', 'pg_catalog'
as $function$
declare
 v_id uuid:=gen_random_uuid(); v_queued int:=0; v_stale int:=0;
 v_external_pending int:=0; v_external_stale int:=0;
 v_delivery_pending int:=0; v_delivery_stale int:=0;
 v_research_queued int:=0; v_research_blocked int:=0; v_research_quarantined int:=0; v_research_awaiting_source int:=0;
 v_discovery_open int:=0; v_discovery_no_candidates int:=0; v_discovery_oldest_hours numeric;
 v_brain_idle_recent int:=0;
 v_findings jsonb:='[]'::jsonb; v_attention uuid; v_status text;
begin
 select count(*) into v_queued from public.dd_scheduled_operating_work where status='QUEUED';
 select count(*) into v_stale from public.dd_scheduled_operating_work where status='QUEUED' and created_at<now()-interval '2 hours';
 select count(*) into v_external_pending from public.dd_external_action_outbox
   where authoritative_table='dd_scheduled_operating_work' and status in ('PENDING','CLAIMED');
 select count(*) into v_external_stale from public.dd_external_action_outbox
   where authoritative_table='dd_scheduled_operating_work' and status in ('PENDING','CLAIMED') and created_at<now()-interval '2 hours';
 select count(*) into v_delivery_pending from public.dd_brain_delivery_queue where status in ('PENDING','RETRY','CLAIMED');
 select count(*) into v_delivery_stale from public.dd_brain_delivery_queue where status in ('PENDING','RETRY') and created_at<now()-interval '2 hours';
 select count(*) into v_research_queued from public.dd_research_work_queue where status='QUEUED';
 select count(*) filter (where operational_class='DEPENDENCY_HELD'),
        count(*) filter (where operational_class='QUARANTINED'),
        count(*) filter (where operational_class='DEPENDENCY_HELD' and blocker='SOURCE_DISCOVERY_REQUIRED')
   into v_research_blocked, v_research_quarantined, v_research_awaiting_source
   from public.dd_research_executable_backlog_v1
  where operational_class in ('DEPENDENCY_HELD','QUARANTINED');
 select count(*), count(*) filter (where coalesce(candidate_source_count,0)=0 and coalesce(validated_source_count,0)=0),
        round(extract(epoch from now()-min(created_at))/3600.0,1)
   into v_discovery_open, v_discovery_no_candidates, v_discovery_oldest_hours
   from public.dd_research_source_discovery_requests where request_status='OPEN';
 select count(*) into v_brain_idle_recent from public.dd_brain_controller_runs r
   where r.created_at>=now()-interval '2 hours' and r.status='IDLE' and r.action in ('NO_ACTIVE_SOLUTION','NO_READY_NODE')
     and not exists (select 1 from public.dd_brain_solution_nodes n where n.solution_key=r.solution_key and n.status='EXECUTING');

 select coalesce(jsonb_agg(x),'[]'::jsonb) into v_findings from (
   select jsonb_build_object('handoff','SCHEDULED_OPERATING_WORK_TO_CONSUMER','state',case when v_stale>0 then 'STALLED' else 'OK' end,'queued',v_queued,'stale',v_stale) x
   union all select jsonb_build_object('handoff','EXTERNAL_OPERATING_WORK_TO_VERIFIED_RECEIPT','state',case when v_external_stale>0 then 'STALLED' when v_external_pending>0 then 'AWAITING_CONSUMER' else 'OK' end,'pending',v_external_pending,'stale',v_external_stale)
   union all select jsonb_build_object('handoff','BRAIN_DELIVERY_TO_INGEST','state',case when v_delivery_stale>0 then 'STALLED' else 'OK' end,'pending',v_delivery_pending,'stale',v_delivery_stale)
   union all select jsonb_build_object('handoff','RESEARCH_TO_SOURCE_DISCOVERY',
       'state',case when v_discovery_open>0 and v_research_awaiting_source>0 then 'NEEDS_CONSUMER_OR_SOURCE' else 'OK' end,
       'queued_research',v_research_queued,'blocked_research',v_research_blocked,
       'awaiting_source_research',v_research_awaiting_source,'quarantined_research',v_research_quarantined,
       'open_discovery_requests',v_discovery_open,'open_requests_without_candidates',v_discovery_no_candidates,
       'oldest_open_discovery_hours',v_discovery_oldest_hours,
       'classification_authority','dd_research_executable_backlog_v1.operational_class')
   union all select jsonb_build_object('handoff','BRAIN_TO_ACTIVE_SOLUTION','state',case when v_brain_idle_recent>=2 then 'NOT_CONVERGING' else 'OK' end,'idle_no_solution_runs_last_2h',v_brain_idle_recent)
 ) q;

 v_status:=case when v_stale>0 or v_external_stale>0 or v_delivery_stale>0
                  or (v_discovery_open>0 and v_research_awaiting_source>0) or v_brain_idle_recent>=2
             then 'DEGRADED' else 'HEALTHY' end;
 insert into public.dd_automation_health_runs(id,status,queued_total,stale_total,findings) values(v_id,v_status,v_queued,v_stale,v_findings);
 if v_status='DEGRADED' then
   select id into v_attention from public.dd_owner_attention_queue where domain='AUTOMATION' and source_table='dd_scheduled_operating_work' and status='OPEN' order by created_at desc limit 1 for update;
   if v_attention is null then
     insert into public.dd_owner_attention_queue(domain,source_table,source_record_id,reason,priority,recommended_action,metadata)
     values('AUTOMATION','dd_scheduled_operating_work','ecosystem-handoff-continuity','Autonomous ecosystem has one or more stalled downstream handoffs','P0',
       'Repair the existing producer-to-consumer transition; scheduler/worker existence alone is not green.',jsonb_build_object('health_run_id',v_id,'handoff_findings',v_findings));
   else
     update public.dd_owner_attention_queue set source_record_id='ecosystem-handoff-continuity',
       reason='Autonomous ecosystem has one or more stalled downstream handoffs',
       recommended_action='Repair the existing producer-to-consumer transition; scheduler/worker existence alone is not green.',
       metadata=jsonb_build_object('health_run_id',v_id,'handoff_findings',v_findings) where id=v_attention;
   end if;
 else
   update public.dd_owner_attention_queue set status='RESOLVED',resolved_at=now()
   where domain='AUTOMATION' and source_table='dd_scheduled_operating_work' and status='OPEN';
 end if;
 return v_id;
end
$function$;