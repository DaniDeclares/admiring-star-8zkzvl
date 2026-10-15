
insert into public.dd_social_business_idea_triage(
  idea_key,idea_name,target_division_slug,status,strategic_fit,capital_intensity,claim_treatment,next_action,guardrails,source_basis
)
values
(
  'FACELESS_CONTENT_ENGINE',
  'Faceless AI-assisted content engine (reels, carousels, 30-day plans)',
  'marketing-content-media-production',
  'BUILD_NEXT',
  'HIGH - owner-home fulfillment tied to LIVE_READY marketing services and DANI demand generation across all five channels.',
  'LOW',
  'Use the content-production method; ignore unverified follower/sales claims from creator posts.',
  jsonb_build_array(
    'DOGFOOD_ON_DANI_OWNED_SOCIAL_FIRST',
    'CH01_RESIDENT_EDUCATION_AND_SERVICE_DEMAND',
    'CH02_PROPERTY_OPERATIONS_AND_RESIDENT_ENGAGEMENT',
    'CH03_AGENT_LISTING_OPEN_HOUSE_AND_CLIENT_CONTENT',
    'CH04_SMALL_BUSINESS_SOCIAL_AND_EMAIL_MARKETING',
    'CH05_DANI_GOVERNMENT_CAPABILITY_EDUCATION_AND_PUBLIC_SECTOR_RELEVANCE_CONTENT',
    'FULFILL_LIVE_SKUS_DNI-07A-004_005_006_007',
    'TRACK_LEADS_BOOKINGS_AND_SALES_NOT_VIEWS'
  ),
  jsonb_build_object(
    'no_income_claims',true,
    'original_or_licensed_media_only',true,
    'no_ai_avatar_impersonating_a_real_person',true,
    'follow_platform_ai_content_disclosure_rules',true,
    'paid_service_channel_must_remain_governed',true
  ),
  'Owner-forwarded social posts + owner directive for cross-channel application 2026-10-06'
),
(
  'AI_PROFILE_AUDIT',
  'AI-assisted social/profile audit workflow',
  'marketing-content-media-production',
  'BUILD_NEXT',
  'HIGH - directly fulfills LIVE_READY Marketing Audit and can be used as a free mini-audit opener before a paid engagement.',
  'LOW',
  'Use AI as an analysis aid, not as proof of platform analytics. Distinguish visible public profile evidence from inferred recommendations.',
  jsonb_build_array(
    'BUILD_STANDARD_PROFILE_AUDIT_CHECKLIST',
    'CH01_AUDIT_DANI_RESIDENT_FACING_CONTENT_FOR_CLARITY_AND_LOCAL_DISCOVERY',
    'CH02_AUDIT_APARTMENT_PROPERTY_AND_PM_PUBLIC_PROFILES_FOR_RESIDENT_ENGAGEMENT_AND_VENDOR_POSITIONING',
    'CH03_AUDIT_REAL_ESTATE_AGENT_BROKERAGE_AND_LISTING_CONTENT',
    'CH04_AUDIT_SMALL_BUSINESS_PROFILE_CONVERSION_AND_CONTENT_GAPS',
    'CH05_AUDIT_DANI_OWN_GOVERNMENT_CAPABILITY_MESSAGING_AND_PUBLIC_FACING_CREDIBILITY',
    'USE_AS_FULFILLMENT_METHOD_FOR_DNI-07A-001',
    'OFFER_FREE_MINI_AUDIT_ONLY_WHERE_OUTREACH_CADENCE_AND_AUTHORITY_ALLOW'
  ),
  jsonb_build_object(
    'no_private_analytics_claims',true,
    'public_evidence_only_unless_client_provides_data',true,
    'no_fake_engagement_metrics',true,
    'no_scraping_private_profiles',true,
    'paid_service_channel_must_remain_governed',true
  ),
  'Owner-forwarded AI browser/profile audit post + owner directive for cross-channel application 2026-10-06'
),
(
  'CREDIT_REPAIR_SERVICE',
  'For-profit credit repair / dispute community',
  'business-development-growth',
  'REJECTED_REGULATED',
  'NONE as a DANI service',
  'LOW',
  'Removal hacks and fast-track claims are not credible. Paid credit repair is federally regulated and Georgia sharply restricts for-profit credit repair.',
  jsonb_build_array(
    'DO_NOT_OFFER_AS_DANI_SERVICE',
    'DO_NOT_MARKET_TO_ANY_CHANNEL',
    'OWNER_PERSONAL_USE_ONLY_PULL_OWN_REPORTS_AND_DISPUTE_GENUINE_ERRORS_DIRECTLY'
  ),
  jsonb_build_object(
    'no_credit_repair_offer',true,
    'no_affiliate_links_to_credit_repair_funnels',true
  ),
  'Owner-forwarded social posts 2026-10-06'
)
on conflict(idea_key) do update
set idea_name=excluded.idea_name,
    target_division_slug=excluded.target_division_slug,
    status=excluded.status,
    strategic_fit=excluded.strategic_fit,
    capital_intensity=excluded.capital_intensity,
    claim_treatment=excluded.claim_treatment,
    next_action=excluded.next_action,
    guardrails=excluded.guardrails,
    source_basis=excluded.source_basis,
    updated_at=now();

