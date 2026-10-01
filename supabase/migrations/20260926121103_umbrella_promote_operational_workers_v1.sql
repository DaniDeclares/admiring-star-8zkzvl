CREATE OR REPLACE FUNCTION public.dd_refresh_evidence_freshness()
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare v_stale int:=0;
begin
 update dd_research_evidence_registry set status='STALE',updated_at=now()
 where status='CURRENT' and next_review_at is not null and next_review_at<now();
 get diagnostics v_stale=row_count;
 return jsonb_build_object('marked_stale',v_stale);
end $function$
;
CREATE OR REPLACE FUNCTION public.dd_refresh_pricing_coverage()
 RETURNS integer
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare n int;
begin
 update dd_service_pricing_research_queue q set
  division=m.division,
  channel_scope=scoped.scope,
  coverage_status=case when scoped.scope is null or array_length(scoped.scope,1) is null
                       then 'MISSING_CHANNEL_SCOPE'
                       else 'SCOPED' end,
  updated_at=now()
 from dd_master_service_universe m
 cross join lateral (
   select array_remove(array[
    case when coalesce(m.ch01_rule,'')<>'' then 'CH01' end,case when coalesce(m.ch02_rule,'')<>'' then 'CH02' end,
    case when coalesce(m.ch03_rule,'')<>'' then 'CH03' end,case when coalesce(m.ch04_rule,'')<>'' then 'CH04' end,
    case when coalesce(m.ch05_rule,'')<>'' then 'CH05' end,case when coalesce(m.ch06_rule,'')<>'' then 'CH06' end],null) as scope
 ) scoped
 where m.canonical_sku=q.canonical_sku;
 get diagnostics n=row_count;

 insert into dd_pricing_coverage_snapshots(snapshot_date,division,channel_code,service_count,evidence_ready_count,economics_ready_count,review_ready_count)
 select current_date,q.division,ch,count(*),
   count(*) filter(where q.evidence_count>=q.evidence_target),
   count(*) filter(where q.economics_ready),
   count(*) filter(where q.research_status='REVIEW_READY')
 from dd_service_pricing_research_queue q cross join lateral unnest(q.channel_scope) ch
 where q.division is not null group by q.division,ch
 on conflict(snapshot_date,division,channel_code) do update set service_count=excluded.service_count,evidence_ready_count=excluded.evidence_ready_count,economics_ready_count=excluded.economics_ready_count,review_ready_count=excluded.review_ready_count,created_at=now();
 return n;
end $function$
;
CREATE OR REPLACE FUNCTION public.dd_refresh_pricing_research_economics(p_service_id uuid DEFAULT NULL::uuid)
 RETURNS integer
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
declare n integer;
begin
  update public.dd_service_pricing_research_queue q
  set modeled_direct_cost_cents = round((coalesce(b.estimated_duration_hours,0)*coalesce(b.labor_rate,0)
                                  +coalesce(b.materials_cost,0)+coalesce(b.travel_cost,0)+coalesce(b.other_direct_cost,0))*100)::int,
      minimum_viable_price_cents = case when b.runtime_service_id is null then null else
        ceil(((coalesce(b.estimated_duration_hours,0)*coalesce(b.labor_rate,0)
               +coalesce(b.materials_cost,0)+coalesce(b.travel_cost,0)+coalesce(b.other_direct_cost,0))/0.60)*100)::int end,
      economics_ready = b.runtime_service_id is not null and b.evidence_status in ('AUDITED','VERIFIED','GOVERNED'),
      economics_evidence_status = b.evidence_status,
      expected_contribution_cents = case when q.current_price_cents is null or b.runtime_service_id is null then null else
        q.current_price_cents-round((coalesce(b.estimated_duration_hours,0)*coalesce(b.labor_rate,0)
          +coalesce(b.materials_cost,0)+coalesce(b.travel_cost,0)+coalesce(b.other_direct_cost,0))*100)::int end,
      expected_margin_percent = case when coalesce(q.current_price_cents,0)<=0 or b.runtime_service_id is null then null else
        round(((q.current_price_cents-round((coalesce(b.estimated_duration_hours,0)*coalesce(b.labor_rate,0)
          +coalesce(b.materials_cost,0)+coalesce(b.travel_cost,0)+coalesce(b.other_direct_cost,0))*100)::int)::numeric/q.current_price_cents)*100,2) end,
      research_status = case
        when q.research_status='BLOCKED' then 'BLOCKED'
        when b.runtime_service_id is not null and b.evidence_status in ('AUDITED','VERIFIED','GOVERNED') and q.evidence_count>=q.evidence_target then 'REVIEW_READY'
        when b.runtime_service_id is not null and b.evidence_status in ('AUDITED','VERIFIED','GOVERNED') then 'ECONOMICS_READY'
        when q.evidence_count>=q.evidence_target then 'EVIDENCE_READY'
        when q.evidence_count>0 then 'RESEARCHING'
        else 'QUEUED' end,
      updated_at=now()
  from public.dd_service_economic_baselines b
  where b.runtime_service_id=q.service_id and (p_service_id is null or q.service_id=p_service_id);
  get diagnostics n=row_count;
  return n;
