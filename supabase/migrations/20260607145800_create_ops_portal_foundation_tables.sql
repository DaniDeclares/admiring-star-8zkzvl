create extension if not exists pgcrypto;

alter table if exists public.divisions
  add column if not exists description text,
  add column if not exists is_active boolean not null default true,
  add column if not exists sort_order integer not null default 0,
  add column if not exists updated_at timestamptz not null default now();

create table if not exists public.services (
  id uuid primary key default gen_random_uuid(),
  division_id bigint references public.divisions(id) on delete set null,
  slug text not null unique,
  name text not null,
  description text,
  starting_price numeric(10,2),
  price_note text,
  is_active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.marketing_sources (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  channel text,
  description text,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  phone text,
  email text,
  organization_name text,
  city text,
  state text,
  source_id uuid references public.marketing_sources(id) on delete set null,
  source_text text,
  status text not null default 'new',
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.service_requests (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid references public.leads(id) on delete cascade,
  division_id bigint references public.divisions(id) on delete set null,
  service_id uuid references public.services(id) on delete set null,
  service_category text,
  service_needed text,
  location_address text,
  timeline text,
  budget_range text,
  request_details text,
  property_details jsonb not null default '{}'::jsonb,
  document_details jsonb not null default '{}'::jsonb,
  event_details jsonb not null default '{}'::jsonb,
  courier_details jsonb not null default '{}'::jsonb,
  govcon_details jsonb not null default '{}'::jsonb,
  status text not null default 'new',
  priority text not null default 'normal',
  quote_amount numeric(10,2),
  internal_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.followups (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid references public.leads(id) on delete cascade,
  service_request_id uuid references public.service_requests(id) on delete cascade,
  followup_type text not null default 'call',
  due_at timestamptz,
  completed_at timestamptz,
  status text not null default 'pending',
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_services_division_id on public.services(division_id);
create index if not exists idx_leads_status on public.leads(status);
create index if not exists idx_leads_source_id on public.leads(source_id);
create index if not exists idx_service_requests_lead_id on public.service_requests(lead_id);
create index if not exists idx_service_requests_status on public.service_requests(status);
create index if not exists idx_service_requests_division_id on public.service_requests(division_id);
create index if not exists idx_followups_due_at on public.followups(due_at);
create index if not exists idx_followups_status on public.followups(status);

alter table public.divisions enable row level security;
alter table public.services enable row level security;
alter table public.marketing_sources enable row level security;
alter table public.leads enable row level security;
alter table public.service_requests enable row level security;
alter table public.followups enable row level security;

do $$
begin
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='divisions' and policyname='Public can read active divisions') then
    create policy "Public can read active divisions" on public.divisions for select using (is_active = true);
  end if;
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='services' and policyname='Public can read active services') then
    create policy "Public can read active services" on public.services for select using (is_active = true);
  end if;
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='marketing_sources' and policyname='Public can read active marketing sources') then
    create policy "Public can read active marketing sources" on public.marketing_sources for select using (is_active = true);
  end if;
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='leads' and policyname='Public can create leads') then
    create policy "Public can create leads" on public.leads for insert with check (true);
  end if;
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='service_requests' and policyname='Public can create service requests') then
    create policy "Public can create service requests" on public.service_requests for insert with check (true);
  end if;
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='followups' and policyname='Public can create followups') then
    create policy "Public can create followups" on public.followups for insert with check (true);
  end if;
end $$;

insert into public.divisions (slug, name, description, sort_order) values
('fieldops', 'FieldOps / Field Services', 'Property resets, move-out cleaning, inspections, turnovers, trash-out coordination, and photo documentation.', 10),
('docops', 'DocOps / Document & Compliance', 'Document preparation, apostille facilitation, I-9 verification, printing, scanning, and compliance support.', 20),
('courierops', 'CourierOps / Logistics & Courier', 'Court filing, document delivery, hospital or jail runs, business courier support, and proof-of-delivery support.', 30),
('eventops', 'EventOps / Event Planning & Execution', 'Event setup, breakdown, vendor coordination, decor execution, and planning support.', 40),
('propertyops', 'PropertyOps / Property Manager Support', 'Property manager outreach, turnovers, inspections, recurring resets, and vendor-ready field support.', 50),
('govops', 'GovOps / Government Contracting', 'Government subcontracting support, capability readiness, compliance records, and opportunity tracking.', 60),
('vendorops', 'VendorOps / Vendor Readiness', 'Insurance tracking, vendor onboarding, contractor readiness, service area records, and compliance files.', 70),
('businessops', 'BusinessOps / Administrative Support', 'Back-office support, client intake systems, document organization, and business support.', 80)
on conflict (slug) do update set name = excluded.name, description = excluded.description, sort_order = excluded.sort_order, updated_at = now();

