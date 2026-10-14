
insert into public.dd_service_release_verifications(canonical_sku,stripe_price_verified_at,verification_commit_sha,notes,updated_at)
select s.sku,now(),'ec9c7d7eeb0259746c86c9da6cf2ae06292aaa4b',
       '2026-10-06 live Stripe verification: active live price and active Payment Link matched stored 53.5% initial amount; verified via Stripe API.',
       now()
from public.services s
where s.sku between 'DNI-07A-001' and 'DNI-07A-010'
on conflict(canonical_sku) do update
set stripe_price_verified_at=excluded.stripe_price_verified_at,
    verification_commit_sha=excluded.verification_commit_sha,
    notes=concat_ws(E'\n',nullif(public.dd_service_release_verifications.notes,''),excluded.notes),
    updated_at=now();
