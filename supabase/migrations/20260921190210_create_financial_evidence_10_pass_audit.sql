create table if not exists public.dd_financial_evidence_10_pass_audit (
 id uuid primary key default gen_random_uuid(),
 audit_version text not null,
 pass_number integer not null check(pass_number between 1 and 10),
 pass_name text not null,
 status text not null check(status in ('GREEN','YELLOW','RED','NOT_PROVEN')),
 current_state text not null,
 blocking_gap text,
 green_exit_criteria text not null,
 source_basis text,
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now(),
 unique(audit_version,pass_number)
);
alter table public.dd_financial_evidence_10_pass_audit enable row level security;
drop policy if exists "staff_select_financial_evidence_10_pass_audit" on public.dd_financial_evidence_10_pass_audit;
create policy "staff_select_financial_evidence_10_pass_audit" on public.dd_financial_evidence_10_pass_audit
 for select to authenticated using (private.dd_is_staff_admin());
revoke all on public.dd_financial_evidence_10_pass_audit from anon;
grant select on public.dd_financial_evidence_10_pass_audit to authenticated;
