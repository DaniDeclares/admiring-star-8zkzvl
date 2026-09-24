begin;

alter table public.service_requests
  add column if not exists scope_status text not null default 'NOT_STARTED',
  add column if not exists scope_version integer not null default 1,
  add column if not exists scope_snapshot jsonb not null default '{}'::jsonb,
  add column if not exists scope_completed_at timestamptz,
  add column if not exists scope_completed_by uuid references auth.users(id) on delete set null;

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname='service_requests_scope_status_check'
      and conrelid='public.service_requests'::regclass
  ) then
    alter table public.service_requests
      add constraint service_requests_scope_status_check
      check (scope_status in ('NOT_STARTED','IN_PROGRESS','COMPLETE','REQUIRES_REVIEW'));
  end if;
end $$;

create index if not exists idx_service_requests_scope_status
  on public.service_requests(scope_status);

comment on column public.service_requests.scope_snapshot is
  'Staff-developed scope contract for quoting. Preserves source request context, structured property/unit scope, quote inputs, assumptions, exclusions, and readiness flags. Pricing authority remains in the canonical catalog/quote engine.';

commit;
