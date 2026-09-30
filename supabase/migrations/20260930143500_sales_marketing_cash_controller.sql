-- Sales/marketing truth + weekly cash controller. Synthetic Tester sales are excluded from real-money metrics; external contact and paid spend remain fail-closed.
create table if not exists public.dd_owned_audience_assets(
 id uuid primary key default gen_random_uuid(), asset_key text not null unique, owner_person_key text not null default 'WORLD_DANIELLE_HUMAN',
 platform text not null, account_scope text not null check(account_scope in ('PERSONAL_CREATOR','DANI_BUSINESS','GROUP_COMMUNITY','OTHER')),
 audience_size numeric,audience_size_qualifier text,monetization_state text not null default 'UNKNOWN' check(monetization_state in ('MONETIZED','NOT_MONETIZED','UNKNOWN','NOT_APPLICABLE')),
 evidence_state text not null default 'OWNER_STATED' check(evidence_state in ('OWNER_STATED','DOCUMENTED','PLATFORM_VERIFIED','HISTORICAL','UNKNOWN')),
 usable_for_dani_organic boolean not null default true,paid_spend_required boolean not null default false,notes text,metadata jsonb not null default '{}'::jsonb,
 observed_at timestamptz not null default now(),created_at timestamptz not null default now(),updated_at timestamptz not null default now());
alter table public.dd_owned_audience_assets enable row level security;
revoke all on public.dd_owned_audience_assets from public,anon,authenticated; grant select,insert,update,delete on public.dd_owned_audience_assets to service_role;
create policy dd_owned_audience_assets_service_role_all on public.dd_owned_audience_assets for all to service_role using(true) with check(true);

create table if not exists public.dd_marketing_action_queue(
 id uuid primary key default gen_random_uuid(),action_key text not null unique,action_type text not null check(action_type in ('SOCIAL_POST_DRAFT','DIRECT_FOLLOWUP_PREP','INBOUND_RESPONSE_PREP','CALL_PREP','CAMPAIGN_TEST','AUDIENCE_REFRESH')),
 platform text,audience_asset_key text references public.dd_owned_audience_assets(asset_key),sales_queue_id uuid references public.dd_sales_queue(id) on delete set null,
 owner_horizon text not null default 'WEEKLY' check(owner_horizon in ('WEEKLY','MONTHLY','LONG_TERM')),priority text not null default 'P1' check(priority in ('P0','P1','P2')),
 status text not null default 'READY' check(status in ('READY','HELD','OWNER_REVIEW','COMPLETED','CANCELLED')),objective text not null,recommended_action text not null,
 offer_constraint text,external_action_authorized boolean not null default false,paid_spend_authorized boolean not null default false,evidence jsonb not null default '{}'::jsonb,result jsonb not null default '{}'::jsonb,
 created_at timestamptz not null default now(),updated_at timestamptz not null default now(),completed_at timestamptz);
alter table public.dd_marketing_action_queue enable row level security;
revoke all on public.dd_marketing_action_queue from public,anon,authenticated; grant select,insert,update,delete on public.dd_marketing_action_queue to service_role;
create policy dd_marketing_action_queue_service_role_all on public.dd_marketing_action_queue for all to service_role using(true) with check(true);

create or replace view public.dd_real_sales_engine_v1 with (security_invoker=true) as
select * from public.dd_sales_engine_v1 where not coalesce((sales_metadata->>'synthetic_only')::boolean,false) and not coalesce((sales_metadata->>'exclude_from_real_sales_metrics')::boolean,false);

CREATE OR REPLACE FUNCTION public.dd_snapshot_real_lead_source_performance()
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'pg_temp'
AS $function$
declare v_rows int:=0;
begin
 if current_user not in ('postgres','service_role') then raise exception 'service_role required'; end if;
 delete from public.dd_lead_source_performance_snapshots where snapshot_date=current_date;
 insert into public.dd_lead_source_performance_snapshots(snapshot_date,source,lead_count,quoted_count,converted_count,quoted_amount,amount_collected)
 select current_date,coalesce(source,'UNKNOWN'),count(*),
 count(*) filter(where quoted_amount is not null and quoted_amount>0),
 count(*) filter(where amount_collected>0),
 coalesce(sum(quoted_amount),0),coalesce(sum(amount_collected),0)
 from public.dd_real_sales_engine_v1 group by coalesce(source,'UNKNOWN');
 get diagnostics v_rows=row_count;
 return jsonb_build_object('status','COMPLETED','sources_snapshotted',v_rows,'synthetic_excluded',true,'production_mutation',false);
end $function$
;

