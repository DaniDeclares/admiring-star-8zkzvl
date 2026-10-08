-- Pre-promotion fail-closed dependency and hold audit.
-- Run only after restoring the historical buyer execution-plan migration chain.
-- No data is mutated by these assertions.
do $proof$
declare missing text[]; invalid_count integer;
begin
 select array_agg(x.name) into missing
 from (values
   ('dd_buyer_execution_plans','table'),
   ('dd_execution_package_routing','table'),
   ('dd_execution_package_snapshot_v2','function'),
   ('dd_execution_plan_action_v2','function'),
   ('dd_build_buyer_execution_plans_v2','function'),
   ('dd_match_buyers_to_execution_plans_v2','function')
 ) as x(name,kind)
 where case when x.kind='table'
   then to_regclass('public.'||x.name) is null
   else not exists (select 1 from pg_proc p join pg_namespace n on n.oid=p.pronamespace
                    where n.nspname='public' and p.proname=x.name) end;
 if missing is not null then
   raise exception 'Missing historical buyer matcher dependencies: %',missing;
 end if;
 select count(*) into invalid_count
 from public.dd_buyer_execution_plans
 where plan_status in ('OUTREACH_READY','QUOTE_READY','CROSS_SELL_READY')
   and coalesce(cardinality(held_core_skus),0)>0;
 if invalid_count>0 then
   raise exception 'Buyer plans with held required components incorrectly ready: %',invalid_count;
 end if;
end
$proof$;
