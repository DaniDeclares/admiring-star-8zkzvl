-- Expand DANI research into a durable memory + opportunity fabric.
-- Historical owner material is candidate intelligence, never discarded solely for age and never current authority solely because the owner wrote it.
-- No autonomous activation, pricing publication, provider authorization, external contact, spend, deployment, or merge authority.

create table if not exists public.dd_research_memory_candidates(
 id uuid primary key default gen_random_uuid(),
 candidate_key text not null unique,
 source_system text not null,
 source_reference text not null,
 source_date timestamptz,
 source_authority text not null default 'HISTORICAL_EVIDENCE',
 origin_class text not null default 'OWNER_ORIGINATED_OPPORTUNITY',
 candidate_type text not null,
 title text not null,
 summary text,
 raw_claims jsonb not null default '[]'::jsonb,
 buyer_segments text[] not null default '{}',
 channel_scope text[] not null default '{}',
 related_service_keys text[] not null default '{}',
 related_product_keys text[] not null default '{}',
 research_program_keys text[] not null default '{}',
 relevance_status text not null default 'REVALIDATE',
 freshness_status text not null default 'UNKNOWN',
 economics_status text not null default 'UNPROVEN',
 demand_status text not null default 'UNPROVEN',
 capability_status text not null default 'UNPROVEN',
 compliance_status text not null default 'UNPROVEN',
 fulfillment_status text not null default 'UNPROVEN',
 tester_status text not null default 'NOT_TESTED',
 approval_status text not null default 'NOT_READY',
 evidence_payload jsonb not null default '{}'::jsonb,
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now()
);
alter table public.dd_research_memory_candidates enable row level security;
revoke all on public.dd_research_memory_candidates from public,anon,authenticated;
grant select,insert,update on public.dd_research_memory_candidates to service_role;

create table if not exists public.dd_research_cross_signal_queue(
 id uuid primary key default gen_random_uuid(),
 signal_key text not null unique,
 candidate_key text,
 source_system text not null,
 signal_type text not null,
 signal_payload jsonb not null default '{}'::jsonb,
 matched_programs text[] not null default '{}',
 matched_services text[] not null default '{}',
 matched_products text[] not null default '{}',
 status text not null default 'QUEUED',
 requires_fresh_research boolean not null default true,
 requires_tester_proof boolean not null default true,
 owner_approval_required boolean not null default false,
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now()
);
alter table public.dd_research_cross_signal_queue enable row level security;
revoke all on public.dd_research_cross_signal_queue from public,anon,authenticated;
grant select,insert,update on public.dd_research_cross_signal_queue to service_role;

insert into public.dd_research_programs(program_key,program_name,domain,objective,release_blocked,status,green_rule,metadata)
values
('MERCH_PRODUCT_INTELLIGENCE','Merchandise & Product Intelligence','MERCH_COMMERCE',
 'Continuously identify and validate products DANI can sell to customers, property/real-estate/business buyers, and providers; evaluate demand, use case, production method, sourcing, unit economics, fulfillment, safety/compliance, inventory risk, personalization, bundles, and cross-sell fit.',
 true,'RESEARCHING','Current demand + unit economics + fulfillment/capability + compliance/safety evidence are corroborated; tester acceptance criteria pass; protected activation/pricing remains owner-gated.',jsonb_build_object('first_class',true,'audiences',array['CUSTOMER','B2B_BUYER','PROVIDER'],'approval_gate','PRODUCT_ACTIVATION')),
('PORTAL_UX_INTELLIGENCE','Portal, Dashboard & App UX Intelligence','DIGITAL_EXPERIENCE_INTELLIGENCE',
 'Continuously study owner dashboards, provider/technician apps, customer portals, sales/dispatch/QA/accounting workflows, permissions, navigation, actionable home screens, evidence capture, alerts, self-service, accessibility, mobile/offline patterns, and role-specific information architecture.',
 true,'RESEARCHING','At least two evidence-backed workflow patterns are reconciled with DANI operational evidence; accessibility/permission impacts are assessed; tester workflow proof passes before production UX change.',jsonb_build_object('first_class',true,'surfaces',array['OWNER_HQ','PROVIDER_APP','CUSTOMER_PORTAL','SALES','DISPATCH','QA','ACCOUNTING'],'approval_gate','PRODUCTION_UX_CHANGE')),
