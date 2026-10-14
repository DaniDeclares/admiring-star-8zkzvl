create or replace function public.dd_brain_trickle_down()
returns jsonb language plpgsql security definer set search_path to 'public' as $$
declare v_h int:=0; v_w int:=0;
begin
 insert into dd_brain_hypotheses(hypothesis_key,signal_key,entity_scope,hypothesis,expected_benefit,risks)
 select 'HYP:'||s.signal_key,s.signal_key,'DANI_DECLARES',s.statement,jsonb_build_object('objective','DANI_DURABLE_BUSINESS','requires_measurement',true),jsonb_build_array('unknown_demand','unknown_economics','unknown_governance','unknown_fulfillment')
 from dd_brain_signals s where s.status='NEW' and s.entity_scope='DANI_DECLARES' on conflict(hypothesis_key) do nothing;
 get diagnostics v_h=row_count;
 insert into dd_research_work_queue(program_key,work_key,question,required_evidence,priority,status,blocker,next_action,owner_decision_required,metadata)
 select 'RESEARCH_GOVERNANCE_INTELLIGENCE','BRAIN:'||h.hypothesis_key,'Test DANI hypothesis: '||h.hypothesis,'Current evidence, conflicts, applicable economics/compliance/fulfillment evidence, and falsification criteria.','P1','QUEUED','RESEARCH_REQUIRED','Research and reconcile evidence before governed implementation.',false,jsonb_build_object('brain_hypothesis_key',h.hypothesis_key,'entity_scope','DANI_DECLARES','required_passes',h.research_pass_target,'production_brain',true)
 from dd_brain_hypotheses h where h.status='PROPOSED'
 on conflict(work_key) do update set question=excluded.question,required_evidence=excluded.required_evidence,metadata=excluded.metadata,updated_at=now();
 get diagnostics v_w=row_count;
 update dd_brain_signals set status='ROUTED',updated_at=now() where status='NEW' and entity_scope='DANI_DECLARES';
 update dd_brain_hypotheses set status='RESEARCHING',updated_at=now() where status='PROPOSED' and entity_scope='DANI_DECLARES';
 return jsonb_build_object('status','COMPLETED','entity','DANI_DECLARES','hypotheses_created',v_h,'research_items_routed',v_w,'production_authority_granted',false);
end $$;
