
create or replace function public.dd_run_commercial_reconciliation() returns uuid language plpgsql security definer set search_path='public' as $$declare r uuid:=gen_random_uuid();nodes int:=0;edges int:=0;conf int:=0;begin
insert into dd_commercial_intelligence_nodes(node_type,node_key,node_name,channel_code) select 'CHANNEL',channel_code,channel_name,channel_code from dd_commercial_channels where status='ACTIVE' on conflict(node_type,node_key) do update set node_name=excluded.node_name,channel_code=excluded.channel_code,updated_at=now();
delete from dd_commercial_intelligence_nodes where node_type='CHANNEL' and node_key not in(select channel_code from dd_commercial_channels where status='ACTIVE');
select count(*) into nodes from dd_commercial_intelligence_nodes;select count(*) into edges from dd_commercial_intelligence_edges;
select count(*) into conf from dd_research_work_queue where status in('QUEUED','BLOCKED') and blocker in('CHANNEL_AUTHORITY_MISSING','CROSS_SELL_NOT_YET_GOVERNED');
insert into dd_commercial_reconciliation_runs(id,status,nodes,edges,conflicts,research_created,owner_decisions,evidence,completed_at) values(r,case when conf>0 then 'PARTIAL' else 'GREEN' end,nodes,edges,conf,0,(select count(*) from dd_owner_attention_queue where status='OPEN'),jsonb_build_object('channel_authority','dd_commercial_channels','official_channels',(select jsonb_agg(channel_code order by channel_code) from dd_commercial_channels where status='ACTIVE'),'b2b2c_is_relationship_model',true,'no_legacy_ch06_inference',true),now());return r;end$$;
create or replace view public.dd_commercial_intelligence_summary_v1 as select
(select count(*) from dd_commercial_intelligence_nodes where node_type='DIVISION') divisions,
(select count(*) from dd_commercial_intelligence_nodes where node_type='CHANNEL') channels,
(select count(*) from dd_commercial_intelligence_nodes where node_type='SERVICE') services,
(select count(*) from dd_commercial_intelligence_edges where relationship_type='SELLABLE_OR_REVIEWABLE_IN') explicit_channel_edges,
(select count(*) from dd_research_work_queue where status in('QUEUED','BLOCKED') and blocker='CHANNEL_AUTHORITY_MISSING') channel_mapping_gaps,
(select count(*) from dd_research_work_queue where status in('QUEUED','BLOCKED') and blocker='CROSS_SELL_NOT_YET_GOVERNED') cross_sell_research_items,
(select count(*) from dd_service_discovery_candidates where activation_prohibited) service_candidates_blocked_from_activation,
(select count(*) from dd_operator_dashboard_external_tasks where provider='ASANA' and task_status<>'COMPLETED') asana_open_tasks,
(select count(*) from dd_owner_attention_queue where status='OPEN') owner_attention_open;