('OWNER_RESEARCH_MEMORY','Owner Research Memory & Opportunity Revalidation','RECORDS_KNOWLEDGE_INTELLIGENCE',
 'Recover ideas, business plans, equipment research, product concepts, service concepts, prior market research, old proposals and operational hypotheses from authorized Gmail and Drive; preserve provenance, revalidate current relevance and profitability, and route viable opportunities through fresh research, tester proof and governed approval.',
 true,'RESEARCHING','Historical provenance is preserved; material claims are freshly corroborated or explicitly rejected/superseded; duplicates/current service-product-provider links are reconciled; viable candidates pass tester proof before approval.',jsonb_build_object('first_class',true,'historical_not_discarded',true,'historical_not_current_authority',true,'approval_gate','OPPORTUNITY_ACTIVATION'))
on conflict(program_key) do update set program_name=excluded.program_name,domain=excluded.domain,objective=excluded.objective,release_blocked=true,status='RESEARCHING',green_rule=excluded.green_rule,metadata=coalesce(public.dd_research_programs.metadata,'{}'::jsonb)||excluded.metadata,updated_at=now();

insert into public.dd_intelligence_miners(miner_key,miner_family,miner_name,purpose,output_class,default_route,authority_boundary,status)
values
('OWNER_RESEARCH_MEMORY_MINER','RESEARCH_MEMORY','Owner Research Memory Miner','Extract owner-originated ideas, products, services, equipment, buyer hypotheses and operating concepts from authorized historical Gmail/Drive without treating age as irrelevance or owner authorship as current authority.',array['OPPORTUNITY_CANDIDATE','HISTORICAL_CLAIM','CROSS_SIGNAL'],array['RESEARCH','SERVICE_DISCOVERY','MERCH_COMMERCE','DIGITAL_EXPERIENCE_INTELLIGENCE'],jsonb_build_object('mode','OBSERVATION_ONLY','preserve_provenance',true,'fresh_corroboration_required',true,'tester_proof_required',true,'external_contact',false,'money_action',false,'activation',false),'ACTIVE'),
('MERCH_OPPORTUNITY_MINER','MERCH_COMMERCE','Merch Opportunity Miner','Identify customer-facing, B2B and provider-facing merchandise/product opportunities and required demand, economics, production, sourcing, safety and fulfillment research.',array['PRODUCT_CANDIDATE','BUNDLE_CANDIDATE','ECONOMICS_QUESTION'],array['MERCH_COMMERCE','RESEARCH'],jsonb_build_object('mode','RESEARCH_ONLY','publish_product',false,'publish_price',false,'buy_equipment_inventory',false,'external_contact',false),'ACTIVE'),
('PORTAL_UX_PATTERN_MINER','DIGITAL_EXPERIENCE','Portal UX Pattern Miner','Extract evidence-backed reusable patterns for owner dashboards, provider apps and customer portals from authoritative product documentation, user workflow evidence and DANI operational friction.',array['UX_PATTERN','WORKFLOW_GAP','TEST_HYPOTHESIS'],array['DIGITAL_EXPERIENCE_INTELLIGENCE','SOFTWARE'],jsonb_build_object('mode','RESEARCH_TEST_ONLY','deploy_production',false,'weaken_permissions',false),'ACTIVE'),
('GITHUB_ECOSYSTEM_MINER','TECHNOLOGY','GitHub Ecosystem Intelligence Miner','Track relevant repositories, releases, security advisories, agent-memory/orchestration patterns, dependencies and reusable open-source techniques; compare them to DANI architecture before proposing tests.',array['TECH_PATTERN','SECURITY_SIGNAL','DEPENDENCY_SIGNAL','TEST_HYPOTHESIS'],array['VENDOR_TECH_INTELLIGENCE','AI_DATA_GOVERNANCE_INTELLIGENCE','SOFTWARE'],jsonb_build_object('mode','OBSERVATION_ONLY','copy_code_automatically',false,'install_dependency',false,'merge',false,'deploy',false),'ACTIVE')
on conflict(miner_key) do update set miner_family=excluded.miner_family,miner_name=excluded.miner_name,purpose=excluded.purpose,output_class=excluded.output_class,default_route=excluded.default_route,authority_boundary=excluded.authority_boundary,status='ACTIVE',updated_at=now();

