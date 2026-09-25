create table if not exists public.dd_research_intelligence_signals (
 id uuid primary key default gen_random_uuid(),
 signal_key text not null unique,
 source_kind text not null check (source_kind in ('COMPETITOR_EVIDENCE','LEAD_SIGNAL','DANI_HISTORICAL_EVIDENCE','CURRENT_AUTHORITY_CANDIDATE','RESEARCH_HYPOTHESIS','WORKFLOW_EVIDENCE','EXPERIMENT_HYPOTHESIS')),
 subject text not null,
 observed_claim text,
 authority_status text not null default 'EVIDENCE_ONLY' check (authority_status in ('EVIDENCE_ONLY','AUTHORITY_CANDIDATE','VERIFIED_CURRENT_AUTHORITY','REJECTED_AS_AUTHORITY')),
 evidence_locator jsonb not null default '{}'::jsonb,
 capability_tags text[] not null default '{}'::text[],
 requires_independent_verification boolean not null default true,
 commercial_unlock_allowed boolean not null default false,
 pricing_authority_allowed boolean not null default false,
 contact_authority_allowed boolean not null default false,
 implementation_authority_allowed boolean not null default false,
 metadata jsonb not null default '{}'::jsonb,
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now(),
 check (authority_status <> 'VERIFIED_CURRENT_AUTHORITY' or requires_independent_verification=false)
);
create index if not exists dd_research_intelligence_signals_kind_idx on public.dd_research_intelligence_signals(source_kind,authority_status);
alter table public.dd_research_intelligence_signals enable row level security;
revoke all on public.dd_research_intelligence_signals from anon,authenticated;
grant all on public.dd_research_intelligence_signals to service_role;

create table if not exists public.dd_capability_gap_assessments (
 id uuid primary key default gen_random_uuid(),
 capability_key text not null unique,
 capability_name text not null,
 research_work_key text,
 dani_state text not null default 'UNASSESSED' check (dani_state in ('UNASSESSED','PROVEN','PARTIAL','MISSING','NOT_NEEDED')),
 evidence_summary text,
 free_open_source_alternatives jsonb not null default '[]'::jsonb,
 economics_status text not null default 'UNASSESSED',
 risk_status text not null default 'UNASSESSED',
 build_queue_status text not null default 'NOT_QUEUED' check (build_queue_status in ('NOT_QUEUED','JUSTIFIED','QUEUED','IMPLEMENTED','REJECTED')),
 owner_gate_required boolean not null default false,
 metadata jsonb not null default '{}'::jsonb,
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now()
);
alter table public.dd_capability_gap_assessments enable row level security;
revoke all on public.dd_capability_gap_assessments from anon,authenticated;
grant all on public.dd_capability_gap_assessments to service_role;

