create or replace view public.dd_external_action_claim_health_v1 as
select action_type,
 count(*) filter(where status='PENDING')::int pending_count,
 count(*) filter(where status='PENDING' and attempt_count=0)::int never_attempted_count,
 min(created_at) filter(where status='PENDING') oldest_pending_at,
 max(claimed_at) last_claimed_at,
 max(completed_at) filter(where status='SUCCEEDED') last_succeeded_at,
 case when count(*) filter(where status='PENDING' and attempt_count=0)>0
  and min(created_at) filter(where status='PENDING' and attempt_count=0)<now()-interval '20 minutes'
  then 'CLAIM_STALLED'
  when count(*) filter(where status='PENDING')>0 then 'PENDING'
  else 'HEALTHY' end claim_health
from public.dd_external_action_outbox group by action_type;
grant select on public.dd_external_action_claim_health_v1 to authenticated,service_role;
comment on view public.dd_external_action_claim_health_v1 is
'Observes whether the existing external-action executor is claiming queued work. CLAIM_STALLED means never-attempted work is older than two scheduled 10-minute cycles.';