create or replace function public.dd_sync_work_order_from_job_trigger()
returns trigger
language plpgsql
security definer
set search_path to 'public'
as $function$
begin
  if tg_table_name = 'dd_jobs' then
    perform public.dd_sync_work_order_from_job(new.id);
  else
    perform public.dd_sync_work_order_from_job(new.job_id);
  end if;
  return new;
end;
$function$;
