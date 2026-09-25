-- Rollback-only production lifecycle smoke harness.
-- This function NEVER commits test business data and NEVER invokes external delivery.
-- It validates the live FOS state machine against an existing work order supplied by the caller.
create or replace function public.dd_lifecycle_assert_work_order(p_work_order_id uuid)
returns jsonb
language plpgsql
security definer
set search_path to 'public'
as $function$
declare
  wo public.dd_work_orders;
  result jsonb;
begin
  select * into wo from public.dd_work_orders where id=p_work_order_id;
  if wo.id is null then raise exception 'WORK_ORDER_NOT_FOUND'; end if;

  result := jsonb_build_object(
    'work_order_id',wo.id,
    'status',wo.status,
    'has_customer_price',wo.customer_price is not null,
    'has_provider',wo.primary_provider_id is not null,
    'has_provider_pay',wo.provider_pay_amount is not null,
    'has_schedule',wo.scheduled_start is not null,
    'state_is_execution_ready',wo.status in ('SCHEDULED','EN_ROUTE','IN_PROGRESS','SUBMITTED','QA_REVIEW','QA_PASS','CUSTOMER_CLOSED','PAYABLE','PAID'),
    'checked_at',now()
  );

  return result;
end;$function$;

revoke all on function public.dd_lifecycle_assert_work_order(uuid) from public,anon,authenticated;
grant execute on function public.dd_lifecycle_assert_work_order(uuid) to service_role;
