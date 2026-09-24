-- Promote audited passive intelligence architecture from DANI Owner Walkthrough Test.
-- Architecture only: NO tester rows, NO autonomous execution functions, NO authority changes.
-- Production remains the system of record.

create table if not exists public.dd_commercial_intelligence_nodes (
 id uuid primary key default gen_random_uuid(), node_type text not null, node_key text not null,
 node_name text not null, division text, channel_code text, canonical_sku text, customer_type text,
 status text not null default 'ACTIVE', metadata jsonb not null default '{}'::jsonb,
 updated_at timestamptz not null default now(), unique(node_type,node_key)
);
create table if not exists public.dd_commercial_intelligence_edges (
 id uuid primary key default gen_random_uuid(), from_type text not null, from_key text not null,
 to_type text not null, to_key text not null, relationship_type text not null,
 confidence text not null default 'UNVERIFIED', evidence_status text not null default 'NEEDS_RESEARCH',
 commercial_rule jsonb not null default '{}'::jsonb, source_authority text,
 owner_approval_required boolean not null default false, status text not null default 'ACTIVE',
 updated_at timestamptz not null default now(),
 unique(from_type,from_key,to_type,to_key,relationship_type)
);
create table if not exists public.dd_commercial_decision_cards (
 id uuid primary key default gen_random_uuid(), decision_key text not null unique,
 decision_type text not null, title text not null, summary text not null, priority text not null default 'P2',
 status text not null default 'PENDING_RESEARCH', affected_divisions text[] not null default '{}',
 affected_channels text[] not null default '{}', affected_skus text[] not null default '{}',
 recommendation text, evidence jsonb not null default '{}'::jsonb,
 approval_effect jsonb not null default '{}'::jsonb, created_at timestamptz not null default now(),
 updated_at timestamptz not null default now()
);
create table if not exists public.dd_research_evidence_registry (
 id uuid primary key default gen_random_uuid(), evidence_key text not null unique, target_domain text not null,
 target_table text, target_record_id text, target_field text, claim text not null, source_url text, source_name text,
 source_authority_class text not null default 'SECONDARY', jurisdiction text, retrieved_at timestamptz not null default now(),
 effective_at timestamptz, next_review_at timestamptz, confidence numeric(5,4), status text not null default 'CURRENT',
 supersedes_evidence_id uuid references public.dd_research_evidence_registry(id), raw_evidence jsonb not null default '{}'::jsonb,
 implementation_authority text not null default 'RESEARCH_ONLY', created_at timestamptz not null default now(),
 updated_at timestamptz not null default now()
);
create index if not exists dd_research_evidence_review_idx on public.dd_research_evidence_registry(status,next_review_at);
create table if not exists public.dd_research_evidence_conflicts (
 id uuid primary key default gen_random_uuid(), conflict_key text not null unique, target_domain text not null,
 target_record_id text, target_field text, evidence_a_id uuid references public.dd_research_evidence_registry(id),
 evidence_b_id uuid references public.dd_research_evidence_registry(id), conflict_type text not null,
 status text not null default 'OPEN', resolution_rule text, resolution_evidence jsonb not null default '{}'::jsonb,
 owner_approval_required boolean not null default false, created_at timestamptz not null default now(), resolved_at timestamptz
);
create table if not exists public.dd_support_signal_rollups (
 id uuid primary key default gen_random_uuid(), signal_date date not null default current_date, signal_type text not null,
 canonical_sku text, division text, category text, occurrence_count integer not null default 0, target_domain text not null,
 status text not null default 'OBSERVE', evidence jsonb not null default '{}'::jsonb,
 unique(signal_date,signal_type,canonical_sku,division,category)
);

alter table public.dd_commercial_intelligence_nodes enable row level security;
alter table public.dd_commercial_intelligence_edges enable row level security;
alter table public.dd_commercial_decision_cards enable row level security;
alter table public.dd_research_evidence_registry enable row level security;
alter table public.dd_research_evidence_conflicts enable row level security;
alter table public.dd_support_signal_rollups enable row level security;

comment on table public.dd_commercial_intelligence_nodes is 'Governed institutional-intelligence graph nodes. Architecture promoted from walkthrough test; production authority remains in canonical DANI systems.';
comment on table public.dd_commercial_intelligence_edges is 'Evidence-aware intelligence relationships. Edges do not authorize commercial changes.';
comment on table public.dd_commercial_decision_cards is 'Owner-review compression layer. Approval effects require separate governed execution; cards do not self-execute.';
comment on table public.dd_research_evidence_registry is 'Cross-domain evidence provenance registry. Default implementation authority is RESEARCH_ONLY.';
comment on table public.dd_research_evidence_conflicts is 'Conflicting evidence ledger; unresolved conflicts cannot silently become production authority.';
comment on table public.dd_support_signal_rollups is 'Aggregated operating/support signals for learning and review; observational by default.';

revoke all on public.dd_commercial_intelligence_nodes, public.dd_commercial_intelligence_edges,
 public.dd_commercial_decision_cards, public.dd_research_evidence_registry,
 public.dd_research_evidence_conflicts, public.dd_support_signal_rollups from anon, authenticated;
grant all on public.dd_commercial_intelligence_nodes, public.dd_commercial_intelligence_edges,
 public.dd_commercial_decision_cards, public.dd_research_evidence_registry,
 public.dd_research_evidence_conflicts, public.dd_support_signal_rollups to service_role;
