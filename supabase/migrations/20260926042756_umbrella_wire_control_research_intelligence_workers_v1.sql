
create or replace function public.dd_evaluate_intelligence_collection_gate(p_collection_key text)
returns jsonb
language plpgsql security invoker set search_path=''
as $$
declare q public.dd_intelligence_collection_queue%rowtype; s public.dd_intelligence_sources%rowtype; n int:=0; reasons jsonb:='[]'::jsonb;
begin
 select * into q from public.dd_intelligence_collection_queue where collection_key=p_collection_key;
 if q.id is null then return jsonb_build_object('allowed',false,'reasons',jsonb_build_array('COLLECTION_NOT_FOUND')); end if;
 select * into s from public.dd_intelligence_sources where source_key=q.source_key;
 if s.id is null then reasons:=reasons||jsonb_build_array('SOURCE_NOT_FOUND'); end if;
 if q.status not in ('READY','QUEUED') then reasons:=reasons||jsonb_build_array('QUEUE_NOT_RUNNABLE'); end if;
 if coalesce(s.status,'BLOCKED')<>'ACTIVE' then reasons:=reasons||jsonb_build_array('SOURCE_NOT_ACTIVE'); end if;
 if coalesce(s.collector_execution_allowed,false)=false then reasons:=reasons||jsonb_build_array('COLLECTOR_EXECUTION_NOT_ALLOWED'); end if;
 if coalesce(s.terms_gate_status,'PENDING') not in ('APPROVED','NOT_REQUIRED') then reasons:=reasons||jsonb_build_array('TERMS_GATE_NOT_CLEARED'); end if;
 if q.external_contact_allowed or q.money_action_allowed or q.production_mutation_allowed then reasons:=reasons||jsonb_build_array('CONSEQUENTIAL_AUTHORITY_PROHIBITED'); end if;
 select count(*) into n from public.dd_intelligence_collection_runs r
 where r.source_key=q.source_key and r.started_at>=now()-interval '1 hour';
 if s.rate_limit_per_hour is not null and n>=s.rate_limit_per_hour then reasons:=reasons||jsonb_build_array('SOURCE_RATE_LIMIT_REACHED'); end if;
 return jsonb_build_object('allowed',jsonb_array_length(reasons)=0,'collection_key',p_collection_key,'source_key',q.source_key,'reasons',reasons,
   'external_contact_allowed',false,'money_action_allowed',false,'production_mutation_allowed',false,'observed_at',now());
end $$;

create or replace function public.dd_ingest_intelligence_observation(p_observation jsonb)
returns uuid
language plpgsql security invoker set search_path=''
as $$
declare v_id uuid; v_key text; v_source text; v_claim text;
begin
 v_key:=nullif(p_observation->>'observation_key','');
 v_source:=nullif(p_observation->>'source_key','');
 v_claim:=nullif(p_observation->>'observed_claim','');
 if v_key is null or v_source is null or v_claim is null then raise exception 'OBSERVATION_KEY_SOURCE_CLAIM_REQUIRED'; end if;
 insert into public.dd_intelligence_observations(
  observation_key,source_key,source_record_key,observed_at,subject_type,subject_key,subject_name,event_type,
  observed_claim,evidence_url,evidence_locator,signal_tags,channel_hint,geography_hint,source_confidence,
  verification_status,authority_status,raw_payload,content_hash,last_seen_at,updated_at
 ) values(
  v_key,v_source,nullif(p_observation->>'source_record_key',''),coalesce((p_observation->>'observed_at')::timestamptz,now()),
  coalesce(nullif(p_observation->>'subject_type',''),'UNKNOWN'),nullif(p_observation->>'subject_key',''),nullif(p_observation->>'subject_name',''),
  nullif(p_observation->>'event_type',''),v_claim,nullif(p_observation->>'evidence_url',''),coalesce(p_observation->'evidence_locator','{}'::jsonb),
  coalesce(array(select jsonb_array_elements_text(coalesce(p_observation->'signal_tags','[]'::jsonb))),'{}'::text[]),
  nullif(p_observation->>'channel_hint',''),nullif(p_observation->>'geography_hint',''),
  coalesce((p_observation->>'source_confidence')::numeric,.5),'UNVERIFIED','OBSERVATION_ONLY',
  coalesce(p_observation->'raw_payload','{}'::jsonb),nullif(p_observation->>'content_hash',''),now(),now()
 )
 on conflict(observation_key) do update set last_seen_at=now(),updated_at=now(),raw_payload=excluded.raw_payload
 returning id into v_id;
 return v_id;
