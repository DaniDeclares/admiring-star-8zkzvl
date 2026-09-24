-- CH02 governed service expansion / add-on matrix
-- Relationship guidance only. It never creates quote lines or changes pricing authority.
create table if not exists public.dd_ch02_service_expansion_matrix (
  id uuid primary key default gen_random_uuid(),
  channel_code text not null default 'CH02' check (channel_code = 'CH02'),
  source_service_id uuid not null references public.services(id),
  target_service_id uuid not null references public.services(id),
  relationship_type text not null check (relationship_type in (
    'COMPLEMENT','FOLLOW_ON','EXPANSION','RECURRING_PATH','PORTFOLIO_PATH'
  )),
  recommendation_mode text not null default 'SUGGEST' check (recommendation_mode in ('SUGGEST','REVIEW_REQUIRED')),
  priority integer not null default 100 check (priority >= 0),
  trigger_context jsonb not null default '{}'::jsonb,
  rationale text not null,
  source_basis text not null,
  basis_type text not null default 'DANI_INTERPRETATION' check (basis_type in ('RESEARCH','DECISION','DANI_INTERPRETATION','SYSTEM_CONTROL')),
  status text not null default 'LOCKED' check (status in ('LOCKED','DRAFT','SUPERSEDED','INACTIVE')),
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (source_service_id <> target_service_id),
  unique (channel_code, source_service_id, target_service_id, relationship_type)
);
create index if not exists idx_dd_ch02_service_expansion_source
  on public.dd_ch02_service_expansion_matrix(source_service_id, status, priority);
create index if not exists idx_dd_ch02_service_expansion_target
  on public.dd_ch02_service_expansion_matrix(target_service_id, status);
alter table public.dd_ch02_service_expansion_matrix enable row level security;
drop policy if exists dd_ch02_service_expansion_matrix_staff_all on public.dd_ch02_service_expansion_matrix;
create policy dd_ch02_service_expansion_matrix_staff_all
  on public.dd_ch02_service_expansion_matrix
  for all to authenticated
  using (private.dd_is_staff_admin())
  with check (private.dd_is_staff_admin());
revoke all on public.dd_ch02_service_expansion_matrix from anon;
revoke all on public.dd_ch02_service_expansion_matrix from authenticated;
grant select, insert, update, delete on public.dd_ch02_service_expansion_matrix to authenticated;

insert into public.dd_ch02_service_expansion_matrix
(channel_code,source_service_id,target_service_id,relationship_type,recommendation_mode,priority,trigger_context,rationale,source_basis,basis_type,status,sort_order)
select 'CH02', s.id, t.id, v.relationship_type, v.recommendation_mode, v.priority, v.trigger_context::jsonb, v.rationale,
       'CH02 service catalog + locked CH02 engagement architecture v1', 'DECISION', 'LOCKED', v.sort_order
