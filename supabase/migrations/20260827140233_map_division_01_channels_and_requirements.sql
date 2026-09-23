INSERT INTO public.dd_service_channel_availability(service_id,channel_code,eligibility_status,notes)
SELECT s.id,c.code,'ACTIVE','Division 01 source identifies this as a resident offering; final channel-specific pricing remains governed by canonical pricing rules.'
FROM public.services s CROSS JOIN (VALUES ('CH01'),('CH02')) c(code)
WHERE s.sku IN ('DNI-01A-001','DNI-01A-002','DNI-01A-003','DNI-01A-004','DNI-01A-005','DNI-01A-006','DNI-01A-007','DNI-01A-008')
ON CONFLICT DO NOTHING;
INSERT INTO public.dd_service_requirements(service_id,requirement_type,requirement_code,required,minimum_level,notes)
SELECT s.id,'CAPABILITY','CAP-01A-CLEAN',true,'STANDARD','Required for standard/deep residential cleaning execution.' FROM public.services s WHERE s.sku IN ('DNI-01A-001','DNI-01A-002','DNI-01A-003')
UNION ALL SELECT s.id,'CAPABILITY','CAP-01D-LAUNDRY',true,'STANDARD','Laundry capability required.' FROM public.services s WHERE s.sku='DNI-01A-004'
UNION ALL SELECT s.id,'CAPABILITY','CAP-01D-LINEN',true,'STANDARD','Linen/bedding handling capability required.' FROM public.services s WHERE s.sku='DNI-01A-005'
UNION ALL SELECT s.id,'CAPABILITY','CAP-01D-ORGANIZATION',true,'STANDARD','Household organization capability required.' FROM public.services s WHERE s.sku IN ('DNI-01A-006','DNI-01A-007','DNI-01A-008')
ON CONFLICT DO NOTHING;