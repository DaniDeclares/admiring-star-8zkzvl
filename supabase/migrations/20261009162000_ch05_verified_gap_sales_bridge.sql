-- CH05 competitor-gap bridge: fail closed until authoritative buyer receipts are wired.
-- Historical audit: staging.source_metadata contains assertions, not authoritative evidence.
-- There is no established relational buyer-identity/authority/consent proof join for this path.
-- Therefore NEVER insert a sales record on self-asserted booleans or receipt strings.
-- Keep existing research staging intact and expose safe qualification diagnostics.
create or replace function private.dd_promote_verified_ch05_gap_to_sales_v1(p_staging_id uuid)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare
  s public.dd_demand_capture_staging%rowtype;
  v_missing text[] := '{}';
  v_catalog_state text;
begin
  select * into s from public.dd_demand_capture_staging where id=p_staging_id;
  if not found then raise exception 'Staging record not found'; end if;
  if s.channel_code is distinct from 'CH05' then
    raise exception 'CH05 only';
  end if;
  if s.intelligence_class is distinct from 'BUYER_SIGNAL' then
    return jsonb_build_object('status','RESEARCH_ONLY','reason','NOT_VERIFIED_BUYER_DEMAND',
      'sales_queue_id',null,'auto_outreach',false);
  end if;
  if nullif(btrim(s.company_name),'') is null then v_missing:=array_append(v_missing,'BUSINESS_IDENTITY'); end if;
  if nullif(btrim(s.need_summary),'') is null then v_missing:=array_append(v_missing,'BUYER_PROBLEM'); end if;
  if nullif(btrim(s.source_url),'') is null then v_missing:=array_append(v_missing,'SOURCE'); end if;
  if nullif(btrim(s.service_hint),'') is null then
    v_missing:=array_append(v_missing,'SERVICE_SKU');
  else
    select release_state into v_catalog_state
    from public.dd_service_release_contract_v1
    where canonical_sku=s.service_hint limit 1;
    if v_catalog_state is distinct from 'LIVE_READY' then
      v_missing:=array_append(v_missing,'LIVE_READY_SERVICE');
    end if;
  end if;
  -- No verified authority source yet: metadata booleans and free-text receipts are untrusted.
  v_missing:=v_missing || array[
    'AUTHORITATIVE_BUYER_DEMAND_RECEIPT',
    'AUTHORITATIVE_PURCHASING_AUTHORITY_RECEIPT',
    'AUTHORITATIVE_CONTACT_PERMISSION_RECEIPT',
    'AUTHORITATIVE_FULFILLMENT_EVIDENCE',
    'AUTHORITATIVE_OWNER_APPROVAL'
  ]::text[];
  return jsonb_build_object('status','BLOCKED_AWAITING_AUTHORITATIVE_EVIDENCE',
    'missing',to_jsonb(v_missing),'sales_queue_id',null,
    'campaign_eligible',false,'auto_outreach',false,'auto_quote',false);
end $$;
revoke all on function private.dd_promote_verified_ch05_gap_to_sales_v1(uuid) from public,anon,authenticated;
grant execute on function private.dd_promote_verified_ch05_gap_to_sales_v1(uuid) to service_role;
comment on function private.dd_promote_verified_ch05_gap_to_sales_v1(uuid) is
 'Fail-closed research bridge: validates live catalog state, but never manufactures a buyer from staging metadata. A separate authority-backed approval integration is required before enabling promotion.';
