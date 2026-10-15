create or replace function private.dd_run_demand_radar()
returns jsonb language plpgsql security definer set search_path = ''
as $$
declare v_staged integer:=0; v_promoted integer:=0; v_attention integer:=0; v_suppressed integer:=0; r record; v_email text; v_phone text; v_summary text;
begin
for r in
select m.provider,m.external_lead_id,max(m.sender_name) filter(where m.sender_name is not null) sender_name,string_agg(m.message_text,E'\n' order by m.occurred_at desc) message_bundle,max(m.occurred_at) last_seen
from public.dd_external_lead_messages m
where m.direction='INBOUND' and m.needs_response=true and m.sales_queue_id is null and m.provider='THUMBTACK'
and not exists(select 1 from public.dd_demand_capture_staging d where d.source_type='EXTERNAL_LEAD' and d.source_signal_id=m.external_lead_id)
and not exists(select 1 from public.dd_sales_queue q where q.source='THUMBTACK' and ((q.sales_metadata->>'thumbtack_lead_id')=m.external_lead_id or (q.sales_metadata->>'thumbtack_negotiation_id')=m.external_lead_id or (q.sales_metadata->>'thumbtack_request_id')=m.external_lead_id))
group by m.provider,m.external_lead_id order by max(m.occurred_at) limit 100
loop
v_email:=(regexp_match(r.message_bundle,'[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}'))[1];
v_phone:=(regexp_match(r.message_bundle,'(?:\+?1[ .-]?)?(?:\(?[2-9][0-9]{2}\)?[ .-]?[0-9]{3}[ .-]?[0-9]{4})'))[1];
v_summary:=left(r.message_bundle,4000);
insert into public.dd_demand_capture_staging(source_type,source_signal_id,channel_code,signal_type,service_hint,need_summary,urgency,contact_name,contact_email,contact_phone,contact_permission,verification_status,promotion_status,owner_attention_required,attention_reason,demand_class,observed_at)
values('EXTERNAL_LEAD',r.external_lead_id,'CH01','INBOUND','REVIEW_FROM_EXTERNAL_LEAD',v_summary,case when v_summary ~* '(today|tomorrow|asap|urgent|early|soon)' then 'HIGH' else 'NORMAL' end,r.sender_name,v_email,v_phone,case when v_email is not null or v_phone is not null then 'CONSENTED' else 'PUBLIC_CONTACT_ROUTE' end,case when v_email is not null or v_phone is not null then 'VERIFIED' else 'UNVERIFIED' end,case when v_email is not null or v_phone is not null then 'READY' else 'NEEDS_CONTACT_ROUTE' end,(v_email is null and v_phone is null),case when v_email is null and v_phone is null then 'Inbound demand exists but no direct contact route was recovered from the captured message bundle.' else null end,case when v_summary ~* '(book|schedule|clean|cleaning|service|quote|price|availability)' then 'BUYING_SIGNAL' else 'INBOUND_DEMAND' end,r.last_seen)
on conflict(source_type,source_signal_id) where source_signal_id is not null do nothing;
if found then v_staged:=v_staged+1; if v_email is null and v_phone is null then v_attention:=v_attention+1; end if; end if;
end loop;
select coalesce((private.dd_promote_demand_capture_staging()->>'promoted_count')::integer,0) into v_promoted;
return jsonb_build_object('staged_count',v_staged,'promoted_count',v_promoted,'owner_attention_count',v_attention,'suppressed_existing_sales',v_suppressed,'architecture','DEMAND_CAPTURE_TO_EXISTING_SALES_QUEUE','auto_outreach',false,'auto_booking',false);
end; $$;