end $$;

create or replace function public.dd_route_intelligence_observation(p_observation_id uuid)
returns integer
language plpgsql security invoker set search_path=''
as $$
declare o public.dd_intelligence_observations%rowtype; n int:=0;
begin
 select * into o from public.dd_intelligence_observations where id=p_observation_id;
 if o.id is null then raise exception 'OBSERVATION_NOT_FOUND'; end if;

 insert into public.dd_intelligence_miner_hits(observation_id,miner_key,signal_type,signal_strength,relevance_score,channel_code,route_target,route_state,rationale)
 select o.id,m.miner_key,
   coalesce(o.event_type,'OBSERVED_SIGNAL'),
   .6,.6,o.channel_hint,
   case m.miner_family
     when 'SALES' then 'SALES_RESEARCH'
     when 'OPPORTUNITY' then 'RESEARCH_QUEUE'
     when 'PROPERTY' then 'PROPERTY_INTELLIGENCE'
     when 'PROVIDER' then 'PROVIDER_INTELLIGENCE'
     when 'COMPLIANCE' then 'RISK_REVIEW'
     else 'MARKET_INTELLIGENCE' end,
   case when m.miner_family in ('SALES','OPPORTUNITY') then 'VERIFY' else 'RESEARCH' end,
   jsonb_build_object('matched_by','shared_signal_router','observation_only',true)
 from public.dd_intelligence_miners m
 where m.status='ACTIVE'
   and (
      (m.miner_family='PROPERTY' and (o.subject_type ilike '%property%' or o.signal_tags && array['PROPERTY','APARTMENT','REAL_ESTATE'])) or
      (m.miner_family='OPPORTUNITY' and o.signal_tags && array['RFP','CONTRACT','GRANT','PROCUREMENT']) or
      (m.miner_family='PROVIDER' and o.signal_tags && array['PROVIDER','VENDOR','SUPPLIER','SUBCONTRACTOR']) or
      (m.miner_family='COMPLIANCE' and o.signal_tags && array['LEGAL','COMPLIANCE','LICENSE','REGULATION']) or
      (m.miner_family='ECONOMICS' and o.signal_tags && array['PRICE','COST','ECONOMICS','LABOR']) or
      (m.miner_family='SALES' and o.signal_tags && array['LEAD','INTENT','CUSTOMER','BUYER']) or
      (m.miner_family='TECHNOLOGY' and o.signal_tags && array['TECH','API','SOFTWARE','AUTOMATION']) or
      (m.miner_family='CONTENT' and o.signal_tags && array['CONTENT','TREND','SEARCH','SOCIAL'])
   )
 on conflict(observation_id,miner_key,signal_type,route_target) do nothing;
 get diagnostics n=row_count;
 return n;
end $$;

create or replace function public.dd_refresh_research_coverage_gaps()
returns integer
language plpgsql security invoker set search_path=''
as $$
declare n int:=0;
begin
 insert into public.dd_research_coverage_gaps(gap_key,program_key,open_work_items,p0_open,p1_open,active_sources,gap_status,priority,next_action,observed_at,updated_at)
 select 'PROGRAM:'||w.program_key,w.program_key,
   count(*) filter(where w.status not in ('GREEN','COMPLETED')),
   count(*) filter(where w.status not in ('GREEN','COMPLETED') and w.priority='P0'),
   count(*) filter(where w.status not in ('GREEN','COMPLETED') and w.priority='P1'),
   coalesce((select count(*) from public.dd_research_sources s where s.program_key=w.program_key and s.status='ACTIVE'),0),
   case when count(*) filter(where w.status not in ('GREEN','COMPLETED'))=0 then 'COVERED'
        when coalesce((select count(*) from public.dd_research_sources s where s.program_key=w.program_key and s.status='ACTIVE'),0)=0 then 'BLOCKED'
        else 'OPEN' end,
   case when count(*) filter(where w.status not in ('GREEN','COMPLETED') and w.priority='P0')>0 then 'P0'
        when count(*) filter(where w.status not in ('GREEN','COMPLETED') and w.priority='P1')>0 then 'P1' else 'P2' end,
   case when coalesce((select count(*) from public.dd_research_sources s where s.program_key=w.program_key and s.status='ACTIVE'),0)=0
        then 'Add or verify an authoritative source.' else 'Continue governed research and evidence synthesis.' end,
   now(),now()
 from public.dd_research_work_queue w group by w.program_key
 on conflict(gap_key) do update set open_work_items=excluded.open_work_items,p0_open=excluded.p0_open,p1_open=excluded.p1_open,
 active_sources=excluded.active_sources,gap_status=excluded.gap_status,priority=excluded.priority,next_action=excluded.next_action,observed_at=now(),updated_at=now();
 get diagnostics n=row_count; return n;
