update public.services
set
  sku = 'DNI-12A-028',
  starting_price = 75,
  price_note = 'Starting per-load price; monthly retainer available at $500/month for ongoing engagements.',
  description = description || ' Also includes quarterly IFTA fuel-tax filing administration.',
  is_active = true,
  commercial_status = 'CANONICAL_ACTIVE',
  commercial_intent_status = 'SELL_NOW',
  source_status = 'ACTIVATED_WITH_RESEARCHED_PRICING',
  public_price_display = 'Starting at $75/load'
where name = 'Carrier Back-Office Support' and sku is null;

insert into public.dd_service_pricing_rules (service_id, channel_code, pricing_type, base_price_cents, currency, billing_cycle, status, effective_date)
select id, 'CH04', 'FIXED', 7500, 'USD', 'ONETIME', 'ACTIVE', current_date
from public.services where sku = 'DNI-12A-028'
and not exists (select 1 from public.dd_service_pricing_rules r where r.service_id = services.id and r.channel_code = 'CH04');

insert into public.dd_service_pricing_rules (service_id, channel_code, pricing_type, base_price_cents, currency, billing_cycle, status, effective_date)
select id, 'CH04', 'FIXED', 27500, 'USD', 'ONETIME', 'ACTIVE', current_date
from public.services where sku = 'DNI-04A-021'
and not exists (select 1 from public.dd_service_pricing_rules r where r.service_id = services.id and r.channel_code = 'CH04');

insert into public.dd_service_pricing_rules (service_id, channel_code, pricing_type, base_price_cents, currency, billing_cycle, status, effective_date)
select id, 'CH04', 'FIXED', 35000, 'USD', 'ONETIME', 'ACTIVE', current_date
from public.services where sku = 'DNI-04A-022'
and not exists (select 1 from public.dd_service_pricing_rules r where r.service_id = services.id and r.channel_code = 'CH04');