-- Operation $1M, 2026-10-07: owner-home queue, scorecard, autonomy count fix, and proof-function lockdown.
-- Captured verbatim from Production after Claude's changes so repository history matches the live database.
-- Both views remain security_invoker=true.

CREATE OR REPLACE VIEW public.dd_owner_home_sales_queue_v1
WITH (security_invoker=true)
AS
 WITH oh AS (
         SELECT dd_owner_home_live_sellable_v1.sku
           FROM dd_owner_home_live_sellable_v1
        ), base AS (
         SELECT s.id,
            s.company_name,
            s.contact_name,
            s.sales_metadata ->> 'channel_code'::text AS channel_code,
            s.disposition,
            s.campaign_status,
            s.suggested_sku,
            r.release_state AS offer_state,
            s.intent_tier,
            s.amount_collected,
            s.quoted_amount,
            s.next_action,
            s.last_contacted_at,
            s.next_permitted_contact_at,
            s.contact_pressure_state,
            upper(COALESCE(s.source_direction, ''::text)) = 'INBOUND'::text OR (s.disposition = ANY (ARRAY['DECISION_MAKER_REACHED'::text, 'EXISTING_VENDOR_REVISIT'::text, 'QUOTE_REQUESTED'::text, 'READY_TO_BUY'::text])) OR COALESCE(s.amount_collected, 0::numeric) > 0::numeric OR upper(COALESCE(s.campaign_status, ''::text)) = 'RESPONDED'::text AS warm,
            s.pain_point IS NOT NULL OR (s.intent_tier = ANY (ARRAY['HIGH'::text, 'TRANSACTION'::text])) OR (s.disposition = ANY (ARRAY['QUOTE_REQUESTED'::text, 'READY_TO_BUY'::text])) AS explicit_need,
            COALESCE(r.release_state = 'LIVE_READY'::text, false) AS live_offer,
            (s.email IS NOT NULL OR s.phone IS NOT NULL) AND upper(COALESCE(s.campaign_status, ''::text)) <> 'BOUNCED'::text AS contact_route,
            COALESCE((s.suggested_sku IN ( SELECT oh.sku
                   FROM oh)), false) AS home_fulfillable,
            (s.disposition = ANY (ARRAY['QUOTE_REQUESTED'::text, 'READY_TO_BUY'::text])) OR COALESCE(s.quoted_amount, 0::numeric) > 0::numeric AS payment_path,
            COALESCE(s.sales_metadata ->> 'routine_outreach_suppressed'::text, 'false'::text) = 'true'::text OR s.next_action ~~* '%RELATIONSHIP RECOVERY HOLD%'::text OR s.next_action ~~* '%owner-sent%'::text AS owner_only
           FROM dd_sales_queue s
             LEFT JOIN dd_service_release_contract_v1 r ON r.canonical_sku = s.suggested_sku
          WHERE COALESCE(s.do_not_contact, false) = false AND (s.disposition <> ALL (ARRAY['NOT_INTERESTED'::text, 'CLOSED_LOST'::text])) AND (COALESCE((s.sales_metadata -> 'channel_tag_20261006'::text) ->> 'status'::text, ''::text) <> ALL (ARRAY['PARTNER_NOT_BUYER'::text, 'TEST_RECORD'::text]))
        ), scored AS (
         SELECT b.id,
            b.company_name,
            b.contact_name,
            b.channel_code,
            b.disposition,
            b.campaign_status,
            b.suggested_sku,
            b.offer_state,
            b.intent_tier,
            b.amount_collected,
            b.quoted_amount,
            b.next_action,
            b.last_contacted_at,
            b.next_permitted_contact_at,
            b.contact_pressure_state,
            b.warm,
            b.explicit_need,
            b.live_offer,
            b.contact_route,
            b.home_fulfillable,
            b.payment_path,
            b.owner_only,
                CASE
                    WHEN b.warm THEN 32
                    ELSE 0
                END +
                CASE
                    WHEN b.explicit_need THEN 16
                    ELSE 0
                END +
                CASE
                    WHEN b.live_offer THEN 8
                    ELSE 0
                END +
                CASE
                    WHEN b.contact_route THEN 4
                    ELSE 0
                END +
                CASE
                    WHEN b.home_fulfillable THEN 2
                    ELSE 0
                END +
                CASE
                    WHEN b.payment_path THEN 1
                    ELSE 0
                END AS rank_score,
            row_number() OVER (PARTITION BY (lower(COALESCE(NULLIF(b.company_name, ''::text), b.contact_name, b.id::text))) ORDER BY b.warm DESC, b.explicit_need DESC, b.live_offer DESC, b.contact_route DESC) AS company_slot
           FROM base b
        )
 SELECT id,
    company_name,
    contact_name,
    channel_code,
    disposition,
    campaign_status,
    suggested_sku,
    offer_state,
    intent_tier,
    amount_collected,
    quoted_amount,
    next_action,
    last_contacted_at,
    next_permitted_contact_at,
    contact_pressure_state,
    warm,
    explicit_need,
    live_offer,
    contact_route,
    home_fulfillable,
    payment_path,
    owner_only,
    rank_score,
    company_slot,
        CASE
            WHEN disposition = 'PAYMENT_SUCCEEDED'::text THEN 'Close out fulfillment + QA, then ask for repeat/referral (owner)'::text
            WHEN owner_only THEN 'OWNER ONLY: owner-sent message, no automated outreach'::text
            WHEN suggested_sku IS NULL THEN 'Match to an existing LIVE_READY offer from stated need before any outreach'::text
            WHEN NOT live_offer THEN 'Offer held: repair release gate before quoting'::text
            WHEN NOT contact_route THEN 'Find verified route (no guessed emails)'::text
            WHEN payment_path THEN 'Send governed quote + 53.5% initial payment link'::text
            ELSE 'Prepare governed outreach via danideclaresns@gmail.com (respect cadence)'::text
        END AS next_exact_action
   FROM scored
  WHERE company_slot = 1
  ORDER BY rank_score DESC, last_contacted_at NULLS FIRST;

