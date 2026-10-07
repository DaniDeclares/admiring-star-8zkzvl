alter view public.dd_external_action_claim_health_v1
  set (security_invoker = true);

revoke all on public.dd_external_action_claim_health_v1 from anon;
grant select on public.dd_external_action_claim_health_v1 to authenticated, service_role;

comment on view public.dd_external_action_claim_health_v1 is
'Operational claim-health projection. SECURITY INVOKER; readable by authenticated operators and service-role workers only.';
