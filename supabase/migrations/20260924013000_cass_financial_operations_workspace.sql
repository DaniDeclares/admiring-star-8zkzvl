-- Cass Financial Operations workspace
-- Owner approved 2026-09-24. Provider-bound accounting review surface; no CPA/attest/tax authority is granted.

create table if not exists public.dd_accounting_work_reviews (
  id uuid primary key default gen_random_uuid(),
  provider_id uuid not null references public.dd_providers(id) on delete restrict,
  source_type text not null check (source_type in ('ACCOUNTING_EXCEPTION','ACCOUNTING_SOURCE','ACCOUNTS_PAYABLE','FINANCIAL_EVIDENCE')),
  source_id text not null,
  review_status text not null check (review_status in ('PREPARED','REVIEWED','NEEDS_OWNER','RESOLVED_NON_OWNER')),
  reviewer_note text,
  proposed_treatment jsonb not null default '{}'::jsonb,
  reviewed_by_auth_user_id uuid not null,
  reviewed_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);
alter table public.dd_accounting_work_reviews enable row level security;
revoke all on table public.dd_accounting_work_reviews from anon, authenticated;
grant all on table public.dd_accounting_work_reviews to service_role;

create or replace function public.dd_get_my_accounting_workspace()
returns jsonb language plpgsql security definer set search_path='' as $$
declare v_provider_id uuid; v_authorized boolean; v_result jsonb;
begin
  if auth.uid() is null then raise exception 'AUTH_REQUIRED'; end if;
  v_provider_id := public.dd_current_provider_id();
  if v_provider_id is null then raise exception 'PROVIDER_IDENTITY_REQUIRED'; end if;
  select exists (select 1 from public.dd_provider_capabilities c where c.provider_id=v_provider_id and c.is_authorized=true and c.capability_key in ('AP_AR_ADMIN','BOOKKEEPING_SETUP','CASH_FLOW_BUDGETING','FINANCIAL_READINESS','FINANCIAL_REPORTING','MONTHLY_BOOKKEEPING')) into v_authorized;
  if not v_authorized then raise exception 'ACCOUNTING_CAPABILITY_REQUIRED'; end if;
  select jsonb_build_object(
    'providerId',v_provider_id,
    'lanes',coalesce((select jsonb_agg(jsonb_build_object('capabilityKey',r.capability_key,'lane',r.dashboard_lane,'routeMode',r.route_mode,'ownerEscalationRule',r.owner_escalation_rule,'externalWorkMode',r.external_work_mode,'internalWorkMode',r.internal_company_work_mode,'compensationMode',r.internal_compensation_mode) order by r.dashboard_lane) from public.dd_provider_dashboard_lane_routes r where r.provider_id=v_provider_id and r.is_active=true),'[]'::jsonb),
    'exceptions',coalesce((select jsonb_agg(to_jsonb(x) order by x.created_at desc) from (select id,exception_type,source_system,source_record_type,source_record_id,description,assigned_lane,status,requires_owner_decision,resolution,resolved_at,metadata,created_at,updated_at from public.dd_accounting_exception_queue where status not in ('RESOLVED','CLOSED') order by created_at desc limit 100) x),'[]'::jsonb),
    'sources',coalesce((select jsonb_agg(to_jsonb(x) order by x.updated_at desc) from (select id,source_key,source_name,system_name,classification,coverage_period,accounting_treatment,overall_status,found_status,extracted_status,reconciled_status,qbo_posted_status,source_reference,notes,last_verified_at,updated_at from public.dd_accounting_source_register order by updated_at desc limit 100) x),'[]'::jsonb),
    'payables',coalesce((select jsonb_agg(to_jsonb(x) order by x.accrued_at desc) from (select id,work_order_id,provider_id,base_payout_amount,travel_allowance,approved_change_order_addition,total_final_payable,is_cleared_for_payout,payment_reference_id,accrued_at,settled_at from public.dd_accounts_payable_ledger order by accrued_at desc limit 100) x),'[]'::jsonb),
    'reviews',coalesce((select jsonb_agg(to_jsonb(x) order by x.reviewed_at desc) from (select id,source_type,source_id,review_status,reviewer_note,proposed_treatment,reviewed_at from public.dd_accounting_work_reviews where provider_id=v_provider_id order by reviewed_at desc limit 100) x),'[]'::jsonb),
    'boundaries',jsonb_build_object(
      'may',jsonb_build_array('prepare bookkeeping','reconcile evidence','prepare unaudited schedules and reports','prepare AP/AR work','prepare cash and budget analysis','prepare funding-readiness schedules','flag exceptions'),
      'mustEscalate',jsonb_build_array('owner decisions','write-offs','disputed obligations','debt or spending approval','capital-use decisions','material unresolved discrepancies','credential-gated tax or attest work'),
      'prohibited',jsonb_build_array('CPA or licensed-accountant representation without credential','audit/review/attest assurance','certifying financial statements','substantive compensated federal return preparation without valid PTIN','IRS representation without authority','inventing or silently classifying ambiguous financial evidence')
    )
  ) into v_result;
  return v_result;
