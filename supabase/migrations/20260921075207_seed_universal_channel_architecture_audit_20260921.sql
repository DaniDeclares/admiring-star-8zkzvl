
do $$
declare
  v_channel text; v_status text; v_current text; v_basis text; v_gap text; v_build text; v_proof text; v_pass_name text; v_stage text;
begin
  foreach v_channel in array ARRAY['CH01','CH02','CH03','CH04','CH05'] loop
    for i in 1..10 loop
      v_pass_name := case i when 1 then 'Market / Buyer' when 2 then 'Front Door / Relationship' when 3 then 'Service Discovery'
        when 4 then 'Intake / Scope' when 5 then 'Commercial Model' when 6 then 'Quote / Approval or Procurement Authorization'
        when 7 then 'Payment / Award → Job' when 8 then 'Operations / Dispatch / Worker' when 9 then 'QA / Evidence / Completion'
        else 'Closeout / Repeat / Renewal' end;
      v_stage := case when i<=2 then 'CUSTOMER' when i=3 then 'SERVICE' when i=4 then 'SCOPE'
        when i in (5,6) then 'COMMERCIAL' when i=7 then 'PAYMENT' when i=8 then 'FULFILLMENT'
        when i=9 then 'EXECUTION' else 'PROOF' end;
      v_status := case when v_channel='CH01' and i in (1,2,3,4,8,9,10) then 'RED'
        when v_channel='CH01' then 'YELLOW' when v_channel='CH02' and i<=7 then 'YELLOW'
        when v_channel in ('CH03','CH04','CH05') and i<=5 then 'YELLOW' else 'NOT_PROVEN' end;
      v_current := case v_channel when 'CH01' then 'Existing CH01 architecture is defined; runtime release blockers remain.'
        when 'CH02' then 'CH02 is the reference implementation; full worker/evidence proof remains open.'
        when 'CH03' then 'CH03 architecture is researched and defined; runtime channel implementation is not proven.'
        when 'CH04' then 'CH04 architecture is researched and defined; runtime channel implementation is not proven.'
        else 'CH05 procurement architecture is defined; procurement execution is not proven.' end;
      v_basis := case v_channel when 'CH01' then 'Existing CH01 audit + live CH01 governance tables.'
        when 'CH02' then 'DANI CH02 architecture source + live CH02 governance tables.'
        when 'CH03' then 'NAR transaction lifecycle and transaction-coordination research.'
        when 'CH04' then 'Housecall Pro, Jobber and ServiceChannel commercial FSM/facilities research.'
        else 'GSA, SBA and FAR procurement guidance.' end;
      v_gap := case when v_channel='CH01' then case i
        when 1 then 'Five front doors are not carried through resident acquisition/intake.'
        when 2 then 'Canonical CH01 service resolution is not deterministic.'
        when 3 then 'Service-specific CH01 inputs/evidence contracts are incomplete.'
        when 4 then 'CH01-B executable pricing and economic baselines are incomplete.'
        when 5 then 'Server-side commercial provenance is incomplete at intake.'
        when 6 then 'Checkout still relies on generic CH01 resolution.'
        when 7 then 'Paid-to-job/task/dispatch reconciliation is not fully proven.'
        when 8 then 'Worker capacity/coverage/assignment path is not proven for launch SKUs.'
        when 9 then 'CH01 task/evidence/QA completion contract is not proven.'
        else 'No complete resident transaction has passed release proof.' end
        when v_channel='CH02' then 'Representative CH02 transaction is not yet proven through the complete lifecycle.'
        when v_channel='CH03' then 'Channel-specific runtime contracts and release evidence are not implemented.'
        when v_channel='CH04' then 'Channel-specific account/location, commercial and release controls are not implemented.'
        else 'Solicitation-to-award-to-task-order execution and acceptance proof are not implemented as one channel.' end;
      v_build := case v_channel when 'CH01' then 'Execute the existing CH01 release blockers and then run an end-to-end resident smoke transaction.'
        when 'CH02' then 'Run a representative CH02 transaction through quote, approval, payment, job, dispatch, evidence and closeout.'
        when 'CH03' then 'Build CH03 strategy, routing, buyer authority, service adjudication, scope inputs, commercial controls and proof.'
        when 'CH04' then 'Build CH04 strategy, routing, account/location model, commercial controls, recurring/urgent rules and proof.'
        else 'Build CH05 procurement strategy, solicitation gates, contract/CLIN controls, task-order fulfillment, compliance and proof.' end;
      v_proof := case v_channel when 'CH01' then 'One released resident SKU completes acquisition → price → payment → job → tasks → assignment → appointment → evidence/QA → completion.'
        when 'CH02' then 'One CH02 solution family completes quote → approval → invoice/payment → job → tasks → assignment → appointment → evidence/QA → completion.'
        when 'CH03' then 'One representative listing/transaction service completes front door → quote/SOW → job → worker/evidence → closeout.'
        when 'CH04' then 'One representative business service completes authorization → job → dispatch → evidence → invoice → repeat/renewal.'
        else 'One representative opportunity progresses solicitation/response → award → line/task order → fulfillment → acceptance/evidence → invoice/closeout.' end;
      insert into public.dd_channel_architecture_10_pass
        (channel_code,pass_number,audit_round,pass_name,lifecycle_stage,status,current_state,architecture_decision,research_basis,blocking_gap,required_build,proof_gate)
      values
        (v_channel,i,case when i<=5 then 1 else 2 end,v_pass_name,v_stage,v_status,v_current,
         'Every channel uses the same 10-pass release kernel; the front-door, commercial and fulfillment implementation varies by channel.',
         v_basis,v_gap,v_build,v_proof)
      on conflict (channel_code,pass_number,audit_version) do update set
        audit_round=excluded.audit_round,pass_name=excluded.pass_name,lifecycle_stage=excluded.lifecycle_stage,status=excluded.status,
        current_state=excluded.current_state,architecture_decision=excluded.architecture_decision,research_basis=excluded.research_basis,
        blocking_gap=excluded.blocking_gap,required_build=excluded.required_build,proof_gate=excluded.proof_gate,updated_at=now();
    end loop;
  end loop;
end $$;
