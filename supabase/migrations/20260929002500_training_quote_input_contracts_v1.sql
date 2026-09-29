-- Normalize Division 09 training/workshop quote-input contracts.
-- Tester proof: 25 active training/workshop services -> 25 fields-ready, 0 missing.
-- No pricing, provider authority, payment, eligibility, or release-governance mutation.

update public.services
set quote_input_schema=jsonb_build_object(
  'version','2026-09-28-training-intake-v1',
  'ui_mode','CONFIGURED_QUOTE',
  'fields',jsonb_build_array(
    jsonb_build_object('key','participant_count','type','number','label','Participant count','required',true,'classification','SCOPE','min',1),
    jsonb_build_object('key','topic','type','text','label','Topic / focus','required',true,'classification','SCOPE'),
    jsonb_build_object('key','session_length','type','select','label','Session length','required',true,'classification','SCOPE','options',jsonb_build_array('60 minutes','90 minutes','2 hours','half day','full day')),
    jsonb_build_object('key','delivery_format','type','select','label','Delivery format','required',true,'classification','ROUTING','options',jsonb_build_array('virtual','in person'))
  ),
  'notes','Family-level workshop intake contract compiled from existing DANI training schemas. No price mutation; materials/custom delivery remain separately scoped.'
),
quote_engine_version='2026-09-28-training-intake-v1',
updated_at=now()
where is_active=true
  and service_family='Classes, Workshops & Training';

do $$
declare v_total int; v_fields int;
begin
  select count(*),count(*) filter(where quote_input_schema ? 'fields')
  into v_total,v_fields
  from public.services
  where is_active=true and service_family='Classes, Workshops & Training';
  if v_total<>v_fields then
    raise exception 'Training quote contract verification failed: %/% fields-ready',v_fields,v_total;
  end if;
end $$;
