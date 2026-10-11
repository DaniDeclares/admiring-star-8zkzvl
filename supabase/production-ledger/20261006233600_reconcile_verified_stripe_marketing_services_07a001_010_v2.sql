
insert into public.dd_stripe_launch_register(
  canonical_sku,service_name,commercial_status,pricing_status,fulfillment_status,
  stripe_product_id,stripe_price_id,stripe_payment_link_id,checkout_mode,
  source_authority,specials_evidence_status,activation_decision,blockers,last_verified_at
)
values
('DNI-07A-001','Marketing Audit','SELL_NOW','STRIPE_PRICE_ACTIVE','READY','prod_VICbZywgh5tF6a','price_1UHcCiChHm1uJK9xVF8Z3qX0','plink_1UHcCkChHm1uJK9xyguwd9xI','PAYMENT_LINK','Stripe live object verification 2026-10-06',null,'ACTIVE',null,now()),
('DNI-07A-002','Marketing Strategy','SELL_NOW','STRIPE_PRICE_ACTIVE','READY','prod_VICcFiojDstGTH','price_1UHcCmChHm1uJK9xmVUkTfed','plink_1UHcCpChHm1uJK9xKBSqsfkf','PAYMENT_LINK','Stripe live object verification 2026-10-06',null,'ACTIVE',null,now()),
('DNI-07A-003','Campaign Planning','SELL_NOW','STRIPE_PRICE_ACTIVE','READY','prod_VICcFEaKjoeZqd','price_1UHcCqChHm1uJK9x5YRoikc9','plink_1UHcCtChHm1uJK9xP9AVnTwz','PAYMENT_LINK','Stripe live object verification 2026-10-06',null,'ACTIVE',null,now()),
('DNI-07A-004','Content Calendar','SELL_NOW','STRIPE_PRICE_ACTIVE','READY','prod_VICcmXInzcy3zN','price_1UHcCvChHm1uJK9xu98XPUXc','plink_1UHcCwChHm1uJK9x0XlZPcai','PAYMENT_LINK','Stripe live object verification 2026-10-06',null,'ACTIVE',null,now()),
('DNI-07A-005','Social Media Management','SELL_NOW','STRIPE_PRICE_ACTIVE','READY','prod_VICcRSyHuBPxc2','price_1UHcCyChHm1uJK9xkEwryD43','plink_1UHcD0ChHm1uJK9xU1Fvl5y5','PAYMENT_LINK','Stripe live object verification 2026-10-06',null,'ACTIVE',null,now()),
('DNI-07A-006','Social Post Creation','SELL_NOW','STRIPE_PRICE_ACTIVE','READY','prod_VICccI0ERWh1Su','price_1UHcD2ChHm1uJK9xRUD29qLN','plink_1UHcD4ChHm1uJK9xjCajFZXr','PAYMENT_LINK','Stripe live object verification 2026-10-06',null,'ACTIVE',null,now()),
('DNI-07A-007','Short-Form Content','SELL_NOW','STRIPE_PRICE_ACTIVE','READY','prod_VICc8JecbTM0IX','price_1UHcD6ChHm1uJK9xnURDKrS6','plink_1UHcD8ChHm1uJK9xGp4JZBPg','PAYMENT_LINK','Stripe live object verification 2026-10-06',null,'ACTIVE',null,now()),
('DNI-07A-008','Email Marketing Setup','SELL_NOW','STRIPE_PRICE_ACTIVE','READY','prod_VICcm9OVOeWz9Y','price_1UHcDAChHm1uJK9xzz7vlenc','plink_1UHcDCChHm1uJK9xbvKUIdCG','PAYMENT_LINK','Stripe live object verification 2026-10-06',null,'ACTIVE',null,now()),
('DNI-07A-009','Newsletter Production','SELL_NOW','STRIPE_PRICE_ACTIVE','READY','prod_VICc5s7jOePsx7','price_1UHcDDChHm1uJK9xTmRDKkOK','plink_1UHcDFChHm1uJK9xFgFqaHds','PAYMENT_LINK','Stripe live object verification 2026-10-06',null,'ACTIVE',null,now()),
('DNI-07A-010','Local SEO Setup','SELL_NOW','STRIPE_PRICE_ACTIVE','READY','prod_VICc1bEq9LQlSS','price_1UHcDHChHm1uJK9xZJLpm5Nv','plink_1UHcDKChHm1uJK9xyxlKHJPH','PAYMENT_LINK','Stripe live object verification 2026-10-06',null,'ACTIVE',null,now())
on conflict(canonical_sku) do update
set service_name=excluded.service_name,commercial_status=excluded.commercial_status,
    pricing_status=excluded.pricing_status,fulfillment_status=excluded.fulfillment_status,
    stripe_product_id=excluded.stripe_product_id,stripe_price_id=excluded.stripe_price_id,
    stripe_payment_link_id=excluded.stripe_payment_link_id,checkout_mode=excluded.checkout_mode,
    source_authority=excluded.source_authority,activation_decision=excluded.activation_decision,
    blockers=null,last_verified_at=excluded.last_verified_at;

