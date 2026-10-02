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
-- authenticated is not revoked here so this file stays a no-op on Production (authenticated=r there).
revoke all on public.dd_portal_user_roles from anon;

-- ---------- Portal role helpers (Production definitions) ----------
CREATE OR REPLACE FUNCTION private.dd_has_portal_role(p_role public.dd_portal_role)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO ''
AS $function$ SELECT EXISTS (SELECT 1 FROM public.dd_portal_user_roles r WHERE r.user_id=(SELECT auth.uid()) AND r.role=p_role AND r.is_active=true); $function$;

CREATE OR REPLACE FUNCTION public.dd_get_my_portal_roles()
 RETURNS public.dd_portal_role[]
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO ''
AS $function$ SELECT COALESCE(array_agg(r.role ORDER BY r.role),'{}'::public.dd_portal_role[]) FROM public.dd_portal_user_roles r WHERE r.user_id=(SELECT auth.uid()) AND r.is_active=true; $function$;

-- Production ACLs: dd_has_portal_role {postgres, authenticated}; dd_get_my_portal_roles
-- {postgres, service_role, authenticated}. The authenticated grants come from 20260918220845.
revoke all on function private.dd_has_portal_role(public.dd_portal_role) from public, anon;
revoke all on function public.dd_get_my_portal_roles() from public, anon;
grant execute on function public.dd_get_my_portal_roles() to service_role;

-- ---------- FOS columns on dd_work_orders (Production columns no source file adds) ----------
alter table public.dd_work_orders
  add column if not exists canonical_sku text,
  add column if not exists target_channel text,
  add column if not exists jurisdiction_code text default 'GA'::text not null,
  add column if not exists site_access_payload jsonb default '{}'::jsonb not null,
  add column if not exists estimated_duration interval,
  add column if not exists execution_hard_cap interval,
  add column if not exists baseline_resource_count integer default 1 not null,
  add column if not exists secondary_specialist_ids uuid[] default '{}'::uuid[] not null,
  add column if not exists fos_comp_model public.dd_compensation_model,
  add column if not exists fos_base_authorized_amount numeric(10,2),
  add column if not exists fos_quantity_basis_count numeric(8,2) default 1 not null,
  add column if not exists fos_travel_payout_allocation numeric(10,2) default 0 not null,
  add column if not exists fos_material_pass_through_rules jsonb default '{}'::jsonb not null,
  add column if not exists fos_total_provider_payable_accrued numeric(10,2) default 0 not null,
  add column if not exists fos_qa_exception_payload jsonb default '{}'::jsonb not null,
  add column if not exists primary_provider_id uuid,
  add column if not exists customer_user_id uuid;

do $$ begin
  alter table public.dd_work_orders add constraint dd_work_orders_customer_user_id_fkey FOREIGN KEY (customer_user_id) REFERENCES auth.users(id) ON DELETE SET NULL;
exception when duplicate_object then null; end $$;
do $$ begin
  alter table public.dd_work_orders add constraint dd_work_orders_primary_provider_fk FOREIGN KEY (primary_provider_id) REFERENCES public.dd_providers(id) ON DELETE SET NULL;
exception when duplicate_object then null; end $$;
CREATE INDEX IF NOT EXISTS idx_dd_work_orders_fos_status ON public.dd_work_orders USING btree (status);
CREATE INDEX IF NOT EXISTS idx_dd_work_orders_fos_provider ON public.dd_work_orders USING btree (primary_provider_id);
CREATE INDEX IF NOT EXISTS idx_dd_work_orders_customer_user ON public.dd_work_orders USING btree (customer_user_id);

-- ---------- FOS tables ----------
create table if not exists public.dd_work_order_event_history (
  id uuid default gen_random_uuid() not null,
  work_order_id uuid not null,
  actor_id uuid,
  actor_type text default 'SYSTEM'::text not null,
  event_type text not null,
  previous_state text not null,
  new_state text not null,
  payload jsonb default '{}'::jsonb not null,
  recorded_at timestamp with time zone default now() not null,
  constraint dd_work_order_event_history_pkey PRIMARY KEY (id)
);
CREATE INDEX IF NOT EXISTS idx_dd_fos_event_work_order_recorded ON public.dd_work_order_event_history USING btree (work_order_id, recorded_at);
do $$ begin
  alter table public.dd_work_order_event_history add constraint dd_work_order_event_history_work_order_id_fkey FOREIGN KEY (work_order_id) REFERENCES public.dd_work_orders(id) ON DELETE RESTRICT;
