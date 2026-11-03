-- Run ONLY after the new migration has been applied to the isolated DANI tester.
-- The test creates synthetic records inside a transaction and ROLLS EVERYTHING BACK.
-- DO NOT run in production; never substitute real customers, calls or money.
begin;
select set_config('request.jwt.claims','{"sub":"11111111-1111-4111-8111-111111111111","app_metadata":{"portal_role":"owner"}}',true);
select set_config('request.jwt.claim.sub','11111111-1111-4111-8111-111111111111',true);
do $proof$
declare
  sale_id uuid;
  first_call jsonb;
  retry jsonb;
  correction jsonb;
  n integer;
  attempts integer;
  denied boolean;
  due_date date := current_date+1;
begin
  insert into public.dd_sales_queue
    (contact_name,company_name,lane,source,source_confidence,consent_phone,
     contact_pressure_state,campaign_eligible,sales_metadata)
  values ('QA Fixture - Not a Buyer','QA Fixture - Not a Buyer','INBOUND','GMAIL_INBOUND',
          'VERIFIED',true,'NORMAL',false,'{"isolated_test":true}'::jsonb)
  returning id into sale_id;
  first_call:=public.dd_record_sales_call_outcome(
    sale_id,'55555555-5555-4555-8555-555555555501','NO_ANSWER',
    'Owner to review callback',due_date,'Synthetic, no contact made',false);
  if first_call->>'followup_status'<>'OWNER_TASK_OPEN' then
    raise exception 'No-answer did not prepare the owner task';
  end if;
  retry:=public.dd_record_sales_call_outcome(
    sale_id,'55555555-5555-4555-8555-555555555501','NO_ANSWER',
    'Owner to review callback',due_date,'Synthetic, no contact made',false);
  if retry->>'idempotent'<>'true' or retry->>'contact_event_id'<>first_call->>'contact_event_id' then
    raise exception 'Request-key retry was not idempotent';
  end if;
  if (select count(*) from public.dd_followup_tasks where sales_queue_id=sale_id and status='open')<>1 then
    raise exception 'Expected exactly one active owner follow-up';
  end if;
  if (select count(*) from public.dd_followup_tasks where sales_queue_id=sale_id and lead_id is null)<>1 then
    raise exception 'Missing lead bridge caused a missing task or an invented lead';
  end if;
  perform public.dd_record_sales_call_outcome(
    sale_id,'55555555-5555-4555-8555-555555555502','QUOTE_REQUESTED',
    'Owner to review scope for quote',due_date,'Synthetic quote REQUEST only',false);
  if (select count(*) from public.dd_followup_tasks where sales_queue_id=sale_id and status='open')<>1 then
    raise exception 'Subsequent call duplicated follow-up task';
  end if;
  correction:=public.dd_record_sales_call_outcome(
    sale_id,'55555555-5555-4555-8555-555555555503','NEEDS_INFO',
    'Owner to ask for scope detail',due_date,'Synthetic correction',true);
  select contact_attempts into attempts from public.dd_sales_queue where id=sale_id;
  if attempts<>2 or correction->>'is_correction'<>'true' then
    raise exception 'Correction counted as another call';
  end if;
  perform public.dd_record_sales_call_outcome(
    sale_id,'55555555-5555-4555-8555-555555555504','NOT_INTERESTED',
    null,null,'Synthetic no-current-need',false);
  if exists(select 1 from public.dd_followup_tasks where sales_queue_id=sale_id and status='open') then
    raise exception 'No-current-need left a stale active follow-up';
  end if;
  perform public.dd_record_sales_call_outcome(
    sale_id,'55555555-5555-4555-8555-555555555505','DO_NOT_CONTACT',
    null,null,'Synthetic DNC request',false);
  if (select do_not_contact from public.dd_sales_queue where id=sale_id) is distinct from true then
    raise exception 'Do-not-contact was not persisted';
  end if;
  denied:=false;
  begin
    perform public.dd_record_sales_call_outcome(
      sale_id,'55555555-5555-4555-8555-555555555506','NO_ANSWER',
      null,null,'Should be rejected',false);
  exception when insufficient_privilege then denied:=true;
  end;
  if not denied then raise exception 'DNC restriction was bypassed'; end if;
  retry:=public.dd_record_sales_call_outcome(
    sale_id,'55555555-5555-4555-8555-555555555505','DO_NOT_CONTACT',
    null,null,'Synthetic DNC request',false);
  if retry->>'idempotent'<>'true' then raise exception 'DNC network retry duplicated'; end if;

  -- Deliberately conflicting request contents cannot share an operation key.
  denied:=false;
  begin
    perform public.dd_record_sales_call_outcome(
      sale_id,'55555555-5555-4555-8555-555555555501','VOICEMAIL',
      'Owner to review callback',due_date,'Changed data',false);
  exception when unique_violation then denied:=true;
  end;
  if not denied then raise exception 'Same-key conflicting payload was allowed'; end if;
end $proof$;
rollback;
