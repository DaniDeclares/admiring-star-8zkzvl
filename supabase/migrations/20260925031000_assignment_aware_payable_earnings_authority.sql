create table if not exists public.dd_accounts_payable_ledger(
 id uuid primary key default gen_random_uuid(),
 work_order_id uuid not null references public.dd_work_orders(id) on delete restrict,
 assignment_id uuid not null references public.dd_job_assignments(id) on delete restrict,
 provider_id uuid not null references public.dd_providers(id) on delete restrict,
 economics_snapshot_id uuid references public.dd_estimate_economics_snapshots(id) on delete set null,
 base_payout_amount numeric not null check(base_payout_amount>=0),
 travel_allowance numeric not null default 0 check(travel_allowance>=0),
 approved_change_order_addition numeric not null default 0,
 total_final_payable numeric not null check(total_final_payable>=0),
 is_cleared_for_payout boolean not null default false,
 payment_reference_id varchar,
 accrued_at timestamptz not null default now(),
 settled_at timestamptz,
 metadata jsonb not null default '{}'::jsonb,
 unique(assignment_id)
);
create index if not exists idx_dd_ap_work_order on public.dd_accounts_payable_ledger(work_order_id);
create index if not exists idx_dd_ap_provider on public.dd_accounts_payable_ledger(provider_id,is_cleared_for_payout);

create table if not exists public.dd_provider_earnings_ledger(
 id uuid primary key default gen_random_uuid(),
 provider_id uuid not null references public.dd_providers(id) on delete restrict,
 provider_org_id uuid references public.dd_provider_organizations(id) on delete set null,
 work_order_id uuid references public.dd_work_orders(id) on delete set null,
 assignment_id uuid references public.dd_job_assignments(id) on delete set null,
 payable_id uuid references public.dd_accounts_payable_ledger(id) on delete restrict,
 earning_type text not null,
 source_id text,
 base_amount numeric not null default 0,
 bonus_amount numeric not null default 0,
 reimbursement_amount numeric not null default 0,
 adjustment_amount numeric not null default 0,
 total_approved_amount numeric not null default 0,
 currency text not null default 'USD',
 earning_status text not null default 'PENDING',
 hold_reason text,
 qa_approved_at timestamptz,
 approved_at timestamptz,
 scheduled_payout_date date,
 paid_at timestamptz,
 stripe_transfer_reference text,
 metadata jsonb not null default '{}'::jsonb,
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now(),
 unique(payable_id)
);
alter table public.dd_accounts_payable_ledger enable row level security;
alter table public.dd_provider_earnings_ledger enable row level security;
revoke all on public.dd_accounts_payable_ledger,public.dd_provider_earnings_ledger from anon,authenticated;
grant select,insert,update,delete on public.dd_accounts_payable_ledger,public.dd_provider_earnings_ledger to service_role;

create or replace function public.dd_accrue_provider_payable_from_assignment(p_assignment_id uuid)
returns uuid language plpgsql security definer set search_path='public' as $$
declare a public.dd_job_assignments%rowtype; j public.dd_jobs%rowtype; ap_id uuid; base numeric;
begin
 select * into a from public.dd_job_assignments where id=p_assignment_id for update;
 if a.id is null then raise exception 'ASSIGNMENT_NOT_FOUND'; end if;
 if upper(coalesce(a.assignment_status,''))<>'ACCEPTED' then raise exception 'ASSIGNMENT_NOT_ACCEPTED'; end if;
 if a.provider_id is null then raise exception 'PROVIDER_REQUIRED'; end if;
 if a.authorized_provider_compensation is null then raise exception 'AUTHORIZED_PROVIDER_COMPENSATION_REQUIRED'; end if;
 select * into j from public.dd_jobs where id=a.job_id;
 if j.id is null then raise exception 'JOB_NOT_FOUND'; end if;
 if j.work_order_id is null then raise exception 'WORK_ORDER_REQUIRED'; end if;
 base:=a.authorized_provider_compensation;
 insert into public.dd_accounts_payable_ledger(work_order_id,assignment_id,provider_id,economics_snapshot_id,base_payout_amount,total_final_payable,is_cleared_for_payout,metadata)
 values(j.work_order_id,a.id,a.provider_id,a.economics_snapshot_id,base,base,false,jsonb_build_object('source','ACCEPTED_ASSIGNMENT','external_payout_authorized',false))
 on conflict(assignment_id) do update set economics_snapshot_id=excluded.economics_snapshot_id returning id into ap_id;
 insert into public.dd_provider_earnings_ledger(provider_id,provider_org_id,work_order_id,assignment_id,payable_id,earning_type,source_id,base_amount,total_approved_amount,earning_status,hold_reason,metadata)
 values(a.provider_id,a.provider_org_id,j.work_order_id,a.id,ap_id,'JOB_ASSIGNMENT',a.id::text,base,base,'PENDING','QA_AND_PAYOUT_CLEARANCE_REQUIRED',jsonb_build_object('external_payout_authorized',false))
 on conflict(payable_id) do nothing;
 return ap_id;
end $$;
revoke all on function public.dd_accrue_provider_payable_from_assignment(uuid) from public,anon,authenticated;
grant execute on function public.dd_accrue_provider_payable_from_assignment(uuid) to service_role;
