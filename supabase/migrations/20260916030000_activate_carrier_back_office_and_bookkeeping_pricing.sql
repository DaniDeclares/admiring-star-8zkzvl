-- Approved: activate Carrier Back-Office Support with real pricing (grounded in
-- researched 2026 market comparables -- dispatch/back-office services for
-- owner-operators run $50-150/load flat or $300-650/week for full dispatch;
-- since this service is explicitly admin-first with dispatch only secondary,
-- pricing at the low end of that range is appropriate, not underpriced), and
-- add IFTA quarterly filing to its scope (a real, common, non-brokerage
-- carrier admin expense researched at $30-100/quarter per truck).
--
-- Also wires real dd_service_pricing_rules rows for Bookkeeping Setup and
-- Monthly Bookkeeping & Reconciliation, which were marked CANONICAL_ACTIVE/
-- SELL_NOW with a starting_price already set on the services row, but had
-- zero rows in the actual pricing-rules table the quote engine reads from --
-- same "looks sellable, isn't actually wired" gap found and fixed elsewhere
-- this session. Both use the price already decided on the services row
-- (275/350), not a new number invented here.

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

-- dd_service_pricing_rules_billing_cycle_check only allows ONETIME/HOURLY --
-- 'MONTH' does not exist at the database level, so the recurring/
-- subscription checkout path in create-checkout-session.js
-- (billingCycle==='month') can never actually fire for any real service
-- today; that's a schema decision bigger than this task, not something to
-- push through unilaterally. Since CH04 checkout is already fully manual
-- (confirmed separately this session), price this as ONETIME representing
-- "the monthly rate, invoiced manually each period" -- true recurring
-- billing support remains a real, separate gap.
insert into public.dd_service_pricing_rules (service_id, channel_code, pricing_type, base_price_cents, currency, billing_cycle, status, effective_date)
select id, 'CH04', 'FIXED', 35000, 'USD', 'ONETIME', 'ACTIVE', current_date
from public.services where sku = 'DNI-04A-022'
and not exists (select 1 from public.dd_service_pricing_rules r where r.service_id = services.id and r.channel_code = 'CH04');
