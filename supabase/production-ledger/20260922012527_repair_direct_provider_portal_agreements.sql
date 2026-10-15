-- Directly authorized providers can predate the self-service application flow.
-- Preserve that distinction: link their real auth identity to the existing
-- provider record and allow their e-signature to reference that provider
-- without fabricating a provider application.

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

do $block$
declare
  v_auth_user_id uuid;
  v_provider_id uuid;
begin
  select id into v_auth_user_id
  from auth.users
  where lower(email) = 'chriswalkerjobs@gmail.com'
  order by created_at asc
  limit 1;

  select p.id into v_provider_id
  from public.dd_provider_organizations o
  join public.dd_providers p on p.org_id = o.id and p.is_active = true
  where o.id = '43473f58-c1a6-400b-a8ca-12db91cc618d'
    and o.is_active = true
    and lower(o.contact_email) = 'chriswalkerjobs@gmail.com'
  order by p.created_at asc
  limit 1;

  if v_auth_user_id is null then
    raise exception 'CHRISTOPHER_AUTH_USER_NOT_FOUND';
  end if;
  if v_provider_id is null then
    raise exception 'CHRISTOPHER_ACTIVE_PROVIDER_NOT_FOUND';
  end if;

  insert into public.dd_portal_identities(auth_user_id, portal_role, entity_id, organization_id, is_active)
  values(v_auth_user_id, 'provider', v_provider_id, null, true)
  on conflict (auth_user_id) do update
    set portal_role = 'provider',
        entity_id = excluded.entity_id,
        organization_id = null,
        is_active = true,
        updated_at = now();
end;
$block$;
