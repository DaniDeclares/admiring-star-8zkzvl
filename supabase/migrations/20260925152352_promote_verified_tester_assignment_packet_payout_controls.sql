
create table if not exists public.dd_appointment_customer_confirmation_intents (
 id uuid primary key default gen_random_uuid(),
 appointment_id uuid not null references public.dd_job_appointments(id) on delete cascade,
 job_id uuid not null references public.dd_jobs(id) on delete cascade,
 provider_id uuid not null,
 intent_key text not null unique,
 appointment_status text not null,
 starts_at timestamptz not null,
 ends_at timestamptz not null,
 timezone text not null,
 delivery_state text not null default 'STAGED_INTERNAL',
 payload jsonb not null default '{}'::jsonb,
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now()
);
alter table public.dd_appointment_customer_confirmation_intents enable row level security;
revoke all on public.dd_appointment_customer_confirmation_intents from anon, authenticated;
grant all on public.dd_appointment_customer_confirmation_intents to service_role;

create table if not exists public.dd_job_packets (
 id uuid primary key default gen_random_uuid(),
 packet_key text not null unique,
 job_id uuid not null references public.dd_jobs(id) on delete cascade,
 assignment_id uuid not null references public.dd_job_assignments(id) on delete cascade,
 appointment_id uuid references public.dd_job_appointments(id) on delete set null,
 provider_id uuid not null,
 packet_status text not null default 'STAGED_INTERNAL',
 packet_version integer not null default 1,
 printable_title text not null,
 printable_body text not null,
 checklist jsonb not null default '[]'::jsonb,
 evidence_requirements jsonb not null default '[]'::jsonb,
 missing_requirements jsonb not null default '[]'::jsonb,
 packet_hash text not null,
 generated_at timestamptz not null default now(),
 updated_at timestamptz not null default now(),
 metadata jsonb not null default '{}'::jsonb
);
create unique index if not exists dd_job_packets_assignment_uidx on public.dd_job_packets(assignment_id);
alter table public.dd_job_packets enable row level security;
revoke all on public.dd_job_packets from anon, authenticated;
grant all on public.dd_job_packets to service_role;

create table if not exists public.dd_job_packet_worker_runs (
 id uuid primary key default gen_random_uuid(),
 started_at timestamptz not null default now(),
 completed_at timestamptz,
 status text not null default 'RUNNING',
 assignments_scanned integer not null default 0,
 packets_created integer not null default 0,
 packets_updated integer not null default 0,
 blocked_count integer not null default 0,
 evidence jsonb not null default '{}'::jsonb
);
alter table public.dd_job_packet_worker_runs enable row level security;
revoke all on public.dd_job_packet_worker_runs from anon, authenticated;
grant all on public.dd_job_packet_worker_runs to service_role;

create table if not exists public.dd_provider_payout_clearance_policy (
 policy_key text primary key,
 clearance_mode text not null,
 owner_approved boolean not null default false,
 external_payout_authorized boolean not null default false,
 rationale text,
 effective_from timestamptz,
 updated_at timestamptz not null default now()
);
alter table public.dd_provider_payout_clearance_policy enable row level security;
revoke all on public.dd_provider_payout_clearance_policy from anon, authenticated;
grant all on public.dd_provider_payout_clearance_policy to service_role;
insert into public.dd_provider_payout_clearance_policy(policy_key,clearance_mode,owner_approved,external_payout_authorized,rationale)
values('DEFAULT','UNRESOLVED',false,false,'Production-safe promotion: payout remains held until owner approves a canonical clearance policy.')
on conflict(policy_key) do nothing;

