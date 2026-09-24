-- DDOS Operations Core: channel-aware intake routing
-- Phase 1: persist the intake discriminator and selected workflow on service_requests.
-- No pricing is created or changed by this migration.

alter table public.service_requests
  add column if not exists channel_type text,
  add column if not exists intake_workflow text,
  add column if not exists routing_source text,
  add column if not exists routing_reason text;

alter table public.service_requests
  drop constraint if exists service_requests_channel_type_check;

alter table public.service_requests
  add constraint service_requests_channel_type_check
  check (
    channel_type is null
    or channel_type in ('B2C', 'B2B_APT', 'B2B_RE', 'B2B', 'B2B2C', 'B2G')
  );

alter table public.service_requests
  drop constraint if exists service_requests_intake_workflow_check;

alter table public.service_requests
  add constraint service_requests_intake_workflow_check
  check (
    intake_workflow is null
    or intake_workflow in ('INSTANT_BOOKING', 'B2B_PROPOSAL', 'B2G_SOW', 'MANUAL_REVIEW')
  );

create index if not exists idx_service_requests_channel_workflow
  on public.service_requests(channel_type, intake_workflow, status);

comment on column public.service_requests.channel_type is
  'Validated commercial channel discriminator. Pricing and workflow may not be inferred from free-form request text.';

comment on column public.service_requests.intake_workflow is
  'Operational state-machine entry selected from the validated channel.';

comment on column public.service_requests.routing_source is
  'explicit when supplied by the caller; category_fallback only for controlled legacy category mapping.';

comment on column public.service_requests.routing_reason is
  'Routing audit reason; unresolved channel requests must not silently become B2C.';
