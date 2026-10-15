
create or replace function public.dd_run_revenue_qualification_handoff(p_limit int default 20)
returns jsonb language plpgsql security definer set search_path to 'public','pg_catalog'
as $function$
declare v_n int:=0; v_reclassified int:=0;
begin
 update public.dd_sales_queue
 set disposition='NEEDS_INFO',campaign_status='SUPPRESSED',
     campaign_suppression_reason='Networking/professional-network interest is not verified purchase intent.',
     next_action='Determine whether there is an actual DANI service/business need before sales qualification; networking interest alone is not purchase intent.',
     sales_metadata=coalesce(sales_metadata,'{}'::jsonb)||jsonb_build_object(
       'intent_reclassification','NETWORKING_NOT_PURCHASE_INTENT','reclassified_at',now(),
       'quote_eligible',false,'reason','No explicit service need, scope, deliverable, or buying intent in source evidence'),updated_at=now()
 where disposition='INTERESTED' and suggested_sku is null and coalesce(pain_point,'')='' and coalesce(deliverables,'')=''
   and coalesce(solution_statement,'')='' and coalesce(next_step_commitment,'')='' and coalesce(notes,'') ilike '%professional network%';
 get diagnostics v_reclassified=row_count;

 insert into public.dd_owner_attention_queue(domain,source_table,source_record_id,reason,priority,recommended_action,metadata)
 select 'SALES','dd_sales_queue',s.id::text,'Revenue candidate needs evidence before it can enter governed quote flow','P1',
   case when s.next_action ilike '%verify%contact%' then 'Use existing research/intelligence path to verify a current deliverable contact; do not send until verified.'
        when s.next_action ilike '%wait%' then 'No action now; existing follow-up dependency remains authoritative.'
        else 'Confirm explicit need/scope and approved service/SKU. Do not infer purchase intent from networking or partnership activity.' end,
   jsonb_build_object('source',s.source,'disposition',s.disposition,'contact_name',s.contact_name,'company_name',s.company_name,
     'next_action',s.next_action,'cash_priority','TODAY','qualification_handoff',true,'external_contact_authorized',false,'pricing_invention_authorized',false)
 from public.dd_sales_queue s
 where coalesce(s.do_not_contact,false)=false and s.disposition in ('INTERESTED','NEEDS_INFO','EXISTING_VENDOR_REVISIT')
   and s.suggested_sku is null and not(coalesce(s.sales_metadata,'{}'::jsonb)->>'routine_outreach_suppressed'='true')
   and coalesce(s.sales_metadata,'{}'::jsonb)->>'quote_eligible' is distinct from 'false' and coalesce(s.next_action,'') not ilike 'wait%'
 order by case s.lane when 'INBOUND' then 0 when 'WARM' then 1 when 'REVISIT_CALLABLE' then 2 else 3 end,s.updated_at desc
 limit greatest(1,least(coalesce(p_limit,20),100)) on conflict do nothing;
 get diagnostics v_n=row_count;
 return jsonb_build_object('status','COMPLETED','false_purchase_intent_reclassified',v_reclassified,'qualification_attention_created',v_n,
   'external_contact',false,'pricing_published',false,'money_action',false,'downstream','Evidence enrichment -> approved SKU -> existing quote orchestrator');
end
$function$;
