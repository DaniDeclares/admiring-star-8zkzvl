-- Real income opportunity constraints v1.
-- Reuse-first extension: no new queue, worker, agent, CRM, scheduler, or commercial authority.
--
-- Existing authority reused:
--   dd_demand_capture_staging = mined opportunity staging / route gate
--   dd_sales_queue = canonical DANI buyer/opportunity intake after governed promotion
--   dd_owner_attention_queue + governor = owner decision/economics/cash ranking
--   existing provider/service authorization = provider routing authority
--
-- This migration records Danielle's personal-work constraints on the existing staging row
-- and deterministically gates DANIELLE_AS_CONTRACTOR opportunities. DANI_AS_VENDOR and
-- PROVIDER_ROUTED remain governed by their existing commercial/fulfillment paths.

alter table public.dd_demand_capture_staging
  add column if not exists work_arrangement text,
  add column if not exists asynchronous_state text not null default 'UNKNOWN',
  add column if not exists phone_burden text not null default 'UNKNOWN',
  add column if not exists meeting_burden text not null default 'UNKNOWN',
  add column if not exists schedule_flexibility text not null default 'UNKNOWN',
  add column if not exists travel_requirement text not null default 'UNKNOWN',
  add column if not exists owner_work_fit text not null default 'NOT_APPLICABLE',
  add column if not exists owner_work_fit_reasons jsonb not null default '[]'::jsonb;

do $$ begin
  if not exists (select 1 from pg_constraint where conname='dd_demand_capture_work_arrangement_check') then
    alter table public.dd_demand_capture_staging add constraint dd_demand_capture_work_arrangement_check
      check (work_arrangement is null or work_arrangement in ('REMOTE','HYBRID','ONSITE','UNKNOWN'));
  end if;
  if not exists (select 1 from pg_constraint where conname='dd_demand_capture_async_state_check') then
    alter table public.dd_demand_capture_staging add constraint dd_demand_capture_async_state_check
      check (asynchronous_state in ('ASYNC','PRIMARILY_ASYNC','MIXED','SYNCHRONOUS','UNKNOWN'));
  end if;
  if not exists (select 1 from pg_constraint where conname='dd_demand_capture_phone_burden_check') then
    alter table public.dd_demand_capture_staging add constraint dd_demand_capture_phone_burden_check
      check (phone_burden in ('NONE','LOW','OCCASIONAL','HIGH','UNKNOWN'));
  end if;
  if not exists (select 1 from pg_constraint where conname='dd_demand_capture_meeting_burden_check') then
    alter table public.dd_demand_capture_staging add constraint dd_demand_capture_meeting_burden_check
      check (meeting_burden in ('NONE','LOW','OCCASIONAL','HIGH','UNKNOWN'));
  end if;
  if not exists (select 1 from pg_constraint where conname='dd_demand_capture_schedule_flex_check') then
    alter table public.dd_demand_capture_staging add constraint dd_demand_capture_schedule_flex_check
      check (schedule_flexibility in ('FLEXIBLE','DELIVERABLE_ORIENTED','PARTIALLY_FIXED','FIXED_PRESENCE','UNKNOWN'));
  end if;
  if not exists (select 1 from pg_constraint where conname='dd_demand_capture_travel_requirement_check') then
    alter table public.dd_demand_capture_staging add constraint dd_demand_capture_travel_requirement_check
      check (travel_requirement in ('NONE','OPTIONAL','OCCASIONAL','REQUIRED','DRIVING_REQUIRED','FIELD_REQUIRED','UNKNOWN'));
  end if;
  if not exists (select 1 from pg_constraint where conname='dd_demand_capture_owner_work_fit_check') then
    alter table public.dd_demand_capture_staging add constraint dd_demand_capture_owner_work_fit_check
      check (owner_work_fit in ('NOT_APPLICABLE','ELIGIBLE','NEEDS_EVIDENCE','REJECTED'));
  end if;
end $$;

comment on column public.dd_demand_capture_staging.owner_work_fit is
  'Fit for Danielle personal work only. Remote is mandatory. Primarily asynchronous, low phone/meeting burden, flexible/deliverable-oriented schedule, and no required driving/field/travel are preferred/required as encoded by the evaluator. Does not govern DANI vendor/provider fulfillment.';

create or replace function private.dd_evaluate_owner_personal_work_fit(
  p_route text,
  p_work_arrangement text,
  p_async text,
  p_phone text,
  p_meeting text,
  p_flex text,
  p_travel text
) returns jsonb
language plpgsql immutable set search_path = '' as $$
declare
  reasons text[] := '{}';
  missing text[] := '{}';
  fit text := 'NOT_APPLICABLE';
