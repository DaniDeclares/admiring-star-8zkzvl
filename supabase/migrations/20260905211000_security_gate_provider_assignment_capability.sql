create or replace function public.dd_validate_provider_assignment_capability()
returns trigger
language plpgsql
security definer
set search_path = public, private
as $$
declare
  request_service_id uuid;
  capability_ok boolean;
begin
  if new.assignment_status in ('OFFERED','ACCEPTED') then
    select sr.service_id
      into request_service_id
    from public.dd_jobs j
    left join public.service_requests sr on sr.id = j.service_request_id
    where j.id = new.job_id;

    if request_service_id is not null then
      select exists (
        select 1
        from public.dd_provider_capabilities pc
        where pc.provider_id = new.provider_id
          and pc.service_id = request_service_id
          and pc.is_authorized = true
      ) into capability_ok;

      if not capability_ok then
        raise exception 'PROVIDER_SERVICE_CAPABILITY_NOT_AUTHORIZED';
      end if;
    end if;
  end if;

  return new;
end;
$$;

drop trigger if exists dd_validate_provider_assignment_capability on public.dd_job_assignments;
create trigger dd_validate_provider_assignment_capability
before insert or update on public.dd_job_assignments
for each row execute function public.dd_validate_provider_assignment_capability();

comment on function public.dd_validate_provider_assignment_capability() is 'Defense-in-depth gate: provider assignments for service-linked jobs require an explicitly authorized provider capability for that service.';
