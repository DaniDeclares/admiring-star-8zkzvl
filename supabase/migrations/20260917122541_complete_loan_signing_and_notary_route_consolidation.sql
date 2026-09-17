-- Follow-up: the prior migration fixed Loan Signing and Notary Route Service pricing but
-- missed merging in their duplicate candidates' descriptions and marking those candidates
-- SUPERSEDED -- completing that here.

UPDATE public.services
SET description = 'Signing-agent support for eligible loan packages, document presentation, signer identification, execution checks and document return according to lender or title instructions and applicable state restrictions.',
    updated_at = now()
WHERE id = '628f28c3-4f2a-4a75-bd7f-dffa0dc75cc0'; -- Loan Signing

UPDATE public.services
SET description = 'Coordinated mobile notary route service for multiple authorized appointments or document stops, subject to commission scope and travel requirements.',
    updated_at = now()
WHERE id = 'ba1c9013-c9fb-46c7-95f6-d4ab99e17bce'; -- Notary Route Service

UPDATE public.dd_master_service_universe
SET lifecycle_status = 'SUPERSEDED',
    conflict_register = 'Merged 2026-09-17: duplicate of an already-live service (same real-world job under a different name). Description consolidated onto the live SKU; this candidate retired rather than priced separately.'
WHERE id IN ('95473e1b-974a-4b63-8e6d-deca0c4300bc', '691bebf8-9537-417b-97de-58f5d2145e60'); -- Loan Signing & Closing Document Signing / Notary Route & Multi-Stop Service

UPDATE public.services
SET commercial_status = 'SUPERSEDED', updated_at = now()
WHERE id IN ('2754802d-bd73-4ee3-a5c0-39e7fe90c751', 'b545be1e-92b3-4506-afb5-089145b86deb');
