-- Production repair receipt: CH03 entry + payment integrity
-- Date: 2026-09-29 UTC
-- This is a source-controlled repair receipt, NOT a generated Supabase migration.
-- Generate a governed migration from live/schema diff before deployment.
--
-- Proven receipts:
--   CH03 relationship entry: 8d9804fe-197e-4b8b-8437-44139d81c971 (5/5 PASS)
--   CH03 front half:         63def95d-1300-46a2-84ef-0cf862175f5e (7/7 PASS)
--   Paid-first threshold:    4971dc90-49dd-497b-a047-b252ace19561 (6/6 PASS)
--   Live Stripe checkout:    928167d9-5075-4316-9ef0-56e3ffa774ab (6/6 PASS)
--
-- Boundaries: no external contact, no money movement, no pricing publication,
-- no provider-eligibility expansion, no release-governance bypass.

-- 1) Enforce client-organization integrity.
alter table public.service_requests
  add constraint service_requests_organization_id_fkey
  foreign key (organization_id) references public.dd_client_organizations(id) on delete set null;

alter table public.dd_jobs
  add constraint dd_jobs_organization_id_fkey
  foreign key (organization_id) references public.dd_client_organizations(id) on delete set null;

alter table public.dd_portal_identities
  add constraint dd_portal_identities_organization_id_fkey
  foreign key (organization_id) references public.dd_client_organizations(id) on delete set null;

-- 2) Sequence-backed work-order numbering replaces collision-prone max()+1 parser.
create sequence if not exists public.dd_work_order_number_seq;

select setval(
  'public.dd_work_order_number_seq',
  greatest(
    1,
    coalesce((
      select max((substring(work_order_number from 6))::bigint)
      from public.dd_work_orders
      where work_order_number ~ '^DDWO-[0-9]+$'
    ),0)+1
  ),
  false
);

create or replace function public.dd_create_work_order_from_request(p_request_id uuid)
returns public.dd_work_orders
language plpgsql
security definer
set search_path='public'
as $$
declare
  r public.service_requests;
  l public.leads;
  s public.services;
  wo public.dd_work_orders;
  next_num bigint;
begin
  if current_user not in ('service_role','postgres')
     and not exists (
       select 1
       from public.dd_portal_identities pi
       where pi.auth_user_id=(select auth.uid())
         and pi.is_active=true
         and pi.portal_role=any(array['staff_admin','procurement']::text[])
     )
  then raise exception 'FORBIDDEN';
  end if;

  select * into r from public.service_requests where id=p_request_id;
  if not found then raise exception 'SERVICE_REQUEST_NOT_FOUND'; end if;

  select * into wo
  from public.dd_work_orders
  where service_request_id=p_request_id
  order by created_at
  limit 1;
  if found then return wo; end if;

  if r.lead_id is not null then
    select * into l from public.leads where id=r.lead_id;
  end if;
  if r.service_id is not null then
    select * into s from public.services where id=r.service_id;
  end if;

  next_num:=nextval('public.dd_work_order_number_seq');

  insert into public.dd_work_orders(
    work_order_number,service_request_id,lead_id,service_id,offer_sku,service_name,
    customer_name,customer_email,customer_phone,organization_name,service_address,
    scope_notes,customer_instructions,provider_instructions,customer_price,status
  )
  values(
    'DDWO-'||lpad(next_num::text,6,'0'),
    r.id,r.lead_id,r.service_id,s.sku,
    coalesce(s.name,r.service_needed,r.service_category,'Service Request'),
    l.full_name,l.email,l.phone,l.organization_name,r.location_address,
    coalesce(r.request_details,r.service_needed),null,null,r.quote_amount,'INSTANTIATED'
  )
  returning * into wo;

  return wo;
end $$;

revoke all on function public.dd_create_work_order_from_request(uuid) from public,anon,authenticated;
grant execute on function public.dd_create_work_order_from_request(uuid) to service_role;

-- 3) Governed CH03 property-management request constructor.
create or replace function public.dd_create_ch03_property_request(
  p_organization_id uuid,
  p_property_id uuid,
  p_lead_id uuid,
  p_service_id uuid,
  p_request_details text,
  p_scope_snapshot jsonb default '{}'::jsonb,
  p_quote_amount numeric default null
) returns uuid
language plpgsql
security definer
set search_path='public','pg_catalog'
as $$
declare
  v_org public.dd_client_organizations%rowtype;
  v_prop public.dd_client_properties%rowtype;
  v_lead public.leads%rowtype;
  v_service public.services%rowtype;
  v_req uuid;
  v_elig text;
