
create or replace function private.dd_enqueue_ch02_conversion_reply_watch()
returns uuid
language plpgsql
security definer
set search_path to 'public','private'
as $function$
declare
  v_id uuid;
begin
  select id into v_id
  from public.dd_scheduled_operating_work
  where work_type='CH02_CONVERSION_REPLY_WATCH'
    and status in ('QUEUED','IN_PROGRESS','BLOCKED')
  order by created_at
  limit 1;

  if v_id is not null then
    update public.dd_scheduled_operating_work
    set constraints=coalesce(constraints,'{}'::jsonb)
      || jsonb_build_object(
        'priority_threads',jsonb_build_array(
          '19fb889c8a0a82f2',
          '1a1133d78609eefa',
          '1a1136544b42a13c',
          '1a113654c6aa86e8'
        ),
        'priority_recipients',jsonb_build_array(
          'katrina.rpm@outlook.com',
          'renea@pmieastatlanta.com',
          'edd@keyrenteratlanta.com',
          'chenderson@integral-online.com'
        )
      ),
      payload=coalesce(payload,'{}'::jsonb)||jsonb_build_object(
        'catchup_through',now(),
        'coalesced_enqueue_at',now()
      ),
      updated_at=now()
    where id=v_id;
    return v_id;
  end if;

  insert into public.dd_scheduled_operating_work(
    work_key,work_type,authority,constraints,payload
  )
  values(
    'CH02_CONVERSION_REPLY_WATCH:'||to_char(now(),'YYYYMMDDHH24'),
    'CH02_CONVERSION_REPLY_WATCH',
    'GMAIL_READ_TO_GOVERNED_SALES_CONVERSION',
    jsonb_build_object(
      'read_only_external',true,
      'no_unrequested_quote',true,
      'no_invented_buyer_intent',true,
      'respect_dnc_and_contact_pressure',true,
      'target_skus',jsonb_build_array('DNI-02A-003','DNI-02A-009'),
      'priority_threads',jsonb_build_array(
        '19fb889c8a0a82f2',
        '1a1133d78609eefa',
        '1a1136544b42a13c',
        '1a113654c6aa86e8'
      ),
      'priority_recipients',jsonb_build_array(
        'katrina.rpm@outlook.com',
        'renea@pmieastatlanta.com',
        'edd@keyrenteratlanta.com',
        'chenderson@integral-online.com'
      )
    ),
    jsonb_build_object(
      'requested_action',
      'Read connected Gmail for new inbound replies from matched CH02 buyers for LIVE_READY SKUs DNI-02A-003 and DNI-02A-009. Reconcile replies to dd_sales_queue. Only when the buyer explicitly requests pricing, scope, a quote, or clearly accepts a trial should disposition advance to QUOTE_REQUESTED or READY_TO_BUY. Then call dd_create_quote_draft_from_sales for that sales row. If ambiguous, preserve the current disposition and route a concise owner-attention item. Do not invent intent, pricing, contact, payment, or acceptance.',
      'generated_at',now(),
      'catchup_through',now(),
      'operation','OPERATION_1M',
      'external_contact',false,
      'money_action',false
    )
  )
  returning id into v_id;

  return v_id;
end
$function$;

revoke execute on function private.dd_enqueue_ch02_conversion_reply_watch() from public,anon,authenticated;
grant execute on function private.dd_enqueue_ch02_conversion_reply_watch() to service_role;
