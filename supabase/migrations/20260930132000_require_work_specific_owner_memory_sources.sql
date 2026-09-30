-- Owner-memory provenance is not current authority. Require work-specific external evidence before revalidation.
CREATE OR REPLACE FUNCTION public.dd_execute_research_work_v1(p_limit integer DEFAULT 8)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'private'
AS $function$
declare r record; s record; v_attempt int; v_triggered boolean; v_executed int:=0; v_blocked int:=0; v_limit int; v_brain_slots int; v_status text; v_service_slots int; v_reserve_non_service int:=75;
begin
 v_limit:=greatest(coalesce(p_limit,8),1);
 v_brain_slots:=least(ceil(v_limit/2.0)::int,v_limit);
 select coalesce(reserve_non_service_discovery_pct,75) into v_reserve_non_service
 from public.dd_research_capacity_policy where enabled=true order by updated_at desc limit 1;
 v_service_slots:=least(greatest(ceil((v_limit-v_brain_slots)*(100-least(greatest(v_reserve_non_service,0),100))/100.0)::int,1),greatest(v_limit-v_brain_slots,0));
 for r in
   with eligible as (
     select q.* from public.dd_research_work_queue q
     where coalesce(q.owner_decision_required,false)=false
       and (q.status='QUEUED' or (q.status='RESEARCHING' and (q.last_researched_at is null or q.last_researched_at<=now()-interval '2 hours')))
   ), brain as (
     select q.*,0 lane from eligible q
     where q.priority='P0' and (q.work_key like 'BRAIN:HYP:%' or coalesce((q.metadata->>'brain_v2')::boolean,false)=true or q.work_key like 'BRAINV2:%')
     order by case when q.work_key like 'BRAIN:HYP:OWNER_%' then -1 when coalesce((q.metadata->>'brain_v2')::boolean,false)=true or q.work_key like 'BRAINV2:%' then 0 else 1 end,coalesce(q.attempts,0),q.created_at
     limit v_brain_slots
   ), service_lane as (
     select q.*,1 lane from eligible q
     where q.program_key='SERVICE_DISCOVERY' and q.work_key like 'candidate:%'
       and not exists(select 1 from brain b where b.id=q.id)
     order by case q.priority when 'P0' then 1 when 'P1' then 2 else 3 end,coalesce(q.attempts,0),q.created_at
     limit v_service_slots
   ), general as (
     select q.*,2 lane from eligible q
     where not exists(select 1 from brain b where b.id=q.id)
       and not exists(select 1 from service_lane d where d.id=q.id)
     order by case q.priority when 'P0' then 1 when 'P1' then 2 else 3 end,coalesce(q.attempts,0),q.created_at
     limit greatest(v_limit-(select count(*) from brain)-(select count(*) from service_lane),0)
   )
   select * from (select * from brain union all select * from service_lane union all select * from general) x
   order by lane,coalesce(attempts,0),created_at
 loop
   perform pg_advisory_xact_lock(hashtext('DANI_RESEARCH:'||r.work_key));
   select attempts,status into v_attempt,v_status from public.dd_research_work_queue where id=r.id for update;
   if v_status not in ('QUEUED','RESEARCHING') then continue; end if;
   if v_status='RESEARCHING' and exists(select 1 from public.dd_research_work_queue q where q.id=r.id and q.last_researched_at>now()-interval '2 hours') then continue; end if;
   v_attempt:=coalesce(v_attempt,0)+1;
   select * into s from public.dd_research_sources where status='ACTIVE'
     and coalesce(last_http_status,200) < 400 and last_error is null
     and (
       ((r.program_key='SERVICE_DISCOVERY' and r.work_key like 'candidate:%') and work_key=r.work_key)
       or
       (r.program_key='OWNER_RESEARCH_MEMORY' and work_key=r.work_key)
       or
       (not ((r.program_key='SERVICE_DISCOVERY' and r.work_key like 'candidate:%') or r.program_key='OWNER_RESEARCH_MEMORY') and (work_key=r.work_key or program_key=r.program_key))
     )
   order by case when work_key=r.work_key then 0 else 1 end,case authority_level when 'PRIMARY' then 0 when 'OFFICIAL' then 1 else 2 end,coalesce(next_check_at,now()) limit 1;
   if s.id is null then
     update public.dd_research_work_queue set attempts=v_attempt,last_researched_at=now(),status='BLOCKED',blocker='SOURCE_DISCOVERY_REQUIRED',
       next_action='Governed source discovery must validate at least one authoritative source before research execution can continue.',
       metadata=coalesce(metadata,'{}')||jsonb_build_object('last_execution_attempt',now(),'execution_result','NO_VALIDATED_SOURCE','executor','dd_execute_research_work_v1','fairness_lane',case r.lane when 0 then 'BRAIN_P0_RESERVED' when 1 then 'SERVICE_DISCOVERY_RESERVED' else 'GENERAL' end,'fairness_policy','CAPACITY_POLICY_RESERVED_SERVICE_DISCOVERY'),updated_at=now() where id=r.id;
     insert into public.dd_research_work_execution_receipts(work_key,program_key,attempt_no,execution_status,detail,completed_at)
       values(r.work_key,r.program_key,v_attempt,'BLOCKED_NO_SOURCE',jsonb_build_object('source_invented',false,'fairness_lane',case r.lane when 0 then 'BRAIN_P0_RESERVED' when 1 then 'SERVICE_DISCOVERY_RESERVED' else 'GENERAL' end),now()) on conflict(work_key,attempt_no) do nothing;
     perform public.dd_queue_zero_source_discovery_requests(); v_blocked:=v_blocked+1;
   else
     update public.dd_research_sources set next_check_at=now(),updated_at=now() where id=s.id;
     begin perform private.dd_trigger_research_engine(); v_triggered:=true; exception when others then v_triggered:=false; end;
     update public.dd_research_work_queue set attempts=v_attempt,last_researched_at=now(),status=case when v_triggered then 'RESEARCHING' else 'BLOCKED' end,
       blocker=case when v_triggered then null else 'RESEARCH_ENGINE_TRIGGER_FAILED' end,
       next_action=case when v_triggered then 'Research engine triggered against validated active source; await evidence and synthesis. Cooldown prevents immediate duplicate trigger.' else 'Repair research-engine trigger before retry.' end,
       metadata=coalesce(metadata,'{}')||jsonb_build_object('last_execution_attempt',now(),'execution_result',case when v_triggered then 'ENGINE_TRIGGERED' else 'ENGINE_TRIGGER_FAILED' end,'source_key',s.source_key,'executor','dd_execute_research_work_v1','fairness_lane',case r.lane when 0 then 'BRAIN_P0_RESERVED' when 1 then 'SERVICE_DISCOVERY_RESERVED' else 'GENERAL' end,'fairness_policy','CAPACITY_POLICY_RESERVED_SERVICE_DISCOVERY','retry_cooldown_minutes',120),updated_at=now() where id=r.id;
     insert into public.dd_research_work_execution_receipts(work_key,program_key,attempt_no,execution_status,source_key,engine_triggered,detail,completed_at)
       values(r.work_key,r.program_key,v_attempt,case when v_triggered then 'ENGINE_TRIGGERED' else 'ENGINE_TRIGGER_FAILED' end,s.source_key,v_triggered,jsonb_build_object('source_url_observed',true,'authority_level',s.authority_level,'fairness_lane',case r.lane when 0 then 'BRAIN_P0_RESERVED' when 1 then 'SERVICE_DISCOVERY_RESERVED' else 'GENERAL' end,'retry_cooldown_minutes',120),now()) on conflict(work_key,attempt_no) do nothing;
     v_executed:=v_executed+1;
   end if;
 end loop;
 return jsonb_build_object('status','COMPLETED','executed_with_source',v_executed,'blocked_no_source',v_blocked,'brain_p0_reserved_slots',v_brain_slots,'service_discovery_reserved_slots',v_service_slots,'retry_cooldown_minutes',120,'fairness_policy','CAPACITY_POLICY_RESERVED_SERVICE_DISCOVERY','production_mutation',false,'invented_sources',false);
