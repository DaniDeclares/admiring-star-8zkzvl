-- Salesperson workspace read/write surface. Additive only: no change to existing RLS on
-- dd_sales_queue, dd_sales_commissions or dd_sales_commission_policies, and no new queue/table.
-- A SALESPERSON portal user (public.dd_portal_user_roles, governed role -- not a staff JWT
-- app_metadata role) cannot pass private.dd_is_staff_admin(), so they have no way to read or
-- write dd_sales_queue/dd_sales_commissions today even though those objects already carry their
-- assignment/commission columns. These SECURITY DEFINER RPCs are the same governed-read pattern
-- already established by dd_get_sales_dashboard_leads/dd_get_my_portal_roles, extended to cover
-- the commission ledger and per-lead updates a salesperson actually needs to work their pipeline.

-- 1) Replace the existing leads RPC with the same authorization check, but source from
--    dd_sales_engine_v1 (priority/stage/recommended-action) instead of the bare table, and
--    surface assignment/commission-class columns. p_mine_only lets a SALESPERSON scope to their
--    own assigned + unassigned pool leads; OWNER_OPERATOR always sees the full queue.
create or replace function public.dd_get_sales_dashboard_leads(p_limit integer default 100, p_mine_only boolean default false)
returns table(
  id uuid, contact_name text, company_name text, role_title text, phone text, email text,
  lane text, source text, disposition text, next_action text, next_action_date date,
  buyer_type text, source_account text, source_direction text, source_occurred_at timestamptz,
  campaign_status text, do_not_contact boolean, contact_pressure_state text, sales_metadata jsonb,
  quoted_amount numeric, amount_collected numeric, pain_point text, impact_statement text,
  next_step_commitment text, priority_score integer, sales_stage text, recommended_action text,
  timing_signal text, salesperson_user_id uuid, salesperson_name text, lead_origin_class text,
  commission_policy_code text, updated_at timestamptz
)
language plpgsql
stable
security definer
set search_path to ''
as $function$
declare
  v_is_owner boolean;
begin
  select exists (
    select 1 from public.dd_portal_user_roles r
    where r.user_id = (select auth.uid()) and r.is_active = true and r.role::text = 'OWNER_OPERATOR'
  ) into v_is_owner;

  if not v_is_owner and not exists (
    select 1 from public.dd_portal_user_roles r
    where r.user_id = (select auth.uid()) and r.is_active = true and r.role::text = 'SALESPERSON'
  ) then
    raise exception 'not authorized';
  end if;

  return query
  select q.id,q.contact_name,q.company_name,q.role_title,q.phone,q.email,q.lane,q.source,
         q.disposition,q.next_action,q.next_action_date,q.buyer_type,q.source_account,
         q.source_direction,q.source_occurred_at,q.campaign_status,q.do_not_contact,
         q.contact_pressure_state,q.sales_metadata,q.quoted_amount,q.amount_collected,
         q.pain_point,q.impact_statement,q.next_step_commitment,q.priority_score,q.sales_stage,
         q.recommended_action,q.timing_signal,q.salesperson_user_id,q.salesperson_name,
         q.lead_origin_class,q.commission_policy_code,q.updated_at
  from public.dd_sales_engine_v1 q
  where v_is_owner
     or not p_mine_only
     or q.salesperson_user_id is null
     or q.salesperson_user_id = (select auth.uid())
  order by
    case when q.do_not_contact then 1 else 0 end,
    q.priority_score desc nulls last,
    q.next_action_date nulls last,
    q.updated_at desc
  limit greatest(1, least(coalesce(p_limit,100),250));
end;
$function$;

grant execute on function public.dd_get_sales_dashboard_leads(integer, boolean) to authenticated;

-- 2) Commission ledger read, scoped to the caller. A SALESPERSON sees only their own rows;
--    OWNER_OPERATOR sees all. Never exposes provider economics or accounting-authority tables.
create or replace function public.dd_get_my_sales_commissions(p_limit integer default 200)
returns table(
  id uuid, sales_queue_id uuid, contact_name text, company_name text,
  salesperson_user_id uuid, salesperson_name text, lead_origin_class text,
  policy_code text, commission_rate numeric, basis text, collected_revenue_basis numeric,
  commission_amount numeric, commission_status text, economics_guardrail_status text,
  earned_at timestamptz, paid_at timestamptz, updated_at timestamptz
)
language plpgsql
stable
security definer
set search_path to ''
as $function$
declare
  v_is_owner boolean;
