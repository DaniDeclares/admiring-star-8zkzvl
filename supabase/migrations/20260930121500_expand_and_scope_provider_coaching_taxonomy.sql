-- Provider capability taxonomy must evolve with the service universe without
-- granting dispatch authorization merely because a provider selects a category.
-- Existing ProviderServicesPage dynamically reads these rows, so this also makes
-- the new capability available to providers who onboarded before it existed.

insert into public.dd_provider_capability_categories
(category_key, capability_key, label, description, division_id, display_order, equipment_prompt, credential_prompt, requires_credential, canonical_skus)
values
('LIFE_COACHING','LIFE_COACHING','Life Coaching & Personal Development',
 'Life coaching, goal/accountability coaching, personal development, and related non-clinical coaching services. Selection is a capability claim only; credentials, scope, insurance, and service-specific requirements remain subject to verification.',
 9,141,
 'Describe the coaching formats you can provide (1:1, group, virtual, in-person), your experience, and any tools/materials you use.',
 'List and provide evidence for any coaching certifications, licenses, training, memberships, or other credentials you rely on. Do not represent coaching as licensed clinical, mental-health, legal, financial, or medical practice unless separately authorized and verified.',
 false,
 array['DNI-09A-021','DNI-09A-022','DNI-09A-023','DNI-09A-024','DNI-09A-025']::text[])
on conflict (category_key) do update
set capability_key=excluded.capability_key,label=excluded.label,description=excluded.description,
    division_id=excluded.division_id,display_order=excluded.display_order,
    equipment_prompt=excluded.equipment_prompt,credential_prompt=excluded.credential_prompt,
    requires_credential=excluded.requires_credential,canonical_skus=excluded.canonical_skus;

update public.dd_provider_capability_categories
set description='Facilitating classes, courses, workshops, coaching-adjacent education, and training programs. Providers should separately select Life Coaching & Personal Development when they offer individualized coaching.',
    equipment_prompt='What subjects can you teach or facilitate, in what formats (class, course, workshop, cohort, virtual/in-person), and what subject-matter expertise or credentials support them?',
    canonical_skus=array[
      'DNI-09A-001','DNI-09A-002','DNI-09A-003','DNI-09A-004','DNI-09A-005','DNI-09A-006','DNI-09A-007',
      'DNI-09A-008','DNI-09A-009','DNI-09A-010','DNI-09A-011','DNI-09A-012','DNI-09A-013','DNI-09A-014',
      'DNI-09A-015','DNI-09A-016','DNI-09A-017','DNI-09A-018','DNI-09A-019','DNI-09A-020','DNI-09A-026',
      'DNI-09A-027','DNI-09A-028'
    ]::text[]
where category_key='WORKSHOPS_TRAINING';
