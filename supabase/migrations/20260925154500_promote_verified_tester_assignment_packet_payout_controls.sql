-- DANI DECLARES production reconciliation
-- Promotes verified tester operational controls without replacing production authority.
-- Live production migration history:
--   promote_verified_tester_assignment_packet_payout_controls
--   adapt_promoted_payout_clearance_to_production_ap_authority
--
-- Production-specific decisions:
-- 1. Customer confirmation is staged internally; no external delivery is authorized here.
-- 2. Provider payout remains subordinate to the existing production AP ledger keyed by work_order_id.
-- 3. No synthetic tester rows are promoted.
-- 4. Internal SECURITY DEFINER functions are not executable by anon/authenticated.

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
 id uuid primary key default gen_random_uuid(), started_at timestamptz not null default now(), completed_at timestamptz,
 status text not null default 'RUNNING', assignments_scanned integer not null default 0, packets_created integer not null default 0,
 packets_updated integer not null default 0, blocked_count integer not null default 0, evidence jsonb not null default '{}'::jsonb
);
alter table public.dd_job_packet_worker_runs enable row level security;
revoke all on public.dd_job_packet_worker_runs from anon, authenticated;
grant all on public.dd_job_packet_worker_runs to service_role;

create table if not exists public.dd_provider_payout_clearance_policy (
 policy_key text primary key, clearance_mode text not null, owner_approved boolean not null default false,
 external_payout_authorized boolean not null default false, rationale text, effective_from timestamptz, updated_at timestamptz not null default now()
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
   appointment_status=case when ap.appointment_status='CONFIRMED' then 'CONFIRMED' else 'SCHEDULED' end,updated_at=now() where id=ap.id;
 end if;
 return new;
end $$;
revoke all on function public.dd_sync_appointment_from_accepted_assignment() from public,anon,authenticated;
grant execute on function public.dd_sync_appointment_from_accepted_assignment() to service_role;
drop trigger if exists dd_sync_appointment_from_accepted_assignment on public.dd_job_assignments;
create trigger dd_sync_appointment_from_accepted_assignment after insert or update of assignment_status,provider_id on public.dd_job_assignments
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
 jsonb_build_object('authority','dd_job_appointments','external_delivery_authorized',false,'environment','PRODUCTION'))
 on conflict(intent_key) do update set updated_at=now(),payload=excluded.payload;
 return new;
end $$;
revoke all on function public.dd_stage_appointment_customer_confirmation_intent() from public,anon,authenticated;
grant execute on function public.dd_stage_appointment_customer_confirmation_intent() to service_role;
drop trigger if exists dd_stage_appointment_customer_confirmation_intent on public.dd_job_appointments;
create trigger dd_stage_appointment_customer_confirmation_intent after insert or update of appointment_status,starts_at,ends_at,provider_id
on public.dd_job_appointments for each row execute function public.dd_stage_appointment_customer_confirmation_intent();

-- Payout evaluator is intentionally adapted to production's stronger AP authority:
-- dd_accounts_payable_ledger is keyed by work_order_id + provider_id, not tester assignment_id.
create or replace function public.dd_evaluate_provider_payout_clearance(p_assignment_id uuid)
returns jsonb language plpgsql security definer set search_path=public as $$
declare a public.dd_job_assignments%rowtype; j public.dd_jobs%rowtype; ap public.dd_accounts_payable_ledger%rowtype;
 pol public.dd_provider_payout_clearance_policy%rowtype; qa_ok boolean:=false; blockers jsonb:='[]'::jsonb;
begin
 select * into a from public.dd_job_assignments where id=p_assignment_id;
 if a.id is null then return jsonb_build_object('eligible',false,'blockers',jsonb_build_array('ASSIGNMENT_NOT_FOUND'),'externalPayoutAuthorized',false); end if;
 select * into j from public.dd_jobs where id=a.job_id;
 if j.id is not null and j.work_order_id is not null then
  select * into ap from public.dd_accounts_payable_ledger where work_order_id=j.work_order_id and provider_id=a.provider_id order by accrued_at desc limit 1;
 end if;
 select * into pol from public.dd_provider_payout_clearance_policy where policy_key='DEFAULT';
 qa_ok:=exists(select 1 from public.dd_completion_reviews where job_id=a.job_id and upper(coalesce(status,''))='APPROVED');
 if ap.id is null then blockers:=blockers||jsonb_build_array('CANONICAL_AP_NOT_ACCRUED'); end if;
 if not qa_ok then blockers:=blockers||jsonb_build_array('QA_APPROVAL_REQUIRED'); end if;
 if ap.id is not null and not coalesce(ap.is_cleared_for_payout,false) then blockers:=blockers||jsonb_build_array('CANONICAL_AP_NOT_CLEARED'); end if;
 if pol.policy_key is null or not pol.owner_approved or pol.clearance_mode='UNRESOLVED' then blockers:=blockers||jsonb_build_array('POLICY_UNRESOLVED'); end if;
 return jsonb_build_object('eligible',jsonb_array_length(blockers)=0,'assignmentId',a.id,'jobId',a.job_id,'workOrderId',j.work_order_id,
 'payableId',ap.id,'canonicalApCleared',coalesce(ap.is_cleared_for_payout,false),'qaApproved',qa_ok,'externalPayoutAuthorized',false,'blockers',blockers);
end $$;
revoke all on function public.dd_evaluate_provider_payout_clearance(uuid) from public,anon,authenticated;
grant execute on function public.dd_evaluate_provider_payout_clearance(uuid) to service_role;

-- Job-packet functions are installed in production by the paired live migration.
-- Their authority is limited to canonical dd_jobs/dd_job_assignments/dd_job_appointments/dd_job_tasks,
-- with external_delivery_authorized=false. The production verification deliberately leaves a packet
-- BLOCKED when canonical tasks are absent rather than inventing fulfillment scope.
