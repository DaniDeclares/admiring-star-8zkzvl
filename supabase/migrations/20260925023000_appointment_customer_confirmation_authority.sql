-- Tester-first appointment authority hardening.
-- Customer confirmation is owned by dd_job_appointments, not assignment acceptance.
-- This migration stages tester-only confirmation intents and adds a non-destructive pass-8 authority proof.

create table if not exists public.dd_appointment_customer_confirmation_intents(
 id uuid primary key default gen_random_uuid(),
 appointment_id uuid not null references public.dd_job_appointments(id) on delete cascade,
 job_id uuid not null references public.dd_jobs(id) on delete cascade,
 provider_id uuid not null references public.dd_providers(id) on delete restrict,
 intent_key text not null unique,
 appointment_status text not null,
 starts_at timestamptz not null,
 ends_at timestamptz not null,
 timezone text not null,
 delivery_state text not null default 'STAGED_TESTER_ONLY',
 payload jsonb not null default '{}'::jsonb,
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now()
);

alter table public.dd_appointment_customer_confirmation_intents enable row level security;
revoke all on public.dd_appointment_customer_confirmation_intents from anon,authenticated;
grant select,insert,update,delete on public.dd_appointment_customer_confirmation_intents to service_role;

create or replace function public.dd_stage_appointment_customer_confirmation_intent()
returns trigger language plpgsql security definer set search_path='public' as $$
declare v_key text;
begin
 if new.appointment_status not in ('SCHEDULED','CONFIRMED') then return new; end if;
 if tg_op='UPDATE' and old.appointment_status=new.appointment_status and old.starts_at=new.starts_at
    and old.ends_at=new.ends_at and old.provider_id=new.provider_id then return new; end if;
 v_key:='appointment:'||new.id::text||':customer-confirmation:'||
   md5(new.starts_at::text||'|'||new.ends_at::text||'|'||new.provider_id::text||'|'||new.appointment_status);
 insert into public.dd_appointment_customer_confirmation_intents(
   appointment_id,job_id,provider_id,intent_key,appointment_status,starts_at,ends_at,timezone,payload)
 values(new.id,new.job_id,new.provider_id,v_key,new.appointment_status,new.starts_at,new.ends_at,new.timezone,
   jsonb_build_object('authority','dd_job_appointments','appointment_id',new.id,'job_id',new.job_id,
     'provider_id',new.provider_id,'starts_at',new.starts_at,'ends_at',new.ends_at,'timezone',new.timezone,
     'external_delivery_authorized',false,'tester_only',true))
 on conflict(intent_key) do update set updated_at=now(),payload=excluded.payload;
 return new;
end $$;

revoke all on function public.dd_stage_appointment_customer_confirmation_intent() from public,anon,authenticated;
grant execute on function public.dd_stage_appointment_customer_confirmation_intent() to service_role;

drop trigger if exists dd_stage_appointment_customer_confirmation_intent on public.dd_job_appointments;
create trigger dd_stage_appointment_customer_confirmation_intent
after insert or update of appointment_status,starts_at,ends_at,provider_id on public.dd_job_appointments
for each row execute function public.dd_stage_appointment_customer_confirmation_intent();

create table if not exists public.dd_audit_subproof_requirements(
 proof_key text primary key,
 pass_number int not null check(pass_number between 1 and 10),
 lifecycle_stage text not null,
 required_for_authoritative_pass boolean not null default true,
 description text not null,
 executor_function text not null,
 status text not null default 'ACTIVE',
 metadata jsonb not null default '{}'::jsonb,
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now()
);

alter table public.dd_audit_subproof_requirements enable row level security;
revoke all on public.dd_audit_subproof_requirements from anon,authenticated;
grant select,insert,update,delete on public.dd_audit_subproof_requirements to service_role;

