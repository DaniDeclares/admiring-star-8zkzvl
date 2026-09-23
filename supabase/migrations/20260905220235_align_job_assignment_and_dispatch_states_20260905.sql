create or replace function public.dd_dispatch_eligible_jobs(p_limit integer default 25)
returns table(job_id uuid, provider_id uuid, assignment_id uuid, eligibility_score numeric)
language sql security definer set search_path=public as $$
with open_jobs as (
 select j.id jid,j.scheduled_start,j.work_order_id from dd_jobs j
 where j.job_status='new' and j.assigned_to is null
 order by j.scheduled_start nulls last,j.created_at limit greatest(coalesce(p_limit,25),1)
), candidates as (
 select o.jid,c.provider_id pid,
 (case when upper(coalesce(c.capacity_status,''))='AVAILABLE' then 50 else 0 end + case when c.max_jobs_per_day>0 then 25 else 0 end + case when c.max_concurrent_jobs>0 then 25 else 0 end)::numeric score
 from open_jobs o cross join dd_provider_capacity_profiles c
 join dd_providers p on p.id=c.provider_id and p.is_active
 join dd_provider_organizations org on org.id=p.org_id
 where upper(coalesce(c.capacity_status,''))='AVAILABLE' and c.max_jobs_per_day>current_jobs and c.max_concurrent_jobs>current_jobs
 and org.is_active and upper(coalesce(org.qualification_status,''))='QUALIFIED'
 and upper(coalesce(org.compliance_status,''))='VERIFIED'
 and upper(coalesce(org.agreement_status,'')) in ('ACTIVE','EXECUTED')
 and upper(coalesce(org.network_access_level,''))='AUTHORIZED' and upper(coalesce(org.permission_status,''))='AUTHORIZED'
 and coalesce(org.accepts_new_work,false)
 and (o.work_order_id is null or not exists(select 1 from dd_work_orders wo where wo.id=o.work_order_id and wo.service_id is not null)
      or exists(select 1 from dd_work_orders wo join dd_provider_capabilities pc on pc.provider_org_id=org.id and pc.provider_id=p.id and pc.service_id=wo.service_id and pc.is_authorized where wo.id=o.work_order_id))
 and not exists(select 1 from dd_job_assignments a where a.job_id=o.jid and a.provider_id=c.provider_id and a.assignment_status in ('OFFERED','ACCEPTED'))
), ranked as (select c.*,row_number() over(partition by jid order by score desc,pid) rn from candidates c), ins as (
 insert into dd_job_assignments(job_id,provider_id,assignment_status,offered_at,created_at,updated_at)
 select jid,pid,'OFFERED',now(),now(),now() from ranked where rn=1 returning id aid,job_id jid,provider_id pid)
select i.jid,i.pid,i.aid,r.score from ins i join ranked r on r.jid=i.jid and r.pid=i.pid; $$;

create or replace function public.dd_offer_provider(p_job_id uuid,p_provider_id uuid,p_offer_minutes integer default 30,p_sequence integer default 1)
returns uuid language plpgsql security definer set search_path=public as $$
declare v_id uuid; begin
 if not exists(select 1 from dd_jobs where id=p_job_id and job_status='new') then raise exception 'Job is not eligible for dispatch'; end if;
 if not exists(select 1 from dd_provider_capacity_profiles where provider_id=p_provider_id and upper(capacity_status)='AVAILABLE' and max_jobs_per_day>current_jobs and max_concurrent_jobs>current_jobs) then raise exception 'Provider has no available capacity'; end if;
 insert into dd_job_assignments(job_id,provider_id,assignment_status,offered_at,offer_expires_at,offer_sequence,created_at,updated_at)
 values(p_job_id,p_provider_id,'OFFERED',now(),now()+make_interval(mins=>greatest(p_offer_minutes,1)),p_sequence,now(),now()) returning id into v_id; return v_id; end $$;

create or replace function public.dd_respond_to_offer(p_assignment_id uuid,p_accept boolean,p_reason text default null)
returns boolean language plpgsql security definer set search_path=public as $$
declare a public.dd_job_assignments; begin
 select * into a from dd_job_assignments where id=p_assignment_id for update;
 if a.id is null or a.assignment_status<>'OFFERED' then raise exception 'Offer is not active'; end if;
 if a.offer_expires_at is not null and a.offer_expires_at<=now() then update dd_job_assignments set assignment_status='CANCELLED',rejection_reason=coalesce(p_reason,'Offer expired'),response_at=now(),cancelled_at=now(),updated_at=now() where id=a.id; return false; end if;
 if p_accept then update dd_job_assignments set assignment_status='ACCEPTED',accepted_at=now(),response_at=now(),updated_at=now() where id=a.id;
 update dd_jobs set assigned_to=a.provider_id::text,job_status='scheduled',updated_at=now() where id=a.job_id;
 update dd_provider_capacity_profiles set current_jobs=current_jobs+1,updated_at=now() where provider_id=a.provider_id; return true;
 else update dd_job_assignments set assignment_status='REJECTED',rejection_reason=p_reason,rejected_at=now(),response_at=now(),updated_at=now() where id=a.id; return false; end if; end $$;

