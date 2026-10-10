
create table if not exists public.dd_economics_evidence_intake (
 id uuid primary key default gen_random_uuid(),
 packet_key text not null unique,
 canonical_sku text not null,
 evidence_origin text not null check (evidence_origin in ('TESTER_RESEARCH','PRODUCTION_ACTUAL')),
 evidence_status text not null,
 confidence text,
 geography_scope text,
 researched_price_cents integer,
 minimum_viable_price_cents integer,
 modeled_direct_cost_cents integer,
 expected_margin_percent numeric,
 source_reference text,
 evidence jsonb not null default '{}'::jsonb,
 source_observed_at timestamptz,
 ingested_at timestamptz not null default now()
);
alter table public.dd_economics_evidence_intake enable row level security;
revoke all on public.dd_economics_evidence_intake from anon, authenticated;

create table if not exists public.dd_economics_calibration_state (
 canonical_sku text primary key,
 tester_research_samples integer not null default 0,
 production_actual_samples integer not null default 0,
 tester_researched_price_cents integer,
 tester_minimum_viable_price_cents integer,
 tester_modeled_direct_cost_cents integer,
 actual_avg_revenue_cents integer,
 actual_avg_direct_cost_cents integer,
 actual_avg_margin_percent numeric,
 calibration_status text not null default 'RESEARCH_ONLY',
 evidence_mix jsonb not null default '{}'::jsonb,
 refreshed_at timestamptz not null default now()
);
alter table public.dd_economics_calibration_state enable row level security;
revoke all on public.dd_economics_calibration_state from anon, authenticated;

create or replace function private.dd_ingest_tester_economics_packet(p_packet jsonb)
returns jsonb language plpgsql security invoker set search_path='public','private' as $$
declare v_key text; v_sku text;
begin
 v_key:=nullif(p_packet->>'packet_key',''); v_sku:=nullif(p_packet->>'canonical_sku','');
 if v_key is null or v_sku is null then raise exception 'packet_key and canonical_sku required'; end if;
 if coalesce(p_packet->>'source_class','') <> 'TESTER_RESEARCH' then raise exception 'invalid source_class'; end if;
 insert into public.dd_economics_evidence_intake(packet_key,canonical_sku,evidence_origin,evidence_status,confidence,geography_scope,researched_price_cents,minimum_viable_price_cents,modeled_direct_cost_cents,expected_margin_percent,source_reference,evidence,source_observed_at)
 values(v_key,v_sku,'TESTER_RESEARCH',coalesce(p_packet->>'evidence_status','UNKNOWN'),p_packet->>'confidence',p_packet->>'geography_scope',
  nullif(p_packet->>'researched_price_cents','')::int,nullif(p_packet->>'minimum_viable_price_cents','')::int,nullif(p_packet->>'modeled_direct_cost_cents','')::int,nullif(p_packet->>'expected_margin_percent','')::numeric,
  p_packet->>'source_reference',coalesce(p_packet->'evidence','{}'::jsonb),nullif(p_packet->>'source_updated_at','')::timestamptz)
 on conflict(packet_key) do update set evidence_status=excluded.evidence_status,confidence=excluded.confidence,geography_scope=excluded.geography_scope,
 researched_price_cents=excluded.researched_price_cents,minimum_viable_price_cents=excluded.minimum_viable_price_cents,modeled_direct_cost_cents=excluded.modeled_direct_cost_cents,
 expected_margin_percent=excluded.expected_margin_percent,source_reference=excluded.source_reference,evidence=excluded.evidence,source_observed_at=excluded.source_observed_at,ingested_at=now();
 return jsonb_build_object('status','ACKNOWLEDGED','packet_key',v_key,'canonical_sku',v_sku,'evidence_origin','TESTER_RESEARCH','price_mutated',false);
end $$;
revoke all on function private.dd_ingest_tester_economics_packet(jsonb) from public,anon,authenticated;
grant execute on function private.dd_ingest_tester_economics_packet(jsonb) to service_role;

