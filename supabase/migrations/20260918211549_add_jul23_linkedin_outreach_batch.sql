-- Real, verified sent outreach from Danielle's own LinkedIn message history (Jul 23),
-- same category/quality as the existing WARM/LINKEDIN_MESSAGE rows (Bradley Richards,
-- Nicole Woodard, Joshua Hares, Daniel Immediato) -- these were simply never logged.
-- Company/role attribution comes directly from the conversation subject lines Danielle
-- herself sent, not inferred or guessed.
insert into public.dd_sales_queue (contact_name, company_name, role_title, lane, source, source_confidence, notes) values
  ('Michael Mulholland', 'Cushman & Wakefield', null, 'WARM', 'LINKEDIN_MESSAGE', 'VERIFIED', 'Sent Jul 23: Class-A Facility Support & Executive Logistics pitch. No reply yet.'),
  ('Jada Muriel-Hepburn', 'Cushman & Wakefield', 'ARM, COS', 'WARM', 'LINKEDIN_MESSAGE', 'VERIFIED', 'Sent Jul 23: Portfolio Turn Operations & Compliance Partner pitch. No reply yet.'),
  ('Jennifer Hensel', 'Lincoln Property Co', null, 'WARM', 'LINKEDIN_MESSAGE', 'VERIFIED', 'Sent Jul 23: Backup Unit Turnovers & Notary Support pitch. No reply yet.'),
  ('Joanna Leto', 'JLL Atlanta', null, 'WARM', 'LINKEDIN_MESSAGE', 'VERIFIED', 'Sent Jul 23: Commercial Operations & Suite Reset Support pitch. No reply yet.'),
  ('Jennifer Fierro', 'Evernest Atlanta', null, 'WARM', 'LINKEDIN_MESSAGE', 'VERIFIED', 'Sent Jul 23: Backup Turnover & Mobile Notary Partner pitch. No reply yet.'),
  ('Brittany Woodley', 'Evernest Atlanta', null, 'WARM', 'LINKEDIN_MESSAGE', 'VERIFIED', 'Sent Jul 23: Backup Turnover & Mobile Notary Partner pitch. No reply yet.'),
  ('Etienne Penny', 'Cushman & Wakefield (Campus 244)', null, 'WARM', 'LINKEDIN_MESSAGE', 'VERIFIED', 'Sent Jul 23: Commercial Operations Support pitch. No reply yet.'),
  ('Keyuna F. Webster', 'Horner Realty Group', 'CAMS II', 'WARM', 'LINKEDIN_MESSAGE', 'VERIFIED', 'Sent Jul 23: Portfolio Turn Support & Resident Perks pitch. No reply yet.'),
  ('Elizabeth Evans', 'Bridge33 Capital', 'MBA', 'WARM', 'LINKEDIN_MESSAGE', 'VERIFIED', 'Sent Jul 23: Commercial Operations & Facility Support pitch. No reply yet.'),
  ('Jasmine Moss', 'Atlanta (lease-up)', 'CALP', 'WARM', 'LINKEDIN_MESSAGE', 'VERIFIED', 'Sent Jul 23: Lease-Up Turnover Backup & Compliance Support pitch. No reply yet.'),
  ('Melina Murray', 'Hanover Buckhead Village', null, 'WARM', 'LINKEDIN_MESSAGE', 'VERIFIED', 'Sent Jul 23: Luxury Turn Resets & Resident Perks pitch. No reply yet.'),
  ('Anne Dover', 'Cousins Properties', null, 'WARM', 'LINKEDIN_MESSAGE', 'VERIFIED', 'Sent Jul 23: On-Call Commercial Facilities Support pitch. No reply yet.'),
  ('Tyrell Murray', 'Cushman & Wakefield Atlanta', 'MBA, CAM', 'WARM', 'LINKEDIN_MESSAGE', 'VERIFIED', 'Sent Jul 23: Regional Turn Support & Field Operations pitch. No reply yet.'),
  ('Kapone Robinson', 'Metro Atlanta', null, 'WARM', 'LINKEDIN_MESSAGE', 'VERIFIED', 'Sent Jul 23: On-Call Property Turnover & Notary Partner pitch. No reply yet.'),
  ('Tiesha Johnson', 'Stream Realty Atlanta', 'Fitwel Amb, RPA, CMCP, LEED Green Assoc.', 'WARM', 'LINKEDIN_MESSAGE', 'VERIFIED', 'Sent Jul 23: Commercial Operations & Compliance Support pitch. No reply yet.');