insert into public.dd_research_work_queue(program_key,work_key,question,required_evidence,priority,status,next_action,owner_decision_required,metadata) values
('OPERATING_MODEL_INTELLIGENCE','agent-regression-evaluation-engineering','How should DANI score and regression-test autonomous agents across sales drafts, email mining, quote logic, research conclusions, provider routing, accounting classification and governed actions?','Primary technical documentation plus reproducible DANI test cases, baselines, pass thresholds, version lineage and regression evidence.','P0','QUEUED','Compare current DANI proof registry with evaluation harness patterns; propose additive scored fixtures and release gates.',false,'{"seed_class":"research_hypothesis","vendor_purchase_authority":false}'::jsonb),
('OPERATING_MODEL_INTELLIGENCE','ai-reliability-sre-control-plane','What observability, SLO, rollback, canary, tracing, prompt/model versioning and incident-response controls does DANI actually need for autonomous agents at current scale?','Primary reliability/observability sources and direct comparison to current DANI runtime/control plane.','P0','QUEUED','Classify each capability PROVEN/PARTIAL/MISSING/NOT_NEEDED and queue only justified gaps.',false,'{"seed_class":"research_hypothesis"}'::jsonb),
('OPERATING_MODEL_INTELLIGENCE','security-threat-modeling','Build and maintain DANI threat models covering assets, identities, trust boundaries, attack paths, blast radius, detection and recovery.','Primary security guidance plus verified DANI schema, auth, RLS, RPC, secret, integration and deployment evidence.','P0','QUEUED','Map threat boundaries and connect findings to the existing security/audit queue.',false,'{"seed_class":"research_hypothesis"}'::jsonb),
('OPERATING_MODEL_INTELLIGENCE','process-orchestration-benchmark','Does DANI orchestration cover useful cross-system process capabilities without unnecessary software?','Primary platform capability evidence plus direct DANI runtime comparison and total-cost/complexity analysis.','P0','QUEUED','Compare existing control plane/outboxes/work queues against demonstrated capabilities; build only proven gaps.',false,'{"seed_class":"competitive_capability_seed","vendor_purchase_authority":false}'::jsonb),
('OPERATING_MODEL_INTELLIGENCE','field-service-crm-capability-benchmark','Benchmark DANI end-to-end customer and field-service capability against communication-first CRM and field-service platforms.','Primary competitor docs plus direct DANI proof for booking, CRM, estimates, proposals, payments, scheduling, dispatch, field evidence, QA, reviews, recurring plans, communications, accounting and automation.','P0','QUEUED','Produce PROVEN/PARTIAL/MISSING/NOT_NEEDED matrix and route justified gaps to governed build queue.',false,'{"seed_class":"competitive_capability_seed","copy_competitor_prices":false}'::jsonb),
('OPERATING_MODEL_INTELLIGENCE','visual-property-lead-discovery','How should lawful observable rental/property signals become evidence-backed CH03/CH04 leads without contaminating research or authority data?','Public property/agent/business contact evidence, lawful-source rules, dedupe/identity confidence, channel fit and outreach eligibility.','P0','QUEUED','Design observed signal -> public identity/contact -> CH03/CH04 classification -> relevant offer -> outreach queue with evidence lineage.',false,'{"seed_class":"lead_signal","automatic_outreach":false}'::jsonb),
('OPERATING_MODEL_INTELLIGENCE','historical-dani-offer-evolution','What reusable product/service insights exist in historical DANI flyers while preventing legacy price, contact, discount, QR and service claims from becoming current authority?','Historical artifact lineage plus comparison against current catalog/contact/pricing authority.','P0','QUEUED','Classify each artifact as historical evidence and extract concepts separately from authority-bearing fields.',false,'{"seed_class":"historical_dani_evidence","authority":false}'::jsonb),
('OPERATING_MODEL_INTELLIGENCE','systems-architecture-scaling-defense','Which system-design, API-contract, data-architecture, event, caching, CI/CD and distributed-system patterns are justified for DANI now versus later?','Primary engineering sources, measured DANI scale/failure modes, and complexity-cost comparison.','P1','QUEUED','Classify patterns as NOW/LATER/NOT_NEEDED.',false,'{"seed_class":"research_hypothesis","avoid_premature_complexity":true}'::jsonb),
('OPERATING_MODEL_INTELLIGENCE','property-access-directory-technology','What apartment visitor/resident directory, QR/NFC access, gate/visitor management, property signage and resident-portal capabilities fit CH03?','Vendor/industry primary sources, integration requirements, licensing/security/privacy constraints, economics and CH03 fit.','P1','QUEUED','Treat vendor examples only as discovery seeds.',false,'{"seed_class":"research_hypothesis","commercial_unlock":false}'::jsonb),
('OPERATING_MODEL_INTELLIGENCE','marketing-experiment-hypotheses','Which observed social/content funnel tactics improve DANI conversion, and under what measurable conditions?','Independent/current platform evidence plus DANI experiments with baseline, hypothesis, metric, threshold and stop rule.','P1','QUEUED','Treat screenshot claims as hypotheses rather than facts.',false,'{"seed_class":"experiment_hypothesis"}'::jsonb),
('OPERATING_MODEL_INTELLIGENCE','provider-recruiting-funnel-benchmark','What provider recruiting/onboarding nurture patterns reduce friction while preserving authorization and classification controls?','Observed funnel evidence, legal/classification constraints and DANI funnel quality evidence.','P1','QUEUED','Compare acknowledgement, education, qualification, selection and scheduling patterns.',false,'{"seed_class":"workflow_evidence"}'::jsonb),
('OPERATING_MODEL_INTELLIGENCE','bootstrapped-operating-model-benchmark','How can DANI minimize manual entry and disconnected software while maintaining a lean communication-centered operating model?','Primary operating evidence plus DANI software cost, integration burden and workflow proof.','P1','QUEUED','Use lean-company examples as research seeds, not purchase recommendations.',false,'{"seed_class":"operating_model_hypothesis"}'::jsonb),
('OPERATING_MODEL_INTELLIGENCE','vertical-business-system-product-line','Is a verticalized DANI business-operations system commercially viable for service businesses?','Current market evidence, competitor comparison, unit economics, fulfillment burden, IP/legal/compliance, support burden and DANI capability proof.','P1','QUEUED','Compare historical Cleaning Operations System concept against current market and DANI infrastructure before commercial unlock.',false,'{"seed_class":"historical_product_hypothesis","commercial_unlock":false}'::jsonb),
('OPERATING_MODEL_INTELLIGENCE','event-package-competitive-economics','What can DANI learn from packaged event-rental structures, add-ons and booking incentives without copying competitor pricing?','Current local market samples, included scope, delivery/setup economics, utilization, labor, inventory/capital requirements and DANI margin model.','P1','QUEUED','Use observed prices only as dated competitor evidence.',false,'{"seed_class":"competitor_evidence","copy_price_authority":false}'::jsonb),
('OPERATING_MODEL_INTELLIGENCE','presale-membership-economics','Where can presale, membership, recurring-plan or advance-booking economics responsibly improve DANI cash flow without creating fulfillment liabilities?','Current market/legal/payment evidence, breakage/refund/capacity risks, unit economics and cash-flow modeling.','P1','QUEUED','Model options with capacity and liability gates before any commercial unlock.',false,'{"seed_class":"research_hypothesis","commercial_unlock":false}'::jsonb),
('OPERATING_MODEL_INTELLIGENCE','free-technical-competency-curriculum','What free technical learning path best supports owner understanding of DANI machinery?','Current free primary learning sources mapped to DANI tasks.','P2','QUEUED','Build competency map from verified free sources.',false,'{"seed_class":"research_hypothesis","paid_course_default":false}'::jsonb)
on conflict(program_key,work_key) do update set question=excluded.question,required_evidence=excluded.required_evidence,priority=excluded.priority,next_action=excluded.next_action,metadata=public.dd_research_work_queue.metadata||excluded.metadata,updated_at=now();
