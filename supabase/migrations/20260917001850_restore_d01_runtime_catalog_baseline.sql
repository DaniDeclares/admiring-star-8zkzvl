begin;
insert into public.services (division_id,slug,name,description,sku,service_family,commercial_status,source_sku,source_status,canonical_notes,commercial_intent_status)
select 1,v.slug,v.name,'D01 canonical service shell; commercial activation remains gated until channel, market pricing, fulfillment, provider, compliance and economics reconciliation is complete.',v.sku,v.family,'CANONICAL_ACTIVE',v.sku,'CATALOG_RECONCILED_2026_08_29','Created from D01 Master Service Universe; source evidence preserved. Catalog lock reconciliation completed Aug 28 2026; activation/fulfillment gates remain service-specific. Activated in company-wide catalog reconciliation 2026-08-29; legacy/absorbed records remain quarantined outside this canonical service table.','SELL_NOW'
from (values
('DNI-01B-001','dni_01b_001','Pet Sitting, Drop-In & Routine Pet Care','01B Pet Care & Household Pet Support'),
('DNI-01B-002','dni_01b_002','Pet Waste Removal & Pet Area Sanitation','01B Pet Care & Household Pet Support'),
('DNI-01B-003','dni_01b_003','Pet Feeding, Walking & Routine Care Plans','01B Pet Care & Household Pet Support'),
('DNI-01B-004','dni_01b_004','Pet Transportation & Appointment Support','01B Pet Care & Household Pet Support'),
('DNI-01B-005','dni_01b_005','Pet Supply Procurement & Delivery Coordination','01B Pet Care & Household Pet Support'),
('DNI-01B-006','dni_01b_006','Pet Grooming, Hygiene & Grooming Coordination','01B Pet Care & Household Pet Support'),
('DNI-01B-007','dni_01b_007','Pet Move-In, Move-Out & Transition Support','01B Pet Care & Household Pet Support'),
('DNI-01B-009','dni_01b_009','Pet Event, Gathering & Social Support','01B Pet Care & Household Pet Support'),
('DNI-01B-010','dni_01b_010','Pet-Safe Home Preparation, Pet-Proofing & Pet Area Setup','01B Pet Care & Household Pet Support'),
('DNI-01F-001','dni_01f_001','Holiday & Seasonal Home Decorating','01F Seasonal & Holiday Home Services'),
('DNI-01G-001','dni_01g_001','Household Membership & Maintenance Programs','Recurring Services')
) v(sku,slug,name,family)
where not exists(select 1 from public.services s where s.sku=v.sku or s.slug=v.slug);
update public.dd_governed_service_offers g set runtime_service_id=s.id from public.services s where g.runtime_service_id is null and s.sku=g.canonical_sku;
commit;