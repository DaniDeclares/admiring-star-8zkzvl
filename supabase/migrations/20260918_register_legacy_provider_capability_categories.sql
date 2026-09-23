-- Preserve existing provider capability specializations by registering every
-- legacy provider capability key in the governed category vocabulary.
-- This is intentionally non-destructive: provider capability keys and service
-- lines remain intact; authorization is not granted by this migration.

with legacy as (
  select distinct
    pc.capability_key,
    coalesce(
      (
        select s.division_id
        from public.dd_provider_capabilities pc2
        join public.services s on s.id=pc2.service_id
        where pc2.capability_key=pc.capability_key
          and s.division_id is not null
        group by s.division_id
        order by count(*) desc
        limit 1
      ),
      case
        when lower(pc.capability_key) like '%event%'
          or lower(pc.capability_key) in (
            'entertainment','bar_service','beauty_makeup','catering_venue',
            'florals_bloom_bar','live_music','mc_host','photo_booth',
            'photography','photography_content','photography_brand_media',
            'photography_florals','photography_video','video_production',
            'event_rentals','vintage_event_rentals'
          ) then 10
        when lower(pc.capability_key) in (
          'property_event_vending','property_photography','home_watch',
          'handyman_support'
        ) then 2
        when lower(pc.capability_key) in (
          'vehicle_detailing','mobile_tire_installation','puncture_repair',
          'roadside_assistance','tire_mounting_balancing',
          'tire_sales_installation','flat_tire_change','fuel_delivery',
          'jump_start','lockout_key_service'
        ) then 1
        else 4
      end
    ) as division_id
  from public.dd_provider_capabilities pc
  where not exists (
    select 1
    from public.dd_provider_capability_categories c
    where c.capability_key=pc.capability_key
  )
)
insert into public.dd_provider_capability_categories (
  category_key,label,description,division_id,canonical_sku_prefix,
  requires_credential,credential_prompt,equipment_prompt,display_order,capability_key
)
select
  capability_key,
  initcap(replace(capability_key,'_',' ')),
  'Provider capability specialization retained from existing provider evidence; authorization remains controlled by provider qualification and service-specific requirements.',
  division_id,
  null,
  false,
  'No credential is required by this generic capability category unless a service-specific requirement says otherwise.',
  'Document relevant experience, equipment, and service scope for this capability.',
  90,
  capability_key
from legacy;
