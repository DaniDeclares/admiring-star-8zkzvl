-- Real, persistent Monday acquisition-board tracker. Follows the exact RLS convention already
-- used on public.service_requests (single ALL policy via private.dd_is_staff_admin()) rather
-- than inventing a new access pattern. Seeded only with contacts/accounts actually verified
-- this session (HubSpot CRM records, web-sourced company leadership pages, and Danielle's own
-- real LinkedIn conversations) -- nothing manufactured to pad the list.

CREATE TABLE public.dd_sales_queue (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  contact_name text NOT NULL,
  company_name text,
  role_title text,
  phone text,
  email text,
  lane text NOT NULL CHECK (lane IN (
    'INBOUND','WARM','REVISIT_CALLABLE','REVISIT_ROUTING','REVISIT_NOT_CALLABLE',
    'EMAIL_ONLY','PARTNER','SCREEN_ONLY'
  )),
  source text NOT NULL CHECK (source IN (
    'HUBSPOT_DEAL','LINKEDIN_MESSAGE','LINKEDIN_MARKETPLACE','LINKEDIN_INVITE','WEB_SOURCED'
  )),
  source_confidence text NOT NULL DEFAULT 'VERIFIED' CHECK (source_confidence IN ('VERIFIED','SINGLE_SOURCE','LOW_CONFIDENCE')),
  disposition text NOT NULL DEFAULT 'NOT_CONTACTED' CHECK (disposition IN (
    'NOT_CONTACTED','NO_ANSWER','VOICEMAIL','RECEPTIONIST','WRONG_PERSON',
    'DECISION_MAKER_REACHED','INTERESTED','NEEDS_INFO','QUOTE_REQUESTED','READY_TO_BUY',
    'PAYMENT_SENT','PAYMENT_SUCCEEDED','CALL_BACK_LATER','NOT_INTERESTED',
    'EXISTING_VENDOR_REVISIT','DO_NOT_CONTACT'
  )),
  next_action text,
  next_action_date date,
  suggested_sku text,
  quoted_amount numeric(10,2),
  amount_collected numeric(10,2) NOT NULL DEFAULT 0,
  job_id uuid REFERENCES public.dd_jobs(id) ON DELETE SET NULL,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid DEFAULT auth.uid()
);

ALTER TABLE public.dd_sales_queue ENABLE ROW LEVEL SECURITY;

CREATE POLICY dd_sales_queue_staff_all ON public.dd_sales_queue
  FOR ALL TO authenticated
  USING (private.dd_is_staff_admin())
  WITH CHECK (private.dd_is_staff_admin());

