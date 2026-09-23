-- Verification record for a production Stripe correction executed against the live
-- Dani Declares Stripe account before this migration was recorded.
-- DNI-01A-001 was reconciled from a stale $100 Stripe price to the locked
-- CH01/CH03 catalog price of $140. The old Stripe price was deactivated and a
-- live payment link was created. This migration intentionally verifies the
-- Supabase-side mapping and does not recreate Stripe objects.
do $$
declare
  v_price text;
  v_link text;
begin
  select stripe_price_id, stripe_payment_link_id
    into v_price, v_link
  from public.dd_stripe_launch_register
  where canonical_sku = 'DNI-01A-001';

  if v_price <> 'price_1UHDPFChHm1uJK9xhPcTHerK'
     or v_link <> 'plink_1UHDPSChHm1uJK9xkcQi3MoU' then
    raise exception 'DNI-01A-001 Stripe mapping mismatch';
  end if;
end $$;
