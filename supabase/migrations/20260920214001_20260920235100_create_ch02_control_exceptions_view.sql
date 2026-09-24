
create or replace view public.dd_ch02_commercial_control_exceptions as
select
  a.id as adjudication_id,
  a.sku,
  a.service_name,
  a.source_service_family,
  a.proposed_front_door,
  a.disposition,
  a.customer_facing_role,
  a.rationale,
  a.source_basis
from public.dd_ch02_service_adjudication a
where a.channel_code='CH02'
  and a.disposition='FRONT_DOOR_CANDIDATE'
  and a.proposed_front_door='CROSS_CHANNEL_REVIEW';

revoke all on public.dd_ch02_commercial_control_exceptions from anon, authenticated;
grant select on public.dd_ch02_commercial_control_exceptions to service_role;
