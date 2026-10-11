-- Captured from Tester (okvepooyxurujcwgfoju) on 2026-10-11 immediately before applying the repair. Use to roll back.
CREATE OR REPLACE FUNCTION public.dd_refresh_pricing_coverage()
 RETURNS integer LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $function$
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
end $function$;

CREATE OR REPLACE FUNCTION private.dd_stage_tester_economics_evidence(p_limit integer DEFAULT 500)
 RETURNS jsonb LANGUAGE plpgsql SET search_path TO 'public', 'private' AS $function$
declare n int:=0;
begin
 insert into public.dd_economics_evidence_packets(
  packet_key,canonical_sku,source_class,evidence_status,confidence,geography_scope,
  researched_price_cents,minimum_viable_price_cents,modeled_direct_cost_cents,expected_margin_percent,
  source_reference,evidence,source_updated_at,staged_at)
 select
  'TESTER_ECON:'||q.canonical_sku||':'||md5(concat_ws('|',coalesce(q.proposed_price_cents::text,''),coalesce(q.minimum_viable_price_cents::text,''),coalesce(q.modeled_direct_cost_cents::text,''),coalesce(q.economics_evidence_status,''),coalesce(q.updated_at::text,''))),
  q.canonical_sku,'TESTER_RESEARCH',coalesce(q.economics_evidence_status,q.research_status),q.confidence,q.geography_scope,
  q.proposed_price_cents,q.minimum_viable_price_cents,q.modeled_direct_cost_cents,q.expected_margin_percent,
  b.source_reference,
  jsonb_build_object(
   'pricing_model',q.pricing_model,'research_status',q.research_status,'evidence_count',q.evidence_count,'evidence_target',q.evidence_target,
   'baseline',jsonb_build_object('duration_hours',b.estimated_duration_hours,'labor_rate',b.labor_rate,'materials_cost',b.materials_cost,'travel_cost',b.travel_cost,'other_direct_cost',b.other_direct_cost,'source_type',b.source_type,'source_date',b.source_date),
   'provenance_rule','Tester research/model evidence; not a Production actual; eligible to inform governed Production calibration only.'),
  q.updated_at,now()
 from public.dd_service_pricing_research_queue q
 left join public.dd_service_economic_baselines b on b.runtime_service_id=q.service_id
 where q.canonical_sku is not null
   and (q.economics_ready or q.research_status in ('ECONOMICS_READY','EVIDENCE_READY','REVIEW_READY'))
 order by q.priority desc,q.updated_at desc
 limit greatest(coalesce(p_limit,500),1)
 on conflict(packet_key) do nothing;
 get diagnostics n=row_count;
 return jsonb_build_object('status','COMPLETED','staged',n,'source_class','TESTER_RESEARCH','production_mutation',false);
end $function$;

-- Controller: the repair adds only three steps (evidence counts, bounded dispatch with error isolation, two summary keys).
-- To restore, remove those steps from the repaired definition; all other statements are unchanged.
