-- Preserve provider dispatch-origin/radius data staged before email confirmation.
create or replace function public.dd_provider_application_route_defaults()
returns trigger
language plpgsql
security definer
set search_path=public,pg_catalog
as $$
declare
  v_payload jsonb;
  v_radius numeric;
  v_zip text;
begin
  if new.applicant_user_id is null then
    return new;
  end if;

  select s.payload->'providerPayload'
    into v_payload
  from public.dd_provider_intake_staging s
  where s.auth_user_id=new.applicant_user_id
    and s.status='consumed'
    and s.kind='provider'
  order by s.consumed_at desc nulls last,s.created_at desc
  limit 1;

  if v_payload is null then
    return new;
  end if;

  if new.service_radius_miles is null then
    begin
      v_radius := nullif(v_payload->>'service_radius_miles','')::numeric;
    exception when others then
      v_radius := null;
    end;
    if v_radius is not null and v_radius > 0 and v_radius <= 250 then
      new.service_radius_miles := v_radius;
    end if;
  end if;

  if coalesce(array_length(new.service_zip_codes,1),0)=0 then
    select x into v_zip
    from jsonb_array_elements_text(coalesce(v_payload->'service_zip_codes','[]'::jsonb)) x
    where trim(x) <> ''
    limit 1;
    if v_zip is not null then
      new.service_zip_codes := array[v_zip];
    end if;
  end if;

  return new;
end;
$$;

drop trigger if exists trg_dd_provider_application_route_defaults on public.dd_provider_applications;
create trigger trg_dd_provider_application_route_defaults
before insert or update on public.dd_provider_applications
for each row execute function public.dd_provider_application_route_defaults();

comment on column public.dd_provider_applications.physical_address is
'Private provider dispatch-origin address used for eligibility, routing, travel/mileage economics and compliance. Not customer-facing.';
comment on column public.dd_provider_applications.service_radius_miles is
'Provider-declared normal service radius from physical_address/verified dispatch origin.';