begin
  select exists (
    select 1 from public.dd_portal_user_roles r
    where r.user_id = (select auth.uid()) and r.is_active = true and r.role::text = 'OWNER_OPERATOR'
  ) into v_is_owner;

  if not v_is_owner and not exists (
    select 1 from public.dd_portal_user_roles r
    where r.user_id = (select auth.uid()) and r.is_active = true and r.role::text = 'SALESPERSON'
  ) then
    raise exception 'not authorized';
  end if;

  return query
  select c.id,c.sales_queue_id,q.contact_name,q.company_name,c.salesperson_user_id,
         c.salesperson_name,c.lead_origin_class,p.policy_code,c.commission_rate,p.basis,
         c.collected_revenue_basis,c.commission_amount,c.commission_status,
         c.economics_guardrail_status,c.earned_at,c.paid_at,c.updated_at
  from public.dd_sales_commissions c
  left join public.dd_sales_commission_policies p on p.id = c.policy_id
  left join public.dd_sales_queue q on q.id = c.sales_queue_id
  where v_is_owner or c.salesperson_user_id = (select auth.uid())
  order by c.updated_at desc
  limit greatest(1, least(coalesce(p_limit,200),500));
end;
$function$;

grant execute on function public.dd_get_my_sales_commissions(integer) to authenticated;

-- 3) Lead update, scoped the same way as the read RPC. A SALESPERSON may only touch a row that
--    is unassigned (first-touch self-assignment) or already assigned to them; OWNER_OPERATOR may
--    touch any row. Never accepts pricing/eligibility/channel fields -- those stay governed
--    elsewhere; this only carries the same disposition/next-step fields the Operations Console
--    sales tab already edits.
create or replace function public.dd_update_my_sales_lead(
  p_id uuid,
  p_disposition text default null,
  p_next_action text default null,
  p_next_action_date date default null,
  p_quoted_amount numeric default null,
  p_amount_collected numeric default null,
  p_pain_point text default null,
  p_impact_statement text default null,
  p_next_step_commitment text default null
)
returns void
language plpgsql
security definer
set search_path to ''
as $function$
declare
  v_is_owner boolean;
  v_uid uuid := (select auth.uid());
  v_name text;
  v_row public.dd_sales_queue;
begin
  select exists (
    select 1 from public.dd_portal_user_roles r
    where r.user_id = v_uid and r.is_active = true and r.role::text = 'OWNER_OPERATOR'
  ) into v_is_owner;

  if not v_is_owner and not exists (
    select 1 from public.dd_portal_user_roles r
    where r.user_id = v_uid and r.is_active = true and r.role::text = 'SALESPERSON'
  ) then
    raise exception 'not authorized';
  end if;

  select * into v_row from public.dd_sales_queue where id = p_id;
  if v_row.id is null then
    raise exception 'lead not found';
  end if;

  if not v_is_owner and v_row.salesperson_user_id is not null and v_row.salesperson_user_id <> v_uid then
    raise exception 'lead is assigned to another salesperson';
  end if;

  if not v_is_owner and v_row.salesperson_user_id is null then
    select coalesce(raw_user_meta_data->>'full_name', email) into v_name from auth.users where id = v_uid;
    update public.dd_sales_queue set salesperson_user_id = v_uid, salesperson_name = coalesce(v_name, salesperson_name) where id = p_id;
  end if;

  update public.dd_sales_queue set
    disposition = coalesce(p_disposition, disposition),
    next_action = coalesce(p_next_action, next_action),
    next_action_date = coalesce(p_next_action_date, next_action_date),
    quoted_amount = coalesce(p_quoted_amount, quoted_amount),
    amount_collected = coalesce(p_amount_collected, amount_collected),
    pain_point = coalesce(p_pain_point, pain_point),
    impact_statement = coalesce(p_impact_statement, impact_statement),
    next_step_commitment = coalesce(p_next_step_commitment, next_step_commitment),
    updated_at = now()
  where id = p_id;
end;
$function$;

grant execute on function public.dd_update_my_sales_lead(uuid, text, text, date, numeric, numeric, text, text, text) to authenticated;

comment on function public.dd_get_sales_dashboard_leads(integer, boolean) is 'Governed read of dd_sales_engine_v1 for OWNER_OPERATOR/SALESPERSON portal roles. p_mine_only scopes a salesperson to their assigned + unassigned pool leads.';
comment on function public.dd_get_my_sales_commissions(integer) is 'Governed read of dd_sales_commissions scoped to the caller; OWNER_OPERATOR sees all.';
comment on function public.dd_update_my_sales_lead(uuid, text, text, date, numeric, numeric, text, text, text) is 'Governed lead update for OWNER_OPERATOR/SALESPERSON. First edit of an unassigned lead self-assigns it. Never accepts pricing-authority or channel fields.';