CREATE OR REPLACE FUNCTION public.dd_run_sales_marketing_cash_controller()
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'pg_temp'
AS $function$
declare v_actions int:=0; v_brain int:=0; v_snapshot jsonb;
begin
 if current_user not in ('postgres','service_role') then raise exception 'service_role required'; end if;
 select public.dd_snapshot_real_lead_source_performance() into v_snapshot;

 insert into public.dd_marketing_action_queue(action_key,action_type,platform,audience_asset_key,sales_queue_id,owner_horizon,priority,status,objective,recommended_action,offer_constraint,evidence)
 select 'FOLLOWUP:'||s.id,
   case when s.lane='INBOUND' then 'INBOUND_RESPONSE_PREP' when s.phone is not null then 'CALL_PREP' else 'DIRECT_FOLLOWUP_PREP' end,
   case when s.source like 'LINKEDIN%' then 'LINKEDIN' when s.source='HUBSPOT_DEAL' then 'CRM' else s.source end,
   case when s.source like 'LINKEDIN%' then 'OWNER_DANI:LINKEDIN' else null end,
   s.id,'WEEKLY',
   case when s.lane='INBOUND' or lower(coalesce(s.notes,'')) like '%followed up%' or lower(coalesce(s.notes,'')) like '%asked directly%' then 'P0' else 'P1' end,
   'READY',
   'Convert a real existing human buying/relationship signal into a qualified conversation without fabricating intent or bypassing contact governance.',
   case when s.lane='INBOUND' then 'Review the original inbound request and prepare a direct response tied only to currently governed offers.'
        when lower(coalesce(s.notes,'')) like '%followed up%' then 'Respond to the person who re-opened the conversation; resolve their message before pitching.'
        when lower(coalesce(s.notes,'')) like '%asked directly%' then 'Answer the prospect''s direct question first, then bridge to a governed DANI capability if relevant.'
        when s.phone is not null then 'Prepare a discovery call around current pain, timing, authority and existing workaround.'
        else 'Prepare a relationship-aware follow-up; do not mass-send.' end,
   'Only use governed/released offer language. No auto-send, no unverified price promise, no paid spend.',
   jsonb_build_object('source',s.source,'lane',s.lane,'priority_score',s.priority_score,'notes',s.notes,'synthetic_only',false)
 from public.dd_real_sales_engine_v1 s
 where s.disposition='NOT_CONTACTED' and not coalesce(s.do_not_contact,false)
   and (s.lane='INBOUND' or s.phone is not null or s.email is not null or lower(coalesce(s.notes,'')) like '%followed up%' or lower(coalesce(s.notes,'')) like '%asked directly%')
 on conflict(action_key) do nothing;
 get diagnostics v_actions=row_count;

 insert into public.dd_marketing_action_queue(action_key,action_type,platform,audience_asset_key,owner_horizon,priority,status,objective,recommended_action,offer_constraint,evidence)
 values
 ('SOCIAL:FACEBOOK:WEEKLY_CASH','SOCIAL_POST_DRAFT','FACEBOOK','OWNER_DANI:FACEBOOK_PERSONAL','WEEKLY','P0','READY','Generate same-day qualified local demand from the owner''s monetized Facebook audience without paid ads.','Prepare one buyer/problem-based organic post using only a currently governed service/CTA; preserve source attribution as facebook_personal.','No auto-publish. No paid boost. Do not advertise a service whose release/economics/fulfillment gates are unresolved.',jsonb_build_object('audience','monetized strong organic reach','exact_count_verified',false,'one_photo_per_post_cycle',true)),
 ('SOCIAL:NEXTDOOR:WEEKLY_CASH','SOCIAL_POST_DRAFT','NEXTDOOR','OWNER_DANI:NEXTDOOR','WEEKLY','P0','READY','Generate geographically relevant local demand without paid Nextdoor advertising.','Prepare one local problem/availability post using only a currently governed service/CTA; preserve source attribution as nextdoor.','No paid ads. No auto-publish. Governed services only.',jsonb_build_object('local',true,'paid_ads',false,'one_photo_per_post_cycle',true)),
 ('SOCIAL:LINKEDIN:WEEKLY_CASH','SOCIAL_POST_DRAFT','LINKEDIN','OWNER_DANI:LINKEDIN','WEEKLY','P0','READY','Create B2B demand from existing LinkedIn relationships and professional audience.','Prepare one property/real-estate/business execution post with a conversation CTA and source attribution as linkedin.','No auto-publish. Do not promise blocked property-turn pricing. Governed services only.',jsonb_build_object('b2b',true,'one_photo_per_post_cycle',true)),
 ('SOCIAL:INSTAGRAM:WEEKLY_CASH','SOCIAL_POST_DRAFT','INSTAGRAM','OWNER_DANI:INSTAGRAM','WEEKLY','P1','READY','Reactivate historical Instagram reach as an owned organic sales surface.','Prepare one visual proof/problem post; current audience size must not be stated as 5K unless reverified.','No auto-publish. Historical 5K+ evidence is not a current follower claim. Governed services only.',jsonb_build_object('historical_followers_min',5000,'current_count_verified',false,'one_photo_per_post_cycle',true))
 on conflict(action_key) do nothing;
 get diagnostics v_brain=row_count;
 v_actions:=v_actions+v_brain;

 insert into public.dd_learning_evidence_intake(evidence_key,evidence_origin,domain,source_system,source_reference,observation,evidence_payload,authority_class,requires_new_test,status)
 values('TESTER:SALES_MARKETING_CONTROLLER:'||current_date::text,'TESTER','MARKETING','SUPABASE_TESTER','dd_run_sales_marketing_cash_controller',
 'Sales/marketing cash controller prepared real-human follow-up work and owned-organic social actions while excluding synthetic sales records and prohibiting auto-send/auto-publish/paid spend.',
 jsonb_build_object('actions_new',v_actions,'source_snapshot',v_snapshot,'owner_horizon','WEEKLY','external_contact',false,'paid_spend',false,'synthetic_excluded',true),
 'RUNTIME',true,'NEW')
 on conflict(evidence_key) do update set observation=excluded.observation,evidence_payload=excluded.evidence_payload,updated_at=now();

 return jsonb_build_object('status','COMPLETED','new_actions',v_actions,'source_snapshot',v_snapshot,'brain_evidence_written',true,'external_contact',false,'paid_spend',false,'production_mutation',false);
