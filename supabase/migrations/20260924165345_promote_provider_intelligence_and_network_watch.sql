
create or replace view public.dd_provider_intelligence_v1 as
select
  o.id as provider_org_id,
  o.name as provider_org_name,
  o.permission_status,
  o.qualification_status,
  o.compliance_status,
  o.agreement_status,
  o.accepts_new_work,
  count(distinct p.id) filter (where p.is_active) as active_provider_records,
  coalesce(jsonb_agg(distinct jsonb_build_object(
    'provider_id',p.id,
    'name',trim(concat_ws(' ',p.first_name,p.last_name)),
    'role_title',p.role_title,
    'active',p.is_active
  )) filter (where p.id is not null),'[]'::jsonb) as provider_records,
  count(distinct c.id) as capability_records,
  count(distinct c.id) filter (where c.is_authorized) as authorized_capabilities,
  coalesce(jsonb_agg(distinct jsonb_build_object(
    'capability_key',c.capability_key,
    'service_line',c.service_line,
    'service_id',c.service_id,
    'authorized',c.is_authorized
  )) filter (where c.id is not null),'[]'::jsonb) as capabilities,
  count(distinct i.id) filter (where i.is_active) as active_portal_identities,
  count(distinct s.id) as agreement_signatures,
  count(distinct w.id) as w9_submissions,
  case
    when count(distinct p.id) filter (where p.is_active) > 1 then 'DUPLICATE_PROVIDER_RECORDS'
    when count(distinct c.id) filter (where c.is_authorized) > 0
      and count(distinct i.id) filter (where i.is_active) > 0 then 'CAPABILITY_AND_PORTAL_EVIDENCED'
    when count(distinct c.id) filter (where c.is_authorized) > 0 then 'CAPABILITY_EVIDENCED'
    when o.permission_status in ('APPROVED','AUTHORIZED') or o.qualification_status='QUALIFIED'
      then 'ORG_EVIDENCED_CAPABILITY_MISSING'
    else 'INSUFFICIENT_EVIDENCE'
  end as intelligence_status,
  now() as observed_at
from public.dd_provider_organizations o
left join public.dd_providers p on p.org_id=o.id
left join public.dd_provider_capabilities c on c.provider_org_id=o.id or c.provider_id=p.id
left join public.dd_portal_identities i on i.entity_id=p.id or i.organization_id=o.id
left join public.dd_provider_agreement_signatures s on s.provider_org_id=o.id or s.provider_id=p.id
left join public.dd_provider_w9_submissions w on w.provider_org_id=o.id or w.auth_user_id=i.auth_user_id
group by o.id,o.name,o.permission_status,o.qualification_status,o.compliance_status,o.agreement_status,o.accepts_new_work;

create or replace view public.dd_provider_intelligence_summary_v1 as
select
  count(*) as provider_orgs,
  count(*) filter(where intelligence_status='DUPLICATE_PROVIDER_RECORDS') as duplicate_provider_orgs,
  count(*) filter(where authorized_capabilities>0) as orgs_with_authorized_capabilities,
  count(*) filter(where active_portal_identities>0) as orgs_with_active_portal,
  count(*) filter(where permission_status in ('APPROVED','AUTHORIZED')) as approved_orgs,
  count(*) filter(where qualification_status='QUALIFIED') as qualified_orgs,
  count(*) filter(where compliance_status='VERIFIED') as compliance_verified_orgs,
  count(*) filter(where agreement_status in ('EXECUTED','ACTIVE')) as executed_agreement_orgs
from public.dd_provider_intelligence_v1;

create or replace function public.dd_run_provider_network_watch()
returns jsonb
language plpgsql
security definer
set search_path=public
as $$
declare
  v_status_gaps integer:=0;
  v_blocked_jobs integer:=0;
  v_capacity integer:=0;
