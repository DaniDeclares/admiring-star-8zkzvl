
create or replace function public.dd_process_thumbtack_event(p_event_id uuid)
returns uuid language plpgsql security definer set search_path='public' as $$
declare e dd_external_webhook_events%rowtype; d jsonb; v_lead text; v_msg text; v_sales uuid; v_name text; v_phone text; v_type text;
begin
 select * into e from dd_external_webhook_events where id=p_event_id for update;
 if not found or e.provider<>'THUMBTACK' then raise exception 'Thumbtack event not found'; end if;
 d:=e.payload->'data'; v_type:=coalesce(e.event_type,case when e.payload#>>'{event,eventType}' like 'Message%' then 'MESSAGE' else 'LEAD' end);
 v_lead:=coalesce(d->>'negotiationID',d#>>'{request,requestID}',e.external_object_id);
 if v_type='LEAD' then
   if v_lead is null then raise exception 'THUMBTACK_LEAD_ID_MISSING'; end if;
   v_name:=trim(concat_ws(' ',d#>>'{customer,firstName}',d#>>'{customer,lastName}')); v_phone:=d#>>'{customer,phone}';
   select id into v_sales from dd_sales_queue where source='THUMBTACK' and sales_metadata->>'thumbtack_lead_id'=v_lead limit 1;
   if v_sales is null then
     insert into dd_sales_queue(contact_name,phone,lane,source,source_confidence,disposition,next_action,notes,buyer_type,source_message_id,source_occurred_at,source_direction,intent_score,intent_tier,campaign_eligible,campaign_status,preferred_contact_channel,consent_phone,do_not_contact,sales_metadata,lead_origin_class)
     values(nullif(v_name,''),v_phone,'INBOUND','THUMBTACK','VERIFIED','NOT_CONTACTED','Review Thumbtack request',coalesce(d#>>'{request,description}','Thumbtack service request'),'CONSUMER',v_lead,nullif(d->>'createdAt','')::timestamptz,'INBOUND',85,'HIGH',false,'SUPPRESSED','THUMBTACK',false,false,jsonb_build_object('thumbtack_lead_id',v_lead,'request_id',d#>>'{request,requestID}','category',d#>>'{request,category,name}','zip_code',d#>>'{request,location,zipCode}','city',d#>>'{request,location,city}','state',d#>>'{request,location,state}','thumbtack_estimate',d#>>'{estimate,total}','raw_request',d->'request'),'THUMBTACK') returning id into v_sales;
   end if;
 elsif v_type='MESSAGE' then
   v_msg:=d->>'messageID'; if v_msg is null then raise exception 'THUMBTACK_MESSAGE_ID_MISSING'; end if;
   select id into v_sales from dd_sales_queue where source='THUMBTACK' and sales_metadata->>'thumbtack_lead_id'=v_lead limit 1;
   insert into dd_external_lead_messages(provider,external_message_id,external_lead_id,sales_queue_id,direction,sender_name,message_text,occurred_at,raw_payload,needs_response)
   values('THUMBTACK',v_msg,v_lead,v_sales,case when d->>'from'='Customer' then 'INBOUND' else 'OUTBOUND' end,d#>>'{customer,displayName}',d->>'text',nullif(d->>'sentAt','')::timestamptz,e.payload,(d->>'from'='Customer'))
   on conflict(provider,external_message_id) do update set sales_queue_id=coalesce(excluded.sales_queue_id,dd_external_lead_messages.sales_queue_id),raw_payload=excluded.raw_payload;
   if v_sales is not null and d->>'from'='Customer' then update dd_sales_queue set next_action='Respond to Thumbtack message',updated_at=now() where id=v_sales; end if;
 else raise exception 'Unsupported Thumbtack event type %',v_type; end if;
 update dd_external_webhook_events set processing_status='PROCESSED',processing_error=null,processed_at=now(),external_object_id=coalesce(external_object_id,v_lead) where id=p_event_id;
 return v_sales;
exception when others then update dd_external_webhook_events set processing_status='FAILED',processing_error=sqlerrm,processed_at=now() where id=p_event_id; return null; end $$;
