
create or replace function public.dd_consume_sales_research_intelligence(p_limit int default 20)
returns jsonb language plpgsql security definer set search_path='public','pg_catalog'
as $function$
declare r record; v_n int:=0;
begin
 for r in
  select h.id hit_id,h.observation_id,o.subject_name,o.raw_payload,o.source_key
  from public.dd_intelligence_miner_hits h join public.dd_intelligence_observations o on o.id=h.observation_id
  where h.route_target='SALES_RESEARCH' and h.route_state='VERIFY'
  order by h.created_at limit greatest(1,least(coalesce(p_limit,20),100)) for update of h skip locked
 loop
  insert into public.dd_research_work_queue(program_key,work_key,question,required_evidence,priority,status,next_action,owner_decision_required,metadata)
  values('CUSTOMER_MARKET_INTELLIGENCE','SALES_VERIFY:'||r.observation_id::text,
   'Verify current company, role, usable business contact route, geographic/service relevance, and any explicit current service need for '||coalesce(r.subject_name,'this observed relationship')||'. Do not infer purchase intent from a connection invitation.',
   'Current authoritative company/contact evidence plus explicit need/intent evidence if any. Preserve source provenance and distinguish relationship evidence from buying intent.',
   'P0','QUEUED','Use existing research/source machinery. If no authoritative source is available, route to source discovery rather than inventing data.',false,
   jsonb_build_object('observation_id',r.observation_id,'intelligence_hit_id',r.hit_id,'source_key',r.source_key,'raw_observation',r.raw_payload,
     'external_contact_authorized',false,'purchase_intent_may_be_invented',false,'sales_cash_path',true))
  on conflict(work_key) do update set updated_at=now();
  update public.dd_intelligence_miner_hits set route_state='RESEARCH',updated_at=now() where id=r.hit_id;
  v_n:=v_n+1;
 end loop;
 return jsonb_build_object('status','COMPLETED','sales_verify_hits_consumed',v_n,'external_contact',false,'purchase_intent_invented',false);
end
$function$;
