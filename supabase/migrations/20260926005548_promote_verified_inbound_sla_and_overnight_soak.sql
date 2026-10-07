
create or replace function public.dd_run_safe_automation_recipes()
returns uuid
language plpgsql
security definer
set search_path to 'public'
as $function$
declare r uuid:=gen_random_uuid(); n int:=0; t int:=0;
begin
  insert into dd_owner_attention_queue(domain,source_table,source_record_id,reason,priority,recommended_action,metadata)
  select 'SALES','dd_sales_queue',s.id::text,'Speed-to-lead SLA exceeded','P1','Review and respond through Sales.',
         jsonb_build_object('source',s.source,'age_minutes',round(extract(epoch from(now()-coalesce(s.source_occurred_at,s.created_at)))/60))
  from dd_sales_queue s
  where coalesce(s.do_not_contact,false)=false
    and s.disposition='NOT_CONTACTED'
    and (s.phone is not null or s.email is not null)
    and coalesce(s.source_occurred_at,s.created_at)<now()-interval '30 minutes'
    and (
      upper(coalesce(s.lead_origin_class,'')) in('THUMBTACK','DANI_PAID_INBOUND','REAL_INBOUND','CUSTOMER_INBOUND')
      or (
        upper(coalesce(s.source_direction,''))='INBOUND'
        and upper(coalesce(s.source,'')) not in('GMAIL_SENT','WEB_SOURCED','LINKEDIN_MESSAGE','LINKEDIN_MARKETPLACE','LINKEDIN_INVITE','HUBSPOT_DEAL')
      )
    )
  on conflict do nothing;
  get diagnostics n=row_count; t:=t+n;

  insert into dd_owner_attention_queue(domain,source_table,source_record_id,reason,priority,recommended_action,metadata)
  select 'OPERATIONS','dd_jobs',j.id::text,'Job SLA deadline exceeded','P0','Review assignment/status and recover the job.',
         jsonb_build_object('job_status',j.job_status,'sla_due_at',j.sla_due_at)
  from dd_jobs j
  where j.sla_due_at is not null and j.sla_due_at<now()
    and coalesce(j.job_status,'') not in('COMPLETED','CANCELLED','CLOSED')
  on conflict do nothing;
  get diagnostics n=row_count; t:=t+n;

  insert into dd_owner_attention_queue(domain,source_table,source_record_id,reason,priority,recommended_action,metadata)
  select 'QA','dd_jobs',j.id::text,'Completed job has no job evidence','P0','Collect/verify required evidence before closeout.',
         jsonb_build_object('job_status',j.job_status)
  from dd_jobs j
  where j.job_status in('COMPLETED','CLOSED')
    and not exists(select 1 from dd_job_evidence e where e.job_id=j.id)
  on conflict do nothing;
  get diagnostics n=row_count; t:=t+n;

  insert into dd_automation_recipe_runs(id,recipe_key,status,matched_count,actioned_count,evidence,completed_at)
  values(r,'safe_automation_sweep','COMPLETED',t,t,
         jsonb_build_object('mode','detect_and_queue','external_side_effects',false,'sales_sla_requires_verified_inbound',true),now());

  update dd_automation_recipes set last_run_at=now() where is_active;
  return r;
end
$function$;

revoke all on function public.dd_run_safe_automation_recipes() from public, anon, authenticated;
grant execute on function public.dd_run_safe_automation_recipes() to service_role;

with valid as (
  select s.id::text id
  from dd_sales_queue s
  where coalesce(s.do_not_contact,false)=false
    and s.disposition='NOT_CONTACTED'
    and (s.phone is not null or s.email is not null)
    and coalesce(s.source_occurred_at,s.created_at)<now()-interval '30 minutes'
    and (
      upper(coalesce(s.lead_origin_class,'')) in('THUMBTACK','DANI_PAID_INBOUND','REAL_INBOUND','CUSTOMER_INBOUND')
      or (
        upper(coalesce(s.source_direction,''))='INBOUND'
        and upper(coalesce(s.source,'')) not in('GMAIL_SENT','WEB_SOURCED','LINKEDIN_MESSAGE','LINKEDIN_MARKETPLACE','LINKEDIN_INVITE','HUBSPOT_DEAL')
      )
    )
)
update dd_owner_attention_queue q
set status='SUPERSEDED',
    resolved_at=now(),
    metadata=coalesce(q.metadata,'{}'::jsonb)||
      jsonb_build_object('superseded_reason','NOT_VERIFIED_INBOUND_SLA','reconciled_at',now(),'environment','PRODUCTION','promotion_candidate','SAFE_AUTOMATION_VERIFIED_INBOUND_SLA_V1')
where q.status='OPEN'
  and q.reason='Speed-to-lead SLA exceeded'
  and not exists(select 1 from valid v where v.id=q.source_record_id);

create or replace function public.dd_capture_overnight_soak_receipt()
returns uuid
language plpgsql
security definer
set search_path to 'public'
as $function$
declare v_id uuid;
begin
  insert into public.dd_overnight_soak_receipts(
    research_queued,owner_attention_open,commercial_conflicts,support_ready,services_total,
    capability_researching,evidence_stale,notes
  )
  values(
    (select count(*) from public.dd_research_work_queue where status='QUEUED'),
    (select count(*) from public.dd_owner_attention_queue where status='OPEN'),
    coalesce((select conflicts from public.dd_commercial_reconciliation_runs order by completed_at desc nulls last limit 1),0),
    (select count(*) from public.dd_service_support_readiness where support_ready),
    (select count(*) from public.dd_service_support_readiness),
    (select count(*) from public.dd_capability_gap_queue where status='RESEARCHING'),
    (select count(*) from public.dd_research_evidence_registry where status='STALE'),
    jsonb_build_object('purpose','overnight soak evidence','promotion_authority',false)
  )
  returning id into v_id;
  return v_id;
end
$function$;

revoke all on function public.dd_capture_overnight_soak_receipt() from public, anon, authenticated;
grant execute on function public.dd_capture_overnight_soak_receipt() to service_role;

select cron.schedule(
  'dani-overnight-soak-receipt-production',
  '53 */2 * * *',
  $cron$select public.dd_capture_overnight_soak_receipt();$cron$
)
where not exists(select 1 from cron.job where jobname='dani-overnight-soak-receipt-production');
