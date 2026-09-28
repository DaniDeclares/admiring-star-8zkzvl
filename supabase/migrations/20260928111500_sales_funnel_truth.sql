create or replace view public.dd_sales_funnel_truth_v1 with (security_invoker=true) as
select count(*) raw_rows,
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
count(*) filter(where coalesce(amount_collected,0)>0) collected_rows,
coalesce(sum(amount_collected),0)::numeric(12,2) total_collected
from public.dd_sales_queue;
grant select on public.dd_sales_funnel_truth_v1 to authenticated,service_role;
comment on view public.dd_sales_funnel_truth_v1 is 'Honest funnel KPIs: raw counts remain visible while actionable intent excludes suppressed non-sales routes.';