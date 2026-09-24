
create table if not exists public.dd_sales_commission_policies (
  id uuid primary key default gen_random_uuid(),
  policy_code text not null unique,
  lead_origin_class text not null,
  commission_rate numeric(7,6),
  basis text not null default 'COLLECTED_SERVICE_REVENUE',
  status text not null default 'ACTIVE' check (status in ('ACTIVE','HOLD','RETIRED')),
  requires_margin_guardrail boolean not null default true,
  owner_review_on_guardrail_failure boolean not null default true,
  effective_from timestamptz not null default now(),
  effective_to timestamptz,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table if not exists public.dd_sales_commissions (
  id uuid primary key default gen_random_uuid(),
  sales_queue_id uuid not null references public.dd_sales_queue(id) on delete cascade,
  salesperson_user_id uuid references auth.users(id),
  salesperson_name text,
  policy_id uuid references public.dd_sales_commission_policies(id),
  lead_origin_class text not null,
  collected_revenue_basis numeric not null default 0,
  commission_rate numeric(7,6),
  commission_amount numeric not null default 0,
  commission_status text not null default 'ACCRUING'
    check (commission_status in ('ACCRUING','EARNED','HELD_FOR_REVIEW','PAID','VOID')),
  economics_guardrail_status text not null default 'PENDING'
    check (economics_guardrail_status in ('PENDING','PASS','FAIL','NOT_REQUIRED')),
  earned_at timestamptz,
  paid_at timestamptz,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(sales_queue_id, salesperson_user_id)
);
alter table public.dd_sales_queue add column if not exists salesperson_user_id uuid references auth.users(id);
alter table public.dd_sales_queue add column if not exists salesperson_name text;
alter table public.dd_sales_queue add column if not exists lead_origin_class text;
alter table public.dd_sales_queue add column if not exists commission_policy_code text;
alter table public.dd_sales_commission_policies enable row level security;
alter table public.dd_sales_commissions enable row level security;
revoke all on public.dd_sales_commission_policies from anon;
revoke all on public.dd_sales_commissions from anon;
grant select on public.dd_sales_commission_policies to authenticated;
grant select on public.dd_sales_commissions to authenticated;
grant select,insert,update,delete on public.dd_sales_commission_policies to service_role;
grant select,insert,update,delete on public.dd_sales_commissions to service_role;
drop policy if exists dd_sales_commission_policies_staff_select on public.dd_sales_commission_policies;
create policy dd_sales_commission_policies_staff_select on public.dd_sales_commission_policies
for select using (private.dd_is_staff_admin());
drop policy if exists dd_sales_commissions_staff_select on public.dd_sales_commissions;
create policy dd_sales_commissions_staff_select on public.dd_sales_commissions
for select using (private.dd_is_staff_admin());
insert into public.dd_sales_commission_policies
(policy_code,lead_origin_class,commission_rate,basis,status,requires_margin_guardrail,owner_review_on_guardrail_failure,notes)
values
('DANI_PAID_INBOUND_10','DANI_PAID_INBOUND',0.10,'COLLECTED_SERVICE_REVENUE','ACTIVE',true,true,
 'Default closer commission for DANI-generated or DANI-paid inbound opportunities. Earn only as customer service revenue is collected. Margin/economics guardrail remains required. Other origin classes require separate owner-approved policies.')
on conflict(policy_code) do update set
 commission_rate=excluded.commission_rate,basis=excluded.basis,status=excluded.status,
 requires_margin_guardrail=excluded.requires_margin_guardrail,
 owner_review_on_guardrail_failure=excluded.owner_review_on_guardrail_failure,
 notes=excluded.notes,updated_at=now();
