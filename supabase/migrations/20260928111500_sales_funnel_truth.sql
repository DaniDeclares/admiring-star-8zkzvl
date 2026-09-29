create or replace view public.dd_sales_funnel_truth_v1 with (security_invoker=true) as
with payment_truth as (
  select
    count(distinct coalesce(
      'job:'||job_id::text,
      'request:'||request_id::text,
      'invoice:'||invoice_id::text,
      'event:'||id::text
    )) filter (
      where upper(coalesce(payment_status,''))='SUCCEEDED'
        and coalesce(amount_received,0)>0
    ) as collected_rows,
    coalesce(sum(amount_received) filter (
      where upper(coalesce(payment_status,''))='SUCCEEDED'
        and coalesce(amount_received,0)>0
    ),0)::numeric(12,2) as total_collected
  from public.dd_payment_events
)
select
count(*) raw_rows,
count(distinct coalesce(nullif(lower(trim(company_name)),''),'__individual__:'||id::text)) account_units,
count(*) filter(where coalesce(do_not_contact,false)=false and disposition='NOT_CONTACTED' and (phone is not null or email is not null)) broad_contactable_rows,
count(*) filter(where coalesce(campaign_eligible,false)=true) campaign_eligible_rows,
count(*) filter(where disposition in ('READY_TO_BUY','QUOTE_REQUESTED','INTERESTED','NEEDS_INFO','DECISION_MAKER_REACHED')) raw_intent_rows,
count(*) filter(where disposition in ('READY_TO_BUY','QUOTE_REQUESTED','INTERESTED','NEEDS_INFO','DECISION_MAKER_REACHED')
 and coalesce(do_not_contact,false)=false and coalesce(lane,'')<>'PARTNER'
 and coalesce(campaign_suppression_reason,'') not ilike '%bounce%'
 and coalesce(campaign_suppression_reason,'') not ilike '%delivery failure%'
 and coalesce(campaign_suppression_reason,'') not ilike '%invalid%'
 and upper(coalesce(next_action,'')) not like '%RELATIONSHIP RECOVERY HOLD%') actionable_intent_rows,
count(*) filter(where suggested_sku is not null) sku_matched_rows,
count(*) filter(where pain_point is not null and impact_statement is not null) diagnosed_rows,
p.collected_rows,
p.total_collected
from public.dd_sales_queue
cross join payment_truth p
group by p.collected_rows,p.total_collected;
grant select on public.dd_sales_funnel_truth_v1 to authenticated,service_role;
comment on view public.dd_sales_funnel_truth_v1 is 'Honest funnel KPIs: sales intent comes from the governed sales queue; collected cash comes from authoritative succeeded dd_payment_events rather than mutable sales snapshots.';
