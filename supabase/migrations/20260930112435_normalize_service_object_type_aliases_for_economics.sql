
do $$
declare v text;
begin
  select pg_get_viewdef('public.dd_service_economics_authority_v1'::regclass,true) into v;
  v := replace(
    v,
    'WHERE g.commercial_object_type = ''SERV''::text',
    'WHERE g.commercial_object_type = ANY (ARRAY[''SERV''::text,''SERVICE''::text])'
  );
  execute 'create or replace view public.dd_service_economics_authority_v1 as ' || v;
end
$$;
