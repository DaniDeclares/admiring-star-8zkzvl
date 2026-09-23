-- Corrective fix for the 3 objects classified "genuinely exposed" in the
-- 2026-09-23 SECURITY DEFINER audit (see /mnt/project-files/security-definer-audit-2026-09-23.md).
-- The other 8 flagged objects are intentionally left untouched -- they are
-- either unnecessarily privileged but not currently exploitable, or already
-- correctly designed; each needs its own evidence-based pass, not a blanket
-- migration.
--
-- Evidence that "no app caller" holds for all three (so this fix removes no
-- live access path):
--   - Full-repo grep across src/, api/, supabase/functions/, and every other
--     non-migration path for each object's exact name returned zero matches.
--   - The Supabase advisor's own SECURITY DEFINER / EXECUTE findings on these
--     3 are the only place they surface at all; nothing in application code
--     references dd_provider_assignment_readiness_v1,
--     dd_worker_assignment_classification_guard_v1, or
--     dd_provider_meets_work_package_requirements.
--   - Every base table dd_provider_assignment_readiness_v1 and
--     dd_worker_assignment_classification_guard_v1 read from
--     (dd_provider_applications, dd_provider_stripe_connect_accounts,
--     dd_provider_w9_submissions, dd_providers, dd_provider_organizations,
--     dd_provider_compliance_items) already has RLS enabled with policies
--     scoped only to `authenticated` (self-row via auth.uid(), org
--     membership, or private.dd_is_staff_admin()) -- none grant anon
--     anything. Confirmed by reading pg_policies directly, not assumed.
--
-- Fixes:
--   1-2. Both views: `security_invoker = true` (the same fix already used in
--        this repo for dd_master_service_customer_routing and
--        dd_master_service_capability_channel_matrix -- see
--        20260828234942_set_master_views_security_invoker.sql). The view
--        then runs under the querying role's own privileges, so it inherits
--        the correct, already-scoped RLS on every table above instead of
--        bypassing it as the view owner (postgres).
--   3. dd_provider_meets_work_package_requirements(): add the same
--      auth.uid() + actor-authorization check already used in this file's
--      sibling functions dd_complete_job/dd_start_job (staff, or the
--      provider whose own capabilities are being checked), then revoke the
--      PUBLIC/anon EXECUTE grants left over from function creation. Logic
--      is otherwise byte-for-byte identical to the current function.
--
-- What breaks if this is wrong: since no caller exists today, the only
-- possible failure is a caller that exists somewhere outside this repo
-- (a mobile client, a script) getting PROVIDER_ACTOR_UNAUTHORIZED /
-- AUTH_REQUIRED from the function, or fewer/zero rows from either view.
-- No data is altered or deleted by this migration.
--
-- Reversal:
--   alter view public.dd_provider_assignment_readiness_v1 reset (security_invoker);
--   alter view public.dd_worker_assignment_classification_guard_v1 reset (security_invoker);
--   grant execute on function public.dd_provider_meets_work_package_requirements(uuid, uuid) to anon, public;
--   -- and recreate the function with the original body (no auth check),
--   -- preserved verbatim in the audit file's tool output / git history of
--   -- this migration.

begin;

do $$
begin
  if not exists (select 1 from pg_views where schemaname='public' and viewname='dd_provider_assignment_readiness_v1') then
    raise exception 'Migration aborted: dd_provider_assignment_readiness_v1 missing -- live schema has drifted.';
  end if;
  if not exists (select 1 from pg_views where schemaname='public' and viewname='dd_worker_assignment_classification_guard_v1') then
    raise exception 'Migration aborted: dd_worker_assignment_classification_guard_v1 missing -- live schema has drifted.';
  end if;
  if not exists (
    select 1 from pg_proc p join pg_namespace n on n.oid=p.pronamespace
    where n.nspname='public' and p.proname='dd_provider_meets_work_package_requirements'
  ) then
    raise exception 'Migration aborted: dd_provider_meets_work_package_requirements missing -- live schema has drifted.';
  end if;

  if exists (
    select 1 from pg_class c join pg_namespace n on n.oid=c.relnamespace
    where n.nspname='public' and c.relname='dd_provider_assignment_readiness_v1'
      and c.reloptions is not null and 'security_invoker=true' = any(c.reloptions)
  ) then
    raise exception 'Migration aborted: dd_provider_assignment_readiness_v1 is already security_invoker -- this fix may already be applied.';
  end if;
  if exists (
    select 1 from pg_class c join pg_namespace n on n.oid=c.relnamespace
    where n.nspname='public' and c.relname='dd_worker_assignment_classification_guard_v1'
      and c.reloptions is not null and 'security_invoker=true' = any(c.reloptions)
  ) then
    raise exception 'Migration aborted: dd_worker_assignment_classification_guard_v1 is already security_invoker -- this fix may already be applied.';
  end if;
  if exists (
    select 1 from pg_proc p join pg_namespace n on n.oid=p.pronamespace
    where n.nspname='public' and p.proname='dd_provider_meets_work_package_requirements'
      and pg_get_functiondef(p.oid) like '%PROVIDER_ACTOR_UNAUTHORIZED%'
  ) then
    raise exception 'Migration aborted: dd_provider_meets_work_package_requirements already has the authorization check -- this fix may already be applied.';
  end if;
end $$;

alter view public.dd_provider_assignment_readiness_v1 set (security_invoker = true);
alter view public.dd_worker_assignment_classification_guard_v1 set (security_invoker = true);

create or replace function public.dd_provider_meets_work_package_requirements(p_provider_id uuid, p_work_package_id uuid)
 returns jsonb
 language plpgsql
 security definer
 set search_path to 'public', 'private'
as $function$
declare
  v_missing jsonb := '[]'::jsonb;
  v_req record;
  v_count integer;
  actor_is_staff boolean;
  actor_provider uuid;
begin
  if auth.uid() is null then
    raise exception 'AUTH_REQUIRED';
  end if;

  actor_is_staff := private.dd_is_staff_admin();
  actor_provider := private.dd_current_provider_id();

  if not actor_is_staff and (actor_provider is null or actor_provider <> p_provider_id) then
    raise exception 'PROVIDER_ACTOR_UNAUTHORIZED';
  end if;

  for v_req in
    select * from public.dd_work_package_requirements
    where work_package_id=p_work_package_id and required
  loop
    if v_req.requirement_type='CAPABILITY' then
      select count(*) into v_count
      from public.dd_provider_capabilities pc
      where pc.provider_id=p_provider_id
        and pc.is_authorized
        and pc.capability_key=v_req.requirement_code;
    elsif v_req.requirement_type='ASSET' then
      select coalesce(sum(pa.quantity),0)::integer into v_count
      from public.dd_provider_assets pa
      where pa.provider_id=p_provider_id
        and pa.is_active and pa.serviceable
        and pa.verification_status in ('VERIFIED','APPROVED')
        and pa.asset_code=v_req.requirement_code;
    else
      v_count := 1;
    end if;
    if coalesce(v_count,0) < v_req.minimum_quantity then
      v_missing := v_missing || jsonb_build_array(jsonb_build_object(
        'type',v_req.requirement_type,'code',v_req.requirement_code,'requiredQuantity',v_req.minimum_quantity,'availableQuantity',coalesce(v_count,0)
      ));
    end if;
  end loop;
  return jsonb_build_object('eligible',jsonb_array_length(v_missing)=0,'missing',v_missing);
end;
$function$;

revoke execute on function public.dd_provider_meets_work_package_requirements(uuid, uuid) from public;
revoke execute on function public.dd_provider_meets_work_package_requirements(uuid, uuid) from anon;

commit;