create or replace function private.dd_refresh_economics_calibration()
returns jsonb language plpgsql security invoker set search_path='public','private' as $$
declare n int:=0;
begin
 perform public.dd_refresh_job_economics_feedback();

 insert into public.dd_economics_evidence_intake(packet_key,canonical_sku,evidence_origin,evidence_status,researched_price_cents,modeled_direct_cost_cents,expected_margin_percent,source_reference,evidence,source_observed_at)
 select 'PROD_ACTUAL:'||f.job_id::text, f.canonical_sku,'PRODUCTION_ACTUAL',f.evidence_status,
        round(f.revenue_collected*100)::int,round(f.known_provider_cost*100)::int,f.known_margin_percent,
        f.job_id::text,f.evidence,f.calculated_at
 from public.dd_job_economics_feedback f
 where f.canonical_sku is not null and f.evidence_status in ('PARTIAL_ACTUALS','VERIFIED_ACTUALS','ACTUALS')
 on conflict(packet_key) do update set evidence_status=excluded.evidence_status,researched_price_cents=excluded.researched_price_cents,
 modeled_direct_cost_cents=excluded.modeled_direct_cost_cents,expected_margin_percent=excluded.expected_margin_percent,evidence=excluded.evidence,source_observed_at=excluded.source_observed_at,ingested_at=now();

 insert into public.dd_economics_calibration_state(
 canonical_sku,tester_research_samples,production_actual_samples,tester_researched_price_cents,tester_minimum_viable_price_cents,tester_modeled_direct_cost_cents,
 actual_avg_revenue_cents,actual_avg_direct_cost_cents,actual_avg_margin_percent,calibration_status,evidence_mix,refreshed_at)
 select canonical_sku,
 count(*) filter(where evidence_origin='TESTER_RESEARCH'),
 count(*) filter(where evidence_origin='PRODUCTION_ACTUAL'),
 round(avg(researched_price_cents) filter(where evidence_origin='TESTER_RESEARCH'))::int,
 round(avg(minimum_viable_price_cents) filter(where evidence_origin='TESTER_RESEARCH'))::int,
 round(avg(modeled_direct_cost_cents) filter(where evidence_origin='TESTER_RESEARCH'))::int,
 round(avg(researched_price_cents) filter(where evidence_origin='PRODUCTION_ACTUAL'))::int,
 round(avg(modeled_direct_cost_cents) filter(where evidence_origin='PRODUCTION_ACTUAL'))::int,
 round(avg(expected_margin_percent) filter(where evidence_origin='PRODUCTION_ACTUAL'),2),
 case when count(*) filter(where evidence_origin='PRODUCTION_ACTUAL')>=5 then 'ACTUALS_WEIGHTED'
      when count(*) filter(where evidence_origin='PRODUCTION_ACTUAL')>0 then 'RESEARCH_PLUS_EARLY_ACTUALS'
      when count(*) filter(where evidence_origin='TESTER_RESEARCH')>0 then 'RESEARCH_ONLY' else 'NO_EVIDENCE' end,
 jsonb_build_object('tester_research',count(*) filter(where evidence_origin='TESTER_RESEARCH'),'production_actuals',count(*) filter(where evidence_origin='PRODUCTION_ACTUAL'),
 'precedence_rule','Production actuals supersede matching modeled assumptions; Tester research remains prior/benchmark evidence; no automatic price mutation.'),
 now()
 from public.dd_economics_evidence_intake
 group by canonical_sku
 on conflict(canonical_sku) do update set tester_research_samples=excluded.tester_research_samples,production_actual_samples=excluded.production_actual_samples,
 tester_researched_price_cents=excluded.tester_researched_price_cents,tester_minimum_viable_price_cents=excluded.tester_minimum_viable_price_cents,
 tester_modeled_direct_cost_cents=excluded.tester_modeled_direct_cost_cents,actual_avg_revenue_cents=excluded.actual_avg_revenue_cents,
 actual_avg_direct_cost_cents=excluded.actual_avg_direct_cost_cents,actual_avg_margin_percent=excluded.actual_avg_margin_percent,
 calibration_status=excluded.calibration_status,evidence_mix=excluded.evidence_mix,refreshed_at=now();
 get diagnostics n=row_count;
 return jsonb_build_object('status','COMPLETED','services_calibrated',n,'price_mutated',false,'actuals_precedence',true);
end $$;
revoke all on function private.dd_refresh_economics_calibration() from public,anon,authenticated;
grant execute on function private.dd_refresh_economics_calibration() to service_role;