begin
  if p_route <> 'DANIELLE_AS_CONTRACTOR' then
    return jsonb_build_object('fit','NOT_APPLICABLE','reasons','[]'::jsonb,'missing','[]'::jsonb);
  end if;

  if coalesce(p_work_arrangement,'UNKNOWN') = 'UNKNOWN' then missing := missing || 'WORK_ARRANGEMENT';
  elsif p_work_arrangement <> 'REMOTE' then reasons := reasons || 'REMOTE_REQUIRED'; end if;

  if coalesce(p_async,'UNKNOWN') = 'UNKNOWN' then missing := missing || 'ASYNC_BURDEN';
  elsif p_async in ('SYNCHRONOUS') then reasons := reasons || 'SYNCHRONOUS_WORK'; end if;

  if coalesce(p_phone,'UNKNOWN') = 'UNKNOWN' then missing := missing || 'PHONE_BURDEN';
  elsif p_phone = 'HIGH' then reasons := reasons || 'PHONE_HEAVY'; end if;

  if coalesce(p_meeting,'UNKNOWN') = 'UNKNOWN' then missing := missing || 'MEETING_BURDEN';
  elsif p_meeting = 'HIGH' then reasons := reasons || 'MEETING_HEAVY'; end if;

  if coalesce(p_flex,'UNKNOWN') = 'UNKNOWN' then missing := missing || 'SCHEDULE_FLEXIBILITY';
  elsif p_flex = 'FIXED_PRESENCE' then reasons := reasons || 'FIXED_PRESENCE_REQUIRED'; end if;

  if coalesce(p_travel,'UNKNOWN') = 'UNKNOWN' then missing := missing || 'TRAVEL_REQUIREMENT';
  elsif p_travel in ('REQUIRED','DRIVING_REQUIRED','FIELD_REQUIRED') then reasons := reasons || 'TRAVEL_OR_FIELD_REQUIRED'; end if;

  if cardinality(reasons) > 0 then fit := 'REJECTED';
  elsif cardinality(missing) > 0 then fit := 'NEEDS_EVIDENCE';
  else fit := 'ELIGIBLE'; end if;

  return jsonb_build_object('fit',fit,'reasons',to_jsonb(reasons),'missing',to_jsonb(missing));
end $$;

revoke all on function private.dd_evaluate_owner_personal_work_fit(text,text,text,text,text,text,text) from public,anon,authenticated;
grant execute on function private.dd_evaluate_owner_personal_work_fit(text,text,text,text,text,text,text) to service_role;

create or replace function private.dd_gate_owner_personal_work_constraints()
returns trigger language plpgsql security definer set search_path = '' as $$
declare v jsonb;
begin
  v := private.dd_evaluate_owner_personal_work_fit(
    new.opportunity_route,new.work_arrangement,new.asynchronous_state,new.phone_burden,
    new.meeting_burden,new.schedule_flexibility,new.travel_requirement);
  new.owner_work_fit := v->>'fit';
  new.owner_work_fit_reasons := jsonb_build_object('reasons',v->'reasons','missing',v->'missing');

  if new.opportunity_route='DANIELLE_AS_CONTRACTOR' then
    new.owner_attention_required := true;
    if new.owner_work_fit='REJECTED' then
      new.promotion_status := 'NOT_DELIVERABLE';
      new.attention_reason := 'Personal-work opportunity rejected by owner work constraints: ' || coalesce((v->'reasons')::text,'[]');
    elsif new.owner_work_fit='NEEDS_EVIDENCE' then
      new.promotion_status := 'NEEDS_CLASSIFICATION';
      new.attention_reason := 'Personal-work opportunity needs work-mode evidence before owner review: ' || coalesce((v->'missing')::text,'[]');
    elsif new.owner_work_fit='ELIGIBLE' and new.promotion_status in ('READY','RAW','NEEDS_CLASSIFICATION') then
      new.promotion_status := 'OWNER_DECISION';
      new.attention_reason := 'Personal-work opportunity satisfies recorded work-mode constraints; owner decides whether to apply.';
    end if;
  end if;
  return new;
end $$;

revoke all on function private.dd_gate_owner_personal_work_constraints() from public,anon,authenticated;

-- Alphabetically after the existing route gate; it narrows contractor handling only.
create or replace trigger trg_dd_demand_capture_route_owner_constraints
  before insert or update on public.dd_demand_capture_staging
  for each row execute function private.dd_gate_owner_personal_work_constraints();

-- Proof helper: pure constraint logic, no persistent fixtures.
create or replace function public.dd_prove_owner_personal_work_constraints_v1()
returns jsonb language plpgsql security definer set search_path = '' as $$
declare
  a jsonb; b jsonb; c jsonb; d jsonb;
begin
  if current_user not in ('postgres','service_role') then raise exception 'service_role required'; end if;
  a := private.dd_evaluate_owner_personal_work_fit('DANIELLE_AS_CONTRACTOR','REMOTE','PRIMARILY_ASYNC','LOW','LOW','FLEXIBLE','NONE');
  b := private.dd_evaluate_owner_personal_work_fit('DANIELLE_AS_CONTRACTOR','ONSITE','ASYNC','NONE','NONE','FLEXIBLE','NONE');
  c := private.dd_evaluate_owner_personal_work_fit('DANIELLE_AS_CONTRACTOR','REMOTE','SYNCHRONOUS','HIGH','HIGH','FIXED_PRESENCE','DRIVING_REQUIRED');
  d := private.dd_evaluate_owner_personal_work_fit('PROVIDER_ROUTED','ONSITE','SYNCHRONOUS','HIGH','HIGH','FIXED_PRESENCE','FIELD_REQUIRED');
  if a->>'fit'<>'ELIGIBLE' or b->>'fit'<>'REJECTED' or c->>'fit'<>'REJECTED' or d->>'fit'<>'NOT_APPLICABLE' then
    raise exception 'OWNER_PERSONAL_WORK_CONSTRAINT_PROOF_FAILED';
  end if;
  return jsonb_build_object('status','PASSED','cases',4,'remote_async_flexible',a,'onsite_rejected',b,'sync_phone_field_rejected',c,'provider_route_untouched',d);
end $$;
revoke all on function public.dd_prove_owner_personal_work_constraints_v1() from public,anon,authenticated;
grant execute on function public.dd_prove_owner_personal_work_constraints_v1() to service_role;
