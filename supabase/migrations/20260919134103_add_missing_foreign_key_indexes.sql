-- Purely additive performance fix from the Supabase performance advisor's
-- unindexed_foreign_keys lint (57 findings, verified against pg_constraint
-- directly rather than trusting the advisor's truncated text -- exact
-- table+column pairs confirmed via a join against pg_attribute/pg_index).
-- CREATE INDEX IF NOT EXISTS on each FK column: no behavior change, no risk
-- to correctness, matches the project's own established pattern
-- (20260829232545_optimize_provider_work_order_indexes_2026_08_29.sql,
-- 20260829232611_complete_remaining_fk_indexes_2026_08_29.sql). The other
-- three advisor categories (unused_index, auth_rls_initplan,
-- multiple_permissive_policies) are NOT touched here -- each requires a
-- case-by-case correctness/intent judgment (dropping an index or merging
-- RLS policies can silently change access control), not a mechanical fix.
CREATE INDEX IF NOT EXISTS idx_dd_contract_amendments_acknowledged_by ON public.dd_contract_amendments(acknowledged_by);
CREATE INDEX IF NOT EXISTS idx_dd_contract_awards_proposal_id ON public.dd_contract_awards(proposal_id);
CREATE INDEX IF NOT EXISTS idx_dd_contract_buyers_organization_id ON public.dd_contract_buyers(organization_id);
CREATE INDEX IF NOT EXISTS idx_dd_contract_buyers_source_opportunity_id ON public.dd_contract_buyers(source_opportunity_id);
CREATE INDEX IF NOT EXISTS idx_dd_contract_closeouts_closed_by ON public.dd_contract_closeouts(closed_by);
CREATE INDEX IF NOT EXISTS idx_dd_contract_compliance_items_owner_user_id ON public.dd_contract_compliance_items(owner_user_id);
CREATE INDEX IF NOT EXISTS idx_dd_contract_deliverables_completed_by ON public.dd_contract_deliverables(completed_by);
CREATE INDEX IF NOT EXISTS idx_dd_contract_documents_contract_id ON public.dd_contract_documents(contract_id);
CREATE INDEX IF NOT EXISTS idx_dd_contract_documents_opportunity_id ON public.dd_contract_documents(opportunity_id);
CREATE INDEX IF NOT EXISTS idx_dd_contract_documents_proposal_id ON public.dd_contract_documents(proposal_id);
CREATE INDEX IF NOT EXISTS idx_dd_contract_documents_solicitation_id ON public.dd_contract_documents(solicitation_id);
CREATE INDEX IF NOT EXISTS idx_dd_contract_documents_uploaded_by ON public.dd_contract_documents(uploaded_by);
CREATE INDEX IF NOT EXISTS idx_dd_contract_events_actor_user_id ON public.dd_contract_events(actor_user_id);
CREATE INDEX IF NOT EXISTS idx_dd_contract_events_contract_id ON public.dd_contract_events(contract_id);
CREATE INDEX IF NOT EXISTS idx_dd_contract_events_opportunity_id ON public.dd_contract_events(opportunity_id);
CREATE INDEX IF NOT EXISTS idx_dd_contract_events_pursuit_id ON public.dd_contract_events(pursuit_id);
CREATE INDEX IF NOT EXISTS idx_dd_contract_opportunities_buyer_organization_id ON public.dd_contract_opportunities(buyer_organization_id);
CREATE INDEX IF NOT EXISTS idx_dd_contract_opportunities_created_by ON public.dd_contract_opportunities(created_by);
CREATE INDEX IF NOT EXISTS idx_dd_contract_procurement_events_buyer_id ON public.dd_contract_procurement_events(buyer_id);
CREATE INDEX IF NOT EXISTS idx_dd_contract_proposals_solicitation_id ON public.dd_contract_proposals(solicitation_id);
CREATE INDEX IF NOT EXISTS idx_dd_contract_proposals_submitted_by ON public.dd_contract_proposals(submitted_by);
CREATE INDEX IF NOT EXISTS idx_dd_contract_pursuits_buyer_id ON public.dd_contract_pursuits(buyer_id);
CREATE INDEX IF NOT EXISTS idx_dd_contract_pursuits_opportunity_id ON public.dd_contract_pursuits(opportunity_id);
CREATE INDEX IF NOT EXISTS idx_dd_contract_pursuits_pursuit_owner ON public.dd_contract_pursuits(pursuit_owner);
CREATE INDEX IF NOT EXISTS idx_dd_contract_qualification_items_owner_user_id ON public.dd_contract_qualification_items(owner_user_id);
CREATE INDEX IF NOT EXISTS idx_dd_contract_renewals_owner_user_id ON public.dd_contract_renewals(owner_user_id);
CREATE INDEX IF NOT EXISTS idx_dd_contract_solicitation_questions_submitted_by ON public.dd_contract_solicitation_questions(submitted_by);
CREATE INDEX IF NOT EXISTS idx_dd_contract_solicitations_pursuit_id ON public.dd_contract_solicitations(pursuit_id);
CREATE INDEX IF NOT EXISTS idx_dd_contract_submission_gates_submitted_by ON public.dd_contract_submission_gates(submitted_by);
CREATE INDEX IF NOT EXISTS idx_dd_contracts_award_id ON public.dd_contracts(award_id);
CREATE INDEX IF NOT EXISTS idx_dd_contracts_buyer_organization_id ON public.dd_contracts(buyer_organization_id);
CREATE INDEX IF NOT EXISTS idx_dd_contracts_owner_user_id ON public.dd_contracts(owner_user_id);
CREATE INDEX IF NOT EXISTS idx_dd_contracts_pursuit_id ON public.dd_contracts(pursuit_id);
CREATE INDEX IF NOT EXISTS idx_dd_discovery_transfer_register_related_matrix_number ON public.dd_discovery_transfer_register(related_matrix_number);
CREATE INDEX IF NOT EXISTS idx_dd_invoices_contract_id ON public.dd_invoices(contract_id);
CREATE INDEX IF NOT EXISTS idx_dd_jobs_contract_id ON public.dd_jobs(contract_id);
CREATE INDEX IF NOT EXISTS idx_dd_messages_sender_auth_user_id ON public.dd_messages(sender_auth_user_id);
CREATE INDEX IF NOT EXISTS idx_dd_partners_staff_owner ON public.dd_partners(staff_owner);
CREATE INDEX IF NOT EXISTS idx_dd_portal_onboarding_intakes_client_property_id ON public.dd_portal_onboarding_intakes(client_property_id);
CREATE INDEX IF NOT EXISTS idx_dd_portal_onboarding_intakes_property_resident_invite_id ON public.dd_portal_onboarding_intakes(property_resident_invite_id);
CREATE INDEX IF NOT EXISTS idx_dd_portal_user_roles_provider_org_id ON public.dd_portal_user_roles(provider_org_id);
CREATE INDEX IF NOT EXISTS idx_dd_property_resident_access_invited_by_user_id ON public.dd_property_resident_access(invited_by_user_id);
CREATE INDEX IF NOT EXISTS idx_dd_property_resident_invites_created_by_user_id ON public.dd_property_resident_invites(created_by_user_id);
CREATE INDEX IF NOT EXISTS idx_dd_provider_agreement_signatures_signer_user_id ON public.dd_provider_agreement_signatures(signer_user_id);
CREATE INDEX IF NOT EXISTS idx_dd_provider_application_capabilities_canonical_service_id ON public.dd_provider_application_capabilities(canonical_service_id);
CREATE INDEX IF NOT EXISTS idx_dd_provider_application_documents_capability_id ON public.dd_provider_application_documents(capability_id);
CREATE INDEX IF NOT EXISTS idx_dd_provider_capability_categories_division_id ON public.dd_provider_capability_categories(division_id);
CREATE INDEX IF NOT EXISTS idx_dd_provider_w9_submissions_provider_application_id ON public.dd_provider_w9_submissions(provider_application_id);
CREATE INDEX IF NOT EXISTS idx_dd_provider_w9_submissions_verified_by ON public.dd_provider_w9_submissions(verified_by);
CREATE INDEX IF NOT EXISTS idx_dd_provider_w9_tin_access_log_accessed_by ON public.dd_provider_w9_tin_access_log(accessed_by);
CREATE INDEX IF NOT EXISTS idx_dd_provider_w9_tin_access_log_w9_submission_id ON public.dd_provider_w9_tin_access_log(w9_submission_id);
CREATE INDEX IF NOT EXISTS idx_dd_sales_queue_job_id ON public.dd_sales_queue(job_id);
CREATE INDEX IF NOT EXISTS idx_dd_stripe_catalog_sync_source_service_id ON public.dd_stripe_catalog_sync(source_service_id);
CREATE INDEX IF NOT EXISTS idx_dd_work_orders_contract_id ON public.dd_work_orders(contract_id);
CREATE INDEX IF NOT EXISTS idx_dd_work_orders_lead_id ON public.dd_work_orders(lead_id);
CREATE INDEX IF NOT EXISTS idx_dd_work_orders_service_id ON public.dd_work_orders(service_id);
CREATE INDEX IF NOT EXISTS idx_services_pricing_engine_code ON public.services(pricing_engine_code);
