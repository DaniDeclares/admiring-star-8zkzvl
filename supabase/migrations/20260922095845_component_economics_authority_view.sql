
create or replace view public.dd_service_economics_authority_v1
with (security_invoker=true) as
with package as (
  select pc.service_id,
         count(*) filter(where pc.is_active) as package_component_count,
         count(*) filter(where pc.is_active and c.cost_category='LABOR') as labor_component_count,
         count(*) filter(where pc.is_active and c.cost_category in ('MATERIAL','PROCUREMENT','SUBCONTRACT','TRAVEL','OTHER')) as cost_component_count
  from public.dd_service_package_components pc
  join public.dd_service_components c on c.id=pc.component_id
  group by pc.service_id
),
cost_unresolved as (
  select pc.service_id,count(*) as unresolved_cost_component_count
  from public.dd_service_package_components pc
  join public.dd_service_components c on c.id=pc.component_id
  where pc.is_active and c.cost_category in ('MATERIAL','PROCUREMENT','SUBCONTRACT','TRAVEL','OTHER')
    and not exists (
      select 1 from public.dd_component_cost_baselines cb
      where cb.component_id=pc.component_id
        and (cb.service_id is null or cb.service_id=pc.service_id)
        and cb.status='ACTIVE'
        and cb.evidence_status in ('RESEARCH_BENCHMARK','OWNER_CONFIRMED','DOCUMENT_EVIDENCE','SYSTEM_VERIFIED','EXTERNAL_VERIFIED')
        and cb.effective_from<=now() and (cb.effective_to is null or cb.effective_to>now())
    )
  group by pc.service_id
),
policy as (
  select s.id as service_id,
         exists(
           select 1 from public.dd_economic_policies ep
           where (ep.service_id=s.id or ep.service_id is null)
             and ep.status='ACTIVE'
             and ep.evidence_status in ('RESEARCH_BENCHMARK','OWNER_CONFIRMED','DOCUMENT_EVIDENCE','SYSTEM_VERIFIED','EXTERNAL_VERIFIED')
             and ep.effective_from<=now() and (ep.effective_to is null or ep.effective_to>now())
         ) as policy_ready
  from public.services s
),
routes as (
  select s.id as service_id,
    exists(select 1 from public.dd_service_work_order_routing_templates r where r.service_id=s.id and r.is_active and r.capability_key='OWNER_DIRECT_FULFILLMENT') as owner_route_active,
    exists(select 1 from public.dd_provider_capabilities pc where pc.service_id=s.id and pc.is_authorized=true) as provider_route_active
  from public.services s
),
owner_unresolved as (
  select pc.service_id,count(*) as unresolved_owner_labor_count
  from public.dd_service_package_components pc
  join public.dd_service_components c on c.id=pc.component_id
  where pc.is_active and c.cost_category='LABOR'
    and not exists (
      select 1 from public.dd_owner_compensation_rules ocr
      join public.dd_portal_user_roles ur on ur.user_id=ocr.owner_user_id and ur.role::text='OWNER_OPERATOR'
      where ocr.component_id=pc.component_id and (ocr.service_id is null or ocr.service_id=pc.service_id)
        and ocr.status='ACTIVE'
        and ocr.evidence_status in ('RESEARCH_BENCHMARK','OWNER_CONFIRMED','DOCUMENT_EVIDENCE','SYSTEM_VERIFIED','EXTERNAL_VERIFIED')
        and ocr.effective_from<=now() and (ocr.effective_to is null or ocr.effective_to>now())
    )
  group by pc.service_id
),
provider_unresolved as (
  select pc.service_id,count(*) as unresolved_provider_labor_count
  from public.dd_service_package_components pc
  join public.dd_service_components c on c.id=pc.component_id
  where pc.is_active and c.cost_category='LABOR'
    and not exists (
      select 1 from public.dd_provider_payout_bands pb
      where pb.component_id=pc.component_id and pb.service_id=pc.service_id
        and pb.status='ACTIVE'
        and pb.evidence_status in ('RESEARCH_BENCHMARK','OWNER_CONFIRMED','DOCUMENT_EVIDENCE','SYSTEM_VERIFIED','EXTERNAL_VERIFIED')
        and pb.effective_from<=now() and (pb.effective_to is null or pb.effective_to>now())
    )
    and not exists (
      select 1 from public.dd_provider_compensation_rules pcr
      where pcr.component_id=pc.component_id and (pcr.service_id is null or pcr.service_id=pc.service_id)
        and pcr.status='ACTIVE'
        and pcr.evidence_status in ('RESEARCH_BENCHMARK','OWNER_CONFIRMED','DOCUMENT_EVIDENCE','SYSTEM_VERIFIED','EXTERNAL_VERIFIED')
        and pcr.effective_from<=now() and (pcr.effective_to is null or pcr.effective_to>now())
    )
  group by pc.service_id
)
select s.id as service_id,s.sku as canonical_sku,
       coalesce(p.package_component_count,0) as package_component_count,
       coalesce(p.labor_component_count,0) as labor_component_count,
       coalesce(p.cost_component_count,0) as cost_component_count,
       coalesce(cu.unresolved_cost_component_count,0) as unresolved_cost_component_count,
       coalesce(ou.unresolved_owner_labor_count,0) as unresolved_owner_labor_count,
       coalesce(pu.unresolved_provider_labor_count,0) as unresolved_provider_labor_count,
       pol.policy_ready,
       r.owner_route_active,r.provider_route_active,
       (
         coalesce(p.package_component_count,0)>0
         and pol.policy_ready
         and coalesce(cu.unresolved_cost_component_count,0)=0
         and (not r.owner_route_active or coalesce(ou.unresolved_owner_labor_count,0)=0)
         and (not r.provider_route_active or coalesce(pu.unresolved_provider_labor_count,0)=0)
         and (r.owner_route_active or r.provider_route_active or coalesce(p.labor_component_count,0)=0)
       ) as economics_ready,
       case
         when coalesce(p.package_component_count,0)=0 then 'PACKAGE_COMPONENTS_UNRESOLVED'
         when not pol.policy_ready then 'ECONOMIC_POLICY_UNRESOLVED'
         when coalesce(cu.unresolved_cost_component_count,0)>0 then 'DIRECT_COST_UNRESOLVED'
         when r.owner_route_active and coalesce(ou.unresolved_owner_labor_count,0)>0 then 'OWNER_COMPENSATION_UNRESOLVED'
         when r.provider_route_active and coalesce(pu.unresolved_provider_labor_count,0)>0 then 'PROVIDER_COMPENSATION_UNRESOLVED'
         when not (r.owner_route_active or r.provider_route_active or coalesce(p.labor_component_count,0)=0) then 'FULFILLMENT_ECONOMIC_ROUTE_UNRESOLVED'
         else 'READY'
       end as economics_reason
from public.services s
left join package p on p.service_id=s.id
left join cost_unresolved cu on cu.service_id=s.id
left join policy pol on pol.service_id=s.id
left join routes r on r.service_id=s.id
left join owner_unresolved ou on ou.service_id=s.id
left join provider_unresolved pu on pu.service_id=s.id;

revoke all on public.dd_service_economics_authority_v1 from anon,authenticated;
grant select on public.dd_service_economics_authority_v1 to service_role;
comment on view public.dd_service_economics_authority_v1 is 'Component-economics authority. Accepts sourced RESEARCH_BENCHMARK evidence until superseded by DANI actuals. Does not itself authorize sale.';
