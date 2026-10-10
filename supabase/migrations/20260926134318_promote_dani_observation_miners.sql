begin;
-- Reusable DANI intelligence miners. These definitions only create observations/candidates.
-- They may not contact, spend, publish pricing/policy, authorize providers, or write production authority.
with m(miner_key,miner_family,miner_name,purpose,output_class,default_route) as (values
('ACCOUNTING_ECONOMICS_MINER','INTERNAL','Accounting & Economics Miner','Mine internal financial outcomes for economics signals without payment authority.',array['ECONOMIC_SIGNAL'],array['ACCOUNTING_REVIEW','ECONOMICS']),
('BUYER_INTENT_MINER','REVENUE','Buyer Intent Miner','Detect public or first-party signals that indicate active or emerging purchase intent.',array['INTENT_SIGNAL'],array['SALES','RESEARCH']),
('CONTRACT_MINER','RISK_AUTHORITY','Contract Miner','Track contracting requirements, clauses, notice obligations and procurement terms.',array['CONTRACT_SIGNAL'],array['LEGAL_REVIEW','RESEARCH']),
('CRM_MINER','INTERNAL','CRM Miner','Mine CRM history for dormant accounts, duplicates, relationships and follow-up triggers.',array['ACCOUNT_SIGNAL','REACTIVATION_SIGNAL'],array['SALES','GRAPH']),
('CUSTOMER_NEED_MINER','MARKET','Customer Need Miner','Mine questions, complaints and requests for recurring unmet needs.',array['NEED_SIGNAL'],array['RESEARCH','MARKETING']),
('ECONOMIC_MINER','MARKET','Industry & Economic Miner','Track labor, establishment, industry and local economic signals.',array['ECONOMIC_SIGNAL'],array['ECONOMICS','RESEARCH']),
('EMAIL_MINER','INTERNAL','Email Miner','Extract lead, market, vendor, government, learning and operational intelligence from authorized email.',array['LEAD','INTELLIGENCE','TRIGGER_SIGNAL'],array['SALES','RESEARCH']),
('EQUIPMENT_ASSET_MINER','SUPPLY','Equipment & Asset Miner','Identify equipment, vehicle, workspace and asset options or programs.',array['ASSET_SIGNAL'],array['CAPITAL','RESEARCH']),
('EXPANSION_TRIGGER_MINER','REVENUE','Expansion Trigger Miner','Detect openings, relocations, hiring, acquisitions, management changes and expansion events.',array['TRIGGER_SIGNAL'],array['SALES','RESEARCH']),
('GEOGRAPHY_MINER','MARKET','Geography Miner','Identify local market density, property/business activity and service-area opportunity.',array['GEOGRAPHY_SIGNAL'],array['RESEARCH','SALES']),
('JOB_QA_MINER','INTERNAL','Job & QA Miner','Mine job execution and QA outcomes for quality and service design signals.',array['QUALITY_SIGNAL'],array['QUALITY','RESEARCH']),
('LEAD_MINER','REVENUE','Lead Miner','Identify evidence-backed prospects and sales candidates.',array['LEAD','ACCOUNT','CONTACT_CANDIDATE'],array['SALES','RESEARCH']),
('LEGAL_REGULATORY_MINER','RISK_AUTHORITY','Legal & Regulatory Miner','Detect laws, regulations and official guidance changes; research only.',array['LEGAL_SIGNAL'],array['LEGAL_REVIEW','RESEARCH']),
('LICENSE_CERTIFICATION_MINER','RISK_AUTHORITY','License & Certification Miner','Track license, certification and registration requirements/opportunities.',array['COMPLIANCE_SIGNAL'],array['COMPLIANCE_REVIEW','RESEARCH']),
('MATERIALS_MINER','SUPPLY','Materials & Product Miner','Observe material/product availability and cost signals.',array['MATERIAL_SIGNAL'],array['ECONOMICS','SUPPLY']),
('PARTNERSHIP_MINER','REVENUE','Partnership & Referral Miner','Identify complementary businesses, primes, referral sources and channel partners.',array['PARTNER_CANDIDATE'],array['SALES','GRAPH']),
('PLATFORM_CHANGE_MINER','RISK_AUTHORITY','Platform Change Miner','Track changes in connected platforms, APIs, pricing and deprecations.',array['PLATFORM_SIGNAL'],array['SOFTWARE','RESEARCH']),
('PRICING_MINER','MARKET','Pricing Miner','Collect price observations and cost context without creating pricing authority.',array['PRICE_OBSERVATION'],array['ECONOMICS','RESEARCH']),
('PROCUREMENT_MINER','REVENUE','Procurement Miner','Discover RFP/RFQ/IFB, forecasts, awards, vendor registrations and subcontracting opportunities.',array['PROCUREMENT_OPPORTUNITY'],array['SALES','RESEARCH']),
('PROVIDER_PERFORMANCE_MINER','INTERNAL','Provider Performance Miner','Analyze provider execution evidence without changing provider eligibility automatically.',array['PROVIDER_SIGNAL'],array['PROVIDER_REVIEW','QUALITY']),
('PROVIDER_TALENT_MINER','SUPPLY','Provider & Talent Miner','Identify potential providers and capacity signals without granting provider eligibility.',array['PROVIDER_CANDIDATE'],array['PROVIDER_REVIEW']),
('QUOTE_LOSS_MINER','INTERNAL','Quote & Loss Miner','Find patterns in quotes, objections, losses and conversion.',array['CONVERSION_SIGNAL'],array['SALES','ECONOMICS','RESEARCH']),
('REACTIVATION_MINER','REVENUE','Reactivation Miner','Detect new triggers on prior leads, customers and dormant accounts.',array['REACTIVATION_SIGNAL'],array['SALES']),
('REVIEW_COMPLAINT_MINER','MARKET','Review & Complaint Miner','Detect recurring service failures and expectations from public/first-party reviews.',array['QUALITY_SIGNAL'],array['RESEARCH','QUALITY']),
('SEARCH_DEMAND_MINER','MARKET','Search Demand Miner','Observe search/topic demand relevant to DANI service families and markets.',array['DEMAND_SIGNAL'],array['MARKETING','RESEARCH']),
('SECURITY_THREAT_MINER','RISK_AUTHORITY','Security & Threat Miner','Detect security advisories, exposed-risk signals and platform threats.',array['SECURITY_SIGNAL'],array['SECURITY_REVIEW','SOFTWARE']),
('TAX_MINER','RISK_AUTHORITY','Tax Miner','Observe tax-rule and registration changes without creating tax authority.',array['TAX_SIGNAL'],array['ACCOUNTING_REVIEW','RESEARCH']),
('VENDOR_SUPPLIER_MINER','SUPPLY','Vendor & Supplier Miner','Identify suppliers, vendors, subcontractors and fulfillment partners.',array['SUPPLIER_CANDIDATE'],array['SUPPLY','RESEARCH']),
('WEB_BEHAVIOR_MINER','INTERNAL','Website Behavior Miner','Analyze first-party site and funnel behavior for intent and friction.',array['INTENT_SIGNAL','UX_SIGNAL'],array['SALES','PRODUCT'])
)
insert into public.dd_intelligence_miners(miner_key,miner_family,miner_name,purpose,output_class,default_route,authority_boundary,status)
select miner_key,miner_family,miner_name,purpose,output_class,default_route,
'{"may_contact":false,"may_spend_money":false,"observation_only":true,"production_write":false,"may_change_policy":false,"may_change_pricing":false}'::jsonb,'ACTIVE'
from m
on conflict(miner_key) do update set
 miner_family=excluded.miner_family,miner_name=excluded.miner_name,purpose=excluded.purpose,
 output_class=excluded.output_class,default_route=excluded.default_route,
 authority_boundary=excluded.authority_boundary,status='ACTIVE',updated_at=now();

-- Existing production-native miners (including DRIVE_INTELLIGENCE_MINER) are intentionally preserved.
commit;
