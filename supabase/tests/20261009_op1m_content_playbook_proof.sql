-- Tester proof for 20261009230000_op1m_content_playbook_v1.
-- Every row it creates is SIMULATION and the block always ends by raising, so the whole
-- proof rolls back. A pass ends with "PROOF_PASSED"; any other message is a failure.
do $proof$
declare
 v_fail text[] := '{}'; v_pass int := 0; v_res jsonb; v_n int; v_sr uuid := gen_random_uuid();
 v_parent text := 'SIM:PLAYBOOK:FOUNDER_STORY';
 procedure_sql text;
 expect_reject text[] := array[
  -- 1 unknown technique
  $q$insert into dd_acquisition_content_v1(content_key,campaign_key,platform,series_name,funnel_role,hook,content_brief,cta,source_attribution,techniques)
     values('SIM:PB:1','OP1M_CREATOR_ENGINE','FACEBOOK','SIM','TRUST','h','b','c','SIMULATION',array['MADE_UP'])$q$,
  -- 2 business-only theme on the personal page
  $q$insert into dd_acquisition_content_v1(content_key,campaign_key,platform,series_name,funnel_role,hook,content_brief,cta,source_attribution,theme_key,account_scope)
     values('SIM:PB:2','OP1M_CREATOR_ENGINE','FACEBOOK','SIM','TRUST','h','b','c','SIMULATION','WEDDING_WISDOM','PERSONAL_CREATOR')$q$,
  -- 3 provider-recruitment track selling a service
  $q$insert into dd_acquisition_content_v1(content_key,campaign_key,platform,series_name,funnel_role,service_sku,hook,content_brief,cta,source_attribution,content_track)
     values('SIM:PB:3','OP1M_CREATOR_ENGINE','FACEBOOK','SIM','DISCOVERY','DNI-01D-011','h','b','c','SIMULATION','BUILD_WITH_DANI')$q$,
  -- 4 daily story track used as a conversion post
  $q$insert into dd_acquisition_content_v1(content_key,campaign_key,platform,series_name,funnel_role,hook,content_brief,cta,source_attribution,content_track)
     values('SIM:PB:4','OP1M_CREATOR_ENGINE','FACEBOOK','SIM','CONVERSION','h','b','c','SIMULATION','DAILY_MILLION_DOLLAR_OPERATION')$q$,
  -- 5 sales post made ready on the personal page without owner cross-post approval
  $q$insert into dd_acquisition_content_v1(content_key,campaign_key,platform,series_name,funnel_role,service_sku,hook,content_brief,cta,source_attribution,account_scope,status)
     values('SIM:PB:5','HOLIDAY_EXECUTION_2026','FACEBOOK','SIM','CONVERSION','DNI-01D-011','h','b','c','SIMULATION','PERSONAL_CREATOR','READY')$q$,
  -- 6 social proof made ready without an approved real asset
  $q$insert into dd_acquisition_content_v1(content_key,campaign_key,platform,series_name,funnel_role,hook,content_brief,cta,source_attribution,account_scope,status,techniques)
     values('SIM:PB:6','COMMERCIAL_PROOF_ENGINE','LINKEDIN','SIM','B2B_TRUST','h','b','c','SIMULATION','DANI_BUSINESS','READY',array['SOCIAL_PROOF'])$q$,
  -- 7 ready without choosing personal vs business page
  $q$insert into dd_acquisition_content_v1(content_key,campaign_key,platform,series_name,funnel_role,hook,content_brief,cta,source_attribution,status)
     values('SIM:PB:7','OP1M_CREATOR_ENGINE','FACEBOOK','SIM','TRUST','h','b','c','SIMULATION','READY')$q$,
  -- 8 unfinished six-offer post made ready
  $q$insert into dd_acquisition_content_v1(content_key,campaign_key,platform,series_name,funnel_role,hook,content_brief,cta,source_attribution,account_scope,status,content_track)
     values('SIM:PB:8','OP1M_CREATOR_ENGINE','FACEBOOK','SIM','CONVERSION','h','b','c','SIMULATION','DANI_BUSINESS','READY','THREE_SERVICES_THREE_PRODUCTS')$q$
 ];