create or replace function public.dd_sync_appointment_from_accepted_assignment()
returns trigger language plpgsql security definer set search_path=public as $$
declare j public.dd_jobs; ap public.dd_job_appointments;
begin
 if upper(coalesce(new.assignment_status,''))<>'ACCEPTED' then return new; end if;
 if tg_op='UPDATE' and upper(coalesce(old.assignment_status,''))='ACCEPTED' and old.provider_id=new.provider_id then return new; end if;
 select * into j from public.dd_jobs where id=new.job_id;
 if j.id is null then raise exception 'JOB_NOT_FOUND_FOR_ACCEPTED_ASSIGNMENT'; end if;
 if j.scheduled_start is null or j.scheduled_end is null then raise exception 'APPOINTMENT_SCHEDULE_REQUIRED_BEFORE_ASSIGNMENT_ACCEPTANCE'; end if;
 select * into ap from public.dd_job_appointments where job_id=j.id and appointment_status<>'CANCELLED' order by created_at desc limit 1 for update;
 if ap.id is null then
   insert into public.dd_job_appointments(job_id,provider_id,starts_at,ends_at,timezone,appointment_status,internal_notes)
   values(j.id,new.provider_id,j.scheduled_start,j.scheduled_end,'America/New_York','SCHEDULED','Created automatically from canonical accepted assignment.');
 else
   update public.dd_job_appointments set provider_id=new.provider_id,starts_at=j.scheduled_start,ends_at=j.scheduled_end,
    appointment_status=case when ap.appointment_status='CONFIRMED' then 'CONFIRMED' else 'SCHEDULED' end,
    internal_notes=coalesce(ap.internal_notes,'')||case when coalesce(ap.internal_notes,'')='' then '' else E'\n' end||'Synchronized from canonical accepted assignment.',
    updated_at=now() where id=ap.id;
 end if;
 return new;
end $$;
revoke all on function public.dd_sync_appointment_from_accepted_assignment() from public, anon, authenticated;
grant execute on function public.dd_sync_appointment_from_accepted_assignment() to service_role;

drop trigger if exists dd_sync_appointment_from_accepted_assignment on public.dd_job_assignments;
create trigger dd_sync_appointment_from_accepted_assignment
after insert or update of assignment_status,provider_id on public.dd_job_assignments
for each row execute function public.dd_sync_appointment_from_accepted_assignment();

create or replace function public.dd_stage_appointment_customer_confirmation_intent()
returns trigger language plpgsql security definer set search_path=public as $$
declare v_key text;
begin
 if new.appointment_status not in ('SCHEDULED','CONFIRMED') then return new; end if;
 if tg_op='UPDATE' and old.appointment_status=new.appointment_status and old.starts_at=new.starts_at and old.ends_at=new.ends_at and old.provider_id=new.provider_id then return new; end if;
 v_key:='appointment:'||new.id::text||':customer-confirmation:'||md5(new.starts_at::text||'|'||new.ends_at::text||'|'||new.provider_id::text||'|'||new.appointment_status);
 insert into public.dd_appointment_customer_confirmation_intents(appointment_id,job_id,provider_id,intent_key,appointment_status,starts_at,ends_at,timezone,payload)
 values(new.id,new.job_id,new.provider_id,v_key,new.appointment_status,new.starts_at,new.ends_at,new.timezone,
 jsonb_build_object('authority','dd_job_appointments','appointment_id',new.id,'job_id',new.job_id,'provider_id',new.provider_id,
 'starts_at',new.starts_at,'ends_at',new.ends_at,'timezone',new.timezone,'external_delivery_authorized',false,'environment','PRODUCTION'))
 on conflict(intent_key) do update set updated_at=now(),payload=excluded.payload;
 return new;
end $$;
revoke all on function public.dd_stage_appointment_customer_confirmation_intent() from public, anon, authenticated;
grant execute on function public.dd_stage_appointment_customer_confirmation_intent() to service_role;

drop trigger if exists dd_stage_appointment_customer_confirmation_intent on public.dd_job_appointments;
create trigger dd_stage_appointment_customer_confirmation_intent
after insert or update of appointment_status,starts_at,ends_at,provider_id on public.dd_job_appointments
for each row execute function public.dd_stage_appointment_customer_confirmation_intent();

create or replace function public.dd_build_job_packet(p_assignment_id uuid)
returns uuid language plpgsql security definer set search_path=public as $$
declare a public.dd_job_assignments; j public.dd_jobs; ap public.dd_job_appointments; out_id uuid; pkey text; title text; body text;
 tasks jsonb; evreq jsonb; missing jsonb:='[]'::jsonb; phash text;
