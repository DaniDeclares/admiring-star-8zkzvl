begin;

create or replace function private.dd_guard_niche_funding_source_scope()
returns trigger
language plpgsql
security invoker
set search_path = public, private, pg_temp
as $$
begin
  if new.program_key='NICHE_FUNDING_INTELLIGENCE' and nullif(btrim(coalesce(new.work_key,'')),'') is null then
    raise exception 'NICHE_FUNDING_WORK_SPECIFIC_SOURCE_REQUIRED';
  end if;
  return new;
end;
$$;

revoke all on function private.dd_guard_niche_funding_source_scope() from public, anon, authenticated;

drop trigger if exists trg_dd_guard_niche_funding_source_scope on public.dd_research_sources;
create trigger trg_dd_guard_niche_funding_source_scope
before insert or update on public.dd_research_sources
for each row execute function private.dd_guard_niche_funding_source_scope();

update public.dd_research_source_discovery_requests
set metadata=coalesce(metadata,'{}'::jsonb)||jsonb_build_object('work_key',case request_key
 when 'FUNDING:DISCOVER:DANI:OFFICIAL' then 'FUNDING:NICHE_DISCOVERY:DANI'
 when 'FUNDING:DISCOVER:SHADOW_SOL:OFFICIAL' then 'FUNDING:NICHE_DISCOVERY:SHADOW_SOL'
 when 'FUNDING:DISCOVER:SOCIAL_REEL:20261005' then 'FUNDING:REVERIFY:SOCIAL_CLAIMS:20261005'
 else metadata->>'work_key' end,'work_specific_relevance_required',true),updated_at=now()
where request_key in ('FUNDING:DISCOVER:DANI:OFFICIAL','FUNDING:DISCOVER:SHADOW_SOL:OFFICIAL','FUNDING:DISCOVER:SOCIAL_REEL:20261005');

insert into public.dd_research_source_discovery_requests(request_key,program_key,gap_key,priority,request_status,discovery_question,source_requirements,metadata)
values
('FUNDING:DISCOVER:SAM_NAICS','NICHE_FUNDING_INTELLIGENCE','SAM_NAICS_CURRENT_AUTHORITY','P0','OPEN','Find current authoritative SAM.gov entity-registration evidence for DANI DECLARES registered NAICS codes.',jsonb_build_object('authority_levels',jsonb_build_array('PRIMARY','OFFICIAL'),'current_registration_required',true),jsonb_build_object('work_key','FUNDING:VERIFY:SAM_NAICS','work_specific_relevance_required',true,'entity_scope','DANI_DECLARES')),
('FUNDING:DISCOVER:SC_DISASTER_NOTARY','NICHE_FUNDING_INTELLIGENCE','SC_GA_DISASTER_NOTARY_SCOPE','P0','OPEN','Find current authoritative Georgia and South Carolina sources governing service scope and notarial authority relevant to resilience, shelter support, disaster cleanup and emergency document work.',jsonb_build_object('authority_levels',jsonb_build_array('PRIMARY','REGULATOR'),'jurisdiction_specific',true),jsonb_build_object('work_key','FUNDING:LEGAL_SCOPE:SC_DISASTER_NOTARY','work_specific_relevance_required',true,'entity_scope','DANI_DECLARES'))
on conflict(request_key) do update set request_status='OPEN',discovery_question=excluded.discovery_question,source_requirements=excluded.source_requirements,metadata=excluded.metadata,updated_at=now();

commit;
