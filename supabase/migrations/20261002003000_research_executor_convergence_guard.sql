-- Make research execution converge.
-- Before: dd_execute_research_work_v1 re-triggered every RESEARCHING item every 2h with no ceiling (Tester
-- items reached thousands of attempts). A trigger only re-fetches a watched source, so nothing ever reached a
-- terminal state and the queue grew without a consumer.
-- After: a row cannot stay RESEARCHING once it has been triggered 12 times. It moves to EVIDENCE_READY when
-- linked evidence exists, else BLOCKED/NO_CONVERGENCE_MAX_TRIGGERS. Enforced on the table so every writer,
-- not only the executor, is bound by it. Existing over-limit rows are settled once at the end.
create or replace function public.dd_research_convergence_guard()
returns trigger
language plpgsql
set search_path to 'public'
as $function$
declare v_max_triggers constant int:=12; v_evidence int;
begin
  if new.status<>'RESEARCHING' or coalesce(new.attempts,0)<v_max_triggers then
    return new;
  end if;
  select count(*) into v_evidence from public.dd_research_evidence e where e.metadata->>'work_key'=new.work_key;
  new.status:=case when v_evidence>0 then 'EVIDENCE_READY' else 'BLOCKED' end;
  new.blocker:=case when v_evidence>0 then null else 'NO_CONVERGENCE_MAX_TRIGGERS' end;
  new.next_action:=case when v_evidence>0
    then 'Linked evidence exists; synthesize and review instead of re-triggering the source watcher.'
    else 'Stopped after '||new.attempts||' engine triggers with no linked evidence. Re-queue only after a new source or a narrower question is defined.' end;
  new.metadata:=coalesce(new.metadata,'{}'::jsonb)||jsonb_build_object('convergence_guard_at',now(),'attempts_at_guard',new.attempts,
    'linked_evidence_count',v_evidence,'max_triggers',v_max_triggers,'convergence_guard','dd_research_convergence_guard');
  new.updated_at:=now();
  return new;
end $function$;

revoke execute on function public.dd_research_convergence_guard() from public,anon,authenticated;

drop trigger if exists trg_dd_research_convergence_guard on public.dd_research_work_queue;
create trigger trg_dd_research_convergence_guard
  before insert or update of status, attempts on public.dd_research_work_queue
  for each row execute function public.dd_research_convergence_guard();

-- Settle rows that are already over the limit; the trigger above does the classification.
update public.dd_research_work_queue set attempts=attempts
where status='RESEARCHING' and coalesce(attempts,0)>=12;

-- Regression checks (fail the migration if the loop can come back):
-- 1. No row may remain RESEARCHING at or above the trigger ceiling.
-- 2. A write that would re-trigger an over-limit row is converted to a terminal state.
do $check$
declare v_left int; v_status text; v_blocker text;
begin
  select count(*) into v_left from public.dd_research_work_queue where status='RESEARCHING' and coalesce(attempts,0)>=12;
  if v_left>0 then
    raise exception 'convergence guard regression: % RESEARCHING rows at or above 12 attempts', v_left;
  end if;

  begin
    insert into public.dd_research_work_queue(program_key,work_key,question,required_evidence,priority,status,attempts)
    select p.program_key,'CONVERGENCE_GUARD_SELFTEST:'||gen_random_uuid(),'self-test','none','P1','RESEARCHING',12
    from public.dd_research_programs p order by p.program_key limit 1
    returning status,blocker into v_status,v_blocker;
    raise exception using errcode='P0001', message='selftest_rollback', detail=v_status||'|'||coalesce(v_blocker,'');
  exception when sqlstate 'P0001' then
    get stacked diagnostics v_blocker = pg_exception_detail;
    if sqlerrm<>'selftest_rollback' then raise; end if;
    if v_blocker<>'BLOCKED|NO_CONVERGENCE_MAX_TRIGGERS' then
      raise exception 'convergence guard regression: over-limit RESEARCHING insert became %', v_blocker;
    end if;
  end;
end $check$;
