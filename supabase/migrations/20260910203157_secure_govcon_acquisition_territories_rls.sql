
ALTER TABLE "public"."dd_govcon_acquisition_territories" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "deny_anon_all" ON "public"."dd_govcon_acquisition_territories"
  FOR ALL TO anon
  USING (false) WITH CHECK (false);

CREATE POLICY "dd_govcon_acquisition_territories_staff_all" ON "public"."dd_govcon_acquisition_territories"
  FOR ALL TO authenticated
  USING (dd_contract_staff_access())
  WITH CHECK (dd_contract_staff_access());
