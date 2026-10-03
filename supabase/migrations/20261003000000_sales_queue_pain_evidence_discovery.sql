-- Sales queue context contract v2: pain evidence state and discovery-only follow-up.
-- Owner rule 2026-10-02 21:24Z (Dani): keep the no-invention guardrail, but do not collapse three states:
--   KNOWN           pain learned from the buyer or relationship evidence (pain_point);
--   OBSERVED_SIGNAL a researched operational signal (hiring, re-leasing, vendor onboarding...), never "buyer said X";
--   UNKNOWN         no reliable evidence; ask a discovery question instead of asserting a problem.
-- v1 (#527) froze every row without pain. v2 keeps pitches blocked until pain is KNOWN, and marks rows that may
-- receive a discovery-only follow-up: the question comes from the locked dd_ch02_commercial_triggers library,
-- the row's own property-management front door, or the owner's generic property question. campaign_eligible stays
-- false for these rows; the discovery flag lives in sales_metadata.context_contract. Nothing here sends anything.
--
-- Also: research_claims.pain_point is a researched claim, so it is now recorded as an observed signal and no
-- longer written into pain_point.

create or replace function private.dd_normalize_sales_queue_context()
returns trigger language plpgsql security definer set search_path = '' as $$
declare
  md jsonb := coalesce(new.sales_metadata, '{}'::jsonb);
  v_class text;
  v_fd text;
  v_fd_basis text;
  v_gaps text[] := '{}';
  v_signal text;
  v_pain_ev text;
  v_trigger text;
  v_dq text;
  v_dq_basis text;
  v_discovery boolean := false;
begin
  v_class := private.dd_sales_buyer_class(new.buyer_type, md->>'channel_code');

  if coalesce(new.buyer_type,'') = '' or new.buyer_type ~ '^CH0[0-9]$' then
    new.buyer_type := v_class;
  end if;

  -- Known pain only from buyer/relationship facts carried by the row.
  if coalesce(new.pain_point,'') = '' then
    new.pain_point := nullif(coalesce(md->>'pain_point', md->>'need_summary'), '');
  end if;
  if coalesce(new.solution_statement,'') = '' then
    new.solution_statement := nullif(coalesce(md->>'primary_offer', md->'research_claims'->>'service_hint',
                                              new.suggested_sku, new.capture_offer_code), '');
  end if;

  -- Researched signals stay signals.
  v_signal := nullif(coalesce(md->>'observed_signal', md->'research_claims'->>'pain_point'), '');

  if coalesce(new.front_door_code,'') ~ '^CH0[1-5]-F0[1-9]$' then
    v_fd_basis := coalesce(md->'context_contract'->>'front_door_basis', 'EXPLICIT');
  else
    v_fd := private.dd_infer_front_door(v_class, concat_ws(' ', new.pain_point, new.solution_statement));
    if v_fd is not null then
      if coalesce(new.front_door_code,'') <> '' then
        md := md || jsonb_build_object('front_door_code_replaced', new.front_door_code);
      end if;
      new.front_door_code := v_fd;
      v_fd_basis := 'INFERRED_FROM_PAIN_AND_OFFER';
    end if;
  end if;

  if v_class is null then v_gaps := v_gaps || 'BUYER'::text; end if;
  if coalesce(new.pain_point,'') = '' then v_gaps := v_gaps || 'PAIN'::text; end if;
  if coalesce(new.solution_statement,'') = '' then v_gaps := v_gaps || 'PRIMARY_OFFER'::text; end if;
  if coalesce(new.front_door_code,'') !~ '^CH0[1-5]-F0[1-9]$' then v_gaps := v_gaps || 'FULFILLMENT_ROUTE'::text; end if;

  v_pain_ev := case when coalesce(new.pain_point,'') <> '' then 'KNOWN'
                    when v_signal is not null then 'OBSERVED_SIGNAL'
                    else 'UNKNOWN' end;

  -- Discovery question for property-management rows whose pain is not known.
  if v_pain_ev <> 'KNOWN' and v_class = 'PROPERTY_MANAGEMENT' then
    select t.trigger_code, t.discovery_question into v_trigger, v_dq
      from public.dd_ch02_commercial_triggers t
     where t.status = 'LOCKED'
       and (t.trigger_code = md->>'discovery_trigger_code'
            or (md->>'discovery_trigger_code' is null and t.entry_front_door = case new.front_door_code
                  when 'CH02-F01' then 'TURNOVER_MAKE_READY'
                  when 'CH02-F02' then 'PROPERTY_RESCUE_FIELD_DISPATCH'
                  when 'CH02-F03' then 'PROPERTY_CONDITION_DOCUMENTATION'
                  when 'CH02-F04' then 'OFFICE_OPERATIONS_RESCUE' end))
     order by (t.trigger_code = md->>'discovery_trigger_code') desc nulls last, t.sort_order
     limit 1;
    if v_dq is not null then
      v_dq_basis := case when v_trigger = md->>'discovery_trigger_code' then 'TRIGGER_LIBRARY' else 'FRONT_DOOR_TRIGGER' end;
    else
      v_dq := 'What keeps falling back onto you or the onsite team because nobody else owns it?';
      v_dq_basis := 'OWNER_GENERIC_PROPERTY_QUESTION';
    end if;
  end if;

  v_discovery := v_dq is not null
             and not coalesce(new.do_not_contact, false)
             and coalesce(new.contact_pressure_state, 'NORMAL') = 'NORMAL';

  new.sales_metadata := md || jsonb_build_object('context_contract', jsonb_build_object(
    'version', 'v2',
    'complete', cardinality(v_gaps) = 0,
    'gaps', to_jsonb(v_gaps),
    'buyer_class', v_class,
    'front_door_basis', v_fd_basis,
    'basis', coalesce(md->'context_contract'->>'basis', 'ROW_FACTS'),
    'pain_evidence', v_pain_ev,
    'observed_signal', v_signal,
    'discovery_eligible', v_discovery,
    'discovery_question', v_dq,
    'discovery_trigger_code', v_trigger,
    'discovery_basis', v_dq_basis,
    'checked_at', now()));

  -- Pitch gate unchanged: no pitch without buyer, known pain, offer and route.
  if cardinality(v_gaps) > 0 and coalesce(new.campaign_eligible, false) then
    new.campaign_eligible := false;
    new.campaign_suppression_reason := case when v_discovery then 'DISCOVERY_ONLY: ' else 'CONTEXT_INCOMPLETE: ' end
                                       || array_to_string(v_gaps, ',');
    if new.campaign_status = 'ELIGIBLE' then new.campaign_status := 'SUPPRESSED'; end if;
  end if;

  return new;
end;
$$;
revoke all on function private.dd_normalize_sales_queue_context() from public, anon, authenticated;
