-- Record in source what Production actually runs for research promotion.
-- Production was hotfixed directly on 2026-10-01 (fix_verified_research_promotion_missing_contact_name_v1,
-- never committed): verified vendor leads get the PARTNER lane, a '<company> Vendor Intake' contact name and a
-- vendor next_action. 20261002170000 (PR #525) rebuilt this function from the repo copy, which still had WARM.
-- Owner decision 2026-10-02 (Dani): keep the hotfix values and add #525's identity gate. Production received
-- exactly this definition as part of migration relationship_identity_resolver_v1 (promotion candidate
-- RELATIONSHIP_IDENTITY_RESOLVER_V1). This file makes the repo replay to the same result. No other change.

-- Research promotion: Production values plus the identity gate. --------------------

create or replace function public.dd_promote_verified_research_lead(p_research_lead_id uuid)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare
  v_lead public.dd_research_leads%rowtype;
  v_sales_id uuid;
  v_email text;
  v_res jsonb;
  v_company text;
begin
  select * into v_lead from public.dd_research_leads where id = p_research_lead_id for update;
  if not found then raise exception 'RESEARCH_LEAD_NOT_FOUND'; end if;
  if v_lead.promotion_status = 'PROMOTED' and v_lead.promoted_sales_queue_id is not null then
    return jsonb_build_object('status','ALREADY_PROMOTED','sales_queue_id',v_lead.promoted_sales_queue_id);
  end if;
  if upper(coalesce(v_lead.verification_status,'')) <> 'VERIFIED' or v_lead.verified_at is null then
    return jsonb_build_object('status','BLOCKED','reason','NOT_VERIFIED');
  end if;
  if coalesce(v_lead.verification_source_url,'') = '' or v_lead.verification_evidence = '{}'::jsonb then
    return jsonb_build_object('status','BLOCKED','reason','MISSING_VERIFICATION_EVIDENCE');
  end if;
  v_email := nullif(lower(trim(v_lead.verified_email)),'');
  v_company := coalesce(v_lead.verified_company_name, v_lead.company_name);
  if v_email is null and private.dd_identity_norm_phone(v_lead.verified_phone) is null then
    return jsonb_build_object('status','BLOCKED','reason','NO_VERIFIED_CONTACT_ROUTE');
  end if;

  v_res := private.dd_resolve_existing_relationship(v_lead.research_claims->>'contact_name', v_company, v_email,
                                                    v_lead.verified_phone, v_lead.verified_website);
  if (v_res->>'blocks_new_sales_row')::boolean then
    perform private.dd_record_identity_resolution(v_res, 'dd_research_leads', v_lead.id, 'RESEARCH_PROMOTION',
                                                 jsonb_build_object('verification_source_url', v_lead.verification_source_url));
    update public.dd_research_leads
      set promotion_status = case when (v_res->>'ambiguous')::boolean then 'NEEDS_RECONCILIATION'
                                  when v_res->>'sales_queue_id' is not null then 'MATCHED_EXISTING'
                                  else 'MATCHED_EXISTING_RELATIONSHIP' end,
          promoted_sales_queue_id = case when (v_res->>'ambiguous')::boolean then null else (v_res->>'sales_queue_id')::uuid end,
          promoted_at = now(), updated_at = now()
      where id = v_lead.id;
    if v_res->>'sales_queue_id' is not null and not (v_res->>'ambiguous')::boolean then
      update public.dd_sales_queue
        set sales_metadata = coalesce(sales_metadata,'{}'::jsonb) ||
              jsonb_build_object('research_lead_id', v_lead.id, 'research_verified_at', v_lead.verified_at,
                                 'research_verification_source_url', v_lead.verification_source_url),
            updated_at = now()
        where id = (v_res->>'sales_queue_id')::uuid;
    end if;
    return jsonb_build_object('status', case when (v_res->>'ambiguous')::boolean then 'NEEDS_RECONCILIATION'
                                             when v_res->>'sales_queue_id' is not null then 'MATCHED_EXISTING'
                                             else 'MATCHED_EXISTING_RELATIONSHIP' end,
                              'sales_queue_id', v_res->>'sales_queue_id', 'identity_check', v_res);
  end if;

  insert into public.dd_sales_queue(
    contact_name, company_name, phone, email, lane, source, source_confidence, disposition,
    next_action, next_action_date, buyer_type, notes, do_not_contact, campaign_eligible,
    campaign_status, contact_pressure_state, sales_metadata, lead_origin_class
  ) values (
    coalesce(nullif(trim(v_lead.verified_company_name),'')||' Vendor Intake','Vendor Intake'),
    v_company, nullif(trim(v_lead.verified_phone),''), v_email, 'PARTNER', 'WEB_SOURCED', 'VERIFIED',
    'NOT_CONTACTED', 'Qualify verified vendor opportunity before any outreach', current_date, v_lead.channel_code,
    concat_ws(' | ', v_lead.research_profile, 'Promoted from verified research staging; outreach not authorized by promotion.'),
    false, false, 'UNASSESSED', 'PAUSED',
    jsonb_build_object('research_lead_id', v_lead.id, 'market', v_lead.market, 'research_priority', v_lead.research_priority,
                       'research_claims', v_lead.research_claims, 'verification_evidence', v_lead.verification_evidence,
                       'verification_source_url', v_lead.verification_source_url, 'verified_website', v_lead.verified_website,
                       'identity_check', v_res),
    'RESEARCH_PROMOTION'
  ) returning id into v_sales_id;
  update public.dd_research_leads
    set promotion_status = 'PROMOTED', promoted_sales_queue_id = v_sales_id, promoted_at = now(), updated_at = now()
    where id = v_lead.id;
  return jsonb_build_object('status','PROMOTED','sales_queue_id',v_sales_id);
end;
$$;
