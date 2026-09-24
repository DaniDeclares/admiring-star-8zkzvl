
create table if not exists public.dd_partner_inquiries(
 id uuid primary key default gen_random_uuid(),
 name text not null,
 email text not null,
 phone text,
 interest_area text,
 message text,
 status text not null default 'NEW',
 source text not null default 'WEBSITE_PARTNER_NETWORK',
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now()
);
alter table public.dd_partner_inquiries enable row level security;
comment on table public.dd_partner_inquiries is 'Non-customer provider/partner inquiries. Deliberately isolated from service requests, quotes, bookings and jobs.';