begin
  insert into public.dd_owner_attention_queue
    (domain,source_table,source_record_id,reason,priority,status,recommended_action,metadata)
  select
    'provider_network','dd_provider_assignment_readiness_v1',r.provider_id::text,
    'Provider record appears approved/qualified but is not assignment-ready.',
    'HIGH','OPEN',
    'Reconcile actual onboarding, W-9, agreement, service-menu, compliance and capability gates before dispatch.',
    jsonb_build_object(
      'provider_code',r.provider_code,
      'legal_name',r.legal_name,
      'application_status',r.application_status,
      'w9_ready',r.w9_compliance_ready,
      'agreement_ready',r.agreement_compliance_ready,
      'service_menu_ready',r.service_menu_ready,
      'assignment_ready',r.assignment_ready,
      'next_action',r.onboarding_next_action
    )
  from public.dd_provider_assignment_readiness_v1 r
  where coalesce(r.assignment_ready,false)=false
    and (
      upper(coalesce(r.application_status,''))='APPROVED'
      or upper(coalesce(r.compliance_status,''))='VERIFIED'
      or upper(coalesce(r.agreement_status,'')) in ('EXECUTED','ACTIVE')
    )
    and not exists (
      select 1 from public.dd_owner_attention_queue q
      where q.status='OPEN'
        and q.source_table='dd_provider_assignment_readiness_v1'
        and q.source_record_id=r.provider_id::text
        and q.reason='Provider record appears approved/qualified but is not assignment-ready.'
    );
  get diagnostics v_status_gaps=row_count;

  insert into public.dd_owner_attention_queue
    (domain,source_table,source_record_id,reason,priority,status,recommended_action,metadata)
  select
    'fulfillment','dd_jobs',j.id::text,
    'Blocked job has no accepted provider assignment.',
    'HIGH','OPEN',
    'Match an assignment-ready provider by authorized capability, geography, availability and economics; otherwise reschedule/refund per customer decision.',
    jsonb_build_object(
      'job_title',j.job_title,
      'service_request_id',j.service_request_id,
      'scheduled_start',j.scheduled_start,
      'location_area',case when j.location_address is not null then regexp_replace(j.location_address,'^.*?,\s*','') else null end
    )
  from public.dd_jobs j
  where j.job_status='blocked'
    and not exists (
      select 1 from public.dd_job_assignments a
      where a.job_id=j.id and lower(a.assignment_status)='accepted'
    )
    and not exists (
      select 1 from public.dd_owner_attention_queue q
      where q.status='OPEN'
        and q.source_table='dd_jobs'
        and q.source_record_id=j.id::text
        and q.reason='Blocked job has no accepted provider assignment.'
    );
  get diagnostics v_blocked_jobs=row_count;

  insert into public.dd_owner_attention_queue
    (domain,source_table,source_record_id,reason,priority,status,recommended_action,metadata)
  select
    'provider_network','dd_provider_capacity_profiles',c.id::text,
    'Provider capacity reached or exceeded.',
    'HIGH','OPEN',
    'Route new work to another eligible provider or review provider capacity.',
    jsonb_build_object(
      'provider_id',c.provider_id,
      'current_jobs',c.current_jobs,
      'max_jobs_per_day',c.max_jobs_per_day,
      'current_hours',c.current_hours,
      'max_hours_per_day',c.max_hours_per_day,
      'capacity_status',c.capacity_status
    )
  from public.dd_provider_capacity_profiles c
  where upper(coalesce(c.capacity_status,'')) in ('ACTIVE','AVAILABLE','OPEN')
    and (
      (c.max_jobs_per_day is not null and coalesce(c.current_jobs,0)>=c.max_jobs_per_day)
      or
      (c.max_hours_per_day is not null and coalesce(c.current_hours,0)>=c.max_hours_per_day)
    )
    and not exists (
      select 1 from public.dd_owner_attention_queue q
      where q.status='OPEN'
        and q.source_table='dd_provider_capacity_profiles'
        and q.source_record_id=c.id::text
        and q.reason='Provider capacity reached or exceeded.'
    );
  get diagnostics v_capacity=row_count;

  return jsonb_build_object(
    'status','COMPLETED',
    'external_side_effects',false,
    'provider_status_gaps_queued',v_status_gaps,
    'blocked_jobs_queued',v_blocked_jobs,
    'capacity_alerts_queued',v_capacity,
    'ran_at',now()
  );
end;
$$;
