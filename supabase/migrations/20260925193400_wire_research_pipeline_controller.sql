-- TESTER-first research pipeline orchestration.
-- Advances only when existing governed evidence satisfies the gate.
-- Does not invent provider authority, support policy, cross-sell policy, or production release state.

create table if not exists public.dd_research_pipeline_runs (
  id uuid primary key default gen_random_uuid(),
  started_at timestamptz not null default now(),
  completed_at timestamptz,
  status text not null default 'STARTED',
  pricing_economics_refreshed integer not null default 0,
  pricing_coverage_refreshed integer not null default 0,
  leads_promoted integer not null default 0,
  channel_items_resolved integer not null default 0,
  support_items_resolved integer not null default 0,
  fulfillment_items_resolved integer not null default 0,
  activation_items_resolved integer not null default 0,
  research_triggered boolean not null default false,
  summary jsonb not null default '{}'::jsonb
);
alter table public.dd_research_pipeline_runs enable row level security;

create or replace function public.dd_run_research_pipeline_controller()
returns uuid language plpgsql security definer set search_path=public,private as $$
declare v_id uuid:=gen_random_uuid(); v_pricing int:=0; v_coverage int:=0; v_leads int:=0; v_channel int:=0; v_support int:=0; v_fulfillment int:=0; v_activation int:=0; v_triggered boolean:=false;
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
 begin perform private.dd_trigger_research_engine(); v_triggered:=true; exception when others then v_triggered:=false; end;

 update public.dd_research_pipeline_runs set completed_at=now(),status='COMPLETED',pricing_economics_refreshed=v_pricing,pricing_coverage_refreshed=v_coverage,leads_promoted=v_leads,channel_items_resolved=v_channel,support_items_resolved=v_support,fulfillment_items_resolved=v_fulfillment,activation_items_resolved=v_activation,research_triggered=v_triggered,
 summary=jsonb_build_object('rule','advance only from existing governed evidence; never invent authority','cross_sell_auto_resolution',false,'remaining_open_research',(select count(*) from public.dd_research_work_queue where status<>'GREEN'),'pricing_review_ready',(select count(*) from public.dd_service_pricing_research_queue where research_status='REVIEW_READY')) where id=v_id;
 return v_id;
exception when others then update public.dd_research_pipeline_runs set completed_at=now(),status='FAILED',summary=jsonb_build_object('error',sqlerrm) where id=v_id; raise;
end $$;

do $$
declare jid bigint;
begin
 select jobid into jid from cron.job where jobname='dani-research-pipeline-controller-test';
 if jid is not null then perform cron.unschedule(jid); end if;
 perform cron.schedule('dani-research-pipeline-controller-test','4,14,24,34,44,54 * * * *','select public.dd_run_research_pipeline_controller();');
end $$;
