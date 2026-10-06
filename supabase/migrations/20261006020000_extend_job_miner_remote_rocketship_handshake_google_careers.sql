-- Extend the existing governed intelligence/job-mining spine with three public job sources.
-- Candidate discovery only: no outreach, application, spend, or production authority.

insert into public.dd_intelligence_miners (miner_key, miner_family, miner_name, purpose, output_class, default_route, authority_boundary, status)
values (
  'CAREER_OPPORTUNITY_MINER','REVENUE','Career Opportunity Miner',
  'Discover and verify legitimate paid employment and contract opportunities for Danielle from governed public job sources; dedupe and score candidates before Owner HQ review.',
  array['JOB_CANDIDATE','CAREER_INTELLIGENCE'], array['RESEARCH','OWNER_ATTENTION'],
  '{"may_contact":false,"may_apply":false,"may_spend_money":false,"observation_only":true,"production_write":false,"may_change_policy":false,"requires_owner_approval_before_application":true}'::jsonb,
  'ACTIVE'
)
on conflict (miner_key) do update set
  purpose=excluded.purpose, output_class=excluded.output_class, default_route=excluded.default_route,
  authority_boundary=excluded.authority_boundary, status=excluded.status, updated_at=now();

insert into public.dd_intelligence_sources
(source_key,source_name,source_family,access_mode,public_source,terms_review_required,robots_respect_required,pii_minimization_required,allowed_collection_scope,default_miner_keys,status,metadata,terms_gate_status,rate_limit_per_hour,provenance_required,collector_execution_allowed)
values
('REMOTE_ROCKETSHIP_PUBLIC','Remote Rocketship','PUBLIC_JOBS','COMPLIANT_PUBLIC_DISCOVERY',true,true,true,true,
 '{"allowed":["public_job_postings","public_company_links","public_role_metadata"],"prohibited":["account_bypass","private_profile_data","automated_application"]}'::jsonb,
 array['CAREER_OPPORTUNITY_MINER'],'ACTIVE','{"job_mining":true,"candidate_only":true,"owner_hq_route":true,"application_authority":false}'::jsonb,'PENDING',30,true,false),
('HANDSHAKE_PUBLIC_JOBS','Handshake public jobs','PUBLIC_JOBS','COMPLIANT_PUBLIC_DISCOVERY',true,true,true,true,
 '{"allowed":["public_job_postings","public_employer_metadata","public_role_metadata"],"prohibited":["account_bypass","student_private_data","automated_application"]}'::jsonb,
 array['CAREER_OPPORTUNITY_MINER'],'ACTIVE','{"job_mining":true,"candidate_only":true,"owner_hq_route":true,"application_authority":false}'::jsonb,'PENDING',30,true,false),
('GOOGLE_CAREERS_PUBLIC','Google Careers','COMPANY_CAREERS','OFFICIAL_PUBLIC',true,true,true,true,
 '{"allowed":["public_google_careers_postings","public_role_metadata","public_location_and_compensation_metadata"],"prohibited":["account_bypass","automated_application"]}'::jsonb,
 array['CAREER_OPPORTUNITY_MINER'],'ACTIVE','{"job_mining":true,"official_company_career_source":true,"candidate_only":true,"owner_hq_route":true,"application_authority":false}'::jsonb,'PENDING',60,true,false)
on conflict (source_key) do update set
 source_name=excluded.source_name, source_family=excluded.source_family, access_mode=excluded.access_mode,
 allowed_collection_scope=excluded.allowed_collection_scope, default_miner_keys=excluded.default_miner_keys,
 status=excluded.status, metadata=excluded.metadata, terms_review_required=excluded.terms_review_required,
 robots_respect_required=excluded.robots_respect_required, pii_minimization_required=excluded.pii_minimization_required,
 provenance_required=excluded.provenance_required, updated_at=now();