end $function$
;
CREATE OR REPLACE FUNCTION public.dd_promote_verified_research_leads()
 RETURNS integer
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
declare v_count int:=0; r record; v_sales uuid;
begin
 for r in
   select * from dd_research_leads
   where verification_status in ('VERIFIED','CONFIRMED')
     and coalesce(promotion_status,'') not in ('PROMOTED','REJECTED')
     and promoted_sales_queue_id is null
     and (verified_email is not null or verified_phone is not null or verified_website is not null)
 loop
   insert into dd_sales_queue(contact_name,company_name,phone,email,lane,source,source_confidence,disposition,next_action,notes,buyer_type,
      sales_metadata,lead_origin_class,intent_score,intent_tier,campaign_eligible,campaign_status,do_not_contact)
   values(coalesce(r.verified_company_name,r.company_name),coalesce(r.verified_company_name,r.company_name),r.verified_phone,r.verified_email,
      coalesce(r.channel_code,'CH05'),'RESEARCH_ENGINE','VERIFIED','NEW','Review qualified lead',
      concat_ws(' | ',r.research_profile,r.market,r.address),case when r.channel_code='CH03' then 'PROPERTY_MANAGEMENT' when r.channel_code='CH04' then 'REAL_ESTATE' when r.channel_code='CH06' then 'GOVERNMENT' else 'BUSINESS' end,
      jsonb_build_object('research_lead_id',r.id,'verification_source_url',r.verification_source_url,'verification_evidence',r.verification_evidence),
      'RESEARCH',case when r.research_priority='HIGH' then 80 when r.research_priority='MEDIUM' then 60 else 40 end,
      case when r.research_priority='HIGH' then 'HOT' when r.research_priority='MEDIUM' then 'WARM' else 'NURTURE' end,
      false,'SUPPRESSED_PENDING_CONSENT',false)
   returning id into v_sales;
   update dd_research_leads set promotion_status='PROMOTED',promoted_sales_queue_id=v_sales,promoted_at=now(),updated_at=now() where id=r.id;
   v_count:=v_count+1;
 end loop;
 return v_count;
end $function$
;
CREATE OR REPLACE FUNCTION public.dd_rollup_support_signals()
 RETURNS integer
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare n int:=0;
begin
 insert into dd_support_signal_rollups(signal_date,signal_type,canonical_sku,division,category,occurrence_count,target_domain,status,evidence)
 select current_date,'CASE_PATTERN',canonical_sku,division,category,count(*),
   case when category in ('QUALITY','INCOMPLETE_WORK','NO_SHOW') then 'OPERATIONS_PROVIDER_QA'
        when category in ('SCOPE','ADD_ON_REQUEST') then 'COMMERCIAL_INTELLIGENCE'
        when category in ('PRICE_QUESTION','PAYMENT_DISPUTE') then 'PRICING_FINANCE'
        when category in ('PORTAL_TECHNICAL','LOGIN') then 'SOFTWARE'
        else 'SUPPORT_OPERATIONS' end,
   case when count(*)>=3 then 'RESEARCH' else 'OBSERVE' end,
   jsonb_build_object('window_days',30,'auto_change_authority',false)
 from dd_support_cases where created_at>=now()-interval '30 days'
 group by canonical_sku,division,category
 on conflict(signal_date,signal_type,canonical_sku,division,category) do update set occurrence_count=excluded.occurrence_count,target_domain=excluded.target_domain,status=excluded.status,evidence=excluded.evidence;
 get diagnostics n=row_count; return n;
