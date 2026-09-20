-- Enforce CH02 adjudication integrity and reconcile the locked 175-record queue.
-- No source service, pricing, availability, or storefront state is changed.

alter table public.dd_ch02_service_adjudication
  add column if not exists source_master_record_id uuid;

update public.dd_ch02_service_adjudication a
set source_master_record_id = m.id
from public.dd_master_service_universe m
where m.canonical_sku = a.sku
  and m.service_name = a.service_name
  and a.source_master_record_id is null;

do $$
begin
  if exists (select 1 from public.dd_ch02_service_adjudication where source_master_record_id is null) then
    raise exception 'CH02 adjudication contains rows without a canonical master-service record';
  end if;
end
$$;

alter table public.dd_ch02_service_adjudication
  alter column source_master_record_id set not null;

alter table public.dd_ch02_service_adjudication
  add constraint dd_ch02_adjudication_source_master_fk
  foreign key (source_master_record_id)
  references public.dd_master_service_universe(id);

alter table public.dd_ch02_service_adjudication
  add constraint dd_ch02_adjudication_disposition_ck
  check (disposition in ('FRONT_DOOR_CANDIDATE','SUPPORTING_LAYER','CROSS_CHANNEL_REVIEW','HOLD'));

alter table public.dd_ch02_service_adjudication
  add constraint dd_ch02_adjudication_front_door_ck
  check (proposed_front_door in ('TURNOVER_MAKE_READY','PROPERTY_RESCUE_FIELD_DISPATCH','PROPERTY_CONDITION_DOCUMENTATION','OFFICE_OPERATIONS_RESCUE','SUPPORTING_LAYER','CROSS_CHANNEL_REVIEW'));

do $$
declare total_count integer; front_count integer; support_count integer; cross_count integer;
begin
  select count(*) into total_count from public.dd_ch02_service_adjudication where channel_code='CH02';
  select count(*) into front_count from public.dd_ch02_service_adjudication where channel_code='CH02' and disposition='FRONT_DOOR_CANDIDATE';
  select count(*) into support_count from public.dd_ch02_service_adjudication where channel_code='CH02' and disposition='SUPPORTING_LAYER';
  select count(*) into cross_count from public.dd_ch02_service_adjudication where channel_code='CH02' and disposition='CROSS_CHANNEL_REVIEW';

  if total_count <> 175 or front_count <> 76 or support_count <> 24 or cross_count <> 75 then
    raise exception 'CH02 reconciliation failed: expected 175/76/24/75, got %/%/%/%', total_count, front_count, support_count, cross_count;
  end if;
end
$$;

create index if not exists idx_dd_ch02_adjudication_source_master
  on public.dd_ch02_service_adjudication(source_master_record_id);