insert into public.dd_audit_subproof_requirements(proof_key,pass_number,lifecycle_stage,description,executor_function,metadata)
values('PASS8_ASSIGNMENT_APPOINTMENT_AUTHORITY',8,'FULFILLMENT',
 'Accepted assignment is unique per job; accepted assignment has an appointment; appointment provider matches accepted provider; customer confirmation intent originates from appointment authority; assignment authority does not emit customer confirmation.',
 'dd_prove_pass8_assignment_appointment_authority',
 jsonb_build_object('non_destructive',true,'external_side_effects',false,'scope','authority-subproof'))
on conflict(proof_key) do update set description=excluded.description,executor_function=excluded.executor_function,
 metadata=excluded.metadata,updated_at=now();

create or replace function public.dd_prove_pass8_assignment_appointment_authority()
returns uuid language plpgsql security definer set search_path='public' as $$
declare rid uuid:=gen_random_uuid(); total int:=0;passed int:=0;failed int:=0;
 v_dup int;v_missing int;v_mismatch int;v_appt_trigger int;v_assignment_customer_emit int;ev jsonb;
begin
 select count(*) into v_dup from (
   select job_id,count(*) c from dd_job_assignments where assignment_status='ACCEPTED'
   group by job_id having count(*)>1
 )x;
 total:=total+1;if v_dup=0 then passed:=passed+1;else failed:=failed+1;end if;

 select count(*) into v_missing from dd_job_assignments a
 where a.assignment_status='ACCEPTED'
   and not exists(select 1 from dd_job_appointments ap where ap.job_id=a.job_id);
 total:=total+1;if v_missing=0 then passed:=passed+1;else failed:=failed+1;end if;

 select count(*) into v_mismatch
 from dd_job_assignments a join dd_job_appointments ap on ap.job_id=a.job_id
 where a.assignment_status='ACCEPTED' and ap.appointment_status<>'CANCELLED' and a.provider_id<>ap.provider_id;
 total:=total+1;if v_mismatch=0 then passed:=passed+1;else failed:=failed+1;end if;

 select count(*) into v_appt_trigger
 from pg_trigger t join pg_class c on c.oid=t.tgrelid join pg_namespace n on n.oid=c.relnamespace
 where n.nspname='public' and c.relname='dd_job_appointments' and not t.tgisinternal
   and t.tgname='dd_stage_appointment_customer_confirmation_intent';
 total:=total+1;if v_appt_trigger=1 then passed:=passed+1;else failed:=failed+1;end if;

 select count(*) into v_assignment_customer_emit
 from pg_trigger t join pg_class c on c.oid=t.tgrelid join pg_namespace n on n.oid=c.relnamespace join pg_proc p on p.oid=t.tgfoid
 where n.nspname='public' and c.relname='dd_job_assignments' and not t.tgisinternal
   and pg_get_functiondef(p.oid) ilike '%ASSIGNMENT_CONFIRMED_CUSTOMER%';
 total:=total+1;if v_assignment_customer_emit=0 then passed:=passed+1;else failed:=failed+1;end if;

 ev:=jsonb_build_object('accepted_assignment_duplicates',v_dup,'accepted_without_appointment',v_missing,
   'provider_mismatch',v_mismatch,'appointment_intent_trigger_count',v_appt_trigger,
   'assignment_customer_emitters',v_assignment_customer_emit,'customer_confirmation_authority','dd_job_appointments',
   'external_delivery',false,'authoritative_pass_advanced',false);

 insert into public.dd_audit_proof_receipts(id,work_key,proof_key,status,assertions_total,assertions_passed,assertions_failed,evidence)
 values(rid,'PASS-08-AUTHORITY','PASS8_ASSIGNMENT_APPOINTMENT_AUTHORITY',
   case when failed=0 then 'PASS' else 'FAIL' end,total,passed,failed,ev);
 return rid;
end $$;

revoke all on function public.dd_prove_pass8_assignment_appointment_authority() from public,anon,authenticated;
grant execute on function public.dd_prove_pass8_assignment_appointment_authority() to service_role;
