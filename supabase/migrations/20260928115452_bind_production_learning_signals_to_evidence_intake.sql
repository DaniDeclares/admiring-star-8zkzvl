
create or replace function public.dd_bind_production_learning_signals_to_evidence_intake()
returns jsonb
language plpgsql
set search_path='public'
as $function$
declare v_bound int:=0;
begin
  insert into public.dd_learning_evidence_intake(
    evidence_key,evidence_origin,domain,source_system,source_reference,observation,
    evidence_payload,authority_class,requires_new_test,status
  )
  select
    'PROD_SIGNAL:'||s.signal_key,
    'PRODUCTION',
    s.signal_type,
    'PRODUCTION_LEARNING_SIGNAL',
    s.id::text,
    s.statement,
    coalesce(s.evidence,'{}'::jsonb) || jsonb_build_object(
      'signal_key',s.signal_key,
      'signal_status',s.status,
      'confidence',s.confidence,
      'learning_boundary','OBSERVATION_ONLY_REQUIRES_TESTER_VALIDATION',
      'production_authority',false,
      'promotion_authority',false,
      'source_updated_at',s.updated_at
    ),
    'EVIDENCE',
    true,
    'TEST_REQUIRED'
  from public.dd_production_learning_signals s
  where s.status in ('NEW','ROUTED')
  on conflict(evidence_key) do update set
    observation=excluded.observation,
    evidence_payload=excluded.evidence_payload,
    requires_new_test=true,
    status=case
      when public.dd_learning_evidence_intake.status in ('ADOPTED','REJECTED') then public.dd_learning_evidence_intake.status
      else 'TEST_REQUIRED'
    end,
    updated_at=now();
  get diagnostics v_bound=row_count;
  return jsonb_build_object(
    'status','COMPLETED',
    'bound_or_refreshed',v_bound,
    'authority','OBSERVATION_ONLY',
    'tester_validation_required',true,
    'production_mutation_authority',false,
    'promotion_authority',false
  );
end
$function$;
