
create or replace function private.dd_classify_platform_work(p_stage text,p_pass integer,p_gap text,p_build text)
returns table(work_type text,execution_mode text,owner_decision boolean)
language sql immutable set search_path='' as $$
select case when p_pass=10 then 'E2E_RELEASE_PROOF'
 when upper(coalesce(p_stage,'')) in ('FULFILLMENT','EXECUTION') or p_pass in(8,9) then 'FULFILLMENT_RUNTIME'
 when upper(coalesce(p_stage,'')) in ('PAYMENT','CHECKOUT') or p_pass in(6,7) then 'COMMERCIAL_RUNTIME'
 when upper(coalesce(p_stage,'')) in ('COMMERCIAL','SERVICE','SCOPE') or p_pass between 2 and 4 then 'GOVERNANCE_AND_CODE'
 else 'PORTAL_AND_WORKFLOW' end,
 case when p_pass in(7,8,9,10) then 'RUNTIME_PROOF'
 when lower(coalesce(p_gap,'')||' '||coalesce(p_build,'')) like '%owner decision%' then 'OWNER_DECISION'
 when p_pass in(1,2,3,4,5,6) then 'CODE_BUILD' else 'DETERMINISTIC_TEST' end,
 lower(coalesce(p_gap,'')||' '||coalesce(p_build,'')) like '%owner decision%' $$;
revoke all on function private.dd_classify_platform_work(text,integer,text,text) from public,anon,authenticated;
grant execute on function private.dd_classify_platform_work(text,integer,text,text) to service_role;

create or replace function public.dd_refresh_software_build_queue()
returns integer language plpgsql security definer set search_path='public','private' as $$
declare v_count int;
begin
 insert into public.dd_software_build_work_queue(audit_id,work_key,channel_code,pass_number,pass_name,lifecycle_stage,priority,source_status,work_type,execution_mode,status,blocking_gap,acceptance_criteria,required_build,owner_decision_required,updated_at)
 select a.id,a.channel_code||'-PASS-'||lpad(a.pass_number::text,2,'0'),a.channel_code,a.pass_number,a.pass_name,a.lifecycle_stage,a.priority,a.status,c.work_type,c.execution_mode,
 case when c.owner_decision then 'BLOCKED' else 'READY' end,a.blocking_gap,a.green_exit_criteria,a.required_build,c.owner_decision,now()
 from public.dd_platform_release_audit_10_pass a cross join lateral private.dd_classify_platform_work(a.lifecycle_stage,a.pass_number,a.blocking_gap,a.required_build)c
 where a.status<>'GREEN'
 on conflict(work_key) do update set audit_id=excluded.audit_id,source_status=excluded.source_status,priority=excluded.priority,blocking_gap=excluded.blocking_gap,
 acceptance_criteria=excluded.acceptance_criteria,required_build=excluded.required_build,work_type=excluded.work_type,execution_mode=excluded.execution_mode,
 owner_decision_required=excluded.owner_decision_required,status=case when excluded.owner_decision_required then 'BLOCKED'
 when dd_software_build_work_queue.status='PASSED' and excluded.source_status<>'GREEN' then 'VERIFYING'
 when dd_software_build_work_queue.status in('IN_PROGRESS','VERIFYING') then dd_software_build_work_queue.status else 'READY' end,updated_at=now();
 get diagnostics v_count=row_count;
 update public.dd_software_build_work_queue q set status='PASSED',last_result=jsonb_build_object('reason','authoritative platform audit is GREEN'),updated_at=now()
 from public.dd_platform_release_audit_10_pass a where q.audit_id=a.id and a.status='GREEN' and q.status<>'PASSED';
 return v_count;
end $$;
revoke all on function public.dd_refresh_software_build_queue() from public,anon,authenticated;
grant execute on function public.dd_refresh_software_build_queue() to service_role;
