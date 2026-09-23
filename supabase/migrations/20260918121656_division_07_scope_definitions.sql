-- Division 07 had zero real cost/margin data and, for most of its canonical SKUs, only the
-- generic boilerplate "Canonical Division 07 service offer; ad spend, media production,
-- printing and third-party costs excluded unless stated." -- giving a customer no real idea
-- what was included vs. a billable add-on. This replaces that boilerplate with real,
-- defensible scope/exclusion text for the 17 SKUs that carried it, following the same pattern
-- used for Division 08 (20260918110547_division_08_scope_definitions_and_retainer_fix.sql). It
-- also backfills scope/exclusions in dd_master_service_universe (previously just "Defined
-- deliverables; final scope confirmed at intake.") for 3 more SKUs (DNI-07A-007, -009, -013)
-- whose services.description was already specific and is left unchanged here.
--
-- Airtable base appJjOPWnFsZe11zM / table "04 Service Economics" (tblXF1ltLjW6DrFgz) was
-- spot-checked for DNI-07A* SKUs before writing this and returned zero matching rows,
-- confirming this session's earlier finding of zero real Division 07 economics coverage.
--
-- NOTE FOR HUMAN REVIEW (not fixed here, out of this pass's scope): DNI-07A-005 (Social Media
-- Management, $650/mo) and DNI-07A-011 (Local SEO Management, $450/mo) are already correctly
-- tagged RECURRING/MONTHLY. DNI-07A-009 (Newsletter Production) is priced/tagged ONETIME even
-- though its own description says "recurring newsletters" -- flagged for a possible billing-
-- cycle correction similar to the Division 08 retainer fix, but not changed in this pass since
-- it wasn't part of the explicit instruction for this division.

CREATE TEMP TABLE tmp_d07_scope (
  canonical_sku text PRIMARY KEY, description text, scope text, exclusions text, update_description boolean
);
INSERT INTO tmp_d07_scope (canonical_sku, description, scope, exclusions, update_description) VALUES
  ('DNI-07A-001', 'Structured review of current marketing channels, presence, and messaging, with a written findings report and priorities.', 'One structured review of the client''s existing marketing (website, social, listings, messaging) plus a written findings report with prioritized recommendations.', 'Implementation of recommended fixes; paid-ad-account audits requiring platform access beyond what''s provided; ongoing monitoring.', true),
  ('DNI-07A-002', 'Written marketing strategy covering positioning, priority channels, and a phased approach for one business or offer.', 'A written strategy document (positioning, priority channels, phased next steps) for one defined business or offer.', 'Execution of the strategy (each channel/tactic quoted separately); ad spend or media production; ongoing strategy management.', true),
  ('DNI-07A-003', 'Written plan for one marketing campaign: messaging, channels, timeline, and success measures.', 'A written campaign plan (messaging, channel mix, timeline, and measurement approach) for one defined campaign.', 'Ad spend; creative production (see relevant content/photography/video services); running or managing the campaign.', true),
  ('DNI-07A-004', 'A written content calendar of topics, formats, and publish dates for one agreed period.', 'One content calendar (topics, formats, channels, and dates) for one agreed period (default: one month).', 'Content creation itself (see Social Post Creation, Blog Writing, etc.); ongoing calendar maintenance beyond the delivered period.', true),
  ('DNI-07A-005', 'Monthly scheduling, posting, and basic engagement monitoring across an agreed set of social channels using approved content.', 'Scheduling and publishing an agreed volume of posts per month across an agreed number of social channels, using client-approved or previously-created content, plus basic engagement monitoring (likes/comments/DMs) and a monthly summary.', 'Content creation (see Social Post Creation/Short-Form Content); paid ad spend or boosted-post budget; crisis/reputation response beyond routine engagement (see Reputation Workflow).', true),
  ('DNI-07A-006', 'Copywriting and basic graphic layout for one social media post.', 'Caption copy and one basic graphic/layout for one social post on an agreed platform.', 'Original photography or video (see Brand Photography/Video Editing); paid boosting; scheduling/publishing (see Social Media Management).', true),
  ('DNI-07A-007', 'Planning, editing and packaging of short-form social videos from client-provided or approved footage.', 'Planning, editing and packaging of one short-form social video (e.g. Reel/TikTok/Short) from client-provided or approved footage.', 'Filming/videography (see Brand Photography or a videography add-on); paid promotion; scriptwriting beyond basic structuring.', false),
  ('DNI-07A-008', 'Setup of one email marketing platform account, including template configuration and one initial campaign build.', 'Platform account configuration, one branded email template, list import (client-provided list), and build of one initial campaign for send.', 'Email platform subscription fees; list-building/lead generation; copywriting for ongoing campaigns beyond the one initial build; deliverability/compliance consulting.', true),
  ('DNI-07A-009', 'Planning, formatting, scheduling and operational management of recurring newsletters using approved content and lists.', 'Formatting one newsletter issue into the client''s email platform, plus scheduling, using client-approved content and an existing list.', 'Writing the newsletter content itself (quoted separately, see Blog Writing/Website Content); list growth; platform subscription fees.', false),
  ('DNI-07A-010', 'Initial local-SEO configuration for one business: Google Business Profile claim/optimization, and core local citations.', 'Google Business Profile claim/optimization and setup of an agreed number of core local-directory citations (default up to 5) for one business location.', 'Paid citation-service fees; ongoing citation monitoring/cleanup (see Local SEO Management); website technical SEO changes (see On-Page SEO).', true),
  ('DNI-07A-011', 'Monthly local-SEO upkeep for one business: Google Business Profile posting, citation monitoring, and a monthly ranking/traffic summary.', 'An agreed number of monthly Google Business Profile posts/updates, monitoring of core local citations for accuracy, and a monthly summary report for one business location.', 'Initial setup (see Local SEO Setup); paid ranking-tool subscriptions beyond what''s already available; review generation/response (see Reputation Workflow and Google Business Profile Management).', true),
  ('DNI-07A-012', 'Setup and ongoing optimization of one Google Business Profile listing, including categories, services, photos, and posts.', 'Claim/verification support, profile field optimization (categories, services, hours), upload of client-provided photos, and an agreed number of posts for one listing.', 'Review response management (see Reputation Workflow); paid Google Business Profile products; multi-location setup (quoted per location).', true),
  ('DNI-07A-013', 'Administrative monitoring and drafting of customer-review responses using approved brand guidelines and escalation rules.', 'Monitoring of an agreed set of review platforms and drafting of responses to new reviews using client-approved brand guidelines and escalation rules.', 'Soliciting/generating new reviews; posting responses without client approval unless pre-authorized; legal handling of defamatory reviews.', false),
  ('DNI-07A-014', 'Written keyword research brief identifying priority search terms for one business or offer.', 'A written brief of priority keywords (search volume/intent noted where available) for one defined business, offer, or set of pages.', 'Paid keyword-tool data beyond what''s available in standard research tools; on-page implementation (see On-Page SEO); ongoing keyword tracking.', true),
  ('DNI-07A-015', 'On-page SEO optimization (titles, meta descriptions, headers, basic internal linking) for an agreed set of website pages.', 'On-page optimization of an agreed number of pages (default up to 5): title tags, meta descriptions, header structure, and basic internal links.', 'Keyword research itself (see Keyword Research); technical/site-speed SEO; new page copywriting (see Website Content).', true),
  ('DNI-07A-016', 'Website copywriting for an agreed set of pages based on client-provided direction and existing brand voice.', 'Copywriting for an agreed number of website pages (default up to 3) using client-provided direction, for insertion into an existing site structure.', 'Website design/development; SEO keyword strategy (see Keyword Research); ongoing content updates (see Website Copy Refresh).', true),
  ('DNI-07A-017', 'Writing of an agreed number of blog posts based on client-provided topics or an approved content calendar.', 'Writing of an agreed number of blog posts (default: one post, approx. 600-900 words) per the client''s approved topic/outline.', 'Topic/keyword research (see Keyword Research); publishing/formatting into the website (quoted separately if needed); image sourcing.', true),
  ('DNI-07A-018', 'On-site photography of one property (interior/exterior) with basic editing and digital delivery.', 'One on-site photography session of a single property, basic color/exposure editing, and digital delivery of an agreed number of final images.', 'Travel beyond a defined local radius (billed as an add-on); drone/aerial photography; virtual staging; print products.', true),
  ('DNI-07A-019', 'On-site or studio photography session for one business''s branding needs (team, product, or location shots), with basic editing and digital delivery.', 'One photography session (up to an agreed duration) for one business, basic editing, and digital delivery of an agreed number of final images.', 'Travel beyond a defined local radius; hair/makeup or styling services; usage/licensing for paid advertising beyond standard business use; print products.', true),
  ('DNI-07A-020', 'Editing of client-provided raw video footage into one finished video.', 'Editing (cuts, basic color, titles/captions, music from a licensed library) of client-provided footage into one finished video up to an agreed length.', 'Filming/videography itself (see Brand Photography or a videography add-on); paid stock footage/music beyond a standard licensed library; motion graphics/animation beyond basic titles.', true)
;

UPDATE public.services s
SET description = t.description
FROM tmp_d07_scope t
WHERE s.sku = t.canonical_sku AND t.update_description;

UPDATE public.dd_master_service_universe m
SET scope = t.scope,
    exclusions = t.exclusions,
    conflict_register = coalesce(conflict_register, '') || ' SCOPE DEFINED 2026-09-18: replaced generic boilerplate/placeholder scope with real scope/exclusions per the Division 06/07 audit pass.',
    updated_at = now()
FROM tmp_d07_scope t
WHERE m.canonical_sku = t.canonical_sku;

DROP TABLE tmp_d07_scope;
