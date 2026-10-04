-- Owner interruption filter repair: ACTIONABLE_NOW remains visible/rankable,
-- but only OWNER_ONLY (or owner-only blocked) interrupts the owner.
-- Reuses existing governor, attention queue, view, and consumers.

create or replace function private.dd_governor_evaluate_attention(p_item public.dd_owner_attention_queue)
returns jsonb
language plpgsql stable security definer set search_path = '' as $$
declare
  md jsonb := coalesce(p_item.metadata, '{}'::jsonb);
  econ jsonb := coalesce(p_item.metadata->'economics', '{}'::jsonb);
  sq public.dd_sales_queue%rowtype;
  sq_econ jsonb := '{}'::jsonb;
  has_sq boolean := false;
  v_sales_item boolean;
  v_reasons text[] := '{}';
  v_still_needed boolean := true;
  v_contact text := 'NOT_APPLICABLE';
  v_wake timestamptz;
  v_inbound boolean := false;
  v_hold boolean := false;
  v_waiting boolean := false;
  v_route_broken boolean := false;
  v_dnc boolean := false;
  v_is_spend boolean;
  v_is_revenue boolean;
  v_unknown_pay boolean := false;
  v_authority text;
  v_gross numeric;
  v_cost numeric;
  v_contrib numeric;
  v_basis text;
  v_econ_status text;
  v_conf numeric;
  v_ttc numeric;
  v_checked timestamptz;
  v_age numeric;
  v_freshness text := 'CURRENT';
  v_prio numeric;
  v_econ_pts numeric := 0;
  v_mult numeric;
  v_state text;
  v_next text;
  v_touch jsonb;
  v_evt record;
  v_status text;
  v_suppressed_by text;
