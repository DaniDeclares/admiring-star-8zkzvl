-- Tester-only proof. Runs inside one DO block and ends with RAISE EXCEPTION so EVERYTHING rolls back.
-- Fixture rows use research_run 'TEST-FIXTURE-ROLLED-BACK' and https://example.test URLs: they are NOT market data.
-- Note: aggregate/sub-selects in the same statement as a volatile write do not see that write; keep reads in later statements.
do $proof$
declare r jsonb:='{}'::jsonb; v_sku text; v_svc uuid; v_master uuid; x jsonb; run_id uuid; pre_prices text;
begin
 pre_prices:=(select md5(string_agg(coalesce(proposed_price_cents::text,'n')||'/'||coalesce(current_price_cents::text,'n'),',' order by service_id)) from dd_service_pricing_research_queue);
 run_id:=public.dd_run_research_pipeline_controller();                       -- full controller on real data
 r:=r||jsonb_build_object('controller_summary',(select summary from dd_research_pipeline_runs where id=run_id));
 x:=public.dd_execute_research_work_v1(24);                                  -- existing executor, unmodified
 r:=r||jsonb_build_object('executor',x,'dispatched_states',(select jsonb_object_agg(status||'/'||coalesce(blocker,'-'),c) from (select status,blocker,count(*) c from dd_research_work_queue where program_key='SERVICE_PRICE_OBSERVATION' group by 1,2) t));
 select q.canonical_sku, q.service_id into v_sku, v_svc from dd_research_work_queue w join dd_service_pricing_research_queue q on q.canonical_sku=substr(w.work_key,9)
   where w.program_key='SERVICE_PRICE_OBSERVATION' and q.evidence_count=0 and exists(select 1 from dd_master_service_universe m where m.canonical_sku=q.canonical_sku) order by w.created_at limit 1;
 r:=r||jsonb_build_object('fixture_sku',v_sku,'ingest',jsonb_build_array(
   public.dd_record_service_market_observation(v_sku,'Fixture A','https://example.test/a','Atlanta','fixture A',10000,15000,'job','s','DIRECT','VERIFIED',now()-interval '5 days','TEST-FIXTURE-ROLLED-BACK'),
   public.dd_record_service_market_observation(v_sku,'Fixture B','https://example.test/b','Atlanta','fixture B',12000,12000,'JOB','s','DIRECT','SINGLE_SOURCE',now()-interval '6 days','TEST-FIXTURE-ROLLED-BACK'),
   public.dd_record_service_market_observation(v_sku,'Fixture C','https://example.test/c','Atlanta','fixture C',9000,14000,'JOB','s','DIRECT','VERIFIED',now()-interval '7 days','TEST-FIXTURE-ROLLED-BACK'),
   public.dd_record_service_market_observation(v_sku,'Fixture D','https://example.test/d','Atlanta','fixture D',4500,4500,'LABOR_HOUR','s','PARTIAL','VERIFIED',now()-interval '2 days','TEST-FIXTURE-ROLLED-BACK'),
   public.dd_record_service_market_observation(v_sku,'Fixture E stale','https://example.test/e','Atlanta','fixture E',1000,1000,'JOB','s','DIRECT','VERIFIED',now()-interval '400 days','TEST-FIXTURE-ROLLED-BACK'),
   public.dd_record_service_market_observation(v_sku,'Dup','https://example.test/a','Atlanta','fixture A',10000,15000,'JOB','s','DIRECT','VERIFIED',now()-interval '5 days','TEST-FIXTURE-ROLLED-BACK'),
   public.dd_record_service_market_observation(v_sku,'Bad unit','https://example.test/f','Atlanta','x',1,1,'FURLONG','s','DIRECT','VERIFIED',now(),'T'),
   public.dd_record_service_market_observation(v_sku,'Bad url','http://example.test/g','Atlanta','x',1,1,'JOB','s','DIRECT','VERIFIED',now(),'T'),
   public.dd_record_service_market_observation('NOPE','x','https://e.test','a','x',1,1,'JOB','s','DIRECT','VERIFIED',now(),'T')));
 r:=r||jsonb_build_object('assessment',(select jsonb_agg(to_jsonb(a)-'service_id') from dd_service_market_evidence_assessment_v1 a where a.service_id=v_svc),
   'work_item_after_ingest',(select status from dd_research_work_queue where work_key='PRICING:'||v_sku));
 select id into v_master from dd_master_service_universe where canonical_sku=v_sku;
 -- THEORETICAL baselines are constrained by dd_service_economic_baselines_theoretical_policy_chk to labor_rate = 30.00
 insert into dd_service_economic_baselines(master_service_id,runtime_service_id,evidence_status,estimated_duration_hours,labor_rate,materials_cost,travel_cost,other_direct_cost,travel_status,source_type,source_reference,source_date,notes)
   values(v_master,v_svc,'THEORETICAL_BASELINE',2.0,30,10,5,0,'PENDING_REAL_WORLD_MILEAGE','FIXTURE_ASSUMPTION','FIXTURE rolled back',current_date,'fixture');
 perform public.dd_refresh_pricing_research_economics(v_svc);
 r:=r||jsonb_build_object('economics',(select jsonb_build_object('modeled_direct_cost_cents',modeled_direct_cost_cents,'economics_ready',economics_ready,'status',economics_evidence_status,'min_viable_price_cents',minimum_viable_price_cents,'proposed_price_cents',proposed_price_cents) from dd_service_pricing_research_queue where service_id=v_svc),
   'same_job_at_60_per_hour_cents',round((2.0*60+10+5)*100));
 r:=r||jsonb_build_object('prices_unchanged',(select md5(string_agg(coalesce(proposed_price_cents::text,'n')||'/'||coalesce(current_price_cents::text,'n'),',' order by service_id)) from dd_service_pricing_research_queue)=pre_prices);
 begin update dd_service_market_evidence set notes='x' where id=(select id from dd_service_market_evidence limit 1); r:=r||jsonb_build_object('append_only','VIOLATED');
 exception when others then r:=r||jsonb_build_object('append_only','ENFORCED: '||sqlerrm); end;
 raise exception 'PROOF_RESULT %', r::text;
end $proof$;
