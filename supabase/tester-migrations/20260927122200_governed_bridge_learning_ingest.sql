-- Governed Production -> Tester learning ingestion contract.
-- Learning-only: no production authority, money, external contact, merge, deploy, or permission expansion.

create or replace function public.dd_ingest_production_bridge_learning(p_payload jsonb)
returns jsonb
language plpgsql
set search_path = public
as $$
declare
  v_source jsonb := coalesce(p_payload->'source_state','{}'::jsonb);
  v_artifact text := nullif(trim(p_payload->>'artifact_key'),'');
  v_observation text := nullif(trim(v_source->>'observation'),'');
  v_evidence_key text;
  v_origin text;
  v_authority text;
  v_id uuid;
  v_route jsonb;
begin
  if coalesce(p_payload->>'entity_scope','') <> 'DANI_DECLARES' then
    raise exception 'ENTITY_SCOPE_BLOCKED';
  end if;
  if coalesce(p_payload->>'source_environment','') <> 'PRODUCTION'
     or coalesce(p_payload->>'target_environment','') <> 'TESTER' then
    raise exception 'ENVIRONMENT_BOUNDARY_BLOCKED';
  end if;
  if coalesce(p_payload->>'authority','') <> 'LEARNING_ONLY_NON_AUTHORITATIVE' then
    raise exception 'LEARNING_AUTHORITY_REQUIRED';
  end if;
  if v_artifact is null or v_observation is null then
    raise exception 'ARTIFACT_AND_OBSERVATION_REQUIRED';
  end if;
  if v_artifact ilike '%FAMILY%' or v_artifact ilike '%HOUSEHOLD%' or v_artifact ilike '%SHADOW_SOL%'
     or coalesce(v_source->>'domain','') in ('OWNER_PERSONAL','HOUSEHOLD','FAMILY','SHADOW_SOL')
     or coalesce(v_source->'evidence_payload'->>'project_scope','') ilike '%PERSONAL%'
     or coalesce(v_source->'evidence_payload'->>'project_scope','') ilike '%FAMILY%' then
    raise exception 'OUT_OF_SCOPE_PERSONAL_FAMILY_OR_ENTITY_ARCHITECTURE';
  end if;

  v_origin := case
    when coalesce(v_source->>'evidence_origin','') in ('RESEARCH','PRODUCTION','TESTER','ACCOUNTING','CUSTOMER','PROVIDER','SECURITY','MARKET')
      then v_source->>'evidence_origin'
    else 'PRODUCTION'
  end;
  v_authority := case
    when coalesce(v_source->>'authority_class','') in ('EVIDENCE','GOVERNANCE','RUNTIME','PAYMENT','CRM','ANALYTICS','ACCOUNTING')
      then v_source->>'authority_class'
    else 'EVIDENCE'
  end;
  v_evidence_key := 'PRODUCTION_BRIDGE:'||v_artifact;

  insert into public.dd_learning_evidence_intake(
    evidence_key,evidence_origin,domain,source_system,source_reference,observation,
    evidence_payload,authority_class,requires_new_test,status
  ) values (
    v_evidence_key,
    v_origin,
    coalesce(nullif(v_source->>'domain',''),'AI_DATA_GOVERNANCE_INTELLIGENCE'),
    'PRODUCTION_BRIDGE',
    coalesce(nullif(v_source->>'source_reference',''),p_payload->>'bridge_key',v_artifact),
    v_observation,
    coalesce(v_source->'evidence_payload','{}'::jsonb) || jsonb_build_object(
      'bridge_receipt_id',p_payload->>'bridge_receipt_id',
      'bridge_key',p_payload->>'bridge_key',
      'original_source_system',v_source->>'source_system',
      'production_authority',false
    ),
    v_authority,
    coalesce((v_source->>'requires_new_test')::boolean,true),
    'NEW'
  )
  on conflict(evidence_key) do update set
    evidence_origin=excluded.evidence_origin,
    domain=excluded.domain,
    source_system=excluded.source_system,
    source_reference=excluded.source_reference,
    observation=excluded.observation,
    evidence_payload=excluded.evidence_payload,
    authority_class=excluded.authority_class,
    requires_new_test=excluded.requires_new_test,
    status=case when public.dd_learning_evidence_intake.status in ('ADOPTED','REJECTED','TESTED')
                then public.dd_learning_evidence_intake.status else 'NEW' end,
    updated_at=now()
  returning id into v_id;

  select public.dd_queue_universal_learning_evidence_cross_signals() into v_route;

  return jsonb_build_object(
    'status','INGESTED',
    'evidence_id',v_id,
    'evidence_key',v_evidence_key,
    'route',v_route,
    'tester_only',true,
    'production_authority',false,
    'auto_activate',false
  );
end $$;


-- Bridge ingestion is an internal cross-environment transport contract.
-- Only the server-side bridge worker may invoke it.
revoke all on function public.dd_ingest_production_bridge_learning(jsonb) from public;
revoke all on function public.dd_ingest_production_bridge_learning(jsonb) from anon;
revoke all on function public.dd_ingest_production_bridge_learning(jsonb) from authenticated;
grant execute on function public.dd_ingest_production_bridge_learning(jsonb) to service_role;
