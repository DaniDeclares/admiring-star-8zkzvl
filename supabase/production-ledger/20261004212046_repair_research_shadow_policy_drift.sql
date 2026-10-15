create or replace function public.dd_run_research_synthesis_shadow()
returns jsonb
language plpgsql
set search_path to ''
as $function$
declare v_rows int:=0; v_proposals int:=0; v_policy_ok boolean:=false;
begin
 select (
   enabled=true and kill_switch=false and production_direct_write_allowed=true
   and auto_merge_allowed=true and permission_expansion_allowed=false
   and money_action_allowed=false and external_contact_allowed=false
   and allowed_actions ? 'record_evidence'
   and prohibited_actions ? 'move_money'
   and prohibited_actions ? 'send_customer_message'
   and prohibited_actions ? 'send_provider_message'
 ) into v_policy_ok
 from public.dd_production_automation_policy
 where policy_key='DANI_PRODUCTION_AUTOMATION_BOUNDARY';

 if coalesce(v_policy_ok,false)=false then
   raise exception 'PRODUCTION_SHADOW_POLICY_NOT_FAIL_CLOSED';
 end if;

 insert into public.dd_research_synthesis_shadow(
   synthesis_key,research_work_id,program_key,work_key,evidence_ids,evidence_count,
   confirmed_authority_levels,state,proposed_action_class,proposed_build,acceptance_criteria,
   disposition,blocker,observed_at,updated_at)
 select
   'PROD_SHADOW:'||r.work_key,r.id,r.program_key,r.work_key,
   array_agg(distinct e.id),count(distinct e.id)::int,array_agg(distinct e.authority_level),
   case when coalesce(r.metadata->>'proposed_build','')<>'' and
             coalesce(r.metadata->>'implementation_action_class','')<>'' and
             coalesce(r.metadata->>'acceptance_criteria',r.required_evidence,'')<>''
        then 'PROPOSAL_READY' else 'REVIEW_REQUIRED' end,
   nullif(upper(r.metadata->>'implementation_action_class'),''),
   nullif(r.metadata->>'proposed_build',''),
   coalesce(nullif(r.metadata->>'acceptance_criteria',''),r.required_evidence),
   'SHADOW_ONLY',
   case when coalesce(r.metadata->>'proposed_build','')='' then 'NO_TYPED_IMPLEMENTATION_DIRECTIVE'
        when coalesce(r.metadata->>'implementation_action_class','')='' then 'NO_ACTION_CLASS'
        else null end,
   now(),now()
 from public.dd_research_work_queue r
 join public.dd_research_evidence e on e.program_key=r.program_key and e.evidence_status='CONFIRMED'
 group by r.id,r.program_key,r.work_key
 on conflict(synthesis_key) do update set
   evidence_ids=excluded.evidence_ids,evidence_count=excluded.evidence_count,
   confirmed_authority_levels=excluded.confirmed_authority_levels,state=excluded.state,
   proposed_action_class=excluded.proposed_action_class,proposed_build=excluded.proposed_build,
   acceptance_criteria=excluded.acceptance_criteria,disposition='SHADOW_ONLY',blocker=excluded.blocker,
   updated_at=now();

 get diagnostics v_rows = row_count;
 select count(*) into v_proposals from public.dd_research_synthesis_shadow where disposition='SHADOW_ONLY' and state='PROPOSAL_READY';

 return jsonb_build_object(
   'status','COMPLETED','rows_upserted',v_rows,'proposal_ready',v_proposals,
   'schema_mutation_by_worker',false,'business_state_mutation',false,'money_action',false,'external_contact',false,'production_promotion',false);
end $function$;
