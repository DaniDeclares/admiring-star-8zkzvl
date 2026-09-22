-- Phase 1 launch fulfillment cohort: Danielle + Chris + Cayla.
-- This is a release-work boundary, not a replacement for provider capabilities.
create table if not exists public.dd_launch_fulfillment_cohort (
 id uuid primary key default gen_random_uuid(), cohort_code text not null,
 subject_type text not null check(subject_type in('OWNER','PROVIDER')),
 provider_id uuid references public.dd_providers(id) on delete cascade,
 service_id uuid not null references public.services(id) on delete cascade,
 capability_key text not null, fulfillment_mode text not null check(fulfillment_mode in('SOLO','SHARED','JOINT_COMPONENT')),
 evidence_status text not null check(evidence_status in('OWNER_CONFIRMED','SYSTEM_VERIFIED','DOCUMENT_EVIDENCE','EXTERNAL_VERIFIED')),
 evidence_note text, activation_state text not null default 'GREEN_WORK_QUEUE' check(activation_state in('GREEN_WORK_QUEUE','LIVE_READY','BLOCKED','PAUSED')),
 created_at timestamptz not null default now(),updated_at timestamptz not null default now(),
 constraint dd_launch_cohort_subject_chk check((subject_type='OWNER' and provider_id is null) or(subject_type='PROVIDER' and provider_id is not null))
);
create unique index if not exists dd_launch_cohort_route_uq
on public.dd_launch_fulfillment_cohort(cohort_code,subject_type,coalesce(provider_id,'00000000-0000-0000-0000-000000000000'::uuid),service_id,capability_key);
alter table public.dd_launch_fulfillment_cohort enable row level security;
revoke all on public.dd_launch_fulfillment_cohort from anon,authenticated;
grant select,insert,update,delete on public.dd_launch_fulfillment_cohort to service_role;

insert into public.dd_launch_fulfillment_cohort(cohort_code,subject_type,provider_id,service_id,capability_key,fulfillment_mode,evidence_status,evidence_note)
select 'PHASE1_2026Q3','OWNER',null,s.id,'CLEANING','SHARED','OWNER_CONFIRMED','Danielle: owner-confirmed direct cleaning launch capability.' from public.services s
where s.sku in ('DNI-01A-001','DNI-01A-002','DNI-01A-003','DNI-01A-009','DNI-01A-010','DNI-01A-020','DNI-01A-021','DNI-01A-022','DNI-01A-023','DNI-01A-024','DNI-01A-025','DNI-01A-027','DNI-01A-029','DNI-01A-033','DNI-01A-037','DNI-01A-038','DNI-01A-041','DNI-01A-042','DNI-02A-001','DNI-02A-002','DNI-02A-005','DNI-02A-009','DNI-02A-010','DNI-02A-011','DNI-02A-012') on conflict do nothing;
insert into public.dd_launch_fulfillment_cohort(cohort_code,subject_type,provider_id,service_id,capability_key,fulfillment_mode,evidence_status,evidence_note)
select 'PHASE1_2026Q3','OWNER',null,s.id,'DTF_APPAREL_PRODUCTION','SHARED','OWNER_CONFIRMED','Danielle: owner-confirmed DTF/heat-press production capability.' from public.services s where s.sku in ('DNI-11A-017','DNI-11A-018') on conflict do nothing;
insert into public.dd_launch_fulfillment_cohort(cohort_code,subject_type,provider_id,service_id,capability_key,fulfillment_mode,evidence_status,evidence_note)
select 'PHASE1_2026Q3','PROVIDER','12642521-3ba1-47da-9ea5-526165822a79',s.id,case when s.sku like 'DNI-06A-%' then 'COMPUTER_TECHNICAL_SUPPORT' else 'DTF_APPAREL_PRODUCTION' end,case when s.sku like 'DNI-11A-%' then 'SHARED' else 'SOLO' end,'SYSTEM_VERIFIED','Chris: existing authorized capability included in owner-approved Phase 1.' from public.services s where s.sku in ('DNI-06A-016','DNI-06A-017','DNI-11A-017','DNI-11A-018') on conflict do nothing;
insert into public.dd_launch_fulfillment_cohort(cohort_code,subject_type,provider_id,service_id,capability_key,fulfillment_mode,evidence_status,evidence_note)
select 'PHASE1_2026Q3','PROVIDER','12642521-3ba1-47da-9ea5-526165822a79',s.id,'COMPUTER_TECHNICAL_SUPPORT','SOLO','OWNER_CONFIRMED','Chris: Printer/Scanner Setup confirmed by owner and matched to the existing production provider authorization.' from public.services s where s.sku='DNI-06A-018' on conflict do nothing;
insert into public.dd_launch_fulfillment_cohort(cohort_code,subject_type,provider_id,service_id,capability_key,fulfillment_mode,evidence_status,evidence_note)
select 'PHASE1_2026Q3','PROVIDER','96b78147-c991-43d2-a3fe-4d9dc49fd90d',s.id,'CLEANING','SHARED','OWNER_CONFIRMED','Cayla: owner-confirmed cleaning capability, constrained to direct cleaning SKUs for Phase 1.' from public.services s where s.sku in ('DNI-01A-001','DNI-01A-002','DNI-01A-003','DNI-01A-009','DNI-01A-010','DNI-01A-020','DNI-01A-021','DNI-01A-022','DNI-01A-023','DNI-01A-024','DNI-01A-025','DNI-01A-027','DNI-01A-029','DNI-01A-033','DNI-01A-037','DNI-01A-038','DNI-01A-041','DNI-01A-042','DNI-02A-001','DNI-02A-002','DNI-02A-005','DNI-02A-009','DNI-02A-010','DNI-02A-011','DNI-02A-012') on conflict do nothing;
insert into public.dd_launch_fulfillment_cohort(cohort_code,subject_type,provider_id,service_id,capability_key,fulfillment_mode,evidence_status,evidence_note)
select 'PHASE1_2026Q3','PROVIDER','96b78147-c991-43d2-a3fe-4d9dc49fd90d',s.id,'PLANT_CARE','SOLO','OWNER_CONFIRMED','Cayla: owner-confirmed plant-care capability.' from public.services s where s.sku in ('DNI-01C-001','DNI-01C-002','DNI-01C-003','DNI-01C-004','DNI-01C-005','DNI-01C-006') on conflict do nothing;
update public.dd_launch_fulfillment_cohort c set activation_state=case when r.release_state='LIVE_READY' then 'LIVE_READY' else 'GREEN_WORK_QUEUE' end,updated_at=now() from public.dd_service_release_contract_v1 r where r.runtime_service_id=c.service_id and c.cohort_code='PHASE1_2026Q3';