INSERT INTO public.dd_sales_queue (contact_name, company_name, role_title, phone, email, lane, source, source_confidence, notes) VALUES
  ('Betzalel Levin', 'Sapir Realty', 'CEO', '770-330-6944', 'blevin@sapirrealty.com', 'REVISIT_CALLABLE', 'HUBSPOT_DEAL', 'VERIFIED', 'HubSpot company has an existing deal.'),
  ('Rouella Prado', 'Sapir Realty', 'Accounting Director', '678-487-7896', 'ella@sapirrealty.com', 'REVISIT_CALLABLE', 'HUBSPOT_DEAL', 'VERIFIED', 'Backup contact if Betzalel unreachable.'),
  ('Kim Carlo Calupig', 'Sapir Realty', 'Administrative Services Manager', '404-689-4984', 'carlo@sapirrealty.com', 'REVISIT_CALLABLE', 'HUBSPOT_DEAL', 'VERIFIED', NULL),
  ('Nico Nacpil', 'Sapir Realty', 'Property Owner Coordinator', '404-446-1344', 'nico@sapirrealty.com', 'REVISIT_CALLABLE', 'HUBSPOT_DEAL', 'VERIFIED', NULL),
  ('Paolo Gulinao', 'Sapir Realty', 'Admin Assistant', '404-207-1013', 'paolo@sapirrealty.com', 'REVISIT_CALLABLE', 'HUBSPOT_DEAL', 'VERIFIED', NULL),
  ('Missy Nacpil', 'Sapir Realty', 'Admin Assistant', '404-301-0633', 'missy@sapirrealty.com', 'REVISIT_CALLABLE', 'HUBSPOT_DEAL', 'VERIFIED', NULL),
  ('Mia Fairly', 'One Source Atlanta', 'Founder & Managing Broker', '678-705-7877', 'miafairly@gmail.com', 'REVISIT_CALLABLE', 'HUBSPOT_DEAL', 'VERIFIED', 'Double-verified: matches independent web-sourced record exactly.'),
  ('Robert Parmar', 'Summerfield Management', 'Managing Director', '770-628-5943', NULL, 'REVISIT_CALLABLE', 'WEB_SOURCED', 'SINGLE_SOURCE', 'Company leadership page lists direct number and day-to-day ops role.'),
  ('Adam Hinman', 'Vision Realty & Management', 'President / Principal', '678-886-8864', NULL, 'REVISIT_CALLABLE', 'WEB_SOURCED', 'SINGLE_SOURCE', NULL),
  ('Hayes Moody', 'DHC Property Management', 'Founder', '678-786-2296', NULL, 'REVISIT_ROUTING', 'WEB_SOURCED', 'SINGLE_SOURCE', 'Main company line; ask for Hayes.'),
  ('Patrick Freeze / Tony Cook', 'Bay Property Management Group Atlanta', 'CEO / COO', '404-855-0999', NULL, 'REVISIT_ROUTING', 'WEB_SOURCED', 'SINGLE_SOURCE', 'Atlanta office line; ask for Patrick Freeze or Tony Cook.'),
  ('Cindy Batey', 'Asset Living', 'Principal, Southeast Operations', '404-995-1111', NULL, 'REVISIT_ROUTING', 'WEB_SOURCED', 'SINGLE_SOURCE', 'Atlanta office line; ask for Cindy Batey.'),
  ('Ginger Ashton', 'Atlantic | Pacific Companies', 'VP Operations, GA', NULL, NULL, 'REVISIT_NOT_CALLABLE', 'WEB_SOURCED', 'SINGLE_SOURCE', 'Named on company leadership page; no verified direct number yet.'),
  ('Shanna Pope / Matt DeGraw', 'Bridge Property Management', 'EVP Field Ops / CEO', NULL, NULL, 'REVISIT_NOT_CALLABLE', 'WEB_SOURCED', 'SINGLE_SOURCE', 'Named on leadership roster; no verified direct number yet.'),
  ('Hayden Woods', 'ResiHome', 'Operations leadership', NULL, NULL, 'REVISIT_NOT_CALLABLE', 'WEB_SOURCED', 'LOW_CONFIDENCE', 'Source is a third-party contact-scraper site, not a company-owned page; treat as low confidence.'),
  ('RPM Living Vendors', 'RPM Living', NULL, NULL, 'vendors@rpmliving.com', 'EMAIL_ONLY', 'HUBSPOT_DEAL', 'VERIFIED', 'Generic vendor inbox, no named contact.'),
  ('Joshua Bamidele', NULL, NULL, NULL, NULL, 'WARM', 'LINKEDIN_MESSAGE', 'VERIFIED', 'Asked directly about property-management operational challenges on Aug 5, still unanswered. Answer his question first, then bridge to current offerings.'),
  ('Nicole Woodard', 'PS Atlanta', NULL, NULL, NULL, 'WARM', 'LINKEDIN_MESSAGE', 'VERIFIED', 'Sent Vendor Capability Packet pitch Jul 23 (turnover/deep clean/notary/resident engagement). Re-engage.'),
  ('Joshua Hares', 'NextHome MainStreet', NULL, NULL, NULL, 'WARM', 'LINKEDIN_MESSAGE', 'VERIFIED', 'Sent single-source-partner pitch + Vendor Capability Packet Jul 23. Re-engage.'),
  ('Daniel Immediato', 'Dan D'' Handyman LLC', NULL, NULL, NULL, 'WARM', 'LINKEDIN_MESSAGE', 'VERIFIED', 'Cross-referral partnership pitch sent Jul 23 re: handyman overflow work. Could fill the real Handyman Support (D02) provider gap.'),
  ('David Stanfield', NULL, NULL, NULL, NULL, 'WARM', 'LINKEDIN_MESSAGE', 'VERIFIED', 'Asked what inspired founding DANI, Aug 1, unanswered. No property-management role confirmed.'),
  ('Jerry Glenn Malig-on', NULL, NULL, NULL, NULL, 'WARM', 'LINKEDIN_MESSAGE', 'VERIFIED', 'Followed up himself Aug 13 asking if an earlier message slipped through. Reply needed.'),
  ('Bradley Richards', NULL, NULL, NULL, NULL, 'WARM', 'LINKEDIN_MESSAGE', 'VERIFIED', 'Sent a proposal Jul 25, no visible reply since.'),
  ('Marvin White', NULL, NULL, NULL, NULL, 'INBOUND', 'LINKEDIN_MARKETPLACE', 'VERIFIED', 'Actively requested Executive Administrative Assistance. Maps to real D04 admin lane.'),
  ('Sristi Ghosh', NULL, NULL, NULL, NULL, 'INBOUND', 'LINKEDIN_MARKETPLACE', 'VERIFIED', 'Actively requested Event Planning. Maps to real D10 events lane.'),
  ('Muhammad Hassan Sajid', NULL, NULL, NULL, NULL, 'SCREEN_ONLY', 'LINKEDIN_MARKETPLACE', 'VERIFIED', 'Requested "Customer Service" -- no matching SKU in the verified catalog yet.'),
  ('Aerish Camacho', NULL, NULL, NULL, NULL, 'SCREEN_ONLY', 'LINKEDIN_MARKETPLACE', 'VERIFIED', 'Requested "Customer Service" -- no matching SKU in the verified catalog yet.'),
  ('Flynt Waters', 'Waters Roofing', 'Owner', NULL, NULL, 'PARTNER', 'LINKEDIN_INVITE', 'VERIFIED', 'Commercial roofer, Atlanta/Southeast. Positioned himself as a referral resource, not a sales prospect.'),
  ('Daphne Mumba', NULL, NULL, NULL, NULL, 'SCREEN_ONLY', 'LINKEDIN_INVITE', 'VERIFIED', 'New connection accepted; not yet screened for relevance.'),
  ('AJ Jain', NULL, NULL, NULL, NULL, 'SCREEN_ONLY', 'LINKEDIN_INVITE', 'VERIFIED', 'BI/ERP consultant for construction/real estate; generic connection request, low relevance so far.')
;
