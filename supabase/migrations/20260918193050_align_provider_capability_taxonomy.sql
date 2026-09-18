-- Align legacy provider capability records with the governed provider taxonomy.
update public.dd_provider_capabilities
set capability_key='NOTARY_PUBLIC'
where capability_key='NOTARY_COMMISSIONED';

update public.dd_provider_capabilities
set capability_key='ADMIN_BUSINESS_OPS'
where capability_key='BUSINESS_OPERATIONS_CONSULTING';

-- Add the missing governed category required by the officiant service.
insert into public.dd_provider_capability_categories (
  category_key,label,description,division_id,canonical_sku_prefix,
  requires_credential,credential_prompt,equipment_prompt,display_order,capability_key
)
select
  'OFFICIANT_ORDAINED',
  'Wedding Officiant',
  'Ceremony officiation requiring proof of ordination or other legally sufficient authority where applicable.',
  10,'10A',true,
  'Requires proof of ordination or other legally sufficient officiant authority for the service location.',
  'Do you have the ceremony materials and equipment needed for officiant services?',
  30,'OFFICIANT_ORDAINED'
where not exists (
  select 1 from public.dd_provider_capability_categories
  where capability_key='OFFICIANT_ORDAINED'
);
