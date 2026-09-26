create or replace function public.dd_refresh_capability_gaps()
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare n int:=0;
begin
 with master_scope as (select distinct on (canonical_sku) m.*,count(*) over(partition by canonical_sku)::int duplicate_sku_rows from public.dd_master_service_universe m where canonical_sku is not null order by canonical_sku,updated_at desc,created_at desc), pricing_scope as (
   select canonical_sku,array_agg(distinct ch) filter(where ch is not null) channel_scope
   from public.dd_service_pricing_research_queue q
   left join lateral unnest(coalesce(q.channel_scope,'{}'::text[])) ch on true
   where canonical_sku is not null
   group by canonical_sku
 )
 insert into public.dd_capability_gap_queue(gap_key,canonical_sku,service_name,division,channel_scope,gap_type,status,
   existing_provider_matches,recruiting_required,licensing_or_credential_gate,research_evidence,owner_approval_required)
 select 'SERVICE_CAPABILITY:'||m.canonical_sku,m.canonical_sku,m.service_name,m.division,coalesce(q.channel_scope,'{}'::text[]),
   'FULFILLMENT_CAPABILITY_UNPROVEN',
   case when pm.authorized_matches>0 then 'COVERED_BY_PROVIDER_REGISTRY'
        when nullif(trim(coalesce(m.assigned_provider,'')),'') is not null
         and nullif(trim(coalesce(m.provider_qualifications,'')),'') is not null then 'COVERED_BY_MASTER_UNIVERSE'
        else 'RESEARCHING' end,
   pm.authorized_matches,
   pm.authorized_matches=0 and nullif(trim(coalesce(m.assigned_provider,'')),'') is null,
   coalesce(m.compliance_legal_boundaries,'') ~* '(license|credential|certif|permit|notary|hvac|electri|plumb)',
   jsonb_build_object('capability',m.capability,'fulfillment_lane',m.fulfillment_lane,
     'master_assigned_provider',m.assigned_provider,'provider_qualifications',m.provider_qualifications,
     'compliance_boundary',m.compliance_legal_boundaries,'provider_registry_exact_service_matches',pm.authorized_matches,
     'provider_registry_match_rule','AUTHORIZED_EXACT_SERVICE_LINE','master_duplicate_sku_rows',m.duplicate_sku_rows,'requires_provider_registry_reconciliation',false),
   false
 from master_scope m
 left join pricing_scope q on q.canonical_sku=m.canonical_sku
 cross join lateral (
   select count(*)::int authorized_matches from public.dd_provider_capabilities pc
   where pc.is_authorized is true and lower(trim(pc.service_line))=lower(trim(m.service_name))
 ) pm
 where m.canonical_sku is not null
 on conflict(gap_key) do update set status=excluded.status,existing_provider_matches=excluded.existing_provider_matches,
   recruiting_required=excluded.recruiting_required,licensing_or_credential_gate=excluded.licensing_or_credential_gate,
   research_evidence=excluded.research_evidence,channel_scope=excluded.channel_scope,updated_at=now();
 get diagnostics n=row_count;
 return n;
end $$;
revoke execute on function public.dd_refresh_capability_gaps() from public,anon,authenticated;
grant execute on function public.dd_refresh_capability_gaps() to service_role;