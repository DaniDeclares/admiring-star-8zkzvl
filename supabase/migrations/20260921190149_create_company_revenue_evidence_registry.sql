create table if not exists public.dd_company_revenue_evidence (
  id uuid primary key default gen_random_uuid(),
  source_type text not null,
  source_reference text not null,
  period_start date,
  period_end date,
  revenue_type text not null,
  gross_receipts numeric,
  returns_allowances numeric,
  net_sales numeric,
  other_income numeric,
  gross_income numeric,
  total_expenses numeric,
  net_income numeric,
  classification_status text not null default 'EVIDENCE_ONLY',
  authority_note text,
  evidence_note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(source_type,source_reference,period_start,period_end)
);
alter table public.dd_company_revenue_evidence enable row level security;
drop policy if exists "staff_select_company_revenue_evidence" on public.dd_company_revenue_evidence;
create policy "staff_select_company_revenue_evidence" on public.dd_company_revenue_evidence
 for select to authenticated using (private.dd_is_staff_admin());
revoke all on public.dd_company_revenue_evidence from anon;
grant select on public.dd_company_revenue_evidence to authenticated;
