-- Replaces the "pick every individual service from a flat list of 300+" provider
-- onboarding picker with a real category system: applicants pick a parent skill
-- category (Cleaning, Notary, Courier, etc.), answer one equipment/tools question
-- for it, and the system expands that into the specific underlying services --
-- exactly the two-step model Danielle described. Division 1 is split into its real
-- sub-skills (Cleaning/Pet/Plant/Concierge/Move/Seasonal) since those genuinely need
-- different equipment questions; every other division maps 1:1 since dispatch and the
-- requirements table (dd_service_capability_requirements) don't yet differentiate
-- inside them any finer than that.
--
-- requires_credential here means "at least one service in this category has a real
-- legal/licensing gate" (confirmed against dd_service_capability_requirements:
-- LICENSE_SERVICE for Notary and Wedding Officiant, AUTO_MOBILE for every Division 12
-- courier/logistics service) -- it is a prompt to the applicant, not the enforcement
-- mechanism itself. The actual per-service gate is still resolved at application time
-- from dd_service_capability_requirements, so a category with requires_credential=true
-- but where a specific chosen service has no such row (e.g. general event coordination
-- inside Division 10, which also contains the credentialed Wedding Officiant SKU)
-- still clears automatically.

CREATE TABLE public.dd_provider_capability_categories (
  category_key text PRIMARY KEY,
  label text NOT NULL,
  description text,
  division_id integer NOT NULL REFERENCES public.divisions(id),
  canonical_sku_prefix text, -- e.g. '01A' to scope to a Division-1 sub-family; null = whole division
  requires_credential boolean NOT NULL DEFAULT false,
  credential_prompt text,
  equipment_prompt text NOT NULL,
  display_order integer NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.dd_provider_capability_categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read capability categories" ON public.dd_provider_capability_categories FOR SELECT USING (true);

INSERT INTO public.dd_provider_capability_categories (category_key, label, description, division_id, canonical_sku_prefix, requires_credential, credential_prompt, equipment_prompt, display_order) VALUES
('CLEANING', 'Cleaning & Home Detail', 'Standard cleans, deep cleans, and detail work inside homes.', 1, '01A', false, null, 'Do you have your own cleaning supplies and equipment (vacuum, mop, cleaning chemicals, etc.)?', 1),
('PET_CARE', 'Pet Care & Pet Support', 'Pet sitting, drop-ins, and pet-related household support.', 1, '01B', false, null, 'Do you have experience or supplies for handling pets (leashes, carriers, first-aid basics)?', 2),
('PLANT_CARE', 'Plant Care', 'Indoor plant care, repotting, and plant health services.', 1, '01C', false, null, 'Do you have basic plant care tools (watering cans, pruning shears, soil supplies)?', 3),
('HOUSEHOLD_CONCIERGE', 'Household Concierge & Personal Support', 'Errands, household assistance, and personal task support.', 1, '01D', false, null, 'Do you have reliable transportation for errands and household tasks?', 4),
('MOVE_TRANSITION', 'Move & Household Transition Support', 'Move-in/move-out assistance distinct from licensed moving/transportation.', 1, '01E', false, null, 'Do you have basic packing/moving supplies (boxes, tape, furniture sliders)?', 5),
('SEASONAL_DECOR', 'Holiday & Seasonal Decorating', 'Seasonal decor installation, takedown, and storage.', 1, '01F', false, null, 'Do you have a ladder and are you comfortable with height work for exterior decorating?', 6),
('PROPERTY_FIELD_OPS', 'Property, Facilities & Field Operations', 'Apartment turns, make-ready cleaning, inspections, and facilities support for property management clients.', 2, null, false, null, 'Do you have cleaning/reset supplies and a phone or camera for photo documentation?', 7),
('REAL_ESTATE_SUPPORT', 'Real Estate & Closing Support', 'Listing support, open house staffing, and transaction coordination for real estate professionals.', 3, null, false, null, 'Do you have experience supporting real estate listings, showings, or transactions?', 8),
('ADMIN_BUSINESS_OPS', 'Administrative & Business Operations', 'Virtual assistant, bookkeeping, data entry, and business admin support.', 4, null, false, null, 'Do you have relevant software/tools experience (e.g. QuickBooks, CRM systems, Microsoft/Google Office tools)?', 9),
('NOTARY_DOCUMENT', 'Notary & Document Services', 'Mobile notary, loan signing, and document witnessing services.', 5, null, true, 'Requires a valid notary commission in the state where you will perform notarizations. You will be asked to upload proof of your commission.', 'What state(s) are you commissioned in, and do you have a notary stamp/seal and journal?', 10),
('BUSINESS_FORMATION_DIGITAL', 'Business Formation & Digital Infrastructure', 'LLC/corporation formation support and digital systems setup.', 6, null, false, null, 'Do you have relevant technical or professional certifications for this work?', 11),
('MARKETING_CONTENT', 'Marketing, Content & Media Production', 'Content writing, social media, and marketing production support.', 7, null, false, null, 'Do you have a portfolio or samples of relevant work?', 12),
('BUSINESS_DEVELOPMENT', 'Business Development & Growth', 'Sales pipeline, CRM, and business development support.', 8, null, false, null, 'Do you have relevant sales or business-development experience?', 13),
('WORKSHOPS_TRAINING', 'Classes, Workshops & Training', 'Facilitating workshops, coaching sessions, and training programs.', 9, null, false, null, 'What subject-matter expertise or credentials do you bring to this topic area?', 14),
('EXPERIENCES_EVENTS', 'Experiences & Resident Programming', 'Event coordination, wedding-day support, and resident programming. (Wedding Officiant specifically requires proof of ordination -- you will be asked for it only if you select that service.)', 10, null, false, null, 'Do you have event-coordination experience or equipment (day-of kits, timeline tools)?', 15),
('CREATIVE_DESIGN', 'Creative Design & Production', 'Graphic design, print production, and branded materials.', 11, null, false, null, 'Do you have design software and/or production equipment (printer, cutter, heat press, etc.)?', 16),
('COURIER_LOGISTICS', 'Logistics, Courier & Asset Sourcing', 'Courier, delivery, and asset sourcing/transport services.', 12, null, true, 'Requires a valid driver''s license and auto insurance. You will be asked to upload proof of both.', 'Do you have a reliable vehicle, valid driver''s license, and auto insurance?', 17),
('GOVERNMENT_SUPPORT', 'Government & Institutional Procurement', 'Administrative and facilities support for government/institutional clients.', 13, null, false, null, 'Are you willing to complete a background check if a government client requires one?', 18)
;
