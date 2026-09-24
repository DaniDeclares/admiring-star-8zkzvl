
update public.dd_service_channel_availability a
set eligibility_status='ACTIVE',
    notes=a.notes || ' | 2026-09-23 ACTIVATED: owner-confirmed launch cohort, governed pricing, and fulfillment capability evidence reconciled.'
from public.dd_governed_service_offers g
join public.dd_launch_portfolio lp on lp.canonical_sku=g.canonical_sku
where a.service_id=g.runtime_service_id
  and a.channel_code='CH02'
  and a.eligibility_status='ELIGIBLE'
  and g.canonical_sku in ('DNI-02A-025','DNI-02A-026','DNI-02A-027','DNI-02A-028')
  and lp.evidence_status='OWNER_CONFIRMED'
  and g.pricing_rule_count>0
  and g.authorized_provider_capability_count>0;