end $$;

create or replace function public.dd_run_balanced_research_dispatch()
returns uuid
language plpgsql security invoker set search_path=''
as $$
declare v_id uuid; v_max int:=8;
begin
 select max_total_sources_per_cycle into v_max from public.dd_research_capacity_policy where enabled=true order by updated_at desc limit 1;
 v_max:=coalesce(v_max,8);
 perform public.dd_refresh_research_coverage_gaps();
 insert into public.dd_research_dispatch_runs(status,selected_sources,coverage_gaps_open,service_discovery_selected,non_service_selected,summary)
 select 'COMPLETED',
   coalesce(jsonb_agg(jsonb_build_object('source_key',x.source_key,'program_key',x.program_key,'authority_level',x.authority_level)),'[]'::jsonb),
   (select count(*) from public.dd_research_coverage_gaps where gap_status='OPEN'),
   count(*) filter(where x.program_key ilike '%SERVICE%'),
   count(*) filter(where x.program_key not ilike '%SERVICE%'),
   jsonb_build_object('execution_authority','RESEARCH_DISPATCH_ONLY','external_contact',false,'money_action',false)
 from (
  select s.source_key,s.program_key,s.authority_level
  from public.dd_research_sources s
  join public.dd_research_coverage_gaps g on g.program_key=s.program_key and g.gap_status='OPEN'
  where s.status='ACTIVE' and coalesce(s.next_check_at,now())<=now()
  order by case g.priority when 'P0' then 1 when 'P1' then 2 else 3 end,s.next_check_at nulls first
  limit v_max
 ) x returning id into v_id;
 return v_id;
end $$;

create or replace view public.dd_enterprise_control_health_v1 with (security_invoker=true) as
select
 (select count(*) from public.dd_owner_attention_queue where status='OPEN')::integer owner_attention_open,
 (select count(*) from public.dd_owner_attention_queue where status='OPEN' and priority='P0')::integer owner_attention_p0,
 (select count(*) from public.dd_external_action_outbox where status='PENDING')::integer external_actions_pending,
 (select count(*) from public.dd_external_action_outbox where status='CLAIMED')::integer external_actions_claimed,
 (select count(*) from public.dd_external_action_outbox where status='RETRY_WAIT')::integer external_actions_retry_wait,
 (select count(*) from public.dd_external_action_outbox where status='DEAD_LETTER')::integer external_actions_dead_letter,
 (select count(*) from public.dd_agent_run_control where status='RUNNING')::integer agent_runs_running,
 (select count(*) from public.dd_agent_run_control where breaker_reason is not null and completed_at is null)::integer agent_runs_broken,
 (select count(*) from public.dd_research_work_queue where status<>'GREEN')::integer research_open,
 (select count(*) from public.dd_software_build_work_queue where status not in ('COMPLETED','GREEN','CANCELLED'))::integer software_work_open,
 now() observed_at;

create or replace function public.dd_run_enterprise_control_plane()
returns uuid language plpgsql security invoker set search_path=''
as $$
declare v_id uuid:=gen_random_uuid(); v_safe uuid; v_discovery uuid; v_commercial uuid; h record; v_status text:='COMPLETED';
begin
 insert into public.dd_enterprise_control_runs(id,status) values(v_id,'STARTED');
 perform public.dd_refresh_research_coverage_gaps();
 begin select public.dd_run_safe_automation_recipes() into v_safe; exception when others then v_safe:=null; end;
 begin select public.dd_run_service_discovery_controller() into v_discovery; exception when others then v_discovery:=null; end;
 begin select public.dd_run_commercial_reconciliation() into v_commercial; exception when others then v_commercial:=null; end;
 select * into h from public.dd_enterprise_control_health_v1;
 if h.external_actions_dead_letter>0 or h.agent_runs_broken>0 then v_status:='DEGRADED'; end if;
 update public.dd_enterprise_control_runs set completed_at=now(),status=v_status,
 safe_automation_run_id=v_safe,service_discovery_run_id=v_discovery,commercial_reconciliation_run_id=v_commercial,
 owner_attention_open=h.owner_attention_open,external_actions_pending=h.external_actions_pending,external_actions_claimed=h.external_actions_claimed,
 external_actions_retry_wait=h.external_actions_retry_wait,external_actions_dead_letter=h.external_actions_dead_letter,
 agent_runs_running=h.agent_runs_running,agent_runs_broken=h.agent_runs_broken,
 summary=jsonb_build_object('mode','PRODUCTION_CONTROL_PLANE','external_side_effects_executed',false,'money_movement_authorized',false,
 'provider_authorization_mutated',false,'pricing_or_service_publication',false,'research_open',h.research_open,'software_work_open',h.software_work_open,
 'owner_attention_p0',h.owner_attention_p0,'observed_at',h.observed_at)
 where id=v_id;
 return v_id;
