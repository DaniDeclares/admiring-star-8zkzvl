begin;

create or replace function public.dd_route_work_order(
  p_request_id uuid default null,
  p_job_id uuid default null,
  p_service_id uuid default null,
  p_capability_key text default null,
  p_zip_code text default null,
  p_offer_expiry_minutes integer default 30
)
returns table(
  routing_id uuid,
  selected_provider_org_id uuid,
  selected_provider_id uuid,
  assignment_id uuid,
  offer_status text,
  routing_reason text
)
language plpgsql
security definer
set search_path = public, private
as $$
declare
  v_routing_id uuid;
  v_selected_org uuid;
  v_selected_provider uuid;
  v_assignment_id uuid;
  v_reason text;
  v_offer_status text;
  v_eligible_orgs uuid[];
  v_eligible_providers uuid[];
begin
  select coalesce(array_agg(distinct o.id order by o.routing_priority, o.id), '{}'::uuid[])
    into v_eligible_orgs
  from public.dd_provider_organizations o
  join public.dd_provider_capabilities c on c.provider_org_id = o.id and c.is_authorized = true
  left join public.dd_provider_coverage cv on cv.provider_org_id = o.id
  where o.is_active = true and o.accepts_new_work = true and o.compliance_status = 'ACTIVE'
    and (p_service_id is null or c.service_id = p_service_id)
    and (p_capability_key is null or c.capability_key = p_capability_key or c.service_line = p_capability_key)
    and (p_zip_code is null or cv.zip_code = p_zip_code or cv.territory_id = p_zip_code);

  select coalesce(array_agg(distinct p.id), '{}'::uuid[])
    into v_eligible_providers
  from public.dd_providers p
  join public.dd_provider_organizations o on o.id = p.org_id
  join public.dd_provider_capabilities c on c.provider_id = p.id and c.is_authorized = true
  left join public.dd_provider_coverage cv on cv.provider_id = p.id
  where p.is_active = true and o.is_active = true and o.accepts_new_work = true and o.compliance_status = 'ACTIVE'
    and (p_service_id is null or c.service_id = p_service_id)
    and (p_capability_key is null or c.capability_key = p_capability_key or c.service_line = p_capability_key)
    and (p_zip_code is null or cv.zip_code = p_zip_code or cv.territory_id = p_zip_code);

  select o.id into v_selected_org
  from public.dd_provider_organizations o
  where o.id = any(v_eligible_orgs)
  order by o.routing_priority asc, o.id limit 1;

  if v_selected_org is not null then
    v_reason := 'PRIMARY_PROVIDER_PRIORITY';
  elsif coalesce(array_length(v_eligible_providers, 1), 0) > 0 then
    select p.id into v_selected_provider
    from public.dd_providers p join public.dd_provider_organizations o on o.id = p.org_id
    where p.id = any(v_eligible_providers)
    order by o.routing_priority asc, p.id limit 1;
    v_selected_org := (select org_id from public.dd_providers where id = v_selected_provider);
    v_reason := 'PRIMARY_PROVIDER_PRIORITY';
  else
    v_reason := 'NO_ELIGIBLE_PROVIDER';
  end if;

  v_offer_status := case when v_selected_org is null then 'NO_ELIGIBLE_PROVIDER' else 'OFFERED' end;

  insert into private.dd_work_order_routing (
    request_id, job_id, service_id, capability_key, location_zip,
    eligible_provider_org_ids, eligible_provider_ids, selected_provider_org_id,
    selected_provider_id, offer_status, routing_reason, offer_expires_at
  ) values (
    p_request_id, p_job_id, p_service_id, p_capability_key, p_zip_code,
    v_eligible_orgs, v_eligible_providers, v_selected_org, v_selected_provider,
    v_offer_status, v_reason,
    case when v_selected_org is null then null else now() + make_interval(mins => greatest(p_offer_expiry_minutes, 1)) end
  ) returning id into v_routing_id;

  return query select v_routing_id, v_selected_org, v_selected_provider, v_assignment_id, v_offer_status, v_reason;
end;
$$;
revoke all on function public.dd_route_work_order(uuid, uuid, uuid, text, text, integer) from public, anon, authenticated;
grant execute on function public.dd_route_work_order(uuid, uuid, uuid, text, text, integer) to service_role;
commit;