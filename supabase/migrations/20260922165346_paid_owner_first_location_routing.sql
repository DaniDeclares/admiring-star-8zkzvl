-- Paid-first, owner-first, location-aware routing foundation.
-- Public UI may remain unified while internal jurisdiction/travel economics are auditable.

alter table public.dd_provider_applications
  add column if not exists dispatch_latitude numeric,
  add column if not exists dispatch_longitude numeric,
  add column if not exists dispatch_location_verified_at timestamptz,
  add column if not exists willing_outside_radius boolean not null default false;

alter table public.service_requests
  add column if not exists service_latitude numeric,
  add column if not exists service_longitude numeric,
  add column if not exists jurisdiction_state text,
  add column if not exists jurisdiction_county text,
  add column if not exists jurisdiction_municipality text,
  add column if not exists jurisdiction_verified_at timestamptz;

alter table public.dd_estimate_assignment_offers
  add column if not exists route_distance_miles numeric,
  add column if not exists route_distance_source text,
  add column if not exists route_origin_snapshot jsonb not null default '{}'::jsonb,
  add column if not exists route_destination_snapshot jsonb not null default '{}'::jsonb,
  add column if not exists travel_cost_snapshot numeric,
  add column if not exists jurisdiction_snapshot jsonb not null default '{}'::jsonb;

create or replace function public.dd_activate_paid_estimate_assignments(p_estimate_id uuid)
returns jsonb
language plpgsql
security definer
set search_path=public,pg_catalog
as $$
declare
  v_estimate public.dd_estimates%rowtype;
  v_paid boolean := false;
  v_owner_count integer := 0;
  v_provider_count integer := 0;
  v_active_count integer := 0;
  v_next_status text := 'NEEDS_REASSIGNMENT';