CREATE OR REPLACE VIEW public.dd_operation_1m_scorecard_v1
WITH (security_invoker=true)
AS
 WITH pay AS (
         SELECT p.id,
            p.provider,
            p.provider_event_id,
            p.provider_payment_id,
            p.request_id,
            p.job_id,
            p.invoice_id,
            p.change_order_id,
            p.event_type,
            p.payment_status,
            p.amount_received,
            p.currency,
            p.raw_metadata,
            p.created_at,
            j.estimate_id,
            e.intake_answers ->> 'suggested_sku'::text AS sku
           FROM dd_payment_events p
             LEFT JOIN dd_jobs j ON j.id = p.job_id
             LEFT JOIN dd_estimates e ON e.id = j.estimate_id
          WHERE p.payment_status = 'succeeded'::text
        ), real_est AS (
         SELECT dd_estimates.id,
            dd_estimates.public_reference,
            dd_estimates.division_slug,
            dd_estimates.source_slug,
            dd_estimates.lead_id,
            dd_estimates.service_request_id,
            dd_estimates.client_name,
            dd_estimates.client_phone,
            dd_estimates.client_email,
            dd_estimates.client_type,
            dd_estimates.organization_name,
            dd_estimates.location_address,
            dd_estimates.city,
            dd_estimates.state,
            dd_estimates.zip_code,
            dd_estimates.timeline,
            dd_estimates.rush_requested,
            dd_estimates.requested_date,
            dd_estimates.intake_answers,
            dd_estimates.upload_summary,
            dd_estimates.client_notes,
            dd_estimates.internal_notes,
            dd_estimates.estimate_status,
            dd_estimates.priority,
            dd_estimates.base_subtotal,
            dd_estimates.addon_subtotal,
            dd_estimates.travel_fee,
            dd_estimates.rush_fee,
            dd_estimates.supplies_fee,
            dd_estimates.pass_through_fee,
            dd_estimates.tax_amount,
            dd_estimates.estimated_total,
            dd_estimates.deposit_due,
            dd_estimates.quote_disclaimer,
            dd_estimates.created_at,
            dd_estimates.updated_at,
            dd_estimates.economics_status,
            dd_estimates.assignment_readiness_status,
            dd_estimates.active_economics_snapshot_id,
            dd_estimates.market_id,
            dd_estimates.market_code,
            dd_estimates.jurisdiction_snapshot
           FROM dd_estimates
          WHERE NULLIF(TRIM(BOTH FROM COALESCE(dd_estimates.client_name, dd_estimates.organization_name, ''::text)), ''::text) IS NOT NULL AND (lower(COALESCE(dd_estimates.client_email, ''::text)) <> ALL (ARRAY['danideclaresns@gmail.com'::text, 'vendors@danideclares.com'::text])) AND (COALESCE(dd_estimates.client_name, ''::text) <> ALL (ARRAY['q'::text, 'Danielle Williams'::text, 'Danielle Fong'::text])) AND COALESCE(dd_estimates.internal_notes, ''::text) !~~* '%synthetic%'::text AND COALESCE(dd_estimates.client_name, ''::text) !~~* '%test%'::text
        )
 SELECT now() AS as_of,
    ( SELECT COALESCE(sum(pay.amount_received), 0::numeric) AS "coalesce"
           FROM pay) AS cash_collected,
    ( SELECT count(*) AS count
           FROM real_est
          WHERE lower(COALESCE(real_est.estimate_status, ''::text)) <> ALL (ARRAY['won'::text, 'accepted'::text, 'lost'::text, 'declined'::text, 'cancelled'::text, 'canceled'::text, 'expired'::text, 'converted'::text])) AS quotes_outstanding,
    ( SELECT COALESCE(sum(real_est.estimated_total), 0::numeric) AS "coalesce"
           FROM real_est
          WHERE lower(COALESCE(real_est.estimate_status, ''::text)) <> ALL (ARRAY['won'::text, 'accepted'::text, 'lost'::text, 'declined'::text, 'cancelled'::text, 'canceled'::text, 'expired'::text, 'converted'::text])) AS quotes_outstanding_value,
    ( SELECT count(*) AS count
           FROM dd_jobs
          WHERE (upper(COALESCE(dd_jobs.job_status, ''::text)) <> ALL (ARRAY['COMPLETED'::text, 'CANCELLED'::text, 'CLOSED'::text])) AND COALESCE(dd_jobs.internal_notes, ''::text) !~~* '%synthetic%'::text) AS active_jobs,
    ( SELECT COALESCE(sum(pay.amount_received), 0::numeric) AS "coalesce"
           FROM pay
          WHERE (pay.sku IN ( SELECT dd_owner_home_service_priority.canonical_sku
                   FROM dd_owner_home_service_priority
                  WHERE dd_owner_home_service_priority.home_executable))) AS owner_home_revenue,
    ( SELECT COALESCE(sum(pay.amount_received), 0::numeric) AS "coalesce"
           FROM pay
          WHERE pay.sku IS NOT NULL AND NOT (pay.sku IN ( SELECT dd_owner_home_service_priority.canonical_sku
                   FROM dd_owner_home_service_priority
                  WHERE dd_owner_home_service_priority.home_executable))) AS provider_field_revenue,
    ( SELECT COALESCE(sum(pay.amount_received), 0::numeric) AS "coalesce"
           FROM pay
          WHERE pay.sku IS NULL) AS unattributed_revenue,
    ( SELECT jsonb_object_agg(x.division, x.n) AS jsonb_object_agg
           FROM ( SELECT dd_service_release_contract_v1.division,
                    count(*) AS n
                   FROM dd_service_release_contract_v1
                  WHERE dd_service_release_contract_v1.release_state = 'LIVE_READY'::text
                  GROUP BY dd_service_release_contract_v1.division) x) AS live_ready_by_division,
    ( SELECT count(*) AS count
           FROM dd_service_release_contract_v1
          WHERE dd_service_release_contract_v1.release_state = 'LIVE_READY'::text) AS live_ready_total,
    ( SELECT count(*) AS count
           FROM dd_owner_home_live_sellable_v1) AS owner_home_live_ready,
    ( SELECT jsonb_object_agg(y.ch, y.n) AS jsonb_object_agg
           FROM ( SELECT COALESCE(dd_sales_queue.sales_metadata ->> 'channel_code'::text, 'UNTAGGED'::text) AS ch,
                    count(*) AS n
                   FROM dd_sales_queue
                  WHERE COALESCE(dd_sales_queue.do_not_contact, false) = false AND ((dd_sales_queue.disposition = ANY (ARRAY['DECISION_MAKER_REACHED'::text, 'QUOTE_REQUESTED'::text, 'READY_TO_BUY'::text, 'PAYMENT_SUCCEEDED'::text, 'EXISTING_VENDOR_REVISIT'::text])) OR upper(COALESCE(dd_sales_queue.campaign_status, ''::text)) = 'RESPONDED'::text OR dd_sales_queue.last_contacted_at > (now() - '30 days'::interval))
                  GROUP BY (COALESCE(dd_sales_queue.sales_metadata ->> 'channel_code'::text, 'UNTAGGED'::text))) y) AS active_buyers_by_channel,
    ( SELECT count(*) AS count
           FROM ( SELECT j.lead_id
                   FROM dd_jobs j
                  WHERE j.lead_id IS NOT NULL AND upper(COALESCE(j.job_status, ''::text)) <> 'CANCELLED'::text AND (EXISTS ( SELECT 1
                           FROM dd_payment_events pe
                          WHERE pe.job_id = j.id AND pe.payment_status = 'succeeded'::text))
                  GROUP BY j.lead_id
                 HAVING count(DISTINCT j.id) >= 2) r) AS recurring_accounts;

