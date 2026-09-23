create table if not exists public.divisions (
  id bigint generated always as identity primary key,
  name text not null,
  slug text unique not null,
  created_at timestamptz default now()
);