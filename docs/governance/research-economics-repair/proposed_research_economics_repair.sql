-- PROPOSED, TESTER-ONLY. Not a Production migration; not in supabase/migrations (Production replay lineage).
-- Repairs: (1) coverage from authoritative channel availability, (2) bounded per-service research dispatch,
-- (3) freshness-aware evidence assessment, (+) validated ingest contract, packet enrichment.
-- Rules: no price writes, no queue deletes, market evidence stays append-only, no new tables.

-- ---------------------------------------------------------------- 1. coverage
-- Authority: dd_service_channel_availability (matches dd_master_service_capability_channel_matrix: ACTIVE rows only).
-- Never infers eligibility: no ACTIVE row => not SCOPED.
create or replace function public.dd_refresh_pricing_coverage()
returns integer language plpgsql security definer set search_path to 'public' as $$
declare n int;
begin
 with calc as (
   select q.service_id,
     coalesce(m.division,q.division) division,
     coalesce(a.active,'{}'::text[]) scope,
     case when coalesce(array_length(a.active,1),0)>0 then 'SCOPED'
          when coalesce(a.pending_n,0)>0 then 'PENDING_AUTHORIZATION'
          else 'NO_CHANNEL_AUTHORITY' end status
   from dd_service_pricing_research_queue q
   left join dd_master_service_universe m on m.canonical_sku=q.canonical_sku
   left join lateral (
     select array_agg(distinct c.channel_code order by c.channel_code) filter (where c.eligibility_status='ACTIVE') active,
            count(*) filter (where c.eligibility_status='PENDING') pending_n
     from dd_service_channel_availability c where c.service_id=q.service_id) a on true)
 update dd_service_pricing_research_queue q set division=calc.division, channel_scope=calc.scope,
   coverage_status=calc.status, updated_at=now()
 from calc
 where q.service_id=calc.service_id
   and (q.coverage_status is distinct from calc.status or q.channel_scope is distinct from calc.scope or q.division is distinct from calc.division);
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
end $$;

-- ---------------------------------------------------------------- 3. freshness + assessment
-- Window is a parameter, not a delete: stale rows stay in dd_service_market_evidence and in the view (flagged).
create or replace function public.dd_market_evidence_fresh_days() returns int
language sql immutable as $$ select 180 $$;

-- One row per (service, pricing_unit). Units are NEVER merged. Only DIRECT, non-excluded, fresh, priced rows
-- with a verification status of VERIFIED or SINGLE_SOURCE count toward a range. PARTIAL/CONTEXT_ONLY are counted separately.
create or replace view public.dd_service_market_evidence_assessment_v1 with (security_invoker=true) as
select e.service_id, e.canonical_sku, e.pricing_unit,
  count(*)                                                        as observations_total,
  count(*) filter (where e.verification_status='EXCLUDED')        as excluded_n,
  count(*) filter (where e.comparability='PARTIAL')               as partial_n,
  count(*) filter (where e.comparability='CONTEXT_ONLY')          as context_only_n,
  count(*) filter (where qual.ok and not qual.stale)              as qualifying_fresh_n,
  count(distinct e.source_name) filter (where qual.ok and not qual.stale) as qualifying_fresh_sources,
  count(*) filter (where qual.ok and qual.stale)                  as stale_direct_n,
  min(e.observed_price_low_cents)  filter (where qual.ok and not qual.stale) as range_low_cents,
  max(coalesce(e.observed_price_high_cents,e.observed_price_low_cents)) filter (where qual.ok and not qual.stale) as range_high_cents,
  percentile_cont(0.5) within group (order by (e.observed_price_low_cents+coalesce(e.observed_price_high_cents,e.observed_price_low_cents))/2.0) filter (where qual.ok and not qual.stale) as midpoint_median_cents,
  max(e.observed_at)                                              as latest_observed_at,
  'COMPETITOR_PUBLISHED_PRICE'::text                              as evidence_class
from public.dd_service_market_evidence e
cross join lateral (select
   (e.comparability='DIRECT' and e.verification_status in ('VERIFIED','SINGLE_SOURCE') and e.observed_price_low_cents is not null) as ok,
   (e.observed_at < now() - make_interval(days=>public.dd_market_evidence_fresh_days())) as stale) qual
group by e.service_id, e.canonical_sku, e.pricing_unit;

