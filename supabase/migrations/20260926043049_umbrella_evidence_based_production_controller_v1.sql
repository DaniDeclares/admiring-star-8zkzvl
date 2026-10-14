
insert into public.dd_domain_external_evidence(evidence_key,domain,source_system,evidence_type,status,observed_at,valid_through,facts)
values
('QBO_CONNECTION_AND_REPORTS_2026-09-26','ACCOUNTING_MONEY','QUICKBOOKS','CONNECTION_AND_REPORTS','VERIFIED',now(),now()+interval '24 hours',
 '{"company":"Dani Declares LLC","pnl_status":"success","pnl_period_start":"2026-09-01","pnl_period_end":"2026-09-26","pnl_total_income":105.67,"pnl_total_expenses":0.00,"quickbooks_connection_verified":true}'::jsonb),
('PAYPAL_ACTIVITY_2026-09-01_2026-09-26','ACCOUNTING_MONEY','PAYPAL','TRANSACTION_ACTIVITY','VERIFIED',now(),now()+interval '24 hours',
 '{"transaction_records_observed":169,"pages_observed":2,"reconciliation_complete":false,"krystal_payment_verified":true,"krystal_payment_amount":110.00,"krystal_payment_transaction_id":"0D953425KG225914F"}'::jsonb)
on conflict(evidence_key) do update set status=excluded.status,observed_at=excluded.observed_at,valid_through=excluded.valid_through,facts=excluded.facts,updated_at=now();

create or replace function public.dd_evaluate_accounting_money_health()
returns jsonb language plpgsql security invoker set search_path=''
as $$
declare q public.dd_domain_external_evidence%rowtype; p public.dd_domain_external_evidence%rowtype; c jsonb; risk int:=0; st text; bl jsonb:='[]'::jsonb;
begin
 select * into q from public.dd_domain_external_evidence where evidence_key='QBO_CONNECTION_AND_REPORTS_2026-09-26';
 select * into p from public.dd_domain_external_evidence where evidence_key='PAYPAL_ACTIVITY_2026-09-01_2026-09-26';
 c:=public.dd_compute_job_cash_risk(72); risk:=coalesce((c->>'at_risk_count')::int,0);
 if q.id is null or q.status<>'VERIFIED' or coalesce((q.facts->>'quickbooks_connection_verified')::boolean,false)=false then
   st:='RED'; bl:=bl||jsonb_build_array(jsonb_build_object('code','QBO_CONNECTION_OR_REPORT_FAILURE','severity','P0'));
 elsif p.id is null or p.status<>'VERIFIED' then
   st:='YELLOW'; bl:=bl||jsonb_build_array(jsonb_build_object('code','PAYPAL_EVIDENCE_NOT_VERIFIED','severity','P1'));
 elsif coalesce((p.facts->>'reconciliation_complete')::boolean,false)=false then
   st:='YELLOW'; bl:=bl||jsonb_build_array(jsonb_build_object('code','PAYPAL_QBO_RECONCILIATION_INCOMPLETE','severity','P1'));
 elsif risk>0 then
   st:='YELLOW'; bl:=bl||jsonb_build_array(jsonb_build_object('code','JOB_CASH_RISK_REVIEW','severity','P1','count',risk));
 else st:='GREEN'; end if;
 return jsonb_build_object('domain','ACCOUNTING_MONEY','status',st,'cash_at_risk_count',risk,
   'quickbooks_connection_verified',coalesce((q.facts->>'quickbooks_connection_verified')::boolean,false),
   'quickbooks_reports_verified',q.status='VERIFIED','paypal_activity_verified',p.status='VERIFIED',
   'reconciliation_complete',coalesce((p.facts->>'reconciliation_complete')::boolean,false),'blockers',bl);
end $$;

