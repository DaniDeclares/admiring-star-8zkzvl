create unique index if not exists ux_dd_ch01_adjudication_locked_service_frontdoor
on public.dd_ch01_service_adjudication(channel_code, service_id, front_door_code)
where status='LOCKED' and channel_code='CH01';

create index if not exists idx_dd_ch01_adjudication_resolution
on public.dd_ch01_service_adjudication(channel_code, front_door_code, sku, status)
where channel_code='CH01' and status='LOCKED';

comment on index ux_dd_ch01_adjudication_locked_service_frontdoor is
'CH01 canonical resolution: one locked adjudication per service and resident front door.';

comment on index idx_dd_ch01_adjudication_resolution is
'CH01 runtime lookup path for front door + canonical SKU resolution.';
