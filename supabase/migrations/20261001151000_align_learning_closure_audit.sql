-- Keep learning-closure reporting aligned with its definition:
-- PROVEN lessons necessarily have enforcement and replay.
create or replace function public.dd_learning_closure_audit_v1()
returns jsonb language plpgsql security definer set search_path=public as $$
declare v_open int; v_enforced int; v_proven int; v_repeated int; v_rules int; v_replays int;
begin
 select count(*) filter(where status='OPEN'),
        count(*) filter(where status in ('ENFORCED','PROVEN')),
        count(*) filter(where status='PROVEN'),
        count(*) filter(where recurrence_count>1)
 into v_open,v_enforced,v_proven,v_repeated
 from public.dd_brain_learning_ledger;
 select count(*) into v_rules from public.dd_brain_learning_rules where active;
 select count(*) into v_replays from public.dd_brain_learning_replays where status='PASS';
 return jsonb_build_object('status','COMPLETED','open_lessons',v_open,'enforced_lessons',v_enforced,'proven_lessons',v_proven,'repeated_lessons',v_repeated,'active_rules',v_rules,'passed_replays',v_replays,'definition_of_learning','lesson_requires_enforcement_and_replay_before_proven');
end $$;