end $function$
;

CREATE OR REPLACE FUNCTION public.dd_run_autonomous_body_closure_cycle()
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'pg_temp'
AS $function$
declare
 v_work jsonb; v_operating jsonb; v_external jsonb; v_research jsonb; v_synthesis jsonb; v_delivery jsonb; v_source_coverage jsonb; v_directives jsonb; v_owner_horizons jsonb; v_cash_conversion jsonb; v_sales_marketing jsonb;
 v_safe_recipe uuid; v_advance jsonb; v_audit jsonb; v_safe uuid; v_health uuid; v_automation_health uuid; v_workforce jsonb; v_organism jsonb; v_world_match jsonb;
begin
 select public.dd_refresh_remaining_work_queue() into v_work;
 select public.dd_consume_internal_scheduled_operating_work(10) into v_operating;
 select public.dd_dispatch_external_scheduled_operating_work(20) into v_external;
 select public.dd_reconcile_source_discovery_coverage() into v_source_coverage;
 select public.dd_execute_research_work_v1(8) into v_research;
 select public.dd_refresh_owner_horizon_attention() into v_owner_horizons;
 select public.dd_prepare_weekly_cash_conversion_queue(25) into v_cash_conversion;
 select public.dd_run_sales_marketing_cash_controller() into v_sales_marketing;
 select public.dd_type_reverify_research_directives() into v_directives;
 select public.dd_run_research_synthesis_worker() into v_synthesis;
 select public.dd_reconcile_world_service_match_research(100) into v_world_match;
 select public.dd_run_synthetic_workforce_machine_economics(100) into v_workforce;
 select public.dd_run_dani_brain_delivery_worker(10,'AUTONOMOUS_BODY_CLOSURE') into v_delivery;
 select public.dd_run_safe_automation_recipes() into v_safe_recipe;
 select public.dd_run_ecosystem_candidate_advancement_controller(50) into v_advance;
 select public.dd_run_active_audit_subproofs(50) into v_audit;
 select public.dd_run_next_safe_runtime_proof() into v_safe;
 select public.dd_run_core_runtime_health_proof() into v_health;
 select public.dd_run_automation_health_supervisor() into v_automation_health;
 select public.dd_refresh_remaining_work_queue() into v_work;
 select public.dd_run_end_to_end_organism_audit() into v_organism;
 return jsonb_build_object('status','COMPLETED','remaining_work_refresh',v_work,'scheduled_operating_work',v_operating,
   'external_operating_handoff',v_external,'source_discovery_reconciliation',v_source_coverage,'research_execution',v_research,'owner_horizon_attention',v_owner_horizons,'weekly_cash_conversion',v_cash_conversion,'sales_marketing_cash_controller',v_sales_marketing,'research_directive_typing',v_directives,'research_synthesis',v_synthesis,'world_service_match_reconciliation',v_world_match,
   'synthetic_workforce_machine_economics',v_workforce,'brain_delivery',v_delivery,'safe_automation_recipe_receipt',v_safe_recipe,
   'candidate_advancement',v_advance,'audit_subproofs',v_audit,'safe_runtime_receipt',v_safe,
   'runtime_health_receipt',v_health,'automation_handoff_health_receipt',v_automation_health,'end_to_end_organism_audit',v_organism,
   'composition_policy','REUSE_EXISTING_WORKERS','production_mutation_authorized',false,
   'external_contact_authorized',false,'money_action_authorized',false);
end $function$
;
revoke execute on function public.dd_snapshot_real_lead_source_performance() from public,anon,authenticated; grant execute on function public.dd_snapshot_real_lead_source_performance() to service_role;
revoke execute on function public.dd_run_sales_marketing_cash_controller() from public,anon,authenticated; grant execute on function public.dd_run_sales_marketing_cash_controller() to service_role;
