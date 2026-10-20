-- A single owner-confirmed phone outcome: sales row, immutable history, and one actionable
-- follow-up in one transaction. No outreach, quotes, payments or provider dispatch.
-- The sales-to-leads bridge is optional; it must NEVER be populated by guesswork.
alter table public.dd_followup_tasks
  add column if not exists sales_queue_id uuid references public.dd_sales_queue(id) on delete set null;
alter table public.dd_followup_tasks
  add column if not exists contact_event_id uuid references public.dd_lead_contact_events(id) on delete set null;

create unique index if not exists dd_sales_call_outcome_request_key_unique
  on public.dd_lead_contact_events(external_reference)
  where external_system = 'DANI_HQ'
    and event_type in ('CALL_OUTCOME', 'CALL_OUTCOME_CORRECTION')
    and external_reference is not null;
create unique index if not exists dd_sales_call_followup_one_active
  on public.dd_followup_tasks(sales_queue_id)
  where task_type = 'SALES_CALL_FOLLOWUP'
    and status in ('open', 'in_progress')
    and sales_queue_id is not null;

create or replace function public.dd_record_sales_call_outcome(
  p_sales_queue_id uuid,
  p_operation_key uuid,
  p_outcome text,
  p_next_action text default null,
  p_next_action_date date default null,
  p_call_notes text default null,
  p_is_correction boolean default false
) returns jsonb
language plpgsql security definer set search_path = ''
as $$
declare
  v_sale public.dd_sales_queue%rowtype;
  v_prior public.dd_lead_contact_events%rowtype;
  v_same_key public.dd_lead_contact_events%rowtype;
  v_event_id uuid;
  v_task_id uuid;
  v_lead_id uuid;
  v_result text := upper(trim(coalesce(p_outcome, '')));
  v_action text := nullif(trim(coalesce(p_next_action, '')), '');
  v_notes text := nullif(trim(coalesce(p_call_notes, '')), '');
  v_signature text;
  v_needs_task boolean;
  v_due timestamptz;
  v_correct boolean := coalesce(p_is_correction, false);
