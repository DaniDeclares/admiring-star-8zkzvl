-- Real, standalone partner directory -- deliberately NOT a provider record and NOT
-- repurposing dd_business_build_relationships (that table tracks DANI's own
-- business-build consulting clients, an unrelated relationship type; verified by
-- inspecting its actual rows before building this). A partner is a trusted external
-- business/professional DANI may refer to or receive referrals from, without ever
-- becoming a DANI-authorized, dispatched provider.
--
-- Staff-managed only for now: no partner login, no auth role, no referral workflow.
-- The stable uuid id is intentional groundwork for a future partner_referrals table
-- (partner_id FK) without needing to alter this table when that's built -- but that
-- table is NOT being built now.

create table public.dd_partners (
  id uuid primary key default gen_random_uuid(),
  partner_name text not null,
  primary_contact_name text,
  phone text,
  email text,
  website text,
  partner_type text,
  services_capabilities text,
  coverage_area text,
  service_radius_or_zips text,
  license_credential_notes text,
  insurance_status text,
  insurance_expiration date,
  preferred_contact_method text,
  availability_notes text,
  internal_notes text,
  source text,
  relationship_status text not null default 'ACTIVE' check (relationship_status in ('ACTIVE','INACTIVE','PROSPECTIVE','DO_NOT_USE')),
  date_added date not null default current_date,
  last_verified_at date,
  staff_owner uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.dd_partners enable row level security;

create policy dd_partners_staff_all on public.dd_partners
  for all to authenticated
  using (private.dd_is_staff_admin())
  with check (private.dd_is_staff_admin());

-- Seed with the one real, verified partner on file: Flynt Waters (Waters Roofing),
-- from his own real LinkedIn messages. Phone/email left null -- he never provided
-- them in either message; not fabricated.
insert into public.dd_partners (partner_name, primary_contact_name, partner_type, services_capabilities, coverage_area, source, relationship_status, internal_notes) values
  ('Waters Roofing', 'Flynt Waters', 'Commercial Roofing', 'Re-roofs, repairs, fast emergency leak response', 'Atlanta / Southeast', 'LinkedIn (inbound introduction)', 'ACTIVE', 'Explicitly positioned himself as a referral resource, not a sales prospect, in two separate messages (initial connection + follow-up intro Sept 18). No roofing SKU exists in DANI''s catalog, so he is not a candidate for provider authorization at this time -- referral-only relationship.');
