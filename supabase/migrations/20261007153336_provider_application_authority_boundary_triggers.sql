set local lock_timeout = '5s';
create or replace trigger trg_dd_guard_provider_w9_authority
  before insert or update on public.dd_provider_w9_submissions
  for each row execute function private.dd_guard_provider_w9_authority();
create or replace trigger trg_dd_sync_application_agreement_from_signature
  after insert on public.dd_provider_agreement_signatures
  for each row execute function private.dd_sync_application_agreement_from_signature();
create or replace trigger trg_dd_guard_provider_application_authority
  before insert or update on public.dd_provider_applications
  for each row execute function private.dd_guard_provider_application_authority();