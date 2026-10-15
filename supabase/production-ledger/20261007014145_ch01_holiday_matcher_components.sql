
with pkg as (
  select id from public.dd_governed_packages where package_code='PKG-CH01-F05-MOVE_AND_TRANSITION'
)
insert into public.dd_governed_package_components(package_id,canonical_sku,quantity,is_required,sort_order)
select pkg.id,v.sku,1,false,v.ord
from pkg
cross join (values
 ('DNI-01D-011'::text,105),
 ('DNI-01F-001'::text,106),
 ('DNI-01D-004'::text,107),
 ('DNI-01D-015'::text,108)
) v(sku,ord)
where not exists (
 select 1 from public.dd_governed_package_components c
 where c.package_id=pkg.id and c.canonical_sku=v.sku
);

update public.dd_governed_packages
set notes=notes||' | 2026-10-07 holiday release: LIVE_READY gift wrapping, seasonal decorating, party preparation/reset and post-event reset added as optional governed components; component pricing only, no bundle price.',
    updated_at=now()
where package_code='PKG-CH01-F05-MOVE_AND_TRANSITION';
