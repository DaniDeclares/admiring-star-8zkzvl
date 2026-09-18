-- Activates Cassandra Rosser's real, already-executed Division 04 bookkeeping/financial-ops
-- authorization. A signed "Master Independent Service Provider, Confidentiality, Data Security
-- & Work Product Agreement Version 3.0" (dated Aug 11, 2026, between Dani Declares LLC and
-- Cassandra Rosser, scoped to bookkeeping/financial-operations work under Division 04) was
-- uploaded and read in full this session. The org record previously showed
-- agreement_status='NOT_ON_FILE' / compliance_status='PENDING', which understated reality --
-- corrected here to match the real, verified document. Her 6 dd_provider_capabilities rows
-- (AP/AR admin, financial readiness, cash-flow budgeting, financial reporting, monthly
-- bookkeeping, bookkeeping setup) were already correctly tied to real Division 04 service_ids
-- but sitting is_authorized=false with authorized_provider_capability_count=0 on the
-- corresponding governed offers -- this is why Division 04 showed zero checkout-eligible
-- services despite a real, signed contractor being in place. Danielle confirmed activation
-- directly ("Activate all three of them").

UPDATE public.dd_provider_organizations
SET agreement_status = 'EXECUTED',
    compliance_status = 'VERIFIED',
    agreement_type = 'INDEPENDENT_SERVICE_PROVIDER'
WHERE id = '47eda04f-1ed4-4727-8e07-57018236009c';

WITH new_provider AS (
  INSERT INTO public.dd_providers (id, org_id, first_name, last_name, is_active, created_at, updated_at, contact_name, role_title, source_system)
  VALUES (gen_random_uuid(), '47eda04f-1ed4-4727-8e07-57018236009c', 'Cassandra', 'Rosser', true, now(), now(), 'Cassandra Rosser', 'Business & Financial Support Partner', 'OWNER_CONFIRMED_REAL_AGREEMENT_2026-09-18')
  RETURNING id
)
UPDATE public.dd_provider_capabilities
SET is_authorized = true, provider_id = (SELECT id FROM new_provider)
WHERE provider_org_id = '47eda04f-1ed4-4727-8e07-57018236009c';

UPDATE public.dd_governed_service_offers
SET authorized_provider_capability_count = 1
WHERE runtime_service_id IN (
  '71b92e11-bc4b-4213-bda4-9d2c934d3f07',
  '2963c9dd-a0cf-47e8-8cc1-d2c20269f8b4',
  '6643e448-0084-44aa-8453-35b2a378aa5a',
  '869ef48b-b38e-4b1d-bd9e-8b75e5a9bfba',
  '5f963cb7-e123-4c63-ab4c-03f8b22504d9',
  'ce04322b-7ace-4fd2-aa80-6621cfa7db8d'
);