create or replace function public.dd_queue_cross_signal_research()
returns jsonb
language plpgsql
set search_path=''
as $$
declare v_candidates int:=0; v_cross int:=0; v_work int:=0;
begin
 insert into public.dd_research_memory_candidates(candidate_key,source_system,source_reference,source_date,candidate_type,title,summary,raw_claims,buyer_segments,channel_scope,research_program_keys,evidence_payload)
 select 'DRIVE_MEMORY:'||d.drive_file_id||':'||coalesce(coalesce(d.metadata->>'version','0'),'0'),'GOOGLE_DRIVE',d.drive_file_id,d.modified_at,
   case when lower(coalesce(d.file_name,'')) ~ '(merch|xtool|print|apparel|nfc|gift|kit|sign)' then 'PRODUCT_OR_EQUIPMENT_IDEA'
        when lower(coalesce(d.file_name,'')) ~ '(business plan|overview|strategy|research)' then 'BUSINESS_RESEARCH'
        else 'OWNER_RESEARCH_ARTIFACT' end,
   d.file_name,coalesce(d.metadata->>'extracted_summary','Historical Drive research artifact requiring current revalidation.'),
   jsonb_build_array(jsonb_build_object('classification',d.classification,'authority_status',d.authority_status)),
   '{}','{}',
   case when lower(coalesce(d.file_name,'')) ~ '(merch|xtool|print|apparel|nfc|gift|kit|sign)' then array['OWNER_RESEARCH_MEMORY','MERCH_PRODUCT_INTELLIGENCE']
        else array['OWNER_RESEARCH_MEMORY'] end,
   jsonb_build_object('drive_intake_id',d.id,'mime_type',d.mime_type,'classification',d.classification,'authority_status',d.authority_status)
 from public.dd_drive_research_intake d
 where d.authority_status in ('EVIDENCE_ONLY','CANDIDATE','VERIFIED_CURRENT','SUPERSEDED')
 on conflict(candidate_key) do update set summary=excluded.summary,evidence_payload=excluded.evidence_payload,updated_at=now();
 get diagnostics v_candidates=row_count;

 insert into public.dd_research_cross_signal_queue(signal_key,candidate_key,source_system,signal_type,signal_payload,matched_programs,status)
 select 'MEMORY_REVALIDATE:'||c.candidate_key,c.candidate_key,c.source_system,'OWNER_RESEARCH_REVALIDATION',
   jsonb_build_object('title',c.title,'candidate_type',c.candidate_type,'buyer_segments',c.buyer_segments,'source_date',c.source_date,
     'research_questions',jsonb_build_array('Is this still relevant?','Is there current buyer demand?','Can DANI fulfill it now?','What are current unit economics and cash requirements?','What compliance/safety/licensing constraints apply?','Does it duplicate an existing service/product?','What tester proof is required?')),
   c.research_program_keys,'QUEUED'
 from public.dd_research_memory_candidates c where c.relevance_status='REVALIDATE'
 on conflict(signal_key) do update set signal_payload=excluded.signal_payload,matched_programs=excluded.matched_programs,updated_at=now();
 get diagnostics v_cross=row_count;

 insert into public.dd_research_work_queue(program_key,work_key,question,required_evidence,priority,status,next_action,owner_decision_required,metadata)
 select p.program_key,
   'cross-signal-'||lower(regexp_replace(q.signal_key,'[^a-zA-Z0-9]+','-','g'))||'-'||lower(p.program_key),
   'Revalidate owner-originated opportunity: '||coalesce(q.signal_payload->>'title',q.candidate_key),
   'Current external demand evidence + DANI historical provenance + duplicate/service/product reconciliation + economics/capability/compliance/fulfillment checks + tester acceptance criteria.',
   'P1','QUEUED','Run fresh corroboration and tester proof; do not activate automatically.',false,
   jsonb_build_object('cross_signal_id',q.id,'candidate_key',q.candidate_key,'implementation_action_class','REVERIFY',
     'approval_gate','OWNER_APPROVAL_AFTER_TESTER_PROOF','historical_not_discarded',true,'historical_not_current_authority',true)
 from public.dd_research_cross_signal_queue q
 cross join lateral unnest(case when cardinality(q.matched_programs)>0 then q.matched_programs else array['OWNER_RESEARCH_MEMORY'] end) p(program_key)
 where q.status='QUEUED'
 on conflict(work_key) do nothing;
 get diagnostics v_work=row_count;

 return jsonb_build_object('status','COMPLETED','memory_candidates_upserted',v_candidates,'cross_signals_upserted',v_cross,'research_work_created',v_work,
  'historical_discarded',false,'auto_activate',false,'auto_price',false,'external_contact',false,'money_action',false);
