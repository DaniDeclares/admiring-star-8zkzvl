-- Reconcile the overnight soak receipt with the current service authority.
-- History: the original function counted dd_service_support_readiness for both
-- support readiness and total services. That table is a readiness subset and can
-- legitimately be empty while active catalog services exist. The company
-- controller already uses public.services for the authoritative active total.
--
-- This migration changes only services_total. It does not invoke the function,
-- schedule a new job, mutate existing receipts, or infer support readiness.

create or replace function public.dd_capture_overnight_soak_receipt()
returns uuid
language plpgsql
security definer
set search_path to 'public'
as $function$
declare
  v_id uuid;
begin
  insert into public.dd_overnight_soak_receipts(
    research_queued,
    owner_attention_open,
    commercial_conflicts,
    support_ready,
    services_total,
    capability_researching,
    evidence_stale,
    notes
  )
  values(
    (select count(*) from public.dd_research_work_queue where status = 'QUEUED'),
    (select count(*) from public.dd_owner_attention_queue where status = 'OPEN'),
    coalesce((
      select conflicts
      from public.dd_commercial_reconciliation_runs
      order by completed_at desc nulls last
      limit 1
    ), 0),
    (select count(*) from public.dd_service_support_readiness where support_ready),
    (select count(*) from public.services where coalesce(is_active, true) = true),
    (select count(*) from public.dd_capability_gap_queue where status = 'RESEARCHING'),
    (select count(*) from public.dd_research_evidence_registry where status = 'STALE'),
    jsonb_build_object(
      'purpose', 'overnight soak evidence',
      'promotion_authority', false,
      'services_total_source', 'public.services:is_active'
    )
  )
  returning id into v_id;

  return v_id;
end
$function$;

revoke all on function public.dd_capture_overnight_soak_receipt()
  from public, anon, authenticated;
grant execute on function public.dd_capture_overnight_soak_receipt()
  to service_role;
