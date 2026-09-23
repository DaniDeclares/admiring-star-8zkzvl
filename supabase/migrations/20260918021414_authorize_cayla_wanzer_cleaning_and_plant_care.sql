-- Authorizes Cayla Wanzer as Dani Declares LLC's second cleaner and plant-care provider.
-- Danielle confirmed directly in chat (2026-09-18): "She's my best friend and also approved.
-- She works with me often on cleaning jobs and knows everything about plants." Her last name
-- (Wanzer) was identified earlier from a real Zelle payment record, not guessed. As with
-- Christopher Walker, no signed provider agreement or W-9 is on file yet -- this is an explicit
-- owner authorization, recorded honestly as NOT_ON_FILE rather than overstated. She is
-- authorized on every real service Danielle already covers under capability_key='CLEANING'
-- (same SKU, second fulfiller -- no new pricing needed, per the earlier same-service-category
-- vendor model) plus the 6 dedicated Plant Care service lines in Division 01C. Existing
-- authorized_provider_capability_count values are incremented by 1 rather than overwritten,
-- since Danielle's own authorization on these same offers must be preserved.

INSERT INTO public.dd_provider_organizations (
  id, name, vendor_type, is_active, compliance_status, routing_priority, accepts_new_work,
  capacity_status, agreement_status, agreement_type, network_access_level, equipment_summary,
  primary_contact_name, permission_status, qualification_status, compliance_tier, source_reference
) VALUES (
  gen_random_uuid(), 'Cayla Wanzer - Cleaning & Plant Care', 'INDIVIDUAL', true, 'PENDING', 4, true,
  'AVAILABLE', 'NOT_ON_FILE', NULL, 'AUTHORIZED', '{}'::jsonb,
  'Cayla Wanzer', 'APPROVED', 'QUALIFIED', 'STANDARD',
  'Owner (Danielle) directly authorized in chat on 2026-09-18 as second cleaner and plant-care provider. No signed provider agreement or W-9 on file yet -- formal portal signup still recommended.'
);

WITH new_org AS (
  SELECT id FROM public.dd_provider_organizations WHERE name = 'Cayla Wanzer - Cleaning & Plant Care' ORDER BY created_at DESC LIMIT 1
), new_provider AS (
  INSERT INTO public.dd_providers (id, org_id, first_name, last_name, is_active, created_at, updated_at, contact_name, role_title, source_system)
  SELECT gen_random_uuid(), new_org.id, 'Cayla', 'Wanzer', true, now(), now(), 'Cayla Wanzer', 'Cleaning & Plant Care', 'OWNER_AUTHORIZED_2026-09-18'
  FROM new_org
  RETURNING id, org_id
), cleaning_services AS (
  SELECT DISTINCT service_id FROM public.dd_provider_capabilities
  WHERE provider_org_id = '19c10267-898f-4c10-a25e-186f6aff8771' AND capability_key = 'CLEANING'
), plant_services AS (
  SELECT id AS service_id FROM public.services WHERE id IN (
    '3a27b145-2e2f-4917-bfe3-9c1aa86e9a89',
    '58cc4c07-cb4f-41e2-8f8e-a162061c4752',
    '7c0b818d-33e4-4b5b-b528-fcc095dc4e2e',
    '158005dc-859d-4eef-945f-7cdd6eb47fe7',
    '1bc45071-deaf-4f53-846a-caa6e37fcebf',
    'efa797f3-90bf-45f7-9e09-cc816509fdf1'
  )
), all_services AS (
  SELECT service_id, 'CLEANING' AS cap_key FROM cleaning_services
  UNION ALL
  SELECT service_id, 'PLANT_CARE' AS cap_key FROM plant_services
)
INSERT INTO public.dd_provider_capabilities (provider_org_id, provider_id, service_id, service_line, capability_key, is_authorized, tier_availability)
SELECT np.org_id, np.id, s.id, s.name, a.cap_key, true, '{}'::jsonb
FROM new_provider np
CROSS JOIN all_services a
JOIN public.services s ON s.id = a.service_id;

UPDATE public.dd_governed_service_offers
SET authorized_provider_capability_count = authorized_provider_capability_count + 1
WHERE runtime_service_id IN (
  SELECT service_id FROM public.dd_provider_capabilities
  WHERE provider_org_id = '19c10267-898f-4c10-a25e-186f6aff8771' AND capability_key = 'CLEANING'
  UNION
  SELECT id FROM public.services WHERE id IN (
    '3a27b145-2e2f-4917-bfe3-9c1aa86e9a89',
    '58cc4c07-cb4f-41e2-8f8e-a162061c4752',
    '7c0b818d-33e4-4b5b-b528-fcc095dc4e2e',
    '158005dc-859d-4eef-945f-7cdd6eb47fe7',
    '1bc45071-deaf-4f53-846a-caa6e37fcebf',
    'efa797f3-90bf-45f7-9e09-cc816509fdf1'
  )
);
