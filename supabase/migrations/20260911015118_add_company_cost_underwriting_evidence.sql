create table if not exists public.dd_company_cost_evidence (
 id uuid primary key default gen_random_uuid(),
 source_type text not null,
 source_reference text not null,
 category text not null,
 subcategory text,
 transaction_date date,
 amount numeric(12,2),
 direction text,
 classification_status text not null default 'REVIEW',
 allocation_treatment text,
 evidence_note text,
 captured_at timestamptz not null default now()
);
create index if not exists dd_company_cost_evidence_category_idx on public.dd_company_cost_evidence(category);
create index if not exists dd_company_cost_evidence_source_idx on public.dd_company_cost_evidence(source_type, source_reference);
create table if not exists public.dd_company_cost_summary (
 id uuid primary key default gen_random_uuid(),
 audit_version text not null unique,
 evidence_file_reference text,
 bank_observed_total numeric(12,2),
 amazon_observed_total numeric(12,2),
 exclusion_review_total numeric(12,2),
 status text not null default 'EVIDENCE_CAPTURED',
 methodology_note text,
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now()
);
create table if not exists public.dd_underwriting_rules (
 rule_code text primary key,
 rule_name text not null,
 rule_definition text not null,
 status text not null default 'ACTIVE',
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now()
);
