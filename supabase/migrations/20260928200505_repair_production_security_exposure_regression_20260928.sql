
do $$
declare r record;
begin
  for r in select format('%I.%I',table_schema,table_name) fq
           from information_schema.tables
           where table_schema='public' and table_name like 'dd_%'
  loop
    execute 'revoke insert, update, delete, truncate, references, trigger on table '||r.fq||' from anon';
  end loop;
end $$;

revoke execute on function public.dd_consume_sales_research_intelligence(integer) from anon, public;
revoke execute on function public.dd_run_revenue_qualification_handoff(integer) from anon, public;
