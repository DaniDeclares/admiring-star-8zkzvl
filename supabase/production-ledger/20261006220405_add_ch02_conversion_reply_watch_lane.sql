
alter table public.dd_scheduled_operating_work
drop constraint if exists dd_scheduled_operating_work_work_type_check;

alter table public.dd_scheduled_operating_work
add constraint dd_scheduled_operating_work_work_type_check
check (work_type = any (array[
  'DAILY_EXECUTION_PLAN'::text,
  'EMAIL_LEAD_MINING'::text,
  'FINANCE_ECONOMICS_FUNDING_CLOSE'::text,
  'USDA_HOUSING_REPLY_WATCH'::text,
  'CH02_CONVERSION_REPLY_WATCH'::text
]));

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
    set payload=coalesce(payload,'{}'::jsonb)||jsonb_build_object(
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
        '1a1133d78609eefa'
      ),
      'priority_recipients',jsonb_build_array(
        'katrina.rpm@outlook.com',
        'renea@pmieastatlanta.com'
      )
    ),
    jsonb_build_object(
      'requested_action',
      'Read connected Gmail for new inbound replies from matched CH02 buyers for LIVE_READY SKUs DNI-02A-003 and DNI-02A-009, prioritizing the recorded RPM Majestic and PMI East Atlanta threads. Reconcile replies to dd_sales_queue. Only when the buyer explicitly requests pricing/scope/quote or clearly accepts a trial should disposition advance to QUOTE_REQUESTED or READY_TO_BUY. Then call dd_create_quote_draft_from_sales for that sales row. If ambiguous, preserve the current disposition and route a concise owner-attention item. Do not invent intent, pricing, contact, payment, or acceptance.',
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

create or replace function public.dd_dispatch_external_scheduled_operating_work(p_limit integer default 20)
returns jsonb
language plpgsql
security definer
set search_path to 'public','pg_catalog'
as $function$
declare
  r record;
  v_action uuid;
  v_dispatched int:=0;
  v_reconciled int:=0;
  v_action_type text;
  v_destination text;
begin
  perform public.dd_compact_read_only_external_backlog();

  for r in
    select w.id,w.work_key,o.id action_id,o.external_reference,o.idempotency_key
    from public.dd_scheduled_operating_work w
    join public.dd_external_action_outbox o
      on o.authoritative_table='dd_scheduled_operating_work'
     and o.authoritative_record_id=w.id::text
    where w.status in ('IN_PROGRESS','BLOCKED')
      and o.status='SUCCEEDED'
      and exists(
        select 1
        from public.dd_external_action_receipts er
        where er.idempotency_key=o.idempotency_key
          and upper(coalesce(er.outcome,''))='SUCCEEDED'
      )
  loop
    update public.dd_scheduled_operating_work
    set status='COMPLETED',
        updated_at=now(),
        payload=coalesce(payload,'{}'::jsonb)||jsonb_build_object(
          'verified_external_receipt',true,
          'external_action_id',r.action_id,
          'external_reference',r.external_reference,
          'completed_at',now()
        )
    where id=r.id;
    v_reconciled:=v_reconciled+1;
  end loop;

  for r in
    select *
    from public.dd_scheduled_operating_work
    where status='QUEUED'
      and work_type in (
        'EMAIL_LEAD_MINING',
        'FINANCE_ECONOMICS_FUNDING_CLOSE',
        'USDA_HOUSING_REPLY_WATCH',
        'CH02_CONVERSION_REPLY_WATCH'
      )
    order by case
      when work_type='CH02_CONVERSION_REPLY_WATCH' then 0
      when work_type='USDA_HOUSING_REPLY_WATCH' then 1
      else 2
    end, created_at
    limit greatest(coalesce(p_limit,20),1)
    for update skip locked
  loop
    if r.work_type in ('EMAIL_LEAD_MINING','USDA_HOUSING_REPLY_WATCH','CH02_CONVERSION_REPLY_WATCH') then
      v_action_type := 'GMAIL_READ_CANONICAL_SALES_RECONCILE';
      v_destination := 'gmail';
    else
      v_action_type := 'FINANCE_READ_ECONOMICS_RECONCILE';
      v_destination := 'finances';
    end if;

    insert into public.dd_external_action_outbox(
      correlation_id,action_key,action_type,destination_system,
      authoritative_table,authoritative_record_id,
      payload,payload_hash,idempotency_key,status,next_attempt_at
    )
    values(
      r.id,
      'OPERATING_WORK:'||r.work_key,
      v_action_type,
      v_destination,
      'dd_scheduled_operating_work',
      r.id::text,
      jsonb_build_object(
        'work_key',r.work_key,
        'work_type',r.work_type,
        'authority',r.authority,
        'constraints',r.constraints,
        'payload',r.payload,
        'read_only',true,
        'external_contact',false,
        'money_action',false
      ),
      md5(coalesce(r.payload::text,'{}')||coalesce(r.constraints::text,'{}')),
      'SCHEDULED_OPERATING_WORK:'||r.work_key,
      'PENDING',
      now()
    )
    on conflict(idempotency_key) do update
      set updated_at=now()
    returning id into v_action;

    update public.dd_scheduled_operating_work
    set status='IN_PROGRESS',
        updated_at=now(),
        payload=coalesce(payload,'{}'::jsonb)||jsonb_build_object(
          'dispatch_state','AWAITING_VERIFIED_EXTERNAL_RECEIPT',
          'external_action_id',v_action,
          'dispatched_at',now(),
          'external_contact',false,
          'money_action',false
        )
    where id=r.id;

    v_dispatched:=v_dispatched+1;
  end loop;

  return jsonb_build_object(
    'status','COMPLETED',
    'dispatched',v_dispatched,
    'reconciled_verified',v_reconciled,
    'dispatch_is_completion',false,
    'external_contact',false,
    'money_action',false
  );
end
$function$;

revoke execute on function public.dd_dispatch_external_scheduled_operating_work(integer) from public,anon,authenticated;
grant execute on function public.dd_dispatch_external_scheduled_operating_work(integer) to service_role;

do $do$
begin
  if not exists(select 1 from cron.job where jobname='dani-ch02-conversion-reply-watch') then
    perform cron.schedule(
      'dani-ch02-conversion-reply-watch',
      '27 * * * *',
      'select private.dd_enqueue_ch02_conversion_reply_watch();'
    );
  end if;
end
$do$;
