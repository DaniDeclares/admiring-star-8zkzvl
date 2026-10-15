-- Keep the existing revenue controller aligned with the canonical quote command.
-- This is intentionally not a SKU matcher: an explicit, governed SKU and a
-- quote-ready disposition must already exist before a draft can be created.

create or replace function public.dd_run_revenue_orchestrator()
returns jsonb
language plpgsql
security definer
set search_path to 'public'
as $function$
declare
  v_promoted int := 0;
  v_quote int := 0;
  v_blocked int := 0;
  v_qualification jsonb;
  r record;
  v_est uuid;
begin
  select public.dd_promote_verified_research_leads() into v_promoted;
  select public.dd_run_revenue_qualification_handoff(20) into v_qualification;

  for r in
    select id
    from public.dd_sales_queue
    where disposition in ('QUOTE_REQUESTED', 'READY_TO_BUY')
      and suggested_sku is not null
      and not (coalesce(sales_metadata, '{}'::jsonb) ? 'estimate_id')
    order by updated_at asc
    limit 10
  loop
    begin
      select public.dd_create_quote_draft_from_sales(r.id) into v_est;
      v_quote := v_quote + 1;
    exception when others then
      v_blocked := v_blocked + 1;
    end;
  end loop;

  return jsonb_build_object(
    'status', 'COMPLETED',
    'verified_leads_promoted', v_promoted,
    'qualification_handoff', v_qualification,
    'internal_quote_drafts_created', v_quote,
    'blocked', v_blocked,
    'external_contact', false,
    'pricing_published', false,
    'money_action', false
  );
end
$function$;

revoke all on function public.dd_run_revenue_orchestrator() from public, anon, authenticated;
grant execute on function public.dd_run_revenue_orchestrator() to service_role;

comment on function public.dd_run_revenue_orchestrator() is
  'Internal revenue controller. Creates idempotent internal quote drafts only for explicit governed SKUs on QUOTE_REQUESTED or READY_TO_BUY rows; no outreach, pricing publication, or money action.';
