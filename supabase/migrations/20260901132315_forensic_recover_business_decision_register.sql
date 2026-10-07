-- FORENSIC RECOVERY FROM THE PRODUCTION CATALOG (read-only). Not a redesign.
-- Authority: Danielle, 2026-10-02 13:45 UTC (read-only Production catalog recovery into #520).
-- Source: Production project ajxezpczaemunlcmqlgl, pg_catalog read on 2026-10-02.
-- Why: 20260901132316_pricing_governance_security_hardening alters
--   public.dd_business_decision_register, which no source file creates. It exists in Production.
-- Omitted on purpose: RLS enablement and policy staff_admin_all_dd_business_decision_register
--   (both created by 20260901132316).

create table if not exists public.dd_business_decision_register (
  id uuid default gen_random_uuid() not null,
  decision_code text not null,
  decision_name text not null,
  category text not null,
  decision_status text not null,
  decided_by text default 'Danielle Fong (Owner/Managing Director)'::text not null,
  decided_at timestamp with time zone,
  implementation_status text not null,
  implementation_evidence text,
  description text,
  source_reference text,
  created_at timestamp with time zone default now() not null,
  updated_at timestamp with time zone default now() not null,
  constraint dd_business_decision_register_decision_code_key UNIQUE (decision_code),
  constraint dd_business_decision_register_pkey PRIMARY KEY (id),
  constraint dd_business_decision_register_decision_status_check CHECK ((decision_status = ANY (ARRAY['APPROVED'::text, 'PENDING'::text, 'REJECTED'::text]))),
  constraint dd_business_decision_register_implementation_status_check CHECK ((implementation_status = ANY (ARRAY['IMPLEMENTED'::text, 'PARTIAL'::text, 'NOT_IMPLEMENTED'::text])))
);

-- Grants: Production relacl is {postgres=arwdDxtm, anon=rm, authenticated=arwdDxtm, service_role=arwdDxtm}.
revoke insert, update, delete, truncate, references, trigger on public.dd_business_decision_register from anon;
