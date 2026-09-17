-- Danielle confirmed: where a candidate service is genuinely the same real-world job as
-- an already-live generic-stub service, consolidate rather than sell it twice. For each
-- pair below: the live, priced service keeps its SKU/price and receives the candidate's
-- real description (replacing the generic placeholder); the candidate's master-universe
-- row is marked SUPERSEDED so it's never mistakenly reconciled as a second, separate SKU.

CREATE TEMP TABLE tmp_merges (
  target_service_id uuid,
  candidate_master_id uuid,
  candidate_service_id uuid,
  new_description text
);

INSERT INTO tmp_merges VALUES
  ('566091b0-6d80-4cbb-b0b2-e063a23782dd', '367db415-cea1-430f-9f13-840818bdf206', '442cc1da-253e-457c-8699-016fa6deba83',
   'Coordinates vacant-unit turnover tasks across cleaning, repairs, inspection, access, materials, photography and readiness steps; licensed trade work remains separately qualified.'),
  ('eb51de55-91f0-4323-8eb2-801bb0623cf8', '79eb7bad-0fbf-4c11-ab78-5d2ee8b47367', '8fcf3adf-689e-4535-9227-4e785253d0f7',
   'Execution of approved non-licensed punch-list tasks such as hardware adjustments, touch-up support, minor assembly and readiness corrections, with documentation and escalation of licensed work.'),
  ('3839ce16-2e5c-4b97-b1a2-dbcc19a9e108', '61800a3b-e595-4dc7-8742-2419ed3f3c5e', '1a14e5f5-5f35-4d1d-a608-ab7927effc2c',
   'Coordination of approved vendors and field workers for property tasks, including assignment, access instructions, scheduling, status tracking and completion evidence.'),
  ('32c7eff7-1f41-4a83-87fe-d1e63653c3a4', 'b728a600-e6f9-452b-a870-c7d28152b7d7', '2cc5d94a-014e-4408-af7e-8bd7db5b4792',
   'Coordination of approved facilities-support activities, vendors, schedules, work orders and documentation for government or institutional clients.'),
  ('bfc8c181-8f95-4579-9aee-c29b58341207', 'bd4c7f34-ce21-4c74-ad11-57f5081b352b', '5e1dbe81-babb-4b94-8490-36a65692858f',
   'Development or refinement of coordinated visual identity elements such as logo direction, typography, imagery guidance and brand usage standards.'),
  ('aafbddd7-3c1e-4d94-9d42-c2da983bed8f', 'f9128436-9bde-45c7-8865-eec862a95baf', '7f4a925c-6ba2-4c0e-8896-eb59c4322122',
   'Time-sensitive sourcing of approved event materials, replacement items or supplies when standard procurement timelines are insufficient.'),
  ('43b08c62-f668-4013-ba51-36389f1aac95', 'f1d4be22-15ce-4fe6-b392-c2538ac91b75', 'ed54de87-b284-48cb-8f61-9b8f11a49af6',
   'On-site management of approved wedding-day logistics, vendor arrival, timeline execution, guest flow, setup and teardown coordination and issue escalation.'),
  ('749db68b-7376-4b00-9e32-f259845e58ff', '25ba4f8b-5273-4a86-9263-f208ee04524c', '94f4329e-0989-4b45-af78-7da3dbbd9c6b',
   'Administrative staffing and support for approved government or institutional workflows, including records, scheduling, correspondence and task tracking.')
;

UPDATE public.services s SET description = t.new_description, updated_at = now()
FROM tmp_merges t WHERE s.id = t.target_service_id;

UPDATE public.dd_master_service_universe m
SET lifecycle_status = 'SUPERSEDED',
    conflict_register = 'Merged 2026-09-17: duplicate of an already-live service (same real-world job under a different name). Description consolidated onto the live SKU; this candidate retired rather than priced separately.'
FROM tmp_merges t WHERE m.id = t.candidate_master_id;

UPDATE public.services s SET commercial_status = 'SUPERSEDED', updated_at = now()
FROM tmp_merges t WHERE s.id = t.candidate_service_id;

DROP TABLE tmp_merges;

-- Loan Signing and Notary Route Service were priced at $75 flat, both from before this
-- session. Real market research: standard loan-package signings run $100-200 (refinances
-- typically $100-125), and a *multi-stop route* of several notary appointments is priced
-- above a single mobile-notary visit ($40-75), not equal to it. Both were underpriced
-- relative to their actual complexity, independent of anything found in the duplicate
-- audit above. Neither service currently has an authorized provider (no one in the system
-- holds a valid Georgia notary commission yet -- confirmed earlier this session), so this
-- has no live revenue impact today, but needed correcting before anyone is authorized.

UPDATE public.services SET starting_price = 135.00, updated_at = now()
WHERE id = '628f28c3-4f2a-4a75-bd7f-dffa0dc75cc0'; -- Loan Signing

UPDATE public.dd_service_pricing_rules SET base_price_cents = 13500, updated_at = now()
WHERE service_id = '628f28c3-4f2a-4a75-bd7f-dffa0dc75cc0' AND status = 'ACTIVE';

UPDATE public.services SET starting_price = 95.00, pricing_type = 'STARTING_AT', updated_at = now()
WHERE id = 'ba1c9013-c9fb-46c7-95f6-d4ab99e17bce'; -- Notary Route Service

UPDATE public.dd_service_pricing_rules SET base_price_cents = 9500, pricing_type = 'STARTING_AT', updated_at = now()
WHERE service_id = 'ba1c9013-c9fb-46c7-95f6-d4ab99e17bce' AND status = 'ACTIVE';
