-- Candidate-specific source discovery quality gate.
CREATE OR REPLACE FUNCTION public.dd_queue_candidate_source_discovery_requests()
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare v_upserted int:=0;
begin
 insert into public.dd_research_source_discovery_requests
 (request_key,program_key,gap_key,priority,request_status,discovery_question,source_requirements,metadata)
 select 'SOURCE_DISCOVERY:'||q.work_key,q.program_key,'WORK:'||q.work_key,q.priority,'OPEN',
   'Find and validate authoritative current sources specifically relevant to research work '||q.work_key||': '||coalesce(q.question,''),
   jsonb_build_object(
     'authoritative_preferred',true,'current_preferred',true,'url_must_be_observed_not_invented',true,
     'validate_before_source_activation',true,'work_specific_relevance_required',true,
     'healthy_http_required',true,'minimum_independent_sources_for_contested_claims',2),
   jsonb_build_object('work_key',q.work_key,'candidate_specific',true,'tester_only',true)
 from public.dd_research_work_queue q
 where q.program_key='SERVICE_DISCOVERY' and q.work_key like 'candidate:%'
   and q.status in ('QUEUED','RESEARCHING','BLOCKED')
   and not exists (
     select 1 from public.dd_research_sources s
     where s.work_key=q.work_key and s.status='ACTIVE'
       and coalesce(s.last_http_status,200)<400 and s.last_error is null
   )
 on conflict(request_key) do update set
   priority=excluded.priority,
   request_status=case when dd_research_source_discovery_requests.validated_source_count>0 then 'VALIDATED' else 'OPEN' end,
   discovery_question=excluded.discovery_question,
   source_requirements=excluded.source_requirements,
   metadata=excluded.metadata,
   updated_at=now();
 get diagnostics v_upserted=row_count;
 return jsonb_build_object('status','COMPLETED','candidate_requests_upserted',v_upserted,'production_mutation',false,'invented_urls',false);
end $function$
;

CREATE OR REPLACE FUNCTION public.dd_validate_source_discovery_candidate(p_request_key text, p_source_url text, p_source_name text, p_source_type text, p_validation jsonb DEFAULT '{}'::jsonb)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare v_program text; v_work_key text; v_id uuid; v_authority text; v_source_key text; v_existing uuid;
begin
 if p_source_url is null or p_source_url !~ '^https?://' then raise exception 'OBSERVED_VALID_URL_REQUIRED'; end if;
 select program_key,metadata->>'work_key' into v_program,v_work_key
 from public.dd_research_source_discovery_requests
 where request_key=p_request_key and request_status in ('OPEN','CANDIDATES_FOUND','VALIDATED','QUEUED');
 if v_program is null then raise exception 'OPEN_DISCOVERY_REQUEST_REQUIRED'; end if;
 if coalesce((p_validation->>'authoritative')::boolean,false)=false then
   return jsonb_build_object('status','REJECTED','reason','AUTHORITY_NOT_VALIDATED','source_activated',false);
 end if;
 if v_work_key is not null and coalesce((p_validation->>'work_specific_relevance')::boolean,false)=false then
   return jsonb_build_object('status','REJECTED','reason','WORK_SPECIFIC_RELEVANCE_NOT_VALIDATED','source_activated',false);
 end if;
 v_authority:=upper(coalesce(nullif(p_validation->>'authority_level',''),
   case when upper(coalesce(p_source_type,'')) in ('PRIMARY','REGULATOR','CONTRACT','VENDOR','SECONDARY','USER_SOURCE')
     then upper(p_source_type) else 'PRIMARY' end));
 if v_authority not in ('PRIMARY','REGULATOR','CONTRACT','VENDOR','SECONDARY','USER_SOURCE') then v_authority:='PRIMARY'; end if;
 v_source_key:='DISCOVERED:'||upper(substr(md5(v_program||'|'||coalesce(v_work_key,'PROGRAM')||'|'||p_source_url),1,24));
 select id into v_existing from public.dd_research_sources
 where program_key=v_program and source_url=p_source_url and work_key is not distinct from v_work_key limit 1;
 if v_existing is not null then
   update public.dd_research_sources set status='ACTIVE',source_title=coalesce(nullif(p_source_name,''),source_title),
     authority_level=v_authority,work_key=v_work_key,
     metadata=coalesce(metadata,'{}')||jsonb_build_object('discovery_request_key',p_request_key,'validation',p_validation,'activated_in','TESTER','work_specific',v_work_key is not null),
     updated_at=now() where id=v_existing; v_id:=v_existing;
 else
   insert into public.dd_research_sources(program_key,work_key,source_key,source_title,source_url,authority_level,temporal_class,status,metadata)
   values(v_program,v_work_key,v_source_key,coalesce(nullif(p_source_name,''),p_source_url),p_source_url,v_authority,
     coalesce(nullif(upper(p_validation->>'temporal_class'),''),'CURRENT'),'ACTIVE',
     jsonb_build_object('discovery_request_key',p_request_key,'validation',p_validation,'activated_in','TESTER','source_type_observed',p_source_type,'work_specific',v_work_key is not null))
   returning id into v_id;
 end if;
 update public.dd_research_source_discovery_requests set
   validated_source_count=(select count(*) from public.dd_research_sources s where s.program_key=v_program and s.status='ACTIVE'
     and s.work_key is not distinct from v_work_key and (s.metadata->>'discovery_request_key')=p_request_key),
   candidate_source_count=greatest(candidate_source_count,1),request_status='VALIDATED',updated_at=now()
 where request_key=p_request_key;
 perform public.dd_refresh_research_coverage_gaps();
 return jsonb_build_object('status','VALIDATED','source_id',v_id,'program_key',v_program,'work_key',v_work_key,'source_activated',true,'production_mutation',false);
end $function$
;

revoke execute on function public.dd_queue_candidate_source_discovery_requests() from public, anon, authenticated;
grant execute on function public.dd_queue_candidate_source_discovery_requests() to service_role;
revoke execute on function public.dd_validate_source_discovery_candidate(text,text,text,text,jsonb) from public, anon, authenticated;
grant execute on function public.dd_validate_source_discovery_candidate(text,text,text,text,jsonb) to service_role;


-- Wire candidate discovery into the existing zero-source controller.
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
 v_candidate:=public.dd_queue_candidate_source_discovery_requests();
 select count(*) into v_refreshed from public.dd_research_source_discovery_requests where request_status='OPEN';
 return jsonb_build_object('status','COMPLETED','requests_upserted',v_created,'open_requests',v_refreshed,
 'candidate_discovery',v_candidate,'invented_urls',false,'source_activation',false,'production_mutation',false);
end $function$
;
revoke execute on function public.dd_queue_zero_source_discovery_requests() from public, anon, authenticated;
grant execute on function public.dd_queue_zero_source_discovery_requests() to service_role;