begin
 select * into a from public.dd_job_assignments where id=p_assignment_id;
 if a.id is null then raise exception 'ASSIGNMENT_NOT_FOUND'; end if;
 if upper(coalesce(a.assignment_status,''))<>'ACCEPTED' then raise exception 'ASSIGNMENT_NOT_ACCEPTED'; end if;
 select * into j from public.dd_jobs where id=a.job_id;
 if j.id is null then raise exception 'JOB_NOT_FOUND'; end if;
 select * into ap from public.dd_job_appointments where job_id=j.id and appointment_status<>'CANCELLED' order by created_at desc limit 1;
 if ap.id is null then missing:=missing||jsonb_build_array('APPOINTMENT_REQUIRED'); end if;
 select coalesce(jsonb_agg(jsonb_build_object('task_id',t.id,'task_name',t.task_name,'task_type',t.task_type,'status',t.status,'is_required',t.is_required,'evidence_required',t.evidence_required,'notes',t.notes,'sort_order',t.sort_order) order by t.sort_order,t.task_name),'[]'::jsonb)
 into tasks from public.dd_job_tasks t where t.job_id=j.id;
 if jsonb_array_length(tasks)=0 then missing:=missing||jsonb_build_array('TASK_TEMPLATE_MISSING'); end if;
 select coalesce(jsonb_agg(jsonb_build_object('task_id',t.id,'task_name',t.task_name,'evidence_required',true,'evidence_instruction',coalesce(t.evidence_ref,'PHOTO_OR_REQUIRED_EVIDENCE'),'current_evidence_count',(select count(*) from public.dd_job_evidence e where e.job_id=t.job_id and e.task_id=t.id)) order by t.sort_order,t.task_name),'[]'::jsonb)
 into evreq from public.dd_job_tasks t where t.job_id=j.id and t.evidence_required=true;
 pkey:='job-packet:'||j.id::text||':'||a.id::text;
 title:='DANI DECLARES Job Packet — '||coalesce(j.public_reference,j.id::text);
 body:='JOB: '||coalesce(j.public_reference,j.id::text)||E'\n'||'TITLE: '||coalesce(j.job_title,'')||E'\n'||'SCHEDULE: '||
 coalesce(ap.starts_at::text,j.scheduled_start::text,'NOT SET')||' to '||coalesce(ap.ends_at::text,j.scheduled_end::text,'NOT SET')||E'\n'||
 'LOCATION: '||coalesce(j.location_address,'')||E'\n'||'SCOPE: '||coalesce(j.scope_summary,'')||E'\n\n'||
 'REQUIRED CHECKLIST AND EVIDENCE ARE CANONICAL IN THE PROVIDER PORTAL. Complete each required task and capture all evidence marked required before submission.';
 phash:=md5(coalesce(title,'')||coalesce(body,'')||tasks::text||evreq::text||missing::text);
 insert into public.dd_job_packets(packet_key,job_id,assignment_id,appointment_id,provider_id,packet_status,printable_title,printable_body,checklist,evidence_requirements,missing_requirements,packet_hash,metadata)
 values(pkey,j.id,a.id,ap.id,a.provider_id,case when jsonb_array_length(missing)=0 then 'READY_TO_RENDER' else 'BLOCKED' end,title,body,tasks,evreq,missing,phash,
 jsonb_build_object('worker','JOB_PACKET_WORKER','printable',true,'external_delivery_authorized',false,'environment','PRODUCTION','source_authority',jsonb_build_array('dd_jobs','dd_job_assignments','dd_job_appointments','dd_job_tasks')))
 on conflict(packet_key) do update set appointment_id=excluded.appointment_id,provider_id=excluded.provider_id,packet_status=excluded.packet_status,
 printable_title=excluded.printable_title,printable_body=excluded.printable_body,checklist=excluded.checklist,evidence_requirements=excluded.evidence_requirements,
 missing_requirements=excluded.missing_requirements,packet_hash=excluded.packet_hash,updated_at=now(),metadata=excluded.metadata returning id into out_id;
 return out_id;
end $$;
revoke all on function public.dd_build_job_packet(uuid) from public, anon, authenticated;
grant execute on function public.dd_build_job_packet(uuid) to service_role;

