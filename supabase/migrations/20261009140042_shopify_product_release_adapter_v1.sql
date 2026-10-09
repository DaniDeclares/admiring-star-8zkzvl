-- Shopify product-release adapter v1.
-- Registers SHOPIFY in DANI's existing integration registry and creates the
-- private release-asset bucket used by /api/integrations/shopify/media-release.
-- No new registry, queue or planner: connections, links and evidence reuse
-- dd_integration_connections / dd_external_record_links / dd_integration_event_log.
-- Idempotent.

insert into public.dd_integration_adapters
  (adapter_code, provider_name, integration_class, auth_model, supported_objects, inbound_events, outbound_actions, access_state, notes, dani_authority_boundary)
values
  ('SHOPIFY', 'Shopify', 'AUTOMATION',
   'Dev Dashboard app "DANI Product Release" (write_products, write_files); client credentials when eligible, authorization code fallback with encrypted token',
   '["products","product_media","files"]'::jsonb,
   '[]'::jsonb,
   '["attach_product_media","reorder_product_media","detach_replaced_media"]'::jsonb,
   'PLANNED',
   'Product commerce execution rail. The release rail never creates or publishes products and never changes price, SKU, inventory, fulfillment, sales channels or digital-download attachments. Old media is detached only after replacements are READY.',
   'DANI owns product identity, approved pricing, deliverables and release authorization; Shopify owns storefront catalog state, checkout and order capture.')
on conflict (adapter_code) do update set
  provider_name = excluded.provider_name,
  integration_class = excluded.integration_class,
  auth_model = excluded.auth_model,
  supported_objects = excluded.supported_objects,
  inbound_events = excluded.inbound_events,
  outbound_actions = excluded.outbound_actions,
  notes = excluded.notes,
  dani_authority_boundary = excluded.dani_authority_boundary,
  updated_at = now();

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('dd-product-release-assets', 'dd-product-release-assets', false, 20971520,
        array['image/png','image/jpeg','image/webp','application/json'])
on conflict (id) do update set
  public = false,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;
