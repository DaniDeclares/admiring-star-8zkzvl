
create or replace view public.dd_multidivision_sellability_priority_v1
with (security_invoker=true)
as
select
  d.slug as division_slug,
  s.sku,
  s.name,
  s.pricing_type,
  s.starting_price,
  r.release_state,
  r.blocking_gate,
  r.commercial_definition_ok,
  r.payment_ledger_ok,
  r.runtime_accuracy_ok,
  case
    when oh.home_executable=true and r.release_state='LIVE_READY' then 'SELL_OWNER_HOME_NOW'
    when oh.home_executable=true and r.blocking_gate='COMMERCIAL_DEFINITION' then 'REPAIR_OWNER_HOME_COMMERCIAL_DEFINITION'
    when oh.home_executable=true and r.blocking_gate='PAYMENT_LEDGER' then 'REPAIR_OWNER_HOME_PAYMENT_LEDGER'
    when oh.home_executable=true and r.blocking_gate='RUNTIME_ACCURACY' then 'PROVE_OWNER_HOME_RUNTIME'
    when d.slug in ('real-estate-closing-support','notary-document-services','business-development-growth','classes-workshops-training','creative-design-production','marketing-content-media-production','business-formation-digital-infrastructure','administrative-business-operations')
         and r.release_state<>'LIVE_READY' then 'NEXT_MULTI_DIVISION_REPAIR'
    when r.release_state='LIVE_READY' then 'SELL_NOW'
    else 'LATER_REPAIR'
  end as execution_priority,
  coalesce(oh.home_executable,false) as owner_home_executable
from public.services s
join public.divisions d on d.id=s.division_id
join public.dd_service_release_contract_v1 r on r.canonical_sku=s.sku
left join public.dd_owner_home_service_priority oh on oh.canonical_sku=s.sku
where s.is_active=true
order by
  case
    when oh.home_executable=true and r.release_state='LIVE_READY' then 0
    when oh.home_executable=true then 1
    when d.slug in ('business-development-growth','real-estate-closing-support','notary-document-services','classes-workshops-training','creative-design-production') then 2
    else 3
  end,
  s.starting_price desc nulls last,
  s.sku;

comment on view public.dd_multidivision_sellability_priority_v1 is
'Operation $1M sellability queue across all 13 divisions. Owner-home revenue is prioritized, but provider and field divisions remain in the same execution queue.';

select execution_priority,count(*) 
from public.dd_multidivision_sellability_priority_v1
group by execution_priority
order by execution_priority;
