-- CH02/CH04 channel pricing authority: resident discount is CH01-only.
update public.dd_service_pricing_rules
set resident_discount_eligible = false
where channel_code in ('CH02','CH03','CH04','CH05')
  and status = 'ACTIVE'
  and resident_discount_eligible = true;
