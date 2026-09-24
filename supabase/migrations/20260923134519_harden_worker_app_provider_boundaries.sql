
-- 1) Align job state constraint with governed job functions.
alter table public.dd_jobs drop constraint if exists dd_jobs_job_status_check;
alter table public.dd_jobs add constraint dd_jobs_job_status_check
check (job_status = any (array[
 'new','scheduled','en_route','arrived','in_progress','submitted','blocked','completed','cancelled','closed'
]));

-- 2) Harden provider capacity mutation: provider may mutate only self; staff may administer.
create or replace function public.dd_set_provider_capacity(
 p_provider_id uuid, p_status text, p_max_jobs integer, p_max_hours numeric, p_concurrent integer default 1
) returns public.dd_provider_capacity_profiles
language plpgsql security definer
set search_path = 'public','private','pg_catalog'
as $$
declare r public.dd_provider_capacity_profiles; actor_provider uuid;
begin
 if auth.uid() is null then raise exception 'AUTH_REQUIRED'; end if;
 actor_provider := private.dd_current_provider_id();
 if not private.dd_is_staff_admin() and (actor_provider is null or actor_provider <> p_provider_id) then
   raise exception 'PROVIDER_CAPACITY_UNAUTHORIZED';
 end if;
 if p_status not in ('available','open','active','paused','inactive') then raise exception 'Invalid capacity status'; end if;
 insert into public.dd_provider_capacity_profiles(provider_id,max_jobs_per_day,max_hours_per_day,max_concurrent_jobs,capacity_status,activated_at,updated_at)
 values(p_provider_id,coalesce(p_max_jobs,0),coalesce(p_max_hours,0),greatest(coalesce(p_concurrent,1),0),p_status,
 case when p_status in ('available','open','active') then now() end,now())
 on conflict do nothing;
 update public.dd_provider_capacity_profiles c
 set capacity_status=p_status,max_jobs_per_day=coalesce(p_max_jobs,c.max_jobs_per_day),
 max_hours_per_day=coalesce(p_max_hours,c.max_hours_per_day),
 max_concurrent_jobs=greatest(coalesce(p_concurrent,c.max_concurrent_jobs),0),
 activated_at=case when p_status in ('available','open','active') then coalesce(c.activated_at,now()) else c.activated_at end,
 deactivated_at=case when p_status in ('paused','inactive') then now() else c.deactivated_at end,updated_at=now()
 where c.provider_id=p_provider_id returning * into r;
 if r.id is null then raise exception 'Provider capacity profile not found or could not be created'; end if;
 return r;
end $$;
revoke all on function public.dd_set_provider_capacity(uuid,text,integer,numeric,integer) from public, anon;
grant execute on function public.dd_set_provider_capacity(uuid,text,integer,numeric,integer) to authenticated, service_role;

-- 3) Remove provider direct work-order row access. Staff/customer policies remain.
drop policy if exists dd_provider_read_work_orders on public.dd_work_orders;
drop policy if exists dd_work_orders_provider_update on public.dd_work_orders;

-- Safe provider work-order projection via authenticated RPC.
create or replace function public.dd_get_my_worker_work_order(p_job_id uuid)
returns table(
 work_order_id uuid, work_order_number text, service_id uuid, offer_sku text, service_name text,
 service_address text, scope_notes text, customer_instructions text, provider_instructions text,
 status text, scheduled_start timestamptz, scheduled_end timestamptz, qa_status text,
 site_access_payload jsonb, estimated_duration interval
)
language sql stable security definer
set search_path='public','private','pg_catalog'
as $$
 select w.id,w.work_order_number,w.service_id,w.offer_sku,w.service_name,w.service_address,
        w.scope_notes,w.customer_instructions,w.provider_instructions,w.status,w.scheduled_start,w.scheduled_end,
        w.qa_status,w.site_access_payload,w.estimated_duration
 from public.dd_jobs j
 join public.dd_job_assignments a on a.job_id=j.id
 join public.dd_work_orders w on w.id=j.work_order_id
 where j.id=p_job_id
   and a.provider_id=private.dd_current_provider_id()
   and a.assignment_status='ACCEPTED'
   and auth.uid() is not null
 limit 1
$$;
revoke all on function public.dd_get_my_worker_work_order(uuid) from public, anon;
grant execute on function public.dd_get_my_worker_work_order(uuid) to authenticated, service_role;