begin
  select * into v_estimate
  from public.dd_estimates
  where id=p_estimate_id
  for update;

  if not found then
    raise exception 'ESTIMATE_NOT_FOUND';
  end if;
  if v_estimate.economics_status <> 'PASS' then
    raise exception 'ESTIMATE_ECONOMICS_NOT_PASS';
  end if;
  if v_estimate.active_economics_snapshot_id is null then
    raise exception 'ECONOMICS_SNAPSHOT_REQUIRED';
  end if;

  select exists(
    select 1
    from public.dd_payment_events pe
    where pe.request_id=v_estimate.service_request_id
      and upper(coalesce(pe.payment_status,''))='SUCCEEDED'
      and upper(coalesce(pe.event_type,'')) in ('CHECKOUT.SESSION.COMPLETED','INVOICE.PAID')
  ) into v_paid;

  if not v_paid then
    raise exception 'CUSTOMER_PAYMENT_REQUIRED_BEFORE_FULFILLMENT_OFFER';
  end if;

  select count(*) into v_active_count
  from public.dd_estimate_assignment_offers
  where estimate_id=p_estimate_id
    and status not in ('SUPERSEDED','CANCELLED','DECLINED','OWNER_REJECTED_COUNTER');

  if v_active_count > 0 then
    return jsonb_build_object('activated',false,'reason','ACTIVE_ASSIGNMENTS_ALREADY_EXIST','count',v_active_count);
  end if;

  insert into public.dd_estimate_assignment_offers(
    estimate_id,economics_snapshot_id,assignment_type,owner_user_id,status,
    component_snapshot_ids,scope_snapshot,proposed_compensation,proposed_basis,
    offered_at,economic_impact_status
  )
  select
    p_estimate_id,
    v_estimate.active_economics_snapshot_id,
    'OWNER',
    cs.owner_user_id,
    'OFFERED',
    array_agg(cs.id order by cs.id),
    jsonb_build_object(
      'title','Owner first-refusal fulfillment',
      'paidFirst',true,
      'ownerFirst',true,
      'components',jsonb_agg(jsonb_build_object(
        'componentCode',cs.component_code,
        'componentName',cs.component_name,
        'canonicalSku',cs.canonical_sku,
        'quantity',cs.quantity,
        'unitType',cs.unit_type
      ) order by cs.id)
    ),
    round(sum(coalesce(cs.proposed_compensation,0))::numeric,2),
    jsonb_build_object('authority','PAID_FIRST_OWNER_FIRST','economicsSnapshotId',v_estimate.active_economics_snapshot_id),
    now(),
    'NOT_EVALUATED'
  from public.dd_estimate_component_snapshots cs
  where cs.estimate_id=p_estimate_id
    and cs.economics_snapshot_id=v_estimate.active_economics_snapshot_id
    and cs.fulfiller_type='OWNER'
    and cs.owner_user_id is not null
  group by cs.owner_user_id;

  get diagnostics v_owner_count = row_count;

  -- Components that were already modeled to a named external provider can be
  -- offered immediately after payment. Owner-modeled components are held for
  -- Danielle's first refusal and are not exposed to providers yet.
  insert into public.dd_estimate_assignment_offers(
    estimate_id,economics_snapshot_id,assignment_type,provider_id,status,
    component_snapshot_ids,scope_snapshot,proposed_compensation,proposed_basis,
    initial_offer_amount,target_payout_amount,maximum_payout_amount,
    economic_ceiling_amount,budgeted_provider_cost,payout_band_snapshot,
    offered_at,economic_impact_status
  )
  select
    p_estimate_id,
    v_estimate.active_economics_snapshot_id,
    'PROVIDER',
    cs.provider_id,
    'OFFERED',
    array_agg(cs.id order by cs.id),
    jsonb_build_object(
      'title','Paid customer fulfillment offer',
      'paidFirst',true,
      'components',jsonb_agg(jsonb_build_object(
        'componentCode',cs.component_code,
        'componentName',cs.component_name,
        'canonicalSku',cs.canonical_sku,
        'quantity',cs.quantity,
        'unitType',cs.unit_type
      ) order by cs.id)
    ),
    round(sum(coalesce(cs.proposed_compensation,0))::numeric,2),
    jsonb_build_object('authority','FROZEN_ECONOMICS_SNAPSHOT','economicsSnapshotId',v_estimate.active_economics_snapshot_id),
    round(sum(coalesce(cs.proposed_compensation,0))::numeric,2),
    round(sum(coalesce((cs.compensation_basis_snapshot->>'targetPayout')::numeric,cs.proposed_compensation,0))::numeric,2),
    round(sum(coalesce((cs.compensation_basis_snapshot->>'maximumPayout')::numeric,cs.proposed_compensation,0))::numeric,2),
    round(sum(coalesce((cs.compensation_basis_snapshot->>'budgetedProviderCost')::numeric,cs.proposed_compensation,0))::numeric,2),
    round(sum(coalesce((cs.compensation_basis_snapshot->>'budgetedProviderCost')::numeric,cs.proposed_compensation,0))::numeric,2),
    jsonb_build_object('authority','FROZEN_COMPONENT_PAYOUT_BANDS','paidFirst',true),
    now(),
    'NOT_EVALUATED'
  from public.dd_estimate_component_snapshots cs
  where cs.estimate_id=p_estimate_id
    and cs.economics_snapshot_id=v_estimate.active_economics_snapshot_id
    and cs.fulfiller_type='PROVIDER'
    and cs.provider_id is not null
  group by cs.provider_id;

  get diagnostics v_provider_count = row_count;

  if v_owner_count > 0 then
    v_next_status := 'AWAITING_OWNER';
  elsif v_provider_count > 0 then
    v_next_status := 'AWAITING_PROVIDER';
  else
    v_next_status := 'NEEDS_REASSIGNMENT';
  end if;

  update public.dd_estimates
  set assignment_readiness_status=v_next_status,updated_at=now()
  where id=p_estimate_id;

  return jsonb_build_object(
    'activated',true,
    'ownerOffers',v_owner_count,
    'providerOffers',v_provider_count,
    'assignmentReadiness',v_next_status
  );
end;
$$;

revoke all on function public.dd_activate_paid_estimate_assignments(uuid) from public,anon,authenticated;
grant execute on function public.dd_activate_paid_estimate_assignments(uuid) to service_role;
