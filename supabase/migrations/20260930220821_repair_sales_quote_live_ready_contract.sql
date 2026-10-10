-- Reconcile the existing sales -> quote consumer with the canonical release contract.
-- This only permits creation of an internal DRAFT; it does not publish a price,
-- contact a customer, collect money, or authorize fulfillment.

create or replace function public.dd_create_quote_draft_from_sales(p_sales_id uuid)
returns uuid
language plpgsql
set search_path to 'public'
as $function$
declare
  s public.dd_sales_queue%rowtype;
  v_id uuid;
  v_division text;
begin
  select * into s
  from public.dd_sales_queue
  where id = p_sales_id;

  if not found then
    raise exception 'sales record not found';
  end if;

  if coalesce(s.disposition, '') not in ('QUOTE_REQUESTED', 'READY_TO_BUY') then
    raise exception 'sales record is not quote-ready';
  end if;

  if s.suggested_sku is null then
    raise exception 'governed SKU required before quote draft';
  end if;

  select x.division into v_division
  from public.dd_service_release_contract_v1 x
  where x.canonical_sku = s.suggested_sku
    and x.release_state = 'LIVE_READY';

  if not found then
    raise exception 'service is not LIVE_READY';
  end if;

  -- Reuse an existing draft for this sales record rather than creating duplicates.
  select e.id into v_id
  from public.dd_estimates e
  where e.source_slug = 'sales_queue'
    and e.intake_answers ->> 'sales_queue_id' = s.id::text
  order by e.created_at
  limit 1;

  if found then
    return v_id;
  end if;

  insert into public.dd_estimates (
    division_slug,
    source_slug,
    client_name,
    client_phone,
    client_email,
    client_type,
    organization_name,
    client_notes,
    internal_notes,
    estimate_status,
    priority,
    intake_answers
  )
  values (
    v_division,
    'sales_queue',
    coalesce(s.contact_name, s.company_name),
    s.phone,
    s.email,
    coalesce(s.buyer_type, 'business'),
    s.company_name,
    s.notes,
    'Created automatically as an internal DRAFT from a governed sales opportunity. No customer contact and no price publication occurred.',
    'needs_review',
    case when s.intent_tier in ('HIGH', 'TRANSACTION') then 'high' else 'normal' end,
    jsonb_build_object(
      'sales_queue_id', s.id,
      'suggested_sku', s.suggested_sku,
      'source', s.source,
      'source_account', s.source_account,
      'source_message_id', s.source_message_id,
      'automation_authority', 'INTERNAL_DRAFT_ONLY'
    )
  )
  returning id into v_id;

  update public.dd_sales_queue
  set next_action = 'Complete governed quote',
      sales_metadata = coalesce(sales_metadata, '{}'::jsonb)
        || jsonb_build_object('estimate_id', v_id, 'auto_draft', true),
      updated_at = now()
  where id = s.id;

  return v_id;
end
$function$;

comment on function public.dd_create_quote_draft_from_sales(uuid) is
  'Creates an internal DRAFT estimate only after an explicitly matched SKU is LIVE_READY in the canonical Production release contract. Does not publish price, contact a customer, collect payment, or authorize fulfillment.';
