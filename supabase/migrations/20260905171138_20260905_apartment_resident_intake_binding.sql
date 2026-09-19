alter table public.dd_portal_onboarding_intakes
  add column if not exists client_organization_id uuid references public.dd_client_organizations(id) on delete set null,
  add column if not exists client_property_id uuid references public.dd_client_properties(id) on delete set null,
  add column if not exists property_resident_invite_id uuid references public.dd_property_resident_invites(id) on delete set null;

create index if not exists idx_dd_portal_intakes_property_binding
  on public.dd_portal_onboarding_intakes(client_organization_id,client_property_id,relationship_type);
