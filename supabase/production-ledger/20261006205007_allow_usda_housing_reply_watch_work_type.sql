
alter table public.dd_scheduled_operating_work
drop constraint if exists dd_scheduled_operating_work_work_type_check;

alter table public.dd_scheduled_operating_work
add constraint dd_scheduled_operating_work_work_type_check
check (work_type = any (array[
  'DAILY_EXECUTION_PLAN'::text,
  'EMAIL_LEAD_MINING'::text,
  'FINANCE_ECONOMICS_FUNDING_CLOSE'::text,
  'USDA_HOUSING_REPLY_WATCH'::text
]));
