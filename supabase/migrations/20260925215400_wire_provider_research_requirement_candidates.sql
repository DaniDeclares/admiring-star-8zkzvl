-- TESTER: research -> provider requirement candidate bridge.
-- Research evidence may create REVIEW_REQUIRED candidates only.
-- It does not authorize providers, change governed requirements, or dispatch work.

create table if not exists public.dd_provider_requirement_research_candidates (
 id uuid primary key default gen_random_uuid(),
 evidence_id uuid not null references public.dd_research_evidence(id),
 target_requirement_code text not null references public.dd_provider_capability_requirements(requirement_code),
 jurisdiction text,
 candidate_scope text not null default 'PROVIDER_ONBOARDING',
 candidate_status text not null default 'RESEARCH_CANDIDATE'
   check(candidate_status in ('RESEARCH_CANDIDATE','REVIEW_REQUIRED','APPROVED_FOR_GOVERNANCE','REJECTED')),
 rationale text not null,
 owner_approval_required boolean not null default true,
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now(),
 unique(evidence_id,target_requirement_code,jurisdiction)
);
alter table public.dd_provider_requirement_research_candidates enable row level security;
revoke all on public.dd_provider_requirement_research_candidates from public,anon,authenticated;
grant select,insert,update on public.dd_provider_requirement_research_candidates to service_role;

create or replace function public.dd_reconcile_provider_requirement_research_candidates()
returns integer language plpgsql security definer set search_path='public' as $$
declare n integer:=0;
begin
 insert into public.dd_provider_requirement_research_candidates(
   evidence_id,target_requirement_code,jurisdiction,candidate_status,rationale,owner_approval_required
 )
 select e.id,
   case
    when e.claim_key like 'WATCH_IRS_IC_FORMS_TAX_w9_requirement%' then 'TAX_W9'
    when e.claim_key like 'WATCH_FTC_BACKGROUND_CHECKS_%' then 'BACKGROUND_CONSENT'
    when e.claim_key like 'WATCH_GA_SOS_LICENSING_BOARDS_%'
      or e.claim_key like 'WATCH_SC_LLR_PROFESSIONS_%' then 'LICENSE_SERVICE'
   end,
   case when e.claim_key like 'WATCH_GA_%' then 'GA'
        when e.claim_key like 'WATCH_SC_%' then 'SC' else null end,
   'REVIEW_REQUIRED',
   'Research evidence candidate only. Validate applicability by provider type, service and jurisdiction before changing governed requirements.',
   true
 from public.dd_research_evidence e
 where e.evidence_status='CONFIRMED'
   and e.authority_level in ('PRIMARY','REGULATOR')
   and (e.claim_key like 'WATCH_IRS_IC_FORMS_TAX_w9_requirement%'
     or e.claim_key like 'WATCH_FTC_BACKGROUND_CHECKS_%'
     or e.claim_key like 'WATCH_GA_SOS_LICENSING_BOARDS_%'
     or e.claim_key like 'WATCH_SC_LLR_PROFESSIONS_%')
 on conflict(evidence_id,target_requirement_code,jurisdiction) do update
 set updated_at=now(),rationale=excluded.rationale
 where dd_provider_requirement_research_candidates.candidate_status not in ('APPROVED_FOR_GOVERNANCE','REJECTED');
 get diagnostics n=row_count;
 return n;
end $$;
revoke all on function public.dd_reconcile_provider_requirement_research_candidates() from public,anon,authenticated;
grant execute on function public.dd_reconcile_provider_requirement_research_candidates() to service_role;

do $$
declare jid bigint;
begin
 select jobid into jid from cron.job where jobname='dani-provider-requirement-reconciliation-test';
 if jid is not null then perform cron.unschedule(jid); end if;
 perform cron.schedule(
   'dani-provider-requirement-reconciliation-test',
   '6,16,26,36,46,56 * * * *',
   'select public.dd_reconcile_provider_requirement_research_candidates();'
 );
end $$;