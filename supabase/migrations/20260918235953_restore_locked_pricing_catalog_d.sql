-- Production-proven runtime identities for the locked 279-SKU pricing classification.
-- Restores only identity/catalog fields required before the 2026-09-19 pricing-engine backfill.
with baseline(id,division_id,slug,name,sku,service_family) as (values
('f5dc860b-816e-486f-b40a-c6dd9cbbb612'::uuid,10,'d10-001','Event Consultation','DNI-10A-001','Experiences & Resident Programming'),
('e795b0f8-0c78-48b4-8e65-065774751c9e'::uuid,10,'d10-002','Event Concept Development','DNI-10A-002','Experiences & Resident Programming'),
('be548c13-507b-47db-932b-d97bc80898b6'::uuid,10,'d10-003','Event Planning','DNI-10A-003','Experiences & Resident Programming'),
('6275b7e1-472f-4d33-9389-a50bec456dd4'::uuid,10,'d10-004','Event Timeline','DNI-10A-004','Experiences & Resident Programming'),
('22b29a95-8bfc-4154-a793-47f47e932b80'::uuid,10,'d10-005','Event Budget Coordination','DNI-10A-005','Experiences & Resident Programming'),
('af1706e4-8aae-4867-8463-bcae30ceba89'::uuid,10,'d10-006','Vendor Coordination','DNI-10A-006','Experiences & Resident Programming'),
('7fc2637a-c03a-4ee8-b431-b7de2dfe9c01'::uuid,10,'d10-007','Venue Coordination','DNI-10A-007','Experiences & Resident Programming'),
('f74e9662-b4ff-41e1-b1ed-ac74a966c909'::uuid,10,'d10-008','Guest Flow Planning','DNI-10A-008','Experiences & Resident Programming'),
('3bad0f23-0aa4-45e0-8905-e60ee8226758'::uuid,10,'d10-009','Event Setup','DNI-10A-009','Experiences & Resident Programming'),
('9138e30c-9c36-42c4-9882-3a278a17da7e'::uuid,10,'d10-010','Event Breakdown','DNI-10A-010','Experiences & Resident Programming'),
('3b8d91f4-cb1b-48aa-aaec-f87304138706'::uuid,10,'d10-011','On-Site Event Management','DNI-10A-011','Experiences & Resident Programming'),
('bb46907d-4abb-4492-80a2-6018125f24aa'::uuid,10,'d10-012','Registration/Check-In','DNI-10A-012','Experiences & Resident Programming'),
('864bd34b-b491-4489-9b27-a5bc55fdfabc'::uuid,10,'d10-013','Hospitality Staffing Coordination','DNI-10A-013','Experiences & Resident Programming'),
('0ff90109-dd14-4374-96f1-b5057b95082b'::uuid,10,'d10-014','Decor Coordination','DNI-10A-014','Experiences & Resident Programming'),
('fd341a5b-0851-4e72-a9db-e2df1d01bb51'::uuid,10,'d10-015','Signage Coordination','DNI-10A-015','Experiences & Resident Programming'),
('43b08c62-f668-4013-ba51-36389f1aac95'::uuid,10,'d10-016','Wedding Day Coordination','DNI-10A-016','Experiences & Resident Programming'),
('1dd2cfe1-746b-4550-b0ae-aeebdf238fd5'::uuid,10,'d10-017','Birthday Event Coordination','DNI-10A-017','Experiences & Resident Programming'),
('115cec9a-1064-4e76-8dcc-a36e46e2adc3'::uuid,10,'d10-018','Corporate Event Coordination','DNI-10A-018','Experiences & Resident Programming'),
('f8ba2f03-45bf-44e7-8d17-3bce6af84947'::uuid,10,'d10-019','Resident Appreciation Event','DNI-10A-019','Experiences & Resident Programming'),
('3cbd8083-3c57-47a1-851f-3af6d62928e4'::uuid,10,'d10-020','Seasonal Community Event','DNI-10A-020','Experiences & Resident Programming'),
('ccfe74f0-a2b5-4c63-880a-24629a468eff'::uuid,10,'d10-021','Property & Event Vending Activation','DNI-10A-021','Experiences & Resident Programming'),
('c1293880-bfa9-4fb1-91ba-881f836751dc'::uuid,11,'d11-001','Logo Design','DNI-11A-001','Creative Design & Production'),
('bfc8c181-8f95-4579-9aee-c29b58341207'::uuid,11,'d11-002','Brand Identity','DNI-11A-002','Creative Design & Production'),
('114cd6b5-9d0f-4dc5-b3e0-0fcb3b859e5a'::uuid,11,'d11-003','Brand Guidelines','DNI-11A-003','Creative Design & Production'),
('d40cb4a5-8a3c-4422-bf9a-9a06dd800b3a'::uuid,11,'d11-004','Business Card Design','DNI-11A-004','Creative Design & Production'),
('1fe5f279-01b6-491c-8f9f-366bbd349b4c'::uuid,11,'d11-005','Flyer Design','DNI-11A-005','Creative Design & Production'),
('dc17d2cd-b38a-4de0-a103-526974bc8342'::uuid,11,'d11-006','Brochure Design','DNI-11A-006','Creative Design & Production'),
('15c5f0bb-3958-4e36-8238-ce63017270cb'::uuid,11,'d11-007','Presentation Design','DNI-11A-007','Creative Design & Production'),
('efec69d6-1877-4931-bb64-fe6d633c946c'::uuid,11,'d11-008','Digital Workbook Design','DNI-11A-008','Creative Design & Production'),
('66e2f572-0efc-4f89-85df-f96b6e7eff34'::uuid,11,'d11-009','Ebook Design','DNI-11A-009','Creative Design & Production'),
('281df8e9-cee0-4c58-87b4-d4f36990ba2b'::uuid,11,'d11-010','Social Graphic Design','DNI-11A-010','Creative Design & Production'),
('40879cf2-15d7-44f3-903f-8522d42193cc'::uuid,11,'d11-011','Signage Design','DNI-11A-011','Creative Design & Production'),
('d97bd4db-6d62-4d1f-bd31-357b950ed4a0'::uuid,11,'d11-012','Print Production Coordination','DNI-11A-012','Creative Design & Production'),
('1880c745-a0e5-4a61-8bd0-341adc93b17a'::uuid,11,'d11-013','Business Card Printing','DNI-11A-013','Creative Design & Production'),
('0fe257b1-2090-483c-aa0a-225446347bdf'::uuid,11,'d11-014','Flyer Printing','DNI-11A-014','Creative Design & Production'),
('c16dbd2b-822e-4c26-9a65-90ce38151659'::uuid,11,'d11-015','Banner Production','DNI-11A-015','Creative Design & Production'),
('be32ebe3-83ff-4773-b0e8-7850f78cd891'::uuid,11,'d11-016','Yard Sign Production','DNI-11A-016','Creative Design & Production'),
('89d385a7-9fc4-4096-8f6f-0bd3f088ec90'::uuid,11,'d11-017','DTF Apparel','DNI-11A-017','Creative Design & Production'),
('b5412700-138d-4a82-90a8-73c7c0bf93b1'::uuid,11,'d11-018','Heat Press Apparel','DNI-11A-018','Creative Design & Production'),
('4d9f63c5-8b9a-4a8b-bb2a-9894de5382c6'::uuid,11,'d11-019','Promotional Merchandise','DNI-11A-019','Creative Design & Production'),
('2039f3d7-e6d1-4adb-8158-f09e98bf7747'::uuid,11,'d11-020','Custom Product Fabrication','DNI-11A-020','Creative Design & Production')
)
insert into public.services (id,division_id,slug,name,sku,service_family)
select b.* from baseline b
where not exists (select 1 from public.services s where s.id=b.id or s.sku=b.sku or s.slug=b.slug);
update public.services set commercial_status='CANONICAL_ACTIVE',source_sku=coalesce(source_sku,sku),commercial_intent_status='SELL_NOW' where sku in ('DNI-10A-001','DNI-10A-002','DNI-10A-003','DNI-10A-004','DNI-10A-005','DNI-10A-006','DNI-10A-007','DNI-10A-008','DNI-10A-009','DNI-10A-010','DNI-10A-011','DNI-10A-012','DNI-10A-013','DNI-10A-014','DNI-10A-015','DNI-10A-016','DNI-10A-017','DNI-10A-018','DNI-10A-019','DNI-10A-020','DNI-10A-021','DNI-11A-001','DNI-11A-002','DNI-11A-003','DNI-11A-004','DNI-11A-005','DNI-11A-006','DNI-11A-007','DNI-11A-008','DNI-11A-009','DNI-11A-010','DNI-11A-011','DNI-11A-012','DNI-11A-013','DNI-11A-014','DNI-11A-015','DNI-11A-016','DNI-11A-017','DNI-11A-018','DNI-11A-019','DNI-11A-020');