create or replace function public.dd_apply_evidence_based_domain_health()
returns jsonb language plpgsql security invoker set search_path=''
as $$
declare a jsonb;
begin
 a:=public.dd_evaluate_accounting_money_health();
 update public.dd_company_domain_state
 set status=a->>'status',
     metrics=coalesce(metrics,'{}'::jsonb)||jsonb_build_object(
       'quickbooks_connection_verified',a->'quickbooks_connection_verified',
       'quickbooks_reports_verified',a->'quickbooks_reports_verified',
       'paypal_activity_verified',a->'paypal_activity_verified',
       'reconciliation_complete',a->'reconciliation_complete'),
     blockers=a->'blockers',
     evidence=jsonb_build_object('derived_by','dd_apply_evidence_based_domain_health','derived_at',now(),'no_green_inference',true),
     observed_at=now(),updated_at=now()
 where domain='ACCOUNTING_MONEY';

 update public.dd_company_domain_state
 set status=case
   when coalesce((metrics->>'services_total')::int,0)>0 and coalesce((metrics->>'support_ready')::int,0)>0 then 'GREEN'
   when coalesce((metrics->>'services_total')::int,0)>0 then 'YELLOW'
   else 'RED' end,
   evidence=coalesce(evidence,'{}'::jsonb)||jsonb_build_object('catalog_count_evidence',true,'derived_at',now()),
   observed_at=now(),updated_at=now()
 where domain='SERVICE_CATALOG';

 return jsonb_build_object('accounting',a,'production_mutation',true);
end $$;

create or replace function public.dd_refresh_company_domain_state()
returns jsonb
language plpgsql security definer set search_path=''
as $$
declare
 v_q int:=0; v_att int:=0; v_leads int:=0; v_jobs int:=0; v_sw int:=0; v_support int:=0; v_services int:=0; v_caps int:=0; v_conf int:=0;
 v_provider_metrics jsonb:='{}'::jsonb; v_provider_blockers jsonb:='[]'::jsonb; v_cash jsonb;
begin
 select count(*) into v_q from public.dd_research_work_queue where status='QUEUED';
 select count(*) into v_att from public.dd_owner_attention_queue where status='OPEN';
 select count(*) into v_leads from public.dd_sales_queue;
 select count(*) into v_jobs from public.dd_jobs where upper(coalesce(job_status,'')) not in ('COMPLETED','CLOSED','CANCELLED');
 select count(*) into v_services from public.services where coalesce(is_active,true)=true;
 select count(*) into v_support from public.dd_service_support_readiness where support_ready;
 select count(*) into v_sw from public.dd_software_build_work_queue where status not in ('COMPLETED','GREEN','CANCELLED');
 select count(*) into v_caps from public.dd_capability_gap_queue where status='RESEARCHING';
 select coalesce((select conflicts from public.dd_commercial_reconciliation_runs order by completed_at desc nulls last limit 1),0) into v_conf;
 v_cash:=public.dd_compute_job_cash_risk(72);
 begin select jsonb_build_object('provider_orgs',provider_orgs,'approved_orgs',approved_orgs,'qualified_orgs',qualified_orgs,
  'duplicate_provider_orgs',duplicate_provider_orgs,'orgs_with_authorized_capabilities',orgs_with_authorized_capabilities,'orgs_with_active_portal',orgs_with_active_portal)
  into v_provider_metrics from public.dd_provider_intelligence_summary_v1; exception when others then v_provider_metrics:='{}'::jsonb; end;
 begin select coalesce(jsonb_agg(jsonb_build_object('provider_org_id',provider_org_id,'provider_org_name',provider_org_name,'status',intelligence_status,
  'active_provider_records',active_provider_records,'authorized_capabilities',authorized_capabilities,'active_portal_identities',active_portal_identities))
  filter(where intelligence_status in ('DUPLICATE_PROVIDER_RECORDS','ORG_EVIDENCED_CAPABILITY_MISSING','INSUFFICIENT_EVIDENCE')),'[]'::jsonb)
  into v_provider_blockers from public.dd_provider_intelligence_v1; exception when others then v_provider_blockers:='[]'::jsonb; end;

 update public.dd_company_domain_state set
  status=case
   when domain='FULFILLMENT_DISPATCH' then case when v_jobs>0 then 'RED' else 'YELLOW' end
   when domain='SOFTWARE_PLATFORM' then 'YELLOW'
   when domain in ('PROVIDER_OPERATIONS','CUSTOMER_SUCCESS_SUPPORT','SERVICE_CATALOG','COMMERCIAL_INTELLIGENCE','PRICING_ECONOMICS','COMPLIANCE_RISK','INTEGRATIONS','DATA_QUALITY') then 'YELLOW'
   else status end,
  metrics=case domain
   when 'SALES_REVENUE' then jsonb_build_object('sales_queue',v_leads)
   when 'FULFILLMENT_DISPATCH' then jsonb_build_object('open_jobs',v_jobs,'e2e_proof',false)
   when 'ACCOUNTING_MONEY' then jsonb_build_object('cash_at_risk_jobs',v_cash->'jobs','cash_at_risk_count',v_cash->'at_risk_count','cash_risk_computed_at',v_cash->'computed_at','cash_risk_note',v_cash->'note')
   when 'PROVIDER_OPERATIONS' then coalesce(v_provider_metrics,'{}'::jsonb)||jsonb_build_object('capability_researching',v_caps,'subsystem_in_production',true)
   when 'CUSTOMER_SUCCESS_SUPPORT' then jsonb_build_object('support_ready',v_support,'services_total',v_services,'subsystem_in_production',true)
   when 'SERVICE_CATALOG' then jsonb_build_object('services_total',v_services,'support_ready',v_support,'subsystem_in_production',true)
   when 'COMMERCIAL_INTELLIGENCE' then jsonb_build_object('research_queued',v_q,'latest_conflicts',v_conf,'subsystem_in_production',true)
   when 'SOFTWARE_PLATFORM' then jsonb_build_object('non_green_build_work',v_sw,'autonomous_repair_executor',false,'subsystem_in_production',true)
   else metrics end,
  blockers=case when domain='PROVIDER_OPERATIONS' then v_provider_blockers else blockers end,
  evidence=jsonb_build_object('derived_by','dd_refresh_company_domain_state','derived_at',now(),'no_green_inference',true),
  observed_at=now(),updated_at=now();

 return jsonb_build_object('domains',16,'research_queued',v_q,'owner_attention_open',v_att,'services_total',v_services,'support_ready',v_support,
 'capability_researching',v_caps,'software_non_green',v_sw,'open_jobs',v_jobs,'provider_metrics',v_provider_metrics,'cash_at_risk_count',v_cash->'at_risk_count');
