-- OP1M: idempotent source-controlled reconciliation of the packaging discovery draft.
-- Production already contains this key; never reset owner edits, approval or publish evidence.
-- Demand validation only: this is not a released SKU or verified buyer.
insert into public.dd_acquisition_content_v1
(content_key,campaign_key,platform,series_name,funnel_role,service_sku,hook,content_brief,cta,proof_requirement,status,external_publish_authorized,source_attribution,metadata)
select
 'OP1M:FB:PACKAGING_SEAL_DISCOVERY','OP1M_CREATOR_ENGINE','FACEBOOK',
 'OPERATION_1M_BUILD_IN_PUBLIC','DEMAND_VALIDATION',null,
 'I saw a dessert-container sticker and started thinking about the businesses that could use it.',
 'Founder discovery story. Ask bakers about container dimensions, quantities, refrigeration and reorder needs. Distinguish ordinary closure stickers from independently verified tamper-evident seals. No unverified supplier claims or prices.',
 'If you sell desserts or packaged products, what labels or seals do you need? Share your container type and approximate quantity.',
 'Rights-cleared illustrative concept only. Do not present as a fulfilled DANI job.',
 'DRAFT',false,'facebook_personal',
 '{"offer_state":"UNVERIFIED","release_gate":"LIVE_READY_REQUIRED_FOR_PURCHASE_CTA","no_verified_buyers":true,"external_publish":false,"paid_spend":false,"fulfillment_candidates":["PRINTIFY","CHRIS","SPECIALTY_SUPPLIER"]}'::jsonb
where exists(select 1 from public.dd_acquisition_campaigns_v1 where campaign_key='OP1M_CREATOR_ENGINE')
on conflict(content_key) do nothing;

-- A demand-validation post MAY be approved and published with owner permission.
-- Guard only against transforming unverified demand into a purchase-ready offer.
-- Do not gate legitimate educational/discovery content on product sellability.
create or replace function public.dd_op1m_packaging_discovery_guard_v1()
returns trigger language plpgsql set search_path=public as $$
begin
 if new.content_key='OP1M:FB:PACKAGING_SEAL_DISCOVERY'
    and coalesce(new.metadata->>'offer_state','UNVERIFIED') <> 'LIVE_READY_VERIFIED'
    and (new.service_sku is not null
         or new.funnel_role in ('CONVERSION','PURCHASE','CHECKOUT')
         or coalesce(new.metadata->>'purchase_cta_enabled','false')='true') then
   raise exception 'Packaging offer not verified: no product SKU, checkout or purchase CTA until release gates pass';
 end if;
 return new;
end $$;
drop trigger if exists dd_op1m_packaging_discovery_guard_v1 on public.dd_acquisition_content_v1;
create trigger dd_op1m_packaging_discovery_guard_v1
before insert or update on public.dd_acquisition_content_v1
for each row execute function public.dd_op1m_packaging_discovery_guard_v1();
