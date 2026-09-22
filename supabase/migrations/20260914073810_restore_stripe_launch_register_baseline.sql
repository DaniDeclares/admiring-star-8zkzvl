begin;
create table if not exists public.dd_stripe_launch_register (
 canonical_sku text primary key,
 service_name text not null,
 commercial_status text not null,
 pricing_status text not null,
 fulfillment_status text not null,
 stripe_product_id text,
 stripe_price_id text,
 stripe_payment_link_id text,
 checkout_mode text not null,
 source_authority text not null,
 specials_evidence_status text,
 activation_decision text not null,
 blockers text,
 last_verified_at timestamptz not null default now()
);
commit;