insert into public.dd_stripe_catalog_sync(
  canonical_sku,stripe_product_id,stripe_price_id,stripe_livemode,sync_status,source_service_id,last_synced_at,notes
)
values
('DNI-07A-001','prod_VICbZywgh5tF6a','price_1UHcCiChHm1uJK9xVF8Z3qX0',true,'SYNCED_ACTIVE','4dd9d3a6-5e1c-4e89-8c4e-ab740c45c4fc',now(),'Live Stripe product, one-time USD price, and active Payment Link verified 2026-10-06.'),
('DNI-07A-002','prod_VICcFiojDstGTH','price_1UHcCmChHm1uJK9xmVUkTfed',true,'SYNCED_ACTIVE','1e285297-4955-4736-bf99-2d3acd3408f6',now(),'Live Stripe product, one-time USD price, and active Payment Link verified 2026-10-06.'),
('DNI-07A-003','prod_VICcFEaKjoeZqd','price_1UHcCqChHm1uJK9x5YRoikc9',true,'SYNCED_ACTIVE','1b7b67cb-b0d0-4985-8f34-8379b375c160',now(),'Live Stripe product, one-time USD price, and active Payment Link verified 2026-10-06.'),
('DNI-07A-004','prod_VICcmXInzcy3zN','price_1UHcCvChHm1uJK9xu98XPUXc',true,'SYNCED_ACTIVE','6fec8d1b-1d5c-4a0a-916c-7cfdaaeef1de',now(),'Live Stripe product, one-time USD price, and active Payment Link verified 2026-10-06.'),
('DNI-07A-005','prod_VICcRSyHuBPxc2','price_1UHcCyChHm1uJK9xkEwryD43',true,'SYNCED_ACTIVE','beff1846-df32-4ade-950e-022fd60f8e7b',now(),'Live Stripe product, one-time USD price, and active Payment Link verified 2026-10-06.'),
('DNI-07A-006','prod_VICccI0ERWh1Su','price_1UHcD2ChHm1uJK9xRUD29qLN',true,'SYNCED_ACTIVE','a7e373d4-f652-455c-9a96-1287e0c1d497',now(),'Live Stripe product, one-time USD price, and active Payment Link verified 2026-10-06.'),
('DNI-07A-007','prod_VICc8JecbTM0IX','price_1UHcD6ChHm1uJK9xnURDKrS6',true,'SYNCED_ACTIVE','56987a25-c84f-4222-ab67-710ef6cf44a5',now(),'Live Stripe product, one-time USD price, and active Payment Link verified 2026-10-06.'),
('DNI-07A-008','prod_VICcm9OVOeWz9Y','price_1UHcDAChHm1uJK9xzz7vlenc',true,'SYNCED_ACTIVE','0921bbfe-c419-4806-aec8-00b3b834a148',now(),'Live Stripe product, one-time USD price, and active Payment Link verified 2026-10-06.'),
('DNI-07A-009','prod_VICc5s7jOePsx7','price_1UHcDDChHm1uJK9xTmRDKkOK',true,'SYNCED_ACTIVE','845a7cd1-d0f8-4545-819a-ec67ba019a16',now(),'Live Stripe product, one-time USD price, and active Payment Link verified 2026-10-06.'),
('DNI-07A-010','prod_VICc1bEq9LQlSS','price_1UHcDHChHm1uJK9xZJLpm5Nv',true,'SYNCED_ACTIVE','f2e7aa74-ae93-4b84-b6ce-dea4036cd993',now(),'Live Stripe product, one-time USD price, and active Payment Link verified 2026-10-06.')
on conflict(canonical_sku,stripe_product_id) do update
set stripe_price_id=excluded.stripe_price_id,stripe_livemode=true,sync_status='SYNCED_ACTIVE',
    source_service_id=excluded.source_service_id,last_synced_at=excluded.last_synced_at,notes=excluded.notes;