CREATE OR REPLACE FUNCTION public.dd_run_revenue_first_autonomy()
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'private', 'pg_catalog'
AS $function$
declare v_id uuid:=gen_random_uuid(); v_buyers int:=0; v_verified int:=0; v_matched int:=0; v_quotes int:=0; v_followups int:=0; v_paid int:=0; v_jobs int:=0; v_recurring int:=0; v_before int:=0; v_after int:=0; v_progress int:=0; v_research boolean:=false; v_revenue jsonb; v_demand jsonb; v_intel jsonb; v_match jsonb;
begin
 insert into public.dd_revenue_autonomy_runs(id) values(v_id);
 v_demand:=private.dd_run_demand_radar(); v_intel:=public.dd_run_commercial_intelligence_cycle();
 v_match:=public.dd_match_existing_buyers_to_governed_offers(50);
 select count(*) into v_before from public.dd_estimates where source_slug='sales_queue'; v_revenue:=public.dd_run_revenue_orchestrator(); select count(*) into v_after from public.dd_estimates where source_slug='sales_queue'; v_quotes:=greatest(0,v_after-v_before);
 select count(*) into v_buyers from public.dd_sales_queue s where coalesce(s.do_not_contact,false)=false and s.disposition not in ('NOT_INTERESTED','CLOSED_LOST');
 select count(*) into v_verified from public.dd_sales_queue s where coalesce(s.do_not_contact,false)=false and (coalesce(s.decision_maker_confirmed,false)=true or upper(coalesce(s.source_direction,''))='INBOUND' or upper(coalesce(s.source_confidence,''))='VERIFIED');
 select count(*) into v_matched from public.dd_sales_queue s where coalesce(s.do_not_contact,false)=false and s.suggested_sku is not null;
 select count(*) into v_followups from public.dd_sales_queue s where coalesce(s.do_not_contact,false)=false and s.next_action_date is not null and s.next_action_date<=current_date and s.disposition not in ('NOT_INTERESTED','PAYMENT_SUCCEEDED');
 select count(*) into v_paid from public.dd_sales_queue s where coalesce(s.amount_collected,0)>0 or s.disposition='PAYMENT_SUCCEEDED';
 select count(*) into v_jobs from public.dd_jobs j where upper(coalesce(j.job_status,'')) not in ('COMPLETED','CANCELLED','CLOSED');
 select count(*) into v_recurring from public.dd_sales_queue s where (coalesce(s.amount_collected,0)>0 or s.disposition='PAYMENT_SUCCEEDED' or s.job_id is not null) and coalesce(s.do_not_contact,false)=false and coalesce(s.sales_metadata->>'recurring_reviewed','false')<>'true';
 if v_verified<10 or v_matched<5 then perform public.dd_run_research_pipeline_controller(); v_research:=true; end if;
 v_progress:=v_quotes+coalesce((v_revenue->>'verified_leads_promoted')::int,0)+coalesce((v_demand->>'promoted_count')::int,0)+coalesce((v_match->>'matched_buyers')::int,0);
 update public.dd_revenue_autonomy_runs set completed_at=now(),status=case when v_progress>0 then 'ADVANCED_REVENUE' when v_followups>0 or v_matched>0 then 'REVENUE_WORK_AVAILABLE' else 'NO_REVENUE_MOVEMENT' end,buyers_available=v_buyers,buyers_verified=v_verified,offers_matched=v_matched,quote_drafts_created=v_quotes,followups_due=v_followups,paid_sales=v_paid,active_jobs=v_jobs,recurring_candidates=v_recurring,research_triggered=v_research,revenue_progress_score=v_progress,summary=jsonb_build_object('operating_rule','FIND_BUYER_VERIFY_MATCH_ECONOMICS_OUTREACH_FOLLOWUP_QUOTE_ACCEPT_PAYMENT_DISPATCH_QA_CROSS_SELL_RECURRING_MEASURE_LEARN_REPEAT','research_rule','Research is subordinate to a revenue decision and is triggered only when verified/matched funnel inventory is insufficient.','success_rule','A run is successful only when it advances a governed revenue state; execution alone is not success.','offer_match',v_match,'demand',v_demand,'commercial_intelligence',v_intel,'revenue_orchestrator',v_revenue,'external_contact',false,'money_action',false,'pricing_published',false,'owner_boundaries_preserved',true) where id=v_id;
 return v_id;