exception when duplicate_object then null; end $$;
alter table public.dd_work_order_event_history enable row level security;
do $$ begin
  create policy dd_owner_read_work_order_events on public.dd_work_order_event_history as permissive for select to authenticated using (( SELECT private.dd_has_portal_role('OWNER_OPERATOR'::public.dd_portal_role) AS dd_has_portal_role));
exception when duplicate_object then null; end $$;

create table if not exists public.dd_accounts_payable_ledger (
  id uuid default gen_random_uuid() not null,
  work_order_id uuid not null,
  provider_id uuid not null,
  base_payout_amount numeric(10,2) not null,
  travel_allowance numeric(10,2) default 0 not null,
  approved_change_order_addition numeric(10,2) default 0 not null,
  total_final_payable numeric(10,2) not null,
  is_cleared_for_payout boolean default false not null,
  payment_reference_id character varying(100),
  accrued_at timestamp with time zone default now() not null,
  settled_at timestamp with time zone,
  constraint dd_accounts_payable_ledger_work_order_id_key UNIQUE (work_order_id),
  constraint dd_accounts_payable_ledger_pkey PRIMARY KEY (id)
);
CREATE INDEX IF NOT EXISTS idx_dd_ap_ledger_provider_status ON public.dd_accounts_payable_ledger USING btree (provider_id, is_cleared_for_payout);
do $$ begin
  alter table public.dd_accounts_payable_ledger add constraint dd_accounts_payable_ledger_work_order_id_fkey FOREIGN KEY (work_order_id) REFERENCES public.dd_work_orders(id) ON DELETE RESTRICT;
exception when duplicate_object then null; end $$;
alter table public.dd_accounts_payable_ledger enable row level security;
do $$ begin
  create policy dd_owner_read_ap_ledger on public.dd_accounts_payable_ledger as permissive for select to authenticated using (( SELECT private.dd_has_portal_role('OWNER_OPERATOR'::public.dd_portal_role) AS dd_has_portal_role));
exception when duplicate_object then null; end $$;

-- Grants: Production relacl on both is {postgres=arwdDxtm, service_role=arwdDxtm}.
revoke all on public.dd_work_order_event_history, public.dd_accounts_payable_ledger from anon, authenticated;

-- ---------- FOS trigger functions (Production definitions, verbatim bodies) ----------
CREATE OR REPLACE FUNCTION public.dd_fos_append_work_order_event()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO 'public', 'pg_temp'
AS $function$ BEGIN IF TG_OP='INSERT' THEN INSERT INTO public.dd_work_order_event_history(work_order_id,actor_id,actor_type,event_type,previous_state,new_state,payload) VALUES(NEW.id,auth.uid(),'SYSTEM','WORK_ORDER_CREATED',NEW.status,NEW.status,jsonb_build_object('work_order_number',NEW.work_order_number)); ELSEIF NEW.status <> OLD.status THEN INSERT INTO public.dd_work_order_event_history(work_order_id,actor_id,actor_type,event_type,previous_state,new_state,payload) VALUES(NEW.id,auth.uid(),'USER_OR_SYSTEM','STATE_CHANGED',OLD.status,NEW.status,'{}'::jsonb); END IF; RETURN NEW; END; $function$;

CREATE OR REPLACE FUNCTION public.dd_fos_immutable_event_history()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO 'public', 'pg_temp'
AS $function$ BEGIN RAISE EXCEPTION 'FOS event history is append-only'; END; $function$;

CREATE OR REPLACE FUNCTION public.dd_fos_payable_clearance()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO 'public', 'pg_temp'
AS $function$ BEGIN IF NEW.status='PAYABLE' AND OLD.status='CUSTOMER_CLOSED' AND NEW.primary_provider_id IS NOT NULL THEN UPDATE public.dd_accounts_payable_ledger SET is_cleared_for_payout=true WHERE work_order_id=NEW.id; END IF; IF NEW.status='PAID' AND OLD.status='PAYABLE' AND NEW.primary_provider_id IS NOT NULL THEN IF NOT EXISTS (SELECT 1 FROM public.dd_accounts_payable_ledger WHERE work_order_id=NEW.id AND is_cleared_for_payout=true) THEN RAISE EXCEPTION 'Provider payable is not cleared; cannot mark work order PAID'; END IF; END IF; RETURN NEW; END; $function$;

