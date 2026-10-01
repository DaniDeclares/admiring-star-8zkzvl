create or replace function public.dd_promote_verified_research_lead(p_research_lead_id uuid)
returns jsonb
language plpgsql
security definer
set search_path=''
as $function$
declare
 v_lead public.dd_research_leads%rowtype;
 v_existing public.dd_sales_queue%rowtype;
 v_sales_id uuid;
 v_email text;
 v_phone text;
 v_company text;
begin
 select * into v_lead from public.dd_research_leads where id=p_research_lead_id for update;
 if not found then raise exception 'RESEARCH_LEAD_NOT_FOUND'; end if;
 if v_lead.promotion_status='PROMOTED' and v_lead.promoted_sales_queue_id is not null then
   return jsonb_build_object('status','ALREADY_PROMOTED','sales_queue_id',v_lead.promoted_sales_queue_id);
 end if;
 if upper(coalesce(v_lead.verification_status,'')) <> 'VERIFIED' or v_lead.verified_at is null then
   return jsonb_build_object('status','BLOCKED','reason','NOT_VERIFIED');
 end if;
 if coalesce(v_lead.verification_source_url,'')='' or v_lead.verification_evidence='{}'::jsonb then
   return jsonb_build_object('status','BLOCKED','reason','MISSING_VERIFICATION_EVIDENCE');
 end if;
 v_email:=nullif(lower(trim(v_lead.verified_email)),'');
 v_phone:=nullif(regexp_replace(coalesce(v_lead.verified_phone,''),'[^0-9]','','g'),'');
 v_company:=lower(trim(coalesce(v_lead.verified_company_name,v_lead.company_name)));
 if v_email is null and v_phone is null then return jsonb_build_object('status','BLOCKED','reason','NO_VERIFIED_CONTACT_ROUTE'); end if;
 select * into v_existing from public.dd_sales_queue q
 where (v_email is not null and lower(trim(coalesce(q.email,'')))=v_email)
    or (v_phone is not null and regexp_replace(coalesce(q.phone,''),'[^0-9]','','g')=v_phone)
    or (lower(trim(coalesce(q.company_name,'')))=v_company and coalesce(q.sales_metadata->>'market','')=coalesce(v_lead.market,''))
 order by q.updated_at desc limit 1;
 if found then
   update public.dd_research_leads set promotion_status='MATCHED_EXISTING',promoted_sales_queue_id=v_existing.id,promoted_at=now(),updated_at=now() where id=v_lead.id;
   update public.dd_sales_queue set sales_metadata=coalesce(sales_metadata,'{}'::jsonb)||jsonb_build_object('research_lead_id',v_lead.id,'research_verified_at',v_lead.verified_at,'research_verification_source_url',v_lead.verification_source_url),updated_at=now() where id=v_existing.id;
   return jsonb_build_object('status','MATCHED_EXISTING','sales_queue_id',v_existing.id);
 end if;
 insert into public.dd_sales_queue(contact_name,company_name,phone,email,lane,source,source_confidence,disposition,next_action,next_action_date,buyer_type,notes,do_not_contact,campaign_eligible,campaign_status,contact_pressure_state,sales_metadata,lead_origin_class)
 values(
   coalesce(nullif(trim(v_lead.verified_company_name),'')||' Vendor Intake','Vendor Intake'),
   coalesce(v_lead.verified_company_name,v_lead.company_name),
   nullif(trim(v_lead.verified_phone),''),
   v_email,
   'PARTNER','WEB_SOURCED','VERIFIED','NOT_CONTACTED',
   'Qualify verified vendor opportunity before any outreach',
   current_date,
   v_lead.channel_code,
   concat_ws(' | ',v_lead.research_profile,'Promoted from verified research staging; outreach not authorized by promotion.'),
   false,false,'UNASSESSED','PAUSED',
   jsonb_build_object('research_lead_id',v_lead.id,'market',v_lead.market,'research_priority',v_lead.research_priority,'research_claims',v_lead.research_claims,'verification_evidence',v_lead.verification_evidence,'verification_source_url',v_lead.verification_source_url,'verified_website',v_lead.verified_website),
   'RESEARCH_PROMOTION'
 ) returning id into v_sales_id;
 update public.dd_research_leads set promotion_status='PROMOTED',promoted_sales_queue_id=v_sales_id,promoted_at=now(),updated_at=now() where id=v_lead.id;
 return jsonb_build_object('status','PROMOTED','sales_queue_id',v_sales_id);
end;
$function$;