create or replace function public.dd_route_work_order(p_request_id uuid default null,p_job_id uuid default null,p_service_id uuid default null,p_capability_key text default null,p_zip_code text default null,p_offer_expiry_minutes integer default 30)
returns table(routing_id uuid,selected_provider_org_id uuid,selected_provider_id uuid,assignment_id uuid,offer_status text,routing_reason text)
language plpgsql security definer set search_path=public,private as $$
declare v_routing_id uuid;v_selected_org uuid;v_selected_provider uuid;v_assignment_id uuid;v_reason text;v_offer_status text;v_eligible_orgs uuid[];v_eligible_providers uuid[];v_job_id uuid:=p_job_id;v_service_id uuid:=p_service_id;v_existing_offer uuid;
begin
 if v_job_id is null and p_request_id is not null then select j.id into v_job_id from dd_jobs j where j.service_request_id=p_request_id order by j.created_at desc limit 1; end if;
 if v_service_id is null and v_job_id is not null then select sr.service_id into v_service_id from dd_jobs j join service_requests sr on sr.id=j.service_request_id where j.id=v_job_id; end if;
 select coalesce(array_agg(x.id order by x.routing_priority,x.id),'{}'::uuid[]) into v_eligible_orgs from (select distinct o.id,o.routing_priority from dd_provider_organizations o join dd_provider_capabilities c on c.provider_org_id=o.id and c.is_authorized left join dd_provider_coverage cv on cv.provider_org_id=o.id where o.is_active and o.accepts_new_work and o.capacity_status='AVAILABLE' and upper(coalesce(o.qualification_status,''))='QUALIFIED' and upper(coalesce(o.permission_status,''))='AUTHORIZED' and upper(coalesce(o.network_access_level,''))='AUTHORIZED' and upper(coalesce(o.compliance_status,''))='VERIFIED' and upper(coalesce(o.agreement_status,'')) in ('ACTIVE','EXECUTED') and (v_service_id is null or c.service_id=v_service_id) and (p_capability_key is null or c.capability_key=p_capability_key or c.service_line=p_capability_key) and (p_zip_code is null or cv.zip_code=p_zip_code or cv.territory_id=p_zip_code)) x;
 select coalesce(array_agg(x.id order by x.id),'{}'::uuid[]) into v_eligible_providers from (select distinct p.id from dd_providers p join dd_provider_organizations o on o.id=p.org_id join dd_provider_capabilities c on c.provider_id=p.id and c.is_authorized left join dd_provider_coverage cv on cv.provider_id=p.id where p.is_active and o.is_active and o.accepts_new_work and o.capacity_status='AVAILABLE' and upper(coalesce(o.qualification_status,''))='QUALIFIED' and upper(coalesce(o.permission_status,''))='AUTHORIZED' and upper(coalesce(o.network_access_level,''))='AUTHORIZED' and upper(coalesce(o.compliance_status,''))='VERIFIED' and upper(coalesce(o.agreement_status,'')) in ('ACTIVE','EXECUTED') and (v_service_id is null or c.service_id=v_service_id) and (p_capability_key is null or c.capability_key=p_capability_key or c.service_line=p_capability_key) and (p_zip_code is null or cv.zip_code=p_zip_code or cv.territory_id=p_zip_code)) x;
 select o.id into v_selected_org from dd_provider_organizations o where o.id=any(v_eligible_orgs) order by o.routing_priority,o.id limit 1;
 if v_selected_org is not null then select p.id into v_selected_provider from dd_providers p where p.id=any(v_eligible_providers) and p.org_id=v_selected_org and p.is_active order by p.created_at,p.id limit 1; v_reason='PRIMARY_PROVIDER_PRIORITY'; elsif coalesce(array_length(v_eligible_providers,1),0)>0 then select p.id into v_selected_provider from dd_providers p join dd_provider_organizations o on o.id=p.org_id where p.id=any(v_eligible_providers) order by o.routing_priority,p.id limit 1; v_selected_org=(select org_id from dd_providers where id=v_selected_provider); v_reason='PRIMARY_PROVIDER_PRIORITY'; else v_reason='NO_ELIGIBLE_PROVIDER'; end if;
 if v_job_id is not null and v_selected_org is not null and v_selected_provider is not null then select a.id into v_existing_offer from dd_job_assignments a where a.job_id=v_job_id and a.provider_org_id=v_selected_org and a.assignment_status='OFFERED' order by a.created_at desc limit 1; if v_existing_offer is null then insert into dd_job_assignments(job_id,provider_id,provider_org_id,assignment_status,admin_notes) values(v_job_id,v_selected_provider,v_selected_org,'OFFERED','Created by Provider Network resolver.') returning id into v_assignment_id; else v_assignment_id=v_existing_offer; end if; end if;
 v_offer_status=case when v_selected_org is null or v_selected_provider is null then 'NO_ELIGIBLE_PROVIDER' else 'OFFERED' end;
 insert into private.dd_work_order_routing(request_id,job_id,service_id,capability_key,location_zip,eligible_provider_org_ids,eligible_provider_ids,selected_provider_org_id,selected_provider_id,offer_status,routing_reason,assignment_id,assignment_timestamp,offer_expires_at) values(p_request_id,v_job_id,v_service_id,p_capability_key,p_zip_code,v_eligible_orgs,v_eligible_providers,v_selected_org,v_selected_provider,v_offer_status,v_reason,v_assignment_id,case when v_assignment_id is null then null else now() end,case when v_assignment_id is null then null else now()+make_interval(mins=>greatest(p_offer_expiry_minutes,1)) end) returning id into v_routing_id; return query select v_routing_id,v_selected_org,v_selected_provider,v_assignment_id,v_offer_status,v_reason; end $$;

revoke all on function public.dd_dispatch_eligible_jobs(integer) from public,anon,authenticated; grant execute on function public.dd_dispatch_eligible_jobs(integer) to service_role;
revoke all on function public.dd_offer_provider(uuid,uuid,integer,integer) from public,anon,authenticated; grant execute on function public.dd_offer_provider(uuid,uuid,integer,integer) to service_role;
revoke all on function public.dd_respond_to_offer(uuid,boolean,text) from public,anon,authenticated; grant execute on function public.dd_respond_to_offer(uuid,boolean,text) to service_role;
