create or replace view public.dd_provider_reconciliation_triage_v1 with (security_invoker=true) as
select p.id provider_id,p.provider_code,p.org_id,o.vendor_type,o.agreement_status,o.compliance_status,
 count(c.id)::int capability_count,r.application_id,case when r.application_id is null then 'NO_APPLICATION' else 'APPLICATION_'||coalesce(r.application_status,'UNKNOWN') end as onboarding_next_action,
 case
  when r.application_id is not null then 'CANONICAL_APPLICATION_PRESENT'
  when count(c.id)>=3 or o.agreement_status='EXECUTED' or o.compliance_status='VERIFIED' then 'LEGACY_RECOVERY_CANDIDATE'
  when p.provider_code like 'PRV-%' and count(c.id)<=1 and coalesce(o.agreement_status,'NOT_ON_FILE')='NOT_ON_FILE' then 'PROVENANCE_REVIEW'
  else 'MANUAL_IDENTITY_REVIEW'
 end reconciliation_lane,
 case
  when r.application_id is not null then 'CONTINUE_CANONICAL_ONBOARDING'
  when count(c.id)>=3 or o.agreement_status='EXECUTED' or o.compliance_status='VERIFIED' then 'CREATE_RECOVERY_STAGING_ONLY_PRESERVE_EVIDENCE'
  else 'DO_NOT_CREATE_APPLICATION_UNTIL_IDENTITY_PROVENANCE_CONFIRMED'
 end reconciliation_action
from public.dd_providers p
left join public.dd_provider_organizations o on o.id=p.org_id
left join public.dd_provider_capabilities c on c.provider_id=p.id or (p.org_id is not null and c.provider_org_id=p.org_id)
left join (select distinct on (provider_id) provider_id,id as application_id,application_status from public.dd_provider_applications where provider_id is not null order by provider_id,updated_at desc) r on r.provider_id=p.id
group by p.id,p.provider_code,p.org_id,o.vendor_type,o.agreement_status,o.compliance_status,r.application_id,r.application_status;
revoke all on public.dd_provider_reconciliation_triage_v1 from anon,authenticated;
grant select on public.dd_provider_reconciliation_triage_v1 to service_role;
comment on view public.dd_provider_reconciliation_triage_v1 is 'Fail-closed provider reconciliation triage. Separates evidence-rich legacy providers from low-evidence/scaffolding records before any canonical application recovery. Never approves providers.';