-- 4) Provider-safe financial projection.
create or replace function public.dd_get_my_provider_financials()
returns jsonb
language sql stable security definer
set search_path='public','private','pg_catalog'
as $$
 select case when auth.uid() is null or private.dd_current_provider_id() is null then
   jsonb_build_object('earnings','[]'::jsonb,'payables','[]'::jsonb,'payouts','[]'::jsonb)
 else jsonb_build_object(
  'earnings',coalesce((select jsonb_agg(jsonb_build_object(
    'id',e.id,'workOrderId',e.work_order_id,'earningType',e.earning_type,
    'baseAmount',e.base_amount,'bonusAmount',e.bonus_amount,'reimbursementAmount',e.reimbursement_amount,
    'adjustmentAmount',e.adjustment_amount,'totalApprovedAmount',e.total_approved_amount,'currency',e.currency,
    'status',e.earning_status,'holdReason',e.hold_reason,'approvedAt',e.approved_at,
    'scheduledPayoutDate',e.scheduled_payout_date,'paidAt',e.paid_at,'createdAt',e.created_at
  ) order by e.created_at desc) from public.dd_provider_earnings_ledger e
  where e.provider_id=private.dd_current_provider_id()),'[]'::jsonb),
  'payables',coalesce((select jsonb_agg(jsonb_build_object(
    'id',p.id,'jobId',p.job_id,'compensationType',p.compensation_type,'baseAmount',p.base_amount,
    'travelAmount',p.travel_amount,'overtimeAmount',p.overtime_amount,'bonusAmount',p.bonus_amount,
    'expenseAmount',p.expense_amount,'adjustmentAmount',p.adjustment_amount,'totalAmount',p.total_amount,
    'currency',p.currency,'status',p.status,'approvedAt',p.approved_at,'paidAt',p.paid_at,'createdAt',p.created_at
  ) order by p.created_at desc) from public.dd_provider_payables p
  where p.provider_id=private.dd_current_provider_id()),'[]'::jsonb),
  'payouts',coalesce((select jsonb_agg(jsonb_build_object(
    'id',x.id,'payableId',x.payable_id,'amount',x.amount,'currency',x.currency,
    'payoutMethod',x.payout_method,'status',x.payout_status,'processor',x.processor,
    'initiatedAt',x.initiated_at,'completedAt',x.completed_at,'failureReason',x.failure_reason,'createdAt',x.created_at
  ) order by x.created_at desc) from public.dd_provider_payouts x
  where x.provider_id=private.dd_current_provider_id()),'[]'::jsonb)
 ) end
$$;
revoke all on function public.dd_get_my_provider_financials() from public, anon;
grant execute on function public.dd_get_my_provider_financials() to authenticated, service_role;

-- 5) Provider-safe notifications + mark-read.
create or replace function public.dd_get_my_provider_notifications(p_limit integer default 100)
returns table(id uuid,job_id uuid,assignment_id uuid,notification_type text,channel text,title text,body text,payload jsonb,sent_at timestamptz,read_at timestamptz,created_at timestamptz)
language sql stable security definer
set search_path='public','private','pg_catalog'
as $$
 select n.id,n.job_id,n.assignment_id,n.notification_type,n.channel,n.title,n.body,n.payload,n.sent_at,n.read_at,n.created_at
 from public.dd_provider_notifications n
 where auth.uid() is not null and n.provider_id=private.dd_current_provider_id()
 order by n.created_at desc limit greatest(1,least(coalesce(p_limit,100),250))
$$;
revoke all on function public.dd_get_my_provider_notifications(integer) from public, anon;
grant execute on function public.dd_get_my_provider_notifications(integer) to authenticated, service_role;

create or replace function public.dd_mark_my_provider_notification_read(p_notification_id uuid)
returns timestamptz
language plpgsql security definer
set search_path='public','private','pg_catalog'
as $$
declare v_read_at timestamptz;
begin
 if auth.uid() is null or private.dd_current_provider_id() is null then raise exception 'AUTH_REQUIRED'; end if;
 update public.dd_provider_notifications
 set read_at=coalesce(read_at,now())
 where id=p_notification_id and provider_id=private.dd_current_provider_id()
 returning read_at into v_read_at;
 if v_read_at is null then raise exception 'NOTIFICATION_NOT_FOUND_OR_UNAUTHORIZED'; end if;
 return v_read_at;
end $$;
revoke all on function public.dd_mark_my_provider_notification_read(uuid) from public, anon;
grant execute on function public.dd_mark_my_provider_notification_read(uuid) to authenticated, service_role;
