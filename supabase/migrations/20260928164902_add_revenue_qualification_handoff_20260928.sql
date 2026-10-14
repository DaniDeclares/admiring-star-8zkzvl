
create or replace function public.dd_run_revenue_qualification_handoff(p_limit int default 20)
returns jsonb
language plpgsql
security definer
set search_path to 'public','pg_catalog'
as $function$
declare v_n int:=0;
begin
 insert into public.dd_owner_attention_queue(domain,source_table,source_record_id,reason,priority,recommended_action,metadata)
 select 'SALES','dd_sales_queue',s.id::text,
   'Revenue candidate cannot enter quote orchestrator until scope/SKU qualification is complete',
   case when s.disposition='INTERESTED' then 'P0' else 'P1' end,
   'Use existing relationship/source evidence to confirm the current need and approved service/SKU. Do not invent pricing. Once qualified with suggested_sku, existing revenue orchestrator can draft the quote.',
   jsonb_build_object('source',s.source,'disposition',s.disposition,'contact_name',s.contact_name,'company_name',s.company_name,
     'suggested_sku',s.suggested_sku,'cash_priority','TODAY','external_contact_authorized',false,
     'pricing_invention_authorized',false,'qualification_handoff',true)
 from public.dd_sales_queue s
 where coalesce(s.do_not_contact,false)=false
   and s.disposition in ('INTERESTED','NEEDS_INFO','EXISTING_VENDOR_REVISIT')
   and s.suggested_sku is null
   and not(coalesce(s.sales_metadata,'{}'::jsonb)->>'routine_outreach_suppressed'='true')
 order by case s.disposition when 'INTERESTED' then 1 when 'EXISTING_VENDOR_REVISIT' then 2 else 3 end,s.updated_at desc
 limit greatest(1,least(coalesce(p_limit,20),100))
 on conflict do nothing;
 get diagnostics v_n=row_count;
 return jsonb_build_object('status','COMPLETED','qualification_attention_created',v_n,
   'external_contact',false,'pricing_published',false,'money_action',false,
   'downstream','dd_run_revenue_orchestrator after genuine qualification');
end
$function$;

create or replace function public.dd_run_revenue_orchestrator()
returns jsonb language plpgsql security definer set search_path to 'public'
as $function$
declare v_promoted int:=0; v_quote int:=0; v_blocked int:=0; v_qualification jsonb; r record; v_est uuid;
begin
 select public.dd_promote_verified_research_leads() into v_promoted;
 select public.dd_run_revenue_qualification_handoff(20) into v_qualification;
 for r in select id from dd_sales_queue
   where disposition in ('QUOTE_READY','QUALIFIED','OPPORTUNITY') and suggested_sku is not null
     and not(coalesce(sales_metadata,'{}'::jsonb)?'estimate_id')
   order by updated_at asc limit 10
 loop
   begin select public.dd_create_quote_draft_from_sales(r.id) into v_est; v_quote:=v_quote+1;
   exception when others then v_blocked:=v_blocked+1; end;
 end loop;
 return jsonb_build_object('status','COMPLETED','verified_leads_promoted',v_promoted,
   'qualification_handoff',v_qualification,'internal_quote_drafts_created',v_quote,'blocked',v_blocked,
   'external_contact',false,'pricing_published',false,'money_action',false);
end
$function$;
