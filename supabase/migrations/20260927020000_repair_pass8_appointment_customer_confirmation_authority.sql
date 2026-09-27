-- Repair Production drift exposed by PASS-08 runtime proof.
-- Provider confirmation remains assignment-authoritative.
-- Customer confirmation is staged only from dd_job_appointments.

create or replace function public.dd_emit_assignment_accepted_confirmations()
returns trigger
language plpgsql
security definer
set search_path to 'public'
as $function$
declare
  j public.dd_jobs;
  pa public.dd_provider_applications;
  provider_email text;
  provider_phone text;
  provider_user uuid;
  customer_name text;
  appointment_text text;
  provider_body text;
begin
  if upper(coalesce(new.assignment_status,'')) <> 'ACCEPTED'
     or (tg_op='UPDATE' and upper(coalesce(old.assignment_status,''))='ACCEPTED') then
    return new;
  end if;

  select * into j from public.dd_jobs where id=new.job_id;
  if j.id is null then return new; end if;

  select * into pa
  from public.dd_provider_applications
  where provider_id=new.provider_id
  order by submitted_at desc nulls last, created_at desc
  limit 1;

  select coalesce(
    nullif(trim(l.full_name),''),
    nullif(trim(l.first_name||' '||l.last_name),''),
    'Customer'
  )
  into customer_name
  from public.leads l
  where l.id=j.lead_id;

  provider_email := nullif(trim(pa.contact_email),'');
  provider_phone := nullif(trim(pa.contact_phone),'');
  provider_user := pa.applicant_user_id;
  appointment_text := coalesce(
    to_char(j.scheduled_start at time zone 'America/New_York','FMDay, FMMonth DD at FMHH12:MI AM'),
    'time pending'
  );

  provider_body := format(
    'Confirmed: %s — %s. Scope: %s. Job reference: %s. Provider compensation: $%s.',
    coalesce(customer_name,'Customer'),
    appointment_text,
    coalesce(j.scope_summary,'See job details'),
    j.public_reference,
    trim(to_char(coalesce(
      (select total_provider_offer from public.dd_work_package_provider_slots where id=new.provider_slot_id),
      0
    ),'FM999999990.00'))
  );

  insert into public.dd_provider_notifications(
    provider_id,auth_user_id,job_id,assignment_id,notification_type,channel,title,body,payload
  )
  values(
    new.provider_id,provider_user,j.id,new.id,'ASSIGNMENT_CONFIRMED','IN_APP','Job confirmed',provider_body,
    jsonb_build_object('job_reference',j.public_reference,'scheduled_start',j.scheduled_start,'scheduled_end',j.scheduled_end)
  )
  on conflict do nothing;

  if provider_email is not null then
    insert into public.dd_event_outbox(event_key,event_type,channel,aggregate_type,aggregate_id,payload,status)
    values(
      'assignment:'||new.id||':provider:email','ASSIGNMENT_CONFIRMED_PROVIDER','EMAIL','JOB_ASSIGNMENT',new.id,
      jsonb_build_object('to',provider_email,'subject','DANI DECLARES — Job confirmed: '||j.public_reference,'text',provider_body),
      'PENDING'
    )
    on conflict(event_key) do nothing;
  end if;

  if provider_phone is not null then
    insert into public.dd_event_outbox(event_key,event_type,channel,aggregate_type,aggregate_id,payload,status)
    values(
      'assignment:'||new.id||':provider:sms','ASSIGNMENT_CONFIRMED_PROVIDER','SMS','JOB_ASSIGNMENT',new.id,
      jsonb_build_object('to',provider_phone,'text',provider_body),
      'PENDING'
    )
    on conflict(event_key) do nothing;
  end if;

  return new;
end;
$function$;

comment on function public.dd_emit_assignment_accepted_confirmations()
is 'Stages provider confirmation after assignment acceptance. Customer confirmation is appointment-authoritative and is not emitted here.';
