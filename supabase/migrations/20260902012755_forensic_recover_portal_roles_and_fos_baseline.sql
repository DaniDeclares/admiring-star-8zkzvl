-- FORENSIC RECOVERY FROM THE PRODUCTION CATALOG (read-only). Not a redesign.
-- Authority: Danielle, 2026-10-02 13:45 UTC (read-only Production catalog recovery into #520).
-- Source: Production project ajxezpczaemunlcmqlgl, pg_catalog read on 2026-10-02.
-- Why: 20260902012756_fos_portal_rls_and_search_path_hardening alters five FOS trigger
--   functions and creates a policy on public.dd_portal_user_roles; 20260902014726 uses
--   type public.dd_portal_role and private.dd_has_portal_role. No source file creates any of
--   these, or the FOS tables/columns/triggers they depend on. All exist in Production.
--   Tester corroborates the FOS objects in ledger 20260922225333_restore_fos_trigger_function_baseline
--   (evidence only, not authority).
-- Type: Production labels are OWNER_OPERATOR, PROVIDER, CUSTOMER, SALESPERSON. SALESPERSON is
--   left to 20260923191240 (alter type ... add value if not exists 'SALESPERSON').
-- Omitted on purpose: RLS + policy dd_portal_user_roles_self_read (20260902012756), index
--   idx_dd_portal_user_roles_provider_org_id (20260919134103), select grant to
--   authenticated (20260918220845).

do $$ begin
  create type public.dd_portal_role as enum ('OWNER_OPERATOR', 'PROVIDER', 'CUSTOMER');
exception when duplicate_object then null; end $$;

create table if not exists public.dd_portal_user_roles (
  id uuid default gen_random_uuid() not null,
  user_id uuid not null,
  role public.dd_portal_role not null,
  provider_org_id uuid,
  is_active boolean default true not null,
  created_at timestamp with time zone default now() not null,
  updated_at timestamp with time zone default now() not null,
  constraint dd_portal_user_roles_user_id_role_key UNIQUE (user_id, role),
  constraint dd_portal_user_roles_pkey PRIMARY KEY (id)
);

do $$ begin
  alter table public.dd_portal_user_roles add constraint dd_portal_user_roles_provider_org_id_fkey FOREIGN KEY (provider_org_id) REFERENCES public.dd_provider_organizations(id) ON DELETE SET NULL;
exception when duplicate_object then null; end $$;
do $$ begin
  alter table public.dd_portal_user_roles add constraint dd_portal_user_roles_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
exception when duplicate_object then null; end $$;

-- Grants: Production relacl is {postgres=arwdDxtm, service_role=arwdDxtm, authenticated=r}; anon has none.
-- Net ACL equals Production, so the file is a no-op if it ever runs there.
revoke all on public.dd_portal_user_roles from anon;
revoke insert, update, delete, truncate, references, trigger on public.dd_portal_user_roles from authenticated;
grant select on public.dd_portal_user_roles to authenticated;

create or replace function private.dd_has_portal_role(p_roles public.dd_portal_role[])
returns boolean
language sql
stable
security definer
set search_path to 'public'
as $$
  select exists (
    select 1
    from public.dd_portal_user_roles r
    where r.user_id = auth.uid()
      and r.is_active
      and r.role = any (p_roles)
  );
$$;

revoke all on function private.dd_has_portal_role(public.dd_portal_role[]) from public, anon, authenticated;
grant execute on function private.dd_has_portal_role(public.dd_portal_role[]) to authenticated, service_role;

-- FOS baseline objects required by later hardening migrations (exact Production shapes).
create table if not exists public.dd_work_orders (
  id uuid default gen_random_uuid() not null,
  job_id uuid,
  provider_id uuid,
  status text not null default 'DRAFT'::text,
  created_at timestamp with time zone default now() not null,
  updated_at timestamp with time zone default now() not null,
  constraint dd_work_orders_pkey PRIMARY KEY (id)
);

create table if not exists public.dd_work_order_event_history (
  id uuid default gen_random_uuid() not null,
  work_order_id uuid not null,
  event_type text not null,
  from_status text,
  to_status text,
  actor_user_id uuid,
  notes text,
  created_at timestamp with time zone default now() not null,
  constraint dd_work_order_event_history_pkey PRIMARY KEY (id)
);

do $$ begin
  alter table public.dd_work_order_event_history
    add constraint dd_work_order_event_history_work_order_id_fkey
    FOREIGN KEY (work_order_id) REFERENCES public.dd_work_orders(id) ON DELETE CASCADE;
exception when duplicate_object then null; end $$;

create or replace function public.dd_fos_immutable_event_history()
returns trigger language plpgsql set search_path to 'public' as $function$
begin
  raise exception 'dd_work_order_event_history is append-only';
end; $function$;

create or replace function public.dd_fos_append_work_order_event()
returns trigger language plpgsql set search_path to 'public' as $function$
begin
  if TG_OP = 'INSERT' then
    insert into public.dd_work_order_event_history(work_order_id, event_type, from_status, to_status)
    values (NEW.id, 'CREATED', null, NEW.status);
  elsif TG_OP = 'UPDATE' and OLD.status is distinct from NEW.status then
    insert into public.dd_work_order_event_history(work_order_id, event_type, from_status, to_status)
    values (NEW.id, 'STATUS_CHANGE', OLD.status, NEW.status);
  end if;
  return NEW;
end; $function$;

create or replace function public.dd_fos_payable_clearance()
returns trigger language plpgsql set search_path to 'public' as $function$
begin
  if NEW.status = 'PAYABLE' and OLD.status is distinct from 'PAYABLE' then
    if OLD.status <> 'CUSTOMER_CLOSED' then
      raise exception 'FOS payable clearance requires CUSTOMER_CLOSED before PAYABLE';
    end if;
  end if;
  return NEW;
end; $function$;

create or replace function public.dd_fos_qa_payable_gate()
returns trigger language plpgsql set search_path to 'public' as $function$
begin
  if NEW.status = 'PAYABLE' and OLD.status is distinct from 'PAYABLE' then
    if OLD.status not in ('CUSTOMER_CLOSED', 'QA_PASS') then
      raise exception 'FOS QA/payable gate: invalid prior status %', OLD.status;
    end if;
  end if;
  return NEW;
end; $function$;

create or replace function public.dd_fos_validate_state_transition()
returns trigger language plpgsql set search_path to 'public' as $function$
begin
  if OLD.status is not distinct from NEW.status then return NEW; end if;
  if OLD.status = 'DRAFT' and NEW.status not in ('ASSIGNED','CANCELLED') then raise exception 'Invalid FOS transition: % -> %',OLD.status,NEW.status;
  elsif OLD.status = 'ASSIGNED' and NEW.status not in ('IN_PROGRESS','CANCELLED') then raise exception 'Invalid FOS transition: % -> %',OLD.status,NEW.status;
  elsif OLD.status = 'IN_PROGRESS' and NEW.status not in ('SUBMITTED','CANCELLED') then raise exception 'Invalid FOS transition: % -> %',OLD.status,NEW.status;
  elsif OLD.status = 'SUBMITTED' and NEW.status not in ('QA_REVIEW','CANCELLED') then raise exception 'Invalid FOS transition: % -> %',OLD.status,NEW.status;
  elsif OLD.status = 'QA_REVIEW' and NEW.status not in ('QA_PASS','QA_FAIL') then raise exception 'Invalid FOS transition: % -> %',OLD.status,NEW.status;
  elsif OLD.status = 'QA_FAIL' and NEW.status not in ('IN_PROGRESS','CANCELLED') then raise exception 'Invalid FOS transition: % -> %',OLD.status,NEW.status;
  elsif OLD.status = 'QA_PASS' and NEW.status not in ('CUSTOMER_CLOSED','CANCELLED') then raise exception 'Invalid FOS transition: % -> %',OLD.status,NEW.status;
  elsif OLD.status = 'CUSTOMER_CLOSED' and NEW.status <> 'PAYABLE' then raise exception 'Invalid FOS transition: % -> %',OLD.status,NEW.status;
  elsif OLD.status = 'PAYABLE' and NEW.status <> 'PAID' then raise exception 'Invalid FOS transition: % -> %',OLD.status,NEW.status;
  elsif OLD.status in ('PAID','CANCELLED') then raise exception 'Terminal FOS state cannot be changed: %',OLD.status;
  end if;
  return NEW;
end; $function$;

do $$ begin
  CREATE TRIGGER dd_fos_event_history_no_delete BEFORE DELETE ON public.dd_work_order_event_history FOR EACH ROW EXECUTE FUNCTION public.dd_fos_immutable_event_history();
exception when duplicate_object then null; end $$;
do $$ begin
  CREATE TRIGGER dd_fos_event_history_no_update BEFORE UPDATE ON public.dd_work_order_event_history FOR EACH ROW EXECUTE FUNCTION public.dd_fos_immutable_event_history();
exception when duplicate_object then null; end $$;
do $$ begin
  CREATE TRIGGER dd_fos_event_capture AFTER INSERT OR UPDATE OF status ON public.dd_work_orders FOR EACH ROW EXECUTE FUNCTION public.dd_fos_append_work_order_event();
exception when duplicate_object then null; end $$;
do $$ begin
  CREATE TRIGGER dd_fos_payable_clearance BEFORE UPDATE OF status ON public.dd_work_orders FOR EACH ROW EXECUTE FUNCTION public.dd_fos_payable_clearance();
exception when duplicate_object then null; end $$;
do $$ begin
  CREATE TRIGGER dd_fos_qa_payable_gate BEFORE UPDATE OF status ON public.dd_work_orders FOR EACH ROW EXECUTE FUNCTION public.dd_fos_qa_payable_gate();
exception when duplicate_object then null; end $$;
do $$ begin
  CREATE TRIGGER dd_fos_state_guard BEFORE UPDATE OF status ON public.dd_work_orders FOR EACH ROW EXECUTE FUNCTION public.dd_fos_validate_state_transition();
exception when duplicate_object then null; end $$;
