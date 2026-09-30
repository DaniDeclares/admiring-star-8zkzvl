-- Compact missed polling intervals for read-only connector work instead of replaying every stale snapshot.
-- Lookback begins at original work generated_at. Delayed verified receipts recover BLOCKED or IN_PROGRESS work.
CREATE OR REPLACE FUNCTION public.dd_compact_read_only_external_backlog()
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'pg_catalog'
AS $function$
declare r record; v_keep uuid; v_earliest timestamptz; v_count int; v_cancelled int:=0; v_groups int:=0;
begin
 for r in
   select destination_system,action_type
   from public.dd_external_action_outbox
   where status='PENDING'
     and action_type in ('GMAIL_READ_CANONICAL_SALES_RECONCILE','FINANCE_READ_ECONOMICS_RECONCILE')
     and coalesce((payload->>'read_only')::boolean,false)=true
   group by destination_system,action_type having count(*)>1
 loop
   select id,created_at into v_keep,v_earliest
   from public.dd_external_action_outbox
   where destination_system=r.destination_system and action_type=r.action_type and status='PENDING'
   order by created_at desc,id desc limit 1;

   select min(coalesce((payload->'payload'->>'generated_at')::timestamptz,created_at)),count(*) into v_earliest,v_count
   from public.dd_external_action_outbox
   where destination_system=r.destination_system and action_type=r.action_type and status='PENDING';

   update public.dd_external_action_outbox
   set payload=coalesce(payload,'{}'::jsonb)||jsonb_build_object(
       'compacted_read_only_backlog',true,'lookback_start',v_earliest,'lookback_end',now(),
       'compacted_from_count',v_count,'compaction_rule','LATEST_READ_SUBSUMES_UNEXECUTED_SNAPSHOTS'),
       updated_at=now()
   where id=v_keep;

   with superseded as (
     update public.dd_external_action_outbox
     set status='CANCELLED_SUPERSEDED',
         last_error_code='SUPERSEDED_BY_COMPACTED_READ',
         last_error='Unexecuted read-only snapshot superseded by a newer consolidated read with explicit lookback window.',
         external_reference='superseded-by:'||v_keep::text,updated_at=now()
     where destination_system=r.destination_system and action_type=r.action_type and status='PENDING' and id<>v_keep
     returning authoritative_record_id
   )
   update public.dd_scheduled_operating_work w
   set status='CANCELLED',completed_at=now(),updated_at=now(),lease_expires_at=null,
       receipt=jsonb_build_object('status','SUPERSEDED','reason','READ_ONLY_BACKLOG_COMPACTION',
         'superseded_by_external_action_id',v_keep,'compacted_at',now(),'external_contact',false,'money_action',false)
   where w.id::text in (select authoritative_record_id from superseded)
     and w.status='IN_PROGRESS';

   get diagnostics v_cancelled=row_count;
   v_groups:=v_groups+1;
 end loop;
 return jsonb_build_object('status','COMPLETED','groups_compacted',v_groups,'scheduled_rows_cancelled_last_group',v_cancelled,
   'external_contact',false,'money_action',false,'production_mutation',false);
end $function$
;

CREATE OR REPLACE FUNCTION public.dd_dispatch_external_scheduled_operating_work(p_limit integer DEFAULT 20)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'pg_catalog'
AS $function$
declare r record; v_action uuid; v_dispatched int:=0; v_reconciled int:=0; v_seq bigint;
begin
 perform public.dd_compact_read_only_external_backlog();
 for r in
   select w.id,w.work_key,o.id action_id,o.external_reference
   from public.dd_scheduled_operating_work w
   join public.dd_external_action_outbox o on o.authoritative_table='dd_scheduled_operating_work' and o.authoritative_record_id=w.id::text
   where w.status in ('IN_PROGRESS','BLOCKED') and o.status='SUCCEEDED'
     and exists(select 1 from public.dd_external_action_receipts er where er.action_id=o.id and er.verified=true)
 loop
   update public.dd_scheduled_operating_work set status='COMPLETED',completed_at=now(),updated_at=now(),lease_expires_at=null,last_error=null,
     receipt=jsonb_build_object('consumer','EXTERNAL_ACTION_OUTBOX','action_id',r.action_id,'verified_external_receipt',true,
       'external_reference',r.external_reference,'completed_at',now()) where id=r.id;
   v_reconciled:=v_reconciled+1;
 end loop;

 for r in
   select * from public.dd_scheduled_operating_work
   where status='QUEUED' and work_type in ('EMAIL_LEAD_MINING','FINANCE_ECONOMICS_FUNDING_CLOSE')
     and coalesce(next_attempt_at,now())<=now()
   order by created_at limit greatest(coalesce(p_limit,20),1) for update skip locked
 loop
   perform pg_advisory_xact_lock(hashtext('DD_EXTERNAL_ACTION_OUTBOX_SEQUENCE'));
   select coalesce(max(sequence_no),0)+1 into v_seq from public.dd_external_action_outbox;
   insert into public.dd_external_action_outbox(
     correlation_id,action_key,action_type,destination_system,authoritative_table,authoritative_record_id,
     payload,payload_hash,idempotency_key,sequence_no,status,next_attempt_at
   ) values(
     r.id,'OPERATING_WORK:'||r.work_key,
     case r.work_type when 'EMAIL_LEAD_MINING' then 'GMAIL_READ_CANONICAL_SALES_RECONCILE' else 'FINANCE_READ_ECONOMICS_RECONCILE' end,
     case r.work_type when 'EMAIL_LEAD_MINING' then 'gmail' else 'finances' end,
     'dd_scheduled_operating_work',r.id::text,
     jsonb_build_object('work_key',r.work_key,'work_type',r.work_type,'authority',r.authority,'constraints',r.constraints,
       'payload',r.payload,'read_only',true,'external_contact',false,'money_action',false),
     md5(coalesce(r.payload::text,'{}')||coalesce(r.constraints::text,'{}')),
     'SCHEDULED_OPERATING_WORK:'||r.work_key,v_seq,'PENDING',now()
   ) on conflict(idempotency_key) do update set updated_at=now()
   returning id into v_action;
   update public.dd_scheduled_operating_work
   set status='IN_PROGRESS',lease_token=coalesce(lease_token,gen_random_uuid()),lease_owner='EXTERNAL_ACTION_OUTBOX',
       leased_at=coalesce(leased_at,now()),lease_expires_at=null,updated_at=now(),last_error=null,
       receipt=jsonb_build_object('dispatch_state','AWAITING_VERIFIED_EXTERNAL_RECEIPT','external_action_id',v_action,
         'dispatched_at',now(),'external_contact',false,'money_action',false)
   where id=r.id;
   v_dispatched:=v_dispatched+1;
 end loop;
 return jsonb_build_object('status','COMPLETED','dispatched',v_dispatched,'reconciled_verified',v_reconciled,
   'dispatch_is_completion',false,'external_contact',false,'money_action',false);
end
$function$
;

revoke execute on function public.dd_compact_read_only_external_backlog() from public,anon,authenticated;
grant execute on function public.dd_compact_read_only_external_backlog() to service_role;
revoke execute on function public.dd_dispatch_external_scheduled_operating_work(integer) from public,anon,authenticated;
grant execute on function public.dd_dispatch_external_scheduled_operating_work(integer) to service_role;
