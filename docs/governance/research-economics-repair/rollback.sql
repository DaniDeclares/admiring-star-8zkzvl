-- Rollback for research_economics_repair (Tester). Data written by the repair is preserved by design:
-- PRICING:* work items and any evidence rows are never deleted (market evidence is append-only).
-- 1. restore pre-repair coverage + packet staging definitions
\i pre_repair_definitions.sql
-- 2. remove the pre-step call and summary key from the controller (reverse of the text patch)
do $unpatch$
declare d text; begin
 d:=pg_get_functiondef('public.dd_run_research_pipeline_controller()'::regprocedure);
 d:=replace(d,E' perform public.dd_pricing_research_pre_step();\n','');
 d:=replace(d,'''pricing_pre_step'',coalesce(nullif(current_setting(''dani.pricing_pre_step'',true),''''),''{}'')::jsonb,','');
 execute d;
end $unpatch$;
-- 3. drop added objects (dispatch stops; existing work items remain as inert QUEUED rows)
drop function if exists public.dd_pricing_research_pre_step();
drop function if exists public.dd_dispatch_pricing_research_batch(int,int);
drop function if exists public.dd_record_service_market_observation(text,text,text,text,text,int,int,text,text,text,text,timestamptz,text,text);
drop function if exists public.dd_refresh_service_evidence_counts(uuid);
drop view if exists public.dd_service_market_evidence_assessment_v1;
drop function if exists public.dd_market_evidence_fresh_days();
