create table if not exists public.dd_vendor_onboarding_documents (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid not null references auth.users(id) on delete cascade,
  onboarding_intake_id uuid null references public.dd_portal_onboarding_intakes(id) on delete set null,
  relationship_type text null,
  channel_code text null,
  document_type text not null default 'COMPANY_VENDOR_PACKET',
  original_filename text not null,
  storage_path text not null unique,
  mime_type text null,
  file_size_bytes bigint null,
  status text not null default 'SUBMITTED',
  reviewed_at timestamptz null,
  reviewed_by_user_id uuid null references auth.users(id) on delete set null,
  notes text null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_dd_vendor_onboarding_documents_user on public.dd_vendor_onboarding_documents(auth_user_id);
create index if not exists idx_dd_vendor_onboarding_documents_intake on public.dd_vendor_onboarding_documents(onboarding_intake_id);
alter table public.dd_vendor_onboarding_documents enable row level security;
drop policy if exists "vendor onboarding documents own insert" on public.dd_vendor_onboarding_documents;
drop policy if exists "vendor onboarding documents own select" on public.dd_vendor_onboarding_documents;
drop policy if exists "vendor onboarding documents own update" on public.dd_vendor_onboarding_documents;
create policy "vendor onboarding documents own insert" on public.dd_vendor_onboarding_documents for insert to authenticated with check (auth.uid() = auth_user_id);
create policy "vendor onboarding documents own select" on public.dd_vendor_onboarding_documents for select to authenticated using (auth.uid() = auth_user_id);
create policy "vendor onboarding documents own update" on public.dd_vendor_onboarding_documents for update to authenticated using (auth.uid() = auth_user_id) with check (auth.uid() = auth_user_id);
insert into storage.buckets (id, name, public) values ('dd-vendor-onboarding','dd-vendor-onboarding',false) on conflict (id) do update set public=false;
drop policy if exists "vendor onboarding storage insert own folder" on storage.objects;
drop policy if exists "vendor onboarding storage select own folder" on storage.objects;
drop policy if exists "vendor onboarding storage delete own folder" on storage.objects;
create policy "vendor onboarding storage insert own folder" on storage.objects for insert to authenticated with check (bucket_id='dd-vendor-onboarding' and (storage.foldername(name))[1]=auth.uid()::text);
create policy "vendor onboarding storage select own folder" on storage.objects for select to authenticated using (bucket_id='dd-vendor-onboarding' and (storage.foldername(name))[1]=auth.uid()::text);
create policy "vendor onboarding storage delete own folder" on storage.objects for delete to authenticated using (bucket_id='dd-vendor-onboarding' and (storage.foldername(name))[1]=auth.uid()::text);