-- Reconciled Production form of canonical 20261003182500 provider guard.
-- Production's equivalent guard is minified; the archived SQL below is the exact text Production applied.
-- This file is the ledger source for the hybrid assembler when the formatted repo source would not match the later exact-text replacement.

do $body$
declare
  v_old text := $$OR (v_claim_kind='provider' AND v_claim_payload ? 'providerPayload' AND v_existing_application IS NULL AND (nullif(v_claim_payload->'providerPayload'->>'applicant_type','') IS NULL$$;
  v_new text := $$OR (v_claim_kind='provider' AND v_claim_payload ? 'providerPayload' AND v_existing_application IS NULL AND (nullif(v_claim_payload->'providerPayload'->>'applicant_type','') IS NULL OR nullif(v_claim_payload->'providerPayload'->>'business_name','') IS NULL OR nullif(v_claim_payload->'providerPayload'->>'contact_email','') IS NULL)$$;
begin
  -- exact Production body replacement for the staged intake guard (minified form)
  if not exists (
    select 1 from pg_proc p
    join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'public' and p.proname = 'dd_claim_staged_intake'
  ) then
    raise notice 'dd_claim_staged_intake not present; skip guard reconcile';
    return;
  end if;
  -- body of the function is replaced only when the old minified guard is present
  execute format(
    'create or replace function public.dd_claim_staged_intake(p_claim jsonb) returns jsonb language plpgsql security definer set search_path = public as $fn$%s$fn$',
    replace(
      (select pg_get_functiondef(p.oid) from pg_proc p join pg_namespace n on n.oid = p.pronamespace where n.nspname='public' and p.proname='dd_claim_staged_intake' limit 1),
      v_old, v_new
    )
  );
end;
$body$;
