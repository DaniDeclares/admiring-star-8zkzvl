
-- public schema: internal governance/audit tables with RLS enabled but no policy
CREATE POLICY "staff_admin_all_dd_company_cost_evidence" ON "public"."dd_company_cost_evidence"
FOR ALL USING (EXISTS (SELECT 1 FROM dd_portal_identities pi WHERE pi.auth_user_id = auth.uid() AND pi.is_active = true AND pi.portal_role = ANY (ARRAY['staff_admin'::text, 'procurement'::text])))
WITH CHECK (EXISTS (SELECT 1 FROM dd_portal_identities pi WHERE pi.auth_user_id = auth.uid() AND pi.is_active = true AND pi.portal_role = ANY (ARRAY['staff_admin'::text, 'procurement'::text])));

CREATE POLICY "staff_admin_all_dd_company_cost_summary" ON "public"."dd_company_cost_summary"
FOR ALL USING (EXISTS (SELECT 1 FROM dd_portal_identities pi WHERE pi.auth_user_id = auth.uid() AND pi.is_active = true AND pi.portal_role = ANY (ARRAY['staff_admin'::text, 'procurement'::text])))
WITH CHECK (EXISTS (SELECT 1 FROM dd_portal_identities pi WHERE pi.auth_user_id = auth.uid() AND pi.is_active = true AND pi.portal_role = ANY (ARRAY['staff_admin'::text, 'procurement'::text])));

CREATE POLICY "staff_admin_all_dd_dani_specials_underwriting_register" ON "public"."dd_dani_specials_underwriting_register"
FOR ALL USING (EXISTS (SELECT 1 FROM dd_portal_identities pi WHERE pi.auth_user_id = auth.uid() AND pi.is_active = true AND pi.portal_role = ANY (ARRAY['staff_admin'::text, 'procurement'::text])))
WITH CHECK (EXISTS (SELECT 1 FROM dd_portal_identities pi WHERE pi.auth_user_id = auth.uid() AND pi.is_active = true AND pi.portal_role = ANY (ARRAY['staff_admin'::text, 'procurement'::text])));

CREATE POLICY "staff_admin_all_dd_service_underwriting_audit" ON "public"."dd_service_underwriting_audit"
FOR ALL USING (EXISTS (SELECT 1 FROM dd_portal_identities pi WHERE pi.auth_user_id = auth.uid() AND pi.is_active = true AND pi.portal_role = ANY (ARRAY['staff_admin'::text, 'procurement'::text])))
WITH CHECK (EXISTS (SELECT 1 FROM dd_portal_identities pi WHERE pi.auth_user_id = auth.uid() AND pi.is_active = true AND pi.portal_role = ANY (ARRAY['staff_admin'::text, 'procurement'::text])));

CREATE POLICY "staff_admin_all_dd_underwriting_evidence_register" ON "public"."dd_underwriting_evidence_register"
FOR ALL USING (EXISTS (SELECT 1 FROM dd_portal_identities pi WHERE pi.auth_user_id = auth.uid() AND pi.is_active = true AND pi.portal_role = ANY (ARRAY['staff_admin'::text, 'procurement'::text])))
WITH CHECK (EXISTS (SELECT 1 FROM dd_portal_identities pi WHERE pi.auth_user_id = auth.uid() AND pi.is_active = true AND pi.portal_role = ANY (ARRAY['staff_admin'::text, 'procurement'::text])));

CREATE POLICY "staff_admin_all_dd_underwriting_rules" ON "public"."dd_underwriting_rules"
FOR ALL USING (EXISTS (SELECT 1 FROM dd_portal_identities pi WHERE pi.auth_user_id = auth.uid() AND pi.is_active = true AND pi.portal_role = ANY (ARRAY['staff_admin'::text, 'procurement'::text])))
WITH CHECK (EXISTS (SELECT 1 FROM dd_portal_identities pi WHERE pi.auth_user_id = auth.uid() AND pi.is_active = true AND pi.portal_role = ANY (ARRAY['staff_admin'::text, 'procurement'::text])));

-- private schema: catalog/provider/reconciliation tables with RLS enabled but no policy
CREATE POLICY "staff_admin_all_dd_catalog_capability_dependency_master" ON "private"."dd_catalog_capability_dependency_master"
FOR ALL USING (EXISTS (SELECT 1 FROM dd_portal_identities pi WHERE pi.auth_user_id = auth.uid() AND pi.is_active = true AND pi.portal_role = ANY (ARRAY['staff_admin'::text, 'procurement'::text])))
WITH CHECK (EXISTS (SELECT 1 FROM dd_portal_identities pi WHERE pi.auth_user_id = auth.uid() AND pi.is_active = true AND pi.portal_role = ANY (ARRAY['staff_admin'::text, 'procurement'::text])));

