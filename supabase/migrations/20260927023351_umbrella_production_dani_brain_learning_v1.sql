
create table if not exists public.dd_brain_signals(
 id uuid primary key default gen_random_uuid(), signal_key text unique not null, origin text not null,
 entity_scope text not null default 'DANI_DECLARES' check(entity_scope='DANI_DECLARES'),
 signal_type text not null, statement text not null, confidence numeric not null default .5 check(confidence between 0 and 1),
 evidence jsonb not null default '{}'::jsonb, status text not null default 'NEW', research_required boolean not null default true,
 created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists public.dd_brain_hypotheses(
 id uuid primary key default gen_random_uuid(), hypothesis_key text unique not null, signal_key text,
 entity_scope text not null default 'DANI_DECLARES' check(entity_scope='DANI_DECLARES'), hypothesis text not null,
 expected_benefit jsonb not null default '{}'::jsonb, risks jsonb not null default '[]'::jsonb,
 status text not null default 'PROPOSED', research_pass_target int not null default 2 check(research_pass_target>=2),
 synthetic_test_required boolean not null default false, production_authority boolean not null default false check(production_authority=false),
 created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists public.dd_repeated_work_automation_candidates(
 candidate_key text primary key, entity_key text not null default 'DANI_DECLARES' check(entity_key='DANI_DECLARES'),
 work_signature text not null, work_class text not null, observed_count int not null default 1,
 first_observed_at timestamptz not null default now(), last_observed_at timestamptz not null default now(),
 deterministic boolean not null default false, internal_only boolean not null default true, proposed_worker_key text,
 proposed_trigger jsonb not null default '{}'::jsonb, authority_envelope jsonb not null default '{}'::jsonb,
 evidence_contract jsonb not null default '{}'::jsonb, status text not null default 'OBSERVING', metadata jsonb not null default '{}'::jsonb,
 unique(entity_key,work_signature)
);
alter table public.dd_brain_signals enable row level security;
alter table public.dd_brain_hypotheses enable row level security;
alter table public.dd_repeated_work_automation_candidates enable row level security;
revoke all on public.dd_brain_signals,public.dd_brain_hypotheses,public.dd_repeated_work_automation_candidates from anon,authenticated;
grant all on public.dd_brain_signals,public.dd_brain_hypotheses,public.dd_repeated_work_automation_candidates to service_role;

create or replace function public.dd_brain_ingest_signal(p_signal_key text,p_origin text,p_entity_scope text,p_signal_type text,p_statement text,p_evidence jsonb default '{}'::jsonb,p_confidence numeric default .5)
returns uuid language plpgsql security definer set search_path to 'public' as $$
declare v_id uuid;
begin
 if coalesce(p_entity_scope,'')<>'DANI_DECLARES' then raise exception 'PRODUCTION_BRAIN_DANI_SCOPE_ONLY'; end if;
 insert into dd_brain_signals(signal_key,origin,entity_scope,signal_type,statement,evidence,confidence)
 values(p_signal_key,p_origin,'DANI_DECLARES',p_signal_type,p_statement,coalesce(p_evidence,'{}'),greatest(0,least(1,p_confidence)))
 on conflict(signal_key) do update set statement=excluded.statement,evidence=excluded.evidence,confidence=excluded.confidence,updated_at=now()
 returning id into v_id; return v_id;
end $$;

create or replace function public.dd_brain_trickle_down()
returns jsonb language plpgsql security definer set search_path to 'public' as $$
declare v_h int:=0; v_w int:=0;
begin
 insert into dd_brain_hypotheses(hypothesis_key,signal_key,entity_scope,hypothesis,expected_benefit,risks)
 select 'HYP:'||s.signal_key,s.signal_key,'DANI_DECLARES',s.statement,
 jsonb_build_object('objective','DANI_DURABLE_BUSINESS','requires_measurement',true,'production_scope','DANI_DECLARES'),
 jsonb_build_array('unknown_demand','unknown_economics','unknown_governance','unknown_fulfillment')
 from dd_brain_signals s where s.status='NEW' and s.entity_scope='DANI_DECLARES'
 on conflict(hypothesis_key) do nothing;
 get diagnostics v_h=row_count;
 insert into dd_research_work_queue(program_key,work_key,question,required_evidence,priority,status,blocker,next_action,owner_decision_required,metadata)
 select 'CRAFT_PROJECT_CORPUS_2026_09_26','BRAIN:'||h.hypothesis_key,'Test DANI hypothesis: '||h.hypothesis,
 'Current evidence; economics where applicable; compliance/accounting evidence where applicable; fulfillment feasibility; conflicts; falsification criteria.',
 'P1','QUEUED','RESEARCH_REQUIRED','Research and reconcile evidence before any governed implementation.',false,
 jsonb_build_object('brain_hypothesis_key',h.hypothesis_key,'entity_scope','DANI_DECLARES','required_passes',h.research_pass_target,'production_brain',true,'implementation_requires_existing_authority',true)
 from dd_brain_hypotheses h where h.status='PROPOSED'
 on conflict(program_key,work_key) do update set question=excluded.question,required_evidence=excluded.required_evidence,metadata=excluded.metadata,updated_at=now();
 get diagnostics v_w=row_count;
 update dd_brain_signals set status='ROUTED',updated_at=now() where status='NEW' and entity_scope='DANI_DECLARES';
 update dd_brain_hypotheses set status='RESEARCHING',updated_at=now() where status='PROPOSED' and entity_scope='DANI_DECLARES';
 return jsonb_build_object('status','COMPLETED','entity','DANI_DECLARES','hypotheses_created',v_h,'research_items_routed',v_w,'production_authority_granted',false);
end $$;

create or replace function public.dd_observe_repeated_system_work(p_work_signature text,p_work_class text,p_deterministic boolean,p_internal_only boolean,p_metadata jsonb default '{}'::jsonb)
returns jsonb language plpgsql set search_path to 'public' as $$
declare v dd_repeated_work_automation_candidates%rowtype;
begin
 insert into dd_repeated_work_automation_candidates(candidate_key,entity_key,work_signature,work_class,deterministic,internal_only,metadata)
 values('AUTO:'||md5('DANI_DECLARES:'||p_work_signature),'DANI_DECLARES',p_work_signature,p_work_class,p_deterministic,p_internal_only,coalesce(p_metadata,'{}'))
 on conflict(entity_key,work_signature) do update set observed_count=dd_repeated_work_automation_candidates.observed_count+1,last_observed_at=now(),deterministic=excluded.deterministic,internal_only=excluded.internal_only,metadata=dd_repeated_work_automation_candidates.metadata||excluded.metadata returning * into v;
 if v.observed_count>=3 and v.deterministic and v.internal_only and v.status='OBSERVING' then
  update dd_repeated_work_automation_candidates set status='CANDIDATE',proposed_worker_key='AUTO_WORKER:'||upper(substr(md5(v.work_signature),1,12)),
  authority_envelope=jsonb_build_object('external_contact',false,'money_action',false,'permission_expansion',false,'self_approval',false),
  evidence_contract=jsonb_build_object('receipt_required',true,'failure_escalation',true,'idempotency_required',true)
  where candidate_key=v.candidate_key returning * into v;
 end if;
 return jsonb_build_object('candidate_key',v.candidate_key,'observed_count',v.observed_count,'status',v.status,'proposed_worker_key',v.proposed_worker_key);
end $$;

revoke execute on function public.dd_brain_ingest_signal(text,text,text,text,text,jsonb,numeric),public.dd_brain_trickle_down(),public.dd_observe_repeated_system_work(text,text,boolean,boolean,jsonb) from public,anon,authenticated;
grant execute on function public.dd_brain_ingest_signal(text,text,text,text,text,jsonb,numeric),public.dd_brain_trickle_down(),public.dd_observe_repeated_system_work(text,text,boolean,boolean,jsonb) to service_role;
select cron.schedule('dani-brain-trickle-down-production','17,47 * * * *',$$select public.dd_brain_trickle_down();$$)
where not exists(select 1 from cron.job where jobname='dani-brain-trickle-down-production');