exception when others then update public.dd_revenue_autonomy_runs set completed_at=now(),status='FAILED',summary=jsonb_build_object('error',sqlerrm) where id=v_id; raise;
end $function$
;

-- Supabase security advisor lint 0028 remediation: proof functions are internal release controls.
REVOKE EXECUTE ON FUNCTION public.dd_run_release_runtime_price_proof(text), public.dd_run_release_train_batch(text[]) FROM public, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.dd_run_release_runtime_price_proof(text), public.dd_run_release_train_batch(text[]) TO service_role;

REVOKE ALL ON public.dd_owner_home_sales_queue_v1, public.dd_operation_1m_scorecard_v1 FROM anon;

-- Production data reconciliation completed outside this schema migration:
-- * 35 FIXED SKUs registered to existing live Stripe product/price/payment-link objects; no new Stripe objects created.
-- * DNI-07A-011 initial-payment link row reconciled.
-- * 27 SKUs promoted to LIVE_READY after fresh price/runtime proofs.
-- * 8 price-display conflicts remain owner-held: 04A-023, 04A-024, 04A-025, 04A-026, 07A-011, 09A-021, 09A-022, 09A-023.
-- * 22 division-04 SKUs added to owner-home priority.
-- * Marvin White route preserved as LinkedIn owner-only.