CREATE OR REPLACE FUNCTION public.dd_fos_qa_payable_gate()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO 'public', 'pg_temp'
AS $function$ DECLARE v_change_order_total numeric(10,2) := 0; v_base numeric(10,2) := 0; v_travel numeric(10,2) := 0; v_total numeric(10,2) := 0; BEGIN IF NEW.status='QA_PASS' AND OLD.status='QA_REVIEW' AND NEW.primary_provider_id IS NOT NULL THEN SELECT COALESCE(SUM(provider_pay_delta),0) INTO v_change_order_total FROM public.dd_change_orders WHERE work_order_id=NEW.id AND status='APPROVED'; v_base := COALESCE(NEW.fos_base_authorized_amount,NEW.provider_pay_amount,0) * COALESCE(NEW.fos_quantity_basis_count,1); v_travel := COALESCE(NEW.fos_travel_payout_allocation,NEW.travel_amount,0); v_total := v_base + v_travel + v_change_order_total; INSERT INTO public.dd_accounts_payable_ledger(work_order_id,provider_id,base_payout_amount,travel_allowance,approved_change_order_addition,total_final_payable,is_cleared_for_payout) VALUES(NEW.id,NEW.primary_provider_id,v_base,v_travel,v_change_order_total,v_total,false) ON CONFLICT (work_order_id) DO NOTHING; NEW.fos_total_provider_payable_accrued := v_total; END IF; RETURN NEW; END; $function$;

CREATE OR REPLACE FUNCTION public.dd_fos_validate_state_transition()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO 'public', 'pg_temp'
AS $function$ BEGIN IF NEW.status = OLD.status THEN RETURN NEW; END IF; IF OLD.status = 'INSTANTIATED' AND NEW.status NOT IN ('OFFERED','CANCELLED') THEN RAISE EXCEPTION 'Invalid FOS transition: % -> %',OLD.status,NEW.status; ELSIF OLD.status = 'OFFERED' AND NEW.status NOT IN ('ACCEPTED','INSTANTIATED','CANCELLED') THEN RAISE EXCEPTION 'Invalid FOS transition: % -> %',OLD.status,NEW.status; ELSIF OLD.status = 'ACCEPTED' AND NEW.status NOT IN ('SCHEDULED','CANCELLED') THEN RAISE EXCEPTION 'Invalid FOS transition: % -> %',OLD.status,NEW.status; ELSIF OLD.status = 'SCHEDULED' AND NEW.status NOT IN ('EN_ROUTE','CANCELLED') THEN RAISE EXCEPTION 'Invalid FOS transition: % -> %',OLD.status,NEW.status; ELSIF OLD.status = 'EN_ROUTE' AND NEW.status NOT IN ('IN_PROGRESS','CANCELLED') THEN RAISE EXCEPTION 'Invalid FOS transition: % -> %',OLD.status,NEW.status; ELSIF OLD.status = 'IN_PROGRESS' AND NEW.status NOT IN ('SUBMITTED','CANCELLED') THEN RAISE EXCEPTION 'Invalid FOS transition: % -> %',OLD.status,NEW.status; ELSIF OLD.status = 'SUBMITTED' AND NEW.status NOT IN ('QA_REVIEW','CANCELLED') THEN RAISE EXCEPTION 'Invalid FOS transition: % -> %',OLD.status,NEW.status; ELSIF OLD.status = 'QA_REVIEW' AND NEW.status NOT IN ('QA_PASS','QA_FAIL') THEN RAISE EXCEPTION 'Invalid FOS transition: % -> %',OLD.status,NEW.status; ELSIF OLD.status = 'QA_FAIL' AND NEW.status NOT IN ('IN_PROGRESS','CANCELLED') THEN RAISE EXCEPTION 'Invalid FOS transition: % -> %',OLD.status,NEW.status; ELSIF OLD.status = 'QA_PASS' AND NEW.status NOT IN ('CUSTOMER_CLOSED','CANCELLED') THEN RAISE EXCEPTION 'Invalid FOS transition: % -> %',OLD.status,NEW.status; ELSIF OLD.status = 'CUSTOMER_CLOSED' AND NEW.status <> 'PAYABLE' THEN RAISE EXCEPTION 'Invalid FOS transition: % -> %',OLD.status,NEW.status; ELSIF OLD.status = 'PAYABLE' AND NEW.status <> 'PAID' THEN RAISE EXCEPTION 'Invalid FOS transition: % -> %',OLD.status,NEW.status; ELSIF OLD.status IN ('PAID','CANCELLED') THEN RAISE EXCEPTION 'Terminal FOS state cannot be changed: %',OLD.status; END IF; RETURN NEW; END; $function$;

-- ---------- FOS triggers (Production pg_get_triggerdef) ----------
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
