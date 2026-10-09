-- Strict buyer attribution: a source reference alone is not proof of a buyer statement.
-- This intentionally does not modify sales data or the matcher.
create or replace function public.dd_buyer_evidence_v2(p_sales_id uuid)
returns jsonb language sql stable set search_path to 'public','pg_catalog'
as $function$
select jsonb_build_object(
 'channel',s.sales_metadata->>'channel_code',
 'front_door',s.front_door_code,
 'disposition',s.disposition,
 'pain',case when src.eligible_count=1 then s.pain_point else null end,
 'stated',case when src.eligible_count=1 then src.explicit_request else null end,
 'public_sig',nullif(trim(concat_ws(' ',s.sales_metadata->>'vendor_signal',(s.sales_metadata->'research_claims')::text,s.front_door_notes)),''),
 'source_evidence_status',case
   when src.eligible_count=1 then 'EXACT_LINKED_INBOUND_REQUEST'
   when src.eligible_count>1 then 'MULTIPLE_REQUESTS_REVIEW'
   when s.source_message_id is not null then 'SOURCE_REFERENCE_REQUIRES_VERIFICATION'
   else 'NO_EXACT_LINKED_INBOUND_REQUEST' end,
 'source_evidence_count',src.eligible_count)
from public.dd_sales_queue s
cross join lateral (
 select count(*)::int eligible_count,max(message_text) explicit_request
 from public.dd_external_lead_messages m
 where m.sales_queue_id=s.id
   and lower(trim(coalesce(m.direction,''))) in ('inbound','incoming','received')
   and nullif(trim(m.external_message_id),'') is not null
   and nullif(trim(m.message_text),'') is not null
   and length(trim(m.message_text)) between 15 and 2000
   and m.message_text ~* '(please (send|provide|quote|schedule|book)|can you (quote|provide|schedule|book)|(?:i|we) (?:need|want) (?:help with|a quote for|to book|to schedule)|request(?:ing|ed)? (?:a )?(?:quote|estimate|service))'
) src where s.id=p_sales_id
$function$;