-- Durable reconciliation for Production fulfillment projection gaps discovered 2026-09-30.
-- Reuses existing governed requirements/provider capabilities/routing-template and evidence-SOP patterns.
-- Does not create new fulfillment authority or promote intake-only services.

with candidates as (
  select rc.runtime_service_id service_id,
         coalesce(req.requirement_code,ofa.capability_key,'OWNER_DIRECT_FULFILLMENT') capability_key
  from public.dd_service_release_contract_v1 rc
  left join lateral (
    select requirement_code
    from public.dd_service_requirements r
    where r.service_id=rc.runtime_service_id and r.required
    order by r.created_at limit 1
  ) req on true
  left join lateral (
    select capability_key
    from public.dd_owner_fulfillment_authorizations a
    where a.service_id=rc.runtime_service_id
      and a.authorization_status in('ACTIVE','AUTHORIZED','SCOPED')
      and a.effective_from<=now()
      and (a.effective_to is null or a.effective_to>now())
    order by a.effective_from desc limit 1
  ) ofa on true
  where rc.blocking_gate='FULFILLMENT_MATRIX'
    and rc.routing_count=0
    and rc.required_requirement_count>0
    and rc.provider_capability_count>0
    and rc.active_task_template_count>0
)
insert into private.dd_work_order_routing(
  capability_key,service_id,eligible_provider_org_ids,eligible_provider_ids,
  offer_status,routing_reason,notification_status,notification_attempts
)
select c.capability_key,c.service_id,
  coalesce((select array_agg(distinct p.org_id) filter(where p.org_id is not null)
            from public.dd_provider_capabilities pc
            join public.dd_providers p on p.id=pc.provider_id
            where pc.service_id=c.service_id and pc.is_authorized=true and p.is_active=true),array[]::uuid[]),
  coalesce((select array_agg(distinct p.id)
            from public.dd_provider_capabilities pc
            join public.dd_providers p on p.id=pc.provider_id
            where pc.service_id=c.service_id and pc.is_authorized=true and p.is_active=true),array[]::uuid[]),
  'PENDING','SERVICE_ROUTING_TEMPLATE','PENDING',0
from candidates c
where not exists(
  select 1 from private.dd_work_order_routing r
  where r.service_id=c.service_id and r.request_id is null and r.job_id is null
);

insert into public.dd_task_templates(
  template_key,channel_type,service_id,task_type,task_name,is_required,evidence_required,
  sort_order,notes,is_active,evidence_spec,instruction_steps
)
select v.template_key,'UNIVERSAL',s.id,v.task_type,v.task_name,true,true,v.sort_order,
       'Projected from existing governed universal evidence-bearing service SOP pattern.',true,
       v.evidence_spec,v.instruction_steps
from public.services s
cross join lateral (
  values
  ('SOP-'||s.sku||'-preflight','PREFLIGHT','Pre-dispatch contract verification',1,
   '{"type":"DISPATCH_CONTROL","required":true,"artifacts":["release_state","payment_state","channel_state","provider_capability_state"]}'::jsonb,
   '["Verify LIVE_READY state","Verify payment condition","Verify channel authorization","Verify provider capability","Verify required requirements","Verify routing template"]'::jsonb),
  ('SOP-'||s.sku||'-execute','EXECUTE','Execute contracted scope',2,
   '{"type":"EXECUTION_RECORD","required":true,"artifacts":["scope_confirmation","completion_notes","exception_record_if_applicable"]}'::jsonb,
   '["Review work order scope","Perform only authorized scope","Record exceptions/change requests","Record material completion facts"]'::jsonb),
  ('SOP-'||s.sku||'-closeout','CLOSEOUT','Evidence-bearing closeout',3,
   '{"type":"CLOSEOUT_EVIDENCE","required":true,"artifacts":["evidence_contract","completion_notes","acceptance_or_exception"]}'::jsonb,
   '["Verify required evidence","Capture evidence metadata","Confirm scope complete","Record customer acceptance or exception","Prevent close until evidence is present"]'::jsonb)
) v(template_key,task_type,task_name,sort_order,evidence_spec,instruction_steps)
where s.sku in('DNI-02A-005','DNI-02A-012')
  and not exists(select 1 from public.dd_task_templates t where t.template_key=v.template_key);