end $$;

create or replace function public.dd_review_my_accounting_item(p_source_type text,p_source_id text,p_review_status text,p_reviewer_note text default null,p_proposed_treatment jsonb default '{}'::jsonb)
returns jsonb language plpgsql security definer set search_path='' as $$
declare v_provider_id uuid; v_authorized boolean; v_exception public.dd_accounting_exception_queue%rowtype; v_review public.dd_accounting_work_reviews%rowtype;
begin
  if auth.uid() is null then raise exception 'AUTH_REQUIRED'; end if;
  v_provider_id := public.dd_current_provider_id();
  if v_provider_id is null then raise exception 'PROVIDER_IDENTITY_REQUIRED'; end if;
  select exists (select 1 from public.dd_provider_capabilities c where c.provider_id=v_provider_id and c.is_authorized=true and c.capability_key in ('AP_AR_ADMIN','BOOKKEEPING_SETUP','CASH_FLOW_BUDGETING','FINANCIAL_READINESS','FINANCIAL_REPORTING','MONTHLY_BOOKKEEPING')) into v_authorized;
  if not v_authorized then raise exception 'ACCOUNTING_CAPABILITY_REQUIRED'; end if;
  if p_source_type not in ('ACCOUNTING_EXCEPTION','ACCOUNTING_SOURCE','ACCOUNTS_PAYABLE','FINANCIAL_EVIDENCE') then raise exception 'INVALID_SOURCE_TYPE'; end if;
  if p_review_status not in ('PREPARED','REVIEWED','NEEDS_OWNER','RESOLVED_NON_OWNER') then raise exception 'INVALID_REVIEW_STATUS'; end if;
  if p_source_type='ACCOUNTING_EXCEPTION' then
    select * into v_exception from public.dd_accounting_exception_queue where id::text=p_source_id for update;
    if not found then raise exception 'ACCOUNTING_EXCEPTION_NOT_FOUND'; end if;
    if v_exception.requires_owner_decision and p_review_status='RESOLVED_NON_OWNER' then raise exception 'OWNER_DECISION_REQUIRED'; end if;
    if p_review_status='RESOLVED_NON_OWNER' then
      update public.dd_accounting_exception_queue set status='RESOLVED',resolution=coalesce(nullif(trim(p_reviewer_note),''),'Resolved by authorized accounting provider review'),resolved_by='accounting_provider:'||v_provider_id::text,resolved_at=now(),updated_at=now() where id=v_exception.id;
    elsif p_review_status='NEEDS_OWNER' then
      update public.dd_accounting_exception_queue set status='PENDING_OWNER',requires_owner_decision=true,updated_at=now() where id=v_exception.id;
    end if;
  end if;
  insert into public.dd_accounting_work_reviews(provider_id,source_type,source_id,review_status,reviewer_note,proposed_treatment,reviewed_by_auth_user_id)
  values(v_provider_id,p_source_type,p_source_id,p_review_status,nullif(trim(p_reviewer_note),''),coalesce(p_proposed_treatment,'{}'::jsonb),auth.uid()) returning * into v_review;
  return jsonb_build_object('id',v_review.id,'reviewStatus',v_review.review_status,'reviewedAt',v_review.reviewed_at);
end $$;

revoke all on function public.dd_get_my_accounting_workspace() from public, anon;
grant execute on function public.dd_get_my_accounting_workspace() to authenticated, service_role;
revoke all on function public.dd_review_my_accounting_item(text,text,text,text,jsonb) from public, anon;
grant execute on function public.dd_review_my_accounting_item(text,text,text,text,jsonb) to authenticated, service_role;
