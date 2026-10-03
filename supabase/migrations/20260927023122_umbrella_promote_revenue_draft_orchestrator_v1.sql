
create or replace function public.dd_create_quote_draft_from_sales(p_sales_id uuid)
returns uuid language plpgsql set search_path to 'public' as $$
declare s dd_sales_queue%rowtype; v_id uuid;
begin
 select * into s from dd_sales_queue where id=p_sales_id;
 if not found then raise exception 'sales record not found'; end if;
 if coalesce(s.disposition,'') not in ('QUOTE_READY','QUALIFIED','OPPORTUNITY') then raise exception 'sales record is not quote-ready'; end if;
 if s.suggested_sku is null then raise exception 'governed SKU required before quote draft'; end if;
 if not exists(select 1 from dd_service_release_contract_v1 x where x.canonical_sku=s.suggested_sku and x.release_state='GREEN') then raise exception 'service is not release-green'; end if;
 insert into dd_estimates(source_slug,lead_id,client_name,client_phone,client_email,client_type,organization_name,client_notes,internal_notes,estimate_status,priority,intake_answers)
 values('sales_queue',s.id,coalesce(s.contact_name,s.company_name),s.phone,s.email,coalesce(s.buyer_type,'business'),s.company_name,s.notes,
 'Created automatically as an internal DRAFT from a governed sales opportunity. No customer contact and no price publication occurred.',
 'DRAFT',case when s.intent_tier='HOT' then 'HIGH' else 'NORMAL' end,
 jsonb_build_object('sales_queue_id',s.id,'suggested_sku',s.suggested_sku,'source',s.source,'source_account',s.source_account,'source_message_id',s.source_message_id,'automation_authority','INTERNAL_DRAFT_ONLY'))
 returning id into v_id;
 update dd_sales_queue set next_action='Complete governed quote',disposition='QUOTE_DRAFTED',
 sales_metadata=coalesce(sales_metadata,'{}'::jsonb)||jsonb_build_object('estimate_id',v_id,'auto_draft',true),updated_at=now() where id=s.id;
 return v_id;
end $$;

create or replace function public.dd_run_revenue_orchestrator()
returns jsonb language plpgsql security definer set search_path to 'public' as $$
declare v_promoted int:=0; v_quote int:=0; v_blocked int:=0; r record; v_est uuid;
begin
 select public.dd_promote_verified_research_leads() into v_promoted;
 for r in select id from dd_sales_queue
   where disposition in ('QUOTE_READY','QUALIFIED','OPPORTUNITY')
     and suggested_sku is not null
     and not(coalesce(sales_metadata,'{}'::jsonb)?'estimate_id')
   order by updated_at asc limit 10
 loop
   begin
     select public.dd_create_quote_draft_from_sales(r.id) into v_est; v_quote:=v_quote+1;
   exception when others then
     v_blocked:=v_blocked+1;
   end;
 end loop;
 return jsonb_build_object('status','COMPLETED','verified_leads_promoted',v_promoted,'internal_quote_drafts_created',v_quote,'blocked',v_blocked,'external_contact',false,'pricing_published',false,'money_action',false);
end $$;

revoke execute on function public.dd_create_quote_draft_from_sales(uuid) from public,anon,authenticated;
revoke execute on function public.dd_run_revenue_orchestrator() from public,anon,authenticated;
grant execute on function public.dd_create_quote_draft_from_sales(uuid) to service_role;
grant execute on function public.dd_run_revenue_orchestrator() to service_role;

select cron.schedule('dani-revenue-orchestrator-production','11,31,51 * * * *',$$select public.dd_run_revenue_orchestrator();$$)
where not exists(select 1 from cron.job where jobname='dani-revenue-orchestrator-production');
