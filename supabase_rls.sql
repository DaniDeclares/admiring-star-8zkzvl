-- filename: prisma/migrations/supabase_rls.sql
-- DANI DECLARES LLC — SECURED SUPABASE ROW LEVEL SECURITY & RPC POLICIES

-- 1. Enable RLS on Leads Table
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;

-- Anonymous users (public site visitors) can ONLY insert new leads
CREATE POLICY "Public Anonymous Insert Leads" ON leads FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Admin Full Access Leads" ON leads FOR ALL TO service_role USING (true);

-- 2. Enable RLS on Service Requests Table
ALTER TABLE service_requests ENABLE ROW LEVEL SECURITY;

-- Anonymous users can ONLY insert new service requests
CREATE POLICY "Public Anonymous Insert Service Requests" ON service_requests FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Admin Full Access Service Requests" ON service_requests FOR ALL TO service_role USING (true);

-- SECURE RPC FUNCTION: Public client can ONLY read a single request by passing exact public_id string
CREATE OR REPLACE FUNCTION get_service_request_by_tracking_id(target_public_id TEXT)
RETURNS TABLE (
  public_id TEXT,
  category TEXT,
  status TEXT,
  zip_code TEXT,
  created_at TIMESTAMPTZ
) 
LANGUAGE plpgsql 
SECURITY DEFINER 
AS 476
BEGIN
  RETURN QUERY
  SELECT sr.public_id, sr.category, sr.status::TEXT, sr.zip_code, sr.created_at
  FROM service_requests sr
  WHERE sr.public_id = target_public_id;
END;
476;

-- 3. Enable RLS on Job Photos Table
ALTER TABLE job_photos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public Read Job Photos" ON job_photos FOR SELECT TO anon USING (true);
CREATE POLICY "Admin Insert Job Photos" ON job_photos FOR INSERT TO authenticated, service_role WITH CHECK (true);
