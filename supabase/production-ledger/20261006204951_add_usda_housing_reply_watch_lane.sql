
create or replace function private.dd_enqueue_usda_housing_reply_watch()
returns uuid
language plpgsql
security definer
set search_path to 'public','private'
as $function$
declare
  v_id uuid;
  v_existing uuid;
begin
  select id into v_existing
  from public.dd_scheduled_operating_work
  where work_type='USDA_HOUSING_REPLY_WATCH'
    and status in ('QUEUED','IN_PROGRESS','BLOCKED')
  order by created_at
  limit 1;

  if v_existing is not null then
    update public.dd_scheduled_operating_work
    set payload = coalesce(payload,'{}'::jsonb) || jsonb_build_object(
          'catchup_through',now(),
          'coalesced_enqueue_at',now(),
          'watch_scope','USDA_SECTION_502_DIRECT_GA_SC',
          'hard_deadline','2026-12-18'
        ),
        updated_at=now()
    where id=v_existing
    returning id into v_id;
    return v_id;
  end if;

  insert into public.dd_scheduled_operating_work(
    work_key,work_type,authority,constraints,payload
  ) values(
    'USDA_HOUSING_REPLY_WATCH:'||to_char(now(),'YYYYMMDDHH24'),
    'USDA_HOUSING_REPLY_WATCH',
    'GMAIL_READ_HOUSING_STABILITY_ONLY',
    jsonb_build_object(
      'read_only',true,
      'no_external_send',true,
      'no_money_action',true,
      'sender_domains',jsonb_build_array('usda.gov'),
      'subjects_any',jsonb_build_array('Section 502','Single Family Housing','Rural Development','property eligibility'),
      'related_threads',jsonb_build_array('1a112f394275e778','1a112f3abda47446','1a112f804f726226'),
      'route_owner_attention_only_on_meaningful_reply',true,
      'do_not_interrupt_owner_if_no_change',true
    ),
    jsonb_build_object(
      'requested_action','Read connected Gmail for new USDA Rural Development replies related to Section 502 Direct, the Georgia/SC application packet, Georgia property eligibility, or the 2026-12-18 housing-program exit deadline. Ingest any new reply through dd_ingest_email_communication. If a meaningful reply creates a document, deadline, eligibility, or owner-action requirement, route it to HOUSING_STABILITY owner attention. If there is no meaningful new reply, record a no-change receipt only.',
      'generated_at',now(),
      'catchup_through',now(),
      'hard_deadline','2026-12-18',
      'state_priority','GEORGIA_FIRST',
      'fallback_state','SOUTH_CAROLINA',
      'external_contact',false,
      'money_action',false
    )
  )
  returning id into v_id;

  return v_id;
end
$function$;

revoke execute on function private.dd_enqueue_usda_housing_reply_watch() from public,anon,authenticated;
grant execute on function private.dd_enqueue_usda_housing_reply_watch() to service_role;

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
  v_seq bigint;
  v_action_type text;
  v_destination text;
begin
  perform public.dd_compact_read_only_external_backlog();

  for r in
    select w.id,w.work_key,o.id action_id,o.external_reference
    from public.dd_scheduled_operating_work w
    join public.dd_external_action_outbox o
      on o.authoritative_table='dd_scheduled_operating_work'
     and o.authoritative_record_id=w.id::text
    where w.status in ('IN_PROGRESS','BLOCKED')
      and o.status='SUCCEEDED'
      and exists(
        select 1 from public.dd_external_action_receipts er
        where er.action_id=o.id and er.verified=true
      )
  loop
    update public.dd_scheduled_operating_work
    set status='COMPLETED',
        completed_at=now(),
        updated_at=now(),
        lease_expires_at=null,
        last_error=null,
        receipt=jsonb_build_object(
          'consumer','EXTERNAL_ACTION_OUTBOX',
          'action_id',r.action_id,
          'verified_external_receipt',true,
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
        'USDA_HOUSING_REPLY_WATCH'
      )
      and coalesce(next_attempt_at,now())<=now()
    order by case when work_type='USDA_HOUSING_REPLY_WATCH' then 0 else 1 end, created_at
    limit greatest(coalesce(p_limit,20),1)
    for update skip locked
  loop
    if r.work_type in ('EMAIL_LEAD_MINING','USDA_HOUSING_REPLY_WATCH') then
      v_action_type := 'GMAIL_READ_CANONICAL_SALES_RECONCILE';
      v_destination := 'gmail';
    else
      v_action_type := 'FINANCE_READ_ECONOMICS_RECONCILE';
      v_destination := 'finances';
    end if;

    perform pg_advisory_xact_lock(hashtext('DD_EXTERNAL_ACTION_OUTBOX_SEQUENCE'));
    select coalesce(max(sequence_no),0)+1 into v_seq
    from public.dd_external_action_outbox;

    insert into public.dd_external_action_outbox(
      correlation_id,action_key,action_type,destination_system,
      authoritative_table,authoritative_record_id,
      payload,payload_hash,idempotency_key,sequence_no,status,next_attempt_at
    ) values(
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
      v_seq,
      'PENDING',
      now()
    )
    on conflict(idempotency_key) do update
      set updated_at=now()
    returning id into v_action;

    update public.dd_scheduled_operating_work
    set status='IN_PROGRESS',
        lease_token=coalesce(lease_token,gen_random_uuid()),
        lease_owner='EXTERNAL_ACTION_OUTBOX',
        leased_at=coalesce(leased_at,now()),
        lease_expires_at=null,
        updated_at=now(),
        last_error=null,
        receipt=jsonb_build_object(
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
declare
  v_jobid bigint;
begin
  select jobid into v_jobid from cron.job where jobname='dani-usda-housing-reply-watch';
  if v_jobid is null then
    perform cron.schedule(
      'dani-usda-housing-reply-watch',
      '17 * * * *',
      'select private.dd_enqueue_usda_housing_reply_watch();'
    );
  end if;
end
$do$;
