-- DDOS Phase 1 merge migration
-- Applies only missing universal DDOS schema while preserving existing Ops Portal and FieldOps tables.

create extension if not exists pgcrypto with schema extensions;

-- Security hardening for existing helper functions from earlier migrations.
create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = public, pg_temp
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace function public.create_fieldops_estimate_review_task()
returns trigger
language plpgsql
set search_path = public, pg_temp
as $$
begin
  insert into public.fieldops_estimate_tasks (estimate_id, task_type, status, due_at, notes)
  values (
    new.id,
    'review_new_estimate',
    'open',
    now() + interval '2 hours',
    'Review new FieldOps estimate request, inspect photos/videos, confirm travel, and send quote or follow-up questions.'
  );
  return new;
end;
$$;

-- Preserve existing public.divisions table and seed missing active divisions used by the website.
insert into public.divisions (name, slug, description, is_active, sort_order)
values
('DocOps / Document & Compliance', 'docops', 'Document, compliance, administrative, apostille, I-9, and submission support.', true, 10),
('FieldOps / Property Operations & Resets', 'fieldops', 'Cleaning, deep cleaning, property resets, turnovers, inspections, and photo documentation.', true, 20),
('CourierOps / Logistics & Courier', 'courierops', 'Courier runs, field visits, supply runs, posting support, and mobile logistics support.', true, 30),
('EventOps / Event Planning & Execution', 'eventops', 'Event planning, setup, breakdown, vendor coordination, and event operations support.', true, 40),
('ProductOps / Stickers, Labels, Heat Press & Merch', 'productops', 'Sticker, label, heat press, DTF, event product, and merch production support.', true, 50),
('GovOps / Government Contracting Support', 'govops', 'Subcontractor readiness, capability statement support, outreach, and administrative GovCon support.', true, 60),
('VendorOps / Vendor Readiness & Subcontractors', 'vendorops', 'Vendor packet, insurance, portal, compliance tracker, and subcontractor readiness support.', true, 70),
('BusinessOps / Admin Systems & Business Support', 'businessops', 'Operations systems, SOPs, admin support, CRM tracking, and business execution support.', true, 80)
on conflict (slug) do update set
  name = excluded.name,
  description = excluded.description,
  is_active = true,
  sort_order = excluded.sort_order,
  updated_at = now();

-- Preserve existing public.marketing_sources table and seed missing sources.
insert into public.marketing_sources (slug, name, channel, description, is_active)
values
('website', 'Website', 'website', 'Direct website intake.', true),
('request_service_page', 'Request Service Page', 'website', 'Main website request service page.', true),
('google_business_profile', 'Google Business Profile', 'search', 'Google Business Profile inquiry or click.', true),
('facebook_group', 'Facebook Group', 'social', 'Facebook group lead or post response.', true),
('linkedin', 'LinkedIn', 'social', 'LinkedIn connection, message, or search.', true),
('referral', 'Referral', 'referral', 'Referral from client, friend, vendor, or network.', true),
('cleaning_door_hanger', 'Cleaning Door Hanger', 'print', 'Door hanger campaign.', true),
('field_services_flyer', 'Field Services Flyer', 'print', 'Field services flyer campaign.', true),
('property_manager_packet', 'Property Manager Packet', 'packet', 'Property manager vendor packet.', true),
('qr_sticker', 'QR Sticker', 'print', 'QR sticker scan.', true),
('nfc_card', 'NFC Card', 'print', 'NFC card tap.', true),
('other', 'Other', 'other', 'Other or unknown source.', true)
on conflict (slug) do update set
  name = excluded.name,
  channel = excluded.channel,
  description = excluded.description,
  is_active = true;

-- Universal package catalog across divisions.
create table if not exists public.dd_service_packages (
  id uuid primary key default gen_random_uuid(),
  division_slug text not null,
  package_slug text not null,
  package_name text not null,
  public_name text,
  outcome_label text,
  category text,
  locked_price numeric(10,2),
  starting_price numeric(10,2),
  typical_min numeric(10,2),
  typical_max numeric(10,2),
  pricing_model text not null default 'fixed' check (pricing_model in ('fixed','starting_at','range','monthly','minimum','pass_through','quote','conditional')),
  deposit_type text not null default 'policy' check (deposit_type in ('paid_in_full','percent','flat','first_month','materials_plus_percent','policy')),
  deposit_value numeric(10,2),
  scope_included text[] not null default ARRAY[]::text[],
  addon_notes text[] not null default ARRAY[]::text[],
  exclusions text[] not null default ARRAY[]::text[],
  status_boundary text,
  is_public boolean not null default true,
  is_active boolean not null default true,
  sort_order integer not null default 100,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (division_slug, package_slug)
);

create table if not exists public.dd_service_addons (
  id uuid primary key default gen_random_uuid(),
  division_slug text not null,
  addon_slug text not null,
  addon_name text not null,
  category text,
  pricing_type text not null default 'flat' check (pricing_type in ('flat','range','per_item','per_hour','per_page','per_stop','per_unit','per_packet','per_room','per_window','per_document','per_employee','monthly','percent','quote','pass_through')),
  base_price numeric(10,2),
  min_price numeric(10,2),
  max_price numeric(10,2),
  unit_label text,
  inventory_used text[] not null default ARRAY[]::text[],
  applies_to_packages text[] not null default ARRAY[]::text[],
  quote_notes text,
  is_active boolean not null default true,
  sort_order integer not null default 100,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (division_slug, addon_slug)
);

