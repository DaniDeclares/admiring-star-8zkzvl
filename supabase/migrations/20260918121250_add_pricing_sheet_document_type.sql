-- Task #20: providers/vendors currently have no way to upload their own pricing sheet through
-- vendor onboarding except the generic "OTHER" bucket, which gives staff no signal that a
-- document should be reviewed as a possible new-service catalog input (the same manual review
-- process already used this session for every real pricing sheet Danielle has uploaded). Adds
-- PRICING_SHEET as a real, distinct document type.

alter table public.dd_provider_application_documents drop constraint dd_provider_application_documents_document_type_check;
alter table public.dd_provider_application_documents add constraint dd_provider_application_documents_document_type_check
  check (document_type = any (array['GOVERNMENT_ID','W9','COI','BUSINESS_REGISTRATION','PROFESSIONAL_LICENSE','CERTIFICATION','AUTO_INSURANCE','BACKGROUND_CONSENT','AGREEMENT','PORTFOLIO','WORK_SAMPLE','PRICING_SHEET','OTHER']));
