-- DANI DECLARES — Commercial Channel / B2B2C contract enforcement
-- Channel is not the same thing as commercial model.
-- B2B2C is never an official channel.

alter table public.service_requests
  add column if not exists channel_type text,
  add column if not exists official_channel text,
  add column if not exists commercial_model text,
  add column if not exists subchannel_code text,
  add column if not exists intake_workflow text,
  add column if not exists routing_source text,
  add column if not exists routing_reason text;

alter table public.service_requests
  drop constraint if exists service_requests_channel_type_check;

alter table public.service_requests
  add constraint service_requests_channel_type_check
  check (
    channel_type is null
    or channel_type in ('B2C', 'B2B_APT', 'B2B_RE', 'B2B', 'B2G')
  );

alter table public.service_requests
  drop constraint if exists service_requests_official_channel_check;

alter table public.service_requests
  add constraint service_requests_official_channel_check
  check (
    official_channel is null
    or official_channel in ('CH01', 'CH02', 'CH03', 'CH04', 'CH05')
  );

alter table public.service_requests
  drop constraint if exists service_requests_commercial_model_check;

alter table public.service_requests
  add constraint service_requests_commercial_model_check
  check (
    commercial_model is null
    or commercial_model in ('B2C', 'B2B', 'B2B2C', 'B2G')
  );

alter table public.service_requests
  drop constraint if exists service_requests_intake_workflow_check;

alter table public.service_requests
  add constraint service_requests_intake_workflow_check
  check (
    intake_workflow is null
    or intake_workflow in ('INSTANT_BOOKING', 'B2B_PROPOSAL', 'B2G_SOW', 'MANUAL_REVIEW')
  );

create index if not exists idx_service_requests_channel_model_workflow
  on public.service_requests(official_channel, commercial_model, subchannel_code, intake_workflow, status);

comment on column public.service_requests.channel_type is
  'Legacy intake discriminator accepted at the API boundary: B2C, B2B_APT, B2B_RE, B2B, B2G. B2B2C is never a channel.';

comment on column public.service_requests.official_channel is
  'Canonical DANI customer channel: CH01 through CH05. This is separate from commercial_model.';

comment on column public.service_requests.commercial_model is
  'Commercial relationship/economic model: B2C, B2B, B2B2C, or B2G. B2B2C is metadata/relationship context, never a sixth channel.';

comment on column public.service_requests.subchannel_code is
  'Optional governed subchannel context. For verified community residents, CH01-B represents the resident experience within CH01.';

comment on column public.service_requests.intake_workflow is
  'Operational state-machine entry selected from the validated official channel.';

comment on column public.service_requests.routing_source is
  'explicit when supplied by the caller; category_fallback only for controlled legacy category mapping.';

comment on column public.service_requests.routing_reason is
  'Routing audit reason; unresolved or invalid commercial-model-as-channel input must not silently become CH01.';
