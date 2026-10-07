-- CH01 holiday commercial release + matcher routing
-- Production evidence was proven before this reconciliation migration; fail closed on verification state.

update public.services
set description='Seasonal household decorating support using client-provided or separately approved décor. Includes interior seasonal setup, tree/decor placement, basic styling, takedown and storage preparation within the agreed scope. Lighting, high-access work, electrical work, permanent installation, large/heavy installation and specialty production are excluded or separately routed.',
    public_price_display='$65/hour base labor; final holiday decorating scope is quoted before work. Larger projects, materials, lighting, high-access work and specialty installation are separately scoped.'
where sku='DNI-01F-001' and pricing_type='VARIABLE_QUOTE' and starting_price=65.00;

update public.dd_governed_service_offers o
set commercial_offer_status='SELL_NOW',
    offer_basis=o.offer_basis||' | 2026-10-07 governed holiday release: commercial definition completed/restored after governed runtime evidence; controlled-quote behavior preserved where applicable; no price change; no new SKU.',
    updated_at=now()
where o.canonical_sku in ('DNI-01D-004','DNI-01D-005','DNI-01D-009','DNI-01D-011','DNI-01D-015','DNI-01F-001','DNI-01F-003')
  and o.commercial_offer_status='INTAKE_ONLY'
  and exists (
    select 1 from public.dd_service_release_verifications v
    where v.canonical_sku=o.canonical_sku
      and v.runtime_verified_at is not null
      and v.regression_verified_at is not null
      and v.production_smoke_verified_at is not null
  );

update public.dd_execution_package_routing
set need_regex='(move|moving|relocat|unpack)',
    discovery_question='What is the move or transition date, and which parts do you want handled?',
    updated_at=now()
where package_code='PKG-CH01-F05-MOVE_AND_TRANSITION';

insert into public.dd_governed_packages(package_code,package_name,commercial_offer_status,package_price_cents,pricing_type,notes)
values
('PKG-CH01-F05-HOLIDAY_DECOR_READY','Holiday & Seasonal Home Execution','INTAKE_ONLY',null,'SUM_OF_COMPONENTS','CH01-F05 seasonal/holiday outcome routing. No bundle price; component SKUs retain governed pricing and quote behavior.'),
('PKG-CH01-F05-HOLIDAY_HOSTING_READY','Holiday Hosting & Home Reset Execution','INTAKE_ONLY',null,'SUM_OF_COMPONENTS','CH01-F05 holiday hosting outcome routing. No bundle price; component SKUs retain governed pricing and quote behavior.'),
('PKG-CH01-F05-GIFT_READY','Gift Wrapping & Presentation Execution','INTAKE_ONLY',null,'SUM_OF_COMPONENTS','CH01-F05 gift-preparation outcome routing. No bundle price; DNI-01D-011 remains canonical.'),
('PKG-CH01-F05-GUEST_READY','Guest & Hospitality Preparation Execution','INTAKE_ONLY',null,'SUM_OF_COMPONENTS','CH01-F05 guest-readiness outcome routing. No bundle price; component SKUs retain governed pricing and quote behavior.')
on conflict (package_code) do nothing;

with x(package_code,sku,is_required,sort_order) as (
 values
 ('PKG-CH01-F05-HOLIDAY_DECOR_READY','DNI-01F-001',true,0),
 ('PKG-CH01-F05-HOLIDAY_DECOR_READY','DNI-01F-003',false,100),
 ('PKG-CH01-F05-HOLIDAY_DECOR_READY','DNI-01D-011',false,101),
 ('PKG-CH01-F05-HOLIDAY_HOSTING_READY','DNI-01D-004',true,0),
 ('PKG-CH01-F05-HOLIDAY_HOSTING_READY','DNI-01D-015',false,100),
 ('PKG-CH01-F05-HOLIDAY_HOSTING_READY','DNI-01D-009',false,101),
 ('PKG-CH01-F05-HOLIDAY_HOSTING_READY','DNI-01D-011',false,102),
 ('PKG-CH01-F05-HOLIDAY_HOSTING_READY','DNI-01D-005',false,103),
 ('PKG-CH01-F05-GIFT_READY','DNI-01D-011',true,0),
 ('PKG-CH01-F05-GIFT_READY','DNI-01D-004',false,100),
 ('PKG-CH01-F05-GUEST_READY','DNI-01D-009',true,0),
 ('PKG-CH01-F05-GUEST_READY','DNI-01D-005',false,100),
 ('PKG-CH01-F05-GUEST_READY','DNI-01D-004',false,101)
)
insert into public.dd_governed_package_components(package_id,canonical_sku,quantity,is_required,sort_order)
select p.id,x.sku,1,x.is_required,x.sort_order
from x join public.dd_governed_packages p using(package_code)
where not exists (
 select 1 from public.dd_governed_package_components c
 where c.package_id=p.id and c.canonical_sku=x.sku
);

insert into public.dd_execution_package_routing(package_code,channel_code,front_door_code,outcome_code,is_front_door_primary,need_regex,discovery_question,updated_at)
values
('PKG-CH01-F05-HOLIDAY_DECOR_READY','CH01','CH01-F05','HOLIDAY_DECOR_READY',false,'(holiday|seasonal|decorat|tree setup|tree decor|ornament)','What holiday or seasonal areas do you want decorated, reset, taken down or prepared for storage?',now()),
('PKG-CH01-F05-HOLIDAY_HOSTING_READY','CH01','CH01-F05','HOLIDAY_HOSTING_READY',false,'(party|hosting|host |gathering|post-event|post event|event prep|event reset)','What gathering are you preparing for, and do you need setup, guest readiness, post-event reset, or all three?',now()),
('PKG-CH01-F05-GIFT_READY','CH01','CH01-F05','GIFT_READY',false,'(gift wrap|gift wrapping|wrapping gifts|wrap presents|present wrapping)','How many gifts need wrapping or presentation support, and are materials already on hand?',now()),
('PKG-CH01-F05-GUEST_READY','CH01','CH01-F05','GUEST_READY',false,'(guest room|guest ready|hospitality setup|visitors coming|family coming|prepare for guests)','Which guest rooms or household areas need to be ready, and when are your guests arriving?',now())
on conflict (package_code) do update set
 channel_code=excluded.channel_code,front_door_code=excluded.front_door_code,outcome_code=excluded.outcome_code,
 is_front_door_primary=excluded.is_front_door_primary,need_regex=excluded.need_regex,
 discovery_question=excluded.discovery_question,updated_at=excluded.updated_at;
