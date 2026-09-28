create or replace function public.dd_run_safe_execution_recipes()
returns uuid language plpgsql security definer set search_path='public' as $$
declare v_run uuid:=gen_random_uuid(); v_n int:=0; v_total int:=0;
begin
 update dd_sales_queue s
 set next_action=case when coalesce(s.next_action,'')='' then 'Follow up on verified sales lead' else s.next_action end,
     next_action_date=case when s.next_action_date is null or s.next_action_date<current_date then current_date else s.next_action_date end,
     updated_at=now()
 where coalesce(s.do_not_contact,false)=false and s.disposition='NOT_CONTACTED'
   and (s.phone is not null or s.email is not null)
   and coalesce(s.source_occurred_at,s.created_at)<now()-interval '30 minutes'
   and (s.next_action_date is null or s.next_action_date<=current_date)
   and coalesce(s.lane,'')<>'PARTNER'
   and coalesce(s.source,'') not in ('GMAIL_SENT','WEB_SOURCED','LINKEDIN_MESSAGE','LINKEDIN_MARKETPLACE','LINKEDIN_INVITE','HUBSPOT_DEAL')
   and lower(coalesce(s.contact_name,'')) not like '%test%'
   and upper(coalesce(s.next_action,'')) not like '%RELATIONSHIP RECOVERY HOLD%'
   and coalesce(s.campaign_suppression_reason,'') not ilike '%bounce%'
   and coalesce(s.campaign_suppression_reason,'') not ilike '%delivery failure%'
   and lower(coalesce(s.sales_metadata->>'relationship_type','')) not like '%partnership%'
   and lower(coalesce(s.sales_metadata->>'relationship_type','')) not like '%coaching%'
   and lower(coalesce(s.buyer_type,'')) not like 'government%'
   and lower(coalesce(s.sales_metadata->>'relationship_type',''))<>'unknown_inbound_caller';
 get diagnostics v_n=row_count; v_total:=v_total+v_n;

 insert into dd_followup_tasks(estimate_id,division_slug,task_type,status,due_at,notes)
 select e.id,e.division_slug,'QUOTE_RECOVERY','open',now(),'Internal recovery task only; outbound contact must satisfy consent/channel rules.'
 from dd_estimates e where e.estimate_status='sent' and e.updated_at<now()-interval '24 hours'
 and not exists(select 1 from dd_followup_tasks f where f.estimate_id=e.id and f.task_type='QUOTE_RECOVERY' and f.status in ('open','in_progress')) on conflict do nothing;
 get diagnostics v_n=row_count; v_total:=v_total+v_n;

 insert into dd_followup_tasks(estimate_id,division_slug,task_type,status,due_at,notes)
 select e.id,e.division_slug,'INTAKE_RECOVERY','open',now(),'Internal abandoned-intake review; do not auto-contact.'
 from dd_estimates e where e.estimate_status in ('new','needs_review') and e.updated_at<now()-interval '4 hours'
 and not exists(select 1 from dd_followup_tasks f where f.estimate_id=e.id and f.task_type='INTAKE_RECOVERY' and f.status in ('open','in_progress')) on conflict do nothing;
 get diagnostics v_n=row_count; v_total:=v_total+v_n;

 insert into dd_followup_tasks(job_id,division_slug,task_type,status,due_at,notes)
 select j.id,j.division_slug,'CUSTOMER_SUCCESS_REVIEW','open',now()+interval '2 hours','Evidence exists; review for approved thank-you/review/referral/repeat-service outreach.'
 from dd_jobs j where j.job_status in ('COMPLETED','CLOSED') and exists(select 1 from dd_job_evidence e where e.job_id=j.id)
 and not exists(select 1 from dd_followup_tasks f where f.job_id=j.id and f.task_type='CUSTOMER_SUCCESS_REVIEW' and f.status in ('open','in_progress')) on conflict do nothing;
 get diagnostics v_n=row_count; v_total:=v_total+v_n;

 insert into dd_owner_attention_queue(domain,source_table,source_record_id,reason,priority,recommended_action,metadata)
 select 'OPERATIONS','dd_job_assignments',a.id::text,'Provider offer expired without response','P1','Review next eligible provider; no automatic reassignment until dispatch lifecycle is proven.',
 jsonb_build_object('job_id',a.job_id,'provider_id',a.provider_id,'provider_org_id',a.provider_org_id,'offer_expires_at',a.offer_expires_at)
 from dd_job_assignments a where a.assignment_status='OFFERED' and a.offer_expires_at is not null and a.offer_expires_at<now() and a.response_at is null on conflict do nothing;

 insert into dd_lead_source_performance_snapshots(snapshot_date,source,lead_count,quoted_count,converted_count,quoted_amount,amount_collected)
 select current_date,coalesce(source,'UNKNOWN'),count(*),count(*) filter(where quoted_amount is not null and quoted_amount>0),
 count(*) filter(where job_id is not null or coalesce(amount_collected,0)>0),coalesce(sum(quoted_amount),0),coalesce(sum(amount_collected),0)
 from dd_sales_queue group by coalesce(source,'UNKNOWN')
 on conflict(snapshot_date,source) do update set lead_count=excluded.lead_count,quoted_count=excluded.quoted_count,converted_count=excluded.converted_count,quoted_amount=excluded.quoted_amount,amount_collected=excluded.amount_collected,created_at=now();

 insert into dd_provider_performance_snapshots(snapshot_date,provider_key,offers,accepts,rejects,expired_unanswered,acceptance_rate)
 select current_date,coalesce(provider_id::text,'ORG:'||provider_org_id::text),count(*),count(*) filter(where assignment_status='ACCEPTED'),
 count(*) filter(where assignment_status='REJECTED'),count(*) filter(where assignment_status='OFFERED' and offer_expires_at<now() and response_at is null),
 case when count(*)>0 then round((count(*) filter(where assignment_status='ACCEPTED'))::numeric/count(*)::numeric*100,2) end
 from dd_job_assignments group by coalesce(provider_id::text,'ORG:'||provider_org_id::text)
 on conflict(snapshot_date,provider_key) do update set offers=excluded.offers,accepts=excluded.accepts,rejects=excluded.rejects,expired_unanswered=excluded.expired_unanswered,acceptance_rate=excluded.acceptance_rate,created_at=now();

 insert into dd_automation_recipe_runs(id,recipe_key,status,matched_count,actioned_count,evidence,completed_at)
 values(v_run,'safe_execution_prod_v1','COMPLETED',v_total,v_total,jsonb_build_object('customer_messages_sent',0,'payments_moved',0,'provider_payouts_moved',0,'prices_changed',0,'dispatch_actions',0,'environment','PRODUCTION','sales_guardrails',true),now());
 return v_run;
end$$;

revoke all on function public.dd_run_safe_execution_recipes() from public, anon, authenticated;
grant execute on function public.dd_run_safe_execution_recipes() to service_role;
