
create or replace function public.dd_get_my_provider_economic_offers()
returns table(
 offer_id uuid, estimate_id uuid, status text, scope_snapshot jsonb,
 offered_compensation numeric, offered_basis jsonb,
 counter_compensation numeric, counter_basis jsonb, counter_reason text,
 offer_version integer, offered_at timestamptz, responded_at timestamptz, expires_at timestamptz,
 route_distance_miles numeric, work_package_id uuid, scope_acknowledgement_required boolean,
 scope_acknowledged_at timestamptz, resource_requirements jsonb
)
language sql stable security definer
set search_path='public','private','pg_catalog'
as $$
 select o.id,o.estimate_id,o.status,o.scope_snapshot,o.proposed_compensation,o.proposed_basis,
        o.counter_compensation,o.counter_basis,o.counter_reason,o.offer_version,o.offered_at,o.responded_at,o.expires_at,
        o.route_distance_miles,o.work_package_id,o.scope_acknowledgement_required,o.scope_acknowledged_at,
        o.resource_requirements_snapshot
 from public.dd_estimate_assignment_offers o
 where auth.uid() is not null
   and o.assignment_type='PROVIDER'
   and o.provider_id=private.dd_current_provider_id()
 order by o.created_at desc
$$;
revoke all on function public.dd_get_my_provider_economic_offers() from public, anon;
grant execute on function public.dd_get_my_provider_economic_offers() to authenticated, service_role;

create or replace function public.dd_submit_my_provider_counteroffer(
 p_offer_id uuid, p_counter_compensation numeric, p_counter_reason text, p_counter_basis jsonb default '{}'::jsonb
) returns jsonb
language plpgsql security definer
set search_path='public','private','pg_catalog'
as $$
declare o public.dd_estimate_assignment_offers%rowtype; actor_provider uuid;
begin
 if auth.uid() is null then raise exception 'AUTH_REQUIRED'; end if;
 actor_provider:=private.dd_current_provider_id();
 if actor_provider is null then raise exception 'PROVIDER_REQUIRED'; end if;
 if p_counter_compensation is null or p_counter_compensation <= 0 then raise exception 'COUNTER_AMOUNT_INVALID'; end if;
 if nullif(trim(coalesce(p_counter_reason,'')),'') is null then raise exception 'COUNTER_REASON_REQUIRED'; end if;

 select * into o from public.dd_estimate_assignment_offers
 where id=p_offer_id for update;
 if o.id is null or o.assignment_type<>'PROVIDER' or o.provider_id<>actor_provider then
   raise exception 'OFFER_NOT_FOUND_OR_UNAUTHORIZED';
 end if;
 if o.status not in ('OFFERED','REVISED') then raise exception 'OFFER_NOT_COUNTERABLE:%',o.status; end if;
 if o.expires_at is not null and o.expires_at <= now() then raise exception 'OFFER_EXPIRED'; end if;

 update public.dd_estimate_assignment_offers
 set counter_compensation=round(p_counter_compensation,2),
     counter_basis=coalesce(p_counter_basis,'{}'::jsonb),
     counter_reason=trim(p_counter_reason),
     status='COUNTEROFFERED',
     economic_impact_status='NOT_EVALUATED',
     responded_at=now(),
     updated_at=now()
 where id=o.id;

 insert into public.dd_estimate_assignment_events(
   assignment_offer_id,event_type,from_status,to_status,compensation_before,compensation_after,payload
 ) values(
   o.id,'PROVIDER_COUNTEROFFER_SUBMITTED',o.status,'COUNTEROFFERED',
   o.proposed_compensation,round(p_counter_compensation,2),
   jsonb_build_object('providerId',actor_provider,'reason',trim(p_counter_reason),'basis',coalesce(p_counter_basis,'{}'::jsonb))
 );

 return jsonb_build_object(
   'offerId',o.id,'status','COUNTEROFFERED','counterCompensation',round(p_counter_compensation,2),
   'economicDecision','PENDING_OWNER_REVIEW'
 );
end $$;
revoke all on function public.dd_submit_my_provider_counteroffer(uuid,numeric,text,jsonb) from public, anon;
grant execute on function public.dd_submit_my_provider_counteroffer(uuid,numeric,text,jsonb) to authenticated, service_role;
