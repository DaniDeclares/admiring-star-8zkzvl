-- DANI DECLARES: B2B enterprise retainer catalog + public Data API hardening.
-- Commercial values are canonical catalog records; no Stripe objects are created or changed.

DO $$
DECLARE
  t text;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'dd_estimates','dd_estimate_addons','dd_estimate_media','dd_estimate_packages','dd_travel_calculations',
    'fieldops_estimates','fieldops_estimate_addons','fieldops_estimate_media','fieldops_estimate_packages','fieldops_travel_calculations',
    'leads','service_requests','followups'
  ] LOOP
    EXECUTE format('REVOKE ALL ON TABLE public.%I FROM anon', t);
  END LOOP;
END $$;

DROP POLICY IF EXISTS "Public can submit dd estimates" ON public.dd_estimates;
DROP POLICY IF EXISTS "Public can submit dd estimate addons" ON public.dd_estimate_addons;
DROP POLICY IF EXISTS "Public can submit dd estimate media metadata" ON public.dd_estimate_media;
DROP POLICY IF EXISTS "Public can submit dd estimate packages" ON public.dd_estimate_packages;
DROP POLICY IF EXISTS "Public can submit dd travel calculations" ON public.dd_travel_calculations;
DROP POLICY IF EXISTS "Public can submit fieldops estimates" ON public.fieldops_estimates;
DROP POLICY IF EXISTS "Public can submit fieldops estimate addons" ON public.fieldops_estimate_addons;
DROP POLICY IF EXISTS "Public can submit fieldops media metadata" ON public.fieldops_estimate_media;
DROP POLICY IF EXISTS "Public can submit fieldops estimate packages" ON public.fieldops_estimate_packages;
DROP POLICY IF EXISTS "Public can submit fieldops travel calculations" ON public.fieldops_travel_calculations;
DROP POLICY IF EXISTS "Public can create leads" ON public.leads;
DROP POLICY IF EXISTS "Public can create service requests" ON public.service_requests;
DROP POLICY IF EXISTS "Public can create followups" ON public.followups;

REVOKE ALL ON TABLE public.dd_estimator_settings FROM anon;
REVOKE ALL ON TABLE public.fieldops_estimator_settings FROM anon;
DROP POLICY IF EXISTS "Public can read active dd settings" ON public.dd_estimator_settings;
DROP POLICY IF EXISTS "Public can read active fieldops settings" ON public.fieldops_estimator_settings;

DROP POLICY IF EXISTS dd_task_templates_authenticated_read ON public.dd_task_templates;
CREATE POLICY dd_task_templates_authenticated_read
  ON public.dd_task_templates
  FOR SELECT
  TO authenticated
  USING (true);

