-- Real e-signature record for the provider agreement, replacing the
-- previous implicit assumption that a provider had already signed some
-- external paper agreement and just uploads a scan of it. agreement_status
-- on dd_provider_applications now only becomes EXECUTED through this table
-- (written server-side, from api/portal-operations.js's
-- sign_provider_agreement action, which also updates agreement_status in
-- the same request), never by an unattributed staff toggle.
create table if not exists public.dd_provider_agreement_signatures (
  id uuid primary key default gen_random_uuid(),
  application_id uuid not null references public.dd_provider_applications(id),
  signer_user_id uuid not null references auth.users(id),
  signer_full_name text not null,
  agreement_version text not null,
  ip_address text,
  user_agent text,
  signed_at timestamptz not null default now()
);

create index if not exists dd_provider_agreement_signatures_application_id_idx
  on public.dd_provider_agreement_signatures(application_id);

alter table public.dd_provider_agreement_signatures enable row level security;
-- No client policies: all reads/writes go through the service-role API
-- route, same pattern as dd_messages from earlier this session. A signer
-- should not be able to alter or delete their own signature record after
-- the fact.
