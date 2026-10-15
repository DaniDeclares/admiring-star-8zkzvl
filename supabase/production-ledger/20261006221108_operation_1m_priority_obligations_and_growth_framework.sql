
create table if not exists public.dd_company_priority_obligations (
  obligation_key text primary key,
  label text not null,
  category text not null,
  priority_rank integer not null check (priority_rank > 0),
  priority_class text not null default 'P0',
  status text not null default 'OPEN',
  amount_due numeric,
  due_date date,
  funding_rule text not null,
  source_authority text,
  notes text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.dd_company_priority_obligations enable row level security;

create table if not exists public.dd_growth_operating_framework (
  framework_key text not null,
  work_bucket text not null,
  weekly_share_percent numeric(6,3) not null check (weekly_share_percent > 0 and weekly_share_percent <= 100),
  default_hours_at_15 numeric(6,2) not null,
  applies_to text not null,
  objective text not null,
  required_systems jsonb not null default '[]'::jsonb,
  guardrails jsonb not null default '{}'::jsonb,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key(framework_key,work_bucket)
);
alter table public.dd_growth_operating_framework enable row level security;

insert into public.dd_company_priority_obligations(
  obligation_key,label,category,priority_rank,priority_class,status,
  funding_rule,source_authority,notes,metadata
)
values
('GA_NOTARY_COMMISSION','Georgia notary commission / renewal costs','LICENSING',1,'P0','OPEN',
 'Fund before discretionary business spend; preserve housing/basic-needs cash floor.',
 'OWNER_DIRECTIVE_2026-10-06',
 'Exact county clerk amount must be verified before payment.',
 jsonb_build_object('operation','OPERATION_1M','business_critical',true,'owner_identity_action_may_be_required',true)),
('GA_NOTARY_ID','Georgia ID / identity-document cost required for notary commissioning','IDENTITY_AND_LICENSING',2,'P0','OPEN',
 'Fund before discretionary business spend; preserve housing/basic-needs cash floor.',
 'OWNER_DIRECTIVE_2026-10-06',
 'Exact ID cost unresolved; do not invent amount.',
 jsonb_build_object('operation','OPERATION_1M','business_critical',true)),
('GOOGLE_WORKSPACE','Google Workspace continuity','CORE_INFRASTRUCTURE',3,'P0','OPEN',
 'Keep active before nonessential software and discretionary subscriptions.',
 'OWNER_DIRECTIVE_2026-10-06',
 'Exact current billing amount must be reconciled.',
 jsonb_build_object('operation','OPERATION_1M','business_critical',true)),
('BUSINESS_INSURANCE','Business insurance continuity','RISK_AND_COMPLIANCE',4,'P0','OPEN',
 'Maintain coverage before discretionary business spend; reconcile current carrier/premium/due date.',
 'OWNER_DIRECTIVE_2026-10-06',
 'Historical connected-account evidence shows an Insurance Canopy outflow of $192.90 on 2026-06-11; not treated as current amount due.',
 jsonb_build_object('operation','OPERATION_1M','business_critical',true,'historical_outflow',192.90,'historical_date','2026-06-11'))
on conflict(obligation_key) do update
set label=excluded.label,category=excluded.category,priority_rank=excluded.priority_rank,
    priority_class=excluded.priority_class,funding_rule=excluded.funding_rule,
    source_authority=excluded.source_authority,notes=excluded.notes,
    metadata=public.dd_company_priority_obligations.metadata||excluded.metadata,
    updated_at=now();

insert into public.dd_growth_operating_framework(
  framework_key,work_bucket,weekly_share_percent,default_hours_at_15,
  applies_to,objective,required_systems,guardrails
)
values
('OPERATION_1M_15H_PATTERN','PAID_DELIVERY',40,6,'ALL_ACTIVE_DIVISIONS','Revenue-producing delivery now',jsonb_build_array('BOOKING','SCOPE','PAYMENT','FULFILLMENT','EVIDENCE','QA'),jsonb_build_object('rule','Preserve growth time')),
('OPERATION_1M_15H_PATTERN','CLIENT_ACQUISITION',20,3,'ALL_ACTIVE_DIVISIONS','Find qualified buyers and referral partners',jsonb_build_array('TARGET_LIST','OUTREACH','GOOGLE_BUSINESS_PROFILE','REFERRAL_NETWORK'),jsonb_build_object('rule','Verified buyer first')),
('OPERATION_1M_15H_PATTERN','FOLLOW_UP',13.333,2,'ALL_ACTIVE_DIVISIONS','Advance warm leads, prior clients, open quotes and vendor onboarding',jsonb_build_array('FOLLOWUP_QUEUE','CONTACT_PRESSURE','REPLY_RECONCILIATION','QUOTE_HANDOFF'),jsonb_build_object('rule','No duplicate outreach')),
('OPERATION_1M_15H_PATTERN','VISIBILITY',13.333,2,'ALL_ACTIVE_DIVISIONS','Stay searchable and credible',jsonb_build_array('CONTENT_QUEUE','GOOGLE_BUSINESS_PROFILE','REVIEWS','LOCAL_NETWORKING'),jsonb_build_object('rule','Use verified proof')),
('OPERATION_1M_15H_PATTERN','SYSTEMS_CEO',13.334,2,'ALL_ACTIVE_DIVISIONS','Build automation, templates, bookkeeping and partner capacity',jsonb_build_array('AUTOMATION','TEMPLATES','BOOKKEEPING','PLANNING','PARTNER_NETWORK'),jsonb_build_object('rule','Remove real bottlenecks'))
on conflict(framework_key,work_bucket) do update
set weekly_share_percent=excluded.weekly_share_percent,
    default_hours_at_15=excluded.default_hours_at_15,
    applies_to=excluded.applies_to,objective=excluded.objective,
    required_systems=excluded.required_systems,guardrails=excluded.guardrails,
    active=true,updated_at=now();
