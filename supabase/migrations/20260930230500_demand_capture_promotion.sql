alter table public.dd_demand_capture_staging
  add column if not exists signal_type text;

alter table public.dd_demand_capture_staging
  drop constraint if exists dd_demand_capture_staging_channel_check;

alter table public.dd_demand_capture_staging
  add constraint dd_demand_capture_staging_channel_check
  check (channel_code in ('CH01','CH03','CH04','CH05'));

create or replace function private.dd_promote_demand_capture_staging()
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  r record;
  v_sales_id uuid;
  v_count integer := 0;
begin
  for r in
    select *
    from public.dd_demand_capture_staging
    where promotion_status = 'READY'
      and verification_status = 'VERIFIED'
      and contact_permission in ('PUBLIC_CONTACT_ROUTE','CONSENTED')
      and channel_code in ('CH01','CH03','CH04','CH05')
      and (contact_name is not null or contact_email is not null or contact_phone is not null)
    order by observed_at
    for update skip locked
  loop
    select q.id into v_sales_id
    from public.dd_sales_queue q
    where (
      (r.contact_email is not null and lower(q.email)=lower(r.contact_email))
      or (r.contact_phone is not null and regexp_replace(q.phone,'\\D','','g')=regexp_replace(r.contact_phone,'\\D','','g'))
    )
    order by q.created_at
    limit 1;

    if v_sales_id is null then
      insert into public.dd_sales_queue (
        contact_name, company_name, email, phone, lane, source, source_confidence,
        disposition, notes, buyer_type, pain_point, solution_statement,
        next_action, trigger_type, timing_signal, front_door_code, front_door_notes,
        sales_metadata, campaign_eligible, lead_origin_class
      ) values (
        coalesce(r.contact_name,'Demand Capture Lead'),
        null,
        r.contact_email,
        r.contact_phone,
        case when coalesce(r.signal_type,'INBOUND')='INBOUND' then 'INBOUND' else 'COLD' end,
        'OWNED_DEMAND_CAPTURE:' || r.source_type,
        'VERIFIED',
        'NOT_CONTACTED',
        r.need_summary,
        case when r.channel_code='CH01' then 'RESIDENT'
             when r.channel_code='CH03' then 'PROPERTY_MANAGEMENT'
             when r.channel_code='CH04' then 'REAL_ESTATE'
             else 'BUSINESS' end,
        r.need_summary,
        r.service_hint,
        'OWNER_REVIEW_AND_ROUTE_DEMAND_CAPTURE',
        coalesce(r.signal_type,'DEMAND_SIGNAL'),
        r.urgency,
        r.channel_code || '_DEMAND_CAPTURE',
        'Promoted from governed demand-capture staging after source/contact verification.',
        jsonb_build_object(
          'demand_capture_id',r.id,
          'source_url',r.source_url,
          'source_signal_id',r.source_signal_id,
          'market',r.market,
          'observed_at',r.observed_at
        ),
        false,
        'OWNED_DEMAND'
      )
      returning id into v_sales_id;
      v_count := v_count + 1;
    end if;

    update public.dd_demand_capture_staging
      set promotion_status='PROMOTED',
          promoted_sales_queue_id=v_sales_id,
          updated_at=now()
    where id=r.id;
  end loop;

  return jsonb_build_object('promoted_count',v_count);
end;
$$;

revoke all on function private.dd_promote_demand_capture_staging() from public;
revoke all on function private.dd_promote_demand_capture_staging() from anon;
revoke all on function private.dd_promote_demand_capture_staging() from authenticated;
grant execute on function private.dd_promote_demand_capture_staging() to service_role;