end $function$
;
CREATE OR REPLACE FUNCTION public.dd_run_provider_onboarding_coordinator()
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare
 rid uuid:=gen_random_uuid();
 a record;
 b jsonb;
 req jsonb;
 miss jsonb;
 ready int:=0;
 blocked int:=0;
 scanned int:=0;
begin
 insert into public.dd_provider_onboarding_worker_runs(id) values(rid);

 for a in
   select * from public.dd_provider_applications
   where application_status in ('DRAFT','SUBMITTED','UNDER_REVIEW','NEEDS_INFO','APPROVED')
 loop
   scanned:=scanned+1;
   b:='[]'::jsonb;
   req:='[]'::jsonb;
   miss:='[]'::jsonb;

   req:=req||jsonb_build_array('W9','GOVERNMENT_ID','AGREEMENT');

   if coalesce(a.insurance_status,'NOT_REQUIRED')<>'NOT_REQUIRED' then
     req:=req||jsonb_build_array('COI_OR_REQUIRED_INSURANCE');
   end if;

   if a.applicant_type='BUSINESS' then
     req:=req||jsonb_build_array('PROVIDER_PRICE_SHEET');
   end if;

   if coalesce(a.tax_form_status,'PENDING')<>'VERIFIED' then
     b:=b||jsonb_build_array('W9_NOT_VERIFIED');
     miss:=miss||jsonb_build_array('W9');
   end if;

   if coalesce(a.identity_status,'PENDING')<>'VERIFIED' then
     b:=b||jsonb_build_array('IDENTITY_NOT_VERIFIED');
     miss:=miss||jsonb_build_array('GOVERNMENT_ID');
   end if;

   if coalesce(a.agreement_status,'PENDING')<>'EXECUTED' then
     b:=b||jsonb_build_array('AGREEMENT_NOT_EXECUTED');
     miss:=miss||jsonb_build_array('AGREEMENT');
   end if;

   if coalesce(a.insurance_status,'NOT_REQUIRED') not in ('VERIFIED','NOT_REQUIRED') then
     b:=b||jsonb_build_array('INSURANCE_NOT_VERIFIED');
     miss:=miss||jsonb_build_array('COI_OR_REQUIRED_INSURANCE');
   end if;

   if coalesce(a.background_check_status,'NOT_STARTED') not in ('CLEARED','NOT_REQUIRED') then
     b:=b||jsonb_build_array('BACKGROUND_CHECK_NOT_CLEARED');
   end if;

   if coalesce(a.compliance_status,'PENDING')<>'VERIFIED' then
     b:=b||jsonb_build_array('COMPLIANCE_NOT_VERIFIED');
   end if;

   if a.applicant_type='BUSINESS' and not exists(
     select 1 from public.dd_provider_application_documents d
     where d.application_id=a.id
       and d.document_type='PROVIDER_PRICE_SHEET'
       and d.verification_status not in ('REJECTED','EXPIRED')
   ) then
     b:=b||jsonb_build_array('BUSINESS_PRICE_SHEET_REQUIRED');
     miss:=miss||jsonb_build_array('PROVIDER_PRICE_SHEET');
   end if;

   if not exists(
     select 1 from public.dd_provider_application_capabilities c
     where c.application_id=a.id and c.canonical_service_id is not null
   ) then
     b:=b||jsonb_build_array('NO_CANONICAL_CAPABILITIES_SELECTED');
   end if;

   if exists(
     select 1 from public.dd_provider_application_documents d
     where d.application_id=a.id
       and d.verification_status in ('PENDING','REJECTED','EXPIRED')
   ) then
     b:=b||jsonb_build_array('APPLICATION_DOCUMENT_REVIEW_REQUIRED');
   end if;

   if jsonb_array_length(b)=0 then
     ready:=ready+1;
   else
     blocked:=blocked+1;
   end if;

   insert into public.dd_provider_onboarding_work_queue(
     application_id,provider_id,readiness_status,blockers,required_documents,missing_documents,next_action,last_evaluated_at,metadata
   )
   values(
     a.id,a.provider_id,
     case
       when a.application_status='APPROVED' then 'APPROVED'
       when jsonb_array_length(b)=0 then 'READY_FOR_APPROVAL'
       else 'BLOCKED'
     end,
     b,req,miss,
     case
       when a.application_status='APPROVED' then 'NONE'
       when jsonb_array_length(b)=0 then 'REVIEW_AND_APPROVE_PROVIDER_APPLICATION'
       else 'RESOLVE_ONBOARDING_BLOCKERS'
     end,
     now(),
     jsonb_build_object('application_status',a.application_status,'worker','PROVIDER_ONBOARDING_COORDINATOR','external_contact',false)
   )
   on conflict(application_id) do update
   set provider_id=excluded.provider_id,
       readiness_status=excluded.readiness_status,
       blockers=excluded.blockers,
       required_documents=excluded.required_documents,
       missing_documents=excluded.missing_documents,
       next_action=excluded.next_action,
       last_evaluated_at=now(),
       metadata=excluded.metadata;
 end loop;

 update public.dd_provider_onboarding_worker_runs
 set completed_at=now(),
     status='COMPLETED',
     applications_scanned=scanned,
     ready_count=ready,
     blocked_count=blocked,
     evidence=jsonb_build_object('external_contact',false,'auto_approval',false,'authority','dd_approve_provider_application')
 where id=rid;

 return rid;
