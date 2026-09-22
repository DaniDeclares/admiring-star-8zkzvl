begin;
alter table public.dd_jobs add column if not exists work_order_id uuid;
create index if not exists idx_dd_jobs_work_order on public.dd_jobs(work_order_id);
commit;