
alter type public.dd_portal_role add value if not exists 'SALESPERSON';

create or replace function public.dd_get_sales_dashboard_leads(p_limit integer default 100)
returns table (
  id uuid,
  contact_name text,
  company_name text,
  role_title text,
  phone text,
  email text,
  lane text,
  source text,
  disposition text,
  next_action text,
  next_action_date date,
  buyer_type text,
  source_account text,
  source_direction text,
  source_occurred_at timestamptz,
  campaign_status text,
  do_not_contact boolean,
  contact_pressure_state text,
  sales_metadata jsonb,
  updated_at timestamptz
)
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  if not exists (
    select 1 from public.dd_portal_user_roles r
    where r.user_id = (select auth.uid())
      and r.is_active = true
      and r.role::text in ('OWNER_OPERATOR','SALESPERSON')
  ) then
    raise exception 'not authorized';
  end if;

  return query
  select q.id,q.contact_name,q.company_name,q.role_title,q.phone,q.email,q.lane,q.source,
         q.disposition,q.next_action,q.next_action_date,q.buyer_type,q.source_account,
         q.source_direction,q.source_occurred_at,q.campaign_status,q.do_not_contact,
         q.contact_pressure_state,q.sales_metadata,q.updated_at
  from public.dd_sales_queue q
  order by
    case when q.do_not_contact then 1 else 0 end,
    case q.lane when 'INBOUND' then 0 when 'WARM' then 1 when 'REVISIT_CALLABLE' then 2
      when 'EMAIL_ONLY' then 3 when 'PARTNER' then 4 else 5 end,
    q.next_action_date nulls last,
    q.updated_at desc
  limit greatest(1, least(coalesce(p_limit,100),250));
end;
$$;

revoke all on function public.dd_get_sales_dashboard_leads(integer) from public;
grant execute on function public.dd_get_sales_dashboard_leads(integer) to authenticated;
