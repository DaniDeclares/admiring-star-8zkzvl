-- Restore the production-proven reconciliation rows that were written transactionally
-- before the verification-only 20260919011621 migration was recorded.
DO $$
DECLARE v_service_id uuid;
BEGIN
 SELECT id INTO v_service_id FROM public.services WHERE sku='DNI-01B-008' AND commercial_status='CANONICAL_ACTIVE' AND commercial_intent_status='SELL_NOW';
 IF v_service_id IS NULL THEN RAISE EXCEPTION 'DNI-01B-008 canonical SELL_NOW service not found'; END IF;
 INSERT INTO public.dd_service_pricing_rules(service_id,channel_code,pricing_type,base_price_cents,currency,billing_cycle,lock_status,resident_discount_eligible,tax_class,effective_date,status)
 SELECT v_service_id,ch,'STARTING_AT',3500,'USD','ONETIME','PENDING',true,'STANDARD',date '2026-09-19','PENDING_RECONCILIATION'
 FROM unnest(array['CH01','CH02','CH03','CH04','CH05']) ch
 WHERE NOT EXISTS (SELECT 1 FROM public.dd_service_pricing_rules p WHERE p.service_id=v_service_id AND p.channel_code=ch);
 INSERT INTO public.dd_service_channel_availability(service_id,channel_code,eligibility_status,notes)
 SELECT v_service_id,ch,'PENDING','Restored production-proven pre-verification reconciliation state.'
 FROM unnest(array['CH01','CH02','CH03','CH04','CH05']) ch
 WHERE NOT EXISTS (SELECT 1 FROM public.dd_service_channel_availability a WHERE a.service_id=v_service_id AND a.channel_code=ch);
END $$;