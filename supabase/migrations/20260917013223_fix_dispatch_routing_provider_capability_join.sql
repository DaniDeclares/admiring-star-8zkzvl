-- Second bug in the same function: dd_provider_capabilities.provider_id is NULL for every
-- row in the system today (capabilities are granted at the ORG level via provider_org_id;
-- confirmed by inspection). The individual-provider eligibility subquery joined strictly on
-- c.provider_id=p.id, so it could never match a single row -- v_eligible_providers was always
-- '{}', which meant selected_provider_id stayed NULL even when selected_provider_org_id
-- correctly resolved (as just observed testing Danielle's fix: org matched, provider did not).
-- Fix: a provider is capability-eligible if their OWN capability row matches, OR their org
-- holds the authorization and their own row is silent (provider_id is null) on the point.
CREATE OR REPLACE FUNCTION public.dd_route_work_order(
  p_request_id uuid DEFAULT NULL::uuid,
  p_job_id uuid DEFAULT NULL::uuid,
  p_service_id uuid DEFAULT NULL::uuid,
  p_capability_key text DEFAULT NULL::text,
  p_zip_code text DEFAULT NULL::text,
  p_offer_expiry_minutes integer DEFAULT 30
)
RETURNS TABLE(routing_id uuid, selected_provider_org_id uuid, selected_provider_id uuid, assignment_id uuid, offer_status text, routing_reason text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'private'
AS $function$
declare v_routing_id uuid;v_selected_org uuid;v_selected_provider uuid;v_assignment_id uuid;v_reason text;v_offer_status text;v_eligible_orgs uuid[];v_eligible_providers uuid[];v_job_id uuid:=p_job_id;v_service_id uuid:=p_service_id;v_existing_offer uuid;v_next_sequence int;
begin
  if v_job_id is null and p_request_id is not null then select j.id into v_job_id from dd_jobs j where j.service_request_id=p_request_id order by j.created_at desc limit 1; end if;
  if v_service_id is null and v_job_id is not null then select sr.service_id into v_service_id from dd_jobs j join service_requests sr on sr.id=j.service_request_id where j.id=v_job_id; end if;

  select coalesce(array_agg(x.id order by x.routing_priority,x.id),'{}'::uuid[]) into v_eligible_orgs from (
    select distinct o.id,o.routing_priority from dd_provider_organizations o
    join dd_provider_capabilities c on c.provider_org_id=o.id and c.is_authorized
    left join dd_provider_coverage cv on cv.provider_org_id=o.id
    where o.is_active and o.accepts_new_work and o.capacity_status='AVAILABLE'
      and upper(coalesce(o.qualification_status,''))='QUALIFIED'
      and upper(coalesce(o.permission_status,'')) in ('AUTHORIZED','PERMISSION_GRANTED','APPROVED')
      and upper(coalesce(o.network_access_level,''))='AUTHORIZED'
      and upper(coalesce(o.compliance_status,''))='VERIFIED'
      and upper(coalesce(o.agreement_status,'')) in ('ACTIVE','EXECUTED')
      and (v_service_id is null or c.service_id=v_service_id)
      and (p_capability_key is null or c.capability_key=p_capability_key or c.service_line=p_capability_key)
      and (p_zip_code is null or cv.zip_code=p_zip_code or cv.territory_id=p_zip_code)
      and (v_job_id is null or not exists (
        select 1 from dd_job_assignments a where a.job_id=v_job_id and a.provider_org_id=o.id and a.assignment_status in ('REJECTED','CANCELLED')
      ))
  ) x;

  select coalesce(array_agg(x.id order by x.id),'{}'::uuid[]) into v_eligible_providers from (
    select distinct p.id from dd_providers p
    join dd_provider_organizations o on o.id=p.org_id
    join dd_provider_capabilities c on c.is_authorized and (c.provider_id=p.id or (c.provider_id is null and c.provider_org_id=p.org_id))
    left join dd_provider_coverage cv on cv.provider_id=p.id or cv.provider_org_id=p.org_id
    where p.is_active and o.is_active and o.accepts_new_work and o.capacity_status='AVAILABLE'
      and upper(coalesce(o.qualification_status,''))='QUALIFIED'
      and upper(coalesce(o.permission_status,'')) in ('AUTHORIZED','PERMISSION_GRANTED','APPROVED')
      and upper(coalesce(o.network_access_level,''))='AUTHORIZED'
      and upper(coalesce(o.compliance_status,''))='VERIFIED'
      and upper(coalesce(o.agreement_status,'')) in ('ACTIVE','EXECUTED')
      and (v_service_id is null or c.service_id=v_service_id)
      and (p_capability_key is null or c.capability_key=p_capability_key or c.service_line=p_capability_key)
      and (p_zip_code is null or cv.zip_code=p_zip_code or cv.territory_id=p_zip_code)
      and (v_job_id is null or not exists (
        select 1 from dd_job_assignments a where a.job_id=v_job_id and a.provider_id=p.id and a.assignment_status in ('REJECTED','CANCELLED')
      ))
  ) x;

  select o.id into v_selected_org from dd_provider_organizations o where o.id=any(v_eligible_orgs) order by o.routing_priority,o.id limit 1;
  if v_selected_org is not null then
    select p.id into v_selected_provider from dd_providers p where p.id=any(v_eligible_providers) and p.org_id=v_selected_org and p.is_active order by p.created_at,p.id limit 1;
    v_reason='PRIMARY_PROVIDER_PRIORITY';
  elsif coalesce(array_length(v_eligible_providers,1),0)>0 then
    select p.id into v_selected_provider from dd_providers p join dd_provider_organizations o on o.id=p.org_id where p.id=any(v_eligible_providers) order by o.routing_priority,p.id limit 1;
    v_selected_org=(select org_id from dd_providers where id=v_selected_provider);
    v_reason='PRIMARY_PROVIDER_PRIORITY';
  else
    v_reason='NO_ELIGIBLE_PROVIDER';
  end if;

  if v_job_id is not null and v_selected_org is not null and v_selected_provider is not null then
    select a.id into v_existing_offer from dd_job_assignments a where a.job_id=v_job_id and a.provider_org_id=v_selected_org and a.assignment_status='OFFERED' order by a.created_at desc limit 1;
    if v_existing_offer is null then
      select coalesce(max(offer_sequence),0)+1 into v_next_sequence from dd_job_assignments where job_id=v_job_id;
      insert into dd_job_assignments(job_id,provider_id,provider_org_id,assignment_status,admin_notes,offer_sequence,offered_at,offer_expires_at)
        values(v_job_id,v_selected_provider,v_selected_org,'OFFERED','Created by Provider Network resolver.',v_next_sequence,now(),now()+make_interval(mins=>greatest(p_offer_expiry_minutes,1)))
        returning id into v_assignment_id;
    else
      v_assignment_id=v_existing_offer;
    end if;
  end if;

  v_offer_status=case when v_selected_org is null or v_selected_provider is null then 'NO_ELIGIBLE_PROVIDER' else 'OFFERED' end;
  insert into private.dd_work_order_routing(request_id,job_id,service_id,capability_key,location_zip,eligible_provider_org_ids,eligible_provider_ids,selected_provider_org_id,selected_provider_id,offer_status,routing_reason,assignment_id,assignment_timestamp,offer_expires_at)
    values(p_request_id,v_job_id,v_service_id,p_capability_key,p_zip_code,v_eligible_orgs,v_eligible_providers,v_selected_org,v_selected_provider,v_offer_status,v_reason,v_assignment_id,case when v_assignment_id is null then null else now() end,case when v_assignment_id is null then null else now()+make_interval(mins=>greatest(p_offer_expiry_minutes,1)) end)
    returning id into v_routing_id;
  return query select v_routing_id,v_selected_org,v_selected_provider,v_assignment_id,v_offer_status,v_reason;
end
$function$;
