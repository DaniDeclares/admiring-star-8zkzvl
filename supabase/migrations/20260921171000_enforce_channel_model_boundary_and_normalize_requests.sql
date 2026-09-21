begin;

alter table public.service_requests
  add column if not exists channel_type text,
  add column if not exists official_channel text,
  add column if not exists commercial_model text,
  add column if not exists subchannel_code text;

alter table public.service_requests
  drop constraint if exists service_requests_channel_type_check;
alter table public.service_requests
  add constraint service_requests_channel_type_check
  check (channel_type is null or channel_type in ('B2C','B2B_APT','B2B_RE','B2B','B2G'));

alter table public.service_requests
  drop constraint if exists service_requests_official_channel_check;
alter table public.service_requests
  add constraint service_requests_official_channel_check
  check (official_channel is null or official_channel in ('CH01','CH02','CH03','CH04','CH05'));

alter table public.service_requests
  drop constraint if exists service_requests_commercial_model_check;
alter table public.service_requests
  add constraint service_requests_commercial_model_check
  check (commercial_model is null or commercial_model in ('B2C','B2B','B2B2C','B2G'));

create index if not exists idx_service_requests_official_channel_model
  on public.service_requests(official_channel, commercial_model, subchannel_code, status);

update public.service_requests
set
  channel_type = coalesce(channel_type, nullif(property_details->'operationsRouting'->>'channel','')),
  official_channel = coalesce(
    official_channel,
    case property_details->'operationsRouting'->>'channel'
      when 'B2C' then 'CH01'
      when 'B2B_APT' then 'CH02'
      when 'B2B_RE' then 'CH03'
      when 'B2B' then 'CH04'
      when 'B2G' then 'CH05'
      else null
    end
  ),
  commercial_model = coalesce(commercial_model, nullif(property_details->'operationsRouting'->>'commercialModel','')),
  subchannel_code = coalesce(subchannel_code, nullif(property_details->'operationsRouting'->>'subchannelCode',''));

comment on column public.service_requests.channel_type is 'Intake relationship discriminator: B2C, B2B_APT, B2B_RE, B2B, or B2G. B2B2C is a commercial model, never a channel.';
comment on column public.service_requests.official_channel is 'Canonical DANI customer channel: CH01 through CH05.';
comment on column public.service_requests.commercial_model is 'Commercial relationship/economic model: B2C, B2B, B2B2C, or B2G.';
comment on column public.service_requests.subchannel_code is 'Optional governed subchannel; CH01-B represents verified apartment/community residents within CH01.';

commit;