end $$;
revoke execute on function public.dd_queue_cross_signal_research() from public,anon,authenticated;
grant execute on function public.dd_queue_cross_signal_research() to service_role;


create or replace function public.dd_queue_learning_evidence_cross_signals()
returns jsonb
language plpgsql
set search_path=''
as $$
declare v_candidates int:=0; v_signals int:=0; v_work int:=0;
begin
 insert into public.dd_research_memory_candidates(candidate_key,source_system,source_reference,source_date,candidate_type,title,summary,raw_claims,research_program_keys,evidence_payload)
 select 'LEARNING_MEMORY:'||e.evidence_key,e.source_system,e.source_reference,e.created_at,
   case when e.source_system='GMAIL' then 'EMAIL_INTELLIGENCE'
        when e.domain ilike '%SOFTWARE%' or e.domain ilike '%INTEGRATION%' then 'PLATFORM_INTELLIGENCE'
        when e.domain ilike '%MARKETING%' then 'MARKET_IDEA'
        else 'OWNER_OR_OPERATIONAL_EVIDENCE' end,
   left(coalesce(e.observation,e.evidence_key),240),e.observation,
   jsonb_build_array(jsonb_build_object('authority_class',e.authority_class,'domain',e.domain)),
   case
    when e.source_system='GMAIL' and (lower(coalesce(e.observation,'')) ~ '(merch|xtool|print|apparel|nfc|gift|kit|sign|sublimation|engraving)') then array['OWNER_RESEARCH_MEMORY','MERCH_PRODUCT_INTELLIGENCE']
    when e.domain ilike '%SOFTWARE%' or e.domain ilike '%INTEGRATION%' then array['OWNER_RESEARCH_MEMORY','VENDOR_TECH_INTELLIGENCE','PORTAL_UX_INTELLIGENCE']
    else array['OWNER_RESEARCH_MEMORY'] end,
   jsonb_build_object('learning_evidence_id',e.id,'domain',e.domain,'authority_class',e.authority_class,'payload',e.evidence_payload)
 from public.dd_learning_evidence_intake e
 where e.status in ('NEW','QUEUED','EVIDENCED')
   and e.source_system in ('GMAIL','OWNER_SCREENSHOT','GOOGLE_DRIVE','GITHUB')
 on conflict(candidate_key) do update set summary=excluded.summary,evidence_payload=excluded.evidence_payload,updated_at=now();
 get diagnostics v_candidates=row_count;

 insert into public.dd_research_cross_signal_queue(signal_key,candidate_key,source_system,signal_type,signal_payload,matched_programs,status)
 select 'LEARNING_REVALIDATE:'||c.candidate_key,c.candidate_key,c.source_system,'LEARNING_EVIDENCE_REVALIDATION',
   jsonb_build_object('title',c.title,'candidate_type',c.candidate_type,'source_date',c.source_date,
     'research_questions',jsonb_build_array('What current DANI service/product/provider/lead/workflow does this relate to?','Is this already represented in the canonical catalog or backlog?','What fresh external evidence confirms or contradicts it?','What economics/capability/compliance/fulfillment implications exist?','What tester proof and approval gate apply?')),
   c.research_program_keys,'QUEUED'
 from public.dd_research_memory_candidates c
 where c.candidate_key like 'LEARNING_MEMORY:%' and c.relevance_status='REVALIDATE'
 on conflict(signal_key) do update set signal_payload=excluded.signal_payload,matched_programs=excluded.matched_programs,updated_at=now();
 get diagnostics v_signals=row_count;

 insert into public.dd_research_work_queue(program_key,work_key,question,required_evidence,priority,status,next_action,owner_decision_required,metadata)
 select p.program_key,'learning-signal-'||substr(md5(q.signal_key||':'||p.program_key),1,24),
   'Cross-check internal intelligence against DANI and fresh research: '||coalesce(q.signal_payload->>'title',q.candidate_key),
   'Internal provenance + canonical service/product/provider/lead reconciliation + current authoritative external evidence + economics/capability/compliance/fulfillment implications + tester acceptance criteria.',
   'P1','QUEUED','Research, reconcile and test; do not activate automatically.',false,
   jsonb_build_object('cross_signal_id',q.id,'candidate_key',q.candidate_key,'implementation_action_class','REVERIFY','approval_gate','GOVERNED_AFTER_TESTER_PROOF')
 from public.dd_research_cross_signal_queue q
 cross join lateral unnest(case when cardinality(q.matched_programs)>0 then q.matched_programs else array['OWNER_RESEARCH_MEMORY'] end) p(program_key)
 where q.signal_type='LEARNING_EVIDENCE_REVALIDATION' and q.status='QUEUED'
 on conflict(work_key) do nothing;
 get diagnostics v_work=row_count;

 return jsonb_build_object('status','COMPLETED','candidates_upserted',v_candidates,'signals_upserted',v_signals,'work_created',v_work,'auto_activate',false,'money_action',false,'external_contact',false);
