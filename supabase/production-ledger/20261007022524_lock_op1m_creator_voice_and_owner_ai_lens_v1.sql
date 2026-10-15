
create table if not exists public.dd_ai_operating_doctrine_v1 (
  doctrine_key text primary key,
  doctrine_name text not null,
  scope text[] not null default '{}',
  version integer not null default 1,
  status text not null default 'ACTIVE',
  rules jsonb not null default '{}'::jsonb,
  rationale text,
  source_attribution text,
  effective_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint dd_ai_operating_doctrine_v1_status_chk check (status in ('ACTIVE','SUPERSEDED','HOLD'))
);
alter table public.dd_ai_operating_doctrine_v1 enable row level security;
revoke all on table public.dd_ai_operating_doctrine_v1 from anon, authenticated;
grant select, insert, update, delete on table public.dd_ai_operating_doctrine_v1 to service_role;

insert into public.dd_ai_operating_doctrine_v1
(doctrine_key,doctrine_name,scope,version,status,rules,rationale,source_attribution,updated_at)
values
('OWNER_DECISION_LENS_V1','DANI Owner Decision Lens',array['AI','BRAIN','OWNER_HQ','MARKETING','SALES','RESEARCH','PLANNING'],1,'ACTIVE',
jsonb_build_object(
 'required_lenses',jsonb_build_array(
   jsonb_build_object('key','BLIND_SPOTS','instruction','Find my blind spots. Identify what is missing, overbuilt, underused, assumed, avoided, or likely to fail.'),
   jsonb_build_object('key','ELI10','instruction','Explain the important conclusion in plain language as if to an intelligent 10-year-old. Keep the substance; remove unnecessary jargon.'),
   jsonb_build_object('key','THREE_QUESTIONS','instruction','Ask up to 3 high-value questions only when the answers would materially change the decision or execution. Do not create questions as ritual friction when the needed context is already known.'),
   jsonb_build_object('key','PROS_CONS','instruction','List the meaningful pros and cons/tradeoffs of the recommended path and serious alternatives.')
 ),
 'execution_rule','Use these lenses before consequential owner recommendations, campaign strategy, offer changes, major builds, prioritization, and go/no-go decisions. Questions are conditional: use known history first and ask only what materially remains unknown.',
 'history_first',true,
 'no_ritual_questions',true
),
'Make DANI AI challenge assumptions, explain simply, surface tradeoffs, and ask only decision-changing questions.','OWNER_DIRECTIVE_2026-10-06',now())
on conflict (doctrine_key) do update set
 doctrine_name=excluded.doctrine_name,scope=excluded.scope,version=excluded.version,status=excluded.status,rules=excluded.rules,
 rationale=excluded.rationale,source_attribution=excluded.source_attribution,updated_at=now();

insert into public.dd_ai_operating_doctrine_v1
(doctrine_key,doctrine_name,scope,version,status,rules,rationale,source_attribution,updated_at)
values
('OP1M_CREATOR_VOICE_V1','Operation $1 Million Creator Voice & Disclosure Rules',array['MARKETING','SOCIAL','CONTENT','OP1M_CREATOR_ENGINE'],1,'ACTIVE',
jsonb_build_object(
 'voice',jsonb_build_object(
   'benchmark','RAW',
   'attributes',jsonb_build_array('self-aware','specific','funny when natural','imperfect','discovery-in-public','human-not-corporate'),
   'avoid',jsonb_build_array('obvious AI voice','fake struggle','manufactured vulnerability','constant hard sell','sanitized failure')
 ),
 'public_numbers',jsonb_build_object(
   'revenue_disclosure','PERCENTAGES_AND_MILESTONES',
   'activity_counts_allowed',true,
   'allowed_example','I sent 20 pitches and nobody bought.',
   'verified_numbers_only',true,
   'no_fake_revenue',true
 ),
 'real_life',jsonb_build_object(
   'include_owner_reality',true,
   'include_parenting_and_real_life_when_natural',true,
   'protect_private_family_details',true
 ),
 'content_model',jsonb_build_object(
   'campaign_is_a_show_not_30_ads',true,
   'document_real_events',true,
   'problem_realization_correction',true,
   'comments_are_research_and_sales_signals',true,
   'founder_job','talk + show + sell + respond + approve',
   'system_job','research + mine history + draft + repurpose + classify + attribute + prioritize + prepare follow-up + measure'
 )
),
'Preserve the Day 1/Day 2 raw creator voice while turning attention into measurable service and platform revenue.','OWNER_DIRECTIVE_2026-10-06',now())
on conflict (doctrine_key) do update set
 doctrine_name=excluded.doctrine_name,scope=excluded.scope,version=excluded.version,status=excluded.status,rules=excluded.rules,
 rationale=excluded.rationale,source_attribution=excluded.source_attribution,updated_at=now();

insert into public.dd_prompt_shortcut_patterns(shortcut_key,intended_action,status,implementation_note,updated_at)
values
('/blindspots','Find blind spots in the current plan, decision, campaign, or build','INTERNAL_PATTERN','Apply OWNER_DECISION_LENS_V1; history first; surface missing, overbuilt, underused, assumed, avoided, and failure-prone areas.',now()),
('/eli10','Explain the current conclusion in plain language without removing important substance','INTERNAL_PATTERN','Apply OWNER_DECISION_LENS_V1 ELI10 lens.',now()),
('/3questions','Ask up to three decision-changing questions','INTERNAL_PATTERN','Apply OWNER_DECISION_LENS_V1. Ask only when answers materially change execution; do not ask ritual questions when history already answers them.',now()),
('/proscons','Show meaningful pros, cons, and tradeoffs','INTERNAL_PATTERN','Apply OWNER_DECISION_LENS_V1 to the recommended path and serious alternatives.',now()),
('/ownerlens','Run blind spots + ELI10 + up to 3 material questions + pros/cons','INTERNAL_PATTERN','Composite owner decision lens. History first. Questions are conditional, not mandatory friction.',now())
on conflict (shortcut_key) do update set intended_action=excluded.intended_action,status=excluded.status,implementation_note=excluded.implementation_note,updated_at=now();

update public.dd_acquisition_campaigns_v1
set metadata = coalesce(metadata,'{}'::jsonb) || jsonb_build_object(
 'creator_voice_doctrine','OP1M_CREATOR_VOICE_V1',
 'owner_decision_lens','OWNER_DECISION_LENS_V1',
 'public_revenue_disclosure','PERCENTAGES_AND_MILESTONES',
 'activity_counts_allowed',true,
 'raw_voice_benchmark',true
), updated_at=now()
where campaign_key='OP1M_CREATOR_ENGINE';
