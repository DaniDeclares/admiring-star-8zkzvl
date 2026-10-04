-- Keep the Morning Brief owner-attention summary aligned with the governor interruption contract.
-- open_count remains backlog visibility; needs_owner_now is the actual Danielle interruption count.

create or replace function public.dd_generate_company_morning_brief()
returns uuid
language plpgsql
security definer
set search_path to 'public'
as $function$
declare
  v_id uuid;
  v_base uuid;
  v_status text;
  v_last dd_overnight_soak_receipts%rowtype;
begin
  perform dd_run_company_controller();
  select * into v_last from dd_overnight_soak_receipts order by run_at desc limit 1;
  v_base := v_last.id;
  select case
    when exists(select 1 from dd_company_domain_state where status='RED') then 'RED'
    when exists(select 1 from dd_company_domain_state where status in ('YELLOW','UNKNOWN')) then 'YELLOW'
    else 'GREEN'
  end into v_status;

  insert into dd_company_morning_briefs(
    brief_date, baseline_soak_receipt_id, company_status, headline,
    overnight_verified, revenue_sales, owner_attention, meaningful_changes, unresolved_blockers,
    software_platform, business_health, evidence
  )
  values(
    current_date, v_base, v_status,
    'DANI morning operating brief — verified state only.',
    jsonb_build_object(
      'latest_soak_receipt', v_base,
      'research_queued', v_last.research_queued,
      'owner_attention_open', v_last.owner_attention_open,
      'support_ready', v_last.support_ready,
      'services_total', v_last.services_total,
      'capability_researching', v_last.capability_researching,
      'evidence_stale', v_last.evidence_stale
    ),
    (
      select jsonb_build_object(
        'sales_queue', coalesce((metrics->>'sales_queue')::int,0),
        'status', status
      )
      from dd_company_domain_state
      where domain='SALES_REVENUE'
    ),
    jsonb_build_object(
      'open_count', (
        select count(*) from dd_owner_attention_queue where status='OPEN'
      ),
      'needs_owner_now', (
        select count(*) from dd_owner_attention_queue
        where status='OPEN'
          and coalesce((metadata->'governor'->>'needs_owner_now')::boolean,false)
      ),
      'deferred_count', (
        select count(*) from dd_owner_attention_queue
        where status='OPEN'
          and not coalesce((metadata->'governor'->>'needs_owner_now')::boolean,false)
      ),
      'p0', (
        select count(*) from dd_owner_attention_queue
        where status='OPEN'
          and priority='P0'
          and coalesce((metadata->'governor'->>'needs_owner_now')::boolean,false)
      ),
      'p1', (
        select count(*) from dd_owner_attention_queue
        where status='OPEN'
          and priority='P1'
          and coalesce((metadata->'governor'->>'needs_owner_now')::boolean,false)
      )
    ),
    coalesce((
      select jsonb_agg(jsonb_build_object('domain', domain, 'changes', meaningful_changes))
      from dd_company_domain_state
      where jsonb_array_length(meaningful_changes) > 0
    ), '[]'::jsonb),
    coalesce((
      select jsonb_agg(jsonb_build_object(
        'domain', domain, 'status', status, 'blockers', blockers, 'next', next_autonomous_action
      ))
      from dd_company_domain_state
      where status in ('RED','YELLOW','UNKNOWN')
    ), '[]'::jsonb),
    (
      select jsonb_build_object(
        'status', status, 'metrics', metrics, 'next', next_autonomous_action, 'evidence', evidence
      )
      from dd_company_domain_state
      where domain='SOFTWARE_PLATFORM'
    ),
    (
      select jsonb_object_agg(domain, jsonb_build_object('status', status, 'metrics', metrics))
      from dd_company_domain_state
    ),
    jsonb_build_object(
      'generator','dd_generate_company_morning_brief',
      'generated_at',now(),
      'verified_only',true,
      'production_authority',false
    )
  )
  on conflict (brief_date) do update set
    generated_at=now(),
    baseline_soak_receipt_id=excluded.baseline_soak_receipt_id,
    company_status=excluded.company_status,
    headline=excluded.headline,
    overnight_verified=excluded.overnight_verified,
    revenue_sales=excluded.revenue_sales,
    owner_attention=excluded.owner_attention,
    meaningful_changes=excluded.meaningful_changes,
    unresolved_blockers=excluded.unresolved_blockers,
    software_platform=excluded.software_platform,
    business_health=excluded.business_health,
    evidence=excluded.evidence
  returning id into v_id;

  return v_id;
end
$function$;

revoke all on function public.dd_generate_company_morning_brief() from public, anon, authenticated;
grant execute on function public.dd_generate_company_morning_brief() to service_role;

select public.dd_generate_company_morning_brief();