begin
  if auth.uid() is null or not private.dd_is_staff_admin() then
    raise exception 'Staff authorization is required.' using errcode = '42501';
  end if;
  if p_sales_queue_id is null or p_operation_key is null then
    raise exception 'A sales prospect and unique operation key are required.' using errcode = '22023';
  end if;
  if v_result not in (
    'NO_ANSWER','VOICEMAIL','RECEPTIONIST','WRONG_PERSON','DECISION_MAKER_REACHED',
    'INTERESTED','NEEDS_INFO','QUOTE_REQUESTED','READY_TO_BUY','CALL_BACK_LATER',
    'NOT_INTERESTED','DO_NOT_CONTACT'
  ) then
    raise exception 'Choose an actual phone-contact outcome.' using errcode = '22023';
  end if;
  if length(coalesce(v_action,'')) > 500 or length(coalesce(v_notes,'')) > 1500 then
    raise exception 'Call notes or next action exceed the supported length.' using errcode = '22023';
  end if;
  if v_result in ('NOT_INTERESTED','DO_NOT_CONTACT') then
    if v_action is not null or p_next_action_date is not null then
      raise exception 'A stopped contact cannot have a new outbound follow-up.' using errcode = '22023';
    end if;
  elsif (v_action is null) <> (p_next_action_date is null) then
    raise exception 'A follow-up needs both a specific action and a due date.' using errcode = '22023';
  end if;
  v_needs_task := v_action is not null and p_next_action_date is not null;
  if v_result in ('NEEDS_INFO','QUOTE_REQUESTED','CALL_BACK_LATER') and not v_needs_task then
    raise exception 'This outcome needs a defined owner action and due date.' using errcode = '22023';
  end if;
  if p_next_action_date is not null and p_next_action_date < current_date then
    raise exception 'A new follow-up due date cannot be in the past.' using errcode = '22023';
  end if;

  v_signature := md5(jsonb_build_object(
    'sales_queue_id',p_sales_queue_id,'outcome',v_result,
    'action',v_action,'due',p_next_action_date,
    'notes',v_notes,'correction',v_correct
  )::text);

  -- Lock this exact prospect; concurrent operations cannot leave half a save or duplicate tasks.
  select * into v_sale from public.dd_sales_queue
  where id = p_sales_queue_id for update;
  if not found then
    raise exception 'Sales prospect not found.' using errcode = 'P0002';
  end if;

  -- A network retry returns its existing receipt, never a second contact attempt.
  select * into v_same_key from public.dd_lead_contact_events
  where external_system = 'DANI_HQ'
    and external_reference = p_operation_key::text
    and event_type in ('CALL_OUTCOME', 'CALL_OUTCOME_CORRECTION')
  limit 1;
  if found then
    if v_same_key.sales_queue_id <> p_sales_queue_id
       or v_same_key.metadata->>'request_signature' is distinct from v_signature then
      raise exception 'Operation key was already used for different call details.' using errcode = '23505';
    end if;
    select id into v_task_id from public.dd_followup_tasks
      where contact_event_id = v_same_key.id
      order by created_at desc limit 1;
    return jsonb_build_object(
      'sales_queue_id',p_sales_queue_id,'contact_event_id',v_same_key.id,
      'followup_task_id',v_task_id,'idempotent',true,
      'outbound_sent',false,'quote_created',false
    );
  end if;

  if coalesce(v_sale.do_not_contact,false)
     or v_sale.contact_pressure_state in ('DO_NOT_CONTACT','PAUSED') then
    raise exception 'Contact is paused or suppressed: manual authorization review required.' using errcode = '42501';
  end if;

  if v_correct then
    select * into v_prior from public.dd_lead_contact_events
    where sales_queue_id = p_sales_queue_id
      and external_system = 'DANI_HQ'
      and event_type in ('CALL_OUTCOME','CALL_OUTCOME_CORRECTION')
    order by occurred_at desc, id desc limit 1;
    if not found then
      raise exception 'No recorded call exists to correct.' using errcode = '22023';
    end if;
  end if;

  insert into public.dd_lead_contact_events(
    sales_queue_id,event_type,channel,direction,outcome,occurred_at,
    external_system,external_reference,metadata
  ) values (
    p_sales_queue_id,
    case when v_correct then 'CALL_OUTCOME_CORRECTION' else 'CALL_OUTCOME' end,
    'PHONE',case when v_correct then 'NONE' else 'OUTBOUND' end,
    v_result,now(),'DANI_HQ',p_operation_key::text,
    jsonb_build_object(
      'request_signature',v_signature,
      'owner_user_id',auth.uid(),
      'notes',v_notes,
      'corrects_event_id',case when v_correct then v_prior.id else null end,
      'source','OWNER_ENTERED','outbound_sent',false
    )
  ) returning id into v_event_id;

  update public.dd_sales_queue set
    disposition = v_result,
    next_action = v_action,
    next_action_date = p_next_action_date,
    do_not_contact = case when v_result = 'DO_NOT_CONTACT' then true else do_not_contact end,
    contact_pressure_state = case when v_result = 'DO_NOT_CONTACT' then 'DO_NOT_CONTACT' else contact_pressure_state end,
    campaign_eligible = case when v_result = 'DO_NOT_CONTACT' then false else campaign_eligible end,
    campaign_status = case when v_result = 'DO_NOT_CONTACT' then 'SUPPRESSED' else campaign_status end,
    campaign_suppression_reason = case when v_result = 'DO_NOT_CONTACT' then 'OWNER_RECORDED_DO_NOT_CONTACT' else campaign_suppression_reason end,
    contact_attempts = case when v_correct then contact_attempts else coalesce(contact_attempts,0)+1 end,
    last_contacted_at = case when v_correct then last_contacted_at else now() end,
    last_contact_channel = case when v_correct then last_contact_channel else 'PHONE' end,
    updated_at = now()
  where id = p_sales_queue_id;

  if v_needs_task then
    -- A noon/9am approximation is not invented customer contact: this is internal
    -- 9 AM America/New_York work-queue due time for the owner.
    v_due := (p_next_action_date::timestamp + interval '9 hours') at time zone 'America/New_York';
    select bridge.lead_id into v_lead_id
    from public.dd_sales_queue_lead_bridge bridge
    join public.leads existing_lead on existing_lead.id = bridge.lead_id
    where bridge.sales_queue_id = p_sales_queue_id;

    insert into public.dd_followup_tasks(
      sales_queue_id,contact_event_id,lead_id,task_type,status,due_at,notes,created_at,updated_at
    ) values (
      p_sales_queue_id,v_event_id,v_lead_id,'SALES_CALL_FOLLOWUP','open',v_due,
      'Owner action: '||v_action||'. Recorded outcome: '||v_result||'. No message sent or quote issued.',
      now(),now()
    )
    on conflict (sales_queue_id)
      where task_type = 'SALES_CALL_FOLLOWUP'
        and status in ('open','in_progress')
        and sales_queue_id is not null
    do update set
      contact_event_id = excluded.contact_event_id,
      lead_id = excluded.lead_id,
      due_at = excluded.due_at,
      notes = excluded.notes,
      status = 'open',
      updated_at = now()
    returning id into v_task_id;
  else
    -- A new result with no promised action must retire stale phone follow-up.
    update public.dd_followup_tasks
      set status='cancelled', updated_at=now()
    where sales_queue_id=p_sales_queue_id and task_type='SALES_CALL_FOLLOWUP'
      and status in ('open','in_progress');
  end if;

  return jsonb_build_object(
    'sales_queue_id',p_sales_queue_id,'contact_event_id',v_event_id,
    'followup_task_id',v_task_id,
    'followup_status',case when v_needs_task then 'OWNER_TASK_OPEN' else 'NO_OWNER_TASK' end,
    'is_correction',v_correct,'idempotent',false,
    'outbound_sent',false,'quote_created',false
  );
end;
$$;
revoke all on function public.dd_record_sales_call_outcome(uuid,uuid,text,text,date,text,boolean) from public,anon;
grant execute on function public.dd_record_sales_call_outcome(uuid,uuid,text,text,date,text,boolean) to authenticated;
comment on function public.dd_record_sales_call_outcome(uuid,uuid,text,text,date,text,boolean) is
  'Authenticated staff one-save phone outcome; atomic history + linked owner task. Never sends contact or creates quotes/payments.';
