-- Migration 001 (proposal): DDOS Interview Engine foundation tables
-- Blueprint v1.0 scope: dd_client_types, dd_service_outcomes, dd_intake_questions, dd_question_rules

begin;

create table if not exists public.dd_client_types (
  id bigint generated always as identity primary key,
  slug text not null unique,
  name text not null,
  description text,
  sort_order integer not null default 100,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint dd_client_types_slug_lower_chk check (slug = lower(slug))
);

create table if not exists public.dd_service_outcomes (
  id bigint generated always as identity primary key,
  slug text not null unique,
  name text not null,
  description text,
  sort_order integer not null default 100,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint dd_service_outcomes_slug_lower_chk check (slug = lower(slug))
);

create table if not exists public.dd_intake_questions (
  id bigint generated always as identity primary key,
  question_key text not null unique,
  prompt text not null,
  help_text text,
  response_type text not null,
  response_options jsonb not null default '[]'::jsonb,
  is_required boolean not null default false,
  sort_order integer not null default 100,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint dd_intake_questions_key_lower_chk check (question_key = lower(question_key)),
  constraint dd_intake_questions_response_type_chk check (
    response_type in (
      'short_text',
      'long_text',
      'number',
      'boolean',
      'single_select',
      'multi_select',
      'date',
      'datetime',
      'file',
      'dynamic_select'
    )
  )
);

create table if not exists public.dd_question_rules (
  id bigint generated always as identity primary key,
  question_id bigint not null references public.dd_intake_questions(id) on delete cascade,
  client_type_id bigint references public.dd_client_types(id) on delete cascade,
  service_outcome_id bigint references public.dd_service_outcomes(id) on delete cascade,
  depends_on_question_id bigint references public.dd_intake_questions(id) on delete set null,
  depends_on_operator text,
  depends_on_value jsonb,
  sort_order integer not null default 100,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint dd_question_rules_depends_on_operator_chk check (
    depends_on_operator is null
    or depends_on_operator in ('equals', 'not_equals', 'in', 'not_in', 'exists', 'not_exists', 'gte', 'lte')
  )
);

comment on column public.dd_client_types.updated_at is
  'Managed by application/admin updates; migration 001 intentionally does not add update triggers.';
comment on column public.dd_service_outcomes.updated_at is
  'Managed by application/admin updates; migration 001 intentionally does not add update triggers.';
comment on column public.dd_intake_questions.updated_at is
  'Managed by application/admin updates; migration 001 intentionally does not add update triggers.';
comment on column public.dd_question_rules.updated_at is
  'Managed by application/admin updates; migration 001 intentionally does not add update triggers.';

create index if not exists idx_dd_client_types_active_sort
  on public.dd_client_types (is_active, sort_order);

create index if not exists idx_dd_service_outcomes_active_sort
  on public.dd_service_outcomes (is_active, sort_order);

create index if not exists idx_dd_intake_questions_active_sort
  on public.dd_intake_questions (is_active, sort_order);

create index if not exists idx_dd_question_rules_active_sort
  on public.dd_question_rules (is_active, sort_order);

create index if not exists idx_dd_question_rules_question_id
  on public.dd_question_rules (question_id);

create index if not exists idx_dd_question_rules_client_type_id
  on public.dd_question_rules (client_type_id);

create index if not exists idx_dd_question_rules_service_outcome_id
  on public.dd_question_rules (service_outcome_id);

create index if not exists idx_dd_question_rules_depends_on_question_id
  on public.dd_question_rules (depends_on_question_id);

alter table public.dd_client_types enable row level security;
alter table public.dd_service_outcomes enable row level security;
alter table public.dd_intake_questions enable row level security;
alter table public.dd_question_rules enable row level security;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'dd_client_types'
      and policyname = 'dd_client_types_public_read_active'
  ) then
    create policy dd_client_types_public_read_active
      on public.dd_client_types
      for select
      to anon, authenticated
      using (is_active = true);
  end if;

  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'dd_service_outcomes'
      and policyname = 'dd_service_outcomes_public_read_active'
  ) then
    create policy dd_service_outcomes_public_read_active
      on public.dd_service_outcomes
      for select
      to anon, authenticated
      using (is_active = true);
  end if;

  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'dd_intake_questions'
      and policyname = 'dd_intake_questions_public_read_active'
  ) then
    create policy dd_intake_questions_public_read_active
      on public.dd_intake_questions
      for select
      to anon, authenticated
      using (is_active = true);
  end if;

  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'dd_question_rules'
      and policyname = 'dd_question_rules_public_read_active'
  ) then
    create policy dd_question_rules_public_read_active
      on public.dd_question_rules
      for select
      to anon, authenticated
      using (is_active = true);
  end if;
end
$$;

insert into public.dd_client_types (slug, name, sort_order, is_active)
values
  ('individual-family', 'Individual / Family', 10, true),
  ('business', 'Business', 20, true),
  ('property-manager', 'Property Manager', 30, true),
  ('apartment-community', 'Apartment Community', 40, true),
  ('hoa', 'HOA', 50, true),
  ('realtor-real-estate-brokerage', 'Realtor / Real Estate Brokerage', 60, true),
  ('law-firm', 'Law Firm', 70, true),
  ('title-company', 'Title Company', 80, true),
  ('government-agency', 'Government Agency', 90, true),
  ('healthcare-facility', 'Healthcare Facility', 100, true),
  ('school-university', 'School / University', 110, true),
  ('vendor-subcontractor', 'Vendor / Subcontractor', 120, true),
  ('other', 'Other', 999, true)
on conflict (slug) do update
set
  name = excluded.name,
  sort_order = excluded.sort_order,
  is_active = excluded.is_active;