end $function$
;
CREATE OR REPLACE FUNCTION public.dd_queue_zero_source_discovery_requests()
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare v_created int:=0; v_refreshed int:=0; v_candidate jsonb;
begin
 perform public.dd_refresh_research_coverage_gaps();
 insert into public.dd_research_source_discovery_requests
 (request_key,program_key,gap_key,priority,request_status,discovery_question,source_requirements,metadata)
 select 'SOURCE_DISCOVERY:'||g.program_key,g.program_key,g.gap_key,g.priority,'OPEN',
 'Find and validate authoritative current sources sufficient to research program '||g.program_key||' without inventing source authority.',
 jsonb_build_object('authoritative_preferred',true,'current_preferred',true,'url_must_be_observed_not_invented',true,
 'validate_before_source_activation',true,'minimum_independent_sources_for_contested_claims',2),
 jsonb_build_object('open_work_items',g.open_work_items,'p0_open',g.p0_open,'coverage_gap',true,'tester_only',true)
 from public.dd_research_coverage_gaps g
 where g.gap_status='OPEN' and g.active_sources=0
 on conflict(request_key) do update set priority=excluded.priority,
 request_status=case when dd_research_source_discovery_requests.validated_source_count>0 then 'VALIDATED' else 'OPEN' end,
 source_requirements=excluded.source_requirements,metadata=excluded.metadata,updated_at=now();
 get diagnostics v_created=row_count;
 insert into public.dd_research_source_discovery_requests
 (request_key,program_key,gap_key,priority,request_status,discovery_question,source_requirements,metadata)
 select 'SOURCE_DISCOVERY:OWNER_MEMORY:'||md5(q.work_key),'OWNER_RESEARCH_MEMORY',
   'WORK_SOURCE_REQUIRED:'||q.work_key,q.priority,'OPEN',
   'Find current authoritative evidence specifically relevant to owner-memory research item: '||q.question,
   jsonb_build_object('authoritative_preferred',true,'current_preferred',true,'url_must_be_observed_not_invented',true,
     'validate_before_source_activation',true,'work_specific_relevance_required',true,'minimum_independent_sources_for_contested_claims',2),
   jsonb_build_object('work_key',q.work_key,'owner_provenance_preserved',true,'historical_memory_not_current_authority',true,'tester_only',true)
 from public.dd_research_work_queue q
 where q.program_key='OWNER_RESEARCH_MEMORY' and q.status='BLOCKED' and q.blocker='SOURCE_DISCOVERY_REQUIRED'
   and not exists(select 1 from public.dd_research_sources s where s.status='ACTIVE' and s.work_key=q.work_key)
 on conflict(request_key) do update set priority=excluded.priority,source_requirements=excluded.source_requirements,metadata=excluded.metadata,updated_at=now();
 v_candidate:=public.dd_queue_candidate_source_discovery_requests();
 select count(*) into v_refreshed from public.dd_research_source_discovery_requests where request_status='OPEN';
 return jsonb_build_object('status','COMPLETED','requests_upserted',v_created,'open_requests',v_refreshed,
 'candidate_discovery',v_candidate,'invented_urls',false,'source_activation',false,'production_mutation',false);
end $function$
;