-- Writes only evidence_count/confidence/last_researched_at/research_status on rows that have no economics baseline
-- (rows with a baseline are advanced by the existing dd_refresh_pricing_research_economics). No price columns.
-- evidence_count = max over units of distinct qualifying fresh sources (units are not pooled).
create or replace function public.dd_refresh_service_evidence_counts(p_service_id uuid default null)
returns integer language plpgsql security definer set search_path to 'public' as $$
declare n int;
begin
 with per as (
   select service_id, max(qualifying_fresh_sources)::int cnt, max(latest_observed_at) latest
   from dd_service_market_evidence_assessment_v1 group by service_id)
 update dd_service_pricing_research_queue q set
   evidence_count=coalesce(per.cnt,0),
   last_researched_at=coalesce(per.latest,q.last_researched_at),
   confidence=case when coalesce(per.cnt,0)>=q.evidence_target then 'MEDIUM' when coalesce(per.cnt,0)>0 then 'LOW' else q.confidence end,
   research_status=case
      when q.research_status in ('BLOCKED','REVIEW_READY','ECONOMICS_READY','GOVERNED') then q.research_status
      when coalesce(per.cnt,0)>=q.evidence_target then 'EVIDENCE_READY'
      when coalesce(per.cnt,0)>0 then 'RESEARCHING' else 'QUEUED' end,
   updated_at=now()
 from (select qq.service_id from dd_service_pricing_research_queue qq where p_service_id is null or qq.service_id=p_service_id) s
 left join per on per.service_id=s.service_id
 where q.service_id=s.service_id
   and (q.evidence_count is distinct from coalesce(per.cnt,0)
        or q.last_researched_at is distinct from coalesce(per.latest,q.last_researched_at));
 get diagnostics n=row_count;
 return n;
end $$;

-- ---------------------------------------------------------------- ingest contract
-- Only sanctioned writer for per-service observations. Validates; never invents; dedupes via the existing unique index.
create or replace function public.dd_record_service_market_observation(
  p_sku text, p_source_name text, p_source_url text, p_geography text, p_observed_offer text,
  p_low_cents int, p_high_cents int, p_unit text, p_comparable_scope text, p_comparability text,
  p_verification text, p_observed_at timestamptz, p_research_run text, p_notes text default null)
returns jsonb language plpgsql security definer set search_path to 'public' as $$
declare v_svc uuid; v_unit text; v_id uuid; v_units text[]:=array['JOB','VISIT','LABOR_HOUR','HOUR','BAG','LOAD','MONTH','SEASON','PLANT','INCH','POUND','SQFT','ROOM','30_MIN','DAY','WEEK','YEAR','ITEM','MILE'];
begin
 select service_id into v_svc from dd_service_pricing_research_queue where canonical_sku=p_sku;
 if v_svc is null then return jsonb_build_object('status','REJECTED','reason','UNKNOWN_SKU'); end if;
 v_unit:=upper(btrim(p_unit));
 if v_unit<>all(v_units) then return jsonb_build_object('status','REJECTED','reason','UNIT_NOT_NORMALIZED','unit',p_unit); end if;
 if p_source_url !~ '^https://[^ ]+$' then return jsonb_build_object('status','REJECTED','reason','SOURCE_URL_REQUIRED_HTTPS'); end if;
 if coalesce(btrim(p_source_name),'')='' or coalesce(btrim(p_research_run),'')='' or coalesce(btrim(p_observed_offer),'')='' then
   return jsonb_build_object('status','REJECTED','reason','PROVENANCE_FIELDS_REQUIRED'); end if;
 if p_comparability not in ('DIRECT','PARTIAL','CONTEXT_ONLY') then return jsonb_build_object('status','REJECTED','reason','BAD_COMPARABILITY'); end if;
 if p_verification not in ('VERIFIED','SINGLE_SOURCE','UNVERIFIED') then return jsonb_build_object('status','REJECTED','reason','BAD_VERIFICATION'); end if;
 if p_observed_at is null or p_observed_at>now() then return jsonb_build_object('status','REJECTED','reason','BAD_OBSERVED_AT'); end if;
 if p_comparability<>'CONTEXT_ONLY' and p_low_cents is null then return jsonb_build_object('status','REJECTED','reason','PRICE_REQUIRED'); end if;
 if p_low_cents<0 or (p_high_cents is not null and p_high_cents<p_low_cents) then return jsonb_build_object('status','REJECTED','reason','BAD_PRICE_RANGE'); end if;
 insert into dd_service_market_evidence(service_id,canonical_sku,source_name,source_url,geography,observed_offer,observed_price_low_cents,observed_price_high_cents,pricing_unit,comparable_scope,comparability,verification_status,source_kind,observed_at,research_run,notes)
 values(v_svc,p_sku,p_source_name,p_source_url,p_geography,p_observed_offer,p_low_cents,p_high_cents,v_unit,p_comparable_scope,p_comparability,p_verification,'COMPETITOR',p_observed_at,p_research_run,p_notes)
 on conflict do nothing returning id into v_id;
 if v_id is null then return jsonb_build_object('status','DUPLICATE_IGNORED'); end if;
 perform public.dd_refresh_service_evidence_counts(v_svc);
 -- close the dispatched work item when the target is met; never touches prices
 update dd_research_work_queue w set status='EVIDENCE_READY', blocker=null, last_researched_at=now(), updated_at=now(),
   next_action='Evidence target met. Awaiting economics assessment and governed review; no price is changed automatically.'
 from dd_service_pricing_research_queue q
 where q.service_id=v_svc and w.work_key='PRICING:'||p_sku and q.evidence_count>=q.evidence_target and w.status in ('QUEUED','RESEARCHING','BLOCKED');
 return jsonb_build_object('status','RECORDED','id',v_id);
