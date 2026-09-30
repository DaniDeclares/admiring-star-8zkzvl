-- Candidate-specific source discovery quality gate.
-- Prevents a generic program source from satisfying unrelated service-candidate evidence.
-- Runtime implementation applied to Tester as candidate_specific_source_discovery_quality_gate.
--
-- New controller: public.dd_queue_candidate_source_discovery_requests()
-- Existing validator upgraded: candidate requests carry metadata.work_key and require
-- validation.work_specific_relevance=true before activation. Activated sources inherit
-- that work_key, so the research executor can require candidate-specific evidence.
--
-- Security boundary:
revoke execute on function public.dd_queue_candidate_source_discovery_requests() from public, anon, authenticated;
grant execute on function public.dd_queue_candidate_source_discovery_requests() to service_role;
revoke execute on function public.dd_validate_source_discovery_candidate(text,text,text,text,jsonb) from public, anon, authenticated;
grant execute on function public.dd_validate_source_discovery_candidate(text,text,text,text,jsonb) to service_role;