exception when others then
 update public.dd_enterprise_control_runs set completed_at=now(),status='FAILED',summary=jsonb_build_object('error',sqlerrm,'external_side_effects_executed',false) where id=v_id;
 raise;
end $$;

revoke all on function public.dd_evaluate_intelligence_collection_gate(text) from public,anon,authenticated;
revoke all on function public.dd_ingest_intelligence_observation(jsonb) from public,anon,authenticated;
revoke all on function public.dd_route_intelligence_observation(uuid) from public,anon,authenticated;
revoke all on function public.dd_refresh_research_coverage_gaps() from public,anon,authenticated;
revoke all on function public.dd_run_balanced_research_dispatch() from public,anon,authenticated;
revoke all on function public.dd_run_enterprise_control_plane() from public,anon,authenticated;
grant execute on function public.dd_evaluate_intelligence_collection_gate(text) to service_role;
grant execute on function public.dd_ingest_intelligence_observation(jsonb) to service_role;
grant execute on function public.dd_route_intelligence_observation(uuid) to service_role;
grant execute on function public.dd_refresh_research_coverage_gaps() to service_role;
grant execute on function public.dd_run_balanced_research_dispatch() to service_role;
grant execute on function public.dd_run_enterprise_control_plane() to service_role;

insert into public.dd_research_capacity_policy(policy_key,enabled,max_sources_per_program_per_cycle,max_total_sources_per_cycle,reserve_non_service_discovery_pct,protected_programs)
values('PRODUCTION_BALANCED_RESEARCH_V1',true,2,8,75,array['WORKFORCE_ECONOMICS','PROTECTION_BENEFITS','COMMERCIAL_INTELLIGENCE'])
on conflict(policy_key) do nothing;

insert into public.dd_intelligence_miners(miner_key,miner_family,miner_name,purpose,output_class,default_route)
values
 ('OPPORTUNITY_MINER','OPPORTUNITY','Opportunity Miner','Find procurement, RFP, contracting, grant and subcontracting signals',array['OPPORTUNITY'],array['RESEARCH_QUEUE']),
 ('PROPERTY_MINER','PROPERTY','Property Miner','Find apartment, property-management, listing, turn and expansion signals',array['PROPERTY_SIGNAL'],array['PROPERTY_INTELLIGENCE']),
 ('MARKET_ECONOMICS_MINER','ECONOMICS','Market & Economics Miner','Track pricing, labor, material, travel and platform economics',array['ECONOMIC_SIGNAL'],array['MARKET_INTELLIGENCE']),
 ('SERVICE_MINER','SERVICE','Service Miner','Find service gaps, bundles and adjacent demand',array['SERVICE_SIGNAL'],array['RESEARCH_QUEUE']),
 ('PROVIDER_MINER','PROVIDER','Provider & Vendor Miner','Find providers, suppliers, subcontractors and partners',array['SUPPLY_SIGNAL'],array['PROVIDER_INTELLIGENCE']),
 ('CUSTOMER_INTENT_MINER','SALES','Customer & Intent Miner','Find public demand and buyer-intent signals',array['LEAD_SIGNAL'],array['SALES_RESEARCH']),
 ('COMPETITOR_MINER','ECONOMICS','Competitor Miner','Track competitor offers, reviews, gaps and market movement',array['COMPETITOR_SIGNAL'],array['MARKET_INTELLIGENCE']),
 ('FUNDING_MINER','OPPORTUNITY','Funding & Capital Miner','Find grants, loans, certifications and equipment programs',array['FUNDING_SIGNAL'],array['RESEARCH_QUEUE']),
 ('COMPLIANCE_MINER','COMPLIANCE','Compliance & Legal Miner','Track regulatory, licensing and contracting changes',array['RISK_SIGNAL'],array['RISK_REVIEW']),
 ('TECHNOLOGY_MINER','TECHNOLOGY','Technology Miner','Track tools, APIs and platform changes useful to DANI',array['TECH_SIGNAL'],array['RESEARCH_QUEUE']),
 ('CONTENT_TREND_MINER','CONTENT','Content & Trend Miner','Track language, search demand, trends and social signals',array['TREND_SIGNAL'],array['MARKET_INTELLIGENCE']),
 ('EXPANSION_MINER','PROPERTY','Property & Expansion Miner','Track Georgia/SC footprint and flex-property opportunities',array['EXPANSION_SIGNAL'],array['PROPERTY_INTELLIGENCE'])