insert into public.marketing_sources (slug, name, channel, description) values
('website','Website','website','General website visitor or direct request.'),
('request_service','Request Service Page','website','Universal request-service form.'),
('property_manager_packet','Property Manager Packet','print','Property manager outreach packet or QR code.'),
('field_services_flyer','Field Services Flyer','print','Field services flyer or cleaning flyer.'),
('cleaning_door_hanger','Cleaning Door Hanger','print','Door hanger or local cleaning promotion.'),
('nfc_card','NFC Card','offline','NFC business card or tap card.'),
('qr_sticker','QR Sticker','offline','QR sticker, label, or product tag.'),
('apostille_packet','Apostille Packet','print','Apostille service packet or QR code.'),
('hospital_packet','Hospital Packet','print','Hospital/facility service packet.'),
('legal_court_packet','Legal/Court Packet','print','Legal or court office packet.'),
('event_consult_form','Event Consultation Form','website','Event consultation intake.'),
('facebook_group','Facebook Group','social','Facebook group post or message.'),
('google_business','Google Business Profile','search','Google Business Profile listing.'),
('linkedin','LinkedIn','social','LinkedIn outreach or profile traffic.'),
('referral','Referral','referral','Referral from client, contact, or partner.')
on conflict (slug) do update set name = excluded.name, channel = excluded.channel, description = excluded.description;

insert into public.services (division_id, slug, name, description, starting_price, price_note, sort_order)
select d.id, s.slug, s.name, s.description, s.starting_price, s.price_note, s.sort_order
from (values
('fieldops','move-out-cleaning','Move-Out Cleaning','Cleaning support for move-out, turnover, and property reset needs.',300,'Starting price. Final quote depends on size and condition.',10),
('fieldops','deep-cleaning','Deep Cleaning','Detailed cleaning for homes, rentals, offices, and resets.',400,'Starting price. Final quote depends on scope.',20),
('fieldops','property-reset','Full Property Reset','Multi-step reset for rental, sale, move-in, or inspection readiness.',500,'Typical range $500-$1,500 depending on scope.',30),
('fieldops','inspection-photo-documentation','Inspection & Photo Documentation','On-site photos, condition notes, and documentation support.',null,'Quote based on location and scope.',40),
('docops','apostille-facilitation','Apostille Facilitation','Document handling and facilitation for apostille requests.',175,'Starting price. Government fees/shipping may be separate.',10),
('docops','i9-verification','I-9 Employment Verification','Remote employee identity/document verification support.',50,'Starting price.',20),
('docops','document-preparation','Document Preparation','Non-attorney document preparation and administrative support.',75,'Legal advice is not provided.',30),
('docops','printing-scanning','Printing, Scanning & Document Handling','Basic print, scan, organization, and document handling support.',25,'Starting price.',40),
('courierops','court-filing-courier','Court Filing Courier','Court filing, retrieval, and document delivery support.',85,'Starting price.',10),
('courierops','process-serving','Process Serving','Process serving coordination and field support where available.',125,'Starting price.',20),
('courierops','business-courier','Business Courier Support','Business document pickup, delivery, and proof-of-delivery support.',null,'Quote based on distance and deadline.',30),
('eventops','event-setup-breakdown','Event Setup & Breakdown','Setup, breakdown, decor assistance, and execution support.',null,'Quote based on event size and scope.',10),
('eventops','vendor-coordination','Vendor Coordination','Vendor communication, timeline support, and event-day coordination.',null,'Quote based on scope.',20),
('propertyops','property-manager-support','Property Manager Support','Recurring turnover, reset, inspection, and vendor support for property teams.',null,'Quote based on portfolio and scope.',10),
('govops','govcon-support','Government Contracting Support','Admin, compliance, document, field support, and subcontracting readiness.',null,'Quote based on opportunity and scope.',10),
('vendorops','vendor-readiness','Vendor Readiness Support','Insurance, COI, vendor portal, compliance, and onboarding organization.',null,'Quote based on requirements.',10),
('businessops','admin-support','Administrative Support','Back-office, intake, organization, and records support.',50,'Starting price.',10)
) as s(division_slug, slug, name, description, starting_price, price_note, sort_order)
join public.divisions d on d.slug = s.division_slug
on conflict (slug) do update set division_id = excluded.division_id, name = excluded.name, description = excluded.description, starting_price = excluded.starting_price, price_note = excluded.price_note, sort_order = excluded.sort_order, updated_at = now();