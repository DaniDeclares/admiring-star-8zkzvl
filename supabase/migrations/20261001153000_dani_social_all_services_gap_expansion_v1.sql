-- DANI DECLARES: expand the visual-sales system to the canonical service universe without creating a runaway content pile.
create or replace function public.dd_social_expand_service_visual_gaps_v1(p_limit integer default 500)
returns jsonb language plpgsql security definer set search_path=public as $$
declare v_created int:=0;
begin
 insert into public.dd_social_visual_gaps_v1
 (gap_key,service_key,service_name,buyer_segment,channel_scope,desired_visual_type,proof_requirement,metadata)
 select 'SERVICE_VISUAL:'||m.canonical_sku,m.canonical_sku,m.service_name,
   case when m.division='01' then 'RESIDENT' when m.division='03' then 'PROPERTY_MANAGEMENT' when m.division='04' then 'REAL_ESTATE' else 'BUSINESS' end,
   case when m.division='01' then array['FACEBOOK','INSTAGRAM','TIKTOK','NEXTDOOR']
        when m.division='03' then array['LINKEDIN','FACEBOOK','NEXTDOOR']
        when m.division='04' then array['LINKEDIN','FACEBOOK','INSTAGRAM']
        else array['LINKEDIN','FACEBOOK'] end,
   'PHOTO',
   case when m.division in ('01','03','04') then 'DANI_PROOF' else 'ILLUSTRATIVE' end,
   jsonb_build_object('priority','P2','source_authority',m.source_authority,'division',m.division,'service_family',m.service_family,'canonical_service',true,'owner_approval_required',true)
 from public.dd_master_service_universe m
 where m.lifecycle_status='CANONICAL_ACTIVE' and m.canonical_sku is not null
   and not exists(select 1 from public.dd_social_visual_gaps_v1 g where g.gap_key='SERVICE_VISUAL:'||m.canonical_sku)
 order by m.division,m.canonical_sku
 limit greatest(1,least(1000,p_limit));
 get diagnostics v_created=row_count;
 return jsonb_build_object('status','COMPLETED','service_visual_gaps_created',v_created,'source','dd_master_service_universe','production_mutation',false);
end $$;

