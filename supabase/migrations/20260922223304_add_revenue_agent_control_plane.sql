
create table if not exists public.dd_revenue_agent_registry (
 id uuid primary key default gen_random_uuid(), agent_key text not null unique, agent_name text not null,
 responsibility text not null, allowed_actions jsonb not null default '[]'::jsonb,
 prohibited_actions jsonb not null default '[]'::jsonb, is_active boolean not null default true,
 created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists public.dd_revenue_campaign_lanes (
 id uuid primary key default gen_random_uuid(), lane_key text not null unique, buyer_group text not null,
 customer_facing_goal text not null, eligible_release_state text not null default 'LIVE_READY',
 status text not null default 'ACTIVE', created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
