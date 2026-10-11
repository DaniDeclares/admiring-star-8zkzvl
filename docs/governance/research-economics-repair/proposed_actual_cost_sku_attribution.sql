-- PROPOSED (read-only views). Not applied. Candidate for the Production lineage after review.
-- Purpose: attach VERIFIED actual job costs to a canonical SKU only through existing structured links.
-- Never uses job titles, scope text or notes. Unlinked, ambiguous or mixed-scope costs stay unassigned.
-- Attribution paths, strongest first:
--   SNAPSHOT        dd_job_cost_actuals.estimate_component_snapshot_id -> dd_estimate_component_snapshots.canonical_sku
--   WORK_ORDER      dd_jobs.work_order_id -> dd_work_orders.service_id / canonical_sku / offer_sku, each resolved to services.sku; all non-null values must agree
--   ESTIMATE_SINGLE dd_jobs.estimate_id -> snapshot lines; used only when exactly one distinct canonical_sku exists
-- Conflicting paths (different SKUs) => CONFLICT. Several SKUs on the estimate and no stronger path => MIXED_SCOPE.
create or replace view public.dd_job_cost_sku_attribution_v1 with (security_invoker=true) as
with cost as (
  select a.id cost_id, a.job_id, a.cost_type, a.amount, a.status, a.source_type, a.source_reference, a.incurred_at,
         a.estimate_component_snapshot_id, a.metadata,
         row_number() over (partition by a.job_id, a.cost_type, a.amount, coalesce(a.source_reference,''), a.incurred_at::date order by a.created_at, a.id) dup_rank,
         count(*) filter (where a.status<>'VOID') over (partition by a.job_id, a.cost_type, a.estimate_component_snapshot_id) live_in_group,
         (max(a.amount) filter (where a.status<>'VOID') over (partition by a.job_id, a.cost_type, a.estimate_component_snapshot_id)
          is distinct from min(a.amount) filter (where a.status<>'VOID') over (partition by a.job_id, a.cost_type, a.estimate_component_snapshot_id)) amounts_differ
  from public.dd_job_cost_actuals a
), p_snap as (
  select c.cost_id, s.canonical_sku sku from cost c join public.dd_estimate_component_snapshots s on s.id=c.estimate_component_snapshot_id where s.canonical_sku is not null
), p_wo as (
  -- dd_work_orders carries service_id, canonical_sku and offer_sku; each must resolve to an existing services.sku, and they must agree
  select c.cost_id,
         case when k.n>1 then '__CONFLICT__' else k.one end sku
  from cost c join public.dd_jobs j on j.id=c.job_id join public.dd_work_orders w on w.id=j.work_order_id
  left join public.services sv on sv.id=w.service_id
  cross join lateral (select count(distinct s) n, min(s) one from unnest(array[
       sv.sku,
       (select x.sku from public.services x where x.sku=w.canonical_sku),
       (select x.sku from public.services x where x.sku=w.offer_sku)]) s where s is not null) k
), est as (
  select j.id job_id, count(distinct s.canonical_sku) sku_n, min(s.canonical_sku) one_sku
  from public.dd_jobs j join public.dd_estimate_component_snapshots s on s.estimate_id=j.estimate_id
  group by j.id
), cand as (
  select cost_id, sku, 1 pri, 'SNAPSHOT' path from p_snap
  union all select cost_id, sku, 2, 'WORK_ORDER' from p_wo where sku is not null
  union all select c.cost_id, e.one_sku, 3, 'ESTIMATE_SINGLE' from cost c join est e on e.job_id=c.job_id where e.sku_n=1
), agg as (
  select cost_id, count(distinct sku) sku_n, bool_or(sku='__CONFLICT__') wo_conflict,
         (array_agg(sku order by pri))[1] best_sku, (array_agg(path order by pri))[1] best_path
  from cand group by cost_id
)
select c.cost_id, c.job_id, c.cost_type, c.amount, c.status, c.source_type, c.source_reference, c.incurred_at,
  case when agg.cost_id is null and coalesce(e.sku_n,0)>1 then 'MIXED_SCOPE'
       when agg.cost_id is null then 'UNASSIGNED_NO_LINK'
       when agg.sku_n>1 or agg.wo_conflict then 'CONFLICT'
       else 'ATTRIBUTED' end attribution_status,
  case when agg.cost_id is not null and agg.sku_n=1 and not agg.wo_conflict then agg.best_sku end canonical_sku,
  case when agg.cost_id is not null and agg.sku_n=1 and not agg.wo_conflict then agg.best_path end attribution_path,
  case when c.cost_type in ('PROVIDER_LABOR','OWNER_LABOR','MATERIAL','PROCUREMENT','SUBCONTRACT','TRAVEL','REWORK') then 'FULFILLMENT_DIRECT'
       when c.cost_type='PAYMENT_PROCESSING' then 'TRANSACTION'
       when c.cost_type in ('REFUND','CHARGEBACK') then 'ADVERSE'
       when c.cost_type='OTHER' and c.metadata->>'cost_subtype'='CUSTOMER_ACQUISITION' then 'ACQUISITION'
       else 'UNCLASSIFIED' end cost_class,
  case when c.source_type in ('BANK_VERIFIED','PAYPAL_VERIFIED','STRIPE_VERIFIED') then 'VERIFIED_EXTERNAL'
       when c.source_type='OWNER_CONFIRMED_JOB_RECORD' then 'OWNER_CONFIRMED' else 'UNVERIFIED' end evidence_grade,
  (c.dup_rank>1) duplicate_suspect,
  (c.live_in_group>1 and c.amounts_differ and c.status<>'VOID') conflicting_amounts,
  (c.status in ('RECORDED','APPROVED')
     and c.dup_rank=1
     and not (c.live_in_group>1 and c.amounts_differ)
     and c.source_type in ('BANK_VERIFIED','PAYPAL_VERIFIED','STRIPE_VERIFIED','OWNER_CONFIRMED_JOB_RECORD')
     and agg.cost_id is not null and agg.sku_n=1 and not agg.wo_conflict) eligible_for_sku_economics
from cost c left join agg on agg.cost_id=c.cost_id left join est e on e.job_id=c.job_id;

-- Per-SKU roll-up of ELIGIBLE rows only. Read-only evidence; it does not set readiness or any price.
-- Acquisition and transaction costs are reported separately from fulfillment-direct cost.
create or replace view public.dd_service_actual_cost_evidence_v1 with (security_invoker=true) as
select canonical_sku,
  count(distinct job_id) as jobs_n,
  sum(amount) filter (where cost_class='FULFILLMENT_DIRECT') as fulfillment_direct_total,
  sum(amount) filter (where cost_class='TRANSACTION') as transaction_total,
  sum(amount) filter (where cost_class='ACQUISITION') as acquisition_total,
  count(*) filter (where evidence_grade='VERIFIED_EXTERNAL') as verified_external_rows,
  count(*) filter (where evidence_grade='OWNER_CONFIRMED') as owner_confirmed_rows,
  case when count(distinct job_id)>=3 then 'REPEATED' when count(distinct job_id)=2 then 'TWO_JOBS' else 'SINGLE_JOB' end as sample_grade,
  'ACTUAL_JOB_COST'::text as evidence_class
from public.dd_job_cost_sku_attribution_v1
where eligible_for_sku_economics
group by canonical_sku;