end $$;
revoke execute on function public.dd_queue_learning_evidence_cross_signals() from public,anon,authenticated;
grant execute on function public.dd_queue_learning_evidence_cross_signals() to service_role;

insert into public.dd_intelligence_sources(source_key,source_name,source_family,access_mode,public_source,terms_review_required,robots_respect_required,pii_minimization_required,allowed_collection_scope,default_miner_keys,status,terms_gate_status,rate_limit_per_hour,provenance_required,collector_execution_allowed,metadata)
values('GITHUB_PUBLIC_ECOSYSTEM','GitHub Public Ecosystem','TECHNOLOGY','PUBLIC_API',true,true,true,true,
 jsonb_build_object('scope','public repository metadata, releases, advisories and documentation relevant to DANI architecture; no private repositories unless separately authorized'),
 array['GITHUB_ECOSYSTEM_MINER','PLATFORM_CHANGE_MINER','SECURITY_THREAT_MINER'],'ACTIVE','PENDING',20,true,false,
 jsonb_build_object('reason','Source registered now; automated collector remains fail-closed until API terms/auth/rate-limit execution proof is recorded.'))
on conflict(source_key) do update set allowed_collection_scope=excluded.allowed_collection_scope,default_miner_keys=excluded.default_miner_keys,status='ACTIVE',metadata=excluded.metadata,updated_at=now();

insert into public.dd_intelligence_collection_queue(collection_key,source_key,collector_kind,query_profile,requested_miner_keys,priority,status,external_contact_allowed,money_action_allowed,production_mutation_allowed,terms_gate_required,next_run_at,metadata)
values('GITHUB_ECOSYSTEM_CONTINUOUS','GITHUB_PUBLIC_ECOSYSTEM','PUBLIC_API',
 jsonb_build_object('scope','relevant repositories/releases/security advisories/agent-memory-orchestration/dependency patterns','repository_authority','DaniDeclares/admiring-star-8zkzvl','discovery_terms',array['agent memory','agent orchestration','field service software','dashboard portal UX','Supabase security','React accessibility'],'public_only',true),
 array['GITHUB_ECOSYSTEM_MINER','PLATFORM_CHANGE_MINER','SECURITY_THREAT_MINER'],'P1','BLOCKED',false,false,false,true,now(),
 jsonb_build_object('observation_only',true,'copy_code_automatically',false,'install_dependency',false,'requires_architecture_comparison',true,'blocker','TERMS_AND_EXECUTION_PROOF_REQUIRED'))
on conflict(collection_key) do update set query_profile=excluded.query_profile,requested_miner_keys=excluded.requested_miner_keys,status='BLOCKED',terms_gate_required=true,blocker='TERMS_AND_EXECUTION_PROOF_REQUIRED',next_run_at=now(),metadata=excluded.metadata,updated_at=now();

select cron.unschedule(jobid) from cron.job where jobname='dd-research-cross-signal-memory';
select cron.schedule('dd-research-cross-signal-memory','9,24,39,54 * * * *',
  'select public.dd_queue_cross_signal_research(); select public.dd_queue_learning_evidence_cross_signals();');
