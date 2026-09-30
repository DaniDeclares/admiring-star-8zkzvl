-- Repair research starvation without adding a new worker.
-- The existing executor keeps its Brain P0 reservation, while the configured
-- non-service reservation policy now also guarantees a bounded SERVICE_DISCOVERY
-- candidate lane. Untouched work is preferred to repeated retries inside each lane.
-- Runtime function body is applied in Tester migration reserve_service_discovery_research_capacity.
-- Security hardening applied with it:
revoke execute on function public.dd_execute_research_work_v1(integer) from public, anon, authenticated;
grant execute on function public.dd_execute_research_work_v1(integer) to service_role;

comment on function public.dd_execute_research_work_v1(integer) is
'Governed research executor. Brain P0 retains reserved capacity; SERVICE_DISCOVERY candidate capacity is derived from dd_research_capacity_policy.reserve_non_service_discovery_pct. Within lanes, lower attempt count is preferred before age. No production mutation.';
