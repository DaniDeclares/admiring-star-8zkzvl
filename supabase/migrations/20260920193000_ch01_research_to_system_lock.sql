-- DANI DECLARES CH01 Resident Concierge research-to-system lock
-- Version: 2026-09-20
-- This migration persists the research-derived CH01 operating model and its
-- governance controls. It does not activate any previously gated services or
-- alter canonical runtime prices.

CREATE TABLE IF NOT EXISTS public.dd_ch01_market_evidence (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  channel_code text NOT NULL DEFAULT 'CH01' CHECK (channel_code='CH01'),
  evidence_code text NOT NULL,
  evidence_type text NOT NULL,
  subject text NOT NULL,
  geography text NOT NULL DEFAULT 'Atlanta, GA',
  observed_fact text NOT NULL,
  business_implication text NOT NULL,
  source_name text NOT NULL,
  source_url text NOT NULL,
  source_date date,
  source_kind text NOT NULL,
  basis_type text NOT NULL DEFAULT 'RESEARCH_FACT',
  status text NOT NULL DEFAULT 'LOCKED' CHECK (status IN ('LOCKED','SUPERSEDED','PENDING_REVIEW')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(channel_code,evidence_code)
);

CREATE TABLE IF NOT EXISTS public.dd_ch01_front_doors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  channel_code text NOT NULL DEFAULT 'CH01' CHECK (channel_code='CH01'),
  front_door_code text NOT NULL UNIQUE,
  front_door_name text NOT NULL,
  customer_promise text NOT NULL,
  included_service_families jsonb NOT NULL DEFAULT '[]'::jsonb,
  primary_triggers jsonb NOT NULL DEFAULT '[]'::jsonb,
  default_buying_models jsonb NOT NULL DEFAULT '[]'::jsonb,
  public_navigation_order integer NOT NULL,
  source_basis text NOT NULL,
  basis_type text NOT NULL DEFAULT 'DANI_INTERPRETATION',
  status text NOT NULL DEFAULT 'LOCKED' CHECK (status IN ('LOCKED','RETIRED','DRAFT')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.dd_ch01_commercial_triggers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  channel_code text NOT NULL DEFAULT 'CH01' CHECK (channel_code='CH01'),
  trigger_code text NOT NULL,
  trigger_name text NOT NULL,
  pain_statement text NOT NULL,
  buyer_roles jsonb NOT NULL DEFAULT '[]'::jsonb,
  entry_front_door text NOT NULL,
  recommended_entry_model text NOT NULL,
  discovery_question text NOT NULL,
  expansion_signal text,
  source_basis text NOT NULL,
  basis_type text NOT NULL DEFAULT 'DANI_INTERPRETATION',
  status text NOT NULL DEFAULT 'LOCKED' CHECK (status IN ('LOCKED','SUPERSEDED','DRAFT')),
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(channel_code,trigger_code)
);

CREATE TABLE IF NOT EXISTS public.dd_ch01_buyer_authority_map (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  channel_code text NOT NULL DEFAULT 'CH01' CHECK (channel_code='CH01'),
  buyer_role_code text NOT NULL,
  buyer_role_name text NOT NULL,
  pain_owned jsonb NOT NULL DEFAULT '[]'::jsonb,
  typical_entry_offers jsonb NOT NULL DEFAULT '[]'::jsonb,
  authorization_scope text NOT NULL,
  relationship_boundary text NOT NULL,
  procurement_handoff text NOT NULL,
  sales_question text NOT NULL,
  source_basis text NOT NULL,
  basis_type text NOT NULL DEFAULT 'DANI_INTERPRETATION',
  status text NOT NULL DEFAULT 'LOCKED' CHECK (status IN ('LOCKED','SUPERSEDED','DRAFT')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(channel_code,buyer_role_code)
);

CREATE TABLE IF NOT EXISTS public.dd_ch01_service_adjudication (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  channel_code text NOT NULL DEFAULT 'CH01' CHECK (channel_code='CH01'),
  service_id uuid NOT NULL REFERENCES public.services(id) ON DELETE CASCADE,
  sku text NOT NULL,
  service_name text NOT NULL,
  service_family text,
  disposition text NOT NULL CHECK (disposition IN ('FRONT_DOOR','SUPPORTING_LAYER','CONTROLLED_QUOTE','CROSS_CHANNEL_REVIEW')),
  front_door_code text REFERENCES public.dd_ch01_front_doors(front_door_code),
  subchannel_scope text[] NOT NULL DEFAULT ARRAY['CH01-A','CH01-B'],
  customer_visible_candidate boolean NOT NULL DEFAULT false,
  reason text NOT NULL,
  source_basis text NOT NULL,
  basis_type text NOT NULL DEFAULT 'DANI_INTERPRETATION',
  status text NOT NULL DEFAULT 'LOCKED' CHECK (status IN ('LOCKED','SUPERSEDED','PENDING_REVIEW')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(channel_code,sku)
);

CREATE TABLE IF NOT EXISTS public.dd_ch01_offer_crosswalk (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  channel_code text NOT NULL DEFAULT 'CH01' CHECK (channel_code='CH01'),
  adjudication_id uuid NOT NULL REFERENCES public.dd_ch01_service_adjudication(id) ON DELETE CASCADE,
  offer_code text NOT NULL,
  offer_name text NOT NULL,
  front_door_code text REFERENCES public.dd_ch01_front_doors(front_door_code),
  buying_modes jsonb NOT NULL DEFAULT '[]'::jsonb,
  default_entry_model text NOT NULL,
  expansion_models jsonb NOT NULL DEFAULT '[]'::jsonb,
  contract_artifact_code text NOT NULL,
  sales_question text NOT NULL,
  next_step text NOT NULL,
  source_basis text NOT NULL,
  basis_type text NOT NULL DEFAULT 'DANI_INTERPRETATION',
  status text NOT NULL DEFAULT 'LOCKED' CHECK (status IN ('LOCKED','SUPERSEDED','DRAFT')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(channel_code,offer_code)
);

CREATE TABLE IF NOT EXISTS public.dd_ch01_sla_matrix (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  channel_code text NOT NULL DEFAULT 'CH01' CHECK (channel_code='CH01'),
  sla_code text NOT NULL,
  sla_name text NOT NULL,
  engagement_model_codes jsonb NOT NULL DEFAULT '[]'::jsonb,
  coverage_hours text NOT NULL,
  response_target text NOT NULL,
  completion_target text,
  evidence_deadline text NOT NULL,
  rework_rule text NOT NULL,
  escalation_rule text NOT NULL,
  capacity_condition text NOT NULL,
  emergency_premium_rule text,
  source_basis text NOT NULL,
  basis_type text NOT NULL DEFAULT 'SYSTEM_CONTROL',
  status text NOT NULL DEFAULT 'LOCKED' CHECK (status IN ('LOCKED','SUPERSEDED','DRAFT')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(channel_code,sla_code)
);

CREATE TABLE IF NOT EXISTS public.dd_ch01_scope_compliance_matrix (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  channel_code text NOT NULL DEFAULT 'CH01' CHECK (channel_code='CH01'),
  scope_code text NOT NULL,
  work_class text NOT NULL,
  jurisdiction text NOT NULL DEFAULT 'GA',
  self_perform_status text NOT NULL,
  coordination_status text NOT NULL,
  licensed_provider_required boolean NOT NULL DEFAULT false,
  credential_requirement text,
  insurance_requirement text,
  authorization_threshold text,
  site_access_requirement text,
  special_trigger text,
  prohibited_without_structure text,
  source_basis text NOT NULL,
  basis_type text NOT NULL DEFAULT 'SYSTEM_CONTROL',
  status text NOT NULL DEFAULT 'LOCKED' CHECK (status IN ('LOCKED','SUPERSEDED','DRAFT')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(channel_code,scope_code)
);

CREATE TABLE IF NOT EXISTS public.dd_ch01_procurement_requirements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  channel_code text NOT NULL DEFAULT 'CH01' CHECK (channel_code='CH01'),
  procurement_code text NOT NULL,
  stage_order integer NOT NULL,
  stage_name text NOT NULL,
  required_inputs jsonb NOT NULL DEFAULT '[]'::jsonb,
  approval_owner text NOT NULL,
  payment_requirements jsonb NOT NULL DEFAULT '[]'::jsonb,
  vendor_requirements jsonb NOT NULL DEFAULT '[]'::jsonb,
  handoff_rule text NOT NULL,
  source_basis text NOT NULL,
  basis_type text NOT NULL DEFAULT 'SYSTEM_CONTROL',
  status text NOT NULL DEFAULT 'LOCKED' CHECK (status IN ('LOCKED','SUPERSEDED','DRAFT')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(channel_code,procurement_code)
);

ALTER TABLE public.dd_ch01_market_evidence ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dd_ch01_front_doors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dd_ch01_commercial_triggers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dd_ch01_buyer_authority_map ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dd_ch01_service_adjudication ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dd_ch01_offer_crosswalk ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dd_ch01_sla_matrix ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dd_ch01_scope_compliance_matrix ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dd_ch01_procurement_requirements ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS dd_ch01_market_evidence_deny_anon ON public.dd_ch01_market_evidence;
DROP POLICY IF EXISTS dd_ch01_market_evidence_deny_authenticated ON public.dd_ch01_market_evidence;
DROP POLICY IF EXISTS dd_ch01_front_doors_deny_anon ON public.dd_ch01_front_doors;
DROP POLICY IF EXISTS dd_ch01_front_doors_deny_authenticated ON public.dd_ch01_front_doors;
DROP POLICY IF EXISTS dd_ch01_triggers_deny_anon ON public.dd_ch01_commercial_triggers;
DROP POLICY IF EXISTS dd_ch01_triggers_deny_authenticated ON public.dd_ch01_commercial_triggers;
DROP POLICY IF EXISTS dd_ch01_buyers_deny_anon ON public.dd_ch01_buyer_authority_map;
DROP POLICY IF EXISTS dd_ch01_buyers_deny_authenticated ON public.dd_ch01_buyer_authority_map;
DROP POLICY IF EXISTS dd_ch01_adjudication_deny_anon ON public.dd_ch01_service_adjudication;
DROP POLICY IF EXISTS dd_ch01_adjudication_deny_authenticated ON public.dd_ch01_service_adjudication;
DROP POLICY IF EXISTS dd_ch01_crosswalk_deny_anon ON public.dd_ch01_offer_crosswalk;
DROP POLICY IF EXISTS dd_ch01_crosswalk_deny_authenticated ON public.dd_ch01_offer_crosswalk;
DROP POLICY IF EXISTS dd_ch01_sla_deny_anon ON public.dd_ch01_sla_matrix;
DROP POLICY IF EXISTS dd_ch01_sla_deny_authenticated ON public.dd_ch01_sla_matrix;
DROP POLICY IF EXISTS dd_ch01_scope_deny_anon ON public.dd_ch01_scope_compliance_matrix;
DROP POLICY IF EXISTS dd_ch01_scope_deny_authenticated ON public.dd_ch01_scope_compliance_matrix;
DROP POLICY IF EXISTS dd_ch01_proc_deny_anon ON public.dd_ch01_procurement_requirements;
DROP POLICY IF EXISTS dd_ch01_proc_deny_authenticated ON public.dd_ch01_procurement_requirements;

CREATE POLICY dd_ch01_market_evidence_deny_anon ON public.dd_ch01_market_evidence AS RESTRICTIVE FOR ALL TO anon USING (false) WITH CHECK (false);
CREATE POLICY dd_ch01_market_evidence_deny_authenticated ON public.dd_ch01_market_evidence AS RESTRICTIVE FOR ALL TO authenticated USING (false) WITH CHECK (false);
CREATE POLICY dd_ch01_front_doors_deny_anon ON public.dd_ch01_front_doors AS RESTRICTIVE FOR ALL TO anon USING (false) WITH CHECK (false);
CREATE POLICY dd_ch01_front_doors_deny_authenticated ON public.dd_ch01_front_doors AS RESTRICTIVE FOR ALL TO authenticated USING (false) WITH CHECK (false);
CREATE POLICY dd_ch01_triggers_deny_anon ON public.dd_ch01_commercial_triggers AS RESTRICTIVE FOR ALL TO anon USING (false) WITH CHECK (false);
CREATE POLICY dd_ch01_triggers_deny_authenticated ON public.dd_ch01_commercial_triggers AS RESTRICTIVE FOR ALL TO authenticated USING (false) WITH CHECK (false);
CREATE POLICY dd_ch01_buyers_deny_anon ON public.dd_ch01_buyer_authority_map AS RESTRICTIVE FOR ALL TO anon USING (false) WITH CHECK (false);
CREATE POLICY dd_ch01_buyers_deny_authenticated ON public.dd_ch01_buyer_authority_map AS RESTRICTIVE FOR ALL TO authenticated USING (false) WITH CHECK (false);
CREATE POLICY dd_ch01_adjudication_deny_anon ON public.dd_ch01_service_adjudication AS RESTRICTIVE FOR ALL TO anon USING (false) WITH CHECK (false);
CREATE POLICY dd_ch01_adjudication_deny_authenticated ON public.dd_ch01_service_adjudication AS RESTRICTIVE FOR ALL TO authenticated USING (false) WITH CHECK (false);
CREATE POLICY dd_ch01_crosswalk_deny_anon ON public.dd_ch01_offer_crosswalk AS RESTRICTIVE FOR ALL TO anon USING (false) WITH CHECK (false);
CREATE POLICY dd_ch01_crosswalk_deny_authenticated ON public.dd_ch01_offer_crosswalk AS RESTRICTIVE FOR ALL TO authenticated USING (false) WITH CHECK (false);
CREATE POLICY dd_ch01_sla_deny_anon ON public.dd_ch01_sla_matrix AS RESTRICTIVE FOR ALL TO anon USING (false) WITH CHECK (false);
CREATE POLICY dd_ch01_sla_deny_authenticated ON public.dd_ch01_sla_matrix AS RESTRICTIVE FOR ALL TO authenticated USING (false) WITH CHECK (false);
CREATE POLICY dd_ch01_scope_deny_anon ON public.dd_ch01_scope_compliance_matrix AS RESTRICTIVE FOR ALL TO anon USING (false) WITH CHECK (false);
CREATE POLICY dd_ch01_scope_deny_authenticated ON public.dd_ch01_scope_compliance_matrix AS RESTRICTIVE FOR ALL TO authenticated USING (false) WITH CHECK (false);
CREATE POLICY dd_ch01_proc_deny_anon ON public.dd_ch01_procurement_requirements AS RESTRICTIVE FOR ALL TO anon USING (false) WITH CHECK (false);
CREATE POLICY dd_ch01_proc_deny_authenticated ON public.dd_ch01_procurement_requirements AS RESTRICTIVE FOR ALL TO authenticated USING (false) WITH CHECK (false);

CREATE INDEX IF NOT EXISTS idx_dd_ch01_adj_front_door ON public.dd_ch01_service_adjudication(front_door_code,status);
CREATE INDEX IF NOT EXISTS idx_dd_ch01_adj_disposition ON public.dd_ch01_service_adjudication(disposition,status);
CREATE INDEX IF NOT EXISTS idx_dd_ch01_crosswalk_front_door ON public.dd_ch01_offer_crosswalk(front_door_code,status);
CREATE INDEX IF NOT EXISTS idx_dd_ch01_evidence_type ON public.dd_ch01_market_evidence(evidence_type,source_date);

-- Seed data is intentionally compact and mirrors the persisted live registry.
-- Re-run-safe UPSERT blocks are retained in the live database; this file is the
-- source-controlled reproduction of the registry.

INSERT INTO public.dd_ch01_market_evidence
(evidence_code,evidence_type,subject,geography,observed_fact,business_implication,source_name,source_url,source_date,source_kind,basis_type)
VALUES
('E01','FULL_SERVICE_CONCIERGE','Integrated household management','Atlanta, GA','Atlanta Home Concierge markets one trusted team across housekeeping, deep cleaning, move-in/out, organization, pet care, errands/transport and property/lifestyle support.','The one-provider household-management model is validated locally; CH01 differentiates through governed scope, continuity, accountability and service history.','Atlanta Home Concierge','https://www.atlantahomeconcierge.com/services','2026-09-20','COMPETITOR','RESEARCH_FACT'),
('E02','HOURLY_CONCIERGE','Household task assistance','Atlanta, GA','H+H advertises $50/hour with a 2-hour minimum, background-checked providers and upfront pricing.','Transparent hourly household assistance is an observable local price point.','H+H Home Concierge','https://hhhomeconcierge.com/','2026-09-20','COMPETITOR','RESEARCH_FACT'),
('E03','CLEANING_BENCHMARK','Standard and deep cleaning','Atlanta, GA','A 2026 Atlanta guide reports approximately $130–$215 for a standard 2BR clean and $245–$440 for a first deep clean.','Resident Refresh and Deep Reset require explicit scope/home-size boundaries.','EvenQuote Atlanta 2026','https://www.evenquote.com/cost-guide/house-cleaning-cost-atlanta-2026','2026-08-09','LOCAL_MARKET','RESEARCH_FACT'),
('E04','ORGANIZATION_BENCHMARK','Professional home organization','Atlanta, GA','Angi reports Atlanta organizers around $40–$80/hour with much larger whole-home project pricing.','Organization is a higher-variance judgment/transformation service.','Angi Atlanta 2026','https://www.angi.com/articles/what-do-professional-organizers-charge/ga/atlanta','2026-03-09','LOCAL_MARKET','RESEARCH_FACT'),
('E05','LAUNDRY_BENCHMARK','Pickup and delivery laundry','Atlanta, GA','Atlanta Laundry advertises about $2.20/lb recurring, $2.35/lb as-needed and a $45 minimum.','Laundry needs minimum-ticket or route-density economics.','Atlanta Laundry','https://www.atlantalaundry.com/pick-up-delivery/','2026-09-20','COMPETITOR','RESEARCH_FACT'),
('E06','PET_BENCHMARK','Pet sitting and walking visits','Atlanta, GA','Pack Leaders ATL lists 2026 visit rates from $22 short visits to $55 for 60-minute as-needed visits.','Pet services should be bounded by visit length and pet count.','Pack Leaders ATL','https://www.packleadersatl.com/2026-rates','2026-08-01','COMPETITOR','RESEARCH_FACT'),
('E07','APARTMENT_EXPERIENCE','Resident move-in friction','North America / multifamily','NAA reported day-to-day move-in/living friction remains a resident-experience issue.','CH01-B can complement community operations with paid resident-side execution.','National Apartment Association','https://naahq.org/news/maximizing-resident-retention-day-one','2026-04-28','INDUSTRY','RESEARCH_FACT'),
('E08','APARTMENT_OPERATIONS','Centralization and resident experience','North America / multifamily','NAA reported 87% of 700+ surveyed multifamily professionals planned to increase centralization while 85% worried about loss of personal touch.','CH02-to-CH01-B can add resident execution capacity without replacing the property relationship.','National Apartment Association','https://naahq.org/news/what-2026-data-reveals-about-multifamily','2026-04-29','INDUSTRY','RESEARCH_FACT'),
('E09','REGULATORY','Private home care boundary','Georgia','Georgia DCH regulates private-home-care services including nursing, personal care and companion/sitter tasks through a licensed structure.','Ordinary CH01 concierge must not drift into regulated home care without a separate compliant structure.','Georgia DCH','https://dch.georgia.gov/divisionsoffices/hfrd/facilities-provider-information/private-home-care-program','2026-09-20','OFFICIAL','RESEARCH_FACT'),
('E10','REGULATORY','Animal facility licensing boundary','Georgia','Georgia requires kennel licensing for compensated establishments maintaining dogs/cats for boarding, holding, training or similar purposes, including grooming shops.','In-home pet services must remain distinct from regulated facility activity.','Georgia Department of Agriculture','https://agr.georgia.gov/kennel-licenses','2026-09-20','OFFICIAL','RESEARCH_FACT'),
('E11','REGULATORY','Atlanta business registration','City of Atlanta','Atlanta requires an Occupational Tax Certificate for businesses operating within city limits and lists a 2026 annual registration fee of $191 before applicable tax.','City/local registration is an activation control in addition to service-level compliance.','City of Atlanta Office of Revenue','https://www.atlantaga.gov/government/departments/finance/office-of-revenue/apply-for-a-new-business-occupational-tax-certificate','2026-09-20','OFFICIAL','RESEARCH_FACT'),
('E12','MARKET_SEGMENT','Atlanta target geography','Atlanta, GA','September 2026 reporting identifies 30326, 30306, 30309, 30305 and 30030 as the top five ZIP codes in the cited Atlanta wealth ranking.','These are acquisition test zones, not exclusive service boundaries.','FOX 5 Atlanta / Atlanta Business Chronicle','https://www.fox5atlanta.com/news/atlantas-wealthiest-zip-codes-probably-where-you-think','2026-09-10','LOCAL_MARKET','RESEARCH_FACT'),
('E13','MARKET_SIZE','Atlanta household base','Atlanta, GA','Census QuickFacts reports population 520,070 in 2024 and median household income $85,652 for 2020–2024.','Citywide data supports a substantial household market but does not define the DANI ICP alone.','U.S. Census Bureau QuickFacts','https://www.census.gov/quickfacts/fact/table/atlantacitygeorgia/INC110222','2024-12-31','OFFICIAL','RESEARCH_FACT')
ON CONFLICT (channel_code,evidence_code) DO UPDATE SET
 evidence_type=excluded.evidence_type,subject=excluded.subject,geography=excluded.geography,observed_fact=excluded.observed_fact,business_implication=excluded.business_implication,
 source_name=excluded.source_name,source_url=excluded.source_url,source_date=excluded.source_date,source_kind=excluded.source_kind,basis_type=excluded.basis_type,status='LOCKED',updated_at=now();

INSERT INTO public.dd_ch01_front_doors(front_door_code,front_door_name,customer_promise,included_service_families,primary_triggers,default_buying_models,public_navigation_order,source_basis)
VALUES
('CH01-F01','Home Cleaning & Home Reset','Get the home back to a clean, orderly, ready-to-use condition.','["01A Home & Cleaning","01D Household Concierge"]','["TRG-CLEANING-BACKLOG","TRG-HOUSEHOLD-OVERLOAD","TRG-MAINTENANCE-LAPSE"]','["ONE_TIME_SERVICE","CONTROLLED_QUOTE","RECURRING_PROGRAM"]',1,'Atlanta cleaning benchmarks + Atlanta Home Concierge + D01 catalog.'),
('CH01-F02','Household Concierge & Errands','Hand off the household tasks that are consuming time and attention.','["01D Household Concierge"]','["TRG-HOUSEHOLD-OVERLOAD","TRG-TIME-PRESSURE"]','["ONE_TIME_SERVICE","HOURLY_ASSISTANCE","CONTROLLED_QUOTE"]',2,'H+H + Atlanta Home Concierge + D01 concierge catalog.'),
('CH01-F03','Pet & Plant Care','Keep household pets and indoor plants cared for on an agreed routine.','["01B Pet Care & Household Pet Support","01C Indoor Plant Care"]','["TRG-PET-CARE","TRG-PLANT-CARE"]','["ONE_TIME_SERVICE","RECURRING_PROGRAM","CONTROLLED_QUOTE"]',3,'Pack Leaders ATL + D01 pet/plant catalog.'),
('CH01-F04','Home Watch & Away Support','Give an absent resident a documented household check without representing a security service.','["01D Household Concierge","01B Pet Care & Household Pet Support"]','["TRG-AWAY-FROM-HOME"]','["ONE_TIME_SERVICE","RECURRING_PROGRAM"]',4,'D01 Home Watch scope + household concierge research.'),
('CH01-F05','Move, Guest & Seasonal Support','Handle temporary workload spikes that come with moving, hosting, travel and seasonal change.','["01E Move & Household Transition","01F Seasonal & Holiday Home Services","01D Household Concierge"]','["TRG-MOVE-TRANSITION","TRG-GUEST-EVENT","TRG-SEASONAL","TRG-ORGANIZATION"]','["ONE_TIME_SERVICE","CONTROLLED_QUOTE","PACKAGE"]',5,'Atlanta organizer/cleaning benchmarks + NAA move-in research + D01 transition catalog.')
ON CONFLICT (front_door_code) DO UPDATE SET front_door_name=excluded.front_door_name,customer_promise=excluded.customer_promise,included_service_families=excluded.included_service_families,primary_triggers=excluded.primary_triggers,default_buying_models=excluded.default_buying_models,public_navigation_order=excluded.public_navigation_order,source_basis=excluded.source_basis,status='LOCKED',updated_at=now();

INSERT INTO public.dd_ch01_commercial_triggers(trigger_code,trigger_name,pain_statement,buyer_roles,entry_front_door,recommended_entry_model,discovery_question,expansion_signal,source_basis,sort_order)
VALUES
('TRG-TIME-PRESSURE','Time pressure','Household workload is competing with work, family, travel or other priorities.','["BR01","BR02","BR05"]','CH01-F02','ONE_TIME_SERVICE','What household task is taking time you would rather spend elsewhere?','Multiple unrelated household tasks become delegated.','H+H + Atlanta Home Concierge + CH01 research.',1),
('TRG-HOUSEHOLD-OVERLOAD','Household overload','Multiple small tasks have accumulated into a backlog.','["BR01","BR02"]','CH01-F02','CONTROLLED_QUOTE','What needs to be handled first, and what else is building up behind it?','Recurring task list or monthly support need.','Full-service concierge market + D01 catalog.',2),
('TRG-CLEANING-BACKLOG','Cleaning/reset backlog','Home needs maintenance, deep, turnover or targeted reset.','["BR01","BR02","BR03"]','CH01-F01','ONE_TIME_SERVICE','Is this routine, deep or targeted work?','Recurring cleaning or details.','EvenQuote + D01 cleaning scope.',3),
('TRG-GUEST-EVENT','Guest or event deadline','Home must be ready before guests arrive or reset afterward.','["BR01","BR02","BR03"]','CH01-F05','ONE_TIME_SERVICE','What has to be ready before guests arrive, and by what date?','Cleaning/laundry/kitchen/reset expansion.','Atlanta Home Concierge + D01 event/guest services.',4),
('TRG-AWAY-FROM-HOME','Away-from-home need','A trip or absence creates a need for a trusted documented home check.','["BR01","BR03"]','CH01-F04','RECURRING_PROGRAM','How often should the property be checked while you are away?','Recurring Home Watch/pet/plant support.','D01 Home Watch scope.',5),
('TRG-PET-CARE','Pet-care gap','Resident needs routine pet support, sanitation, transportation or transition help.','["BR01","BR02","BR03"]','CH01-F03','ONE_TIME_SERVICE','What pet care is needed, for how long, and how many animals?','Recurring visits or sanitation.','Pack Leaders ATL + D01 pet catalog.',6),
('TRG-ORGANIZATION','Organization / decluttering','Resident needs physical order/categorization beyond ordinary cleaning.','["BR01","BR02"]','CH01-F05','CONTROLLED_QUOTE','Which space or household transition is creating the biggest problem?','Whole-home, estate or move organization.','Angi + D01 organization catalog.',7),
('TRG-MOVE-TRANSITION','Move or household transition','A move or settling-in creates a concentrated workload spike.','["BR01","BR02","BR05"]','CH01-F05','CONTROLLED_QUOTE','What is the move date and what still needs to be handled?','Cleaning, unpacking, organization, laundry or pet transition.','NAA + D01 transition catalog.',8),
('TRG-SEASONAL','Seasonal change','Holiday/seasonal changes create temporary household workload.','["BR01","BR02"]','CH01-F05','CONTROLLED_QUOTE','What needs to be set up, reset, stored or taken down?','Recurring seasonal service.','D01 seasonal family.',9),
('TRG-PLANT-CARE','Indoor plant care','Resident needs recurring care or specialized plant support.','["BR01","BR02","BR03"]','CH01-F03','RECURRING_PROGRAM','How many plants need care and how often?','Recurring care or specialist rescue/repotting.','D01 plant catalog.',10),
('TRG-MAINTENANCE-LAPSE','Routine maintenance lapse','Small household maintenance tasks are repeatedly deferred.','["BR01","BR02"]','CH01-F01','ONE_TIME_SERVICE','Which recurring home task has been falling behind?','Membership/recurring program.','D01 recurring architecture.',11)
ON CONFLICT (channel_code,trigger_code) DO UPDATE SET trigger_name=excluded.trigger_name,pain_statement=excluded.pain_statement,buyer_roles=excluded.buyer_roles,entry_front_door=excluded.entry_front_door,recommended_entry_model=excluded.recommended_entry_model,discovery_question=excluded.discovery_question,expansion_signal=excluded.expansion_signal,source_basis=excluded.source_basis,sort_order=excluded.sort_order,status='LOCKED',updated_at=now();

INSERT INTO public.dd_ch01_buyer_authority_map(buyer_role_code,buyer_role_name,pain_owned,typical_entry_offers,authorization_scope,relationship_boundary,procurement_handoff,sales_question,source_basis)
VALUES
('BR01','CH01-A Household Account Holder','["time savings","home upkeep","organization","pet/plant support"]','["CH01-F01","CH01-F02","CH01-F03","CH01-F04","CH01-F05"]','Can request/approve services for the household account subject to permissions.','Direct resident relationship; no property-management relationship implied.','CH01-A request -> quote/checkout -> payment -> fulfillment.','What would you most like to stop having to handle yourself?','DANI resident architecture + D01 catalog.'),
('BR02','CH01-A Authorized Household Delegate','["shared household workload","family logistics","guest preparation"]','["CH01-F01","CH01-F02","CH01-F05"]','Can request within the household permissions; payment authority is separate.','Delegate is not automatically the account owner.','Verify account relationship before payment or material scope changes.','What authority do you have to approve the work?','DANI identity/routing architecture.'),
('BR03','CH01-B Verified Apartment / Property Resident','["move-in friction","laundry","household setup","pet/household needs"]','["CH01-F01","CH01-F02","CH01-F03","CH01-F05"]','Receives CH01-B eligibility only after server-side property verification.','Requires active CH02 relationship and bound resident access.','Resident-paid work is CH01-B; property-paid work remains CH02.','Which participating property are you connected to, and is access already verified?','NAA + DANI CH02->CH01-B architecture.'),
('BR04','CH01-B Property-Sponsored Resident / Beneficiary','["resident experience","household convenience"]','["CH01-F01","CH01-F02","CH01-F03","CH01-F05"]','Receives only explicitly funded/enabled program benefits.','Organization relationship remains CH02.','Sponsor rules checked before exposing funded benefits/pricing.','Is this request part of a resident benefit from your community?','NAA + DANI B2B2C architecture.'),
('BR05','CH01-A Resident Handling Own Small Rental / Unit','["unit readiness","small-property coordination","turnover tasks"]','["CH01-F01","CH01-F05"]','May use resident path when acting personally; portfolio/property-management intent triggers CH02.','No CH02 pricing leakage.','Professional property-management/portfolio request hands off to CH02.','Is this your own household/unit or are you representing a property operation?','DANI channel separation architecture.')
ON CONFLICT (channel_code,buyer_role_code) DO UPDATE SET buyer_role_name=excluded.buyer_role_name,pain_owned=excluded.pain_owned,typical_entry_offers=excluded.typical_entry_offers,authorization_scope=excluded.authorization_scope,relationship_boundary=excluded.relationship_boundary,procurement_handoff=excluded.procurement_handoff,sales_question=excluded.sales_question,source_basis=excluded.source_basis,status='LOCKED',updated_at=now();

INSERT INTO public.dd_ch01_service_adjudication(service_id,sku,service_name,service_family,disposition,front_door_code,customer_visible_candidate,reason,source_basis)
SELECT s.id,s.sku,s.name,s.service_family,
CASE
 WHEN s.sku='DNI-01G-001' THEN 'SUPPORTING_LAYER'
 WHEN s.sku='DNI-01A-042' THEN 'CONTROLLED_QUOTE'
 WHEN s.service_family='01C Indoor Plant Care' AND s.is_active=false THEN 'CONTROLLED_QUOTE'
 WHEN s.service_family='01E Move & Household Transition' THEN 'CONTROLLED_QUOTE'
 WHEN s.service_family='01F Seasonal & Holiday Home Services' AND s.is_active=false THEN 'CONTROLLED_QUOTE'
 WHEN s.pricing_type IN ('VARIABLE_QUOTE','SOW','SOW_PROCUREMENT') THEN 'CONTROLLED_QUOTE'
 ELSE 'FRONT_DOOR' END,
CASE
 WHEN s.sku='DNI-01G-001' THEN NULL
 WHEN s.service_family='01A Home & Cleaning' THEN 'CH01-F01'
 WHEN s.service_family='01B Pet Care & Household Pet Support' THEN 'CH01-F03'
 WHEN s.service_family='01C Indoor Plant Care' THEN 'CH01-F03'
 WHEN s.name ILIKE '%Home Watch%' OR s.sku='DNI-01D-002' THEN 'CH01-F04'
 WHEN s.service_family IN ('01E Move & Household Transition','01F Seasonal & Holiday Home Services') THEN 'CH01-F05'
 WHEN s.name ILIKE '%Guest%' OR s.name ILIKE '%Vacation%' OR s.name ILIKE '%Event%' OR s.name ILIKE '%Organization%' OR s.name ILIKE '%Decluttering%' OR s.name ILIKE '%Estate%' OR s.name ILIKE '%Yard Sale%' THEN 'CH01-F05'
 ELSE 'CH01-F02' END,
s.sku<>'DNI-01G-001',
CASE
 WHEN s.sku='DNI-01G-001' THEN 'Recurring membership is an engagement model, not a primary navigation door.'
 WHEN s.sku='DNI-01A-042' THEN 'High-variance severe pet mess requires controlled scope, equipment and safety review.'
 WHEN s.is_active=false THEN 'Strategically relevant to CH01 but not currently runtime-active; retain as controlled future offer.'
 WHEN s.pricing_type IN ('VARIABLE_QUOTE','SOW','SOW_PROCUREMENT') THEN 'Scope variability requires controlled quote before payment.'
 ELSE 'Direct household outcome aligned to a governed CH01 front door.' END,
'Current D01 service catalog + Atlanta market research + DANI resident-channel architecture.'
FROM public.services s
WHERE s.division_id=1
ON CONFLICT (channel_code,sku) DO UPDATE SET
 service_id=excluded.service_id,service_name=excluded.service_name,service_family=excluded.service_family,disposition=excluded.disposition,front_door_code=excluded.front_door_code,customer_visible_candidate=excluded.customer_visible_candidate,reason=excluded.reason,source_basis=excluded.source_basis,status='LOCKED',updated_at=now();

INSERT INTO public.dd_ch01_service_adjudication(service_id,sku,service_name,service_family,disposition,front_door_code,subchannel_scope,customer_visible_candidate,reason,source_basis)
SELECT s.id,s.sku,s.name,s.service_family,'CROSS_CHANNEL_REVIEW',NULL,ARRAY['CH01-A','CH01-B'],false,
'Legacy CH01 channel availability exists, but the service belongs to another canonical DANI division. Native division ownership must be adjudicated before resident exposure.',
'Current CH01 channel-availability records + DANI division/channel separation.'
FROM public.dd_service_channel_availability a
JOIN public.services s ON s.id=a.service_id
WHERE a.channel_code='CH01' AND s.division_id<>1
ON CONFLICT (channel_code,sku) DO UPDATE SET
 disposition='CROSS_CHANNEL_REVIEW',front_door_code=NULL,customer_visible_candidate=false,reason=excluded.reason,source_basis=excluded.source_basis,status='LOCKED',updated_at=now();

INSERT INTO public.dd_ch01_offer_crosswalk(adjudication_id,offer_code,offer_name,front_door_code,buying_modes,default_entry_model,expansion_models,contract_artifact_code,sales_question,next_step,source_basis)
SELECT a.id,'CH01-O-'||a.sku,a.service_name,a.front_door_code,
CASE WHEN a.disposition='SUPPORTING_LAYER' THEN '["PROGRAM","RECURRING"]'::jsonb WHEN s.pricing_type='FIXED' THEN '["ONE_TIME_SERVICE"]'::jsonb ELSE '["REQUEST_SERVICE","CONTROLLED_QUOTE"]'::jsonb END,
CASE WHEN a.disposition='SUPPORTING_LAYER' THEN 'RECURRING_PROGRAM' WHEN s.commercial_intent_status='SELL_NOW' AND s.pricing_type='FIXED' THEN 'ONE_TIME_SERVICE' ELSE 'CONTROLLED_QUOTE' END,
CASE
 WHEN a.front_door_code='CH01-F01' THEN '["RECURRING_PROGRAM","TARGETED_DETAIL"]'::jsonb
 WHEN a.front_door_code='CH01-F02' THEN '["HOURLY_ASSISTANCE","TASK_BUNDLE"]'::jsonb
 WHEN a.front_door_code='CH01-F03' THEN '["RECURRING_PROGRAM","SPECIALIST_REFERRAL"]'::jsonb
 WHEN a.front_door_code='CH01-F04' THEN '["RECURRING_PROGRAM"]'::jsonb
 WHEN a.front_door_code='CH01-F05' THEN '["PACKAGE","RECURRING_SEASONAL"]'::jsonb
 ELSE '["CROSS_SERVICE"]'::jsonb END,
CASE WHEN a.disposition='SUPPORTING_LAYER' THEN 'PROGRAM_AGREEMENT' WHEN s.pricing_type='FIXED' AND s.commercial_intent_status='SELL_NOW' THEN 'SERVICE_REQUEST' ELSE 'QUOTE' END,
CASE WHEN a.disposition='CROSS_CHANNEL_REVIEW' THEN 'Why is this service being requested through the resident channel rather than its native DANI channel?' WHEN a.front_door_code='CH01-F01' THEN 'What condition is the home in, and is this routine, deep or targeted work?' WHEN a.front_door_code='CH01-F02' THEN 'Which household tasks should we take off your list first?' WHEN a.front_door_code='CH01-F03' THEN 'What care routine, frequency and quantity are involved?' WHEN a.front_door_code='CH01-F04' THEN 'How often should the property be checked and what should be reported?' WHEN a.front_door_code='CH01-F05' THEN 'What deadline is driving the project and what must be ready by then?' ELSE 'What ongoing household relationship should this support?' END,
CASE WHEN a.disposition='CROSS_CHANNEL_REVIEW' THEN 'Hold CH01 exposure until the native division confirms ownership, pricing, scope and fulfillment gates.' WHEN a.disposition='SUPPORTING_LAYER' THEN 'Determine program eligibility, scope and recurring terms.' WHEN s.commercial_intent_status<>'SELL_NOW' OR s.is_active=false THEN 'Take controlled intake only; do not imply immediate checkout readiness.' WHEN s.pricing_type='FIXED' THEN 'Verify exact CH01 availability, locked channel price, scope and provider readiness before checkout.' ELSE 'Collect quote inputs and route to controlled quote.' END,
'Current D01 catalog + CH01 research registry + governed commercial architecture.'
FROM public.dd_ch01_service_adjudication a
JOIN public.services s ON s.id=a.service_id
ON CONFLICT (channel_code,offer_code) DO UPDATE SET adjudication_id=excluded.adjudication_id,offer_name=excluded.offer_name,front_door_code=excluded.front_door_code,buying_modes=excluded.buying_modes,default_entry_model=excluded.default_entry_model,expansion_models=excluded.expansion_models,contract_artifact_code=excluded.contract_artifact_code,sales_question=excluded.sales_question,next_step=excluded.next_step,source_basis=excluded.source_basis,status='LOCKED',updated_at=now();

INSERT INTO public.dd_ch01_sla_matrix(sla_code,sla_name,engagement_model_codes,coverage_hours,response_target,completion_target,evidence_deadline,rework_rule,escalation_rule,capacity_condition,emergency_premium_rule,source_basis)
VALUES
('SLA01','Routine Resident Request','["ONE_TIME_SERVICE","RECURRING_PROGRAM"]','Published business-hours intake + scheduled service windows','Review/acknowledge within 1 business day; appointment timing is not promised until confirmed.','Customer-confirmed service window.','At closeout under the service-specific evidence rule.','Verified scope misses use the rework rule; new scope is a change.','Escalate unresolved scope, access, safety or provider exceptions before acceptance.','Provider availability + geography + service gate must pass.','No implied 24/7 service; rush/after-hours requires an approved rule.','DANI system control informed by local concierge practice.'),
('SLA02','Rush / Short-Notice Request','["ONE_TIME_SERVICE","CONTROLLED_QUOTE"]','Published business-hours intake + capacity-dependent dispatch','Same-business-day review when capacity permits; no guaranteed same-day fulfillment.','Only after confirmed service window.','At job closeout or contract-defined point.','Rush does not authorize scope expansion.','Immediate escalation for safety/provider/access/timing conflicts.','Authorized provider capacity and route economics must pass.','Rush/after-hours pricing must be governed before quote.','DANI system control.'),
('SLA03','Quote-Required Project','["CONTROLLED_QUOTE","PACKAGE"]','Published intake hours; scheduled after approval','Quote after required scope inputs are complete.','Schedule proposed after approval and capacity check.','Evidence/acceptance package tied to quote/scope.','Quote change control applies to scope changes.','Unresolved scope/compliance blocks quote approval.','Provider/capability/economic gates must pass.','No rush premium until approved.','DANI system control + Atlanta market evidence.'),
('SLA04','Move / Date-Driven Support','["CONTROLLED_QUOTE","PACKAGE"]','Published intake + date-specific scheduling','Review against move date and tasks before confirming.','Completion follows agreed transition schedule.','Evidence at completion of each task set.','Date/scope changes reopen capacity check.','Escalate immediately when date cannot be supported.','Move date, route and provider capacity must pass.','Rush only under governed rule.','NAA move-in research + DANI transition control.'),
('SLA05','Recurring Household Program','["RECURRING_PROGRAM"]','Program-defined cadence','Enrollment confirmed before first cycle.','Each cycle follows program window.','Cycle closeout evidence by service type.','Missed/rework cycles follow program terms.','Escalate repeated misses or capacity loss.','Recurring capacity must be reserved or explicitly managed.','After-hours not implied.','DANI recurring program control.'),
('SLA06','Home Watch / Away Support','["ONE_TIME_SERVICE","RECURRING_PROGRAM"]','Program-defined visits','Visit schedule confirmed before reliance.','Each visit completed within agreed window.','Dated visit report/status and appropriate photos.','Revisit for service failure, not newly discovered defects.','Escalate property/safety issues; not security/alarm monitoring.','Provider, route and access gates must pass.','No implied emergency/security response.','D01 Home Watch scope + concierge research.')
ON CONFLICT (channel_code,sla_code) DO UPDATE SET sla_name=excluded.sla_name,engagement_model_codes=excluded.engagement_model_codes,coverage_hours=excluded.coverage_hours,response_target=excluded.response_target,completion_target=excluded.completion_target,evidence_deadline=excluded.evidence_deadline,rework_rule=excluded.rework_rule,escalation_rule=excluded.escalation_rule,capacity_condition=excluded.capacity_condition,emergency_premium_rule=excluded.emergency_premium_rule,source_basis=excluded.source_basis,status='LOCKED',updated_at=now();

INSERT INTO public.dd_ch01_scope_compliance_matrix(scope_code,work_class,self_perform_status,coordination_status,licensed_provider_required,credential_requirement,insurance_requirement,authorization_threshold,site_access_requirement,special_trigger,prohibited_without_structure,source_basis)
VALUES
('SCOPE01','Routine household cleaning','ALLOWED_WITH_SCOPE','OPTIONAL_SPECIALIST_SUPPORT',false,'Service-specific SOP competency','General business/provider coverage as applicable','Defined scope + gate pass','Normal residential access','Heavy soil/unusual contamination','No biohazard, mold remediation, structural work or regulated trade work.','D01 scope + Atlanta cleaning benchmarks.'),
('SCOPE02','Household concierge / errands','ALLOWED_WITH_SCOPE','ALLOWED',false,'Identity + task SOP','General business/provider coverage as applicable','Client-authorized task/spending limits','Client-authorized access','Cash/valuables or regulated-purchase condition','No legal, medical, financial professional service or unrestricted custody of valuables.','D01 scope + CH01 architecture.'),
('SCOPE03','Indoor plant care','ALLOWED_WITH_SCOPE','OPTIONAL_SPECIALIST_SUPPORT',false,'Plant-care SOP','General coverage as applicable','Agreed plant count/tier','Normal residential access','Disease/chemical-treatment condition','No pesticide/regulated treatment, guaranteed survival or licensed diagnosis.','D01 plant scope pass.'),
('SCOPE04','In-home pet care','ALLOWED_WITH_SCOPE','ALLOWED',false,'Pet-care SOP + animal handling competency','General/provider coverage as applicable','Agreed pets, visit length and care tasks','Owner access instructions','Bite/aggression/medical-care condition','No veterinary services or unsafe handling; boarding/grooming-facility work routes to licensed providers.','Pack Leaders + Georgia animal-facility boundary.'),
('SCOPE05','Home watch','ALLOWED_WITH_SCOPE','ALLOWED',false,'Home-watch checklist','General business/provider coverage as applicable','Property access authorization','Client-governed keys/access','Alarm/security/repair condition','Not security monitoring, alarm response, licensed inspection or repair.','D01 Home Watch scope.'),
('SCOPE06','Move / unpack / transition support','ALLOWED_WITH_SCOPE','SPECIALIST_PROVIDER_WHEN_NEEDED',false,'Move-support SOP','Coverage appropriate to work','Weight/crew/equipment limits','Move-site/building access','Heavy furniture/vehicle/lift condition','No unapproved heavy moving, truck transport or trade work.','D01 transition + NAA research.'),
('SCOPE07','Severe pet mess / contamination','GATED','SPECIALIST_ONLY',true,'Qualified remediation capability when contamination exceeds ordinary cleaning','Specialty coverage appropriate to work','Site assessment + authorization','Safety/access assessment','Biohazard/heavy extraction/unusual contamination','No hazardous/biohazard remediation under ordinary CH01 scope.','D01 severe-mess scope pass.'),
('SCOPE08','Regulated personal / companion home care','PROHIBITED','LICENSED_STRUCTURE_REQUIRED',true,'Georgia PHCP license/structure when applicable','Program-specific professional liability','Separate regulated-service approval','Care-plan/site requirements','Personal care / companion / sitter tasks','Do not sell as ordinary CH01 without compliant PHCP structure.','Georgia DCH Private Home Care Program.'),
('SCOPE09','Animal boarding / grooming facility service','PROHIBITED','LICENSED_PROVIDER_REQUIRED',true,'Georgia kennel/facility licensing when applicable','Facility/provider coverage as applicable','Licensed provider/facility verification','Facility rules','Boarding/grooming/training establishment','DANI does not self-perform regulated facility activity without required license.','Georgia Department of Agriculture.'),
('SCOPE10','Passenger transportation','GATED','SPECIALIST_PROVIDER_ONLY',true,'Driver/vehicle/legal requirements verified per service/jurisdiction','Auto/business coverage appropriate to service','Separate transport authorization','Pickup/dropoff verification','Transporting people for hire','Do not infer household errands authorize passenger transportation.','Georgia transport/tax boundary + DANI compliance.'),
('SCOPE11','Regulated trade / repair','GATED','QUALIFIED_PROVIDER_REQUIRED',true,'Trade license/credential where applicable','Provider liability/coverage appropriate to trade','Specialist provider authorization','Property/building access and permits where applicable','Electrical/plumbing/structural/roofing condition','Do not self-perform regulated trade work without required structure.','DANI scope architecture + provider governance.'),
('SCOPE12','Atlanta local business operation','CONDITIONAL','CONDITIONAL',false,'City registration as applicable','Business coverage as applicable','Jurisdiction check','Jurisdiction-specific','Atlanta city-limits condition','Do not treat statewide compliance as sufficient for city operation.','City of Atlanta Occupational Tax Certificate requirements.')
ON CONFLICT (channel_code,scope_code) DO UPDATE SET work_class=excluded.work_class,self_perform_status=excluded.self_perform_status,coordination_status=excluded.coordination_status,licensed_provider_required=excluded.licensed_provider_required,credential_requirement=excluded.credential_requirement,insurance_requirement=excluded.insurance_requirement,authorization_threshold=excluded.authorization_threshold,site_access_requirement=excluded.site_access_requirement,special_trigger=excluded.special_trigger,prohibited_without_structure=excluded.prohibited_without_structure,source_basis=excluded.source_basis,status='LOCKED',updated_at=now();

INSERT INTO public.dd_ch01_procurement_requirements(procurement_code,stage_order,stage_name,required_inputs,approval_owner,payment_requirements,vendor_requirements,handoff_rule,source_basis)
VALUES
('PROC01',1,'Identify resident relationship','["channel","subchannel","name","email","service location"]','Customer + system routing','["No payment before commercial resolution."]','["Customer identity requirements only."]','Unknown/missing channel or subchannel routes to controlled review.','DANI channel architecture.'),
('PROC02',2,'Verify CH01-B property relationship when applicable','["authenticated identity","active CH02 client property","resident access/invite status"]','System + authorized staff','["CH01-B price/benefit cannot be inferred before verification."]','["Active CH02 client property relationship required."]','Unverified apartment claim cannot grant CH01-B.','DANI CH02->CH01-B architecture.'),
('PROC03',3,'Scope and service qualification','["service/SKU","scope details","date","access","special conditions"]','DANI commercial/operations owner','["Quote or price path depends on service model."]','["Provider capability/compliance checks required."]','Portfolio/property-management requester moves to CH02; regulated work moves to licensed/specialist path.','DANI service governance + CH01 research.'),
('PROC04',4,'Price and commercial approval','["exact channel price rule or quote","pricing model","subchannel/community rule if applicable"]','Canonical pricing resolver','["Use server-side governed price/quote; never trust client-supplied price."]','["Provider payout/economics remain private."]','No executable CH01-B rule means controlled quote/reject, never CH01-A fallback.','CH01 pricing architecture.'),
('PROC05',5,'Payment and scheduling','["approved price/quote","payment status","confirmed service window"]','Customer + DANI system','["Approved payment path; no card numbers taken by rep."]','["Provider assignment only after acceptance gates."]','No confirmed appointment until capacity and routing pass.','DANI payment/runtime architecture.'),
('PROC06',6,'Fulfillment, evidence and closeout','["assigned provider","work instructions","required evidence","acceptance state"]','Operations + provider','["Settlement follows verified completion/payment terms."]','["Capability, credential and insurance gates must pass where applicable."]','Exceptions reopen scope/quote rather than silently changing price.','DANI fulfillment/evidence architecture.'),
('PROC07',7,'Retention and expansion','["completion outcome","customer feedback","repeat need","service history"]','CRM/customer relationship owner','["Recurring/program terms require explicit approval."]','["Provider performance retained in network history."]','One-time customers enter recurring programs only through an explicit offer.','Concierge research + DANI retention architecture.')
ON CONFLICT (channel_code,procurement_code) DO UPDATE SET stage_order=excluded.stage_order,stage_name=excluded.stage_name,required_inputs=excluded.required_inputs,approval_owner=excluded.approval_owner,payment_requirements=excluded.payment_requirements,vendor_requirements=excluded.vendor_requirements,handoff_rule=excluded.handoff_rule,source_basis=excluded.source_basis,status='LOCKED',updated_at=now();

INSERT INTO public.dd_channel_strategy_contracts
(channel_code,contract_version,status,primary_role,front_door_offers,supporting_layers,buyer_architecture,icp,compliance_gates,service_family_architecture,emergency_framework,commercial_rules,sales_funnel,release_checklist,deferred_items,engagement_architecture,source_basis,effective_date)
VALUES
('CH01','2026-09-20.v1','LOCKED','Resident Concierge and resident-side household execution layer',
'[{"code":"CH01-F01","name":"Home Cleaning & Home Reset","role":"primary resident entry"},{"code":"CH01-F02","name":"Household Concierge & Errands","role":"time-back entry"},{"code":"CH01-F03","name":"Pet & Plant Care","role":"household care entry"},{"code":"CH01-F04","name":"Home Watch & Away Support","role":"absence-support entry"},{"code":"CH01-F05","name":"Move, Guest & Seasonal Support","role":"event/transition entry"}]',
'[{"name":"Laundry / linen","role":"supporting household service"},{"name":"Organization / decluttering","role":"supporting high-variance service"},{"name":"Household membership","role":"engagement model, not navigation"},{"name":"Provider coordination","role":"controlled fulfillment capability"},{"name":"Targeted cleaning details","role":"supporting/cross-sell layer"}]',
'[{"role":"CH01-A Household Account Holder","relationship":"direct resident customer"},{"role":"CH01-A Authorized Household Delegate","relationship":"permissioned household requester"},{"role":"CH01-B Verified Apartment / Property Resident","relationship":"verified resident beneficiary/payer"},{"role":"CH01-B Property-Sponsored Resident / Beneficiary","relationship":"CH02 organization relationship with CH01 resident experience"},{"role":"CH01-A Resident Handling Own Small Rental / Unit","relationship":"resident-side only; portfolio/property-management intent routes to CH02"}]',
'{"primary_market":"Metro Atlanta residential households","service_geography":"GA operating market; service-level geography/compliance gates apply","launch_test_zips":["30326","30306","30309","30305","30030"],"characteristics":["time-constrained households","recurring household workload","move/guest/seasonal workload spikes","pet/plant care needs","residents seeking one accountable relationship"],"apartment_path":"CH02 client property -> verified CH01-B resident access"}',
'[{"gate":"jurisdiction","required":true},{"gate":"service scope","required":true},{"gate":"provider capability","required":true},{"gate":"provider credential/license where applicable","required":true},{"gate":"insurance where applicable","required":true},{"gate":"regulated home-care exclusion","required":true},{"gate":"animal facility licensing boundary","required":true},{"gate":"passenger transport boundary","required":true},{"gate":"hazard/contamination gate","required":true},{"gate":"Atlanta/local registration where applicable","required":true},{"gate":"CH01-B verified property relationship","required":true}]',
'[{"code":"01A","name":"Home & Cleaning","outcome":"cleaner/ready home"},{"code":"01B","name":"Pet Care & Household Pet Support","outcome":"reliable household pet support"},{"code":"01C","name":"Indoor Plant Care","outcome":"maintained indoor plants"},{"code":"01D","name":"Household Concierge","outcome":"delegated household workload"},{"code":"01E","name":"Move & Household Transition","outcome":"managed household transition"},{"code":"01F","name":"Seasonal & Holiday Home Services","outcome":"seasonal readiness"},{"code":"01G","name":"Recurring Services","outcome":"standing household care"}]',
'{"position":"on-demand/rush support only when capacity is available and explicitly confirmed","no_24_7_promise":true,"required_controls":["provider availability","route/capacity","scope","price rule","safety/compliance","rush rule if any"],"security_boundary":"Home Watch is not security/alarm response"}',
'{"principles":["CH01-A and CH01-B remain separate resident relationships and price books","CH01-B never silently falls back to CH01-A","public price is channel-specific and server-resolved","fixed-price services require exact channel availability + locked pricing + fulfillment readiness","variable/starting-at work routes through controlled quote logic","membership is an engagement model, not a front door","property-management/portfolio buyers remain CH02","regulated care and specialty work require separate compliant structure"],"ch01_b_benefit_policy":"Approved documentation references a 15% resident/community benefit, but executable CH01-B pricing must be explicitly persisted as a subchannel/community rule before checkout; no fallback arithmetic is implied.","economic_rule":"Market benchmark evidence is not audited DANI cost evidence; actual service economics must be evidenced before margin clearance."}',
'["discover","identify channel/subchannel","match front door/SKU","qualify scope","resolve exact channel price or quote","approve","pay","match provider","schedule","fulfill","capture evidence","close","review","repeat/recurring"]',
'["CH01 strategy contract","market evidence registry","5 front doors","trigger matrix","buyer authority map","service adjudication","offer crosswalk","SLA matrix","scope/compliance matrix","procurement/entry matrix","CH01-A pricing reconciliation","CH01-B executable price rules","service economic baselines","provider capability authorization","production request/payment smoke test"]',
'[{"item":"CH01-A current price-book document vs live canonical CH01 pricing rules","status":"RECONCILE_BEFORE_DOCUMENT_REPUBLICATION"},{"item":"CH01-B price rules","status":"HOLD_UNTIL_EXPLICIT_SUBCHANNEL_RULES_EXIST"},{"item":"Division 01 service economic baselines","status":"BUILD_FROM_OBSERVED_JOB_TELEMETRY_AND_DIRECT_COSTS"},{"item":"Legacy/static commercialRegistry CH01 prices","status":"KEEP_COMPATIBILITY_ONLY; NEVER_AUTHORITY"},{"item":"Gated D01 services","status":"KEEP_GATED_UNTIL_SCOPE_PROVIDER_ECONOMICS_AND_QA_PASS"},{"item":"SEO keyword-volume research","status":"PENDING_EXTERNAL_API_CAPACITY"}]',
'{"status":"LOCKED","principle":"One-time service -> repeat need -> recurring program -> household relationship","models":["ONE_TIME_SERVICE","CONTROLLED_QUOTE","PACKAGE","RECURRING_PROGRAM","PRIORITY/RUSH_WHEN_GOVERNED"],"membership":"Optional recurring engagement; not a front door"}',
'Current DANI CH01 operating architecture + current D01 service catalog + 2026 Atlanta concierge/cleaning/organization/laundry/pet/apartment research + Georgia regulatory sources.',
'2026-09-20')
ON CONFLICT (channel_code,contract_version) DO UPDATE SET
status=excluded.status,primary_role=excluded.primary_role,front_door_offers=excluded.front_door_offers,supporting_layers=excluded.supporting_layers,buyer_architecture=excluded.buyer_architecture,icp=excluded.icp,compliance_gates=excluded.compliance_gates,service_family_architecture=excluded.service_family_architecture,emergency_framework=excluded.emergency_framework,commercial_rules=excluded.commercial_rules,sales_funnel=excluded.sales_funnel,release_checklist=excluded.release_checklist,deferred_items=excluded.deferred_items,engagement_architecture=excluded.engagement_architecture,source_basis=excluded.source_basis,effective_date=excluded.effective_date,updated_at=now();