begin
  if current_user not in ('service_role','postgres') then
    raise exception 'SERVICE_ROLE_REQUIRED';
  end if;

  select * into v_org
  from public.dd_client_organizations
  where id=p_organization_id
    and status='ACTIVE'
    and channel_code='CH03';
  if not found then raise exception 'CH03_ACTIVE_ORGANIZATION_REQUIRED'; end if;

  select * into v_prop
  from public.dd_client_properties
  where id=p_property_id
    and organization_id=v_org.id
    and status='ACTIVE';
  if not found then raise exception 'ACTIVE_PROPERTY_FOR_ORGANIZATION_REQUIRED'; end if;

  select * into v_lead from public.leads where id=p_lead_id;
  if not found then raise exception 'LEAD_REQUIRED'; end if;
  if nullif(trim(coalesce(v_lead.organization_name,'')),'') is null then
    raise exception 'LEAD_ORGANIZATION_CONTEXT_REQUIRED';
  end if;
  if lower(trim(v_lead.organization_name)) not in (
    lower(trim(v_org.legal_name)),
    lower(trim(coalesce(v_org.display_name,v_org.legal_name)))
  ) then
    raise exception 'LEAD_ORGANIZATION_MISMATCH';
  end if;

  select * into v_service
  from public.services
  where id=p_service_id and is_active=true;
  if not found then raise exception 'ACTIVE_SERVICE_REQUIRED'; end if;

  select eligibility_status into v_elig
  from public.dd_service_channel_availability
  where service_id=p_service_id and channel_code='CH03';

  if v_elig is null or v_elig not in ('ACTIVE','ELIGIBLE','QUOTE_REQUIRED') then
    raise exception 'CH03_SERVICE_NOT_ELIGIBLE';
  end if;

  insert into public.service_requests(
    lead_id,service_id,service_category,service_needed,location_address,request_details,
    status,priority,quote_amount,property_details,organization_id,scope_status,scope_version,
    scope_snapshot,scope_completed_at,channel_type,official_channel,commercial_model,
    subchannel_code,jurisdiction_state
  )
  values(
    v_lead.id,v_service.id,'PROPERTY_MANAGEMENT',v_service.name,v_prop.property_address,
    coalesce(p_request_details,'CH03 property request'),'new','normal',p_quote_amount,
    jsonb_build_object(
      'client_property_id',v_prop.id,
      'property_name',v_prop.property_name,
      'organization_id',v_org.id
    ),
    v_org.id,
    case when coalesce(p_scope_snapshot,'{}'::jsonb)='{}'::jsonb then 'NOT_STARTED' else 'COMPLETE' end,
    1,
    coalesce(p_scope_snapshot,'{}'::jsonb),
    case when coalesce(p_scope_snapshot,'{}'::jsonb)='{}'::jsonb then null else now() end,
    'B2B_APT','CH03','B2B','CH03-A',v_prop.state_code
  )
  returning id into v_req;

  return v_req;
end $$;

revoke all on function public.dd_create_ch03_property_request(uuid,uuid,uuid,uuid,text,jsonb,numeric)
  from public,anon,authenticated;
grant execute on function public.dd_create_ch03_property_request(uuid,uuid,uuid,uuid,text,jsonb,numeric)
  to service_role;

-- 4) Paid-first assignment activation must meet the frozen deposit threshold.
-- Only the payment gate portion changed materially from the prior implementation:
--   * sum successful CHECKOUT.SESSION.COMPLETED / INVOICE.PAID receipts for the request
--   * require cumulative amount >= estimate.deposit_due
--   * expose paidAmount / requiredPayment in the result/basis
-- The live function body is authoritative until a generated migration is created.
--
-- Regression proof:
--   $0 SUCCEEDED event => blocked
--   $176.55 cumulative receipt on a $330 estimate with 53.5% deposit => one frozen provider offer
--
-- Live function:
--   public.dd_activate_paid_estimate_assignments(uuid)
--
-- Required invariant:
--   v_required_payment := coalesce(v_estimate.deposit_due,0);
--   if estimated_total > 0 and v_required_payment <= 0 => PAYMENT_THRESHOLD_REQUIRED
--   v_paid_amount := sum(SUCCEEDED receipt amount_received)
--   if v_paid_amount < v_required_payment =>
--       CUSTOMER_PAYMENT_REQUIRED_BEFORE_FULFILLMENT_OFFER

-- 5) Production checkout evidence for representative CH03 service.
-- DNI-01A-003
-- live Payment Link: plink_1UHb3vChHm1uJK9xFm8TiZW8
-- live initial-payment Price: price_1UHb38ChHm1uJK9x2X6UzlJg
-- amount: 17655 cents USD
-- metadata: payment_stage=INITIAL, initial_payment_percent=53.50,
--           dani_sku=DNI-01A-003, source=service_release_contract
--
-- Do not overwrite dd_stripe_launch_register base-price identifiers with the
-- separate initial-payment price/link. Reconcile authority semantics instead.
