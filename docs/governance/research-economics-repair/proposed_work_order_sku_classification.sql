-- PROPOSED, NOT APPLIED (Production-lineage candidate; needs owner review). Owner decision 2026-10-11:
-- capture a canonical service/SKU reference on service-based dispatches, with a governed exception for legitimate
-- custom or unclassified work. This must never block valid paid work, so it is a classification and a queue, not a hard gate.
--
-- Facts (Production, read-only 2026-10-11): dd_work_orders has service_id, canonical_sku, offer_sku; 2 rows (1 CANCELLED with a SKU,
-- 1 PAID with none: DDWO-000000, scope "Two Bathroom Detail & Sanitization + vacuuming", customer price 160). Existing triggers guard
-- state transitions, QA-before-payable and payable clearance; none looks at SKU.
alter table public.dd_work_orders
  add column if not exists classification text not null default 'UNCLASSIFIED_PENDING',
  add column if not exists classification_exception jsonb not null default '{}'::jsonb;
alter table public.dd_work_orders
  add constraint dd_work_orders_classification_chk check (classification in ('CATALOG_SKU','CUSTOM_APPROVED','UNCLASSIFIED_PENDING')),
  -- a custom exception must say why, who approved and when; it never carries a SKU baseline claim
  add constraint dd_work_orders_custom_exception_chk check (classification<>'CUSTOM_APPROVED'
      or (classification_exception ? 'reason' and classification_exception ? 'approved_by' and classification_exception ? 'approved_at'));

-- Classification follows the data, never the description: CATALOG_SKU only when service_id or canonical_sku resolves to services.sku.
create or replace function public.dd_work_order_classify_from_links() returns trigger language plpgsql as $$
begin
  if new.classification='UNCLASSIFIED_PENDING'
     and (new.service_id is not null or exists(select 1 from public.services s where s.sku in (new.canonical_sku,new.offer_sku))) then
    new.classification:='CATALOG_SKU';
  end if;
  return new;     -- never raises: valid work is not blocked
end $$;
create trigger dd_work_order_classify before insert or update of service_id, canonical_sku, offer_sku on public.dd_work_orders
  for each row execute function public.dd_work_order_classify_from_links();

-- Owner queue: oldest first, money at stake first. Custom approvals are recorded by an authorized human by setting
-- classification='CUSTOM_APPROVED' with the exception payload; economics then counts the job as CUSTOM (never as a SKU baseline).
create or replace view public.dd_work_order_classification_queue_v1 with (security_invoker=true) as
select w.id, w.work_order_number, w.status, w.customer_price, w.provider_pay_amount, w.created_at,
       now()-w.created_at as age, left(w.service_name,120) as described_as
from public.dd_work_orders w
where w.classification='UNCLASSIFIED_PENDING' and w.status<>'CANCELLED'
order by w.customer_price desc nulls last, w.created_at;
-- Backfill is deliberately NOT included: DDWO-000000 stays UNCLASSIFIED_PENDING until the owner classifies it.
-- Attribution views: CUSTOM_APPROVED work orders map to attribution_status 'CUSTOM_JOB' (no canonical_sku).
