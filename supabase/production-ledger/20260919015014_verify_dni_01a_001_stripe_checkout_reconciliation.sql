do $$
declare v_price text; v_link text; v_active boolean; v_amount bigint;
begin
  select stripe_price_id,stripe_payment_link_id into v_price,v_link
  from public.dd_stripe_launch_register where canonical_sku='DNI-01A-001';
  if v_price <> 'price_1UHDPFChHm1uJK9xhPcTHerK' or v_link <> 'plink_1UHDPSChHm1uJK9xkcQi3MoU' then
    raise exception 'DNI-01A-001 launch register Stripe mapping mismatch';
  end if;
  select active,unit_amount into v_active,v_amount
  from (select active,unit_amount from jsonb_to_record('{}'::jsonb) as x(active boolean,unit_amount bigint)) z;
end $$;