end $function$
;
CREATE OR REPLACE FUNCTION public.dd_reconcile_provider_requirement_research_candidates()
 RETURNS integer
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare n integer:=0;
begin
 insert into public.dd_provider_requirement_research_candidates(evidence_id,target_requirement_code,jurisdiction,candidate_status,rationale,owner_approval_required)
 select e.id,
   case
    when e.claim_key like 'WATCH_IRS_IC_FORMS_TAX_w9_requirement%' then 'TAX_W9'
    when e.claim_key like 'WATCH_FTC_BACKGROUND_CHECKS_%' then 'BACKGROUND_CONSENT'
    when e.claim_key like 'WATCH_GA_SOS_LICENSING_BOARDS_%' or e.claim_key like 'WATCH_SC_LLR_PROFESSIONS_%' then 'LICENSE_SERVICE'
   end,
   case when e.claim_key like 'WATCH_GA_%' then 'GA' when e.claim_key like 'WATCH_SC_%' then 'SC' else null end,
   'REVIEW_REQUIRED',
   'Research evidence candidate only. Validate applicability by provider type, service and jurisdiction before changing governed requirements.',
   true
 from public.dd_research_evidence e
 where e.evidence_status='CONFIRMED'
   and e.authority_level in ('PRIMARY','REGULATOR')
   and (e.claim_key like 'WATCH_IRS_IC_FORMS_TAX_w9_requirement%'
     or e.claim_key like 'WATCH_FTC_BACKGROUND_CHECKS_%'
     or e.claim_key like 'WATCH_GA_SOS_LICENSING_BOARDS_%'
     or e.claim_key like 'WATCH_SC_LLR_PROFESSIONS_%')
 on conflict(evidence_id,target_requirement_code,jurisdiction) do update
 set updated_at=now(),rationale=excluded.rationale
 where dd_provider_requirement_research_candidates.candidate_status not in ('APPROVED_FOR_GOVERNANCE','REJECTED');
 get diagnostics n=row_count;
 return n;
