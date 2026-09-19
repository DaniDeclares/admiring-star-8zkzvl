create table if not exists public.dd_vendor_onboarding_documents (
  id uuid primary key default gen_random_uuid(),
  onboarding_intake_id uuid references public.dd_portal_onboarding_intakes(id) on delete cascade,
  auth_user_id uuid not null references auth.users(id) on delete cascade,
  organization_name text,
  document_type text not null default 'COMPANY_VENDOR_PACKET',
  original_filename text not null,
  storage_path text not null unique,
  mime_type text,
  file_size_bytes bigint,
  status text not null default 'SUBMITTED' check (status in ('SUBMITTED','UNDER_REVIEW','REVIEWED','ACTION_REQUIRED','ARCHIVED')),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_dd_vendor_onboarding_docs_intake on public.dd_vendor_onboarding_documents(onboarding_intake_id);
create index if not exists idx_dd_vendor_onboarding_docs_user on public.dd_vendor_onboarding_documents(auth_user_id);
alter table public.dd_vendor_onboarding_documents enable row level security;
insert into storage.buckets (id,name,public) values ('dd-vendor-onboarding','dd-vendor-onboarding',false) on conflict (id) do nothing;
create policy "vendor onboarding docs insert own" on public.dd_vendor_onboarding_documents for insert to authenticated with check (auth.uid() = auth_user_id);
create policy "vendor onboarding docs select own" on public.dd_vendor_onboarding_documents for select to authenticated using (auth.uid() = auth_user_id);
create policy "vendor onboarding storage insert own" on storage.objects for insert to authenticated with check (bucket_id = 'dd-vendor-onboarding' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "vendor onboarding storage select own" on storage.objects for select to authenticated using (bucket_id = 'dd-vendor-onboarding' and (storage.foldername(name))[1] = auth.uid()::text);