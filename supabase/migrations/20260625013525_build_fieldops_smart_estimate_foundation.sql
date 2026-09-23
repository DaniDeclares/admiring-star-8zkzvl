-- Dani Declares FieldOps Smart Estimate Foundation
-- Builds the database layer for quote intake, media upload tracking, add-ons, travel, tax/fee settings, and follow-up workflow.

create extension if not exists pgcrypto with schema extensions;

-- 1) Configurable FieldOps package pricing
create table if not exists public.fieldops_packages (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  outcome_label text,
  starting_price numeric(10,2),
  typical_min numeric(10,2),
  typical_max numeric(10,2),
  deposit_type text not null default 'policy' check (deposit_type in ('paid_in_full','percent','flat','policy')),
  deposit_value numeric(10,2),
  description text,
  scope_included text[] not null default '{}',
  exclusions text[] not null default '{}',
  is_active boolean not null default true,
  sort_order integer not null default 100,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 2) Inventory-backed add-on catalog
create table if not exists public.fieldops_addons (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  category text not null default 'general',
  pricing_type text not null default 'flat' check (pricing_type in ('flat','range','per_room','per_window','per_bedroom','per_bathroom','per_hour','per_sqft','per_item','quote')),
  base_price numeric(10,2),
  min_price numeric(10,2),
  max_price numeric(10,2),
  unit_label text,
  inventory_used text[] not null default '{}',
  quote_notes text,
  is_active boolean not null default true,
  sort_order integer not null default 100,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 3) Estimator settings for mileage, rush, deposits, supplies, and tax toggle
create table if not exists public.fieldops_estimator_settings (
  id uuid primary key default gen_random_uuid(),
  setting_key text not null unique,
  setting_value jsonb not null default '{}'::jsonb,
  description text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 4) Smart estimate request header
create table if not exists public.fieldops_estimates (
  id uuid primary key default gen_random_uuid(),
  public_reference text not null unique default ('DD-FS-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 8))),
  lead_id uuid references public.leads(id) on delete set null,
  service_request_id uuid references public.service_requests(id) on delete set null,
  client_name text,
  client_phone text,
  client_email text,
  client_type text check (client_type is null or client_type in ('homeowner','renter','property_manager','realtor','investor','airbnb_host','contractor','business','other')),
  organization_name text,
  property_address text,
  city text,
  state text default 'GA',
  zip_code text,
  property_type text,
  bedrooms numeric(4,1),
  bathrooms numeric(4,1),
  square_feet integer,
  stories integer,
  occupied_status text,
  utilities_on boolean,
  pets_present boolean,
  smoking_or_odor boolean,
  condition_level text check (condition_level is null or condition_level in ('light','standard','heavy','severe','unknown')),
  timeline text,
  rush_requested boolean not null default false,
  requested_date date,
  access_notes text,
  parking_notes text,
  client_notes text,
  internal_notes text,
  estimate_status text not null default 'new' check (estimate_status in ('new','needs_review','estimated','sent','approved','declined','converted','closed')),
  priority text not null default 'normal' check (priority in ('low','normal','high','urgent')),
  base_subtotal numeric(10,2) not null default 0,
  addon_subtotal numeric(10,2) not null default 0,
  travel_fee numeric(10,2) not null default 0,
  rush_fee numeric(10,2) not null default 0,
  supplies_fee numeric(10,2) not null default 0,
  tax_amount numeric(10,2) not null default 0,
  estimated_total numeric(10,2) not null default 0,
  deposit_due numeric(10,2) not null default 0,
  quote_disclaimer text not null default 'Online estimate only. Final quote may change after photo/video review, walkthrough, access review, travel review, supply needs, scope changes, or hazardous/unsafe conditions.',
  source_slug text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 5) Selected packages per estimate
create table if not exists public.fieldops_estimate_packages (
  id uuid primary key default gen_random_uuid(),
  estimate_id uuid not null references public.fieldops_estimates(id) on delete cascade,
  package_id uuid references public.fieldops_packages(id) on delete set null,
  package_slug text,
  package_name text not null,
  quantity numeric(10,2) not null default 1,
  unit_price numeric(10,2) not null default 0,
  line_total numeric(10,2) not null default 0,
  notes text,
  created_at timestamptz not null default now()
);

-- 6) Selected add-ons per estimate
create table if not exists public.fieldops_estimate_addons (
  id uuid primary key default gen_random_uuid(),
  estimate_id uuid not null references public.fieldops_estimates(id) on delete cascade,
  addon_id uuid references public.fieldops_addons(id) on delete set null,
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

-- 7) Uploaded media metadata for photos/videos/audio notes
create table if not exists public.fieldops_estimate_media (
  id uuid primary key default gen_random_uuid(),
  estimate_id uuid not null references public.fieldops_estimates(id) on delete cascade,
  bucket_id text not null default 'fieldops-estimate-media',
  object_path text not null,
  media_type text not null check (media_type in ('photo','video','audio','document','other')),
  file_name text,
  mime_type text,
  file_size_bytes bigint,
  room_area text,
  client_caption text,
  internal_notes text,
  uploaded_by text not null default 'client',
  created_at timestamptz not null default now()
);

