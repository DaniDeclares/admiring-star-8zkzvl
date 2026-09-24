-- Normalize active service routing uniqueness.
-- Keep the oldest active record for each service/capability/policy tuple;
-- deactivate later duplicates and prevent future duplication.
with ranked as (
  select id,row_number() over (
    partition by service_id,capability_key,selection_policy
    order by created_at,id
  ) rn
  from public.dd_service_work_order_routing_templates
  where is_active
)
update public.dd_service_work_order_routing_templates r
set is_active=false,updated_at=now()
from ranked x
where r.id=x.id and x.rn>1;

create unique index if not exists dd_service_work_order_routing_active_unique
on public.dd_service_work_order_routing_templates(service_id,capability_key,selection_policy)
where is_active;