begin
  -- Current source state --------------------------------------------------------
  if p_item.source_table = 'dd_sales_queue'
     and p_item.source_record_id ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' then
    select * into sq from public.dd_sales_queue where id = p_item.source_record_id::uuid;
    has_sq := found;
    if not has_sq then
      v_still_needed := false;
      v_reasons := v_reasons || 'SOURCE_RECORD_MISSING'::text;
    end if;
  elsif p_item.source_table = 'dd_promotion_candidates' then
    select owner_approval_status into v_status
      from public.dd_promotion_candidates where candidate_key = p_item.source_record_id;
    if v_status is not null and v_status not in ('NOT_REQUESTED', 'REQUESTED', 'PENDING') then
      v_still_needed := false;
      v_reasons := v_reasons || ('PROMOTION_ALREADY_' || v_status);
    end if;
  elsif p_item.source_table = 'dd_owner_problem_inbox' then
    select status into v_status
      from public.dd_owner_problem_inbox where id::text = p_item.source_record_id;
    if v_status is not null and v_status not in ('OPEN', 'CLASSIFIED') then
      v_still_needed := false;
      v_reasons := v_reasons || ('PROBLEM_' || v_status);
    end if;
  end if;

  v_sales_item := has_sq and coalesce(p_item.domain, '') !~* '(FULFIL|QA|ACCOUNT|PROVIDER)';

  if has_sq then
    sq_econ := coalesce(sq.sales_metadata->'economics', '{}'::jsonb);
    if v_sales_item and (sq.disposition in ('PAYMENT_SUCCEEDED', 'NOT_INTERESTED')
        or (coalesce(sq.amount_collected, 0) > 0 and coalesce(sq.amount_collected, 0) >= coalesce(sq.quoted_amount, 0))) then
      v_still_needed := false;
      v_reasons := v_reasons || ('SALE_CLOSED_' || sq.disposition);
    end if;
  end if;

  -- Contact permission ------------------------------------------------------------
  if has_sq then
    v_dnc := sq.do_not_contact or sq.disposition = 'DO_NOT_CONTACT'
          or coalesce(to_jsonb(sq)->>'relationship_role', '') = 'do_not_contact';
    v_route_broken := sq.campaign_status in ('BOUNCED', 'UNSUBSCRIBED');
    v_inbound := sq.campaign_status = 'RESPONDED';

    select e.direction, e.occurred_at into v_evt
      from public.dd_lead_contact_events e
     where e.sales_queue_id = sq.id and e.occurred_at > now() - interval '5 days'
       and (e.direction ilike 'in%' or e.direction ilike 'out%')  -- REDISCOVERED/NONE events are not touches
     order by e.occurred_at desc limit 1;
    if found then
      if v_evt.direction ilike 'in%' then
        v_inbound := true;
      elsif v_evt.direction ilike 'out%' then
        v_waiting := true;
        v_wake := greatest(v_wake, v_evt.occurred_at + interval '5 days');
        v_reasons := v_reasons || 'RECENT_OUTBOUND_CONTACT_EVENT'::text;
      end if;
    end if;

    if sq.next_permitted_contact_at > now() then
      v_waiting := true;
      v_wake := greatest(v_wake, sq.next_permitted_contact_at);
      v_reasons := v_reasons || 'NEXT_PERMITTED_CONTACT_IN_FUTURE'::text;
    elsif sq.last_contacted_at > now() - interval '5 days' then
      v_waiting := true;
      v_wake := greatest(v_wake, sq.last_contacted_at + interval '5 days');
      v_reasons := v_reasons || 'CONTACTED_IN_LAST_5_DAYS'::text;
    end if;

    -- Shared multi-mailbox memory (pending branch tester/extend-525-527-no-recontact).
    -- Used only when that function has been applied; never required.
    if sq.email is not null and to_regprocedure('private.dd_recent_mailbox_touch(text,integer)') is not null then
      begin
        execute 'select private.dd_recent_mailbox_touch($1, 5)' into v_touch using sq.email;
        if coalesce((v_touch->>'found')::boolean, false) then
          if coalesce(v_touch->>'direction', '') ilike 'in%' then
            v_inbound := true;
          else
            v_waiting := true;
            v_wake := greatest(v_wake, private.dd_try_timestamptz(v_touch->>'received_at') + interval '5 days');
            v_reasons := v_reasons || 'RECENT_MAILBOX_TOUCH'::text;
          end if;
        end if;
      exception when others then
        v_reasons := v_reasons || 'MAILBOX_TOUCH_CHECK_FAILED'::text;
      end;
    end if;
  end if;

  v_dnc := v_dnc or coalesce((md->>'do_not_contact')::boolean, false);
  v_route_broken := v_route_broken or upper(coalesce(md->>'contact_route_status', '')) in ('BOUNCED', 'INVALID');
  if private.dd_try_timestamptz(md->>'waiting_until') > now() then
    v_waiting := true;
    v_wake := greatest(v_wake, private.dd_try_timestamptz(md->>'waiting_until'));
    v_reasons := v_reasons || 'WAITING_ON_COUNTERPARTY'::text;
  end if;
  if v_inbound then
    -- A reply from them outranks our own cool-down.
    v_waiting := false;
    v_wake := null;
    v_reasons := v_reasons || 'INBOUND_REPLY_PENDING'::text;
  end if;

  -- Campaign suppression (dd_sales_queue.campaign_status = SUPPRESSED) is a structured hold set by the
  -- context contract, bounce handling and outreach cool-downs. An inbound reply still gets answered.
  if has_sq and sq.campaign_status = 'SUPPRESSED' and not v_dnc and not v_inbound then
    v_status := coalesce(nullif(to_jsonb(sq)->>'campaign_suppression_reason', ''), 'CAMPAIGN_SUPPRESSED');
    if v_status ~* 'BOUNCE' then
      v_route_broken := true;
    elsif v_status ~* '^RECENT_OUTREACH' then
      v_waiting := true;
    else
      v_suppressed_by := v_status;
    end if;
    v_reasons := v_reasons || 'CAMPAIGN_SUPPRESSED'::text;
  end if;

  v_contact := case
    when v_dnc then 'DENIED_DO_NOT_CONTACT'
    when v_route_broken then 'ROUTE_BROKEN'
    when v_waiting then 'WAIT_UNTIL'
    when has_sq or md ? 'contact_route_status' then 'PERMITTED'
    else 'NOT_APPLICABLE' end;

  v_hold := private.dd_try_timestamptz(md->>'hold_until') > now()
         or coalesce((md->>'legitimately_held')::boolean, false);

  -- Economics ----------------------------------------------------------------------
  v_is_spend := econ ? 'spend_cents' or coalesce((md->>'spend')::boolean, false);
  v_is_revenue := v_sales_item or econ ? 'expected_gross_cents'
                  or coalesce((md->>'revenue_bearing')::boolean, false);
  v_conf := coalesce((econ->>'fulfillment_confidence')::numeric, (sq_econ->>'fulfillment_confidence')::numeric,
                     case lower(coalesce(md->>'fulfillment_available', sq_econ->>'fulfillment_available'))
                       when 'true' then 0.9 when 'false' then 0.2 end,
                     0.5);
  v_ttc := greatest(coalesce((econ->>'time_to_cash_days')::numeric, (sq_econ->>'time_to_cash_days')::numeric, 7), 0);

  if v_is_spend then
    v_cost := (econ->>'spend_cents')::numeric / 100;
    if coalesce((econ->>'revenue_unlock_verified')::boolean, false) then
      v_gross := (econ->>'revenue_unlock_cents')::numeric / 100;
      v_econ_status := 'VERIFIED';
    else
      v_econ_status := 'UNPROVEN';
      v_reasons := v_reasons || 'SPEND_WITHOUT_VERIFIED_REVENUE_UNLOCK'::text;
    end if;
    if v_gross is not null and v_cost is not null then
      v_contrib := v_gross - v_cost;
      v_basis := 'VERIFIED_REVENUE_UNLOCK_MINUS_SPEND';
      v_econ_pts := greatest(-500, least(2000, v_contrib * 4 / (1 + v_ttc / 3)));
    end if;
  else
    v_gross := coalesce((econ->>'expected_gross_cents')::numeric / 100,
                        (sq_econ->>'expected_gross_cents')::numeric / 100,
                        nullif(sq.quoted_amount, 0));
    v_cost := coalesce((econ->>'direct_cost_cents')::numeric / 100,
                       (sq_econ->>'direct_cost_cents')::numeric / 100);
    if lower(coalesce(econ->>'compensation_known', sq_econ->>'compensation_known', '')) = 'false' then
      v_gross := null;
      v_unknown_pay := true;
      v_reasons := v_reasons || 'COMPENSATION_UNKNOWN'::text;
    end if;
    if v_gross is null then
      -- Our own priced offer that simply has no quote yet is NOT_QUOTED (still actionable);
      -- an outside opportunity whose pay is unknown is UNPROVEN.
      v_econ_status := case
        when v_unknown_pay then 'UNPROVEN'
        when has_sq then 'NOT_QUOTED'
        when v_is_revenue then 'UNPROVEN'
        else 'NOT_APPLICABLE' end;
    elsif v_cost is null then
      v_econ_status := 'GROSS_ONLY';
      v_contrib := null;
      v_basis := 'GROSS_ONLY_DIRECT_COST_UNKNOWN';
      v_econ_pts := least(2000, v_gross * 0.5 * v_conf * 4 / (1 + v_ttc / 3));
    else
      v_contrib := v_gross - v_cost;
      v_econ_status := case when upper(coalesce(econ->>'evidence_status', sq_econ->>'evidence_status', '')) = 'VERIFIED'
                            then 'VERIFIED' else 'MODELED' end;
      v_basis := 'GROSS_MINUS_DIRECT_COST';
      v_econ_pts := greatest(-500, least(2000, v_contrib * v_conf * 4 / (1 + v_ttc / 3)));
    end if;
  end if;

  -- Authority ----------------------------------------------------------------------
  v_authority := upper(coalesce(md->>'authority', md->>'required_authority', ''));
  v_authority := case
    when v_is_spend then 'OWNER_ONLY'
    when v_authority like '%OWNER%' then 'OWNER_ONLY'
    when v_suppressed_by ~* 'owner' then 'OWNER_ONLY'
    when v_authority like 'SYSTEM%' then 'SYSTEM_EXECUTABLE'
    when p_item.domain in ('PRODUCTION_PROMOTION', 'OWNER_HORIZON') then 'OWNER_ONLY'
    else 'OWNER_REVIEW' end;

  -- Freshness ----------------------------------------------------------------------
  v_checked := greatest(p_item.created_at, sq.updated_at,
                        private.dd_try_timestamptz(md->>'observed_at'),
                        private.dd_try_timestamptz(md->>'detected_at'),
                        private.dd_try_timestamptz(md->>'evidence_checked_at'));
  v_age := round(extract(epoch from (now() - coalesce(v_checked, now()))) / 86400.0, 1);

  -- State ----------------------------------------------------------------------------
  v_state := case
    when not v_still_needed then 'STALE'
    when v_hold then 'LEGITIMATELY_HELD'
    when v_dnc then 'BLOCKED'
    when v_route_broken then 'BLOCKED'
    when v_waiting then 'WAITING'
    when v_suppressed_by is not null then 'BLOCKED'
    when v_is_spend then 'OWNER_ONLY'
    when v_is_revenue and v_econ_status = 'UNPROVEN' then 'ECONOMICALLY_UNPROVEN'
    when coalesce(md->>'blocked_by', '') <> '' then 'BLOCKED'
    when v_authority = 'SYSTEM_EXECUTABLE' then 'SYSTEM_EXECUTABLE'
    when v_authority = 'OWNER_ONLY' then 'OWNER_ONLY'
    else 'ACTIONABLE_NOW' end;

  if v_age > 7 and v_state in ('ACTIONABLE_NOW', 'OWNER_ONLY', 'BLOCKED') then
    v_freshness := 'AGED';
    v_reasons := v_reasons || ('EVIDENCE_' || v_age || '_DAYS_OLD_REVERIFY');
  end if;

  v_next := case v_state
    when 'STALE' then 'Remove from attention: the source no longer needs action.'
    when 'LEGITIMATELY_HELD' then 'Held: ' || coalesce(md->>'hold_reason', 'documented hold') || '.'
    when 'WAITING' then 'Wait for the counterparty; do not re-contact before ' || coalesce(to_char(v_wake at time zone 'America/New_York', 'YYYY-MM-DD HH24:MI') || ' ET', 'the cool-down ends') || '.'
    when 'BLOCKED' then case
      when v_dnc then 'Suppressed: do not contact, whatever the revenue.'
      when v_route_broken then 'Repair the contact route (find a deliverable address); never resend to the failed one.'
      else 'Clear the blocker: ' || coalesce(nullif(md->>'blocked_by', ''), v_suppressed_by, 'unknown') || '.' end
    when 'ECONOMICALLY_UNPROVEN' then 'Establish pay/price and direct cost before spending owner time.'
    when 'OWNER_ONLY' then case when v_is_spend
      then 'Owner investment decision: approve only if verified revenue unlocked exceeds the spend.'
      else coalesce(p_item.recommended_action, 'Owner decision required.') end
    when 'SYSTEM_EXECUTABLE' then 'System can execute; owner does not need to act.'
    else coalesce(p_item.recommended_action, 'Act now.') end;

  -- Rank ------------------------------------------------------------------------------
  v_prio := case upper(coalesce(p_item.priority, ''))
    when 'P0' then 1000 when 'URGENT' then 1000 when 'CRITICAL' then 1000
    when 'P1' then 600 when 'HIGH' then 600
    when 'P2' then 300 when 'MEDIUM' then 300
    else 150 end;
  v_mult := case v_state
    when 'ACTIONABLE_NOW' then 1.0
    when 'OWNER_ONLY' then 1.0
    when 'BLOCKED' then case when v_dnc then 0 else 0.4 end
    when 'ECONOMICALLY_UNPROVEN' then 0.35
    when 'SYSTEM_EXECUTABLE' then 0.15
    when 'WAITING' then 0.05
    when 'LEGITIMATELY_HELD' then 0.02
    else 0 end;
  if v_freshness = 'AGED' then v_mult := v_mult * 0.6; end if;
  if v_inbound and v_state = 'ACTIONABLE_NOW' then v_mult := v_mult * 1.25; end if;

  return jsonb_build_object(
    'version', 'governor-v2-owner-interruption-filter',
    'state', v_state,
    'rank_score', round(greatest(v_mult * (v_prio + v_econ_pts), 0)),
    'needs_owner_now', v_state = 'OWNER_ONLY'
                       or (v_state = 'BLOCKED' and v_authority = 'OWNER_ONLY' and not v_dnc),
    'still_needed', v_still_needed,
    'next_action', v_next,
    'reasons', to_jsonb(v_reasons),
    'contact_permission', v_contact,
    'wake_at', v_wake,
    'authority', v_authority,
    'economics', jsonb_build_object(
      'status', v_econ_status,
      'expected_gross', v_gross,
      'direct_cost', v_cost,
      'contribution', v_contrib,
      'contribution_basis', v_basis,
      'fulfillment_confidence', v_conf,
      'time_to_cash_days', v_ttc,
      'is_spend', v_is_spend,
      'rank_points', round(v_econ_pts)),
    'freshness', jsonb_build_object('status', v_freshness, 'evidence_checked_at', v_checked, 'age_days', v_age),
    'source_state', case when has_sq then jsonb_build_object(
      'disposition', sq.disposition, 'campaign_status', sq.campaign_status,
      'last_contacted_at', sq.last_contacted_at, 'next_permitted_contact_at', sq.next_permitted_contact_at,
      'quoted_amount', sq.quoted_amount, 'amount_collected', sq.amount_collected) end,
    'evaluated_at', now());
