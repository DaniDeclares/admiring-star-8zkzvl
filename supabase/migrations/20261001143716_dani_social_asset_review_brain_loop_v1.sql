-- DANI DECLARES: route unreviewed owned visual candidates into the existing Brain review loop.
create or replace function public.dd_social_queue_asset_review_to_brain_v1()
returns jsonb language plpgsql security definer set search_path=public as $$
declare v_queued int:=0;
begin
 insert into public.dd_brain_delivery_queue(delivery_key,entity_scope,source_key,source_type,payload,payload_hash)
 select 'SOCIAL_ASSET_REVIEW:'||a.asset_key,'DANI_DECLARES',a.asset_key,'SOCIAL_ASSET_REVIEW',
 jsonb_build_object(
   'summary','Unreviewed DANI-owned visual candidate requiring owner approval before use as proof.',
   'asset_key',a.asset_key,'source_ref',a.source_ref,'title',a.title,'service_keys',a.service_keys,
   'proof_class',a.proof_class,'rights_status',a.rights_status,'approval_status',a.approval_status,
   'platform_scope',a.platform_scope,'metadata',a.metadata,
   'required_action','Owner review: approve only if legitimately DANI-owned/authorized and accurately represents the service; otherwise reject or keep illustrative.',
   'tester_only',true,'production_authorized',false,'external_publish',false,'confidence',0.95
 ),
 md5(a.asset_key||':'||a.updated_at::text)
 from public.dd_social_visual_asset_registry_v1 a
 where a.source_type='OWNED' and a.approval_status='UNREVIEWED'
 and not exists(select 1 from public.dd_brain_delivery_queue q where q.delivery_key='SOCIAL_ASSET_REVIEW:'||a.asset_key);
 get diagnostics v_queued=row_count;
 return jsonb_build_object('status','COMPLETED','asset_reviews_queued',v_queued,'production_mutation',false);
end $$;

create or replace function public.dd_run_dani_social_visual_pipeline_v1()
returns jsonb language plpgsql security definer set search_path=public as $$
declare v_seed jsonb; v_sync jsonb; v_plan jsonb; v_review jsonb; v_learning jsonb;
begin
 select public.dd_social_seed_visual_system_v1() into v_seed;
 select public.dd_social_sync_visual_sources_v1() into v_sync;
 select public.dd_social_plan_content_v1(50) into v_plan;
 select public.dd_social_queue_asset_review_to_brain_v1() into v_review;
 select public.dd_social_queue_learning_to_brain_v1() into v_learning;
 return jsonb_build_object('status','COMPLETED','seed',v_seed,'sync',v_sync,'plan',v_plan,'asset_review',v_review,'learning',v_learning,
 'owner_approval_required',true,'external_publish',false,'paid_spend',false,'production_mutation',false);
end $$;