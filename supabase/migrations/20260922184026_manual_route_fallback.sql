alter table public.dd_estimate_assignment_offers
 add column if not exists route_verification_method text,
 add column if not exists route_verified_by text,
 add column if not exists route_verified_at timestamptz;

create table if not exists public.dd_manual_route_verifications(
 id uuid primary key default gen_random_uuid(),
 assignment_offer_id uuid not null references public.dd_estimate_assignment_offers(id) on delete cascade,
 route_distance_miles numeric not null check(route_distance_miles>=0),
 verification_method text not null check(verification_method in('MANUAL_MAP_CHECK','ODOMETER_REFERENCE','OWNER_CONFIRMED_ROUTE')),
 source_note text not null,
 verified_by text not null,
 verified_at timestamptz not null default now(),
 created_at timestamptz not null default now()
);
alter table public.dd_manual_route_verifications enable row level security;
revoke all on public.dd_manual_route_verifications from anon,authenticated;
grant select,insert,update,delete on public.dd_manual_route_verifications to service_role;

create or replace function public.dd_finalize_manual_provider_route_offer(
 p_assignment_id uuid,p_route_distance_miles numeric,p_source_note text,p_verified_by text,p_verification_method text default 'MANUAL_MAP_CHECK'
) returns jsonb language plpgsql security definer set search_path=public,pg_catalog as $$
declare result jsonb; source_label text;
begin
 if p_verification_method not in('MANUAL_MAP_CHECK','ODOMETER_REFERENCE','OWNER_CONFIRMED_ROUTE') then raise exception 'INVALID_MANUAL_ROUTE_METHOD'; end if;
 if nullif(trim(coalesce(p_source_note,'')),'') is null then raise exception 'MANUAL_ROUTE_SOURCE_NOTE_REQUIRED'; end if;
 if nullif(trim(coalesce(p_verified_by,'')),'') is null then raise exception 'MANUAL_ROUTE_VERIFIER_REQUIRED'; end if;
 source_label:='MANUAL_VERIFIED:'||p_verification_method||':'||trim(p_source_note);
 result:=public.dd_finalize_provider_route_offer(p_assignment_id,p_route_distance_miles,source_label);
 insert into public.dd_manual_route_verifications(assignment_offer_id,route_distance_miles,verification_method,source_note,verified_by)
 values(p_assignment_id,p_route_distance_miles,p_verification_method,trim(p_source_note),trim(p_verified_by));
 update public.dd_estimate_assignment_offers set route_verification_method=p_verification_method,route_verified_by=trim(p_verified_by),route_verified_at=now() where id=p_assignment_id;
 return result||jsonb_build_object('routeVerificationMethod',p_verification_method,'routeVerifiedBy',trim(p_verified_by),'paidRoutingApiRequired',false);
end $$;
revoke all on function public.dd_finalize_manual_provider_route_offer(uuid,numeric,text,text,text) from public,anon,authenticated;
grant execute on function public.dd_finalize_manual_provider_route_offer(uuid,numeric,text,text,text) to service_role;

comment on function public.dd_finalize_manual_provider_route_offer(uuid,numeric,text,text,text) is 'No-cost routing fallback. Owner/staff enters road mileage verified from a map/odometer source; the same provider radius, travel-cost, and economic-headroom gates then apply. Replace with automated routing source later without changing payout economics.';
