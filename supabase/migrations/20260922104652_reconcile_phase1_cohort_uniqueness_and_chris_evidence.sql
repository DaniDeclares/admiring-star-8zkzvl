
create unique index if not exists dd_launch_cohort_route_uq
on public.dd_launch_fulfillment_cohort(
  cohort_code,
  subject_type,
  coalesce(provider_id,'00000000-0000-0000-0000-000000000000'::uuid),
  service_id,
  capability_key
);

update public.dd_launch_fulfillment_cohort c
set evidence_status='OWNER_CONFIRMED',
    evidence_note='Chris: Printer/Scanner Setup confirmed by owner and matched to the existing production provider authorization.',
    updated_at=now()
where c.cohort_code='PHASE1_2026Q3'
  and c.subject_type='PROVIDER'
  and c.provider_id=(
    select p.id from public.dd_providers p
    where p.first_name='Christopher' and p.last_name='Walker'
    order by p.created_at asc limit 1
  )
  and c.service_id=(
    select s.id from public.services s where s.sku='DNI-06A-018' limit 1
  );
