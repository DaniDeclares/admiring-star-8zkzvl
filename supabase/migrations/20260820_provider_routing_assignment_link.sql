begin;

alter table private.dd_work_order_routing
  add column if not exists assignment_id uuid references public.dd_job_assignments(id) on delete set null;

create index if not exists dd_work_order_routing_assignment_idx
  on private.dd_work_order_routing(assignment_id);

commit;
