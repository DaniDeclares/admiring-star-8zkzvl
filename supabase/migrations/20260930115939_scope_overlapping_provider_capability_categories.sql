-- Prevent specialized provider categories from expanding into unrelated services
-- merely because those services share a division.
update public.dd_provider_capability_categories
set canonical_skus=array['DNI-06A-016','DNI-06A-017','DNI-06A-018','DNI-06A-019']::text[]
where category_key='COMPUTER_TECHNICAL_SUPPORT';

update public.dd_provider_capability_categories
set canonical_skus=array['DNI-11A-017','DNI-11A-018','DNI-11A-019','DNI-11A-020']::text[]
where category_key='DTF_APPAREL_PRODUCTION';

update public.dd_provider_capability_categories
set canonical_skus=array['DNI-11A-028','DNI-11A-029']::text[]
where category_key='LASER_ENGRAVING';

update public.dd_provider_capability_categories
set canonical_skus=(select array_agg(sku order by sku) from public.services where division_id=10 and sku like 'DNI-10A-%')
where category_key in ('EVENT_PLANNING','EXPERIENCES_EVENTS');

update public.dd_provider_capability_categories
set canonical_skus=(select array_agg(sku order by sku) from public.services where division_id=6 and sku is not null and sku not in ('DNI-06A-016','DNI-06A-017','DNI-06A-018','DNI-06A-019'))
where category_key='BUSINESS_FORMATION_DIGITAL';

update public.dd_provider_capability_categories
set canonical_skus=(select array_agg(sku order by sku) from public.services where division_id=11 and sku is not null and sku not in ('DNI-11A-017','DNI-11A-018','DNI-11A-019','DNI-11A-020','DNI-11A-028','DNI-11A-029'))
where category_key='CREATIVE_DESIGN';
