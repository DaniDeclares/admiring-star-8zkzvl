-- Controlled CH05 bridge into the EXISTING sales queue.
-- Only explicitly verified buyer demand, never competitor observation alone.
-- Caller is a privileged worker after owner approval and source verification.
create or replace function private.dd_promote_verified_ch05_gap_to_sales_v1(p_staging_id uuid)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare
 s public.dd_demand_capture_staging%rowtype;
 v_id uuid;
 v_md jsonb;
begin
 select * into s from public.dd_demand_capture_staging where id=p_staging_id for update;
 if not found then raise exception 'Staging evidence not found'; end if;
 if s.channel_code <> 'CH05'
   or s.intelligence_class not in ('BUYER_SIGNAL')
   or s.verification_status <> 'VERIFIED'
   or s.opportunity_route not in ('DANI_AS_VENDOR','PROVIDER_ROUTED')
   or s.contact_permission not in ('EXPLICIT_CONSENT','VERIFIED_BUSINESS_RELATIONSHIP')
   or nullif(btrim(s.company_name),'') is null
   or nullif(btrim(s.need_summary),'') is null
   or nullif(btrim(s.service_hint),'') is null
   or nullif(btrim(s.source_url),'') is null
   or coalesce(s.source_metadata->>'buyer_demand_verified','false') <> 'true'
   or coalesce(s.source_metadata->>'decision_maker_verified','false') <> 'true'
   or coalesce(s.source_metadata->>'fulfillment_verified','false') <> 'true'
   or coalesce(s.source_metadata->>'owner_approved_for_sales','false') <> 'true'
   or nullif(btrim(s.source_metadata->>'owner_approval_receipt'),'') is null
   or nullif(btrim(s.source_metadata->>'buyer_evidence_receipt'),'') is null
   or nullif(btrim(s.source_metadata->>'fulfillment_evidence_receipt'),'') is null
 then raise exception 'CH05 evidence is research-only: buyer, consent, offer, fulfillment and owner approval must be verified'; end if;
 if s.promoted_sales_queue_id is not null then
   return jsonb_build_object('status','ALREADY_PROMOTED','sales_queue_id',s.promoted_sales_queue_id);
 end if;
 v_md:=jsonb_build_object('channel_code','CH05','competitor_gap_source_id',s.id,
   'source_url',s.source_url,'evidence',s.source_metadata,'promotion_basis','VERIFIED_BUYER_DEMAND',
   'context_contract',jsonb_build_object('basis','VERIFIED_SOURCE_EVIDENCE'));
 insert into public.dd_sales_queue
   (company_name,contact_name,email,phone,lane,source,source_confidence,disposition,
    buyer_type,pain_point,solution_statement,suggested_sku,sales_metadata,
    campaign_eligible,campaign_status,decision_maker_confirmed,
    next_action,do_not_contact)
 values
   (s.company_name,s.contact_name,s.contact_email,s.contact_phone,
    'SCREEN_ONLY','WEB_SOURCED','SINGLE_SOURCE','NOT_CONTACTED',
    'BUSINESS',s.need_summary,s.service_hint,s.service_hint,v_md,
    false,'UNASSESSED',true,'Owner review: validate buyer, price, route and contact permission',false)
 returning id into v_id;
 update public.dd_demand_capture_staging
 set promoted_sales_queue_id=v_id,promotion_status='PROMOTED',updated_at=now()
 where id=s.id;
 return jsonb_build_object('status','PROMOTED_FOR_OWNER_REVIEW','sales_queue_id',v_id,
   'campaign_eligible',false,'auto_outreach',false);
end $$;
revoke all on function private.dd_promote_verified_ch05_gap_to_sales_v1(uuid) from public,anon,authenticated;
grant execute on function private.dd_promote_verified_ch05_gap_to_sales_v1(uuid) to service_role;
comment on function private.dd_promote_verified_ch05_gap_to_sales_v1(uuid) is
 'Privileged, owner-approved verified-buyer bridge. COMPETITOR_SIGNAL never promotes; sales row starts SCREEN_ONLY and campaign-ineligible. No outreach or quoting.';
