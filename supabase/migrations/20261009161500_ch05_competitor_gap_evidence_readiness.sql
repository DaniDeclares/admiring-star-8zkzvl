-- CH05 competitor gap evidence: extend existing demand staging, never create a parallel queue.
-- Source-observed competitor gaps are research, not qualified buyers or authorized outreach.
create or replace function private.dd_ch05_competitor_gap_readiness_v1(
  p_source_signal_id text,
  p_source_url text,
  p_problem text,
  p_competitor_gap text,
  p_service_sku text default null,
  p_evidence_of_demand text default null,
  p_buyer_authority_evidence text default null,
  p_budget_evidence text default null,
  p_fulfillment_evidence text default null
) returns jsonb language plpgsql stable set search_path = '' as $$
declare
  v_missing text[] := '{}';
begin
  if nullif(btrim(p_source_signal_id),'') is null or nullif(btrim(p_source_url),'') is null
     or nullif(btrim(p_problem),'') is null or nullif(btrim(p_competitor_gap),'') is null then
    return jsonb_build_object('classification','INCOMPLETE_RESEARCH','eligible_for_sales',false,
      'missing',jsonb_build_array('SOURCE_OR_PROBLEM_OR_GAP'));
  end if;
  if nullif(btrim(p_service_sku),'') is null then v_missing := array_append(v_missing,'VERIFIED_OFFER'); end if;
  if nullif(btrim(p_evidence_of_demand),'') is null then v_missing := array_append(v_missing,'BUYER_DEMAND'); end if;
  if nullif(btrim(p_buyer_authority_evidence),'') is null then v_missing := array_append(v_missing,'PURCHASING_AUTHORITY'); end if;
  if nullif(btrim(p_budget_evidence),'') is null then v_missing := array_append(v_missing,'BUDGET_OR_PAYMENT_INTENT'); end if;
  if nullif(btrim(p_fulfillment_evidence),'') is null then v_missing := array_append(v_missing,'FULFILLMENT'); end if;
  return jsonb_build_object(
    'classification',case when cardinality(v_missing)=0 then 'OWNER_QUALIFICATION_REQUIRED' else 'RESEARCH_ONLY' end,
    'eligible_for_sales',false,
    'auto_outreach',false,
    'auto_quote',false,
    'missing',to_jsonb(v_missing),
    'next_action',case when cardinality(v_missing)=0 then 'VERIFY_BUYER_IDENTITY_CONTACT_PERMISSION_AND_EXISTING_SALES_GATES'
      else 'COLLECT_MISSING_EVIDENCE' end);
end $$;