create or replace function public.dd_run_job_packet_worker()
returns uuid language plpgsql security definer set search_path=public as $$
declare rid uuid:=gen_random_uuid(); r record; packet_id uuid; v_scanned int:=0; v_created int:=0; v_updated int:=0; v_blocked int:=0; v_existed boolean;
begin
 insert into public.dd_job_packet_worker_runs(id) values(rid);
 for r in select a.id from public.dd_job_assignments a where upper(coalesce(a.assignment_status,''))='ACCEPTED' loop
   v_scanned:=v_scanned+1;
   select exists(select 1 from public.dd_job_packets p where p.assignment_id=r.id) into v_existed;
   begin
     select public.dd_build_job_packet(r.id) into packet_id;
     if v_existed then v_updated:=v_updated+1; else v_created:=v_created+1; end if;
     if exists(select 1 from public.dd_job_packets p where p.id=packet_id and p.packet_status='BLOCKED') then v_blocked:=v_blocked+1; end if;
   exception when others then v_blocked:=v_blocked+1;
   end;
 end loop;
 update public.dd_job_packet_worker_runs set completed_at=now(),status='COMPLETED',assignments_scanned=v_scanned,packets_created=v_created,
 packets_updated=v_updated,blocked_count=v_blocked,evidence=jsonb_build_object('external_delivery',false,'environment','PRODUCTION') where id=rid;
 return rid;
end $$;
revoke all on function public.dd_run_job_packet_worker() from public, anon, authenticated;
grant execute on function public.dd_run_job_packet_worker() to service_role;

create or replace function public.dd_evaluate_provider_payout_clearance(p_assignment_id uuid)
returns jsonb language plpgsql security definer set search_path=public as $$
declare a public.dd_job_assignments%rowtype; j public.dd_jobs%rowtype; ap public.dd_accounts_payable_ledger%rowtype; pol public.dd_provider_payout_clearance_policy%rowtype; qa_ok boolean:=false; blockers jsonb:='[]'::jsonb;
begin
 select * into a from public.dd_job_assignments where id=p_assignment_id;
 if a.id is null then return jsonb_build_object('eligible',false,'blockers',jsonb_build_array('ASSIGNMENT_NOT_FOUND'),'externalPayoutAuthorized',false); end if;
 select * into j from public.dd_jobs where id=a.job_id;
 select * into ap from public.dd_accounts_payable_ledger where assignment_id=a.id;
 select * into pol from public.dd_provider_payout_clearance_policy where policy_key='DEFAULT';
 qa_ok:=exists(select 1 from public.dd_completion_reviews where job_id=a.job_id and upper(coalesce(status,''))='APPROVED');
 if upper(coalesce(a.assignment_status,''))<>'ACCEPTED' then blockers:=blockers||jsonb_build_array('ASSIGNMENT_NOT_ACCEPTED'); end if;
 if j.id is null then blockers:=blockers||jsonb_build_array('JOB_NOT_FOUND'); end if;
 if ap.id is null then blockers:=blockers||jsonb_build_array('PAYABLE_NOT_ACCRUED'); end if;
 if not qa_ok then blockers:=blockers||jsonb_build_array('QA_APPROVAL_REQUIRED'); end if;
 if pol.policy_key is null or not pol.owner_approved or pol.clearance_mode='UNRESOLVED' then blockers:=blockers||jsonb_build_array('POLICY_UNRESOLVED'); end if;
 if coalesce(pol.external_payout_authorized,false) then blockers:=blockers||jsonb_build_array('EXTERNAL_PAYOUT_AUTHORITY_UNEXPECTED'); end if;
 if pol.clearance_mode='COLLECTION_REQUIRED' then blockers:=blockers||jsonb_build_array('CANONICAL_CUSTOMER_COLLECTION_GATE_NOT_YET_PROVEN'); end if;
 return jsonb_build_object('eligible',jsonb_array_length(blockers)=0,'assignmentId',a.id,'jobId',a.job_id,'workOrderId',j.work_order_id,'payableId',ap.id,
 'qaApproved',qa_ok,'policyMode',coalesce(pol.clearance_mode,'UNRESOLVED'),'ownerApprovedPolicy',coalesce(pol.owner_approved,false),
 'externalPayoutAuthorized',coalesce(pol.external_payout_authorized,false),'blockers',blockers);
end $$;
revoke all on function public.dd_evaluate_provider_payout_clearance(uuid) from public, anon, authenticated;
grant execute on function public.dd_evaluate_provider_payout_clearance(uuid) to service_role;