end $$;

create or replace function public.dd_run_company_controller()
returns uuid language plpgsql security definer set search_path=''
as $$
declare v_id uuid; v_g int; v_y int; v_r int; v_u int; v_o int; v_refresh jsonb; v_evidence jsonb;
begin
 insert into public.dd_company_controller_runs(status) values('RUNNING') returning id into v_id;
 v_refresh:=public.dd_refresh_company_domain_state();
 v_evidence:=public.dd_apply_evidence_based_domain_health();
 select count(*) filter(where status='GREEN'),count(*) filter(where status='YELLOW'),count(*) filter(where status='RED'),count(*) filter(where status='UNKNOWN')
 into v_g,v_y,v_r,v_u from public.dd_company_domain_state;
 select count(*) into v_o from public.dd_owner_attention_queue where status='OPEN';
 update public.dd_company_controller_runs set completed_at=now(),
 status=case when v_r>0 then 'RED' when v_y>0 or v_u>0 then 'YELLOW' else 'GREEN' end,
 domains_green=v_g,domains_yellow=v_y,domains_red=v_r,domains_unknown=v_u,owner_decisions=v_o,
 evidence=jsonb_build_object('refresh',v_refresh,'evidence_health',v_evidence,'no_external_side_effects',true,'production_authority',false)
 where id=v_id;
 return v_id;
end $$;

revoke all on function public.dd_evaluate_accounting_money_health() from public,anon,authenticated;
revoke all on function public.dd_apply_evidence_based_domain_health() from public,anon,authenticated;
revoke all on function public.dd_refresh_company_domain_state() from public,anon,authenticated;
revoke all on function public.dd_run_company_controller() from public,anon,authenticated;
grant execute on function public.dd_evaluate_accounting_money_health() to service_role;
grant execute on function public.dd_apply_evidence_based_domain_health() to service_role;
grant execute on function public.dd_refresh_company_domain_state() to service_role;
grant execute on function public.dd_run_company_controller() to service_role;
