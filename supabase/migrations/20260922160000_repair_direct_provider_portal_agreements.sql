-- Directly authorized providers can predate the self-service application flow.
-- Preserve that distinction by allowing an e-signature to reference the
-- governed provider and provider-organization records without fabricating an
-- application. Provider identity reconciliation remains a governed production
-- data operation; this schema migration contains no environment-specific data.

alter table public.dd_provider_agreement_signatures
  alter column application_id drop not null,
  add column if not exists provider_id uuid references public.dd_providers(id),
  add column if not exists provider_org_id uuid references public.dd_provider_organizations(id);

alter table public.dd_provider_agreement_signatures
  drop constraint if exists dd_provider_agreement_signature_subject_check;

alter table public.dd_provider_agreement_signatures
  add constraint dd_provider_agreement_signature_subject_check
  check (
    (application_id is not null and provider_id is null and provider_org_id is null)
    or
    (application_id is null and provider_id is not null and provider_org_id is not null)
  );

create index if not exists dd_provider_agreement_signatures_provider_id_idx
  on public.dd_provider_agreement_signatures(provider_id);

create unique index if not exists dd_provider_agreement_signatures_direct_version_uidx
  on public.dd_provider_agreement_signatures(provider_id, agreement_version)
  where provider_id is not null;
