
create or replace function public.dd_sync_governed_offer_channel_counts()
returns trigger
language plpgsql
set search_path to 'public','pg_catalog'
as $$
declare
  affected_service_id uuid;
begin
  affected_service_id := coalesce(new.service_id, old.service_id);
  update public.dd_governed_service_offers o
  set channel_availability_count = (
        select count(*)
        from public.dd_service_channel_availability a
        where a.service_id = affected_service_id
          and a.eligibility_status = 'ACTIVE'
      ),
      updated_at = now()
  where o.runtime_service_id = affected_service_id;
  return coalesce(new,old);
end;
$$;

drop trigger if exists trg_dd_sync_governed_offer_channel_counts
on public.dd_service_channel_availability;

create trigger trg_dd_sync_governed_offer_channel_counts
after insert or update or delete on public.dd_service_channel_availability
for each row execute function public.dd_sync_governed_offer_channel_counts();

update public.dd_governed_service_offers o
set channel_availability_count = (
      select count(*)
      from public.dd_service_channel_availability a
      where a.service_id = o.runtime_service_id
        and a.eligibility_status = 'ACTIVE'
    ),
    updated_at = now()
where o.runtime_service_id is not null
  and o.channel_availability_count is distinct from (
      select count(*)
      from public.dd_service_channel_availability a
      where a.service_id = o.runtime_service_id
        and a.eligibility_status = 'ACTIVE'
    );
