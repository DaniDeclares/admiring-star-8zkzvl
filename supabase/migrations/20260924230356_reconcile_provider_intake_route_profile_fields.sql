
alter table public.dd_provider_applications
  add column if not exists dispatch_latitude numeric,
  add column if not exists dispatch_longitude numeric,
  add column if not exists dispatch_location_verified_at timestamptz,
  add column if not exists willing_outside_radius boolean not null default false;

create or replace function public.dd_provider_application_route_defaults()
returns trigger
language plpgsql
security definer
set search_path=public,pg_catalog
as $$
declare
  v_payload jsonb;
  v_radius numeric;
  v_years numeric;
  v_zip text;
begin
  if new.applicant_user_id is null then return new; end if;
  select s.payload->'providerPayload' into v_payload
  from public.dd_provider_intake_staging s
  where s.auth_user_id=new.applicant_user_id and s.status='consumed' and s.kind='provider'
  order by s.consumed_at desc nulls last,s.created_at desc limit 1;
  if v_payload is null then return new; end if;

  if new.service_radius_miles is null then
    begin v_radius:=nullif(v_payload->>'service_radius_miles','')::numeric; exception when others then v_radius:=null; end;
    if v_radius is not null and v_radius>0 and v_radius<=250 then new.service_radius_miles:=v_radius; end if;
  end if;
  if coalesce(array_length(new.service_zip_codes,1),0)=0 then
    select x into v_zip from jsonb_array_elements_text(coalesce(v_payload->'service_zip_codes','[]'::jsonb)) x where trim(x)<>'' limit 1;
    if v_zip is not null then new.service_zip_codes:=array[v_zip]; end if;
  end if;
  if new.years_experience is null then
    begin v_years:=nullif(v_payload->>'years_experience','')::numeric; exception when others then v_years:=null; end;
    if v_years is not null and v_years>=0 then new.years_experience:=v_years; end if;
  end if;
  new.availability:=coalesce(nullif(new.availability,''),nullif(v_payload->>'availability',''));
  new.vehicle_equipment:=coalesce(nullif(new.vehicle_equipment,''),nullif(v_payload->>'vehicle_equipment',''));
  new.credential_summary:=coalesce(nullif(new.credential_summary,''),nullif(v_payload->>'credential_summary',''));
  if coalesce(v_payload->>'willing_outside_radius','')<>'' then
    begin new.willing_outside_radius:=(v_payload->>'willing_outside_radius')::boolean; exception when others then null; end;
  end if;
  return new;
end;
$$;
drop trigger if exists trg_dd_provider_application_route_defaults on public.dd_provider_applications;
create trigger trg_dd_provider_application_route_defaults before insert or update on public.dd_provider_applications
for each row execute function public.dd_provider_application_route_defaults();