begin
 foreach procedure_sql in array expect_reject loop
  begin
   execute procedure_sql;
   v_fail := v_fail || ('accepted: '||left(procedure_sql,90));
  exception when raise_exception then v_pass := v_pass + 1;
  end;
 end loop;

 -- 9 allowed: personal-page sales post with explicit owner cross-post approval
 insert into dd_acquisition_content_v1(content_key,campaign_key,platform,series_name,funnel_role,service_sku,hook,content_brief,cta,source_attribution,account_scope,status,metadata)
 values('SIM:PB:9','HOLIDAY_EXECUTION_2026','FACEBOOK','SIM','CONVERSION','DNI-01D-011','h','b','c','SIMULATION','PERSONAL_CREATOR','READY','{"owner_cross_post_approved":true}');
 v_pass := v_pass + 1;

 -- 10 repurposing: one founder story -> four platform drafts on the same track
 insert into dd_acquisition_content_v1(content_key,campaign_key,platform,series_name,funnel_role,hook,content_brief,cta,source_attribution,account_scope,content_track,theme_key,techniques)
 values(v_parent,'OP1M_CREATOR_ENGINE','FACEBOOK','SIM','TRUST','I almost quit building the wrong thing.','SIMULATION founder story','Follow the build','SIMULATION',
        'PERSONAL_CREATOR','DAILY_MILLION_DOLLAR_OPERATION','BEHIND_DANI_DECLARES',array['CURIOSITY_HOOK','BEHIND_THE_SCENES']);
 v_res := dd_op1m_plan_repurpose_v1(v_parent);
 if (v_res->>'drafts_created')::int <> 4 then v_fail := v_fail || ('repurpose default: '||v_res::text); else v_pass := v_pass + 1; end if;
 select count(*) into v_n from dd_acquisition_content_v1
  where parent_content_key=v_parent and status='DRAFT' and not external_publish_authorized
    and content_track='DAILY_MILLION_DOLLAR_OPERATION' and 'CONTENT_REPURPOSING'=any(techniques) and 'PLATFORM_SPECIFIC'=any(techniques);
 if v_n <> 4 then v_fail := v_fail || ('repurpose children shape: '||v_n); else v_pass := v_pass + 1; end if;
 v_res := dd_op1m_plan_repurpose_v1(v_parent);
 if (v_res->>'drafts_created')::int <> 0 then v_fail := v_fail || 'repurpose not idempotent'; else v_pass := v_pass + 1; end if;

 -- 11 a service post cut from the daily story must leave the daily track
 begin
  perform dd_op1m_plan_repurpose_v1(v_parent, '[{"platform":"FACEBOOK","derivative_format":"SERVICE_POST","service_sku":"DNI-01D-011","funnel_role":"CONVERSION","account_scope":"DANI_BUSINESS"}]');
  v_fail := v_fail || 'service child stayed on the daily track';
 exception when raise_exception then v_pass := v_pass + 1;
 end;
 v_res := dd_op1m_plan_repurpose_v1(v_parent, '[{"platform":"FACEBOOK","derivative_format":"SERVICE_POST","service_sku":"DNI-01D-011","funnel_role":"CONVERSION","account_scope":"DANI_BUSINESS","content_track":"LET_DANI_BUILD_YOU","theme_key":"CONCIERGE_LIFE","campaign_key":"HOLIDAY_EXECUTION_2026"}]');
 if (v_res->>'drafts_created')::int <> 1 then v_fail := v_fail || ('service child: '||v_res::text); else v_pass := v_pass + 1; end if;

 -- 12 attribution: a SIMULATION request tagged with a derived content_key becomes INQUIRY + QUOTE once
 insert into service_requests(id,service_needed,request_details,status,quote_amount,property_details)
 values(v_sr,'SIMULATION','SIMULATION playbook attribution proof','new',125,
        jsonb_build_object('marketingAttribution',jsonb_build_object('utm_source','instagram','utm_campaign','operation-million-dollar-daily','utm_content',v_parent||'>INSTAGRAM:REEL'),'simulation',true));
 v_res := dd_op1m_capture_intake_attribution_v1();
 select count(*) into v_n from dd_acquisition_attribution_v1 where evidence->>'service_request_id'=v_sr::text and content_key=v_parent||'>INSTAGRAM:REEL';
 if v_n <> 2 then v_fail := v_fail || ('attribution rows: '||v_n||' '||v_res::text); else v_pass := v_pass + 1; end if;
 perform dd_op1m_capture_intake_attribution_v1();
 select count(*) into v_n from dd_acquisition_attribution_v1 where evidence->>'service_request_id'=v_sr::text;
 if v_n <> 2 then v_fail := v_fail || 'attribution not idempotent'; else v_pass := v_pass + 1; end if;
 select count(*) into v_n from dd_acquisition_content_playbook_review_v1 where content_key=v_parent||'>INSTAGRAM:REEL' and attribution_events ? 'INQUIRY';
 if v_n <> 1 then v_fail := v_fail || 'review view misses attribution'; else v_pass := v_pass + 1; end if;

 -- 13 review view flags the existing holiday sales draft that sits on the personal page
 select count(*) into v_n from dd_acquisition_content_playbook_review_v1 where content_key='HOLIDAY:FB:GIFT_WRAP' and 'SALES_POST_ON_PERSONAL_PAGE'=any(needs);
 if v_n <> 1 then v_fail := v_fail || 'review view missed HOLIDAY:FB:GIFT_WRAP'; else v_pass := v_pass + 1; end if;

 if cardinality(v_fail) > 0 then
  raise exception 'PROOF_FAILED passed=% failures=%', v_pass, v_fail;
 end if;
 raise exception 'PROOF_PASSED cases=% (rolled back; no rows kept)', v_pass;
end
$proof$;