create table if not exists public.dd_estimator_settings (
  id uuid primary key default gen_random_uuid(),
  setting_scope text not null default 'global',
  division_slug text not null default '',
  setting_key text not null,
  setting_value jsonb not null default '{}'::jsonb,
  description text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(setting_scope, division_slug, setting_key)
);

create table if not exists public.dd_estimates (
  id uuid primary key default gen_random_uuid(),
  public_reference text not null unique default ('DD-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 10))),
  division_slug text not null,
  source_slug text,
  lead_id uuid references public.leads(id) on delete set null,
  service_request_id uuid references public.service_requests(id) on delete set null,
  client_name text,
  client_phone text,
  client_email text,
  client_type text,
  organization_name text,
  location_address text,
  city text,
  state text default 'GA',
  zip_code text,
  timeline text,
  rush_requested boolean not null default false,
  requested_date date,
  intake_answers jsonb not null default '{}'::jsonb,
  upload_summary jsonb not null default '{}'::jsonb,
  client_notes text,
  internal_notes text,
  estimate_status text not null default 'new' check (estimate_status in ('new','needs_review','estimated','sent','approved','declined','converted','closed')),
  priority text not null default 'normal' check (priority in ('low','normal','high','urgent')),
  base_subtotal numeric(10,2) not null default 0,
  addon_subtotal numeric(10,2) not null default 0,
  travel_fee numeric(10,2) not null default 0,
  rush_fee numeric(10,2) not null default 0,
  supplies_fee numeric(10,2) not null default 0,
  pass_through_fee numeric(10,2) not null default 0,
  tax_amount numeric(10,2) not null default 0,
  estimated_total numeric(10,2) not null default 0,
  deposit_due numeric(10,2) not null default 0,
  quote_disclaimer text not null default 'Online estimate only. Final quote may change after review of scope, files, timing, travel, supplies, pass-through costs, licensing/insurance boundaries, and client-provided details.',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.dd_estimate_packages (
  id uuid primary key default gen_random_uuid(),
  estimate_id uuid not null references public.dd_estimates(id) on delete cascade,
  package_id uuid references public.dd_service_packages(id) on delete set null,
  division_slug text,
  package_slug text,
  package_name text not null,
  quantity numeric(10,2) not null default 1,
  unit_price numeric(10,2),
  min_price numeric(10,2),
  max_price numeric(10,2),
  line_total numeric(10,2) not null default 0,
  notes text,
  created_at timestamptz not null default now()
);

create table if not exists public.dd_estimate_addons (
  id uuid primary key default gen_random_uuid(),
  estimate_id uuid not null references public.dd_estimates(id) on delete cascade,
  addon_id uuid references public.dd_service_addons(id) on delete set null,
  division_slug text,
  addon_slug text,
  addon_name text not null,
  quantity numeric(10,2) not null default 1,
  unit_price numeric(10,2),
  min_price numeric(10,2),
  max_price numeric(10,2),
  line_total numeric(10,2) not null default 0,
  notes text,
  created_at timestamptz not null default now()
);

create table if not exists public.dd_estimate_media (
  id uuid primary key default gen_random_uuid(),
  estimate_id uuid not null references public.dd_estimates(id) on delete cascade,
  bucket_id text not null default 'dd-estimate-media',
  object_path text not null,
  media_type text not null check (media_type in ('photo','video','audio','document','other')),
  file_name text,
  mime_type text,
  file_size_bytes bigint,
  label text,
  client_caption text,
  internal_notes text,
  uploaded_by text not null default 'client',
  created_at timestamptz not null default now()
);

create table if not exists public.dd_travel_calculations (
  id uuid primary key default gen_random_uuid(),
  estimate_id uuid not null references public.dd_estimates(id) on delete cascade,
  origin_address text,
  destination_address text,
  distance_miles numeric(10,2),
  drive_minutes integer,
  mileage_rate numeric(10,2),
  base_travel_fee numeric(10,2) not null default 0,
  mileage_fee numeric(10,2) not null default 0,
  parking_tolls_fee numeric(10,2) not null default 0,
  total_travel_fee numeric(10,2) not null default 0,
  provider text,
  calculation_notes text,
  created_at timestamptz not null default now()
);

create table if not exists public.dd_jobs (
  id uuid primary key default gen_random_uuid(),
  public_reference text not null unique default ('DD-JOB-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 8))),
  estimate_id uuid references public.dd_estimates(id) on delete set null,
  lead_id uuid references public.leads(id) on delete set null,
  service_request_id uuid references public.service_requests(id) on delete set null,
  division_slug text not null,
  job_title text not null,
  job_status text not null default 'new' check (job_status in ('new','scheduled','in_progress','blocked','completed','cancelled','closed')),
  scheduled_start timestamptz,
  scheduled_end timestamptz,
  location_address text,
  assigned_to text,
  scope_summary text,
  internal_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.dd_job_tasks (
  id uuid primary key default gen_random_uuid(),
  job_id uuid not null references public.dd_jobs(id) on delete cascade,
  task_name text not null,
  task_type text,
  status text not null default 'open' check (status in ('open','in_progress','done','cancelled')),
  sort_order integer not null default 100,
  due_at timestamptz,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.dd_invoices (
  id uuid primary key default gen_random_uuid(),
  public_reference text not null unique default ('DD-INV-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 8))),
  estimate_id uuid references public.dd_estimates(id) on delete set null,
  job_id uuid references public.dd_jobs(id) on delete set null,
  lead_id uuid references public.leads(id) on delete set null,
  stripe_invoice_id text,
  stripe_payment_link text,
  invoice_status text not null default 'draft' check (invoice_status in ('draft','sent','paid','partial','void','uncollectible','refunded')),
  subtotal numeric(10,2) not null default 0,
  tax_amount numeric(10,2) not null default 0,
  total_amount numeric(10,2) not null default 0,
  deposit_due numeric(10,2) not null default 0,
  balance_due numeric(10,2) not null default 0,
  due_date date,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.dd_followup_tasks (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid references public.leads(id) on delete set null,
  estimate_id uuid references public.dd_estimates(id) on delete cascade,
  job_id uuid references public.dd_jobs(id) on delete cascade,
  invoice_id uuid references public.dd_invoices(id) on delete cascade,
  division_slug text,
  task_type text not null default 'follow_up',
  status text not null default 'open' check (status in ('open','in_progress','done','cancelled')),
  due_at timestamptz,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_dd_service_packages_division on public.dd_service_packages(division_slug, is_active, sort_order);
create index if not exists idx_dd_service_addons_division on public.dd_service_addons(division_slug, is_active, sort_order);
create index if not exists idx_dd_estimates_status on public.dd_estimates(division_slug, estimate_status, created_at desc);
create index if not exists idx_dd_jobs_status on public.dd_jobs(division_slug, job_status, scheduled_start);
create index if not exists idx_dd_invoices_status on public.dd_invoices(invoice_status, due_date);
create index if not exists idx_dd_followup_tasks_due on public.dd_followup_tasks(status, due_at);

-- Triggers
DO $$
begin
  if not exists (select 1 from pg_trigger where tgname = 'trg_dd_service_packages_updated_at') then
    create trigger trg_dd_service_packages_updated_at before update on public.dd_service_packages for each row execute function public.set_updated_at();
  end if;
  if not exists (select 1 from pg_trigger where tgname = 'trg_dd_service_addons_updated_at') then
    create trigger trg_dd_service_addons_updated_at before update on public.dd_service_addons for each row execute function public.set_updated_at();
  end if;
  if not exists (select 1 from pg_trigger where tgname = 'trg_dd_estimator_settings_updated_at') then
    create trigger trg_dd_estimator_settings_updated_at before update on public.dd_estimator_settings for each row execute function public.set_updated_at();
  end if;
  if not exists (select 1 from pg_trigger where tgname = 'trg_dd_estimates_updated_at') then
    create trigger trg_dd_estimates_updated_at before update on public.dd_estimates for each row execute function public.set_updated_at();
  end if;
  if not exists (select 1 from pg_trigger where tgname = 'trg_dd_jobs_updated_at') then
    create trigger trg_dd_jobs_updated_at before update on public.dd_jobs for each row execute function public.set_updated_at();
  end if;
  if not exists (select 1 from pg_trigger where tgname = 'trg_dd_job_tasks_updated_at') then
    create trigger trg_dd_job_tasks_updated_at before update on public.dd_job_tasks for each row execute function public.set_updated_at();
  end if;
  if not exists (select 1 from pg_trigger where tgname = 'trg_dd_invoices_updated_at') then
    create trigger trg_dd_invoices_updated_at before update on public.dd_invoices for each row execute function public.set_updated_at();
  end if;
  if not exists (select 1 from pg_trigger where tgname = 'trg_dd_followup_tasks_updated_at') then
    create trigger trg_dd_followup_tasks_updated_at before update on public.dd_followup_tasks for each row execute function public.set_updated_at();
  end if;
end $$;

-- Auto follow-up task for universal estimates.
create or replace function public.create_dd_estimate_review_task()
returns trigger
language plpgsql
set search_path = public, pg_temp
as $$
begin
  insert into public.dd_followup_tasks (lead_id, estimate_id, division_slug, task_type, status, due_at, notes)
  values (
    new.lead_id,
    new.id,
    new.division_slug,
    'review_' || new.division_slug || '_estimate',
    'open',
    now() + interval '2 hours',
    'Review new ' || new.division_slug || ' estimate request, confirm scope, pricing, travel/pass-through fees, and send quote or follow-up questions.'
  );
  return new;
end;
$$;

DO $$
begin
  if not exists (select 1 from pg_trigger where tgname = 'trg_create_dd_estimate_review_task') then
    create trigger trg_create_dd_estimate_review_task after insert on public.dd_estimates for each row execute function public.create_dd_estimate_review_task();
  end if;
end $$;

-- Storage bucket for universal DDOS estimate media.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'dd-estimate-media',
  'dd-estimate-media',
  false,
  104857600,
  array['image/jpeg','image/png','image/webp','image/heic','image/heif','video/mp4','video/quicktime','audio/mpeg','audio/mp4','audio/wav','application/pdf','text/csv','application/vnd.openxmlformats-officedocument.spreadsheetml.sheet','application/msword','application/vnd.openxmlformats-officedocument.wordprocessingml.document']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- Seed package catalog. This is the missing all-division package layer; existing FieldOps package tables are preserved.
insert into public.dd_service_packages (division_slug, package_slug, package_name, outcome_label, category, locked_price, starting_price, typical_min, typical_max, pricing_model, deposit_type, deposit_value, scope_included, addon_notes, exclusions, status_boundary, is_public, sort_order)
values
('fieldops','standard_cleaning','Standard Cleaning','Home Ready','cleaning',275,275,275,375,'fixed','policy',null,array['Accessible dusting','Vacuum/sweep/mop','Kitchen counters and exterior appliance wipe-down','Bathroom cleaning','Mirrors','Trash removal','General straightening'],array['Interior appliances','Carpet extraction','Wall washing'],array['Heavy buildup','Trash-out','Hazardous conditions','Repairs'],'Locked',true,10),
('fieldops','deep_cleaning','Deep Cleaning','Deep Clean Ready','cleaning',425,425,425,650,'fixed','policy',null,array['Standard cleaning scope','Baseboards','Doors and frames','Window sills','Ceiling fans','Cabinet fronts','Detailed bathroom scrubbing','Detailed kitchen cleaning'],array['Appliance interiors','Carpet extraction','Tile/grout'],array['Hazardous material','Licensed remediation','Repairs'],'Locked',true,20),
('fieldops','move_out_cleaning','Move-Out Cleaning','Move-Out Ready','cleaning',300,300,300,750,'starting_at','policy',null,array['Kitchen and bathrooms','Floors','Visible surfaces','Move-out readiness checklist','Basic completion notes'],array['Oven','Fridge','Carpet','Walls','Appliance pull-out'],array['Heavy trash','Large furniture moving','Pest/hazardous issues'],'Locked',true,30),
('fieldops','property_reset','Full Property Reset','Property Reset Ready','property',500,500,500,1500,'starting_at','policy',null,array['Deep cleaning plan','Room-by-room reset priorities','Appliance/detail options','Before/after documentation','Add-on coordination'],array['Trash bagging','Photo report','Steam detail','Organization'],array['Licensed repairs','Hazardous remediation','Guaranteed occupancy approval'],'Locked',true,40),
('propertyops','turnover_scout','Turnover Scout','Readiness Checked','property',125,125,null,null,'fixed','paid_in_full',null,array['One local walkthrough','Basic photos','Issue notes','Readiness blockers','Same-day summary'],array['Detailed report','After-hours','Mileage'],array['Cleaning','Hauling','Repair work','Vendor payment'],'Locked',true,100),
('propertyops','turnover_ready_standard','Turnover Ready Standard','Turnover Ready','property',650,650,null,null,'fixed','percent',50,array['Expanded turnover coordination','Before/after documentation','Light admin coordination','Vendor handoff','Final readiness report'],array['Extra room/unit','Weekend/rush','Supplies'],array['Licensed trades','Heavy trash-out','Guaranteed occupancy approval'],'Locked',true,110),
('propertyops','move_in_move_out_photo_report','Move-In / Move-Out Photo Report','Photo Report Ready','documentation',150,150,null,null,'fixed','paid_in_full',null,array['Structured photo capture','Room-by-room labels','Basic condition notes','PDF summary'],array['Additional unit','Detailed notes'],array['Formal inspection certification','Repair estimates'],'Locked',true,120),
('docops','quick_admin_rescue','Quick Admin Rescue','Admin Rescue','admin',125,125,null,null,'fixed','paid_in_full',null,array['Up to 90 minutes admin cleanup','Document sorting','Email/script prep','Task triage'],array['Extra 30 minutes','Same-day'],array['Complex filing','Legal advice','Large document sets'],'Locked',true,200),
('docops','document_organization_pack','Document Organization Pack','Documents Organized','documents',225,225,null,null,'fixed','percent',50,array['Sort, label, and organize up to 50 digital/scanned items','Clean folder/index structure'],array['Additional 25 items','Scan/print pass-through'],array['Document creation beyond simple labels/index'],'Locked',true,210),
('docops','standard_document_prep_pack','Standard Document Prep Pack','Submission Ready','document_prep',275,275,null,null,'fixed','percent',50,array['Prepare, format, assemble, and proof one standard packet up to 15 pages from client-provided content'],array['Additional 10 pages','Revisions after approval'],array['Legal drafting','Legal advice','Representation'],'Locked',true,220),
('docops','i9_verification_appointment','I-9 Verification Appointment','Employment Verification Ready','i9',95,95,null,null,'fixed','paid_in_full',null,array['Appointment coordination','Identity-document review support','Employer instruction handling','Completion handoff'],array['Extra employee same visit','Travel/rush fees'],array['Employer legal compliance decisions','HR advice'],'Conditional lock',true,230),
('docops','apostille_facilitation_pack','Apostille Facilitation Pack','Apostille Ready','apostille',150,150,null,null,'pass_through','percent',50,array['Document readiness review','Apostille instruction checklist','Submission coordination','Return tracking'],array['Courier/postage','Rush','Additional document','State/courier fees'],array['Authentication guarantee','Legal advice','Translation unless quoted'],'Conditional lock',true,240),
('courierops','local_field_visit','Local Field Visit','Field Visit Complete','field',95,95,null,null,'fixed','paid_in_full',null,array['One local site visit for check, pickup, delivery, photo, or confirmation task within base area'],array['Mileage','Extra stop','Wait time'],array['Transporting people','Hazardous items','Regulated goods'],'Locked',true,300),
('courierops','document_courier_run','Document Courier Run','Documents Delivered','courier',95,95,null,null,'minimum','paid_in_full',null,array['Pickup/drop-off of documents or small business items','Proof-of-delivery note'],array['Additional stop','Mileage','Parking','Tolls','Wait time'],array['Courier insurance claims','Medical specimens','People transport'],'Locked',true,310),
('courierops','supply_run','Supply Run','Supplies Delivered','field',125,125,null,null,'pass_through','paid_in_full',null,array['Pickup/purchase coordination from approved list','Delivery','Receipt photo','Completion note'],array['Large/heavy items','Multiple stores','Mileage','Reimbursement'],array['Unapproved purchases','Large hauling'],'Locked',true,320),
('eventops','event_admin_planning_pack','Event Admin Planning Pack','Event Admin Ready','events',275,275,null,null,'fixed','percent',50,array['Event checklist','Vendor/contact sheet','Supply list','Timeline','Day-of task map'],array['Extra revision','Flyer/QR'],array['Venue booking','Permits','Purchases'],'Locked',true,400),
('eventops','setup_breakdown_support','Setup / Breakdown Support','Setup Complete','events',450,450,null,null,'minimum','percent',50,array['Up to 3 hours setup/breakdown support','Tables','Signage','Packets','Guest flow','Cleanup coordination'],array['Extra hour','Heavy lifting/vendor labor'],array['Large equipment rental','Janitorial deep clean'],'Locked',true,410),
('eventops','day_of_coordination','Day-Of Coordination','Event Day Ready','events',1250,1250,null,null,'fixed','percent',40,array['Timeline management','Vendor check-in','Client updates','Guest flow support','Issue log','End-of-event handoff'],array['Extra hour','Assistant support by quote'],array['Wedding planner liability','Permits','Security','Alcohol','Licensed services'],'Locked',true,420),
('productops','single_custom_item','Single Custom Item','Custom Item Ready','production',25,25,null,null,'minimum','paid_in_full',null,array['One approved design placement','Standard press','Pickup-ready item when blank is provided/approved'],array['Extra item','Blank garment','Extra placement','Rush'],array['Artwork creation beyond simple setup'],'Locked',true,500),
('productops','small_batch_12_shirts','Small Batch - 12 Shirts','Small Batch Ready','production',300,300,null,null,'fixed','materials_plus_percent',50,array['Up to 12 standard shirts','One design','One placement','Production checklist','Pickup packaging'],array['Extra placement','Design cleanup'],array['Specialty garments','Shipping','Unapproved artwork'],'Locked',true,510),
('productops','event_merch_batch_50_shirts','Event Merch Batch - 50 Shirts','Event Merch Ready','production',1050,1050,null,null,'fixed','percent',60,array['Up to 50 standard event shirts','Order intake sheet','Proof approval','Production plan','Batch packaging'],array['Names/numbers','Rush'],array['Complex fulfillment','Shipping','Inventory storage'],'Locked',true,520),
('vendorops','vendor_readiness_audit','Vendor Readiness Audit','Vendor Ready','vendor',350,350,null,null,'fixed','percent',50,array['Review current readiness','Missing docs','Risk flags','Contact strategy','Next-action checklist'],array['Folder cleanup','Advisor question list'],array['Legal advice','Tax advice','Insurance advice','Certification advice'],'Locked',true,600),
('vendorops','capability_statement_refresh','Capability Statement Refresh','Capability Ready','vendor',425,425,null,null,'fixed','percent',50,array['One-page capability statement refresh','Safer positioning','Service language','NAICS notes','PDF-ready copy'],array['Second version','Design polish'],array['Certification claims unless confirmed'],'Locked',true,610),
('vendorops','portal_profile_buildout_support','Portal Profile Buildout Support','Portal Ready','vendor',550,550,null,null,'fixed','percent',50,array['Profile fields','Service wording','Upload checklist','Submission-readiness review for one vendor portal'],array['Additional portal','Rush'],array['Representing unconfirmed certifications or insurance'],'Locked',true,620),
('govops','subcontractor_outreach_starter','Subcontractor Outreach Starter','Subcontractor Outreach Ready','govcon',650,650,null,null,'fixed','percent',50,array['Target list structure','Outreach script','Follow-up tracker','Capability statement attachment plan','10-message starter set'],array['Additional 10 messages'],array['Guaranteed contract award','Legal review'],'Locked',true,700),
('businessops','operations_reset_sprint','Operations Reset Sprint','Operations Ready','operations',450,450,null,null,'fixed','percent',50,array['Focused cleanup of operating priorities','Admin backlog map','Service-lane cleanup','7-day action list'],array['Extra meeting','Rush','Additional tracker'],array['Legal advice','Tax advice','Insurance advice','Bookkeeping advice'],'Locked',true,800),
('businessops','sop_tracker_bundle','SOP + Tracker Bundle','System Ready','operations',650,650,null,null,'fixed','percent',50,array['One SOP','One working tracker','Intake fields','Status definitions','Handoff checklist'],array['Additional SOP','Automation map'],array['Live software setup unless quoted'],'Locked',true,810),
('businessops','monthly_hq_core','Monthly HQ Support - Core','Operations Supported','retainer',1250,1250,null,null,'monthly','first_month',null,array['Up to 12 hours/month','Weekly priority review','CRM/follow-up support','Packets','Operations cleanup'],array['Additional hours','Extra meeting'],array['Live sales guarantee','Legal/tax advice','Staffing'],'Locked',true,820)
on conflict (division_slug, package_slug) do update set
  package_name = excluded.package_name,
  outcome_label = excluded.outcome_label,
  category = excluded.category,
  locked_price = excluded.locked_price,
  starting_price = excluded.starting_price,
  typical_min = excluded.typical_min,
  typical_max = excluded.typical_max,
  pricing_model = excluded.pricing_model,
  deposit_type = excluded.deposit_type,
  deposit_value = excluded.deposit_value,
  scope_included = excluded.scope_included,
  addon_notes = excluded.addon_notes,
  exclusions = excluded.exclusions,
  status_boundary = excluded.status_boundary,
  is_public = excluded.is_public,
  is_active = true,
  sort_order = excluded.sort_order,
  updated_at = now();

-- Seed add-ons across divisions.
insert into public.dd_service_addons (division_slug, addon_slug, addon_name, category, pricing_type, base_price, min_price, max_price, unit_label, inventory_used, applies_to_packages, quote_notes, sort_order)
values
('global','rush_same_day_next_day','Same-Day / Next-Day Rush','rush','percent',25,75,null,'project',array['schedule priority'],ARRAY[]::text[],'Default rush is 25% or $75 minimum unless package says otherwise.',10),
('global','weekend_after_hours','Weekend / After-Hours','rush','percent',20,null,null,'project',array['schedule priority'],ARRAY[]::text[],'Default weekend/after-hours fee is 20% unless package says otherwise.',20),
('global','travel_mileage_parking_tolls','Travel, Mileage, Parking & Tolls','travel','pass_through',null,null,null,'trip',array['vehicle','route tracking'],ARRAY[]::text[],'Metro Atlanta travel only included when package says so. Long distance requires review.',30),
('global','pass_through_costs','Pass-Through Costs','costs','pass_through',null,null,null,'cost',array['receipts'],ARRAY[]::text[],'Printing, postage, filing fees, supplies, vendor invoices, dump fees, rentals, platform fees, parking, and tolls billed separately unless included.',40),
('fieldops','inside_oven','Inside Oven Cleaning','appliances','flat',45,35,75,'oven',array['degreaser','drill brush','microfiber','scrapers/detail tools','PPE'],array['standard_cleaning','deep_cleaning','move_out_cleaning','property_reset'],'Increase for heavy grease or neglected ovens.',100),
('fieldops','inside_refrigerator','Inside Refrigerator Cleaning','appliances','flat',45,35,85,'refrigerator',array['microfiber','sanitizer','detail brushes','PPE'],array['standard_cleaning','deep_cleaning','move_out_cleaning','property_reset'],'Client must remove food unless cleanout is quoted.',110),
('fieldops','appliance_pullout_cleaning','Pull-Out Appliance Cleaning','appliances','range',null,75,175,'appliance',array['degreaser','microfiber','drill brush','mop system','PPE'],array['deep_cleaning','move_out_cleaning','property_reset'],'Behind/around appliances when safely movable.',120),
('fieldops','baseboards_detail','Baseboards Detail Cleaning','detail','range',null,60,180,'home',array['microfiber system','extension tools','drill brush','PPE'],array['deep_cleaning','move_out_cleaning','property_reset'],'Depends on size, buildup, and accessibility.',130),
('fieldops','wall_washing','Wall Washing / Spot Cleaning','detail','range',null,75,250,'area',array['microfiber mop system','portable rinse tool when available','gentle cleaner','PPE'],array['deep_cleaning','property_reset'],'Spot test required. Excludes repainting and damage repair.',140),
('fieldops','carpet_extraction_room','Carpet Extraction','floors','per_room',75,65,125,'room/area',array['Bissell carpet extractor','carpet cleaner solution','carpet rake','air mover','PPE'],array['move_out_cleaning','property_reset'],'Minimum may apply. Pet odor/stains separate.',150),
('fieldops','steam_detailing','Steam Detail Cleaning','detail','per_hour',85,85,250,'hour',array['steam cleaner','steam attachments','detail brushes','microfiber','PPE'],array['deep_cleaning','property_reset'],'For safe hard surfaces, crevices, grout lines, bathrooms, tracks.',160),
('fieldops','tile_grout_detail','Tile & Grout Detail Cleaning','floors','range',null,100,350,'area',array['steam cleaner','drill brush','grout brush','degreaser','PPE'],array['deep_cleaning','property_reset'],'Not resurfacing or restoration. Spot test required.',170),
('fieldops','pet_odor_treatment','Pet Odor Treatment','odor','range',null,75,250,'area',array['OdoBan','enzyme/deodorizer','carpet extractor','PPE'],array['deep_cleaning','property_reset','move_out_cleaning'],'Treatment only. Severe contamination requires review.',180),
('fieldops','organization_area','Organization Reset','organization','per_hour',75,75,300,'hour',array['organization bins','labels','microfiber','trash bags'],array['property_reset'],'Pantry, closet, laundry, office, playroom, or general space reset.',190),
('fieldops','photo_report','Before & After Photo Report','documentation','flat',125,75,225,'report',array['phone camera','checklist','PDF workflow'],array['property_reset'],'Useful for managers, landlords, hosts, and vendors.',200),
('docops','additional_25_items','Additional 25 Documents/Items','documents','per_item',55,55,null,'25 items',array['computer','scanner','file system'],array['document_organization_pack'],'Additional digital/scanned items beyond included scope.',300),
('docops','additional_10_pages','Additional 10 Pages','documents','per_page',65,65,null,'10 pages',array['computer','printer/scanner'],array['standard_document_prep_pack'],'For document prep packets.',310),
('docops','additional_document_apostille','Additional Apostille Document','apostille','per_document',45,45,null,'document',array['document tracker','courier/postage'],array['apostille_facilitation_pack'],'State/courier fees separate.',320),
('courierops','extra_stop','Extra Stop','courier','per_stop',35,35,null,'stop',array['vehicle','route tracking'],ARRAY[]::text[],'Additional stop in same run.',400),
('courierops','wait_time_15_min','Wait Time','courier','per_item',25,25,null,'15 minutes',array['vehicle','route tracking'],ARRAY[]::text[],'Billed in 15-minute blocks.',410),
('eventops','extra_event_hour','Extra Event Hour','events','per_hour',95,85,125,'hour',array['event kit','checklist'],ARRAY[]::text[],'Rate depends on package.',500),
('eventops','flyer_qr_design','Flyer / QR Design','events','flat',95,95,null,'design',array['Canva','QR tools','color printer'],ARRAY[]::text[],'Flyer/QR insert for events or campaigns.',510),
('productops','extra_shirt_placement','Extra Shirt Placement','production','per_item',8,8,null,'item',array['heat press','DTF access'],ARRAY[]::text[],'Additional placement on garment.',600),
('productops','design_cleanup','Design Cleanup','production','flat',45,45,null,'design',array['Canva','design software'],ARRAY[]::text[],'Basic design cleanup only.',610),
('productops','names_numbers','Names / Numbers','production','per_item',8,8,null,'item',array['heat press','DTF access'],array['event_merch_batch_50_shirts'],'Add-on per item.',620),
('vendorops','additional_portal','Additional Vendor Portal','vendor','flat',225,225,null,'portal',array['computer','portal checklist'],array['portal_profile_buildout_support'],'Extra portal beyond included scope.',700),
('govops','additional_10_outreach_messages','Additional 10 Outreach Messages','govcon','flat',175,175,null,'10 messages',array['CRM','email scripts'],array['subcontractor_outreach_starter'],'Additional starter messages.',710),
('businessops','additional_hour_business','Additional Support Hour','business','per_hour',85,75,95,'hour',array['computer','CRM','tracking system'],ARRAY[]::text[],'Rate depends on retainer/package.',800)
on conflict (division_slug, addon_slug) do update set
  addon_name = excluded.addon_name,
  category = excluded.category,
  pricing_type = excluded.pricing_type,
  base_price = excluded.base_price,
  min_price = excluded.min_price,
  max_price = excluded.max_price,
  unit_label = excluded.unit_label,
  inventory_used = excluded.inventory_used,
  applies_to_packages = excluded.applies_to_packages,
  quote_notes = excluded.quote_notes,
  is_active = true,
  sort_order = excluded.sort_order,
  updated_at = now();

insert into public.dd_estimator_settings (setting_scope, division_slug, setting_key, setting_value, description)
values
('global','','deposit_policy','{"under_250":"paid_in_full","from_250_to_999_percent":50,"from_1000_up_percent":40,"custom_production_materials_due_before_start":true,"monthly_retainers":"first_month_due_to_start"}'::jsonb,'Global deposit policy from Dani Declares pricebook.'),
('global','','travel_policy','{"base_area":"Metro Atlanta","included_only_when_package_says_so":true,"per_mile_after_review":1.25,"parking_tolls_pass_through":true,"long_distance_requires_review":true}'::jsonb,'Travel/mileage/pass-through settings.'),
('global','','rush_policy','{"same_day_next_day_percent":25,"weekend_after_hours_percent":20,"minimum_rush_fee":75}'::jsonb,'Rush fee rules.'),
('global','','tax_policy','{"enabled":false,"rate":0,"label":"Tax disabled pending CPA/state review","notes":"Do not publicly calculate or collect tax until reviewed."}'::jsonb,'Tax setting intentionally disabled until review.'),
('global','','regulated_boundaries','{"do_not_quote":["legal advice","tax advice","insurance advice","HR compliance decisions","security","private investigation","transport of people","medical specimens","hazardous materials"],"review_required":["notary commission/service area","COI/insurance claims","vehicle/courier coverage","vendor certifications","taxability"]}'::jsonb,'Safety and compliance boundaries.'),
('division','fieldops','fieldops_inventory','{"equipment":["steam cleaner","carpet extractor","drill brush system","OdoBan","microfiber systems","mop systems","PPE","degreasers","organization bins","carpet rake","air mover","detail brushes","glass tools","Zep bottles/chemicals","Bissell carpet extractor"]}'::jsonb,'Confirmed FieldOps inventory for quote add-ons.'),
('division','productops','production_inventory','{"equipment":["heat press","DTF access","label printer","color laser printer","sticker production capability","Canva"]}'::jsonb,'Confirmed production inventory.')
on conflict (setting_scope, division_slug, setting_key) do update set
  setting_value = excluded.setting_value,
  description = excluded.description,
  is_active = true,
  updated_at = now();

-- RLS. Public reads catalog/settings and submits estimate objects. No public select on submitted client data.
alter table public.dd_service_packages enable row level security;
alter table public.dd_service_addons enable row level security;
alter table public.dd_estimator_settings enable row level security;
alter table public.dd_estimates enable row level security;
alter table public.dd_estimate_packages enable row level security;
alter table public.dd_estimate_addons enable row level security;
alter table public.dd_estimate_media enable row level security;
alter table public.dd_travel_calculations enable row level security;
alter table public.dd_jobs enable row level security;
alter table public.dd_job_tasks enable row level security;
alter table public.dd_invoices enable row level security;
alter table public.dd_followup_tasks enable row level security;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='dd_service_packages' AND policyname='Public can read active dd packages') THEN
    CREATE POLICY "Public can read active dd packages" ON public.dd_service_packages FOR SELECT USING (is_active = true AND is_public = true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='dd_service_addons' AND policyname='Public can read active dd addons') THEN
    CREATE POLICY "Public can read active dd addons" ON public.dd_service_addons FOR SELECT USING (is_active = true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='dd_estimator_settings' AND policyname='Public can read active dd settings') THEN
    CREATE POLICY "Public can read active dd settings" ON public.dd_estimator_settings FOR SELECT USING (is_active = true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='dd_estimates' AND policyname='Public can submit dd estimates') THEN
    CREATE POLICY "Public can submit dd estimates" ON public.dd_estimates FOR INSERT WITH CHECK (division_slug in ('docops','fieldops','courierops','eventops','productops','govops','vendorops','businessops','propertyops'));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='dd_estimate_packages' AND policyname='Public can submit dd estimate packages') THEN
    CREATE POLICY "Public can submit dd estimate packages" ON public.dd_estimate_packages FOR INSERT WITH CHECK (estimate_id is not null AND package_name is not null);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='dd_estimate_addons' AND policyname='Public can submit dd estimate addons') THEN
    CREATE POLICY "Public can submit dd estimate addons" ON public.dd_estimate_addons FOR INSERT WITH CHECK (estimate_id is not null AND addon_name is not null);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='dd_estimate_media' AND policyname='Public can submit dd estimate media metadata') THEN
    CREATE POLICY "Public can submit dd estimate media metadata" ON public.dd_estimate_media FOR INSERT WITH CHECK (estimate_id is not null AND bucket_id = 'dd-estimate-media');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='dd_travel_calculations' AND policyname='Public can submit dd travel calculations') THEN
    CREATE POLICY "Public can submit dd travel calculations" ON public.dd_travel_calculations FOR INSERT WITH CHECK (estimate_id is not null);
  END IF;
END $$;

-- Authenticated dashboard policies. These remain broad until real user/role mapping is introduced.
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='dd_estimates' AND policyname='Authenticated can manage dd estimates') THEN
    CREATE POLICY "Authenticated can manage dd estimates" ON public.dd_estimates FOR ALL TO authenticated USING (true) WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='dd_jobs' AND policyname='Authenticated can manage dd jobs') THEN
    CREATE POLICY "Authenticated can manage dd jobs" ON public.dd_jobs FOR ALL TO authenticated USING (true) WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='dd_job_tasks' AND policyname='Authenticated can manage dd job tasks') THEN
    CREATE POLICY "Authenticated can manage dd job tasks" ON public.dd_job_tasks FOR ALL TO authenticated USING (true) WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='dd_invoices' AND policyname='Authenticated can manage dd invoices') THEN
    CREATE POLICY "Authenticated can manage dd invoices" ON public.dd_invoices FOR ALL TO authenticated USING (true) WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='dd_followup_tasks' AND policyname='Authenticated can manage dd followup tasks') THEN
    CREATE POLICY "Authenticated can manage dd followup tasks" ON public.dd_followup_tasks FOR ALL TO authenticated USING (true) WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='dd_estimate_packages' AND policyname='Authenticated can manage dd estimate packages') THEN
    CREATE POLICY "Authenticated can manage dd estimate packages" ON public.dd_estimate_packages FOR ALL TO authenticated USING (true) WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='dd_estimate_addons' AND policyname='Authenticated can manage dd estimate addons') THEN
    CREATE POLICY "Authenticated can manage dd estimate addons" ON public.dd_estimate_addons FOR ALL TO authenticated USING (true) WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='dd_estimate_media' AND policyname='Authenticated can manage dd estimate media') THEN
    CREATE POLICY "Authenticated can manage dd estimate media" ON public.dd_estimate_media FOR ALL TO authenticated USING (true) WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='dd_travel_calculations' AND policyname='Authenticated can manage dd travel') THEN
    CREATE POLICY "Authenticated can manage dd travel" ON public.dd_travel_calculations FOR ALL TO authenticated USING (true) WITH CHECK (true);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='storage' AND tablename='objects' AND policyname='Public can upload dd estimate media') THEN
    CREATE POLICY "Public can upload dd estimate media" ON storage.objects FOR INSERT TO anon WITH CHECK (bucket_id = 'dd-estimate-media');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='storage' AND tablename='objects' AND policyname='Authenticated can manage dd estimate media files') THEN
    CREATE POLICY "Authenticated can manage dd estimate media files" ON storage.objects FOR ALL TO authenticated USING (bucket_id = 'dd-estimate-media') WITH CHECK (bucket_id = 'dd-estimate-media');
  END IF;
END $$;