CREATE POLICY "staff_admin_all_dd_catalog_inventory_master" ON "private"."dd_catalog_inventory_master"
FOR ALL USING (EXISTS (SELECT 1 FROM dd_portal_identities pi WHERE pi.auth_user_id = auth.uid() AND pi.is_active = true AND pi.portal_role = ANY (ARRAY['staff_admin'::text, 'procurement'::text])))
WITH CHECK (EXISTS (SELECT 1 FROM dd_portal_identities pi WHERE pi.auth_user_id = auth.uid() AND pi.is_active = true AND pi.portal_role = ANY (ARRAY['staff_admin'::text, 'procurement'::text])));

CREATE POLICY "staff_admin_all_dd_catalog_provider_capability_master" ON "private"."dd_catalog_provider_capability_master"
FOR ALL USING (EXISTS (SELECT 1 FROM dd_portal_identities pi WHERE pi.auth_user_id = auth.uid() AND pi.is_active = true AND pi.portal_role = ANY (ARRAY['staff_admin'::text, 'procurement'::text])))
WITH CHECK (EXISTS (SELECT 1 FROM dd_portal_identities pi WHERE pi.auth_user_id = auth.uid() AND pi.is_active = true AND pi.portal_role = ANY (ARRAY['staff_admin'::text, 'procurement'::text])));

CREATE POLICY "staff_admin_all_dd_catalog_provider_master" ON "private"."dd_catalog_provider_master"
FOR ALL USING (EXISTS (SELECT 1 FROM dd_portal_identities pi WHERE pi.auth_user_id = auth.uid() AND pi.is_active = true AND pi.portal_role = ANY (ARRAY['staff_admin'::text, 'procurement'::text])))
WITH CHECK (EXISTS (SELECT 1 FROM dd_portal_identities pi WHERE pi.auth_user_id = auth.uid() AND pi.is_active = true AND pi.portal_role = ANY (ARRAY['staff_admin'::text, 'procurement'::text])));

CREATE POLICY "staff_admin_all_dd_msu_catalog_capability_evidence" ON "private"."dd_master_service_universe_catalog_capability_evidence"
FOR ALL USING (EXISTS (SELECT 1 FROM dd_portal_identities pi WHERE pi.auth_user_id = auth.uid() AND pi.is_active = true AND pi.portal_role = ANY (ARRAY['staff_admin'::text, 'procurement'::text])))
WITH CHECK (EXISTS (SELECT 1 FROM dd_portal_identities pi WHERE pi.auth_user_id = auth.uid() AND pi.is_active = true AND pi.portal_role = ANY (ARRAY['staff_admin'::text, 'procurement'::text])));

CREATE POLICY "staff_admin_all_dd_msu_legacy_package_evidence" ON "private"."dd_master_service_universe_legacy_package_evidence"
FOR ALL USING (EXISTS (SELECT 1 FROM dd_portal_identities pi WHERE pi.auth_user_id = auth.uid() AND pi.is_active = true AND pi.portal_role = ANY (ARRAY['staff_admin'::text, 'procurement'::text])))
WITH CHECK (EXISTS (SELECT 1 FROM dd_portal_identities pi WHERE pi.auth_user_id = auth.uid() AND pi.is_active = true AND pi.portal_role = ANY (ARRAY['staff_admin'::text, 'procurement'::text])));

CREATE POLICY "staff_admin_all_dd_msu_provider_evidence" ON "private"."dd_master_service_universe_provider_evidence"
FOR ALL USING (EXISTS (SELECT 1 FROM dd_portal_identities pi WHERE pi.auth_user_id = auth.uid() AND pi.is_active = true AND pi.portal_role = ANY (ARRAY['staff_admin'::text, 'procurement'::text])))
WITH CHECK (EXISTS (SELECT 1 FROM dd_portal_identities pi WHERE pi.auth_user_id = auth.uid() AND pi.is_active = true AND pi.portal_role = ANY (ARRAY['staff_admin'::text, 'procurement'::text])));

