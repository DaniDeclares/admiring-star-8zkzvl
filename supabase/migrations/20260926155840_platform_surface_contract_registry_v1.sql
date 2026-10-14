
create table if not exists public.dd_platform_surface_registry(
  surface_key text primary key,
  surface_name text not null,
  audience text not null,
  route_hint text,
  code_path_hint text,
  downstream_contract text not null,
  proof_contract jsonb not null default '{}'::jsonb,
  status text not null default 'ACTIVE',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.dd_platform_surface_registry enable row level security;
revoke all on public.dd_platform_surface_registry from anon, authenticated;
grant select,insert,update,delete on public.dd_platform_surface_registry to service_role;

insert into public.dd_platform_surface_registry(surface_key,surface_name,audience,route_hint,code_path_hint,downstream_contract,proof_contract)
values
('OWNER_HQ','Owner HQ','OWNER','/portal/owner','src/pages/portal/OwnerHQPage.jsx','Owner actions and operational state must round-trip through governed APIs/database authority and return evidence to Owner HQ.', '{"render":["mobile","tablet","desktop"],"auth_fixture":true,"runtime_evidence":true}'::jsonb),
('SALES','Sales Workspace','SALES','/portal','src/pages/portal/StaffCommandCenter.jsx','Sales actions must persist to the governed sales queue/CRM handoff and surface resulting state without manual database intervention.', '{"auth_fixture":true,"runtime_evidence":true}'::jsonb),
('ACCOUNTING','Accounting Workspace','ACCOUNTING','/portal','src/pages/portal/ProviderAccountingPage.jsx','Accounting actions must flow through accounting control-plane authority, reconciliation evidence and owner-decision gates.', '{"auth_fixture":true,"runtime_evidence":true,"money_mutation_requires_review":true}'::jsonb),
('PROVIDER_APP','Provider App','PROVIDER','/portal','src/pages/portal/ProviderFieldPage.jsx','Provider onboarding, availability, offers, execution, evidence, QA, earnings and payout state must follow provider identity and assignment boundaries.', '{"auth_fixture":true,"runtime_evidence":true,"cross_provider_isolation":true}'::jsonb),
('CUSTOMER_PORTAL','Customer Portal','CUSTOMER','/portal','src/pages/portal/PortalWorkspacePage.jsx','Customer requests, estimates, approvals, payment state and fulfillment visibility must use authoritative commercial/job state.', '{"auth_fixture":true,"runtime_evidence":true}'::jsonb),
('QUOTE_BUILDER','Quote Builder','STAFF','/portal','src/pages/portal/QuoteBuilderPage.jsx','Quote inputs must resolve governed scope/pricing/routing/underwriting rules and preserve immutable commercial provenance.', '{"auth_fixture":true,"runtime_evidence":true,"pricing_mutation_requires_review":true}'::jsonb),
('ONBOARDING','Onboarding','PROVIDER_CUSTOMER','/provider/apply','src/pages/partner-network/OnboardingPage.jsx','Onboarding must create the correct identity/application state, required documents/capabilities and downstream activation gates.', '{"render":["mobile","tablet","desktop"],"runtime_evidence":true}'::jsonb),
('OPERATIONS','Operations Console','STAFF','/portal','src/pages/portal/OperationsConsolePage.jsx','Operational actions must use authoritative jobs, dispatch, scheduling, evidence and QA state.', '{"auth_fixture":true,"runtime_evidence":true}'::jsonb)
on conflict(surface_key) do update set
 downstream_contract=excluded.downstream_contract,
 proof_contract=excluded.proof_contract,
 route_hint=excluded.route_hint,
 code_path_hint=excluded.code_path_hint,
 updated_at=now();

create or replace view public.dd_platform_surface_build_status_v1 as
select
 s.surface_key,s.surface_name,s.audience,s.route_hint,s.code_path_hint,s.downstream_contract,s.proof_contract,
 count(c.id) filter(where c.source_type='SOFTWARE_BUILD_WORK_QUEUE') as platform_candidates,
 count(c.id) filter(where c.status='NEEDS_MANIFEST') as needs_manifest,
 count(c.id) filter(where c.status='BLOCKED') as review_blocked,
 count(c.id) filter(where c.status='PR_OPENED') as pr_opened,
 max(c.updated_at) as last_candidate_activity
from public.dd_platform_surface_registry s
left join public.dd_autobuild_candidates c
  on c.source_type='SOFTWARE_BUILD_WORK_QUEUE'
 and (
   (s.surface_key in('CUSTOMER_PORTAL','QUOTE_BUILDER') and c.title like 'CH01-%')
   or (s.surface_key in('OPERATIONS','OWNER_HQ') and c.title like 'CH03-%')
   or (s.surface_key='SALES' and c.title like 'CH05-%')
   or (s.surface_key in('PROVIDER_APP','ONBOARDING') and c.domain in('SOFTWARE_FULFILLMENT','SOFTWARE_UX'))
   or (s.surface_key='ACCOUNTING' and c.domain='SOFTWARE_COMMERCIAL')
 )
group by s.surface_key,s.surface_name,s.audience,s.route_hint,s.code_path_hint,s.downstream_contract,s.proof_contract;

revoke all on public.dd_platform_surface_build_status_v1 from anon, authenticated;
grant select on public.dd_platform_surface_build_status_v1 to service_role;
