-- DANI Brain learning closure + runtime authority
-- Source: Tester migration applied and replayed successfully.
create table if not exists public.dd_brain_learning_ledger (
 id uuid primary key default gen_random_uuid(), lesson_key text not null unique,
 lesson_type text not null check (lesson_type in ('FACT','DECISION','HYPOTHESIS','EXPERIMENT','FAILURE','LESSON','RULE','AUTHORITY')),
 statement text not null, source_refs jsonb not null default '[]'::jsonb, authority_ref text,
 evidence_refs jsonb not null default '[]'::jsonb, enforcement_ref text, replay_ref text,
 status text not null default 'OPEN' check (status in ('OPEN','ENFORCED','PROVEN','SUPERSEDED','REJECTED')),
 severity text not null default 'NORMAL' check (severity in ('LOW','NORMAL','HIGH','CRITICAL')),
 recurrence_count integer not null default 0, first_observed_at timestamptz not null default now(),
 last_observed_at timestamptz not null default now(), last_replayed_at timestamptz,
 metadata jsonb not null default '{}'::jsonb, created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists public.dd_brain_learning_rules (
 rule_key text primary key, lesson_id uuid not null references public.dd_brain_learning_ledger(id) on delete cascade,
 rule_statement text not null, enforcement_kind text not null,
 enforcement_ref text not null, active boolean not null default true, replay_required boolean not null default true,
 last_verified_at timestamptz, verification_status text not null default 'UNPROVEN',
 metadata jsonb not null default '{}'::jsonb, created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists public.dd_brain_learning_replays (
 replay_key text primary key, lesson_id uuid not null references public.dd_brain_learning_ledger(id) on delete cascade,
 scenario text not null, expected_guard text not null, observed_result text,
 status text not null default 'PENDING', run_ref text, executed_at timestamptz,
 metadata jsonb not null default '{}'::jsonb, created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists public.dd_runtime_authority_registry (
 authority_key text primary key, system_name text not null, environment text not null,
 repository text, branch text, deployment_provider text, role text not null,
 status text not null default 'ACTIVE', is_canonical boolean not null default false,
 evidence_ref text, notes text, metadata jsonb not null default '{}'::jsonb,
 created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists public.dd_brain_learning_governance_runs (
 id uuid primary key default gen_random_uuid(), run_key text not null, closure jsonb not null,
 runtime_authority jsonb not null, status text not null, created_at timestamptz not null default now()
);
create index if not exists idx_brain_learning_status on public.dd_brain_learning_ledger(status,last_observed_at desc);
create index if not exists idx_brain_learning_rules_status on public.dd_brain_learning_rules(verification_status,active);
create index if not exists idx_brain_learning_replays_status on public.dd_brain_learning_replays(status,executed_at desc);
create index if not exists idx_runtime_authority_canonical on public.dd_runtime_authority_registry(is_canonical,status);
create or replace function public.dd_assert_runtime_authority_v1(p_environment text,p_repository text,p_deployment_provider text default null)
returns jsonb language plpgsql security definer set search_path=public as $$
declare v public.dd_runtime_authority_registry%rowtype;
begin
 select * into v from public.dd_runtime_authority_registry where environment in (p_environment,'SHARED') and is_canonical=true and status='ACTIVE'
 and (p_deployment_provider is null or deployment_provider=p_deployment_provider)
 order by case when environment=p_environment then 0 else 1 end limit 1;
 if v.authority_key is null then return jsonb_build_object('status','BLOCKED','reason','NO_CANONICAL_AUTHORITY_REGISTERED','environment',p_environment,'repository',p_repository); end if;
 if p_repository is distinct from v.repository then return jsonb_build_object('status','BLOCKED','reason','NON_CANONICAL_REPOSITORY','expected_repository',v.repository,'observed_repository',p_repository,'authority_key',v.authority_key); end if;
 return jsonb_build_object('status','PASS','authority_key',v.authority_key,'repository',v.repository,'environment',p_environment);
end $$;
create or replace function public.dd_run_brain_learning_governance_v1()
returns jsonb language plpgsql security definer set search_path=public as $$
declare c jsonb; a jsonb; v_status text;
begin
 c:=public.dd_learning_closure_audit_v1();
 a:=public.dd_assert_runtime_authority_v1('PRODUCTION','DaniDeclares/admiring-star-8zkzvl','Netlify');
 v_status:=case when a->>'status'='PASS' and coalesce((c->>'repeated_lessons')::int,0)=0 then 'PASS' when a->>'status'='PASS' then 'ATTENTION' else 'FAIL' end;
 insert into public.dd_brain_learning_governance_runs(run_key,closure,runtime_authority,status)
 values('LEARNING_GOVERNANCE:'||to_char(now(),'YYYYMMDDHH24MISSMS'),c,a,v_status);
 return jsonb_build_object('status',v_status,'closure',c,'runtime_authority',a);
end $$;
do $$ begin if not exists(select 1 from cron.job where jobname='dani-brain-learning-governance') then perform cron.schedule('dani-brain-learning-governance','*/30 * * * *','select public.dd_run_brain_learning_governance_v1();'); end if; end $$;