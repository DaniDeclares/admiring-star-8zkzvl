create table if not exists public.dd_work_orders (
  id uuid primary key default gen_random_uuid(),
  work_order_number text not null unique,
  service_request_id uuid references public.service_requests(id) on delete set null,
  lead_id uuid references public.leads(id) on delete set null,
  service_id uuid references public.services(id) on delete set null,
  offer_sku text,
  service_name text not null,
  customer_name text,
  customer_email text,
  customer_phone text,
  organization_name text,
  service_address text,
  scope_notes text,
  customer_instructions text,
  provider_instructions text,
  provider_name text,
  provider_contact text,
  dispatch_method text not null default 'MANUAL_PHONE_EMAIL',
  status text not null default 'DRAFT',
  scheduled_start timestamptz,
  scheduled_end timestamptz,
  customer_price numeric(12,2),
  provider_pay_amount numeric(12,2),
  provider_compensation_basis text,
  materials_amount numeric(12,2) not null default 0,
  travel_amount numeric(12,2) not null default 0,
  rush_amount numeric(12,2) not null default 0,
  pass_through_amount numeric(12,2) not null default 0,
  dani_contribution numeric(12,2),
  completion_notes text,
  completion_evidence jsonb not null default '{}'::jsonb,
  qa_status text not null default 'NOT_STARTED',
  dispatched_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists dd_work_orders_request_idx on public.dd_work_orders(service_request_id);
create index if not exists dd_work_orders_status_idx on public.dd_work_orders(status);
create index if not exists dd_work_orders_sku_idx on public.dd_work_orders(offer_sku);

create or replace function public.dd_create_work_order_from_request(p_request_id uuid)
returns public.dd_work_orders
language plpgsql
security definer
set search_path = public
as $$
declare
  r public.service_requests;
  l public.leads;
  s public.services;
  wo public.dd_work_orders;
  next_num bigint;
begin
  select * into r from public.service_requests where id = p_request_id;
  if not found then raise exception 'SERVICE_REQUEST_NOT_FOUND'; end if;
  if r.lead_id is not null then select * into l from public.leads where id = r.lead_id; end if;
  if r.service_id is not null then select * into s from public.services where id = r.service_id; end if;
  select coalesce(max((substring(work_order_number from 5))::bigint),0)+1 into next_num from public.dd_work_orders where work_order_number ~ '^DDWO-[0-9]+$';
  insert into public.dd_work_orders (
    work_order_number, service_request_id, lead_id, service_id, offer_sku, service_name,
    customer_name, customer_email, customer_phone, organization_name, service_address,
    scope_notes, customer_instructions, provider_instructions, customer_price, status
  ) values (
    'DDWO-' || lpad(next_num::text,6,'0'), r.id, r.lead_id, r.service_id,
    s.sku, coalesce(s.name, r.service_needed, r.service_category, 'Service Request'),
    l.full_name, l.email, l.phone, l.organization_name, r.location_address,
    coalesce(r.request_details, r.service_needed), null, null, r.quote_amount, 'DRAFT'
  ) returning * into wo;
  return wo;
end;
$$;

revoke all on function public.dd_create_work_order_from_request(uuid) from public;
grant execute on function public.dd_create_work_order_from_request(uuid) to authenticated;