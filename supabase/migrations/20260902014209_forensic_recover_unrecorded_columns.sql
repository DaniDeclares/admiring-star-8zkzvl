-- FORENSIC RECOVERY FROM THE PRODUCTION CATALOG (read-only). Not a redesign.
-- Authority: Danielle, 2026-10-02 13:45 UTC (read-only Production catalog recovery into #520).
-- Source: Production project ajxezpczaemunlcmqlgl, pg_catalog read on 2026-10-02.
-- Why: replay of 20260902014210_correct_fos_provider_work_order_rls_join fails with
--   column j.work_order_id does not exist. A column diff of every table present at this point
--   in replay against Production found 16 Production columns that no source file creates or
--   adds at any point. They are recovered here with their Production types, defaults,
--   NOT NULL, foreign keys and indexes. Columns a later source file adds are left to that file.

alter table public.dd_change_orders
  add column if not exists provider_pay_delta numeric(10,2) default 0 not null,
  add column if not exists work_order_id uuid;

alter table public.dd_jobs
  add column if not exists work_order_id uuid;

alter table public.dd_provider_organizations
  add column if not exists capability_summary text,
  add column if not exists compliance_tier text default 'STANDARD'::text not null,
  add column if not exists operating_rule text,
  add column if not exists permission_status text default 'PENDING'::text not null,
  add column if not exists primary_contact_name text,
  add column if not exists qualification_status text default 'PENDING'::text not null,
  add column if not exists service_cluster text,
  add column if not exists services_evidence text,
  add column if not exists source_reference text,
  add column if not exists website text;

alter table public.dd_providers
  add column if not exists contact_name text,
  add column if not exists provider_code text,
  add column if not exists role_title text;

do $$ begin
  alter table public.dd_change_orders add constraint dd_change_orders_work_order_id_fkey FOREIGN KEY (work_order_id) REFERENCES public.dd_work_orders(id) ON DELETE RESTRICT;
exception when duplicate_object then null; end $$;
do $$ begin
  alter table public.dd_jobs add constraint dd_jobs_work_order_id_fkey FOREIGN KEY (work_order_id) REFERENCES public.dd_work_orders(id) ON DELETE SET NULL;
exception when duplicate_object then null; end $$;

CREATE INDEX IF NOT EXISTS idx_dd_change_orders_work_order_status ON public.dd_change_orders USING btree (work_order_id, status);
CREATE INDEX IF NOT EXISTS idx_dd_jobs_work_order ON public.dd_jobs USING btree (work_order_id);
CREATE UNIQUE INDEX IF NOT EXISTS uq_dd_provider_code ON public.dd_providers USING btree (provider_code) WHERE (provider_code IS NOT NULL);
