-- Extend #525 (relationship identity) and #527 (context contract / pain gate)
-- with multi-mailbox no-recontact.
--
-- Owner direction 2026-10-02: do not add a third parallel gate. Extend the
-- existing checks so campaign memory is shared across Vendors@ and fallback
-- addresses (danideclaresns@gmail.com). A recent touch from any known Dani
-- Declares mailbox blocks new parallel outreach eligibility.
--
-- Nothing here sends email. It only affects campaign_eligible / suppression
-- on dd_sales_queue writes, consistent with #527.

-- 1. Recent multi-mailbox touch lookup ---------------------------------------------

create or replace function private.dd_recent_mailbox_touch(
  p_email text,
  p_lookback_days integer default 45
) returns jsonb
language plpgsql stable security definer set search_path = '' as $$
declare
  v_email text := nullif(lower(trim(coalesce(p_email,''))), '');
  v_row record;
  v_known text[] := array[
    'vendors@danideclares.com',
    'danideclaresns@gmail.com'
  ];
begin
  if v_email is null or v_email !~ '^[^\s@]+@[^\s@]+\.[^\s@]+$' then
    return jsonb_build_object('found', false, 'reason', 'INVALID_OR_EMPTY_EMAIL');
  end if;

  -- Prefer the ingested communication table populated by Gmail sync.
  if to_regclass('public.dd_email_communications') is not null then
    select
      c.received_at,
      c.direction,
      coalesce(c.raw_metadata->>'account_email', c.sender_address) as account_email
    into v_row
    from public.dd_email_communications c
    where (
        lower(c.sender_address) = v_email
        or v_email = any(select lower(unnest(coalesce(c.recipient_addresses, array[]::text[]))))
      )
      and c.received_at >= now() - make_interval(days => greatest(coalesce(p_lookback_days, 45), 1))
    order by c.received_at desc
    limit 1;

    if found then
      return jsonb_build_object(
        'found', true,
        'received_at', v_row.received_at,
        'direction', v_row.direction,
        'account_email', v_row.account_email,
        'known_dani_mailbox', lower(coalesce(v_row.account_email,'')) = any(v_known)
      );
    end if;
  end if;

  -- Also respect explicit contact events already logged (e.g. from #525 rediscovery).
  if to_regclass('public.dd_lead_contact_events') is not null then
    select e.occurred_at, e.direction, e.channel, e.outcome
    into v_row
    from public.dd_lead_contact_events e
    join public.dd_sales_queue q on q.id = e.sales_queue_id
    where lower(trim(coalesce(q.email,''))) = v_email
      and e.occurred_at >= now() - make_interval(days => greatest(coalesce(p_lookback_days, 45), 1))
      and e.event_type in ('OUTBOUND','INBOUND','REDISCOVERED','CONTACTED')
    order by e.occurred_at desc
    limit 1;

    if found then
      return jsonb_build_object(
        'found', true,
        'received_at', v_row.occurred_at,
        'direction', v_row.direction,
        'channel', v_row.channel,
        'outcome', v_row.outcome,
        'source', 'dd_lead_contact_events'
      );
    end if;
  end if;

  return jsonb_build_object('found', false);
end;
$$;

revoke all on function private.dd_recent_mailbox_touch(text, integer) from public, anon, authenticated;
grant execute on function private.dd_recent_mailbox_touch(text, integer) to service_role;

comment on function private.dd_recent_mailbox_touch(text, integer) is
  'Read-only: returns whether the given email has a recent touch from any Dani Declares mailbox or logged contact event. Used by the extended context-contract gate (#527) to enforce shared campaign memory across Vendors@ and fallback addresses.';

-- 2. Extend the #527 context normalizer --------------------------------------------

create or replace function private.dd_normalize_sales_queue_context()
returns trigger language plpgsql security definer set search_path = '' as $$
declare
  md jsonb := coalesce(new.sales_metadata, '{}'::jsonb);
  v_class text;
  v_fd text;
  v_fd_basis text;
  v_gaps text[] := '{}';
  v_touch jsonb;
begin
  v_class := private.dd_sales_buyer_class(new.buyer_type, md->>'channel_code');

  -- buyer_type: fill when empty; replace a bare channel code (research promotion wrote 'CH03' here).
  if coalesce(new.buyer_type,'') = '' or new.buyer_type ~ '^CH0[0-9]$' then
    new.buyer_type := v_class;
  end if;

  -- pain and primary offer: only from facts already carried by the row, never invented.
  if coalesce(new.pain_point,'') = '' then
    new.pain_point := nullif(coalesce(md->>'pain_point', md->>'need_summary', md->'research_claims'->>'pain_point'), '');
  end if;
  if coalesce(new.solution_statement,'') = '' then
    new.solution_statement := nullif(coalesce(md->>'primary_offer', md->'research_claims'->>'service_hint',
                                              new.suggested_sku, new.capture_offer_code), '');
  end if;

  -- fulfillment route: keep a real front-door code, otherwise infer from pain + offer.
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

  -- Multi-mailbox no-recontact extension (#525/#527):
  -- If this email already has a recent touch from any known Dani Declares mailbox
  -- (or a logged contact event), do not allow new parallel campaign eligibility.
  v_touch := private.dd_recent_mailbox_touch(new.email, 45);
  if coalesce((v_touch->>'found')::boolean, false) then
    v_gaps := v_gaps || 'RECENT_MAILBOX_TOUCH'::text;
    md := md || jsonb_build_object('recent_mailbox_touch', v_touch);
  end if;

  new.sales_metadata := md || jsonb_build_object('context_contract', jsonb_build_object(
    'version', 'v1.1-multi-mailbox',
    'complete', cardinality(v_gaps) = 0,
    'gaps', to_jsonb(v_gaps),
    'buyer_class', v_class,
    'front_door_basis', v_fd_basis,
    'basis', coalesce(md->'context_contract'->>'basis', 'ROW_FACTS'),
    'checked_at', now()));

  -- Pain-first + identity + multi-mailbox gate: a row with gaps is never campaign-eligible.
  if cardinality(v_gaps) > 0 and coalesce(new.campaign_eligible, false) then
    new.campaign_eligible := false;
    new.campaign_suppression_reason := 'CONTEXT_INCOMPLETE: ' || array_to_string(v_gaps, ',');
    if new.campaign_status = 'ELIGIBLE' then new.campaign_status := 'SUPPRESSED'; end if;
  end if;

  return new;
end;
$$;

revoke all on function private.dd_normalize_sales_queue_context() from public, anon, authenticated;

comment on function private.dd_normalize_sales_queue_context() is
  'BEFORE trigger on dd_sales_queue (#527 context contract, extended). Fills buyer/pain/offer/route from row facts only; suppresses campaign_eligible when context is incomplete OR when a recent multi-mailbox touch already exists (shared campaign memory across Vendors@ and fallback addresses). Does not send.';
