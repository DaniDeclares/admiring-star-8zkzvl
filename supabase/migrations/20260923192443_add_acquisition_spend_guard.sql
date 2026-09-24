
create table if not exists public.dd_acquisition_spend_guard(
 source_system text primary key,
 activation_state text not null,
 weekly_budget_cap numeric(10,2),
 auto_reactivation_allowed boolean not null default false,
 budget_reset_risk boolean not null default false,
 owner_activation_required boolean not null default true,
 last_verified_at timestamptz,
 notes text,
 updated_at timestamptz not null default now()
);
alter table public.dd_acquisition_spend_guard enable row level security;
insert into public.dd_acquisition_spend_guard(source_system,activation_state,weekly_budget_cap,auto_reactivation_allowed,budget_reset_risk,owner_activation_required,notes)
values('THUMBTACK','HOLD_PENDING_OWNER_ACTIVATION',70.00,false,true,true,
'Paying an outstanding balance is NOT authorization to increase/resume acquisition spend. Owner reports Thumbtack can exhaust/reset budget more than once within a week. Before intentional activation, verify current weekly budget, max lead prices, targeting/services and reset/week state in Thumbtack. DANI webhook may remain ready while marketplace spend is held.')
on conflict(source_system) do update set activation_state='HOLD_PENDING_OWNER_ACTIVATION',weekly_budget_cap=70.00,auto_reactivation_allowed=false,budget_reset_risk=true,owner_activation_required=true,notes=excluded.notes,updated_at=now();
