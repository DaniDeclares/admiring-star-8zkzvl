revoke execute on function public.dd_contract_staff_access() from anon, authenticated;
revoke execute on function public.dd_portal_identity_strip_self_assigned_scope() from anon, authenticated;
revoke execute on function public.dd_validate_job_evidence_scope() from anon, authenticated;
revoke execute on function public.dd_validate_provider_assignment_capability() from anon, authenticated;

create or replace function public.dd_contract_touch_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$ begin new.updated_at=now(); return new; end; $$;

create or replace function public.dd_portal_onboarding_touch_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$ begin new.updated_at = now(); return new; end $$;

grant execute on function public.dd_contract_staff_access() to service_role;
