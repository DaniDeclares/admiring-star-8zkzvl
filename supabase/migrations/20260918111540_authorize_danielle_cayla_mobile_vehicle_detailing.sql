-- Danielle confirmed directly in chat: "i handle the car washing and detailing. me and cayla."
-- Mobile Vehicle Detailing (DNI-12A-021) was live SELL_NOW/READY but had ZERO authorized
-- provider capability rows in Supabase (found while checking NawfSide's real scope --
-- Airtable shows this SKU as the one genuinely owner-confirmed active, unlike the 5 reverted
-- roadside/tire SKUs). Authorizes both real fulfillers.

INSERT INTO public.dd_provider_capabilities (provider_org_id, provider_id, service_id, service_line, capability_key, is_authorized, tier_availability)
VALUES
  ('19c10267-898f-4c10-a25e-186f6aff8771', 'acba894f-a8c7-4156-b981-fa08acc9e65b', '25ac02f5-8ab3-4ed1-ad52-0898d89b9980', 'Mobile Vehicle Detailing', 'VEHICLE_DETAILING', true, '{}'::jsonb),
  ('04d66fe4-e006-4b8e-988e-e063ae93b8ab', '96b78147-c991-43d2-a3fe-4d9dc49fd90d', '25ac02f5-8ab3-4ed1-ad52-0898d89b9980', 'Mobile Vehicle Detailing', 'VEHICLE_DETAILING', true, '{}'::jsonb);

UPDATE public.dd_governed_service_offers
SET authorized_provider_capability_count = 2
WHERE canonical_sku = 'DNI-12A-021';
