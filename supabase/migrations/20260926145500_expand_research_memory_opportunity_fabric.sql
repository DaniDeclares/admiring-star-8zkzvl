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

insert into public.dd_intelligence_miners(miner_key,name,purpose,inputs,outputs,routes,authority_boundary,status)
values
('OWNER_RESEARCH_MEMORY_MINER','Owner Research Memory Miner',
 'Extract owner-originated ideas, products, services, equipment, buyer hypotheses and operating concepts from authorized historical Gmail/Drive without treating age as irrelevance or owner authorship as current authority.',
 array['GMAIL','GOOGLE_DRIVE','ATTACHMENTS'],array['OPPORTUNITY_CANDIDATE','HISTORICAL_CLAIM','CROSS_SIGNAL'],array['RESEARCH','SERVICE_DISCOVERY','MERCH_COMMERCE','DIGITAL_EXPERIENCE_INTELLIGENCE'],
 'Observation/evidence only. Preserve provenance. Fresh corroboration and tester proof required before activation.', 'ACTIVE'),
('MERCH_OPPORTUNITY_MINER','Merch Opportunity Miner',
 'Identify customer-facing, B2B and provider-facing merchandise/product opportunities and required demand, economics, production, sourcing, safety and fulfillment research.',
 array['GMAIL','GOOGLE_DRIVE','WEB_RESEARCH','CUSTOMER_SIGNAL','PROVIDER_SIGNAL'],array['PRODUCT_CANDIDATE','BUNDLE_CANDIDATE','ECONOMICS_QUESTION'],array['MERCH_COMMERCE','RESEARCH'],
 'Research only; cannot publish products/prices, buy equipment/inventory, or contact suppliers/customers.', 'ACTIVE'),
('PORTAL_UX_PATTERN_MINER','Portal UX Pattern Miner',
 'Extract evidence-backed reusable patterns for owner dashboards, provider apps and customer portals from authoritative product documentation, user workflow evidence and DANI operational friction.',
 array['WEB_RESEARCH','GITHUB','POSTHOG','SUPPORT_SIGNAL','GMAIL'],array['UX_PATTERN','WORKFLOW_GAP','TEST_HYPOTHESIS'],array['DIGITAL_EXPERIENCE_INTELLIGENCE','SOFTWARE'],
 'Research/test only; cannot deploy production UX or weaken permissions.', 'ACTIVE')
on conflict(miner_key) do update set program_name=excluded.program_name,purpose=excluded.purpose,inputs=excluded.inputs,outputs=excluded.outputs,routes=excluded.routes,authority_boundary=excluded.authority_boundary,status='ACTIVE',updated_at=now();

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