on conflict(miner_key) do update set miner_name=excluded.miner_name,purpose=excluded.purpose,status='ACTIVE',updated_at=now();

insert into public.dd_intelligence_sources(source_key,source_name,source_family,access_mode,public_source,terms_review_required,robots_respect_required,allowed_collection_scope,default_miner_keys,terms_gate_status,rate_limit_per_hour,collector_execution_allowed)
values
 ('SAM_GOV','SAM.gov','GOVERNMENT','PUBLIC_API',true,false,true,'{"scope":"public opportunity data"}',array['OPPORTUNITY_MINER','FUNDING_MINER'],'NOT_REQUIRED',12,true),
 ('GA_PROCUREMENT','Georgia Procurement','GOVERNMENT','PUBLIC_WEB',true,false,true,'{"scope":"public procurement data"}',array['OPPORTUNITY_MINER'],'NOT_REQUIRED',12,true),
 ('CENSUS_PUBLIC','US Census Public Data','GOVERNMENT','PUBLIC_API',true,false,true,'{"scope":"public statistics"}',array['MARKET_ECONOMICS_MINER','EXPANSION_MINER'],'NOT_REQUIRED',12,true),
 ('GMAIL_AUTHORIZED','Authorized DANI Gmail','FIRST_PARTY','AUTHORIZED_CONNECTOR',false,false,false,'{"scope":"authorized DANI mailboxes"}',array['CUSTOMER_INTENT_MINER','OPPORTUNITY_MINER','COMPLIANCE_MINER'],'NOT_REQUIRED',60,true),
 ('HUBSPOT_AUTHORIZED','Authorized DANI HubSpot','FIRST_PARTY','AUTHORIZED_CONNECTOR',false,false,false,'{"scope":"authorized DANI CRM"}',array['CUSTOMER_INTENT_MINER'],'NOT_REQUIRED',60,true),
 ('DANI_FIRST_PARTY_WEB','DANI First-Party Web','FIRST_PARTY','FIRST_PARTY',false,false,false,'{"scope":"DANI-owned web properties"}',array['CUSTOMER_INTENT_MINER','CONTENT_TREND_MINER'],'NOT_REQUIRED',60,true),
 ('PUBLIC_WEB_GENERAL','General Public Web','PUBLIC_WEB','PUBLIC_WEB',true,true,true,'{"scope":"public pages only"}',array['COMPETITOR_MINER','SERVICE_MINER','CONTENT_TREND_MINER'],'PENDING',30,false),
 ('LINKEDIN_PUBLIC_BUSINESS','LinkedIn Public Business','PUBLIC_WEB','PUBLIC_WEB',true,true,true,'{"scope":"public business pages only"}',array['CUSTOMER_INTENT_MINER','PROVIDER_MINER'],'PENDING',20,false),
 ('ZILLOW_PUBLIC','Zillow Public','PUBLIC_WEB','PUBLIC_WEB',true,true,true,'{"scope":"public property signals only"}',array['PROPERTY_MINER','EXPANSION_MINER'],'PENDING',20,false),
 ('APARTMENTS_PUBLIC','Apartments.com Public','PUBLIC_WEB','PUBLIC_WEB',true,true,true,'{"scope":"public property signals only"}',array['PROPERTY_MINER'],'PENDING',20,false)
on conflict(source_key) do update set status='ACTIVE',updated_at=now();

do $$
declare jid bigint;
begin
 select jobid into jid from cron.job where jobname='dani-balanced-research-dispatch-production';
 if jid is not null then perform cron.unschedule(jid); end if;
 perform cron.schedule('dani-balanced-research-dispatch-production','1,16,31,46 * * * *','select public.dd_run_balanced_research_dispatch();');
 select jobid into jid from cron.job where jobname='dani-enterprise-control-plane-production';
 if jid is not null then perform cron.unschedule(jid); end if;
 perform cron.schedule('dani-enterprise-control-plane-production','9,19,29,39,49,59 * * * *','select public.dd_run_enterprise_control_plane();');
end $$;
