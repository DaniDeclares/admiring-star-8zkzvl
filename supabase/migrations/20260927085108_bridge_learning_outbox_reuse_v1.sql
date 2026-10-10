
create or replace function public.dd_enqueue_dani_bridge_learning_transport()
returns jsonb
language plpgsql
security definer
set search_path='public'
as $$
declare
  rec record;
  v_id uuid;
  v_enqueued int := 0;
  v_blocked int := 0;
begin
  for rec in
    select *
    from dd_environment_bridge_receipts
    where direction='PRODUCTION_TO_TESTER'
      and artifact_type='LEARNING_EVIDENCE'
      and bridge_status='QUEUED'
  loop
    if coalesce(rec.source_state->>'domain','') in ('OWNER_PERSONAL','HOUSEHOLD','FAMILY','SHADOW_SOL')
       or coalesce(rec.source_state->'evidence_payload'->>'project_scope','') ilike '%PERSONAL%'
       or coalesce(rec.source_state->'evidence_payload'->>'project_scope','') ilike '%FAMILY%'
       or rec.artifact_key ilike '%FAMILY%'
       or rec.artifact_key ilike '%HOUSEHOLD%'
       or rec.artifact_key ilike '%SHADOW_SOL%'
    then
      update dd_environment_bridge_receipts
      set bridge_status='BLOCKED',
          target_state=coalesce(target_state,'{}'::jsonb) || jsonb_build_object(
            'blocked_reason','OUT_OF_SCOPE_PERSONAL_FAMILY_OR_ENTITY_ARCHITECTURE',
            'blocked_at',now(),
            'canonical_transfer',false
          ),
          reconciled_at=now(),
          updated_at=now()
      where id=rec.id;
      v_blocked:=v_blocked+1;
      continue;
    end if;

    v_id:=dd_enqueue_external_action(
      gen_random_uuid(),
      'DANI_BRIDGE_LEARNING:'||rec.bridge_key,
      'INGEST_DANI_PRODUCTION_BRIDGE_LEARNING',
      'DANI_TESTER_SUPABASE',
      'dd_environment_bridge_receipts',
      rec.id::text,
      jsonb_build_object(
        'bridge_receipt_id',rec.id,
        'bridge_key',rec.bridge_key,
        'artifact_key',rec.artifact_key,
        'entity_scope','DANI_DECLARES',
        'source_project','ajxezpczaemunlcmqlgl',
        'target_project','okvepooyxurujcwgfoju',
        'source_environment','PRODUCTION',
        'target_environment','TESTER',
        'source_state',rec.source_state,
        'source_observed_at',rec.source_observed_at,
        'authority','LEARNING_ONLY_NON_AUTHORITATIVE',
        'provenance','PRODUCTION_BRIDGE',
        'forbidden',jsonb_build_array(
          'operational_customer_rows','operational_provider_rows','money_rows',
          'owner_approval','auto_merge','auto_deploy','external_contact',
          'secret_change','pricing_change','provider_authority_change','rls_weakening'
        ),
        'target_operation','DANI_TESTER_LEARNING_INGEST_AND_RESEARCH_ROUTING'
      ),
      'DANI_BRIDGE_LEARNING:'||rec.bridge_key||':'||md5(rec.source_state::text),
      5
    );
    update dd_environment_bridge_receipts
    set target_state=coalesce(target_state,'{}'::jsonb) || jsonb_build_object(
          'transport_outbox_id',v_id,
          'transport_enqueued_at',now(),
          'transport_contract','DANI_TESTER_LEARNING_INGEST_AND_RESEARCH_ROUTING',
          'canonical_transfer',false
        ),
        updated_at=now()
    where id=rec.id;
    v_enqueued:=v_enqueued+1;
  end loop;

  return jsonb_build_object(
    'status','COMPLETED',
    'enqueued',v_enqueued,
    'blocked',v_blocked,
    'destination','DANI_TESTER_SUPABASE',
    'production_authority_expanded',false,
    'direct_cross_database_write',false
  );
end $$;

revoke all on function public.dd_enqueue_dani_bridge_learning_transport() from public, anon, authenticated;
grant execute on function public.dd_enqueue_dani_bridge_learning_transport() to service_role;