insert into public.dd_service_outcomes (slug, name, sort_order, is_active)
values
  ('prepare-a-property', 'Prepare a property', 10, true),
  ('clean-a-property', 'Clean a property', 20, true),
  ('reset-turn-over-a-unit', 'Reset / turn over a unit', 30, true),
  ('handle-documents', 'Handle documents', 40, true),
  ('notarize-documents', 'Notarize documents', 50, true),
  ('apostille-authentication', 'Apostille / authentication', 60, true),
  ('deliver-documents-or-items', 'Deliver documents or items', 70, true),
  ('plan-or-execute-an-event', 'Plan or execute an event', 80, true),
  ('create-products-or-branded-materials', 'Create products / branded materials', 90, true),
  ('prepare-business-systems', 'Prepare business systems', 100, true),
  ('vendor-readiness', 'Vendor readiness', 110, true),
  ('government-support', 'Government support', 120, true),
  ('custom-request', 'Custom request', 999, true)
on conflict (slug) do update
set
  name = excluded.name,
  sort_order = excluded.sort_order,
  is_active = excluded.is_active;

insert into public.dd_intake_questions (
  question_key,
  prompt,
  help_text,
  response_type,
  response_options,
  is_required,
  sort_order,
  is_active
)
values
  ('client_type', 'Who are you?', 'Select the customer type that best describes you.', 'dynamic_select', '[]'::jsonb, true, 10, true),
  ('desired_outcome', 'What are you trying to accomplish?', 'Choose the desired outcome for this request.', 'dynamic_select', '[]'::jsonb, true, 20, true),
  ('request_details', 'Tell us about this request.', 'Add details about the property, documents, delivery, event, or support needed.', 'long_text', '[]'::jsonb, true, 30, true),
  ('property_type', 'What type of property is this?', null, 'single_select', '["single_family","apartment_unit","townhome","commercial_office","retail","other"]'::jsonb, false, 40, true),
  ('square_footage', 'Approximate square footage', null, 'number', '[]'::jsonb, false, 50, true),
  ('occupancy_status', 'Is the property occupied or vacant?', null, 'single_select', '["occupied","vacant","partially_occupied"]'::jsonb, false, 60, true),
  ('turnover_deadline', 'What is the turnover deadline?', null, 'date', '[]'::jsonb, false, 70, true),
  ('move_in_date', 'What is the move-in date?', null, 'date', '[]'::jsonb, false, 80, true),
  ('access_method', 'How will access be provided?', null, 'single_select', '["lockbox","onsite_contact","leasing_office","key_pickup","other"]'::jsonb, false, 90, true),
  ('file_uploads', 'Upload files', 'Attach photos, videos, PDFs, inspection reports, COIs, W-9s, or related documents.', 'file', '[]'::jsonb, false, 100, true)
on conflict (question_key) do update
set
  prompt = excluded.prompt,
  help_text = excluded.help_text,
  response_type = excluded.response_type,
  response_options = excluded.response_options,
  is_required = excluded.is_required,
  sort_order = excluded.sort_order,
  is_active = excluded.is_active;

insert into public.dd_question_rules (
  question_id,
  client_type_id,
  service_outcome_id,
  depends_on_question_id,
  depends_on_operator,
  depends_on_value,
  sort_order,
  is_active
)
select
  q.id,
  null::bigint,
  null::bigint,
  null::bigint,
  null::text,
  null::jsonb,
  q.sort_order,
  true
from public.dd_intake_questions q
where q.question_key in ('client_type', 'desired_outcome', 'request_details', 'file_uploads')
and not exists (
  select 1
  from public.dd_question_rules r
  where r.question_id = q.id
    and r.client_type_id is null
    and r.service_outcome_id is null
    and r.depends_on_question_id is null
    and r.depends_on_operator is null
    and r.depends_on_value is null
);

with property_outcomes as (
  select id
  from public.dd_service_outcomes
  where slug in ('prepare-a-property', 'clean-a-property', 'reset-turn-over-a-unit')
),
property_questions as (
  select id, question_key, sort_order
  from public.dd_intake_questions
  where question_key in ('property_type', 'square_footage', 'occupancy_status')
)
insert into public.dd_question_rules (
  question_id,
  service_outcome_id,
  sort_order,
  is_active
)
select
  q.id,
  o.id,
  q.sort_order,
  true
from property_questions q
cross join property_outcomes o
where not exists (
  select 1
  from public.dd_question_rules r
  where r.question_id = q.id
    and r.service_outcome_id = o.id
    and r.client_type_id is null
    and r.depends_on_question_id is null
    and r.depends_on_operator is null
    and r.depends_on_value is null
);

with target_client_types as (
  select id
  from public.dd_client_types
  where slug in ('property-manager', 'apartment-community')
),
target_outcomes as (
  select id
  from public.dd_service_outcomes
  where slug in ('prepare-a-property', 'clean-a-property', 'reset-turn-over-a-unit')
),
target_questions as (
  select id, sort_order
  from public.dd_intake_questions
  where question_key in ('turnover_deadline', 'move_in_date', 'access_method')
)
insert into public.dd_question_rules (
  question_id,
  client_type_id,
  service_outcome_id,
  sort_order,
  is_active
)
select
  q.id,
  ct.id,
  so.id,
  q.sort_order,
  true
from target_questions q
cross join target_client_types ct
cross join target_outcomes so
where not exists (
  select 1
  from public.dd_question_rules r
  where r.question_id = q.id
    and r.client_type_id = ct.id
    and r.service_outcome_id = so.id
    and r.depends_on_question_id is null
    and r.depends_on_operator is null
    and r.depends_on_value is null
);

commit;