end $$;


revoke all on function private.dd_governor_evaluate_attention(public.dd_owner_attention_queue) from public, anon, authenticated;
grant execute on function private.dd_governor_evaluate_attention(public.dd_owner_attention_queue) to service_role;

create or replace function public.dd_governor_regression_proof()
returns jsonb language plpgsql security definer set search_path = '' as $$
declare
  v_out jsonb := '[]'::jsonb;
  v_pass boolean := true;
  r_rpm uuid; r_quinn uuid; r_turn uuid; r_dnc uuid; r_touch uuid; r_paid uuid; r_paid2 uuid; r_new uuid; a_new uuid; r_ctx uuid; r_bnc uuid; a_ctx uuid; a_bnc uuid;
  a_rpm uuid; a_quinn uuid; a_wego uuid; a_net uuid; a_turn uuid; a_low uuid; a_dnc uuid; a_touch uuid; a_paid2 uuid;
  g jsonb; g2 jsonb; n int; s1 numeric; s2 numeric; v_before numeric; v_closed_status text;
  procedure_marker text := 'GOVERNOR_PROOF_' || to_char(now(), 'YYYYMMDDHH24MISS');
begin
  if current_user not in ('postgres', 'service_role') then
    raise exception 'service_role required';
  end if;
  begin
    -- SIMULATION fixtures (rolled back below) ---------------------------------------
    insert into public.dd_sales_queue(contact_name, company_name, email, lane, source, disposition, campaign_status,
                                      last_contacted_at, next_permitted_contact_at, sales_metadata)
      values ('SIMULATION RPM Dina', 'SIMULATION RPM Living', 'sim-rpm@example.invalid', 'WARM', 'GMAIL_SENT',
              'NOT_CONTACTED', 'SENT', now() - interval '2 days', now() + interval '3 days',
              jsonb_build_object('simulation', procedure_marker)) returning id into r_rpm;
    insert into public.dd_sales_queue(contact_name, company_name, email, lane, source, disposition, campaign_status, sales_metadata)
      values ('SIMULATION Quinn', 'SIMULATION The Quinn', 'sim-quinn@example.invalid', 'EMAIL_ONLY', 'GMAIL_SENT',
              'NOT_CONTACTED', 'BOUNCED', jsonb_build_object('simulation', procedure_marker)) returning id into r_quinn;
    insert into public.dd_sales_queue(contact_name, email, lane, source, disposition, campaign_status, quoted_amount, sales_metadata)
      values ('SIMULATION inbound turn', 'sim-turn@example.invalid', 'INBOUND', 'GMAIL_INBOUND', 'QUOTE_REQUESTED', 'RESPONDED', 350,
              jsonb_build_object('simulation', procedure_marker, 'economics',
                jsonb_build_object('direct_cost_cents', 15000, 'time_to_cash_days', 2, 'fulfillment_available', true,
                                   'evidence_status', 'VERIFIED'))) returning id into r_turn;
    insert into public.dd_sales_queue(contact_name, email, lane, source, disposition, do_not_contact, quoted_amount, sales_metadata)
      values ('SIMULATION DNC', 'sim-dnc@example.invalid', 'WARM', 'GMAIL_SENT', 'NOT_CONTACTED', true, 5000,
              jsonb_build_object('simulation', procedure_marker)) returning id into r_dnc;
    insert into public.dd_sales_queue(contact_name, email, lane, source, disposition, quoted_amount, sales_metadata)
      values ('SIMULATION multi-mailbox touch', 'sim-touch@example.invalid', 'WARM', 'GMAIL_SENT', 'NOT_CONTACTED', 900,
              jsonb_build_object('simulation', procedure_marker)) returning id into r_touch;
    insert into public.dd_lead_contact_events(sales_queue_id, event_type, channel, direction, outcome, occurred_at, metadata)
      values (r_touch, 'OUTBOUND', 'EMAIL', 'OUTBOUND', 'SENT', now() - interval '1 day',
              jsonb_build_object('simulation', procedure_marker, 'mailbox', 'danideclaresns@gmail.com'));
    insert into public.dd_sales_queue(contact_name, email, lane, source, disposition, quoted_amount, amount_collected, sales_metadata)
      values ('SIMULATION collected', 'sim-paid@example.invalid', 'INBOUND', 'GMAIL_INBOUND', 'PAYMENT_SUCCEEDED', 160, 160,
              jsonb_build_object('simulation', procedure_marker)) returning id into r_paid;
    insert into public.dd_sales_queue(contact_name, email, lane, source, disposition, quoted_amount, sales_metadata)
      values ('SIMULATION closes later', 'sim-paid2@example.invalid', 'INBOUND', 'GMAIL_INBOUND', 'READY_TO_BUY', 200,
              jsonb_build_object('simulation', procedure_marker)) returning id into r_paid2;

    insert into public.dd_owner_attention_queue(domain, source_table, source_record_id, reason, priority, metadata)
      values ('SALES', 'dd_sales_queue', r_rpm::text, 'SIMULATION: call/reply RPM', 'P1', jsonb_build_object('simulation', procedure_marker))
      returning id into a_rpm;
    insert into public.dd_owner_attention_queue(domain, source_table, source_record_id, reason, priority, metadata)
      values ('SALES', 'dd_sales_queue', r_quinn::text, 'SIMULATION: resend to The Quinn', 'P1', jsonb_build_object('simulation', procedure_marker))
      returning id into a_quinn;
    insert into public.dd_owner_attention_queue(domain, source_table, source_record_id, reason, priority, metadata)
      values ('SALES', 'dd_world_external_opportunities', procedure_marker || ':wegolook', 'SIMULATION: WeGoLook Atlanta job', 'P1',
              jsonb_build_object('simulation', procedure_marker, 'revenue_bearing', true,
                                 'economics', jsonb_build_object('compensation_known', false)))
      returning id into a_wego;
    insert into public.dd_owner_attention_queue(domain, source_table, source_record_id, reason, priority, metadata)
      values ('PLATFORM_RUNTIME', 'dd_production_learning_signals', procedure_marker || ':netlify', 'SIMULATION: buy Netlify credits', 'P0',
              jsonb_build_object('simulation', procedure_marker,
                                 'economics', jsonb_build_object('spend_cents', 1900, 'revenue_unlock_verified', false)))
      returning id into a_net;
    insert into public.dd_owner_attention_queue(domain, source_table, source_record_id, reason, priority, metadata)
      values ('SALES', 'dd_sales_queue', r_turn::text, 'SIMULATION: verified inbound $350 turn', 'P1', jsonb_build_object('simulation', procedure_marker))
      returning id into a_turn;
    insert into public.dd_owner_attention_queue(domain, source_table, source_record_id, reason, priority, metadata)
      values ('SALES', 'dd_world_external_opportunities', procedure_marker || ':lowvalue', 'SIMULATION: low-value P0 lead', 'P0',
              jsonb_build_object('simulation', procedure_marker, 'economics',
                jsonb_build_object('expected_gross_cents', 8000, 'direct_cost_cents', 6000, 'time_to_cash_days', 14)))
      returning id into a_low;
    insert into public.dd_owner_attention_queue(domain, source_table, source_record_id, reason, priority, metadata)
      values ('SALES', 'dd_sales_queue', r_dnc::text, 'SIMULATION: $5,000 DNC lead', 'P0', jsonb_build_object('simulation', procedure_marker))
      returning id into a_dnc;
    insert into public.dd_owner_attention_queue(domain, source_table, source_record_id, reason, priority, metadata)
      values ('SALES', 'dd_sales_queue', r_touch::text, 'SIMULATION: follow up (other mailbox already touched)', 'P1', jsonb_build_object('simulation', procedure_marker))
      returning id into a_touch;
    insert into public.dd_owner_attention_queue(domain, source_table, source_record_id, reason, priority, metadata)
      values ('SALES', 'dd_sales_queue', r_paid::text, 'SIMULATION: speed-to-lead on a paid customer', 'P1', jsonb_build_object('simulation', procedure_marker));
    insert into public.dd_owner_attention_queue(domain, source_table, source_record_id, reason, priority, metadata)
      values ('SALES', 'dd_sales_queue', r_paid2::text, 'SIMULATION: close this sale', 'P1', jsonb_build_object('simulation', procedure_marker))
      returning id into a_paid2;

    -- 1. RPM already contacted => WAITING, not call/reply
    select metadata->'governor' into g from public.dd_owner_attention_queue where id = a_rpm;
    v_out := v_out || jsonb_build_object('case', 'RPM_ALREADY_CONTACTED', 'expect', 'WAITING, owner not needed',
      'got', g->>'state', 'needs_owner_now', g->'needs_owner_now', 'next_action', g->>'next_action',
      'pass', g->>'state' = 'WAITING' and not (g->>'needs_owner_now')::boolean);
    -- 2. The Quinn bounced => route repair / block, not resend
    select metadata->'governor' into g from public.dd_owner_attention_queue where id = a_quinn;
    v_out := v_out || jsonb_build_object('case', 'QUINN_BOUNCED', 'expect', 'BLOCKED + ROUTE_BROKEN',
      'got', g->>'state', 'contact', g->>'contact_permission', 'next_action', g->>'next_action',
      'pass', g->>'state' = 'BLOCKED' and g->>'contact_permission' = 'ROUTE_BROKEN');
    -- 3. WeGoLook unknown pay => ECONOMICALLY_UNPROVEN
    select metadata->'governor' into g from public.dd_owner_attention_queue where id = a_wego;
    v_out := v_out || jsonb_build_object('case', 'WEGOLOOK_PAY_UNKNOWN', 'expect', 'ECONOMICALLY_UNPROVEN',
      'got', g->>'state', 'pass', g->>'state' = 'ECONOMICALLY_UNPROVEN');
    -- 4. Netlify credits => OWNER_ONLY; rank follows verified revenue unlocked vs cost
    select metadata->'governor' into g from public.dd_owner_attention_queue where id = a_net;
    s1 := (g->>'rank_score')::numeric;
    update public.dd_owner_attention_queue set metadata = metadata || jsonb_build_object('economics',
      jsonb_build_object('spend_cents', 1900, 'revenue_unlock_verified', true, 'revenue_unlock_cents', 60000, 'time_to_cash_days', 3))
     where id = a_net;
    select metadata->'governor' into g2 from public.dd_owner_attention_queue where id = a_net;
    s2 := (g2->>'rank_score')::numeric;
    v_out := v_out || jsonb_build_object('case', 'NETLIFY_CREDITS_OWNER_SPEND', 'expect', 'OWNER_ONLY; rank rises only when revenue unlock is verified',
      'got', g->>'state', 'economics_unverified', g->'economics'->>'status', 'rank_unverified', s1,
      'rank_verified', s2, 'pass', g->>'state' = 'OWNER_ONLY' and g2->>'state' = 'OWNER_ONLY'
                                    and g->'economics'->>'status' = 'UNPROVEN' and s2 > s1);
    -- revert to unverified for the comparison below
    update public.dd_owner_attention_queue set metadata = metadata || jsonb_build_object('economics',
      jsonb_build_object('spend_cents', 1900, 'revenue_unlock_verified', false)) where id = a_net;
    -- 5. Verified $350 inbound turn with fulfillment pre-empts lower-value work
    select metadata->'governor' into g from public.dd_owner_attention_queue where id = a_turn;
    select (metadata->'governor'->>'rank_score')::numeric into s1 from public.dd_owner_attention_queue where id = a_low;
    select (metadata->'governor'->>'rank_score')::numeric into s2 from public.dd_owner_attention_queue where id = a_net;
    v_out := v_out || jsonb_build_object('case', 'INBOUND_350_TURN_PREEMPTS', 'expect', 'ACTIONABLE_NOW and outranks low-value P0 lead and unverified spend',
      'got', g->>'state', 'rank', g->'rank_score', 'low_value_p0_rank', s1, 'unverified_spend_rank', s2,
      'contribution', g->'economics'->'contribution',
      'pass', g->>'state' = 'ACTIONABLE_NOW' and (g->>'rank_score')::numeric > s1 and (g->>'rank_score')::numeric > s2);
    -- 6. DNC and recent multi-mailbox touch => suppressed regardless of revenue
    select metadata->'governor' into g from public.dd_owner_attention_queue where id = a_dnc;
    select metadata->'governor' into g2 from public.dd_owner_attention_queue where id = a_touch;
    v_out := v_out || jsonb_build_object('case', 'DNC_AND_RECENT_TOUCH_SUPPRESSED', 'expect', 'DNC BLOCKED rank 0; touched WAITING',
      'dnc_state', g->>'state', 'dnc_rank', g->'rank_score', 'touch_state', g2->>'state',
      'pass', g->>'state' = 'BLOCKED' and (g->>'rank_score')::numeric = 0 and not (g->>'needs_owner_now')::boolean
              and g2->>'state' = 'WAITING');
    -- 7. Collected/closed => no attention (insert skipped; open item superseded on close)
    select count(*) into n from public.dd_owner_attention_queue
     where source_table = 'dd_sales_queue' and source_record_id = r_paid::text and status = 'OPEN';
    update public.dd_sales_queue set disposition = 'PAYMENT_SUCCEEDED', amount_collected = 200 where id = r_paid2;
    select status into v_closed_status from public.dd_owner_attention_queue where id = a_paid2;
    v_out := v_out || jsonb_build_object('case', 'COLLECTED_REMOVED_FROM_ATTENTION', 'expect', '0 open for paid; open item SUPERSEDED when sale closes',
      'open_for_paid', n, 'closed_later_status', v_closed_status,
      'pass', n = 0 and v_closed_status = 'SUPERSEDED');
    -- 8. Changed economics/evidence => re-rank in place, no duplicate item
    select (metadata->'governor'->>'rank_score')::numeric into v_before from public.dd_owner_attention_queue where id = a_rpm;
    update public.dd_sales_queue set next_permitted_contact_at = now() - interval '1 minute',
                                     last_contacted_at = now() - interval '6 days', quoted_amount = 1200,
                                     campaign_status = 'RESPONDED'
     where id = r_rpm;
    insert into public.dd_owner_attention_queue(domain, source_table, source_record_id, reason, priority, metadata)
      values ('SALES', 'dd_sales_queue', r_rpm::text, 'SIMULATION: RPM replied, quote now', 'P1',
              jsonb_build_object('economics', jsonb_build_object('direct_cost_cents', 50000, 'time_to_cash_days', 5)));
    select count(*) into n from public.dd_owner_attention_queue
     where source_table = 'dd_sales_queue' and source_record_id = r_rpm::text and status = 'OPEN';
    select metadata->'governor' into g from public.dd_owner_attention_queue where id = a_rpm;
    v_out := v_out || jsonb_build_object('case', 'EVIDENCE_CHANGE_RERANKS_IN_PLACE', 'expect', 'one OPEN item, state ACTIONABLE_NOW, rank up',
      'open_items', n, 'state', g->>'state', 'rank_before', v_before, 'rank_after', g->'rank_score',
      'pass', n = 1 and g->>'state' = 'ACTIONABLE_NOW' and (g->>'rank_score')::numeric > v_before);

    -- 9. Fresh inbound lead with no quote yet stays in front of the owner (not "unproven")
    insert into public.dd_sales_queue(contact_name, email, lane, source, disposition, sales_metadata)
      values ('SIMULATION new inbound', 'sim-new@example.invalid', 'INBOUND', 'GMAIL_INBOUND', 'NOT_CONTACTED',
              jsonb_build_object('simulation', procedure_marker)) returning id into r_new;
    insert into public.dd_owner_attention_queue(domain, source_table, source_record_id, reason, priority, metadata)
      values ('SALES', 'dd_sales_queue', r_new::text, 'SIMULATION: Speed-to-lead SLA exceeded', 'P1', jsonb_build_object('simulation', procedure_marker))
      returning id into a_new;
    select metadata->'governor' into g from public.dd_owner_attention_queue where id = a_new;
    v_out := v_out || jsonb_build_object('case', 'UNQUOTED_INBOUND_LEAD_STAYS_ACTIONABLE', 'expect', 'ACTIONABLE_NOW, economics NOT_QUOTED, owner interruption false',
      'got', g->>'state', 'economics', g->'economics'->>'status',
      'pass', g->>'state' = 'ACTIONABLE_NOW' and g->'economics'->>'status' = 'NOT_QUOTED' and not (g->>'needs_owner_now')::boolean);

    -- 10. Campaign-suppressed rows: context hold leaves owner-now; bounce suppression is a broken route
    insert into public.dd_sales_queue(contact_name, email, lane, source, disposition, campaign_status, campaign_suppression_reason, sales_metadata)
      values ('SIMULATION suppressed context', 'sim-ctx@example.invalid', 'WARM', 'GMAIL_SENT', 'NOT_CONTACTED', 'SUPPRESSED',
              'CONTEXT_INCOMPLETE: PAIN,PRIMARY_OFFER', jsonb_build_object('simulation', procedure_marker)) returning id into r_ctx;
    insert into public.dd_sales_queue(contact_name, email, lane, source, disposition, campaign_status, campaign_suppression_reason, sales_metadata)
      values ('SIMULATION suppressed bounce', 'sim-bnc@example.invalid', 'WARM', 'GMAIL_SENT', 'NOT_CONTACTED', 'SUPPRESSED',
              'EMAIL_BOUNCE_2026-09-23', jsonb_build_object('simulation', procedure_marker)) returning id into r_bnc;
    update public.dd_sales_queue set campaign_status = 'SUPPRESSED',
           campaign_suppression_reason = 'CONTEXT_INCOMPLETE: PAIN,PRIMARY_OFFER' where id = r_ctx;
    update public.dd_sales_queue set campaign_status = 'SUPPRESSED',
           campaign_suppression_reason = 'EMAIL_BOUNCE_2026-09-23' where id = r_bnc;
    insert into public.dd_owner_attention_queue(domain, source_table, source_record_id, reason, priority, metadata)
      values ('SALES', 'dd_sales_queue', r_ctx::text, 'SIMULATION: launch outreach', 'P1', jsonb_build_object('simulation', procedure_marker))
      returning id into a_ctx;
    insert into public.dd_owner_attention_queue(domain, source_table, source_record_id, reason, priority, metadata)
      values ('SALES', 'dd_sales_queue', r_bnc::text, 'SIMULATION: follow up', 'P1', jsonb_build_object('simulation', procedure_marker))
      returning id into a_bnc;
    select metadata->'governor' into g from public.dd_owner_attention_queue where id = a_ctx;
    select metadata->'governor' into g2 from public.dd_owner_attention_queue where id = a_bnc;
    v_out := v_out || jsonb_build_object('case', 'CAMPAIGN_SUPPRESSED_NOT_OWNER_NOW', 'expect', 'context hold BLOCKED not owner-now; bounce ROUTE_BROKEN',
      'ctx_state', g->>'state', 'ctx_needs_owner_now', g->'needs_owner_now', 'ctx_next_action', g->>'next_action',
      'bounce_state', g2->>'state', 'bounce_contact', g2->>'contact_permission',
      'pass', g->>'state' = 'BLOCKED' and not (g->>'needs_owner_now')::boolean
              and g2->>'state' = 'BLOCKED' and g2->>'contact_permission' = 'ROUTE_BROKEN');

    raise exception 'GOVERNOR_PROOF_ROLLBACK';
  exception when others then
    if sqlerrm <> 'GOVERNOR_PROOF_ROLLBACK' then
      return jsonb_build_object('status', 'ERROR', 'error', sqlerrm, 'cases', v_out, 'fixtures_rolled_back', true);
    end if;
  end;

  select coalesce(bool_and((c->>'pass')::boolean), false) into v_pass from jsonb_array_elements(v_out) c;
  return jsonb_build_object('status', case when v_pass and jsonb_array_length(v_out) = 10 then 'PASSED' else 'FAILED' end,
                            'cases', v_out, 'fixtures_rolled_back', true, 'label', 'SIMULATION',
                            'external_contact', false, 'money_action', false);
end $$;


revoke all on function public.dd_governor_regression_proof() from public, anon, authenticated;
grant execute on function public.dd_governor_regression_proof() to service_role;

-- Re-evaluate existing open rows through the existing BEFORE UPDATE governor trigger.
update public.dd_owner_attention_queue
set metadata = metadata
where status = 'OPEN';

select public.dd_governor_rerank_owner_attention();
