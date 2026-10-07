
create or replace function private.dd_trigger_research_engine()
returns void language plpgsql security definer set search_path=public,private,vault,net as $$
declare v_key text; v_url text;
begin
  select decrypted_secret into v_key from vault.decrypted_secrets where name='dd_research_anon_key' limit 1;
  select decrypted_secret into v_url from vault.decrypted_secrets where name='dd_research_function_url' limit 1;
  if nullif(v_key,'') is null or nullif(v_url,'') is null then
    raise exception 'RESEARCH_ENGINE_CONFIG_MISSING';
  end if;
  perform net.http_post(
    url:=v_url,
    headers:=jsonb_build_object('Authorization','Bearer '||v_key,'apikey',v_key,'Content-Type','application/json'),
    body:=jsonb_build_object('source','supabase_pg_cron','triggered_at',now()),
    timeout_milliseconds:=20000
  );
end $$;

create or replace function public.dd_run_research_pipeline_controller()
returns uuid language plpgsql security definer set search_path=public,private as $$
declare v_id uuid:=gen_random_uuid(); v_pricing int:=0; v_coverage int:=0; v_leads int:=0; v_channel int:=0; v_support int:=0; v_fulfillment int:=0; v_activation int:=0; v_triggered boolean:=false; v_trigger_error text:=null;
begin
 insert into public.dd_research_pipeline_runs(id,status) values(v_id,'STARTED');
 select public.dd_refresh_pricing_research_economics(null) into v_pricing;
 select public.dd_refresh_pricing_coverage() into v_coverage;
 perform public.dd_refresh_evidence_freshness();

 update public.dd_research_work_queue q set status='GREEN',blocker=null,next_action='Satisfied automatically from current governed channel authorization evidence.',last_researched_at=now(),attempts=coalesce(attempts,0)+1,metadata=coalesce(metadata,'{}'::jsonb)||jsonb_build_object('auto_resolution','CHANNEL_AUTHORIZATION','resolved_at',now(),'authority','dd_service_release_contract_v1'),updated_at=now()
 from public.dd_service_release_contract_v1 r where q.program_key='SERVICE_DISCOVERY' and q.blocker='CHANNEL_AUTHORITY_MISSING' and q.status<>'GREEN' and q.metadata->>'canonical_sku'=r.canonical_sku and r.channel_authorization_ok is true;
 get diagnostics v_channel=row_count;

 update public.dd_research_work_queue q set status='GREEN',blocker=null,next_action='Satisfied automatically from governed service support-readiness evidence.',last_researched_at=now(),attempts=coalesce(attempts,0)+1,metadata=coalesce(metadata,'{}'::jsonb)||jsonb_build_object('auto_resolution','SUPPORT_READINESS','resolved_at',now(),'authority','dd_service_support_readiness'),updated_at=now()
 from public.dd_service_support_readiness s where q.program_key='SERVICE_DISCOVERY' and q.blocker='SUPPORT_RECOVERY_INCOMPLETE' and q.status<>'GREEN' and q.metadata->>'canonical_sku'=s.canonical_sku and s.support_ready is true;
 get diagnostics v_support=row_count;

 update public.dd_research_work_queue q set status='GREEN',blocker=null,next_action='Satisfied automatically from governed fulfillment-matrix evidence.',last_researched_at=now(),attempts=coalesce(attempts,0)+1,metadata=coalesce(metadata,'{}'::jsonb)||jsonb_build_object('auto_resolution','FULFILLMENT_MATRIX','resolved_at',now(),'authority','dd_service_release_contract_v1'),updated_at=now()
 from public.dd_service_release_contract_v1 r where q.program_key='SERVICE_DISCOVERY' and q.blocker='FULFILLMENT_CAPABILITY_UNPROVEN' and q.status<>'GREEN' and q.metadata->>'canonical_sku'=r.canonical_sku and r.fulfillment_matrix_ok is true;
 get diagnostics v_fulfillment=row_count;

 update public.dd_research_work_queue q set status='GREEN',blocker=null,next_action='All governed release-contract gates passed.',last_researched_at=now(),attempts=coalesce(attempts,0)+1,metadata=coalesce(metadata,'{}'::jsonb)||jsonb_build_object('auto_resolution','RELEASE_CONTRACT','resolved_at',now(),'authority','dd_service_release_contract_v1'),updated_at=now()
 from public.dd_service_release_contract_v1 r where q.program_key='SERVICE_DISCOVERY' and q.blocker='ACTIVATION_PROHIBITED_UNTIL_ALL_GATES_PASS' and q.status<>'GREEN' and q.metadata->>'canonical_sku'=r.canonical_sku and r.release_state='GREEN';
 get diagnostics v_activation=row_count;

 select public.dd_promote_verified_research_leads() into v_leads;
 begin perform private.dd_trigger_research_engine(); v_triggered:=true;
 exception when others then v_triggered:=false; v_trigger_error:=sqlerrm; end;

 update public.dd_research_pipeline_runs set completed_at=now(),status=case when v_triggered then 'COMPLETED' else 'DEGRADED' end,pricing_economics_refreshed=v_pricing,pricing_coverage_refreshed=v_coverage,leads_promoted=v_leads,channel_items_resolved=v_channel,support_items_resolved=v_support,fulfillment_items_resolved=v_fulfillment,activation_items_resolved=v_activation,research_triggered=v_triggered,
 summary=jsonb_build_object('rule','advance only from existing governed evidence; never invent authority','cross_sell_auto_resolution',false,'remaining_open_research',(select count(*) from public.dd_research_work_queue where status<>'GREEN'),'pricing_review_ready',(select count(*) from public.dd_service_pricing_research_queue where research_status='REVIEW_READY'),'research_trigger_error',v_trigger_error) where id=v_id;
 return v_id;
exception when others then update public.dd_research_pipeline_runs set completed_at=now(),status='FAILED',summary=jsonb_build_object('error',sqlerrm) where id=v_id; raise;
end $$;
