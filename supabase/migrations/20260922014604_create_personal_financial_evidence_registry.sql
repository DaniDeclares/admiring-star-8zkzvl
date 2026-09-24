create table if not exists public.dd_owner_financial_evidence (
 id uuid primary key default gen_random_uuid(),
 source_type text not null,
 source_reference text not null,
 tax_year integer,
 period_start date,
 period_end date,
 institution_or_payer text,
 evidence_category text not null,
 gross_amount numeric,
 debit_amount numeric,
 credit_amount numeric,
 ending_balance numeric,
 classification_status text not null default 'EVIDENCE_ONLY',
 business_relevance text not null default 'PERSONAL_ONLY',
 evidence_note text,
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now(),
 unique(source_type,source_reference,evidence_category)
);
alter table public.dd_owner_financial_evidence enable row level security;
drop policy if exists "staff_select_owner_financial_evidence" on public.dd_owner_financial_evidence;
create policy "staff_select_owner_financial_evidence" on public.dd_owner_financial_evidence for select to authenticated using (private.dd_is_staff_admin());
revoke all on public.dd_owner_financial_evidence from anon;
grant select on public.dd_owner_financial_evidence to authenticated;