create or replace function public.dd_social_plan_content_v1(p_limit integer default 20)
returns jsonb language plpgsql security definer set search_path=public as $$
declare v_created int:=0; v_existing int:=0; v_capacity int:=0;
begin
 select count(*) into v_existing from public.dd_social_content_queue_v1 where approval_status in ('DRAFT','OWNER_REVIEW');
 v_capacity:=greatest(0,100-v_existing);
 if v_capacity=0 then
   return jsonb_build_object('status','CAPACITY_HELD','drafts_created',0,'queue_cap',100,'existing_review_queue',v_existing,'owner_approval_required',true,'external_publish',false,'production_mutation',false);
 end if;
 insert into public.dd_social_content_queue_v1
 (content_key,campaign_key,platform,format,service_key,hook,body_copy,visual_direction,asset_key,cta,proof_class,approval_status,dedupe_key,metadata)
 select 'SOCIAL:'||lower(g.gap_key)||':'||lower(p.platform),'DANI_VISUAL_SALES_ENGINE_V1',p.platform,
 case when p.platform in ('INSTAGRAM','TIKTOK') then 'SHORT_VIDEO_OR_CAROUSEL' else 'SINGLE_IMAGE' end,g.service_key,
 case when p.platform='NEXTDOOR' then 'Local help for '||lower(g.service_name) when p.platform='LINKEDIN' then 'The operational task your team still has to chase' else 'A real-world problem DANI DECLARES can help execute' end,
 case when p.platform='NEXTDOOR' then 'DANI DECLARES provides local execution support. Ask about '||g.service_name||'.' when p.platform='LINKEDIN' then 'DANI DECLARES coordinates practical execution around '||g.service_name||' so teams can spend less time chasing fragmented tasks.' else 'Need help with '||g.service_name||'? DANI DECLARES handles the execution with a documented, coordinated process.' end,
 case when g.proof_requirement='DANI_PROOF' then 'Use an actual DANI photo/video first. If no approved DANI proof exists, leave the visual slot empty and route the gap for asset review.' else 'Use real DANI proof when available; otherwise use licensed illustrative imagery and label the concept clearly.' end,
 case when g.proof_requirement='DANI_PROOF' then
   (select a.asset_key from public.dd_social_visual_asset_registry_v1 a where a.approval_status='OWNER_APPROVED' and a.proof_class='DANI_PROOF' and a.rights_status in ('OWNED','LICENSED_COMMERCIAL','CANVA_LICENSED') and (a.service_keys @> array[g.service_key] or a.visual_type='TEMPLATE') and p.platform=any(a.platform_scope) order by a.updated_at desc limit 1)
 else
   (select a.asset_key from public.dd_social_visual_asset_registry_v1 a where a.approval_status='OWNER_APPROVED' and a.rights_status in ('OWNED','LICENSED_COMMERCIAL','CANVA_LICENSED') and p.platform=any(a.platform_scope) order by (a.proof_class='DANI_PROOF') desc,a.updated_at desc limit 1)
 end,
 case when p.platform='LINKEDIN' then 'Request a commercial service conversation' when p.platform='NEXTDOOR' then 'Message DANI' else 'DM DANI DECLARES' end,
 g.proof_requirement,'DRAFT','SOCIAL:'||g.gap_key||':'||p.platform,
 jsonb_build_object('buyer_segment',g.buyer_segment,'visual_gap',g.gap_key,'owner_approval_required',true,'external_publish',false)
 from public.dd_social_visual_gaps_v1 g cross join lateral unnest(g.channel_scope) p(platform)
 where g.status<>'RETIRED' and not exists(select 1 from public.dd_social_content_queue_v1 q where q.dedupe_key='SOCIAL:'||g.gap_key||':'||p.platform)
 order by case coalesce(g.metadata->>'priority','P9') when 'P0' then 0 when 'P1' then 1 when 'P2' then 2 else 3 end,g.updated_at
 limit least(greatest(1,p_limit),v_capacity);
 get diagnostics v_created=row_count;
 update public.dd_social_content_queue_v1 q set asset_key=null,updated_at=now()
 where q.approval_status='DRAFT' and q.proof_class='DANI_PROOF' and q.asset_key is not null
 and not exists(select 1 from public.dd_social_visual_asset_registry_v1 a where a.asset_key=q.asset_key and a.proof_class='DANI_PROOF' and a.approval_status='OWNER_APPROVED');
 return jsonb_build_object('status','COMPLETED','drafts_created',v_created,'queue_cap',100,'existing_review_queue',v_existing,'proof_safety_repaired',true,'owner_approval_required',true,'external_publish',false,'production_mutation',false);
end $$;

create or replace function public.dd_run_dani_social_visual_pipeline_v1()
returns jsonb language plpgsql security definer set search_path=public as $$
declare v_seed jsonb; v_expand jsonb; v_sync jsonb; v_plan jsonb; v_review jsonb; v_learning jsonb;
begin
 select public.dd_social_seed_visual_system_v1() into v_seed;
 select public.dd_social_expand_service_visual_gaps_v1(500) into v_expand;
 select public.dd_social_sync_visual_sources_v1() into v_sync;
 select public.dd_social_plan_content_v1(50) into v_plan;
 select public.dd_social_queue_asset_review_to_brain_v1() into v_review;
 select public.dd_social_queue_learning_to_brain_v1() into v_learning;
 return jsonb_build_object('status','COMPLETED','seed',v_seed,'expand',v_expand,'sync',v_sync,'plan',v_plan,'asset_review',v_review,'learning',v_learning,'owner_approval_required',true,'external_publish',false,'paid_spend',false,'production_mutation',false);
end $$;