end $$;
revoke all on function public.dd_record_service_market_observation(text,text,text,text,text,int,int,text,text,text,text,timestamptz,text,text) from public, anon, authenticated;
grant execute on function public.dd_record_service_market_observation(text,text,text,text,text,int,int,text,text,text,text,timestamptz,text,text) to service_role;


-- program row for per-service observation work (data only; FK target for dd_research_work_queue.program_key)
insert into public.dd_research_programs(program_key,program_name,domain,objective,status,release_blocked,green_rule,metadata)
values('SERVICE_PRICE_OBSERVATION','Per-service competitor price observation','PRICING_ECONOMICS',
 'Collect sourced, unit-normalized competitor price observations per service. Benchmarks only; never DANI cost or price authority.',
 'RESEARCHING',true,
 'Benchmark evidence only. Qualifies when the evidence target of distinct fresh DIRECT sources is met; any price change requires governed review.',
 jsonb_build_object('environment','TESTER','production_mutation',false,'parent_program','SERVICE_PRICING_ECONOMICS'))
on conflict(program_key) do nothing;

-- ---------------------------------------------------------------- 2. bounded dispatch
-- Own program_key so the program-level watcher sources (IRS/DOL/DOR/Angi) are NOT matched: the executor will
-- therefore BLOCK with SOURCE_DISCOVERY_REQUIRED and open a governed discovery request, never fabricate a source.
-- Dedupe: work_key PRICING:<sku> is unique. Retry: BLOCKED items re-queue after 24h up to 3 attempts, then park
-- with blocker RETRY_LIMIT_REACHED for human review.
create or replace function public.dd_dispatch_pricing_research_batch(p_limit int default 10, p_max_open int default 25)
returns jsonb language plpgsql security definer set search_path to 'public' as $$
declare v_open int; v_new int:=0; v_req int:=0; v_parked int:=0; v_slots int;
begin
 update dd_research_work_queue set status='BLOCKED', blocker='RETRY_LIMIT_REACHED', owner_decision_required=true,
   next_action='Three attempts without qualifying evidence. Needs a human-selected source or a different method.', updated_at=now()
 where program_key='SERVICE_PRICE_OBSERVATION' and status='BLOCKED' and attempts>=3 and coalesce(blocker,'')<>'RETRY_LIMIT_REACHED';
 get diagnostics v_parked=row_count;

 update dd_research_work_queue set status='QUEUED', blocker=null, updated_at=now(),
   metadata=metadata||jsonb_build_object('requeued_at',now())
 where program_key='SERVICE_PRICE_OBSERVATION' and status='BLOCKED' and blocker='SOURCE_DISCOVERY_REQUIRED'
   and attempts<3 and last_researched_at<now()-interval '24 hours'
   and exists(select 1 from dd_research_sources s where s.status='ACTIVE' and s.work_key=dd_research_work_queue.work_key);
 get diagnostics v_req=row_count;

 select count(*) into v_open from dd_research_work_queue where program_key='SERVICE_PRICE_OBSERVATION' and status in ('QUEUED','RESEARCHING');
 v_slots:=greatest(least(p_limit,p_max_open-v_open),0);
 with pick as (
   select q.service_id,q.canonical_sku,q.service_family,q.pricing_model,q.priority,q.evidence_target,q.coverage_status,q.id qid
   from dd_service_pricing_research_queue q
   where q.research_status='QUEUED' and q.evidence_count=0 and q.canonical_sku is not null
     and not exists(select 1 from dd_research_work_queue w where w.work_key='PRICING:'||q.canonical_sku)
   order by case q.coverage_status when 'SCOPED' then 0 when 'PENDING_AUTHORIZATION' then 1 else 2 end, q.priority, q.created_at
   limit v_slots)
 insert into dd_research_work_queue(program_key,work_key,question,required_evidence,priority,status,next_action,metadata)
 select 'SERVICE_PRICE_OBSERVATION','PRICING:'||sku,
   'What do comparable Atlanta-area providers publish for '||sku||' ('||coalesce(service_family,'service')||'), by pricing unit?',
   'At least '||evidence_target||' distinct sources with https URL, observed date, pricing unit, comparability (DIRECT/PARTIAL/CONTEXT_ONLY). Competitor prices only; no costs inferred.',
   case when priority<=10 then 'P1' when priority<=20 then 'P2' else 'P3' end,'QUEUED',
   'Dispatched by dd_dispatch_pricing_research_batch. Record observations via dd_record_service_market_observation.',
   jsonb_build_object('service_id',service_id,'canonical_sku',sku,'pricing_queue_id',qid,'coverage_status',coverage_status,'dispatched_by','dd_dispatch_pricing_research_batch','evidence_class','COMPETITOR_PUBLISHED_PRICE')
 from pick
 on conflict(work_key) do nothing;
 get diagnostics v_new=row_count;
 return jsonb_build_object('dispatched',v_new,'requeued',v_req,'parked_for_review',v_parked,'open_before',v_open,'max_open',p_max_open,'production_mutation',false,'price_mutation',false);
