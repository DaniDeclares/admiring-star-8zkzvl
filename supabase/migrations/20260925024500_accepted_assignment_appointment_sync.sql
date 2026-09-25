-- Canonical accepted assignment -> appointment synchronization.
-- Guarantees one active appointment per job and creates/updates it from the accepted assignment.
-- Customer communication is still not sent here; the appointment layer stages tester-only confirmation intent.

create unique index if not exists dd_job_appointments_one_active_per_job
on public.dd_job_appointments(job_id)
where appointment_status<>'CANCELLED';

create or replace function public.dd_sync_appointment_from_accepted_assignment()
returns trigger
language plpgsql
security definer
set search_path='public'
as $$
declare
  j public.dd_jobs;
  ap public.dd_job_appointments;
begin
  if upper(coalesce(new.assignment_status,''))<>'ACCEPTED' then
    return new;
  end if;

  if tg_op='UPDATE'
     and upper(coalesce(old.assignment_status,''))='ACCEPTED'
     and old.provider_id=new.provider_id then
    return new;
  end if;

  select * into j
  from public.dd_jobs
  where id=new.job_id;

  if j.id is null then
    raise exception 'JOB_NOT_FOUND_FOR_ACCEPTED_ASSIGNMENT';
  end if;

  if j.scheduled_start is null or j.scheduled_end is null then
    raise exception 'APPOINTMENT_SCHEDULE_REQUIRED_BEFORE_ASSIGNMENT_ACCEPTANCE';
  end if;

  select * into ap
  from public.dd_job_appointments
  where job_id=j.id
    and appointment_status<>'CANCELLED'
  order by created_at desc
  limit 1
  for update;

  if ap.id is null then
    insert into public.dd_job_appointments(
      job_id,provider_id,starts_at,ends_at,timezone,appointment_status,internal_notes
    )
    values(
      j.id,new.provider_id,j.scheduled_start,j.scheduled_end,
      'America/New_York','SCHEDULED',
      'Created automatically from canonical accepted assignment.'
    );
  else
    update public.dd_job_appointments
       set provider_id=new.provider_id,
           starts_at=j.scheduled_start,
           ends_at=j.scheduled_end,
           appointment_status=case when ap.appointment_status='CONFIRMED' then 'CONFIRMED' else 'SCHEDULED' end,
           internal_notes=coalesce(ap.internal_notes,'')||
             case when coalesce(ap.internal_notes,'')='' then '' else E'\n' end||
             'Synchronized from canonical accepted assignment.',
           updated_at=now()
     where id=ap.id;
  end if;

  return new;
end $$;

revoke all on function public.dd_sync_appointment_from_accepted_assignment() from public,anon,authenticated;
grant execute on function public.dd_sync_appointment_from_accepted_assignment() to service_role;

drop trigger if exists dd_sync_appointment_from_accepted_assignment on public.dd_job_assignments;
create trigger dd_sync_appointment_from_accepted_assignment
after insert or update of assignment_status,provider_id on public.dd_job_assignments
for each row execute function public.dd_sync_appointment_from_accepted_assignment();

create or replace function public.dd_prove_pass8_assignment_appointment_authority()
returns uuid
language plpgsql
security definer
set search_path='public'
as $$
declare
  rid uuid:=gen_random_uuid();
  total int:=0;
  passed int:=0;
  failed int:=0;
  v_dup int;
  v_missing int;
  v_mismatch int;
  v_appt_trigger int;
  v_assignment_customer_emit int;
  v_sync_trigger int;
  v_active_dup int;
  ev jsonb;
begin
  select count(*) into v_dup
  from (
    select job_id,count(*) c
    from public.dd_job_assignments
    where assignment_status='ACCEPTED'
    group by job_id
    having count(*)>1
  ) x;
  total:=total+1;
  if v_dup=0 then passed:=passed+1; else failed:=failed+1; end if;

  select count(*) into v_missing
  from public.dd_job_assignments a
  where a.assignment_status='ACCEPTED'
    and not exists(
      select 1
      from public.dd_job_appointments ap
      where ap.job_id=a.job_id
        and ap.appointment_status<>'CANCELLED'
    );
  total:=total+1;
  if v_missing=0 then passed:=passed+1; else failed:=failed+1; end if;

  select count(*) into v_mismatch
  from public.dd_job_assignments a
  join public.dd_job_appointments ap on ap.job_id=a.job_id
  where a.assignment_status='ACCEPTED'
    and ap.appointment_status<>'CANCELLED'
    and a.provider_id<>ap.provider_id;
  total:=total+1;
  if v_mismatch=0 then passed:=passed+1; else failed:=failed+1; end if;

  select count(*) into v_active_dup
  from (
    select job_id,count(*) c
    from public.dd_job_appointments
    where appointment_status<>'CANCELLED'
    group by job_id
    having count(*)>1
  ) x;
  total:=total+1;
  if v_active_dup=0 then passed:=passed+1; else failed:=failed+1; end if;

  select count(*) into v_sync_trigger
  from pg_trigger t
  join pg_class c on c.oid=t.tgrelid
  join pg_namespace n on n.oid=c.relnamespace
  where n.nspname='public'
    and c.relname='dd_job_assignments'
    and not t.tgisinternal
    and t.tgname='dd_sync_appointment_from_accepted_assignment';
  total:=total+1;
  if v_sync_trigger=1 then passed:=passed+1; else failed:=failed+1; end if;

  select count(*) into v_appt_trigger
  from pg_trigger t
  join pg_class c on c.oid=t.tgrelid
  join pg_namespace n on n.oid=c.relnamespace
  where n.nspname='public'
    and c.relname='dd_job_appointments'
    and not t.tgisinternal
    and t.tgname='dd_stage_appointment_customer_confirmation_intent';
  total:=total+1;
  if v_appt_trigger=1 then passed:=passed+1; else failed:=failed+1; end if;

  select count(*) into v_assignment_customer_emit
  from pg_trigger t
  join pg_class c on c.oid=t.tgrelid
  join pg_namespace n on n.oid=c.relnamespace
  join pg_proc p on p.oid=t.tgfoid
  where n.nspname='public'
    and c.relname='dd_job_assignments'
    and not t.tgisinternal
    and pg_get_functiondef(p.oid) ilike '%ASSIGNMENT_CONFIRMED_CUSTOMER%';
  total:=total+1;
  if v_assignment_customer_emit=0 then passed:=passed+1; else failed:=failed+1; end if;

  ev:=jsonb_build_object(
    'accepted_assignment_duplicates',v_dup,
    'accepted_without_active_appointment',v_missing,
    'provider_mismatch',v_mismatch,
    'duplicate_active_appointments',v_active_dup,
    'assignment_to_appointment_sync_trigger_count',v_sync_trigger,
    'appointment_intent_trigger_count',v_appt_trigger,
    'assignment_customer_emitters',v_assignment_customer_emit,
    'customer_confirmation_authority','dd_job_appointments',
    'external_delivery',false,
    'authoritative_pass_advanced',false
  );

  insert into public.dd_audit_proof_receipts(
    id,work_key,proof_key,status,assertions_total,assertions_passed,assertions_failed,evidence
  )
  values(
    rid,'PASS-08-AUTHORITY','PASS8_ASSIGNMENT_APPOINTMENT_AUTHORITY',
    case when failed=0 then 'PASS' else 'FAIL' end,
    total,passed,failed,ev
  );

  return rid;
end $$;
