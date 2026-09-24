
create table if not exists public.dd_acquisition_spend_recommendations(
 id uuid primary key default gen_random_uuid(),
 source_system text not null,
 source_service text not null,
 recommendation_type text not null check (recommendation_type in ('INCREASE','DECREASE','PAUSE','HOLD','REACTIVATE')),
 current_weekly_budget numeric,
 recommended_weekly_budget numeric,
 evidence jsonb not null default '{}'::jsonb,
 rationale text,
 status text not null default 'PROPOSED' check (status in ('PROPOSED','APPROVED','REJECTED','APPLIED','EXPIRED')),
 requires_owner_approval boolean not null default true,
 approved_at timestamptz,
 applied_at timestamptz,
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now()
);
alter table public.dd_acquisition_spend_recommendations enable row level security;
comment on table public.dd_acquisition_spend_recommendations is 'Governed acquisition-spend recommendations. Increasing spend always requires owner approval; recommendations are not authorization to mutate an external platform.';
