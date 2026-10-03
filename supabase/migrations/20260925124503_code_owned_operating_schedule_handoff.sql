
create table if not exists public.dd_scheduled_operating_work (
  id uuid primary key default gen_random_uuid(), work_key text not null unique,
  work_type text not null check (work_type in ('DAILY_EXECUTION_PLAN','EMAIL_LEAD_MINING','FINANCE_ECONOMICS_FUNDING_CLOSE')),
  work_date date not null default current_date,
  status text not null default 'QUEUED' check (status in ('QUEUED','IN_PROGRESS','COMPLETED','BLOCKED','CANCELLED')),
  authority text not null, constraints jsonb not null default '{}'::jsonb, payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
alter table public.dd_scheduled_operating_work enable row level security;
revoke all on public.dd_scheduled_operating_work from anon, authenticated;

create or replace function private.dd_enqueue_daily_execution_plan()
returns uuid language plpgsql security definer set search_path=public,private as $$
declare v_id uuid; v_target numeric:=null; v_key text:='DAILY_EXECUTION_PLAN:'||current_date; v_has_authority boolean:=false;
begin
 v_has_authority := to_regclass('public.dd_financial_target_authority') is not null;
 if v_has_authority then begin
   execute 'select target_value from public.dd_financial_target_authority where target_key=$1 and status in (''APPROVED'',''IMPLEMENTED'') order by effective_at desc nulls last, updated_at desc limit 1'
   into v_target using 'WEEKLY_COLLECTED_TARGET';
 exception when undefined_column then v_target:=null; end; end if;
 insert into public.dd_scheduled_operating_work(work_key,work_type,authority,constraints,payload)
 values(v_key,'DAILY_EXECUTION_PLAN','SUPABASE_CANONICAL',
 jsonb_build_object('sales_source','dd_sales_queue','asana_role','execution_tracking_only','tester_proof_before_production',true,'do_not_invent_weekly_target',true),
 jsonb_build_object('weekly_collected_target',v_target,'target_authoritative',v_target is not null,'target_authority_available',v_has_authority,'generated_at',now()))
 on conflict(work_key) do update set payload=excluded.payload,constraints=excluded.constraints,updated_at=now()
 returning id into v_id; return v_id;
end $$;
revoke all on function private.dd_enqueue_daily_execution_plan() from public,anon,authenticated;

create or replace function private.dd_enqueue_email_lead_mining()
returns uuid language plpgsql security definer set search_path=public,private as $$
declare v_id uuid; v_key text:='EMAIL_LEAD_MINING:'||to_char(date_trunc('hour',now()),'YYYYMMDDHH24');
begin
 insert into public.dd_scheduled_operating_work(work_key,work_type,authority,constraints,payload)
 values(v_key,'EMAIL_LEAD_MINING','GMAIL_READ_TO_CANONICAL_SALES_INTAKE',
 jsonb_build_object('no_contact_without_governed_next_action',true,'dedupe_before_create',true,'respect_dnc_cooldown_suppression',true,'research_only_is_not_inbound',true),
 jsonb_build_object('requested_action','Mine connected DANI mail for business-relevant leads/signals; reconcile identities and provenance before canonical sales intake.','generated_at',now()))
 on conflict(work_key) do update set updated_at=now() returning id into v_id; return v_id;
end $$;
revoke all on function private.dd_enqueue_email_lead_mining() from public,anon,authenticated;

create or replace function private.dd_enqueue_finance_close()
returns uuid language plpgsql security definer set search_path=public,private as $$
declare v_id uuid; v_key text:='FINANCE_ECONOMICS_FUNDING_CLOSE:'||current_date;
begin
 insert into public.dd_scheduled_operating_work(work_key,work_type,authority,constraints,payload)
 values(v_key,'FINANCE_ECONOMICS_FUNDING_CLOSE','LINKED_BUDGET_AND_ACCOUNTING_GOVERNANCE',
 jsonb_build_object('personal_and_business_budgets_linked_but_separate',true,'reconcile_business_linked_personal_transactions',true,'no_target_until_canonical_accounting_authority',true,'no_money_movement',true),
 jsonb_build_object('requested_action','Reconcile AR/AP, obligations, recurring charges, business economics, funding/certification deadlines, and inputs required for canonical target authority.','generated_at',now()))
 on conflict(work_key) do update set updated_at=now() returning id into v_id; return v_id;
end $$;
revoke all on function private.dd_enqueue_finance_close() from public,anon,authenticated;

do $$ begin
 if exists(select 1 from cron.job where jobname='dani-code-daily-execution-plan') then perform cron.unschedule('dani-code-daily-execution-plan'); end if;
 if exists(select 1 from cron.job where jobname='dani-code-email-lead-miner') then perform cron.unschedule('dani-code-email-lead-miner'); end if;
 if exists(select 1 from cron.job where jobname='dani-code-finance-close') then perform cron.unschedule('dani-code-finance-close'); end if;
 perform cron.schedule('dani-code-daily-execution-plan','30 12 * * 1-5','select private.dd_enqueue_daily_execution_plan();');
 perform cron.schedule('dani-code-email-lead-miner','5 * * * *','select private.dd_enqueue_email_lead_mining();');
 perform cron.schedule('dani-code-finance-close','30 11 * * *','select private.dd_enqueue_finance_close();');
end $$;
