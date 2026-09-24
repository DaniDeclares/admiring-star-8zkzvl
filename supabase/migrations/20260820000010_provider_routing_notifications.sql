begin;

alter table private.dd_work_order_routing
  add column if not exists notification_status text not null default 'PENDING',
  add column if not exists notification_attempts integer not null default 0,
  add column if not exists notified_at timestamptz,
  add column if not exists last_notification_error text;

create index if not exists dd_work_order_routing_notification_idx
  on private.dd_work_order_routing(notification_status, offer_status, created_at);

revoke all on private.dd_work_order_routing from public, anon, authenticated;
grant all on private.dd_work_order_routing to service_role;

commit;