end $function$
;
CREATE OR REPLACE FUNCTION public.dd_run_research_pipeline_controller()
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'private'
AS $function$
declare v_id uuid:=gen_random_uuid(); v_pricing int:=0; v_coverage int:=0; v_leads int:=0; v_channel int:=0; v_support int:=0; v_fulfillment int:=0; v_activation int:=0; v_triggered boolean:=false;
begin
 insert into public.dd_research_pipeline_runs(id,status) values(v_id,'STARTED');
 select public.dd_refresh_pricing_research_economics(null) into v_pricing;
 select public.dd_refresh_pricing_coverage() into v_coverage;
 perform public.dd_refresh_evidence_freshness();

 update public.dd_research_work_queue q set status='GREEN',blocker=null,next_action='Satisfied automatically from current governed channel authorization evidence.',last_researched_at=now(),attempts=coalesce(attempts,0)+1,metadata=coalesce(metadata,'{}'::jsonb)||jsonb_build_object('auto_resolution','CHANNEL_AUTHORIZATION','resolved_at',now(),'authority','dd_service_release_contract_v1'),updated_at=now()
 from public.dd_service_release_contract_v1 r where q.program_key='SERVICE_DISCOVERY' and q.blocker='CHANNEL_AUTHORITY_MISSING' and q.status<>'GREEN' and q.metadata->>'canonical_sku'=r.canonical_sku and r.channel_authorization_ok is true;
 get diagnostics v_channel=row_count;

 update public.dd_research_work_queue q set status='GREEN',blocker=null,next_action='Satisfied automatically from governed service support-readiness evidence.',last_researched_at=now(),attempts=coalesce(attempts,0)+1,metadata=coalesce(metadata,'{}'::jsonb)||jsonb_build_object('auto_resolution','SUPPORT_READINESS','resolved_at',now(),'authority','dd_service_support_readiness'),updated_at=now()
 from public.dd_service_support_readiness s where q.program_key='SERVICE_DISCOVERY' and q.blocker='SUPPORT_RECOVERY_INCOMPLETE' and q.status<>'GREEN' and q.metadata->>'canonical_sku'=s.canonical_sku and s.support_ready is true;
 get diagnostics v_support=row_count;

 update public.dd_research_work_queue q set status='GREEN',blocker=null,next_action='Satisfied automatically from governed fulfillment-matrix evidence.',last_researched_at=now(),attempts=coalesce(attempts,0)+1,metadata=coalesce(metadata,'{}'::jsonb)||jsonb_build_object('auto_resolution','FULFILLMENT_MATRIX','resolved_at',now(),'authority','dd_service_release_contract_v1'),updated_at=now()
 from public.dd_service_release_contract_v1 r where q.program_key='SERVICE_DISCOVERY' and q.blocker='FULFILLMENT_CAPABILITY_UNPROVEN' and q.status<>'GREEN' and q.metadata->>'canonical_sku'=r.canonical_sku and r.fulfillment_matrix_ok is true;
 get diagnostics v_fulfillment=row_count;

 update public.dd_research_work_queue q set status='GREEN',blocker=null,next_action='All governed release-contract gates passed.',last_researched_at=now(),attempts=coalesce(attempts,0)+1,metadata=coalesce(metadata,'{}'::jsonb)||jsonb_build_object('auto_resolution','RELEASE_CONTRACT','resolved_at',now(),'authority','dd_service_release_contract_v1'),updated_at=now()
 from public.dd_service_release_contract_v1 r where q.program_key='SERVICE_DISCOVERY' and q.blocker='ACTIVATION_PROHIBITED_UNTIL_ALL_GATES_PASS' and q.status<>'GREEN' and q.metadata->>'canonical_sku'=r.canonical_sku and r.release_state='GREEN';
 get diagnostics v_activation=row_count;

 select public.dd_promote_verified_research_leads() into v_leads;
 begin perform private.dd_trigger_research_engine(); v_triggered:=true; exception when others then v_triggered:=false; end;

 update public.dd_research_pipeline_runs set completed_at=now(),status='COMPLETED',pricing_economics_refreshed=v_pricing,pricing_coverage_refreshed=v_coverage,leads_promoted=v_leads,channel_items_resolved=v_channel,support_items_resolved=v_support,fulfillment_items_resolved=v_fulfillment,activation_items_resolved=v_activation,research_triggered=v_triggered,
 summary=jsonb_build_object('rule','advance only from existing governed evidence; never invent authority','cross_sell_auto_resolution',false,'remaining_open_research',(select count(*) from public.dd_research_work_queue where status<>'GREEN'),'pricing_review_ready',(select count(*) from public.dd_service_pricing_research_queue where research_status='REVIEW_READY')) where id=v_id;
 return v_id;
