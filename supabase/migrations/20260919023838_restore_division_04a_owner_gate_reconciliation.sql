-- Restore the production-proven 04A owner capability/channel/count reconciliation written before verification.
DO $$
BEGIN
 INSERT INTO public.dd_provider_capabilities(provider_id,provider_org_id,service_id,service_line,is_authorized,capability_key,tier_availability)
 SELECT 'acba894f-a8c7-4156-b981-fa08acc9e65b'::uuid,'19c10267-898f-4c10-a25e-186f6aff8771'::uuid,s.id,s.name,true,'ADMIN_BUSINESS_OPS','{}'::jsonb
 FROM public.services s
 WHERE s.sku = ANY(ARRAY['DNI-04A-001','DNI-04A-002','DNI-04A-003','DNI-04A-004','DNI-04A-005','DNI-04A-006','DNI-04A-007','DNI-04A-008','DNI-04A-009','DNI-04A-010','DNI-04A-011','DNI-04A-012','DNI-04A-013','DNI-04A-014','DNI-04A-015','DNI-04A-016','DNI-04A-017','DNI-04A-018','DNI-04A-019'])
 AND NOT EXISTS(select 1 from public.dd_provider_capabilities p where p.provider_id='acba894f-a8c7-4156-b981-fa08acc9e65b' and p.service_id=s.id and p.capability_key='ADMIN_BUSINESS_OPS');
 INSERT INTO public.dd_service_channel_availability(service_id,channel_code,eligibility_status,notes)
 SELECT s.id,ch,'ACTIVE','Gate 05 reconciliation from governed capability/channel matrix; matrix row is authoritative channel evidence.'
 FROM public.services s cross join unnest(array['CH02','CH03','CH04','CH05']) ch
 WHERE s.sku = ANY(ARRAY['DNI-04A-001','DNI-04A-002','DNI-04A-003','DNI-04A-004','DNI-04A-005','DNI-04A-006','DNI-04A-007','DNI-04A-008','DNI-04A-009','DNI-04A-010','DNI-04A-011','DNI-04A-012','DNI-04A-013','DNI-04A-014','DNI-04A-015','DNI-04A-016','DNI-04A-017','DNI-04A-018','DNI-04A-019'])
 ON CONFLICT(service_id,channel_code) DO UPDATE SET eligibility_status='ACTIVE',notes=excluded.notes;
 UPDATE public.dd_governed_service_offers o SET channel_availability_count=4,authorized_provider_capability_count=1
 FROM public.services s WHERE o.runtime_service_id=s.id AND s.sku = ANY(ARRAY['DNI-04A-001','DNI-04A-002','DNI-04A-003','DNI-04A-004','DNI-04A-005','DNI-04A-006','DNI-04A-007','DNI-04A-008','DNI-04A-009','DNI-04A-010','DNI-04A-011','DNI-04A-012','DNI-04A-013','DNI-04A-014','DNI-04A-015','DNI-04A-016','DNI-04A-017','DNI-04A-018','DNI-04A-019']);
END $$;