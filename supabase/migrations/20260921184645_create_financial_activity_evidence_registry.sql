create table if not exists public.dd_financial_activity_evidence (
  id uuid primary key default gen_random_uuid(),
  source_type text not null,
  source_reference text not null,
  statement_period_start date not null,
  statement_period_end date not null,
  account_label text,
  activity_status text not null default 'ACTIVITY_CAPTURED',
  payments_received numeric,
  payments_sent numeric,
  withdrawals_debits numeric,
  deposits_credits numeric,
  fees numeric,
  releases numeric,
  withheld numeric,
  ending_available_balance numeric,
  currency text not null default 'USD',
  classification_status text not null default 'EVIDENCE_ONLY',
  authority_note text,
  evidence_note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(source_type, source_reference, statement_period_start, statement_period_end)
);
alter table public.dd_financial_activity_evidence enable row level security;
drop policy if exists "staff_select_financial_activity_evidence" on public.dd_financial_activity_evidence;
create policy "staff_select_financial_activity_evidence" on public.dd_financial_activity_evidence
  for select to authenticated using (private.dd_is_staff_admin());
revoke all on public.dd_financial_activity_evidence from anon;
grant select on public.dd_financial_activity_evidence to authenticated;