-- 8) Travel calculation records
create table if not exists public.fieldops_travel_calculations (
  id uuid primary key default gen_random_uuid(),
  estimate_id uuid not null references public.fieldops_estimates(id) on delete cascade,
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

-- 9) Estimate review/follow-up tasks
create table if not exists public.fieldops_estimate_tasks (
  id uuid primary key default gen_random_uuid(),
  estimate_id uuid not null references public.fieldops_estimates(id) on delete cascade,
  task_type text not null default 'review',
  status text not null default 'open' check (status in ('open','in_progress','done','cancelled')),
  due_at timestamptz,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Helpful indexes
create index if not exists idx_fieldops_estimates_status on public.fieldops_estimates(estimate_status);
create index if not exists idx_fieldops_estimates_created_at on public.fieldops_estimates(created_at desc);
create index if not exists idx_fieldops_estimates_phone on public.fieldops_estimates(client_phone);
create index if not exists idx_fieldops_estimates_email on public.fieldops_estimates(client_email);
create index if not exists idx_fieldops_estimate_media_estimate on public.fieldops_estimate_media(estimate_id);
create index if not exists idx_fieldops_estimate_tasks_status on public.fieldops_estimate_tasks(status, due_at);

-- Updated-at trigger helper
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_fieldops_packages_updated_at on public.fieldops_packages;
create trigger trg_fieldops_packages_updated_at before update on public.fieldops_packages for each row execute function public.set_updated_at();

drop trigger if exists trg_fieldops_addons_updated_at on public.fieldops_addons;
create trigger trg_fieldops_addons_updated_at before update on public.fieldops_addons for each row execute function public.set_updated_at();

drop trigger if exists trg_fieldops_estimator_settings_updated_at on public.fieldops_estimator_settings;
create trigger trg_fieldops_estimator_settings_updated_at before update on public.fieldops_estimator_settings for each row execute function public.set_updated_at();

drop trigger if exists trg_fieldops_estimates_updated_at on public.fieldops_estimates;
create trigger trg_fieldops_estimates_updated_at before update on public.fieldops_estimates for each row execute function public.set_updated_at();

drop trigger if exists trg_fieldops_estimate_tasks_updated_at on public.fieldops_estimate_tasks;
create trigger trg_fieldops_estimate_tasks_updated_at before update on public.fieldops_estimate_tasks for each row execute function public.set_updated_at();

-- Auto-create a review task when a new estimate is submitted
create or replace function public.create_fieldops_estimate_review_task()
returns trigger
language plpgsql
as $$
begin
  insert into public.fieldops_estimate_tasks (estimate_id, task_type, status, due_at, notes)
  values (new.id, 'review_new_estimate', 'open', now() + interval '2 hours', 'Review new FieldOps estimate request, inspect photos/videos, confirm travel, and send quote or follow-up questions.');
  return new;
end;
$$;

drop trigger if exists trg_create_fieldops_estimate_review_task on public.fieldops_estimates;
create trigger trg_create_fieldops_estimate_review_task after insert on public.fieldops_estimates for each row execute function public.create_fieldops_estimate_review_task();

-- Storage bucket for estimate media. Private bucket with public insert-only policy below.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'fieldops-estimate-media',
  'fieldops-estimate-media',
  false,
  104857600,
  array['image/jpeg','image/png','image/webp','image/heic','image/heif','video/mp4','video/quicktime','audio/mpeg','audio/mp4','audio/wav','application/pdf']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- Seed package pricing from the current Dani Declares Field Services strategy.
insert into public.fieldops_packages (slug, name, outcome_label, starting_price, typical_min, typical_max, deposit_type, deposit_value, description, scope_included, exclusions, sort_order)
values
('standard_cleaning', 'Standard Cleaning', 'Home Ready', 275, 275, 375, 'policy', null, 'General maintenance cleaning for homes needing a professional reset without heavy detail work.', array['Accessible dusting','Vacuum/sweep/mop','Kitchen counters and exterior appliance wipe-down','Bathroom cleaning','Mirrors','Trash removal','General straightening'], array['Heavy buildup','Interior appliances unless added','Walls','Carpet extraction','Trash-out','Hazardous conditions'], 10),
('deep_cleaning', 'Deep Cleaning', 'Deep Clean Ready', 425, 425, 650, 'policy', null, 'Detailed cleaning for buildup, neglected areas, and higher-effort spaces.', array['Standard cleaning scope','Baseboards','Doors and frames','Window sills','Ceiling fans','Cabinet fronts','Detailed bathroom scrubbing','Detailed kitchen cleaning'], array['Heavy trash-out','Repairs','Hazardous material','Licensed remediation'], 20),
('move_out_cleaning', 'Move-Out Cleaning', 'Move-Out Ready', 300, 300, 750, 'policy', null, 'Move-out/move-in cleaning for empty or nearly empty homes and apartments.', array['Kitchen and bathrooms','Floors','Visible surfaces','Move-out readiness checklist','Basic completion notes'], array['Heavy trash','Large furniture moving','Pest/hazardous issues','Repairs'], 30),
('property_reset', 'Full Property Reset', 'Property Reset Ready', 500, 500, 1500, 'policy', null, 'Higher-scope cleaning, organizing, detail work, and readiness support for properties that need more than basic cleaning.', array['Deep cleaning plan','Room-by-room reset priorities','Appliance/detail options','Before/after documentation','Add-on coordination'], array['Licensed repairs','Hazardous remediation','Guaranteed occupancy approval','Unapproved hauling'], 40),
('apartment_turnover', 'Apartment Turnover', 'Occupancy Ready', 375, 375, 950, 'policy', null, 'Turnover readiness support for property managers, leasing teams, and landlords.', array['Move-out readiness support','Cleaning/reset coordination','Photo documentation','Final issue notes'], array['Licensed trades','Inspection certification','Heavy trash-out unless quoted'], 50),
('airbnb_turnover', 'Airbnb / Short-Term Rental Turnover', 'Guest Ready', 150, 150, 450, 'policy', null, 'Guest-ready turnover support for hosts needing fast reset, restock notes, and photo confirmation.', array['Guest-ready cleaning','Linen/laundry add-on options','Restock notes','Photo report option'], array['Inventory purchasing unless approved','Repairs','Guest communication management unless quoted'], 60),
('inspection_photo_report', 'Inspection & Photo Documentation', 'Inspection Ready', 150, 150, 275, 'policy', null, 'Photo documentation and condition notes for move-in, move-out, vendor verification, or property status.', array['Structured photos','Room/area labels','Basic condition notes','Summary report option'], array['Licensed home inspection','Appraisal','Insurance adjusting','Legal conclusions'], 70)
on conflict (slug) do update set
  name = excluded.name,
  outcome_label = excluded.outcome_label,
  starting_price = excluded.starting_price,
  typical_min = excluded.typical_min,
  typical_max = excluded.typical_max,
  deposit_type = excluded.deposit_type,
  deposit_value = excluded.deposit_value,
  description = excluded.description,
  scope_included = excluded.scope_included,
  exclusions = excluded.exclusions,
  is_active = true,
  sort_order = excluded.sort_order,
  updated_at = now();

-- Seed inventory-backed add-ons. Pricing is estimate-starting guidance, final quote still needs review.
insert into public.fieldops_addons (slug, name, category, pricing_type, base_price, min_price, max_price, unit_label, inventory_used, quote_notes, sort_order)
values
('inside_oven', 'Inside Oven Cleaning', 'appliances', 'flat', 45, 35, 75, 'oven', array['degreaser','drill brush','microfiber','scrapers/detail tools','PPE'], 'Increase for heavy grease or neglected ovens.', 10),
('inside_refrigerator', 'Inside Refrigerator Cleaning', 'appliances', 'flat', 45, 35, 85, 'refrigerator', array['microfiber','sanitizer','detail brushes','PPE'], 'Client must remove food unless quoted as cleanout.', 20),
('appliance_pullout_cleaning', 'Pull-Out Appliance Cleaning', 'appliances', 'range', null, 75, 175, 'appliance', array['degreaser','microfiber','drill brush','mop system','PPE'], 'For cleaning behind/around fridge, stove, or washer/dryer when safely movable.', 30),
('cabinet_fronts', 'Cabinet Front Detail', 'kitchen', 'range', null, 50, 150, 'kitchen', array['degreaser','microfiber','detail brushes'], 'Based on cabinet quantity and buildup.', 40),
('cabinet_drawer_interiors', 'Cabinet & Drawer Interiors', 'kitchen', 'range', null, 75, 200, 'kitchen', array['vacuum','microfiber','sanitizer','detail brushes'], 'Client items must be removed unless organizing is added.', 50),
('baseboards_detail', 'Baseboards Detail Cleaning', 'detail', 'range', null, 60, 180, 'home', array['microfiber system','extension tools','drill brush','PPE'], 'Price depends on size, buildup, and accessibility.', 60),
('wall_washing', 'Wall Washing / Spot Cleaning', 'detail', 'range', null, 75, 250, 'area', array['microfiber mop system','portable shower/rinse tool when available','gentle cleaner','PPE'], 'Spot test required. Excludes repainting and damage repair.', 70),
('light_fixtures_fans', 'Light Fixtures & Ceiling Fans', 'detail', 'per_item', 20, 15, 45, 'fixture/fan', array['microfiber','extension duster','step stool','PPE'], 'Higher for delicate, high, or heavily dusty fixtures.', 80),
('window_interior_glass', 'Interior Window / Glass Cleaning', 'glass', 'per_window', 8, 6, 15, 'window', array['glass cleaner','window tool','microfiber'], 'Interior only unless exterior access is separately approved.', 90),
('sliding_glass_door', 'Sliding Glass Door Cleaning', 'glass', 'flat', 15, 10, 25, 'door', array['glass cleaner','microfiber','detail brush'], 'Includes glass surface; tracks may be separate if heavy.', 100),
('blind_cleaning', 'Blind Cleaning', 'detail', 'per_item', 8, 6, 15, 'blind', array['microfiber','detail brush','vacuum attachment'], 'Dust/wipe each slat. Heavy buildup may increase.', 110),
('carpet_extraction_room', 'Carpet Extraction', 'floors', 'per_room', 75, 65, 125, 'room/area', array['Bissell carpet extractor','carpet cleaner solution','carpet rake','air mover','PPE'], 'Minimum may apply. Pet odor/stains are separate.', 120),
('carpet_stairs', 'Carpeted Stairs Extraction', 'floors', 'range', null, 75, 175, 'staircase', array['Bissell carpet extractor','hand tool','carpet cleaner','PPE'], 'Price depends on stair count and soil level.', 130),
('pet_odor_treatment', 'Pet Odor Treatment', 'odor', 'range', null, 75, 250, 'area', array['OdoBan','enzyme/deodorizer','carpet extractor','PPE'], 'Treatment only. Severe contamination may require replacement/remediation.', 140),
('steam_detailing', 'Steam Detail Cleaning', 'detail', 'per_hour', 85, 85, 250, 'hour', array['steam cleaner','steam attachments','detail brushes','microfiber','PPE'], 'For crevices, grout lines, bathroom detail, tracks, and hard surfaces where safe.', 150),
('tile_grout_detail', 'Tile & Grout Detail Cleaning', 'floors', 'range', null, 100, 350, 'area', array['steam cleaner','drill brush','grout brush','degreaser','PPE'], 'Not resurfacing or restoration. Spot test required.', 160),
('bathroom_heavy_buildup', 'Heavy Bathroom Buildup Detail', 'bathroom', 'range', null, 75, 225, 'bathroom', array['steam cleaner','CLR/mineral cleaner','drill brush','scrub pads','PPE'], 'For soap scum, mildew staining, mineral buildup, and detail work. Not mold remediation.', 170),
('organization_area', 'Organization Reset', 'organization', 'per_hour', 75, 75, 300, 'hour', array['organization bins','labels','microfiber','trash bags'], 'For pantry, closet, laundry, office, playroom, or general space reset.', 180),
('trash_bagging_light', 'Light Trash Bagging', 'trash', 'range', null, 50, 150, 'area', array['heavy duty trash bags','gloves','PPE'], 'Bagging only. Hauling/dump fees separate.', 190),
('trashout_coordination', 'Trash-Out Coordination', 'trash', 'quote', null, 225, null, 'project', array['trash bags','photo documentation','vendor coordination'], 'Base coordination starts at $225 plus labor/vendor/dump fees.', 200),
('photo_report', 'Before & After Photo Report', 'documentation', 'flat', 125, 75, 225, 'report', array['phone camera','checklist','PDF report workflow'], 'Useful for property managers, landlords, hosts, and vendors.', 210),
('supply_run', 'Supply Run / Restock Support', 'logistics', 'flat', 125, 95, 175, 'run', array['vehicle','receipt tracking','bags/bins'], 'Reimbursement required for supplies. Multiple stores or heavy items extra.', 220),
('same_day_rush', 'Same-Day / Next-Day Rush', 'rush', 'range', null, 75, 250, 'project', array['schedule priority'], 'May also calculate as 25% of scope depending on job size.', 230)
on conflict (slug) do update set
  name = excluded.name,
  category = excluded.category,
  pricing_type = excluded.pricing_type,
  base_price = excluded.base_price,
  min_price = excluded.min_price,
  max_price = excluded.max_price,
  unit_label = excluded.unit_label,
  inventory_used = excluded.inventory_used,
  quote_notes = excluded.quote_notes,
  is_active = true,
  sort_order = excluded.sort_order,
  updated_at = now();

-- Seed estimator settings. Tax is intentionally disabled until CPA/state review.
insert into public.fieldops_estimator_settings (setting_key, setting_value, description)
values
('deposit_policy', '{"under_250":"paid_in_full","from_250_to_999_percent":50,"from_1000_up_percent":40,"custom_supplies_due_before_start":true}'::jsonb, 'Locked deposit policy from Dani Declares pricebook.'),
('travel_policy', '{"base_area":"Metro Atlanta","included_miles":15,"base_fee":0,"per_mile_after_included":1.25,"parking_tolls_pass_through":true,"long_distance_requires_review":true}'::jsonb, 'Travel/gas fee settings for FieldOps estimator. Update after official mileage review.'),
('rush_policy', '{"same_day_percent":25,"next_day_percent":25,"weekend_after_hours_percent":20,"minimum_rush_fee":75}'::jsonb, 'Rush fee rules for estimator.'),
('supplies_policy', '{"standard_supplies_included":true,"special_supplies_pass_through":true,"dumpster_vendor_fees_pass_through":true,"client_requested_products_client_paid":true}'::jsonb, 'Supplies and material pass-through logic.'),
('tax_policy', '{"enabled":false,"rate":0,"label":"Tax disabled pending CPA/state review","notes":"Do not publicly calculate or collect tax until reviewed."}'::jsonb, 'Configurable tax setting. Disabled by default for compliance review.'),
('media_policy', '{"bucket":"fieldops-estimate-media","max_file_size_mb":100,"accepted_types":["jpg","png","webp","heic","mp4","mov","mp3","wav","pdf"],"public_read":false}'::jsonb, 'Photo, video, audio, and document upload policy.')
on conflict (setting_key) do update set
  setting_value = excluded.setting_value,
  description = excluded.description,
  is_active = true,
  updated_at = now();

-- Enable RLS
alter table public.fieldops_packages enable row level security;
alter table public.fieldops_addons enable row level security;
alter table public.fieldops_estimator_settings enable row level security;
alter table public.fieldops_estimates enable row level security;
alter table public.fieldops_estimate_packages enable row level security;
alter table public.fieldops_estimate_addons enable row level security;
alter table public.fieldops_estimate_media enable row level security;
alter table public.fieldops_travel_calculations enable row level security;
alter table public.fieldops_estimate_tasks enable row level security;

-- Public read of active catalog/settings for website estimator.
do $$
begin
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='fieldops_packages' and policyname='Public can read active fieldops packages') then
    create policy "Public can read active fieldops packages" on public.fieldops_packages for select using (is_active = true);
  end if;
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='fieldops_addons' and policyname='Public can read active fieldops addons') then
    create policy "Public can read active fieldops addons" on public.fieldops_addons for select using (is_active = true);
  end if;
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='fieldops_estimator_settings' and policyname='Public can read active fieldops settings') then
    create policy "Public can read active fieldops settings" on public.fieldops_estimator_settings for select using (is_active = true);
  end if;
