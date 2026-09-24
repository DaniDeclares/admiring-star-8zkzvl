-- Provider-specific route economics gate.
create table if not exists public.dd_provider_travel_policies (
 id uuid primary key default gen_random_uuid(), policy_code text not null unique,
 cents_per_mile numeric not null check(cents_per_mile>=0), trip_multiplier numeric not null default 2 check(trip_multiplier>0),
 evidence_status text not null, source_reference text, effective_from timestamptz not null, effective_to timestamptz,
 status text not null default 'ACTIVE', created_at timestamptz not null default now());
alter table public.dd_provider_travel_policies enable row level security;
revoke all on public.dd_provider_travel_policies from anon,authenticated;
grant select,insert,update,delete on public.dd_provider_travel_policies to service_role;
insert into public.dd_provider_travel_policies(policy_code,cents_per_mile,trip_multiplier,evidence_status,source_reference,effective_from,status)
values('US_BUSINESS_MILEAGE_2026_H2',0.76,2,'EXTERNAL_VERIFIED','IRS Announcement 2026-11; Jul 1-Dec 31 2026 business mileage rate','2026-07-01T00:00:00Z','ACTIVE')
on conflict(policy_code) do update set cents_per_mile=excluded.cents_per_mile,trip_multiplier=excluded.trip_multiplier,evidence_status=excluded.evidence_status,source_reference=excluded.source_reference,effective_from=excluded.effective_from,status='ACTIVE';

create or replace function public.dd_hold_unrouted_provider_offer() returns trigger language plpgsql set search_path=public,pg_catalog as $$
begin
 if new.assignment_type='PROVIDER' and (new.route_distance_miles is null or nullif(new.route_distance_source,'') is null) then
  new.status:='PROPOSED'; new.economic_impact_status:='NOT_EVALUATED';
 end if; return new;
end $$;
revoke all on function public.dd_hold_unrouted_provider_offer() from public,anon,authenticated;
grant execute on function public.dd_hold_unrouted_provider_offer() to service_role;
drop trigger if exists trg_dd_hold_unrouted_provider_offer on public.dd_estimate_assignment_offers;
create trigger trg_dd_hold_unrouted_provider_offer before insert on public.dd_estimate_assignment_offers for each row execute function public.dd_hold_unrouted_provider_offer();

create or replace function public.dd_finalize_provider_route_offer(p_assignment_id uuid,p_route_distance_miles numeric,p_route_source text)
returns jsonb language plpgsql security definer set search_path=public,pg_catalog as $$
declare
 o public.dd_estimate_assignment_offers%rowtype; e public.dd_estimates%rowtype; r public.service_requests%rowtype;
 a public.dd_provider_applications%rowtype; p public.dd_provider_travel_policies%rowtype;
 route numeric; reimb numeric; travel numeric; headroom numeric; reserved numeric; remaining numeric;