CREATE POLICY "staff_admin_all_dd_msu_reconciliation" ON "private"."dd_master_service_universe_reconciliation"
FOR ALL USING (EXISTS (SELECT 1 FROM dd_portal_identities pi WHERE pi.auth_user_id = auth.uid() AND pi.is_active = true AND pi.portal_role = ANY (ARRAY['staff_admin'::text, 'procurement'::text])))
WITH CHECK (EXISTS (SELECT 1 FROM dd_portal_identities pi WHERE pi.auth_user_id = auth.uid() AND pi.is_active = true AND pi.portal_role = ANY (ARRAY['staff_admin'::text, 'procurement'::text])));

CREATE POLICY "staff_admin_all_dd_provider_capability_reconciliation" ON "private"."dd_provider_capability_reconciliation"
FOR ALL USING (EXISTS (SELECT 1 FROM dd_portal_identities pi WHERE pi.auth_user_id = auth.uid() AND pi.is_active = true AND pi.portal_role = ANY (ARRAY['staff_admin'::text, 'procurement'::text])))
WITH CHECK (EXISTS (SELECT 1 FROM dd_portal_identities pi WHERE pi.auth_user_id = auth.uid() AND pi.is_active = true AND pi.portal_role = ANY (ARRAY['staff_admin'::text, 'procurement'::text])));

CREATE POLICY "staff_admin_all_dd_provider_commercial_terms" ON "private"."dd_provider_commercial_terms"
FOR ALL USING (EXISTS (SELECT 1 FROM dd_portal_identities pi WHERE pi.auth_user_id = auth.uid() AND pi.is_active = true AND pi.portal_role = ANY (ARRAY['staff_admin'::text, 'procurement'::text])))
WITH CHECK (EXISTS (SELECT 1 FROM dd_portal_identities pi WHERE pi.auth_user_id = auth.uid() AND pi.is_active = true AND pi.portal_role = ANY (ARRAY['staff_admin'::text, 'procurement'::text])));

CREATE POLICY "staff_admin_all_dd_provider_documents" ON "private"."dd_provider_documents"
FOR ALL USING (EXISTS (SELECT 1 FROM dd_portal_identities pi WHERE pi.auth_user_id = auth.uid() AND pi.is_active = true AND pi.portal_role = ANY (ARRAY['staff_admin'::text, 'procurement'::text])))
WITH CHECK (EXISTS (SELECT 1 FROM dd_portal_identities pi WHERE pi.auth_user_id = auth.uid() AND pi.is_active = true AND pi.portal_role = ANY (ARRAY['staff_admin'::text, 'procurement'::text])));

CREATE POLICY "staff_admin_all_dd_provider_routing_destinations" ON "private"."dd_provider_routing_destinations"
FOR ALL USING (EXISTS (SELECT 1 FROM dd_portal_identities pi WHERE pi.auth_user_id = auth.uid() AND pi.is_active = true AND pi.portal_role = ANY (ARRAY['staff_admin'::text, 'procurement'::text])))
WITH CHECK (EXISTS (SELECT 1 FROM dd_portal_identities pi WHERE pi.auth_user_id = auth.uid() AND pi.is_active = true AND pi.portal_role = ANY (ARRAY['staff_admin'::text, 'procurement'::text])));

CREATE POLICY "staff_admin_all_dd_service_capability_relationship" ON "private"."dd_service_capability_relationship"
FOR ALL USING (EXISTS (SELECT 1 FROM dd_portal_identities pi WHERE pi.auth_user_id = auth.uid() AND pi.is_active = true AND pi.portal_role = ANY (ARRAY['staff_admin'::text, 'procurement'::text])))
WITH CHECK (EXISTS (SELECT 1 FROM dd_portal_identities pi WHERE pi.auth_user_id = auth.uid() AND pi.is_active = true AND pi.portal_role = ANY (ARRAY['staff_admin'::text, 'procurement'::text])));

CREATE POLICY "staff_admin_all_dd_work_order_routing" ON "private"."dd_work_order_routing"
FOR ALL USING (EXISTS (SELECT 1 FROM dd_portal_identities pi WHERE pi.auth_user_id = auth.uid() AND pi.is_active = true AND pi.portal_role = ANY (ARRAY['staff_admin'::text, 'procurement'::text])))
WITH CHECK (EXISTS (SELECT 1 FROM dd_portal_identities pi WHERE pi.auth_user_id = auth.uid() AND pi.is_active = true AND pi.portal_role = ANY (ARRAY['staff_admin'::text, 'procurement'::text])));