exception when others then update public.dd_research_pipeline_runs set completed_at=now(),status='FAILED',summary=jsonb_build_object('error',sqlerrm) where id=v_id; raise;
end $function$
;
CREATE OR REPLACE FUNCTION public.dd_run_unattended_green_controller()
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare
  v_id uuid := gen_random_uuid();
  v_refreshed int := 0;
  v_review int := 0;
  v_blocked int := 0;
  v_research int := 0;
  v_green int := 0;
  v_non_green int := 0;
begin
  insert into public.dd_unattended_green_runs(id,run_kind,status)
  values(v_id,'DETERMINISTIC_RECONCILIATION','STARTED');

  select public.dd_refresh_pricing_research_economics(null) into v_refreshed;

  select count(*) filter(where research_status='REVIEW_READY'),
         count(*) filter(where research_status='BLOCKED')
    into v_review,v_blocked
  from public.dd_service_pricing_research_queue;

  select count(*) into v_research
  from public.dd_research_work_queue
  where status not in ('RESOLVED','CLOSED','COMPLETE','COMPLETED');

  select count(*) filter(where status='GREEN'),
         count(*) filter(where status<>'GREEN')
    into v_green,v_non_green
  from public.dd_platform_release_audit_10_pass;

  update public.dd_unattended_green_runs
  set status=case when v_blocked>0 or v_non_green>0 then 'PARTIAL' else 'COMPLETED' end,
      pricing_refreshed=v_refreshed,
      pricing_review_ready=v_review,
      pricing_blocked=v_blocked,
      research_open=v_research,
      platform_green=v_green,
      platform_non_green=v_non_green,
      summary=jsonb_build_object(
        'principle','green_requires_evidence',
        'pricing_queue_total',(select count(*) from public.dd_service_pricing_research_queue),
        'research_queue_total',(select count(*) from public.dd_research_work_queue),
        'platform_checks_total',(select count(*) from public.dd_platform_release_audit_10_pass)
      ),
      completed_at=now()
  where id=v_id;
  return v_id;
exception when others then
  update public.dd_unattended_green_runs
     set status='FAILED',summary=jsonb_build_object('error',sqlerrm),completed_at=now()
   where id=v_id;
  raise;
end $function$
;

revoke execute on function public.dd_refresh_evidence_freshness() from public,anon,authenticated;
revoke execute on function public.dd_refresh_pricing_coverage() from public,anon,authenticated;
revoke execute on function public.dd_promote_verified_research_leads() from public,anon,authenticated;
revoke execute on function public.dd_rollup_support_signals() from public,anon,authenticated;
revoke execute on function public.dd_run_provider_onboarding_coordinator() from public,anon,authenticated;
revoke execute on function public.dd_reconcile_provider_requirement_research_candidates() from public,anon,authenticated;
revoke execute on function public.dd_run_research_pipeline_controller() from public,anon,authenticated;
revoke execute on function public.dd_run_unattended_green_controller() from public,anon,authenticated;
grant execute on function public.dd_refresh_evidence_freshness() to service_role;
grant execute on function public.dd_refresh_pricing_coverage() to service_role;
grant execute on function public.dd_promote_verified_research_leads() to service_role;
grant execute on function public.dd_rollup_support_signals() to service_role;
grant execute on function public.dd_run_provider_onboarding_coordinator() to service_role;
grant execute on function public.dd_reconcile_provider_requirement_research_candidates() to service_role;
grant execute on function public.dd_run_research_pipeline_controller() to service_role;
grant execute on function public.dd_run_unattended_green_controller() to service_role;
