-- Tester owner brief: surface local bridge intake/quarantine health without pretending tester owns production transport receipts.

CREATE OR REPLACE FUNCTION public.dd_generate_owner_daily_brief()
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare v_id uuid;
begin
 insert into dd_owner_daily_briefs(brief_date,sales,operations,finance,research,software,attention)
 values(
 current_date,
 jsonb_build_object(
  'new_leads_24h',(select count(*) from dd_sales_queue where created_at>=now()-interval '24 hours'),
  'untouched_leads',(select count(*) from dd_sales_queue where disposition='NOT_CONTACTED'),
  'quote_requested',(select count(*) from dd_sales_queue where disposition in ('QUOTE_REQUESTED','READY_TO_BUY')),
  'source_mix',(select coalesce(jsonb_object_agg(source,n),'{}'::jsonb) from (select coalesce(source,'UNKNOWN') source,count(*) n from dd_sales_queue group by 1)x)
 ),
 jsonb_build_object(
  'open_jobs',(select count(*) from dd_jobs where coalesce(job_status,'') not in ('COMPLETED','CANCELLED','CLOSED')),
  'jobs_due_24h',(select count(*) from dd_jobs where scheduled_start between now() and now()+interval '24 hours'),
  'sla_overdue',(select count(*) from dd_jobs where sla_due_at<now() and coalesce(job_status,'') not in ('COMPLETED','CANCELLED','CLOSED')),
  'completed_missing_evidence',(select count(*) from dd_jobs j where j.job_status in ('COMPLETED','CLOSED') and not exists(select 1 from dd_job_evidence e where e.job_id=j.id))
 ),
 jsonb_build_object(
  'payments_24h',(select coalesce(sum(amount_received),0) from dd_payment_events where created_at>=now()-interval '24 hours' and upper(coalesce(payment_status,'')) in ('PAID','SUCCEEDED','SUCCESS','COMPLETED')),
  'unlinked_successful_payments',(select count(*) from dd_payment_events where upper(coalesce(payment_status,'')) in ('PAID','SUCCEEDED','SUCCESS','COMPLETED') and job_id is null),
  'open_invoices',(select count(*) from dd_invoices where upper(coalesce(invoice_status,'')) not in ('PAID','VOID','CANCELLED')),
  'provider_payables_open',(select count(*) from dd_provider_payables where upper(coalesce(status,'')) not in ('PAID','CANCELLED'))
 ),
 jsonb_build_object(
  'research_queue_open',(select count(*) from dd_research_work_queue where upper(coalesce(status,'')) not in ('COMPLETED','CANCELLED','DONE')),
  'pricing_queue_open',(select count(*) from dd_service_pricing_research_queue where upper(coalesce(research_status,'')) not in ('COMPLETE','COMPLETED','APPROVED')),
  'bridge_quarantined_work',(select count(*) from dd_research_work_queue where metadata->>'bridge_boundary_quarantine'='true'),
  'bridge_quarantined_work_runnable',(select count(*) from dd_research_work_queue where metadata->>'bridge_boundary_quarantine'='true' and status not in ('BLOCKED','COMPLETED','COMPLETE','GREEN','EVIDENCED'))
 ),
 jsonb_build_object(
  'build_ready',(select count(*) from dd_software_build_work_queue where status='READY'),
  'build_blocked',(select count(*) from dd_software_build_work_queue where status='BLOCKED'),
  'platform_green',(select count(*) from dd_platform_release_audit_10_pass where status='GREEN'),
  'bridge_health',jsonb_build_object(
    'local_tester_reconciled_learning_receipts',(select count(*) from dd_environment_bridge_receipts where direction='PRODUCTION_TO_TESTER' and artifact_type='LEARNING_EVIDENCE' and bridge_status='RECONCILED'),
    'local_tester_blocked_learning_receipts',(select count(*) from dd_environment_bridge_receipts where direction='PRODUCTION_TO_TESTER' and artifact_type='LEARNING_EVIDENCE' and bridge_status='BLOCKED'),
    'active_production_bridge_intake',(select count(*) from dd_learning_evidence_intake where source_system='PRODUCTION_BRIDGE' and status<>'HOLD'),
    'held_production_bridge_intake',(select count(*) from dd_learning_evidence_intake where source_system='PRODUCTION_BRIDGE' and status='HOLD'),
    'active_personal_family_leaks',(select count(*) from dd_learning_evidence_intake where source_system='PRODUCTION_BRIDGE' and status<>'HOLD' and (evidence_key ilike '%FAMILY%' or evidence_key ilike '%HOUSEHOLD%' or evidence_key ilike '%SHADOW_SOL%' or domain in ('OWNER_PERSONAL','HOUSEHOLD','FAMILY','SHADOW_SOL') or coalesce(evidence_payload->>'project_scope','') ilike '%PERSONAL%' or coalesce(evidence_payload->>'project_scope','') ilike '%FAMILY%'))
  )
 ),
 jsonb_build_object(
  'p0',(select count(*) from dd_owner_attention_queue where status='OPEN' and priority='P0'),
  'p1',(select count(*) from dd_owner_attention_queue where status='OPEN' and priority='P1'),
  'total_open',(select count(*) from dd_owner_attention_queue where status='OPEN')
 ))
 on conflict(brief_date) do update set generated_at=now(),sales=excluded.sales,operations=excluded.operations,finance=excluded.finance,research=excluded.research,software=excluded.software,attention=excluded.attention
 returning id into v_id;
 return v_id;
end $function$
;
