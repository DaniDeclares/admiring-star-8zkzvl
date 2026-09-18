-- Normalize service capability requirements to the provider category vocabulary.
-- The earlier rows used requirement-specific or SKU-specific capability keys
-- (ADMIN_SUPPORT, DOCUMENT_PRODUCTION, DANI_DECLARES_PROVIDER_AGREEMENT,
-- DNI-12A-001...DNI-12A-020) that did not match the provider category picker.
-- Keep the requirement codes themselves unchanged; only align the capability
-- grouping used for provider qualification and evidence routing.
update public.dd_service_capability_requirements
set capability_key = case
  when canonical_sku like 'DNI-04%' then 'ADMIN_BUSINESS_OPS'
  when canonical_sku like 'DNI-05%' then 'NOTARY_PUBLIC'
  when canonical_sku like 'DNI-12%' then 'COURIER_LOGISTICS'
  else capability_key
end
where canonical_sku like 'DNI-04%'
   or canonical_sku like 'DNI-05%'
   or canonical_sku like 'DNI-12%';
