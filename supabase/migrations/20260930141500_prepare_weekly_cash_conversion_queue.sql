-- Prepare a bounded internal conversion queue aligned to OWNER DANI's weekly cash horizon. No external contact, money action, or release bypass. Idempotent: already-prepared untouched leads are not rewritten.
CREATE OR REPLACE FUNCTION public.dd_prepare_weekly_cash_conversion_queue(p_limit integer DEFAULT 25)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'pg_temp'
AS $function$
declare v_prepared int:=0;
begin
 if current_user not in ('postgres','service_role') then raise exception 'service_role required'; end if;
 with ranked as (
  select id,row_number() over(order by
   case source when 'THUMBTACK' then 1 when 'HUBSPOT_DEAL' then 2 when 'LINKEDIN_MESSAGE' then 3 when 'LINKEDIN_MARKETPLACE' then 4 when 'LINKEDIN_INVITE' then 5 else 6 end,
   coalesce(intent_score,0) desc,
   decision_maker_confirmed desc,
   coalesce(source_occurred_at,created_at) desc) rn
  from public.dd_sales_queue
  where disposition='NOT_CONTACTED' and not coalesce(do_not_contact,false)
    and (next_permitted_contact_at is null or next_permitted_contact_at<=now())
    and coalesce(sales_metadata->>'weekly_cash_priority','false')<>'true'
 ), upd as (
  update public.dd_sales_queue s
  set next_action=case
    when s.source='THUMBTACK' then 'OWNER_REVIEW_AND_RESPOND_TO_INBOUND_LEAD'
    when s.source='HUBSPOT_DEAL' then 'OWNER_REVIEW_EXISTING_RELATIONSHIP_AND_SELECT_GOVERNED_OFFER'
    else 'OWNER_REVIEW_LEAD_AND_SELECT_GOVERNED_CONTACT_PATH' end,
   next_action_date=current_date,
   sales_metadata=coalesce(s.sales_metadata,'{}'::jsonb)||jsonb_build_object(
    'weekly_cash_priority',true,'owner_horizon','WEEKLY','prepared_by','dd_prepare_weekly_cash_conversion_queue',
    'external_contact_executed',false,'offer_release_must_be_verified',true,'prepared_at',now()),
   updated_at=now()
  from ranked r where s.id=r.id and r.rn<=greatest(1,least(coalesce(p_limit,25),100))
  returning s.id
 ) select count(*) into v_prepared from upd;
 return jsonb_build_object('status','COMPLETED','prepared',v_prepared,'external_contact',false,'money_action',false,'production_mutation',false,'owner_horizon','WEEKLY');
end $function$
;
revoke execute on function public.dd_prepare_weekly_cash_conversion_queue(integer) from public,anon,authenticated;
grant execute on function public.dd_prepare_weekly_cash_conversion_queue(integer) to service_role;