INSERT INTO public.dd_service_packages (
  division_slug, package_slug, package_name, public_name, outcome_label, category,
  locked_price, starting_price, pricing_model, deposit_type, deposit_value,
  scope_included, addon_notes, exclusions, status_boundary,
  is_public, is_active, sort_order, created_at, updated_at
)
VALUES
('propertyops','b2b_apt_ret_001','Enterprise Retainer 001 — Essential Property Support','Essential Property Support','Routine inspection/log + basic handyman support','B2B-APT-RETAINER',1450,1450,'monthly','first_month',null,ARRAY['Routine inspection and log','Basic handyman support','Operational issue triage'],ARRAY['Additional labor','Materials/pass-through costs','After-hours or severe-condition work'],ARRAY['Government fees','Materials/pass-through costs','Major repairs','Emergency work unless separately authorized'],'B2B-APT',false,true,1001,now(),now()),
('propertyops','b2b_apt_ret_002','Enterprise Retainer 002 — Property Stability','Property Stability','Base support + vendor coordination','B2B-APT-RETAINER',2150,2150,'monthly','first_month',null,ARRAY['Essential property support','Vendor coordination','Routine operations follow-up'],ARRAY['Additional vendor scopes','Materials/pass-through costs','After-hours work'],ARRAY['Government fees','Materials/pass-through costs','Major repairs','Emergency work unless separately authorized'],'B2B-APT',false,true,1002,now(),now()),
('propertyops','b2b_apt_ret_003','Enterprise Retainer 003 — Resident Experience Core','Resident Experience Core','Amenity ecosystem + resident events','B2B-APT-RETAINER',3250,3250,'monthly','first_month',null,ARRAY['Property support baseline','Amenity coordination','Resident event support'],ARRAY['Event-specific materials','Additional event labor','Third-party vendor costs'],ARRAY['Government fees','Third-party pass-through costs','Major repairs','Large-scale events unless separately scoped'],'B2B-APT',false,true,1003,now(),now()),
('propertyops','b2b_apt_ret_004','Enterprise Retainer 004 — Full-Service Leasing Core','Full-Service Leasing Core','Resident experience + admin/leasing blitz','B2B-APT-RETAINER',4000,4000,'monthly','first_month',null,ARRAY['Resident Experience Core','Administrative support','Leasing blitz support'],ARRAY['Additional leasing hours','Campaign-specific materials','Third-party platform fees'],ARRAY['Government fees','Legal advice','Licensed brokerage activity','Third-party pass-through costs'],'B2B-APT',false,true,1004,now(),now()),
('propertyops','b2b_apt_ret_005','Enterprise Retainer 005 — Operations Partnership','Operations Partnership','Maintenance + leasing + compliance coordination','B2B-APT-RETAINER',4500,4500,'monthly','first_month',null,ARRAY['Full-Service Leasing Core','Maintenance coordination','Compliance tracking'],ARRAY['Specialty trades','Additional inspections','Materials/pass-through costs'],ARRAY['Government fees','Licensed professional services','Major capital projects','Third-party pass-through costs'],'B2B-APT',false,true,1005,now(),now()),
('propertyops','b2b_apt_ret_006','Enterprise Retainer 006 — Portfolio Stability (2-Site)','Portfolio Stability (2-Site)','Operations partnership + two-site portfolio sync','B2B-APT-RETAINER',5250,5250,'monthly','first_month',null,ARRAY['Operations Partnership','Two-site coordination','Portfolio reporting'],ARRAY['Additional site travel','Specialty trades','Materials/pass-through costs'],ARRAY['Government fees','Capital projects','Licensed professional services','Third-party pass-through costs'],'B2B-APT',false,true,1006,now(),now()),
('propertyops','b2b_apt_ret_007','Enterprise Retainer 007 — Enterprise Experience','Enterprise Experience','Site-wide experience + branding + QR workflows','B2B-APT-RETAINER',6000,6000,'monthly','first_month',null,ARRAY['Portfolio operations support','Resident experience','Branding and QR workflow coordination'],ARRAY['Printing/materials','Campaign production','Additional event labor'],ARRAY['Government fees','Major production costs','Third-party pass-through costs','Capital projects'],'B2B-APT',false,true,1007,now(),now()),
('propertyops','b2b_apt_ret_008','Enterprise Retainer 008 — High-Touch Management','High-Touch Management','Enterprise experience + full asset management coordination','B2B-APT-RETAINER',6750,6750,'monthly','first_month',null,ARRAY['Enterprise Experience','Asset condition coordination','Maintenance and vendor oversight'],ARRAY['Specialty inspections','Repair labor beyond included scope','Materials/pass-through costs'],ARRAY['Government fees','Licensed inspections','Capital repairs','Third-party pass-through costs'],'B2B-APT',false,true,1008,now(),now()),
('propertyops','b2b_apt_ret_009','Enterprise Retainer 009 — Executive Partnership','Executive Partnership','Full integration + amenity ecosystem','B2B-APT-RETAINER',7500,7500,'monthly','first_month',null,ARRAY['High-Touch Management','Executive reporting','Amenity ecosystem coordination'],ARRAY['Executive event production','Specialty vendors','Materials/pass-through costs'],ARRAY['Government fees','Capital projects','Licensed professional services','Third-party pass-through costs'],'B2B-APT',false,true,1009,now(),now()),
('propertyops','b2b_apt_ret_010','Enterprise Retainer 010 — Portfolio Power (3-Site)','Portfolio Power (3-Site)','Executive partnership + multi-property maintenance coordination','B2B-APT-RETAINER',8500,8500,'monthly','first_month',null,ARRAY['Executive Partnership','Three-site coordination','Multi-property maintenance oversight'],ARRAY['Additional travel','Specialty trades','Materials/pass-through costs'],ARRAY['Government fees','Capital projects','Licensed professional services','Third-party pass-through costs'],'B2B-APT',false,true,1010,now(),now()),
('propertyops','b2b_apt_ret_011','Enterprise Retainer 011 — Dominant Market Share','Dominant Market Share','Portfolio power + dedicated concierge','B2B-APT-RETAINER',9500,9500,'monthly','first_month',null,ARRAY['Portfolio Power','Dedicated resident/property concierge','Executive reporting'],ARRAY['Dedicated concierge expansion','Specialty vendor costs','Materials/pass-through costs'],ARRAY['Government fees','Capital projects','Licensed professional services','Third-party pass-through costs'],'B2B-APT',false,true,1011,now(),now()),
('propertyops','b2b_apt_ret_012','Enterprise Retainer 012 — Institutional Partner','Institutional Partner','Full-scale infrastructure outsourcing coordination','B2B-APT-RETAINER',10500,10500,'monthly','first_month',null,ARRAY['Dominant Market Share','Infrastructure outsourcing coordination','Portfolio-wide operations reporting'],ARRAY['Major project labor','Specialty trades','Materials/pass-through costs'],ARRAY['Government fees','Capital projects unless separately scoped','Licensed professional services','Third-party pass-through costs'],'B2B-APT',false,true,1012,now(),now())
ON CONFLICT (division_slug, package_slug) DO UPDATE SET
  package_name=EXCLUDED.package_name, public_name=EXCLUDED.public_name, outcome_label=EXCLUDED.outcome_label,
  category=EXCLUDED.category, locked_price=EXCLUDED.locked_price, starting_price=EXCLUDED.starting_price,
  pricing_model=EXCLUDED.pricing_model, deposit_type=EXCLUDED.deposit_type, deposit_value=EXCLUDED.deposit_value,
  scope_included=EXCLUDED.scope_included, addon_notes=EXCLUDED.addon_notes, exclusions=EXCLUDED.exclusions,
  status_boundary=EXCLUDED.status_boundary, is_public=EXCLUDED.is_public, is_active=EXCLUDED.is_active,
  sort_order=EXCLUDED.sort_order, updated_at=now();