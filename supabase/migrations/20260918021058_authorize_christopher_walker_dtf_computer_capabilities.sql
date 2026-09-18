-- Authorizes Christopher Walker (Danielle's partner and the children's father) for the real
-- DTF/heat-press apparel production and computer/workstation setup work he already performs
-- for Dani Declares LLC. No signed provider agreement or W-9 is on file yet -- this is an
-- explicit owner (Danielle) authorization given directly in chat on 2026-09-18, following the
-- same pattern already used for Danielle's own org record (owner-affirmed facts, no third-party
-- signed agreement required for the authorization itself). Formal provider-portal signup
-- (W-9, written agreement) is still recommended and not yet completed -- agreement_status is
-- left as NOT_ON_FILE to reflect that honestly rather than overstate compliance. Email on file:
-- chriswalkerjobs@gmail.com (an earlier external system had it mistyped as
-- chriswallerjobs@gmail.com -- no matching bad record existed in this database, so nothing to
-- correct here, just noting the correct address for the record).

INSERT INTO public.dd_provider_organizations (
  id, name, vendor_type, is_active, compliance_status, routing_priority, accepts_new_work,
  capacity_status, agreement_status, agreement_type, network_access_level, equipment_summary,
  primary_contact_name, permission_status, qualification_status, compliance_tier, source_reference
) VALUES (
  gen_random_uuid(), 'Christopher Walker - DTF & Technical Support', 'INDIVIDUAL', true, 'PENDING', 5, true,
  'AVAILABLE', 'NOT_ON_FILE', NULL, 'AUTHORIZED', '{}'::jsonb,
  'Christopher Walker', 'APPROVED', 'QUALIFIED', 'STANDARD',
  'Owner (Danielle) directly authorized in chat on 2026-09-18 for DTF/heat-press apparel production and computer/workstation setup work Christopher already performs. Email: chriswalkerjobs@gmail.com. No signed provider agreement or W-9 on file yet -- formal portal signup still recommended.'
);

WITH new_org AS (
  SELECT id FROM public.dd_provider_organizations WHERE name = 'Christopher Walker - DTF & Technical Support' ORDER BY created_at DESC LIMIT 1
), new_provider AS (
  INSERT INTO public.dd_providers (id, org_id, first_name, last_name, is_active, created_at, updated_at, contact_name, role_title, source_system)
  SELECT gen_random_uuid(), new_org.id, 'Christopher', 'Walker', true, now(), now(), 'Christopher Walker', 'DTF Production & Technical Support', 'OWNER_AUTHORIZED_2026-09-18'
  FROM new_org
  RETURNING id, org_id
)
INSERT INTO public.dd_provider_capabilities (provider_org_id, provider_id, service_id, service_line, capability_key, is_authorized, tier_availability)
SELECT np.org_id, np.id, s.id, s.name,
  CASE WHEN s.sku IN ('DNI-11A-017','DNI-11A-018') THEN 'DTF_APPAREL_PRODUCTION' ELSE 'COMPUTER_TECHNICAL_SUPPORT' END,
  true, '{}'::jsonb
FROM new_provider np
CROSS JOIN public.services s
WHERE s.id IN (
  '89d385a7-9fc4-4096-8f6f-0bd3f088ec90',
  'b5412700-138d-4a82-90a8-73c7c0bf93b1',
  '9d3be86d-0c7c-4ada-a203-bcbb9b915b0c',
  '540fb4c0-a164-49aa-a26d-455469d95efe'
);

UPDATE public.dd_governed_service_offers
SET authorized_provider_capability_count = 1
WHERE runtime_service_id IN (
  '89d385a7-9fc4-4096-8f6f-0bd3f088ec90',
  'b5412700-138d-4a82-90a8-73c7c0bf93b1',
  '9d3be86d-0c7c-4ada-a203-bcbb9b915b0c',
  '540fb4c0-a164-49aa-a26d-455469d95efe'
);
