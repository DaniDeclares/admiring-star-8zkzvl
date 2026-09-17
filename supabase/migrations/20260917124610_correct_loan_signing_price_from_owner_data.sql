-- Danielle's own real rate, overriding the earlier web-research estimate ($135):
-- Loan Signing starts at $150 with a set amount of mileage included, then increases
-- beyond that. Switching to STARTING_AT so the catalog correctly shows it as a floor
-- price rather than a flat rate, and noting the mileage structure in the description.
-- The standard per-mile travel formula already built into the Quote Builder
-- ($2.50/mile beyond a 15-mile radius) applies for the overage until Danielle
-- confirms whether loan signings should use a different included-mileage threshold.

UPDATE public.services
SET starting_price = 150.00,
    pricing_type = 'STARTING_AT',
    description = 'Signing-agent support for eligible loan packages, document presentation, signer identification, execution checks and document return according to lender or title instructions and applicable state restrictions. Starting price includes standard local mileage; additional distance is billed per the standard travel rate.',
    updated_at = now()
WHERE id = '628f28c3-4f2a-4a75-bd7f-dffa0dc75cc0'; -- Loan Signing

UPDATE public.dd_service_pricing_rules
SET base_price_cents = 15000, pricing_type = 'STARTING_AT', updated_at = now()
WHERE service_id = '628f28c3-4f2a-4a75-bd7f-dffa0dc75cc0' AND status = 'ACTIVE';
