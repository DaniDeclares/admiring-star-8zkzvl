create or replace function public.dd_run_revenue_first_autonomy()
returns uuid language plpgsql security definer set search_path=public,private,pg_catalog as $$
declare v_id uuid:=gen_random_uuid(); v_buyers int:=0; v_verified int:=0; v_matched int:=0; v_quotes int:=0; v_followups int:=0; v_paid int:=0; v_jobs int:=0; v_recurring int:=0; v_before int:=0; v_after int:=0; v_progress int:=0; v_research boolean:=false; v_revenue jsonb; v_demand jsonb; v_intel jsonb;
begin
 insert into public.dd_revenue_autonomy_runs(id) values(v_id);
 v_demand:=private.dd_run_demand_radar(); v_intel:=public.dd_run_commercial_intelligence_cycle();
 select count(*) into v_before from public.dd_estimates where source_slug='sales_queue'; v_revenue:=public.dd_run_revenue_orchestrator(); select count(*) into v_after from public.dd_estimates where source_slug='sales_queue'; v_quotes:=greatest(0,v_after-v_before);
 select count(*) into v_buyers from public.dd_sales_queue s where coalesce(s.do_not_contact,false)=false and s.disposition not in ('NOT_INTERESTED','CLOSED_LOST');
 select count(*) into v_verified from public.dd_sales_queue s where coalesce(s.do_not_contact,false)=false and (coalesce(s.decision_maker_confirmed,false)=true or upper(coalesce(s.source_direction,''))='INBOUND' or upper(coalesce(s.source_confidence,''))='VERIFIED');
 select count(*) into v_matched from public.dd_sales_queue s where coalesce(s.do_not_contact,false)=false and s.suggested_sku is not null;
 select count(*) into v_followups from public.dd_sales_queue s where coalesce(s.do_not_contact,false)=false and s.next_action_date is not null and s.next_action_date<=current_date and s.disposition not in ('NOT_INTERESTED','PAYMENT_SUCCEEDED');
 select count(*) into v_paid from public.dd_sales_queue s where coalesce(s.amount_collected,0)>0 or s.disposition='PAYMENT_SUCCEEDED';
 select count(*) into v_jobs from public.dd_jobs j where coalesce(j.job_status,'') not in ('COMPLETED','CANCELLED','CLOSED');
 select count(*) into v_recurring from public.dd_sales_queue s where (coalesce(s.amount_collected,0)>0 or s.disposition='PAYMENT_SUCCEEDED' or s.job_id is not null) and coalesce(s.do_not_contact,false)=false and coalesce(s.sales_metadata->>'recurring_reviewed','false')<>'true';
 if v_verified<10 or v_matched<5 then perform public.dd_run_research_pipeline_controller(); v_research:=true; end if;
 v_progress:=v_quotes+coalesce((v_revenue->>'verified_leads_promoted')::int,0)+coalesce((v_demand->>'promoted_count')::int,0);
 update public.dd_revenue_autonomy_runs set completed_at=now(),status=case when v_progress>0 then 'ADVANCED_REVENUE' when v_followups>0 or v_matched>0 then 'REVENUE_WORK_AVAILABLE' else 'NO_REVENUE_MOVEMENT' end,buyers_available=v_buyers,buyers_verified=v_verified,offers_matched=v_matched,quote_drafts_created=v_quotes,followups_due=v_followups,paid_sales=v_paid,active_jobs=v_jobs,recurring_candidates=v_recurring,research_triggered=v_research,revenue_progress_score=v_progress,summary=jsonb_build_object('operating_rule','FIND_BUYER_VERIFY_MATCH_ECONOMICS_OUTREACH_FOLLOWUP_QUOTE_ACCEPT_PAYMENT_DISPATCH_QA_CROSS_SELL_RECURRING_MEASURE_LEARN_REPEAT','research_rule','Research is subordinate to a revenue decision and is triggered only when verified/matched funnel inventory is insufficient.','success_rule','A run is successful only when it advances a governed revenue state; execution alone is not success.','demand',v_demand,'commercial_intelligence',v_intel,'revenue_orchestrator',v_revenue,'external_contact',false,'money_action',false,'pricing_published',false,'owner_boundaries_preserved',true) where id=v_id;
 return v_id;
exception when others then update public.dd_revenue_autonomy_runs set completed_at=now(),status='FAILED',summary=jsonb_build_object('error',sqlerrm) where id=v_id; raise;
end $$;
revoke all on function public.dd_run_revenue_first_autonomy() from public,anon,authenticated;
grant execute on function public.dd_run_revenue_first_autonomy() to service_role,postgres;
