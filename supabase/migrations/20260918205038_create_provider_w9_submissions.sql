-- In-app electronic W-9 collection, built to the IRS's own "Electronic Submission
-- of Forms W-9" specification (Instructions for the Requester of Form W-9, Rev.
-- March 2024, page 4), not an ad hoc form. Every field on the paper form is
-- captured; the certification text stored is the verbatim Part II perjury
-- language; submission is auth-gated (only the account holder can submit their
-- own record) and access is logged.
--
-- The TIN (SSN or EIN) is the single most sensitive field a small business
-- collects. It is never stored in plaintext: only ciphertext (AES-256-GCM,
-- encrypted server-side in api/portal-operations.js using a secret that lives
-- only in Vercel's environment variables, never in this database) plus the
-- last four digits for staff-facing display/verification. Decryption happens
-- only through a dedicated staff-only server action that logs every access.

create table public.dd_provider_w9_submissions (
  id uuid primary key default gen_random_uuid(),
  provider_application_id uuid references public.dd_provider_applications(id) on delete set null,
  provider_org_id uuid references public.dd_provider_organizations(id) on delete set null,
  auth_user_id uuid not null references auth.users(id),

  -- Line 1/2
  line1_name text not null,
  line2_business_name text,

  -- Line 3a
  classification text not null check (classification in (
    'INDIVIDUAL_SOLE_PROP','C_CORPORATION','S_CORPORATION','PARTNERSHIP','TRUST_ESTATE','LLC','OTHER'
  )),
  llc_tax_classification text check (llc_tax_classification in ('C','S','P')),
  other_classification_description text,

  -- Line 3b
  has_foreign_partners boolean not null default false,

  -- Line 4
  exempt_payee_code text,
  fatca_exemption_code text,

  -- Line 5/6
  address text not null,
  city text not null,
  state_code text not null,
  zip_code text not null,

  -- Part I -- TIN is never stored in plaintext.
  tin_type text not null check (tin_type in ('SSN','EIN')),
  tin_last_four text not null check (tin_last_four ~ '^[0-9]{4}$'),
  tin_ciphertext text not null,
  tin_iv text not null,
  tin_auth_tag text not null,

  -- Part II Certification -- verbatim perjury-statement acknowledgement,
  -- required as the final entry per the IRS electronic-system spec.
  certification_text text not null,
  certification_agreed boolean not null,
  signature_full_name text not null,
  signed_at timestamptz not null default now(),
  submission_ip text,
  submission_user_agent text,

  status text not null default 'SUBMITTED' check (status in ('SUBMITTED','VERIFIED','REJECTED')),
  verified_by uuid references auth.users(id),
  verified_at timestamptz,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint dd_provider_w9_submissions_owner_check check (
    provider_application_id is not null or provider_org_id is not null
  )
);

create index dd_provider_w9_submissions_auth_user_idx on public.dd_provider_w9_submissions(auth_user_id);
create index dd_provider_w9_submissions_org_idx on public.dd_provider_w9_submissions(provider_org_id);

alter table public.dd_provider_w9_submissions enable row level security;

-- Providers may only insert their own submission -- they cannot read it back
-- (including the ciphertext) after submitting, matching the paper-form
-- experience where the requester holds the completed form, not the payee.
create policy dd_provider_w9_self_insert on public.dd_provider_w9_submissions
  for insert to authenticated
  with check (auth.uid() = auth_user_id);

-- Staff can review submissions (for verification workflow) but the ciphertext/
-- iv/auth_tag columns are useless without the server-side decryption key, so
-- this does not expose the actual TIN through PostgREST.
create policy dd_provider_w9_staff_all on public.dd_provider_w9_submissions
  for all to authenticated
  using (private.dd_is_staff_admin())
  with check (private.dd_is_staff_admin());

-- Every decrypt is logged here -- satisfies "document all occasions of user
-- access" for the sensitive TIN specifically, separate from general audit logs.
create table public.dd_provider_w9_tin_access_log (
  id uuid primary key default gen_random_uuid(),
  w9_submission_id uuid not null references public.dd_provider_w9_submissions(id) on delete cascade,
  accessed_by uuid not null references auth.users(id),
  accessed_at timestamptz not null default now(),
  reason text
);

alter table public.dd_provider_w9_tin_access_log enable row level security;

create policy dd_provider_w9_tin_access_log_staff_all on public.dd_provider_w9_tin_access_log
  for all to authenticated
  using (private.dd_is_staff_admin())
  with check (private.dd_is_staff_admin());
