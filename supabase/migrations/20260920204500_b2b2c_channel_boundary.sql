-- DANI DECLARES — Commercial Channel / B2B2C contract enforcement
-- B2B2C is a commercial relationship/economic model, never an official channel.
-- This migration is additive and prepares normalized request fields without
-- changing pricing or payment authority.

alter table public.service_requests
  add column if not exists official_channel text,
  add column if not exists commercial_model text,
  add column if not exists subchannel_code text;

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

create index if not exists idx_service_requests_official_channel_model
  on public.service_requests(official_channel, commercial_model, subchannel_code, status);

comment on column public.service_requests.official_channel is
  'Canonical DANI customer channel: CH01 through CH05. Separate from commercial_model.';

comment on column public.service_requests.commercial_model is
  'Commercial relationship/economic model: B2C, B2B, B2B2C, or B2G. B2B2C is never an official channel.';

comment on column public.service_requests.subchannel_code is
  'Optional governed subchannel. CH01-B represents the verified apartment/community resident experience within CH01.';
