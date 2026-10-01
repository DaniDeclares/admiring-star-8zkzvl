-- Connect the paid-first estimate offer to canonical dispatch without allowing the
-- browser to choose a provider, bypass readiness, or create an overlapping slot.
create or replace function public.dd_respond_to_my_estimate_offer(
  p_offer_id uuid,
  p_accept boolean,
  p_reason text default null
)
returns jsonb
language plpgsql
security definer
set search_path to 'public', 'private', 'pg_catalog'
as $function$
declare
  v_offer public.dd_estimate_assignment_offers%rowtype;
  v_provider_id uuid;
  v_job public.dd_jobs%rowtype;
  v_assignment_id uuid;
  v_now timestamptz := now();
begin
  if auth.uid() is null then raise exception 'AUTH_REQUIRED'; end if;
  v_provider_id := private.dd_current_provider_id();
  if v_provider_id is null then raise exception 'PROVIDER_REQUIRED'; end if;

  select * into v_offer
  from public.dd_estimate_assignment_offers
  where id = p_offer_id
  for update;

  if v_offer.id is null
     or v_offer.assignment_type <> 'PROVIDER'
     or v_offer.provider_id <> v_provider_id then
    raise exception 'ESTIMATE_OFFER_NOT_FOUND_OR_UNAUTHORIZED';
  end if;
  if v_offer.status <> 'OFFERED' then raise exception 'ESTIMATE_OFFER_NOT_ACTIVE'; end if;
  if v_offer.expires_at is not null and v_offer.expires_at <= v_now then
    update public.dd_estimate_assignment_offers
       set status='CANCELLED', responded_at=v_now, counter_reason=coalesce(p_reason,'Offer expired'), updated_at=v_now
     where id=v_offer.id;
    return jsonb_build_object('accepted',false,'status','CANCELLED','reason','OFFER_EXPIRED');
  end if;

  if not p_accept then
    update public.dd_estimate_assignment_offers
       set status='DECLINED', responded_at=v_now, counter_reason=nullif(trim(coalesce(p_reason,'')),''), updated_at=v_now
     where id=v_offer.id;
    insert into public.dd_estimate_assignment_events(
      assignment_offer_id,event_type,actor_user_id,actor_provider_id,
      from_status,to_status,compensation_before,compensation_after,reason,payload
    ) values (
      v_offer.id,'PROVIDER_DECLINE',auth.uid(),v_provider_id,
      'OFFERED','DECLINED',v_offer.proposed_compensation,v_offer.proposed_compensation,
      nullif(trim(coalesce(p_reason,'')),''),jsonb_build_object('authority','PROVIDER_BOUND_RPC')
    );
    update public.dd_estimates set assignment_readiness_status='NEEDS_REASSIGNMENT',updated_at=v_now where id=v_offer.estimate_id;
    return jsonb_build_object('accepted',false,'status','DECLINED','offerId',v_offer.id);
  end if;

  select * into v_job
  from public.dd_jobs
  where estimate_id=v_offer.estimate_id and job_status not in ('cancelled','closed')
  order by created_at desc limit 1
  for update;
  if v_job.id is null then raise exception 'PAID_JOB_REQUIRED_BEFORE_PROVIDER_ACCEPTANCE'; end if;
  if v_job.scheduled_start is null or v_job.scheduled_end is null then
    raise exception 'CONFIRMED_SCHEDULE_REQUIRED_BEFORE_PROVIDER_ACCEPTANCE';
  end if;

  -- The existing BEFORE guards enforce provider activation, compliance,
  -- capability and affinity. The existing AFTER trigger creates the appointment;
  -- its exclusion constraint rejects provider overlaps transactionally.
  insert into public.dd_job_assignments(
    job_id,provider_id,provider_org_id,assignment_status,provider_notes,
    offered_at,accepted_at,response_at,work_package_id,provider_slot_id
  )
  select v_job.id,v_provider_id,p.org_id,'ACCEPTED','Accepted paid estimate offer.',
         coalesce(v_offer.offered_at,v_now),v_now,v_now,v_offer.work_package_id,v_offer.provider_slot_id
  from public.dd_providers p where p.id=v_provider_id
  returning id into v_assignment_id;

  update public.dd_estimate_assignment_offers
     set status='ACCEPTED',responded_at=v_now,resolved_at=v_now,resolved_by=auth.uid(),resolution='ACCEPT',updated_at=v_now
   where id=v_offer.id;
  update public.dd_estimates set assignment_readiness_status='READY',updated_at=v_now where id=v_offer.estimate_id;
  update public.dd_jobs set assigned_to=v_provider_id::text,job_status='scheduled',updated_at=v_now where id=v_job.id;

  insert into public.dd_estimate_assignment_events(
    assignment_offer_id,event_type,actor_user_id,actor_provider_id,
    from_status,to_status,compensation_before,compensation_after,payload
  ) values (
    v_offer.id,'PROVIDER_ACCEPT',auth.uid(),v_provider_id,
    'OFFERED','ACCEPTED',v_offer.proposed_compensation,v_offer.proposed_compensation,
    jsonb_build_object('authority','PROVIDER_BOUND_RPC','jobId',v_job.id,'jobAssignmentId',v_assignment_id)
  );

  return jsonb_build_object(
    'accepted',true,'status','ACCEPTED','offerId',v_offer.id,
    'jobId',v_job.id,'jobAssignmentId',v_assignment_id
  );
end
$function$;

revoke all on function public.dd_respond_to_my_estimate_offer(uuid,boolean,text) from public,anon;
grant execute on function public.dd_respond_to_my_estimate_offer(uuid,boolean,text) to authenticated,service_role;

comment on function public.dd_respond_to_my_estimate_offer(uuid,boolean,text) is
  'Provider-bound paid-estimate offer response. Acceptance materializes canonical assignment and appointment through existing readiness and overlap guards.';
