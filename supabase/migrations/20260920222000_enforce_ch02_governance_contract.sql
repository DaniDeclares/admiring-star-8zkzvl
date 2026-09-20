-- Enforce CH02 adjudication integrity and reconcile the locked 175-record queue.
-- This migration does not change source service, pricing, availability, or storefront state.

alter table public.dd_ch02_service_adjudication
  add column if not exists source_matrix_id uuid;

update public.dd_ch02_service_adjudication a
set source_matrix_id = m.id
from public.dd_master_service_capability_channel_matrix m
where m.channel_code = a.channel_code
  and m.sku = a.sku
  and a.source_matrix_id is null;

do $$
begin
  if exists (
    select 1
    from public.dd_ch02_service_adjudication
    where source_matrix_id is null
  ) then
    raise exception 'CH02 adjudication contains rows without a source matrix record';
  end if;
end
$$;

alter table public.dd_ch02_service_adjudication
  alter column source_matrix_id set not null;

alter table public.dd_ch02_service_adjudication
  add constraint dd_ch02_adjudication_source_matrix_fk
  foreign key (source_matrix_id)
  references public.dd_master_service_capability_channel_matrix(id);

alter table public.dd_ch02_service_adjudication
  add constraint dd_ch02_adjudication_disposition_ck
  check (disposition in ('FRONT_DOOR_CANDIDATE','SUPPORTING_LAYER','CROSS_CHANNEL_REVIEW','HOLD'));

alter table public.dd_ch02_service_adjudication
  add constraint dd_ch02_adjudication_front_door_ck
  check (
    proposed_front_door in (
      'TURNOVER_MAKE_READY',
      'PROPERTY_RESCUE_FIELD_DISPATCH',
      'PROPERTY_CONDITION_DOCUMENTATION',
      'OFFICE_OPERATIONS_RESCUE',
      'SUPPORTING_LAYER',
      'CROSS_CHANNEL_REVIEW'
    )
  );

alter table public.dd_ch02_service_adjudication
  add constraint dd_ch02_adjudication_disposition_alignment_ck
  check (
    (disposition = 'FRONT_DOOR_CANDIDATE' and proposed_front_door in (
      'TURNOVER_MAKE_READY',
      'PROPERTY_RESCUE_FIELD_DISPATCH',
      'PROPERTY_CONDITION_DOCUMENTATION',
      'OFFICE_OPERATIONS_RESCUE'
    ))
    or (disposition = 'SUPPORTING_LAYER' and proposed_front_door = 'SUPPORTING_LAYER')
    or (disposition = 'CROSS_CHANNEL_REVIEW' and proposed_front_door = 'CROSS_CHANNEL_REVIEW')
    or (disposition = 'HOLD')
  );

do $$
declare
  total_count integer;
  front_count integer;
  support_count integer;
  cross_count integer;
begin
  select count(*) into total_count
  from public.dd_ch02_service_adjudication
  where channel_code = 'CH02';

  select count(*) into front_count
  from public.dd_ch02_service_adjudication
  where channel_code = 'CH02'
    and disposition = 'FRONT_DOOR_CANDIDATE';

  select count(*) into support_count
  from public.dd_ch02_service_adjudication
  where channel_code = 'CH02'
    and disposition = 'SUPPORTING_LAYER';

  select count(*) into cross_count
  from public.dd_ch02_service_adjudication
  where channel_code = 'CH02'
    and disposition = 'CROSS_CHANNEL_REVIEW';

  if total_count <> 175
     or front_count <> 76
     or support_count <> 24
     or cross_count <> 75 then
    raise exception
      'CH02 reconciliation failed: expected 175 total / 76 front / 24 supporting / 75 cross; got % / % / % / %',
      total_count, front_count, support_count, cross_count;
  end if;
end
$$;

create index if not exists idx_dd_ch02_adjudication_source_matrix
  on public.dd_ch02_service_adjudication(source_matrix_id);
