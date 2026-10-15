
create table if not exists public.dd_outbound_mailbox_policy (
  purpose text primary key,
  mailbox_address text not null,
  status text not null default 'ACTIVE',
  authority text not null,
  notes text,
  updated_at timestamptz not null default now()
);
alter table public.dd_outbound_mailbox_policy enable row level security;

insert into public.dd_outbound_mailbox_policy(
  purpose,mailbox_address,status,authority,notes
)
values(
  'SALES_OUTREACH',
  'danideclaresns@gmail.com',
  'ACTIVE',
  'OWNER_DIRECTIVE_2026-10-06',
  'Use danideclaresns@gmail.com for sales/follow-up outreach. Do not use Vendors@danideclares.com for this lane.'
)
on conflict(purpose) do update
set mailbox_address=excluded.mailbox_address,
    status='ACTIVE',
    authority=excluded.authority,
    notes=excluded.notes,
    updated_at=now();

update public.dd_sales_queue
set sales_metadata=coalesce(sales_metadata,'{}'::jsonb)
  || jsonb_build_object(
    'outbound_mailbox_policy',
    jsonb_build_object(
      'purpose','SALES_OUTREACH',
      'mailbox','danideclaresns@gmail.com',
      'vendors_mailbox_allowed',false,
      'authority','OWNER_DIRECTIVE_2026-10-06',
      'updated_at',now()
    )
  ),
  updated_at=now()
where suggested_sku in ('DNI-02A-003','DNI-02A-009','DNI-04A-019')
  and coalesce(do_not_contact,false)=false;