end $$;

-- Public insert only for intake submission. No public read policies on submitted estimates/media/tasks.
do $$
begin
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='fieldops_estimates' and policyname='Public can submit fieldops estimates') then
    create policy "Public can submit fieldops estimates" on public.fieldops_estimates for insert with check (true);
  end if;
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='fieldops_estimate_packages' and policyname='Public can submit fieldops estimate packages') then
    create policy "Public can submit fieldops estimate packages" on public.fieldops_estimate_packages for insert with check (true);
  end if;
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='fieldops_estimate_addons' and policyname='Public can submit fieldops estimate addons') then
    create policy "Public can submit fieldops estimate addons" on public.fieldops_estimate_addons for insert with check (true);
  end if;
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='fieldops_estimate_media' and policyname='Public can submit fieldops media metadata') then
    create policy "Public can submit fieldops media metadata" on public.fieldops_estimate_media for insert with check (true);
  end if;
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='fieldops_travel_calculations' and policyname='Public can submit fieldops travel calculations') then
    create policy "Public can submit fieldops travel calculations" on public.fieldops_travel_calculations for insert with check (true);
  end if;
end $$;

-- Authenticated user management policies for dashboard/admin use.
do $$
begin
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='fieldops_estimates' and policyname='Authenticated can manage fieldops estimates') then
    create policy "Authenticated can manage fieldops estimates" on public.fieldops_estimates for all to authenticated using (true) with check (true);
  end if;
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='fieldops_estimate_packages' and policyname='Authenticated can manage fieldops estimate packages') then
    create policy "Authenticated can manage fieldops estimate packages" on public.fieldops_estimate_packages for all to authenticated using (true) with check (true);
  end if;
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='fieldops_estimate_addons' and policyname='Authenticated can manage fieldops estimate addons') then
    create policy "Authenticated can manage fieldops estimate addons" on public.fieldops_estimate_addons for all to authenticated using (true) with check (true);
  end if;
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='fieldops_estimate_media' and policyname='Authenticated can manage fieldops media metadata') then
    create policy "Authenticated can manage fieldops media metadata" on public.fieldops_estimate_media for all to authenticated using (true) with check (true);
  end if;
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='fieldops_travel_calculations' and policyname='Authenticated can manage fieldops travel calculations') then
    create policy "Authenticated can manage fieldops travel calculations" on public.fieldops_travel_calculations for all to authenticated using (true) with check (true);
  end if;
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='fieldops_estimate_tasks' and policyname='Authenticated can manage fieldops estimate tasks') then
    create policy "Authenticated can manage fieldops estimate tasks" on public.fieldops_estimate_tasks for all to authenticated using (true) with check (true);
  end if;
end $$;

-- Storage policies. Public can upload to bucket but cannot read/list files. Authenticated can manage for dashboard/admin.
do $$
begin
  if not exists (select 1 from pg_policies where schemaname='storage' and tablename='objects' and policyname='Public can upload fieldops estimate media') then
    create policy "Public can upload fieldops estimate media" on storage.objects for insert to anon with check (bucket_id = 'fieldops-estimate-media');
  end if;
  if not exists (select 1 from pg_policies where schemaname='storage' and tablename='objects' and policyname='Authenticated can manage fieldops estimate media') then
    create policy "Authenticated can manage fieldops estimate media" on storage.objects for all to authenticated using (bucket_id = 'fieldops-estimate-media') with check (bucket_id = 'fieldops-estimate-media');
  end if;
end $$;