delete from public.dd_content_draft_queue
where content_key in (
  'OP1M_CH01_CONTENT_PROOF_20261006',
  'OP1M_CH02_CONTENT_PROOF_20261006',
  'OP1M_CH03_CONTENT_PROOF_20261006',
  'OP1M_CH04_CONTENT_PROOF_20261006',
  'OP1M_CH05_CONTENT_PROOF_20261006'
);

insert into public.dd_content_draft_queue(
  content_key,target_surface,audience_roles,title_working,content_goal,source_evidence,
  required_disclaimers,draft_markdown,status,auto_publish_allowed,official_training,owner_review_required
)
values
(
  'OP1M_CH01_CONTENT_PROOF_20261006',
  'DANI_OWNED_SOCIAL',
  array['RESIDENTS','HOUSEHOLDS'],
  'Three things to photograph before a cleaning or home reset starts',
  'Prove DANI can turn operational know-how into useful resident content while generating CH01 service demand.',
  jsonb_build_object('channel','CH01','supports_live_marketing_skus',jsonb_build_array('DNI-07A-004','DNI-07A-006','DNI-07A-007')),
  jsonb_build_object('no_guaranteed_results',true),
  'Before a cleaner, organizer, handyman, or reset team starts, take three quick photos: the room as a whole, any damage or special concern, and anything you need left untouched. Good documentation prevents confusion and makes the handoff easier. DANI DECLARES handles the execution from request through completion.',
  'OWNER_REVIEW',
  false,false,true
),
(
  'OP1M_CH02_CONTENT_PROOF_20261006',
  'DANI_OWNED_SOCIAL',
  array['PROPERTY_MANAGERS','APARTMENT_TEAMS'],
  'A unit turn is more than cleaning',
  'Reposition DANI to CH02 as an execution partner across turns, documentation, field support and operations.',
  jsonb_build_object('channel','CH02','positioning','WE_HANDLE_THE_EXECUTION'),
  jsonb_build_object('no_false_client_claims',true),
  'A unit turn is not just a cleaning appointment. It is access, arrival condition, make-ready work, exceptions, photos, QA, keys, vendor coordination, and a clean handoff back to the property team. That is the gap DANI DECLARES is built to handle: the execution behind the turn.',
  'OWNER_REVIEW',
  false,false,true
),
(
  'OP1M_CH03_CONTENT_PROOF_20261006',
  'DANI_OWNED_SOCIAL',
  array['REAL_ESTATE_AGENTS','BROKERAGES'],
  'Listing day should not be a scramble',
  'Show CH03 buyers how DANI bundles listing prep, field support, setup and client-facing execution.',
  jsonb_build_object('channel','CH03','supports_cross_sell',true),
  jsonb_build_object('no_guaranteed_sale_claims',true),
  'Listing day should not require an agent to coordinate five little tasks alone. Prep, signage, setup, photo-ready details, documents, client touches, and last-minute field support can all sit under one execution plan. DANI DECLARES handles the execution so the agent can stay focused on the client and the deal.',
  'OWNER_REVIEW',
  false,false,true
),
(
  'OP1M_CH04_CONTENT_PROOF_20261006',
  'DANI_OWNED_SOCIAL',
  array['SMALL_BUSINESS_OWNERS','SOLO_OPERATORS'],
  'Your business may not need another employee yet',
  'Generate CH04 demand for owner-home admin, marketing and operations services.',
  jsonb_build_object('channel','CH04','live_owner_home_services',true),
  jsonb_build_object('no_income_claims',true),
  'Your business may not need another employee yet. It may need someone to clean up the inbox, organize the CRM, build the content calendar, document the SOP, follow up with customers, or coordinate the project. DANI DECLARES can take the execution off your plate without forcing you to build a full department first.',
  'OWNER_REVIEW',
  false,false,true
),
(
  'OP1M_CH05_CONTENT_PROOF_20261006',
  'DANI_OWNED_SOCIAL',
  array['PUBLIC_SECTOR_BUYERS','PRIME_CONTRACTORS','INSTITUTIONS'],
  'Small vendors win trust by making execution visible',
  'Strengthen CH05 credibility while educating public-sector and institutional buyers about DANI''s operating discipline.',
  jsonb_build_object('channel','CH05','positioning','CAPABILITY_AND_EXECUTION'),
  jsonb_build_object('no_award_claims',true,'no_certification_claims_unless_verified',true),
  'For public-sector and institutional work, being available is not enough. Buyers need scope control, documented handoffs, evidence, QA, and accountability. DANI DECLARES is building around that operating discipline: clear work, clear proof, clear closeout. We handle the execution.',
  'OWNER_REVIEW',
  false,false,true
);

select
  (select count(*) from public.dd_social_business_idea_triage where idea_key in ('FACELESS_CONTENT_ENGINE','AI_PROFILE_AUDIT','CREDIT_REPAIR_SERVICE')) as idea_rows,
  (select count(*) from public.dd_content_draft_queue where content_key like 'OP1M_CH0%_CONTENT_PROOF_20261006') as channel_proof_drafts;
