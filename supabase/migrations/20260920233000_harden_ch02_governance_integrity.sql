-- Harden the existing CH02 governance contract without rewriting adjudication data.
-- The canonical-master relationship must resolve to exactly one active master record.
-- The two intentionally preserved cross-channel-review front-door candidates remain explicit exceptions.

do $$
begin
  if exists (
    select 1
    from public.dd_ch02_service_adjudication a
    left join public.dd_master_service_universe m
      on m.canonical_sku = a.sku
     and m.service_name = a.service_name
     and m.lifecycle_status = 'CANONICAL_ACTIVE'
    where a.channel_code = 'CH02'
    group by a.id, a.source_master_record_id
    having count(m.id) <> 1
       or max(m.id) is distinct from a.source_master_record_id
  ) then
    raise exception 'CH02 canonical master identity is ambiguous, missing, or does not match the recorded source_master_record_id';
  end if;
end
$$;

alter table public.dd_ch02_service_adjudication
  drop constraint if exists dd_ch02_adjudication_front_door_ck;

alter table public.dd_ch02_service_adjudication
  add constraint dd_ch02_adjudication_front_door_ck
  check (
    (
      disposition = 'FRONT_DOOR_CANDIDATE'
      and proposed_front_door in (
        'TURNOVER_MAKE_READY',
        'PROPERTY_RESCUE_FIELD_DISPATCH',
        'PROPERTY_CONDITION_DOCUMENTATION',
        'OFFICE_OPERATIONS_RESCUE'
      )
    )
    or (
      disposition = 'FRONT_DOOR_CANDIDATE'
      and proposed_front_door = 'CROSS_CHANNEL_REVIEW'
      and sku in ('DNI-01F-001','DNI-01G-001')
    )
    or (
      disposition <> 'FRONT_DOOR_CANDIDATE'
      and proposed_front_door in ('SUPPORTING_LAYER','CROSS_CHANNEL_REVIEW')
    )
  );

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