end $$;
revoke all on function public.dd_dispatch_pricing_research_batch(int,int) from public, anon, authenticated;
grant execute on function public.dd_dispatch_pricing_research_batch(int,int) to service_role;

-- ---------------------------------------------------------------- controller extension (existing function, patched in place)
-- Applied as a text patch of the live controller (anchor-checked, idempotent) instead of re-pasting the full body:
-- adds ONE call before the economics refresh and ONE summary key. Everything else in the controller is untouched.
create or replace function public.dd_pricing_research_pre_step() returns void
language plpgsql security definer set search_path to 'public' as $$
declare v_counts int; v_cov int; v_dispatch jsonb;
begin
 v_counts:=public.dd_refresh_service_evidence_counts(null);
 v_cov:=public.dd_refresh_pricing_coverage();
 begin v_dispatch:=public.dd_dispatch_pricing_research_batch(10,25);   -- bounded: <=10 per run, <=25 open
 exception when others then v_dispatch:=jsonb_build_object('error',sqlerrm); end;   -- isolated: cannot fail the run
 perform set_config('dani.pricing_pre_step', jsonb_build_object('evidence_counts_refreshed',v_counts,'coverage_rows_changed',v_cov,'dispatch',v_dispatch)::text, true);
end $$;
revoke all on function public.dd_pricing_research_pre_step() from public, anon, authenticated;
grant execute on function public.dd_pricing_research_pre_step() to service_role;

do $patch$
declare d text; d2 text; a text:=' select public.dd_refresh_pricing_research_economics(null) into v_pricing;'; b text:='''pricing_review_ready'',';
begin
 d:=pg_get_functiondef('public.dd_run_research_pipeline_controller()'::regprocedure);
 if position('dd_pricing_research_pre_step' in d)>0 then return; end if;
 if position(a in d)=0 or position(b in d)=0 then raise exception 'anchor_missing'; end if;
 d2:=replace(d,a,E' perform public.dd_pricing_research_pre_step();\n'||a);
 d2:=replace(d2,b,'''pricing_pre_step'',coalesce(nullif(current_setting(''dani.pricing_pre_step'',true),''''),''{}'')::jsonb,'||b);
 execute d2;
end $patch$;

-- ---------------------------------------------------------------- packet enrichment (evidence classes kept separate)
-- Adds to the packet's evidence JSON: market ranges per unit (competitor prices) and the labelled cost-basis class.
-- researched_price_cents / modeled_direct_cost_cents semantics unchanged; competitor prices are never copied into cost.
create or replace function private.dd_stage_tester_economics_evidence(p_limit integer default 500)
returns jsonb language plpgsql set search_path to 'public','private' as $$
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
   'market_ranges',coalesce((select jsonb_agg(jsonb_build_object('unit',a.pricing_unit,'low_cents',a.range_low_cents,'high_cents',a.range_high_cents,'median_midpoint_cents',a.midpoint_median_cents,'qualifying_fresh_sources',a.qualifying_fresh_sources,'partial_n',a.partial_n,'context_only_n',a.context_only_n,'stale_direct_n',a.stale_direct_n,'latest_observed_at',a.latest_observed_at,'evidence_class',a.evidence_class) order by a.pricing_unit)
        from public.dd_service_market_evidence_assessment_v1 a where a.service_id=q.service_id and a.qualifying_fresh_n>0),'[]'::jsonb),
   'cost_basis_class',case when b.evidence_status in ('AUDITED','VERIFIED','GOVERNED') then 'AUDITED_MODEL' when b.evidence_status='OBSERVED_JOB' then 'OBSERVED_JOB' when b.runtime_service_id is not null then 'MODELED_ASSUMPTION' else 'NONE' end,
   'provenance_rule','Tester research/model evidence; competitor price ranges are market benchmarks, not DANI costs; not a Production actual; eligible to inform governed Production calibration only.'),
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
end $$;