from (values
('Apartment Turn','Make-Ready Cleaning','COMPLEMENT','SUGGEST',10,'{"same_request":true,"condition_sensitive":true}','Turnover work commonly requires the governed cleaning component to reach the stated ready condition.',10),
('Apartment Turn','Property Inspection','COMPLEMENT','SUGGEST',20,'{"same_request":true,"pre_release_check":true}','Inspection supports condition verification before release and can be scoped alongside a turn.',20),
('Apartment Turn','Photo Documentation','COMPLEMENT','SUGGEST',30,'{"same_request":true,"documentation":true}','Photo documentation provides a governed record of unit condition and turnover completion.',30),
('Apartment Turn','Punch List','COMPLEMENT','SUGGEST',40,'{"condition_flag":["maintenance_issues","damage"],"same_request":true}','Turn findings may create discrete punch-list work that should be commercially represented rather than assumed inside the base turn.',40),
('Apartment Turn','Work Order Coordination','FOLLOW_ON','REVIEW_REQUIRED',50,'{"condition_flag":["maintenance_issues","vendor_needed"]}','When turnover findings require outside or specialized work, coordination can become the next governed service.',50),
('Apartment Turn','Multi-Unit Turnover Management','PORTFOLIO_PATH','REVIEW_REQUIRED',60,'{"unit_count_min":5,"portfolio_signal":true}','Repeated or multi-unit turnover volume can justify a broader managed turnover model when that service is active and sellable.',60),
('Make-Ready Cleaning','Property Inspection','COMPLEMENT','SUGGEST',10,'{"same_request":true,"pre_release_check":true}','Cleaning completion benefits from a separate property condition/readiness check when the customer requires documented release readiness.',10),
('Make-Ready Cleaning','Photo Documentation','COMPLEMENT','SUGGEST',20,'{"same_request":true,"documentation":true}','Documentation can evidence the completed condition of the unit after make-ready work.',20),
('Make-Ready Cleaning','Punch List','FOLLOW_ON','REVIEW_REQUIRED',30,'{"condition_flag":["damage","maintenance_issues"]}','Cleaning or inspection findings may surface work that belongs in a separate punch-list scope.',30),
('Property Inspection','Photo Documentation','COMPLEMENT','SUGGEST',10,'{"same_request":true,"documentation":true}','Documentation is a natural companion when inspection findings need an auditable visual record.',10),
('Property Inspection','Punch List','FOLLOW_ON','SUGGEST',20,'{"finding_signal":true,"maintenance_or_damage":true}','Documented findings can convert into governed punch-list work after inspection.',20),
('Property Inspection','Work Order Coordination','FOLLOW_ON','REVIEW_REQUIRED',30,'{"finding_signal":true,"vendor_needed":true}','Inspection findings that require third-party work can progress into coordination.',30),
('Photo Documentation','Property Condition Report','COMPLEMENT','REVIEW_REQUIRED',40,'{"documentation_depth":"condition_report"}','A deeper condition-report deliverable may be appropriate when the customer needs more than standard photo evidence.',40),
('Punch List','Work Order Coordination','FOLLOW_ON','REVIEW_REQUIRED',10,'{"vendor_needed":true,"specialist_needed":true}','Punch-list execution may require coordinated vendor or specialist fulfillment.',10),
('Work Order Coordination','Vendor Coordination','COMPLEMENT','REVIEW_REQUIRED',20,'{"vendor_scope":true,"multi_vendor":true}','Broader vendor coordination may be appropriate when the work crosses multiple providers or trades.',20),
('Turnover Ready Standard','Property Inspection','COMPLEMENT','SUGGEST',10,'{"same_request":true,"pre_release_check":true}','A readiness check can validate the final condition before release.',10),
('Turnover Ready Premium','Property Inspection','COMPLEMENT','SUGGEST',10,'{"same_request":true,"pre_release_check":true}','A readiness check can validate the final condition before release.',10),
('Turnover Ready Basic','Photo Documentation','COMPLEMENT','SUGGEST',10,'{"same_request":true,"documentation":true}','Photo documentation can provide a completion record when requested by the property operator.',10),
('Turnover Ready Standard','Photo Documentation','COMPLEMENT','SUGGEST',20,'{"same_request":true,"documentation":true}','Photo documentation can provide a completion record when requested by the property operator.',20),
('Turnover Ready Premium','Photo Documentation','COMPLEMENT','SUGGEST',20,'{"same_request":true,"documentation":true}','Photo documentation can provide a completion record when requested by the property operator.',20),
('Property Inspection','Property Transition Support','EXPANSION','REVIEW_REQUIRED',50,'{"transition_signal":true,"multi_unit":true}','Repeated condition work can expand into broader transition support when the property operator needs coordination beyond a single inspection.',50),
('Apartment Turn','Property Transition Support','EXPANSION','REVIEW_REQUIRED',70,'{"unit_count_min":5,"transition_signal":true}','A larger turnover event can expand into transition support when the customer needs coordinated operational coverage.',70)
) as v(source_name,target_name,relationship_type,recommendation_mode,priority,trigger_context,rationale,sort_order)
join public.services s on s.name=v.source_name and s.division_id=2 and s.is_active=true and s.commercial_intent_status in ('SELL_NOW','FULFILLMENT_GATED')
join public.services t on t.name=v.target_name and t.division_id=2 and t.is_active=true and t.commercial_intent_status in ('SELL_NOW','FULFILLMENT_GATED')
on conflict (channel_code,source_service_id,target_service_id,relationship_type) do update set
  recommendation_mode=excluded.recommendation_mode, priority=excluded.priority,
  trigger_context=excluded.trigger_context, rationale=excluded.rationale,
  source_basis=excluded.source_basis, basis_type=excluded.basis_type,
  status=excluded.status, sort_order=excluded.sort_order, updated_at=now();
