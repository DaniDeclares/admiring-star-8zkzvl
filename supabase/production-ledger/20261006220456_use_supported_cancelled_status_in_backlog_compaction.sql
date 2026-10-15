
create or replace function public.dd_compact_read_only_external_backlog()
returns jsonb
language plpgsql
security definer
set search_path to 'public','pg_catalog'
as $function$
declare
  r record;
  v_keep uuid;
  v_earliest timestamptz;
  v_count int;
  v_cancelled int:=0;
  v_groups int:=0;
begin
  for r in
    select destination_system,action_type
    from public.dd_external_action_outbox
    where status='PENDING'
      and action_type in ('GMAIL_READ_CANONICAL_SALES_RECONCILE','FINANCE_READ_ECONOMICS_RECONCILE')
      and coalesce((payload->>'read_only')::boolean,false)=true
    group by destination_system,action_type
    having count(*)>1
  loop
    select id,created_at into v_keep,v_earliest
    from public.dd_external_action_outbox
    where destination_system=r.destination_system
      and action_type=r.action_type
      and status='PENDING'
    order by created_at desc,id desc
    limit 1;

    select min(coalesce((payload->'payload'->>'generated_at')::timestamptz,created_at)),count(*)
      into v_earliest,v_count
    from public.dd_external_action_outbox
    where destination_system=r.destination_system
      and action_type=r.action_type
      and status='PENDING';

    update public.dd_external_action_outbox
    set payload=coalesce(payload,'{}'::jsonb)||jsonb_build_object(
          'compacted_read_only_backlog',true,
          'lookback_start',v_earliest,
          'lookback_end',now(),
          'compacted_from_count',v_count,
          'compaction_rule','LATEST_READ_SUBSUMES_UNEXECUTED_SNAPSHOTS'
        ),
        updated_at=now()
    where id=v_keep;

    with superseded as (
      update public.dd_external_action_outbox
      set status='CANCELLED',
          last_error_code='SUPERSEDED_BY_COMPACTED_READ',
          last_error='Unexecuted read-only snapshot superseded by a newer consolidated read with explicit lookback window.',
          external_reference='superseded-by:'||v_keep::text,
          updated_at=now()
      where destination_system=r.destination_system
        and action_type=r.action_type
        and status='PENDING'
        and id<>v_keep
      returning authoritative_record_id
    )
    update public.dd_scheduled_operating_work w
    set status='CANCELLED',
        updated_at=now(),
        payload=coalesce(payload,'{}'::jsonb)||jsonb_build_object(
          'completion_state','SUPERSEDED',
          'reason','READ_ONLY_BACKLOG_COMPACTION',
          'superseded_by_external_action_id',v_keep,
          'compacted_at',now(),
          'external_contact',false,
          'money_action',false
        )
    where w.id::text in (select authoritative_record_id from superseded)
      and w.status='IN_PROGRESS';

    get diagnostics v_cancelled=row_count;
    v_groups:=v_groups+1;
  end loop;

  return jsonb_build_object(
    'status','COMPLETED',
    'groups_compacted',v_groups,
    'scheduled_rows_cancelled_last_group',v_cancelled,
    'external_contact',false,
    'money_action',false,
    'production_mutation',false
  );
end
$function$;

revoke execute on function public.dd_compact_read_only_external_backlog() from public,anon,authenticated;
grant execute on function public.dd_compact_read_only_external_backlog() to service_role;