begin
 if p_route_distance_miles is null or p_route_distance_miles<0 then raise exception 'VERIFIED_ROUTE_DISTANCE_REQUIRED'; end if;
 if nullif(trim(coalesce(p_route_source,'')),'') is null then raise exception 'VERIFIED_ROUTE_SOURCE_REQUIRED'; end if;
 select * into o from public.dd_estimate_assignment_offers where id=p_assignment_id for update;
 if not found or o.assignment_type<>'PROVIDER' then raise exception 'PROVIDER_ASSIGNMENT_NOT_FOUND'; end if;
 if o.status not in('PROPOSED','REVISED') then raise exception 'ASSIGNMENT_NOT_ROUTE_PENDING'; end if;
 select * into e from public.dd_estimates where id=o.estimate_id;
 select * into r from public.service_requests where id=e.service_request_id;
 select * into a from public.dd_provider_applications where provider_id=o.provider_id and application_status in('APPROVED','SUBMITTED')
 order by case when application_status='APPROVED' then 0 else 1 end,updated_at desc limit 1;
 if a.provider_id is null or a.dispatch_latitude is null or a.dispatch_longitude is null or a.dispatch_location_verified_at is null then raise exception 'VERIFIED_PROVIDER_DISPATCH_ORIGIN_REQUIRED'; end if;
 if r.id is null or r.service_latitude is null or r.service_longitude is null or r.jurisdiction_verified_at is null then raise exception 'VERIFIED_JOB_DESTINATION_REQUIRED'; end if;
 select * into p from public.dd_provider_travel_policies where status='ACTIVE' and evidence_status in('EXTERNAL_VERIFIED','SYSTEM_VERIFIED','OWNER_CONFIRMED','DOCUMENT_EVIDENCE','RESEARCH_BENCHMARK')
 and effective_from<=now() and(effective_to is null or effective_to>now()) order by effective_from desc limit 1;
 if p.id is null then raise exception 'ACTIVE_TRAVEL_POLICY_REQUIRED'; end if;
 route:=round(p_route_distance_miles,2);
 if a.service_radius_miles is not null and route>a.service_radius_miles and not a.willing_outside_radius then raise exception 'PROVIDER_OUTSIDE_SERVICE_RADIUS'; end if;
 reimb:=round(route*p.trip_multiplier,2); travel:=round(reimb*p.cents_per_mile,2);
 select coalesce((snapshot_payload->>'economicHeadroom')::numeric,0) into headroom from public.dd_estimate_economics_snapshots where id=o.economics_snapshot_id;
 select coalesce(sum(travel_cost_snapshot),0) into reserved from public.dd_estimate_assignment_offers where estimate_id=o.estimate_id and economics_snapshot_id=o.economics_snapshot_id and assignment_type='PROVIDER' and id<>o.id and status not in('CANCELLED','SUPERSEDED','DECLINED','OWNER_REJECTED_COUNTER');
 remaining:=greatest(0,round(headroom-reserved,2));
 update public.dd_estimate_assignment_offers set route_distance_miles=route,route_distance_source=trim(p_route_source),
 route_origin_snapshot=jsonb_build_object('providerApplicationId',a.id,'address',a.physical_address,'latitude',a.dispatch_latitude,'longitude',a.dispatch_longitude,'verifiedAt',a.dispatch_location_verified_at),
 route_destination_snapshot=jsonb_build_object('serviceRequestId',r.id,'address',r.location_address,'latitude',r.service_latitude,'longitude',r.service_longitude,'verifiedAt',r.jurisdiction_verified_at),
 jurisdiction_snapshot=jsonb_build_object('state',r.jurisdiction_state,'county',r.jurisdiction_county,'municipality',r.jurisdiction_municipality),travel_cost_snapshot=travel where id=o.id;
 if travel>remaining then
  update public.dd_estimate_assignment_offers set economic_impact_status='REQUIRES_REPRICE' where id=o.id;
  update public.dd_estimates set assignment_readiness_status='NEEDS_REPRICE',estimate_status='needs_review',updated_at=now() where id=o.estimate_id;
  return jsonb_build_object('offered',false,'reason','TRAVEL_EXCEEDS_ECONOMIC_HEADROOM','routeMilesOneWay',route,'reimbursableMiles',reimb,'travelCost',travel,'remainingHeadroom',remaining);
 end if;
 update public.dd_estimate_assignment_offers set status='OFFERED',
 proposed_compensation=round(coalesce(o.proposed_compensation,0)+travel,2),
 target_payout_amount=round(coalesce(o.target_payout_amount,o.proposed_compensation,0)+travel,2),
 maximum_payout_amount=round(coalesce(o.maximum_payout_amount,o.proposed_compensation,0)+travel,2),
 economic_ceiling_amount=round(coalesce(o.economic_ceiling_amount,o.proposed_compensation,0)+travel,2),
 budgeted_provider_cost=round(coalesce(o.budgeted_provider_cost,o.proposed_compensation,0)+travel,2),
 payout_band_snapshot=coalesce(o.payout_band_snapshot,'{}'::jsonb)||jsonb_build_object('travel',jsonb_build_object('routeMilesOneWay',route,'tripMultiplier',p.trip_multiplier,'reimbursableMiles',reimb,'ratePerMile',p.cents_per_mile,'travelCost',travel,'policyCode',p.policy_code,'source',p.source_reference)),
 economic_impact_status='WITHIN_FLOOR',offered_at=now() where id=o.id;
 insert into public.dd_estimate_assignment_events(assignment_offer_id,event_type,from_status,to_status,compensation_before,compensation_after,payload)
 values(o.id,'PROVIDER_ROUTE_ECONOMICS_FINALIZED','PROPOSED','OFFERED',o.proposed_compensation,round(coalesce(o.proposed_compensation,0)+travel,2),jsonb_build_object('routeMilesOneWay',route,'reimbursableMiles',reimb,'travelCost',travel,'routeSource',trim(p_route_source),'travelPolicy',p.policy_code));
 update public.dd_estimates set assignment_readiness_status='AWAITING_PROVIDER',updated_at=now() where id=o.estimate_id;
 return jsonb_build_object('offered',true,'routeMilesOneWay',route,'reimbursableMiles',reimb,'travelCost',travel,'totalOffer',round(coalesce(o.proposed_compensation,0)+travel,2),'remainingHeadroomAfterTravel',round(remaining-travel,2));
end $$;
revoke all on function public.dd_finalize_provider_route_offer(uuid,numeric,text) from public,anon,authenticated;
grant execute on function public.dd_finalize_provider_route_offer(uuid,numeric,text) to service_role;
