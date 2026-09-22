begin;
insert into public.services
(id,division_id,slug,name,description,sku,service_family,commercial_status,source_sku,source_status,canonical_notes,commercial_intent_status)
select
'25ac02f5-8ab3-4ed1-ad52-0898d89b9980'::uuid,12,'dni_12a_021','Mobile Vehicle Detailing',
'Mobile interior, exterior and full vehicle detailing coordinated at the customer location. Service level and price vary by vehicle size, condition and requested treatment.',
'DNI-12A-021','Mobile Automotive & Vehicle Care','CANONICAL_ACTIVE','DNI-12A-021','CATALOG_RECONCILED_2026_09_04',
'Added as one canonical service after audit confirmed mobile detailing was present in historical discovery evidence but absent from the current master/runtime service catalog. Market anchors include published Atlanta mobile detail pricing; this is DANI customer pricing, not a provider payout.',
'SELL_NOW'
where not exists(select 1 from public.services where id='25ac02f5-8ab3-4ed1-ad52-0898d89b9980'::uuid or sku='DNI-12A-021');
update public.dd_governed_service_offers g set runtime_service_id=s.id from public.services s where g.canonical_sku='DNI-12A-021' and s.sku='DNI-12A-021' and g.runtime_service_id is null;
commit;